/**
 * App.jsx — SMH 上传队列 Demo UI
 *
 * 单文件组织：所有 UI（图标 / 单行任务 / 过滤 Tabs / 更多菜单 / 根组件）都在这里，
 * 用分区注释切成几块。领域逻辑在 upload-queue.js，状态元信息在 task-meta.js。
 *
 * 目录：
 *   1. 配置常量
 *   2. 格式化工具
 *   3. SVG 图标
 *   4. useDropdown hook（外部点击 / ESC 自动关闭）
 *   5. TaskItem     单行任务
 *   6. FilterTabs   顶部过滤
 *   7. HeaderActions 顶部按钮 + 更多菜单
 *   8. App          组合根
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { UploadQueue } from './upload-queue.js';
import {
  TASK_STATUS,
  statusMeta,
  isActive,
  isPausable,
  isResumable,
  isDone,
  isFailed,
  isCancelable,
} from './task-meta.js';

// ─── 1. 配置常量 ──────────────────────────────────────────
//
// ⚠️ 生产中不要把 accessToken 明文写死到前端，demo 为演示方便直接内嵌。

const SMH_CRED = {
  basePath: 'https://{spaceId}.api.tencentsmh.cn',
  libraryId: '',
  spaceId: '',
  accessToken: '',
};

const MAX_CONCURRENCY = 2;

// ─── 2. 格式化工具 ────────────────────────────────────────

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const i = Math.min(SIZE_UNITS.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${SIZE_UNITS[i]}`;
}

function formatSpeed(bps) {
  if (!bps || bps <= 0) return '';
  return `${formatBytes(bps)}/s`;
}

// ─── 3. SVG 图标 ──────────────────────────────────────────
//
// 所有图标都用 currentColor 描边，外层按钮 color 变就跟着变。

const SVG_BASE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const IconPlus = () => (
  <svg width="14" height="14" strokeWidth="2.5" {...SVG_BASE}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconPause = () => (
  <svg width="12" height="12" strokeWidth="2.5" {...SVG_BASE}>
    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
  </svg>
);
const IconPlay = () => (
  <svg width="12" height="12" strokeWidth="2.5" {...SVG_BASE}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const IconX = () => (
  <svg width="12" height="12" strokeWidth="2.5" {...SVG_BASE}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" strokeWidth="2" {...SVG_BASE}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconMore = () => (
  <svg width="14" height="14" strokeWidth="2" {...SVG_BASE}>
    <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
  </svg>
);
const IconChevronDown = () => (
  <svg width="12" height="12" strokeWidth="2" {...SVG_BASE}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
// Check 用固定绿色，不跟按钮文字走
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── 4. useDropdown：外部点击 / ESC 自动关闭 ──────────────────

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return {
    ref,
    open,
    toggle: () => setOpen((v) => !v),
    close: () => setOpen(false),
  };
}

// ─── 5. TaskItem 单行任务 ────────────────────────────────

/** 根据状态拼整行 tooltip（hover 文件名可看到续传进度 / 错误详情）。 */
function buildRowTooltip(t) {
  if (t.status === TASK_STATUS.PAUSED && t.isMultipart && t.checkpoint) {
    const parts = t.checkpoint.part_info_list || [];
    const done = parts.filter((p) => p.etag).length;
    return `${t.name}\n已保存 ${done} / ${parts.length} 片，续传就绪`;
  }
  if (t.status === TASK_STATUS.PAUSED && !t.isMultipart) {
    return `${t.name}\n简单上传无续传，开始将从 0 重传`;
  }
  if (t.status === TASK_STATUS.ERROR && t.error) {
    return `${t.name}\n${t.error}`;
  }
  return t.name;
}

function TaskItem({ task, onPause, onResume, onCancel, onRemove }) {
  // hash 阶段展示 hashProgress（紫）；其余阶段展示 uploadProgress
  const inHash = task.status === TASK_STATUS.HASH;
  const pct = inHash ? (task.hashProgress || 0) : (task.uploadProgress || 0);
  const meta = statusMeta(task.status);
  const barClass = inHash ? 'q-bar__fill--hash' : meta.bar;

  const canRemove = isDone(task) || isFailed(task);

  return (
    <div className="q-item" title={buildRowTooltip(task)}>
      <div className="q-item__icon">
        {isDone(task)
          ? <IconCheck />
          : <span className={`q-item__dot q-item__dot--${task.status}`} />}
      </div>

      <span className="q-item__name">{task.name}</span>
      <span className="q-item__size">{formatBytes(task.size)}</span>

      <span className={`q-badge ${meta.badge}`}>{meta.label}</span>
      {task.isMultipart && (task.status === TASK_STATUS.PAUSED || task.status === TASK_STATUS.UPLOADING) && (
        <span className="q-badge q-badge--multipart" title="分块上传，暂停后点开始会从断点续传">分块</span>
      )}

      <div className="q-bar">
        <div className={`q-bar__fill ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="q-bar-pct">{pct}%</span>

      {task.status === TASK_STATUS.UPLOADING && task.speed > 0 && (
        <span className="q-item__speed">{formatSpeed(task.speed)}</span>
      )}
      {isFailed(task) && task.error && (
        <span className="q-item__error" title={task.error}>{task.error}</span>
      )}

      <div className="q-item__actions">
        {isPausable(task)   && <button className="q-btn"             title="暂停" onClick={() => onPause(task.id)}>   <IconPause /></button>}
        {isResumable(task)  && <button className="q-btn q-btn--primary" title="开始" onClick={() => onResume(task.id)}><IconPlay /></button>}
        {isCancelable(task) && <button className="q-btn q-btn--danger"  title="取消" onClick={() => onCancel(task.id)}><IconX /></button>}
        {canRemove          && <button className="q-btn"             title="从列表移除" onClick={() => onRemove(task.id)}><IconTrash /></button>}
      </div>
    </div>
  );
}

// ─── 6. FilterTabs 顶部过滤 ─────────────────────────────

const FILTER_DEFS = [
  { key: 'all',    label: '全部',   cls: '' },
  { key: 'active', label: '上传中', cls: 'q-filter--running' },
  { key: 'error',  label: '失败',   cls: 'q-filter--error' },
  { key: 'done',   label: '已完成', cls: 'q-filter--done' },
];

function FilterTabs({ value, counts, onChange }) {
  return (
    <div className="q-filters" role="tablist">
      {FILTER_DEFS.map((f) => (
        <button
          key={f.key}
          role="tab"
          aria-selected={value === f.key}
          className={`q-filter ${value === f.key ? 'q-filter--selected' : ''} ${f.cls}`}
          onClick={() => onChange(f.key)}
        >
          <span className="q-filter__label">{f.label}</span>
          <span className="q-filter__count">{counts[f.key] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

// ─── 7. HeaderActions 顶部操作 ──────────────────────────

function HeaderActions({ counts, onAddFiles, onClearDone, onPauseAll, onResumeAll, onRemoveAll }) {
  const fileInputRef = useRef(null);
  const menu = useDropdown();

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onAddFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = ''; // 允许连续选同一批文件
  };

  const clearableCount = counts.done + counts.error;

  return (
    <div className="q-header__actions">
      <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleChange} />

      <button className="q-add-btn" onClick={() => fileInputRef.current?.click()}>
        <IconPlus />
        添加文件
      </button>

      <button
        className="q-clear-btn"
        onClick={onClearDone}
        disabled={clearableCount === 0}
        title={clearableCount === 0 ? '暂无已完成任务' : `清除 ${clearableCount} 个已完成/失败任务`}
      >
        清除已完成
      </button>

      <div className="q-menu" ref={menu.ref}>
        <button
          className="q-clear-btn q-menu__trigger"
          onClick={menu.toggle}
          disabled={counts.total === 0}
          title="更多操作"
        >
          <IconMore />
          更多
          <IconChevronDown />
        </button>
        {menu.open && (
          <div className="q-menu__panel">
            <MenuItem icon={<IconPause />} label="暂停全部" count={counts.pausable}
              onClick={() => { menu.close(); onPauseAll(); }} />
            <MenuItem icon={<IconPlay />}  label="开始全部" count={counts.resumable}
              onClick={() => { menu.close(); onResumeAll(); }} />
            <div className="q-menu__divider" />
            <MenuItem icon={<IconTrash />} label="删除全部" count={counts.total} danger
              onClick={() => { menu.close(); onRemoveAll(); }} />
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ icon, label, count, danger, onClick }) {
  return (
    <button
      className={`q-menu__item ${danger ? 'q-menu__item--danger' : ''}`}
      disabled={!count}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      {count > 0 && <span className="q-menu__count">{count}</span>}
    </button>
  );
}

// ─── 8. App 组合根 ───────────────────────────────────────

export default function App() {
  // 用 lazy-init useState，避免每次 render 都 new 一次
  const [queue] = useState(() => new UploadQueue({ ...SMH_CRED, maxConcurrency: MAX_CONCURRENCY }));
  const [tasks, setTasks] = useState(() => queue.getList());
  const [filter, setFilter] = useState('all');

  // 订阅 queue 的任务列表变化
  useEffect(() => {
    const unsub = queue.subscribe(setTasks);
    return () => {
      unsub();
      queue.removeAll(); // StrictMode 第一次 cleanup 时清空，避免 uploader 泄漏
    };
  }, [queue]);

  // 单次遍历算出各维度计数（和 FilterTabs 的 key 对齐）
  const counts = useMemo(() => {
    const c = { total: tasks.length, all: tasks.length, active: 0, done: 0, error: 0, pausable: 0, resumable: 0 };
    for (const t of tasks) {
      if (isActive(t))    c.active    += 1;
      if (isPausable(t))  c.pausable  += 1;
      if (isResumable(t)) c.resumable += 1;
      if (isDone(t))      c.done      += 1;
      if (isFailed(t))    c.error     += 1;
    }
    return c;
  }, [tasks]);

  // 当前 filter 下可见的任务
  const visibleTasks = useMemo(() => {
    switch (filter) {
      case 'active': return tasks.filter(isActive);
      case 'error':  return tasks.filter(isFailed);
      case 'done':   return tasks.filter(isDone);
      default:       return tasks;
    }
  }, [tasks, filter]);

  const handleAddFiles = (files) => {
    for (const f of files) {
      try { queue.add(f); }
      catch (err) { console.warn('add failed:', f.name, err); }
    }
  };

  const handleRemoveAll = () => {
    if (counts.total === 0) return;
    if (!window.confirm(`确定要删除全部 ${counts.total} 个任务吗？正在上传的任务会被中止。`)) return;
    queue.removeAll();
  };

  return (
    <div className="q-root">
      <header className="q-header">
        <div className="q-header__title">
          <h1>SMH 上传队列 Demo</h1>
          <p className="q-header__desc">
            空间 <code>{SMH_CRED.spaceId}</code>　·　库 <code>{SMH_CRED.libraryId}</code>
          </p>
        </div>
        <HeaderActions
          counts={counts}
          onAddFiles={handleAddFiles}
          onClearDone={() => queue.clearDone()}
          onPauseAll={() => queue.pauseAll()}
          onResumeAll={() => queue.resumeAll()}
          onRemoveAll={handleRemoveAll}
        />
      </header>

      <FilterTabs value={filter} counts={counts} onChange={setFilter} />

      <div className="q-list">
        {tasks.length === 0 ? (
          <Empty title="还没有任务" desc="点击右上角「添加文件」选择本地文件，开始上传" />
        ) : visibleTasks.length === 0 ? (
          <Empty title="当前筛选下没有任务" desc="切换到「全部」查看所有任务" />
        ) : (
          visibleTasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              onPause={(id) => queue.pause(id)}
              onResume={(id) => queue.resume(id)}
              onCancel={(id) => queue.cancel(id)}
              onRemove={(id) => queue.remove(id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Empty({ title, desc }) {
  return (
    <div className="q-empty">
      <p className="q-empty__title">{title}</p>
      <p className="q-empty__desc">{desc}</p>
    </div>
  );
}
