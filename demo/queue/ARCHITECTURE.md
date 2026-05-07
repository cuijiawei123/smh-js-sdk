# 架构文档

SMH 上传队列 Demo —— 代码架构、模块职责、调用链路梳理。

> 想要"跑起来 / 用法 / 功能清单"看 [README.md](./README.md)；
> 想要"代码怎么组织 / 改哪里改哪" 看本文。

---

## 1. 整体架构

### 1.1 分层

分三层，自下而上：

```
┌─────────────────────────────────────────────────────────┐
│  视图层   App.jsx                                       │
│           ├── 根组件 / 过滤与统计 / 命令转发             │
│           ├── TaskItem / FilterTabs / HeaderActions     │
│           ├── useDropdown（小型 hook）                  │
│           └── 图标 / 格式化工具                         │
├─────────────────────────────────────────────────────────┤
│  领域层   upload-queue.js                               │
│           UploadQueue 类：                              │
│           并发调度 · 状态机 · checkpoint 续传 · 节流通知 │
├─────────────────────────────────────────────────────────┤
│  公共层   task-meta.js                                  │
│           TASK_STATUS 常量 / statusMeta() / 谓词        │
└─────────────────────────────────────────────────────────┘
                         ↓
                 smh-js-sdk (第三方)
                 SMHClient · UploadTask · TaskStatus
```

### 1.2 核心原则

| 原则                        | 落地方式                                                         |
| --------------------------- | ---------------------------------------------------------------- |
| **领域与视图解耦**          | `UploadQueue` 纯 JS，不依赖 React；可以单测                      |
| **状态判断单一事实来源**    | 所有 "是否活跃 / 是否可暂停" 全走 `task-meta.js` 的谓词函数      |
| **命令式 API + 观察者订阅** | 组件调 `queue.xxx()` 触发行为；`queue.subscribe()` 拿状态        |
| **副作用聚集**              | SDK 三个回调（state/part/progress）只在 `_run()` 里装一次        |
| **乐观 UI**                 | `pause()` / `resume()` 先改 UI 再 await SDK，让操作立即有反馈    |

---

## 2. 文件与模块职责

### 2.1 文件清单

```
demo/queue/
├── index.html              入口 HTML（挂载 #root，link favicon）
├── vite.config.js          Vite 配置（port 5191, open:true）
├── package.json            react 18 / vite 5 / smh-js-sdk
└── src/
    ├── main.jsx            ReactDOM bootstrap + StrictMode
    ├── App.jsx             全部 UI（见 §2.3）
    ├── upload-queue.js     UploadQueue 类（见 §2.4）
    ├── task-meta.js        状态常量 + 谓词（见 §2.2）
    └── app.css             所有样式
```

### 2.2 `task-meta.js` —— 状态元信息 & 谓词

**定位**：公共层。UI 和领域层都能 import，但不能反过来依赖它们。

**导出**：

| 符号              | 类型         | 用途                                        |
| ----------------- | ------------ | ------------------------------------------- |
| `TASK_STATUS`     | `const obj`  | 6 个状态的字符串枚举（`pending` / `hash` / `uploading` / `paused` / `success` / `error`） |
| `statusMeta(s)`   | `(s) => obj` | 查表 `{ label, badge, bar }`，给 TaskItem 用 |
| `isActive(t)`     | 谓词         | pending / hash / paused / uploading         |
| `isPausable(t)`   | 谓词         | pending / hash / uploading（**不含 paused**）|
| `isResumable(t)`  | 谓词         | paused / error                              |
| `isDone(t)`       | 谓词         | success                                     |
| `isFailed(t)`     | 谓词         | error                                       |
| `isCancelable(t)` | 谓词         | 非 success 都可取消                         |

**为什么要单独抽出来**：早期版本这些判断散落在 `TaskItem`、`App` 的 stats、`App` 的 filter 三处，经常出现 A 处改了 B 处忘改的情况。集中后任何判断口径变化只改一处。

### 2.3 `App.jsx` —— 视图层

**单文件组织**，用分区注释切 8 段（每段都在顶部目录里索引）：

| 分区 | 符号                                      | 职责                                                   |
| ---- | ----------------------------------------- | ------------------------------------------------------ |
| 1    | `SMH_CRED` / `MAX_CONCURRENCY`            | Demo 凭证与并发上限常量                                |
| 2    | `formatBytes` / `formatSpeed`             | 两个纯函数格式化工具                                   |
| 3    | `SVG_BASE` + 8 个 `IconXxx`               | 内联 SVG 图标（currentColor 描边）                     |
| 4    | `useDropdown()`                           | 下拉菜单 hook（外部点击 / ESC 自动关闭）               |
| 5    | `TaskItem` + `buildRowTooltip`            | 单行任务组件（无状态，props 驱动）                     |
| 6    | `FilterTabs` + `FILTER_DEFS`              | 顶部状态过滤 Tabs（受控）                              |
| 7    | `HeaderActions` + `MenuItem`              | 添加文件 / 清除已完成 / 更多菜单                       |
| 8    | `App` + `Empty`                           | 组合根：订阅队列、算 counts、过滤、编排布局            |

**组件依赖**（→ 表示"渲染"）：

```
App ─┬→ HeaderActions ─┬→ (input type="file")
     │                 └→ DropdownMenu wrapper ─┬→ MenuItem × 3
     │                                           └ useDropdown()
     ├→ FilterTabs
     └→ TaskItem（for each visible task）
     (fallback) Empty
```

### 2.4 `upload-queue.js` —— 领域层

#### 2.4.1 对外 API

| API                               | 说明                                                            |
| --------------------------------- | --------------------------------------------------------------- |
| `new UploadQueue(config)`         | `{ basePath, libraryId, spaceId, accessToken, maxConcurrency }` |
| `.add(file, opts?) → taskId`      | 入队 + 自动调度                                                 |
| `.pause(id) → Promise`            | 暂停单个；await 后 checkpoint 已落盘                            |
| `.resume(id)`                     | 继续 / 重试                                                     |
| `.cancel(id)` / `.remove(id)`     | 终止并移除；二者等价                                            |
| `.clearDone()`                    | 清除所有 success / error                                        |
| `.pauseAll()` / `.resumeAll()` / `.removeAll()` | 批量                                              |
| `.subscribe(fn) → unsubscribe`    | 订阅 `fn(list)`；立即推一次初值                                 |
| `.getList()`                      | 同步拿当前快照（record 的浅拷贝）                               |

#### 2.4.2 内部数据结构

```
UploadQueue
├── client            SMHClient 实例（挂 default libId/spaceId/token）
├── maxConcurrency    并发上限（默认 2）
│
├── tasks: Map<id, record>       ← 面向 UI 的状态对象（subscribe 吐这个）
├── files: Map<id, File>         ← 原始 File，resume 时要用
├── uploaders: Map<id, Uploader> ← SDK uploader；仅运行期持有
│
├── waitingIds: string[]         ← FIFO 等待队列
├── activeCount: number          ← 当前活跃任务数，≤ maxConcurrency
│
├── listeners: Set<fn>
├── _notifyTimer / _notifyLastAt ← 节流通知用的内部状态
```

#### 2.4.3 任务 record 的字段

```ts
{
  id: string,            // 't-{timestamp}-{rand}'
  name: string,          // file.name
  size: number,          // bytes
  remotePath: string,    // 上传到 SMH 的目标路径
  status: 'pending' | 'hash' | 'uploading' | 'paused' | 'success' | 'error',
  hashProgress: 0-100,   // SDK hash 阶段进度
  uploadProgress: 0-100, // SDK 上传阶段进度
  speed: number,         // bytes/sec，滑动平均
  error: string,
  checkpoint: object | null,  // 分块上传的续传信息，由 pickCheckpoint 精简
  isMultipart: boolean,       // 一旦 SDK 给过合法 checkpoint 就置 true
}
```

#### 2.4.4 SDK 状态 ↔ 我们的 status 映射

| SDK `TaskStatus`        | 我们的 `record.status` |
| ----------------------- | ---------------------- |
| `COMPUTING_HASH`        | `'hash'`               |
| `RUNNING`               | `'uploading'`          |
| `PAUSED`                | `'paused'`             |
| `SUCCESS` / `RAPID_SUCCESS` | `'success'`         |
| `ERROR`                 | `'error'`              |
| `CANCELED`              | *(不处理，任务此时已从 Map 删除)* |

---

## 3. 调用链路

### 3.1 启动与订阅

```
main.jsx
  └→ <App />
       └→ useState(() => new UploadQueue({...SMH_CRED, maxConcurrency:2}))
            └→ new SMHClient(basePath) + setDefault*(libId/spaceId/token)

       useEffect(() => queue.subscribe(setTasks))
            └→ listeners.add(fn); fn(getList())  // 立即一次空列表
```

### 3.2 添加文件 → 自动上传（核心流程）

```
[用户点「添加文件」]
  └→ HeaderActions <input onChange>
       └→ App.handleAddFiles(files)
            └→ for 每个 file: queue.add(file)
                 ├─ tasks.set(id, record{status:'pending',...})
                 ├─ files.set(id, file)
                 ├─ waitingIds.push(id)
                 ├─ _notify()               ───► App setTasks(list)
                 └─ _schedule()
                      ├─ activeCount < max?
                      │    yes → activeCount++; _run(id).finally(...)
                      └─ _run(id)
                           ├─ 准备 resumeCheckpoint（若 record.checkpoint 存在）
                           ├─ this.client.createUploadTask({
                           │      filePath, file, conflict, checkpoint?,
                           │      onStateChange, onPartComplete, onProgress
                           │    })
                           ├─ uploaders.set(id, uploader)
                           ├─ record.status = 'hash' (乐观)
                           ├─ _notify()
                           └─ await uploader.start()
                                    ↓
                              SDK 回调流（见下节）
```

### 3.3 SDK 回调流（`_run` 内部装的三个回调）

```
SDK onStateChange(cp, state, err)
  ├─ guard: tasks.has(id) 否则 return
  ├─ _saveCheckpoint(id, cp)   ← pickCheckpoint 精简后写 record
  └─ switch(state):
        SUCCESS/RAPID  → record.status='success'; uploadProgress=100; uploaders.delete
        ERROR          → record.status='error'; record.error=...; uploaders.delete
        PAUSED         → record.status='paused'
        COMPUTING_HASH → record.status='hash'
        RUNNING        → record.status='uploading'
     _notify()  ───► App setTasks

SDK onPartComplete(cp)      ← 分块上传，每完成一片回调
  ├─ guard
  └─ _saveCheckpoint(id, cp) ← 分片 etag 尽早落盘

SDK onProgress(info)        ← 高频，分片级或字节级
  ├─ guard + 终态丢弃
  ├─ info.state === 'computing_hash' ?
  │     yes → record.hashProgress = pct
  │     no  → record.uploadProgress = pct
  │          + 滑动平均算 record.speed
  └─ _notifyThrottled()  ← 400ms 窗口聚合，trailing 必发
```

### 3.4 暂停 / 续传的边界情况

```
App  ── queue.pause(id) ──►  UploadQueue.pause(id)
                               ├─ UI 先响应：record.status='paused'，_notify
                               └─ await uploader.pause()
                                    └→ SDK abort → onStateChange(PAUSED)
                                         └→ _saveCheckpoint(最新 cp)  ★
                                               ✓ resume 就绪

App  ── queue.resume(id) ──►  UploadQueue.resume(id)
                                ├─ 丢弃旧 uploader（pauseFlag 已置位，不可复用）
                                ├─ record.status = 'pending'（+ 简单上传清零进度）
                                ├─ _notify
                                └─ waitingIds.push(id); _schedule()
                                        └→ _run(id)
                                             └→ createUploadTask({ checkpoint: { ...record.checkpoint, state:'paused' } })
                                                     ★ 规范 state='paused' 是必须的，否则 SDK start() 直接 return
```

**分块 vs 简单 上传的关键差异**

| 场景            | 分块上传（大文件）               | 简单上传（小文件）         |
| --------------- | -------------------------------- | -------------------------- |
| SDK 是否给 cp   | ✅ 每次状态变化 / 分片完成都给   | ❌ 始终不给                |
| `record.checkpoint` | 有值                          | 始终为 null                |
| `isMultipart`   | true                             | false                      |
| 暂停→继续行为   | 从断点续传                       | 从 0 重传（UI 也会清零）   |

### 3.5 取消 / 删除

```
App ── queue.cancel(id) / remove(id) ──►
     UploadQueue.cancel:
       ├─ waitingIds 里摘掉
       ├─ uploader.cancel()（运行中才有）
       ├─ uploaders/files/tasks 三个 Map 同时删 id
       └─ _notify

SDK 后续的 onStateChange(CANCELED) / onProgress 等回调
    都会被 `if (!this.tasks.has(id)) return` 拦下，不会 touch 已删 record。
```

### 3.6 批量操作

| App 调用          | UploadQueue 行为                                              |
| ----------------- | ------------------------------------------------------------- |
| `clearDone()`     | 遍历删 success / error；`_notify` 一次                        |
| `pauseAll()`      | 先挑出 pending/hash/uploading 的 id，`Promise.allSettled(pause(id))` |
| `resumeAll()`     | 对 paused / error 任务循环 `resume(id)`                        |
| `removeAll()`     | 一次性 abort 所有 uploader + 清空 3 个 Map，**只 notify 一次**，避免 UI 闪烁 |

### 3.7 从 UploadQueue 到 UI 的通知路径

```
 任何改动 (add / resume / cancel / SDK 回调 ...)
            │
            ▼
  _notify() 或 _notifyThrottled()
            │  (throttled 用 400ms trailing timer 聚合 onProgress 等高频事件)
            ▼
  listeners.forEach(fn => fn(getList()))
            │
            ▼
  App 里的 setTasks(list)
            │
            ▼
  counts / visibleTasks 的 useMemo 重新计算
            │
            ▼
  React re-render TaskItem × N
```

---

## 4. 关键设计决策 & 踩坑

### 4.1 为什么 `resume` 要重建 uploader，而不是复用旧的 pause 过的？

SDK 的 `Uploader.pause()` 内部设置了 `pauseFlag`，即便你再调 `.start()` 也会立即 return。唯一稳妥的路径是：**丢弃旧实例 → 重新 `createUploadTask({ checkpoint })` → `start()`**。

### 4.2 为什么透传 checkpoint 时要强制 `state: 'paused'`？

SDK `restoreCheckpoint()` 会 `this.state = cp.state`。而 `start()` 只在 state ∈ `{waiting, error, paused, canceled}` 时才真正启动。如果上次状态恰好是 `running`，start 会直接 return。统一规范成 `paused` 最稳。

### 4.3 为什么 `onPartComplete` 也要 `_saveCheckpoint` 一次？

`onStateChange(PAUSED)` 只在用户主动暂停时触发。如果浏览器崩溃 / 用户直接关页，我们可能一个分片的 etag 都没保存。`onPartComplete` 在每个分片完成瞬间就回调，把 cp 落地。

*（当前 demo 只存内存，崩溃丢失；但留了这个 hook，将来想接 IndexedDB 持久化很方便。）*

### 4.4 为什么 `cancel` 的回调要加 `if (!this.tasks.has(id)) return` guard？

SDK 的 `cancel()` 是异步的。用户点完 X 后，SDK 可能还会陆续吐几条 `onProgress` / `onStateChange(CANCELED)`。如果不加 guard，这些回调会对已删除的 record 做 mutation，要么报错，要么让"已删"任务短暂"复活"。

### 4.5 为什么 `_notify` 要节流？

`onProgress` 在大文件上传时频率极高（分片级别 / 字节级别）。不节流 UI 会 60fps 重渲，造成 scroll 卡顿。400ms 窗口是手感阈值——用户一般不会觉得进度条"卡住"。

### 4.6 为什么统计和 filter 分两个 useMemo？

- `counts` 只依赖 `tasks`，filter 切换时不应重算
- `visibleTasks` 依赖 `tasks + filter`
- 拆成两个 memo 让 React 在 filter 切换时只跑第二个

### 4.7 为什么状态常量用字符串（`'pending'`）而不是数字？

- 字符串直接能拼 class：`q-item__dot--${status}` → `q-item__dot--hash`
- DevTools 里 record 一眼能读
- 字符串不变（`TASK_STATUS.PENDING === 'pending'`），序列化 / 反序列化天然兼容

### 4.8 为什么 `cancel(id)` 和 `remove(id)` 做成别名？

UI 语义：
- "取消" 按钮用在运行中 / 暂停 / 失败 的任务
- "移除" 按钮用在已完成 / 失败 的任务

实现上两者都是"abort uploader（如果有）+ 从 Map 删掉"，没有任何分叉。保留两个名字只是给调用方语义提示。

---

## 5. 扩展指南

想做功能改动时，参考这张表找对改哪里：

| 想做什么                        | 改哪里                                                     |
| ------------------------------- | ---------------------------------------------------------- |
| 加一个新状态（比如 `verifying`）| `task-meta.js` 加常量 + `STATUS_META` + 所有谓词；`upload-queue.js` 的状态机分支；CSS 里加 dot / badge / bar 颜色 |
| 改"上传中"过滤包含哪些状态      | 只改 `task-meta.js` 的 `isActive`                          |
| 换文案（比如 "暂停" → "暂停中"）| `task-meta.js` 的 `STATUS_META.paused.label`               |
| 换并发上限                      | `App.jsx` 的 `MAX_CONCURRENCY`                             |
| 换节流窗口                      | `upload-queue.js` 的 `NOTIFY_INTERVAL_MS`                  |
| 加持久化（IndexedDB）           | 在 `_saveCheckpoint` 里写 DB；`constructor` 里加一次性加载  |
| 加一个新的批量操作              | `UploadQueue` 加方法；`App` 暴露 prop；`HeaderActions` 加菜单项 |
| 加一个新的过滤 Tab              | `App.jsx` 的 `FILTER_DEFS` + `visibleTasks` 的 switch；`counts` 里加对应字段 |
| 支持拖拽上传                    | `App` 外层加 `onDragOver/onDrop`；拿到 files 后调 `handleAddFiles` |
