/**
 * upload-queue.js — SMH 上传队列管理器
 *
 * 职责：
 *   封装 smh-js-sdk 的 UploadTask，对上提供面向"文件任务列表"的命令式 API，
 *   对内维护"并发调度 + 状态机 + 分块上传 checkpoint 续传"。
 *
 * 对外 API
 *   - add(file, opts?)      加入队列并自动开始（受 maxConcurrency 控制）
 *   - pause(id)             暂停（分块上传会落下 checkpoint，以便续传）
 *   - resume(id)            从断点续传；简单上传（小文件）会从 0 重传
 *   - cancel(id) / remove(id)  终止并从队列移除（二者等价）
 *   - clearDone()           清理所有已完成 / 失败的任务
 *   - pauseAll() / resumeAll() / removeAll()  批量
 *   - subscribe(fn)         订阅任务列表变化；返回 unsubscribe
 *
 * 任务状态（record.status）
 *   pending     排队中，尚未开始
 *   hash        SDK 正在计算秒传 hash（computing_hash）
 *   uploading   正在上传分片 / 单次 PUT
 *   paused      用户暂停
 *   success     上传完成（含秒传）
 *   error       上传失败
 *
 * 断点续传原理
 *   只有分块上传（大文件）SDK 才会在 onStateChange / onPartComplete 回调里
 *   给出 checkpoint。每次拿到最新 cp 都序列化存到 record.checkpoint。
 *   resume 时重新 createUploadTask 并透传 checkpoint，SDK 内部调用
 *   restoreCheckpoint 跳过已完成分片。小文件永远没有 cp，resume 时从 0 重传。
 */

import { SMHClient, TaskStatus } from 'smh-js-sdk';

// 节流窗口：onProgress 回调极高频，UI 没必要每次都刷。
const NOTIFY_INTERVAL_MS = 400;

/**
 * 从 SDK checkpoint 里挑出续传必需字段，丢掉循环引用（例如指向 File / uploader 的反向引用）。
 * 只在 checkpoint 形状合法（包含 part_info_list）时返回对象，否则返回 null。
 */
function pickCheckpoint(cp) {
  if (!cp || !Array.isArray(cp.part_info_list) || cp.part_info_list.length === 0) {
    return null;
  }
  return {
    id: cp.id,
    file: cp.file ? { name: cp.file.name, size: cp.file.size, type: cp.file.type } : undefined,
    state: cp.state,
    progress: cp.progress,
    loaded: cp.loaded,
    upload_id: cp.upload_id,
    confirm_key: cp.confirm_key,
    bucket: cp.bucket,
    region: cp.region,
    key: cp.key,
    chunk_size: cp.chunk_size,
    crc64: cp.crc64,
    rapid_upload: cp.rapid_upload,
    expiration: cp.expiration,
    part_info_list: cp.part_info_list.map((p) => ({
      part_number: p.part_number,
      chunk_size: p.chunk_size,
      etag: p.etag,
      crc64: p.crc64,
      from: p.from,
      to: p.to,
      start_time: p.start_time,
      end_time: p.end_time,
    })),
  };
}

/** 生成一个短 ID（时间戳 + 随机后缀，足够 UI 做 key）。 */
function newTaskId() {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export class UploadQueue {
  constructor({ basePath, libraryId, spaceId, accessToken, maxConcurrency = 2 }) {
    this.client = new SMHClient({ basePath });
    this.client.setDefaultLibraryId(libraryId);
    this.client.setDefaultSpaceId(spaceId);
    this.client.setDefaultAccessToken(accessToken);

    this.maxConcurrency = maxConcurrency;

    // === 数据 ===
    // tasks：id → record（面向 UI 的状态对象，会被 notify 给订阅方）
    // files：id → File（保存原始 File 对象，便于 resume 时重建 uploader）
    // uploaders：id → SDK uploader（运行中才有；暂停/完成/错误后清理）
    this.tasks = new Map();
    this.files = new Map();
    this.uploaders = new Map();

    // === 调度 ===
    this.waitingIds = [];   // 等待调度的 taskId 队列
    this.activeCount = 0;

    // === 订阅 ===
    this.listeners = new Set();
    this._notifyTimer = null;
    this._notifyLastAt = 0;
  }

  // ───────────────── 订阅 ─────────────────

  subscribe(fn) {
    this.listeners.add(fn);
    fn(this.getList()); // 立即推一次，订阅方可以免去初始化
    return () => this.listeners.delete(fn);
  }

  getList() {
    return Array.from(this.tasks.values()).map((t) => ({ ...t }));
  }

  /** 立即通知所有订阅者。 */
  _notify() {
    if (this._notifyTimer) { clearTimeout(this._notifyTimer); this._notifyTimer = null; }
    const list = this.getList();
    for (const fn of this.listeners) {
      try { fn(list); } catch { /* 订阅方自己的错误不影响队列 */ }
    }
  }

  /**
   * 节流通知：onProgress 调用极频繁，用 400ms 窗口聚合，
   * 尾部总会触发一次保证 UI 最终一致。
   */
  _notifyThrottled() {
    const now = Date.now();
    const elapsed = now - this._notifyLastAt;
    if (elapsed >= NOTIFY_INTERVAL_MS) {
      this._notifyLastAt = now;
      this._notify();
      return;
    }
    if (this._notifyTimer) return;
    this._notifyTimer = setTimeout(() => {
      this._notifyTimer = null;
      this._notifyLastAt = Date.now();
      this._notify();
    }, NOTIFY_INTERVAL_MS - elapsed);
  }

  // ───────────────── 单任务 API ─────────────────

  /**
   * 添加文件到队列。
   * @param {File} file 浏览器原生 File 对象
   * @param {object} [opts]
   * @param {string} [opts.remotePath] 远程路径（默认 = file.name，忽略前导 /）
   * @returns {string} taskId
   */
  add(file, opts = {}) {
    if (!file) throw new Error('file 必传');
    const id = newTaskId();
    this.tasks.set(id, {
      id,
      name: file.name,
      size: file.size,
      remotePath: (opts.remotePath || file.name).replace(/^\/+/, ''),
      status: 'pending',     // pending / hash / uploading / paused / success / error
      hashProgress: 0,       // 0-100
      uploadProgress: 0,     // 0-100
      speed: 0,              // bytes/sec
      error: '',
      // 分块上传才会有 checkpoint；简单上传全程为 null
      checkpoint: null,
      isMultipart: false,
    });
    this.files.set(id, file);
    this.waitingIds.push(id);
    this._notify();
    this._schedule();
    return id;
  }

  async pause(id) {
    const record = this.tasks.get(id);
    const uploader = this.uploaders.get(id);
    // UI 先响应：立即把状态改 paused，速度清零
    if (record && record.status !== 'success' && record.status !== 'error') {
      record.status = 'paused';
      record.speed = 0;
      this._notify();
    }
    // 再 await SDK pause；SDK 内部 abort 后会回调 onStateChange(PAUSED)，
    // 我们在那里保存最新 checkpoint（含已完成分片 etag）。
    if (uploader?.pause) {
      try { await uploader.pause(); } catch { /* SDK pause 不应抛错，保险起见吞掉 */ }
    }
  }

  /**
   * 恢复/重试。统一走"重新 createUploadTask + 透传 checkpoint"的路径：
   *   - 分块上传：checkpoint 有值，SDK 会 restoreCheckpoint 跳过已完成分片
   *   - 简单上传：checkpoint 始终为 null，等价于从 0 重新上传
   */
  resume(id) {
    const record = this.tasks.get(id);
    const file = this.files.get(id);
    if (!record) return;

    if (!file) {
      record.status = 'error';
      record.error = '文件对象已丢失，请重新选择';
      this._notify();
      return;
    }

    // 旧 uploader 内部 pauseFlag 已置位，不能复用，直接丢弃
    this.uploaders.delete(id);

    record.status = 'pending';
    record.speed = 0;
    record.error = '';
    // 简单上传重试：UI 清零（有 checkpoint 时保留进度显示）
    if (!record.checkpoint) {
      record.uploadProgress = 0;
      record.hashProgress = 0;
    }
    this._notify();

    if (!this.waitingIds.includes(id)) this.waitingIds.push(id);
    this._schedule();
  }

  /**
   * 取消任务：abort SDK uploader 并从列表里移除（不保留已取消记录）。
   * remove(id) 是它的别名——无论任务处于什么状态都一视同仁地清理。
   */
  cancel(id) {
    const uploader = this.uploaders.get(id);
    const waitingIdx = this.waitingIds.indexOf(id);
    if (waitingIdx >= 0) this.waitingIds.splice(waitingIdx, 1);
    if (uploader?.cancel) {
      try { uploader.cancel(); } catch { /* ignore */ }
    }
    this.uploaders.delete(id);
    this.files.delete(id);
    this.tasks.delete(id);
    this._notify();
  }

  remove(id) { this.cancel(id); }

  // ───────────────── 批量 API ─────────────────

  clearDone() {
    for (const [id, t] of this.tasks) {
      if (t.status === 'success' || t.status === 'error') {
        this.tasks.delete(id);
        this.files.delete(id);
      }
    }
    this._notify();
  }

  /** 暂停所有"进行中"（pending / hash / uploading）任务。 */
  async pauseAll() {
    const ids = [];
    for (const [id, t] of this.tasks) {
      if (t.status === 'pending' || t.status === 'hash' || t.status === 'uploading') {
        ids.push(id);
      }
    }
    await Promise.allSettled(ids.map((id) => this.pause(id)));
  }

  /** 重新开始所有可恢复（paused / error）任务。 */
  resumeAll() {
    for (const [id, t] of this.tasks) {
      if (t.status === 'paused' || t.status === 'error') {
        this.resume(id);
      }
    }
  }

  /** 删除全部任务（= 批量 cancel，但只 notify 一次，避免 UI 闪烁）。 */
  removeAll() {
    for (const [id] of this.tasks) {
      const uploader = this.uploaders.get(id);
      if (uploader?.cancel) {
        try { uploader.cancel(); } catch { /* ignore */ }
      }
    }
    this.waitingIds.length = 0;
    this.uploaders.clear();
    this.files.clear();
    this.tasks.clear();
    this._notify();
  }

  // ───────────────── 调度与执行 ─────────────────

  _schedule() {
    while (this.activeCount < this.maxConcurrency && this.waitingIds.length > 0) {
      const id = this.waitingIds.shift();
      const record = this.tasks.get(id);
      // 任务可能在入队后、调度前被 cancel / resume 变动
      if (!record || record.status !== 'pending') continue;

      this.activeCount += 1;
      this._run(id).finally(() => {
        this.activeCount = Math.max(0, this.activeCount - 1);
        this._schedule();
      });
    }
  }

  /** 执行单个任务的一次完整生命周期。 */
  async _run(id) {
    const record = this.tasks.get(id);
    const file = this.files.get(id);
    if (!record || !file) return;

    // 如果之前暂停时保存了 checkpoint，这次透传回去实现续传。
    //
    // ⚠️ 注意：SDK restoreCheckpoint 会 `this.state = cp.state`。如果 state
    // 不是 waiting/error/paused/canceled 四种里的一种，uploader.start() 会
    // 直接 return 不启动。所以这里统一规范成 'paused'。
    const resumeCheckpoint = record.checkpoint
      ? { ...record.checkpoint, state: 'paused' }
      : null;

    // 速度估算用的滑动平均状态（闭包持有）
    let lastLoaded = 0;
    let lastTime = Date.now();
    let smoothSpeed = 0;

    try {
      const uploader = this.client.createUploadTask({
        filePath: record.remotePath,
        file,
        conflictResolutionStrategy: 'overwrite',
        ...(resumeCheckpoint ? { checkpoint: resumeCheckpoint } : {}),

        // 状态变化：把 SDK 状态机映射到我们的 status 字段，并顺手持久化 checkpoint。
        onStateChange: (cp, state, error) => {
          if (!this.tasks.has(id)) return; // 任务可能已被 cancel
          this._saveCheckpoint(id, cp);

          switch (state) {
            case TaskStatus.SUCCESS:
            case TaskStatus.RAPID_SUCCESS:
              record.status = 'success';
              record.uploadProgress = 100;
              record.hashProgress = 100;
              record.speed = 0;
              record.checkpoint = null;
              this.uploaders.delete(id);
              this._notify();
              break;
            case TaskStatus.ERROR:
              record.status = 'error';
              record.speed = 0;
              record.error = error?.message || error?.code || '上传失败';
              this.uploaders.delete(id);
              this._notify();
              break;
            case TaskStatus.PAUSED:
              record.status = 'paused';
              record.speed = 0;
              this._notify();
              break;
            case TaskStatus.COMPUTING_HASH:
              record.status = 'hash';
              this._notify();
              break;
            case TaskStatus.RUNNING:
              record.status = 'uploading';
              this._notify();
              break;
            // CANCELED 不处理：cancel() 已经把任务从 Map 删除，回调会被上面的 guard 拦下
            default: break;
          }
        },

        // 每完成一个分片，SDK 都会带含 etag 的最新 cp 回来——尽早落盘，
        // 避免浏览器崩溃 / 用户关页时丢失分片 etag。
        onPartComplete: (cp) => {
          if (!this.tasks.has(id)) return;
          this._saveCheckpoint(id, cp);
        },

        // 进度：区分 hash 阶段（紫色条）和上传阶段（蓝色条）
        onProgress: (info) => {
          if (!this.tasks.has(id)) return;
          // 终态任务忽略剩余 progress（有可能终态后 SDK 还零星地吐一条）
          if (record.status === 'paused' || record.status === 'success' || record.status === 'error') {
            return;
          }

          const pct = Math.max(0, Math.min(100, Number(info?.progress) || 0));

          if (info?.state === 'computing_hash') {
            record.status = 'hash';
            record.hashProgress = Math.min(99, Math.floor(pct));
          } else {
            record.status = 'uploading';
            // 从 hash 切到 upload 时，把 hashProgress 推到 100
            if (record.hashProgress > 0 && record.hashProgress < 100) record.hashProgress = 100;
            record.uploadProgress = Math.min(99, Math.floor(pct));

            // 滑动平均估算瞬时速度（0.7 旧 + 0.3 新），避免抖动
            const now = Date.now();
            const loaded = Math.round((pct * record.size) / 100);
            const dt = (now - lastTime) / 1000;
            if (dt > 0 && loaded > lastLoaded) {
              const inst = (loaded - lastLoaded) / dt;
              smoothSpeed = smoothSpeed > 0 ? smoothSpeed * 0.7 + inst * 0.3 : inst;
              record.speed = Math.round(smoothSpeed);
            } else if (loaded < lastLoaded) {
              // 续传时 loaded 可能回退，重新开始估算
              smoothSpeed = 0;
              record.speed = 0;
            }
            lastLoaded = loaded;
            lastTime = now;
          }
          this._notifyThrottled();
        },
      });

      this.uploaders.set(id, uploader);
      // 在 SDK 第一个 onStateChange 到来前，给一个乐观的初始 status
      record.status = resumeCheckpoint ? 'uploading' : 'hash';
      record.error = '';
      this._notify();

      await uploader.start();
    } catch (err) {
      // 任务可能已被 cancel/remove，就别 touch 已删除的 record
      if (!this.tasks.has(id)) return;
      record.status = 'error';
      record.error = err?.message || '上传启动失败';
      this.uploaders.delete(id);
      this._notify();
    }
  }

  /** 把 SDK 给的 checkpoint 精简后写入 record；若 cp 不合法则保持原值。 */
  _saveCheckpoint(id, cp) {
    const picked = pickCheckpoint(cp);
    if (!picked) return;
    const record = this.tasks.get(id);
    if (!record) return;
    record.checkpoint = picked;
    record.isMultipart = true;
  }
}
