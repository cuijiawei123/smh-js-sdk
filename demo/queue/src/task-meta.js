/**
 * task-meta.js — 任务状态的单一事实来源
 *
 * 把"状态 → 展示文案/样式类"以及"状态 → 能做什么操作"集中在一起。
 * 任何地方需要"所有进行中任务"/"所有能暂停的任务"都要走这里的谓词，
 * 避免 UI、批量 API、过滤 tab 三处判断口径不一致。
 */

// 规范：TASK_STATUS.X 就是 record.status 的合法值
export const TASK_STATUS = Object.freeze({
  PENDING:   'pending',    // 排队中，尚未启动
  HASH:      'hash',       // 计算秒传 hash
  UPLOADING: 'uploading',  // 实际传输中
  PAUSED:    'paused',     // 用户暂停
  SUCCESS:   'success',    // 完成（含秒传）
  ERROR:     'error',      // 失败
});

/**
 * 状态的展示元信息：文案 + 徽章样式 + 进度条颜色
 * 给 TaskItem 直接查表用，避免 switch-case 写好几套。
 */
const STATUS_META = {
  [TASK_STATUS.PENDING]:   { label: '等待上传', badge: 'q-badge--pending', bar: 'q-bar__fill--upload' },
  [TASK_STATUS.HASH]:      { label: '校验中',   badge: 'q-badge--hash',    bar: 'q-bar__fill--hash'   },
  [TASK_STATUS.UPLOADING]: { label: '上传中',   badge: 'q-badge--active',  bar: 'q-bar__fill--upload' },
  [TASK_STATUS.PAUSED]:    { label: '暂停',     badge: 'q-badge--paused',  bar: 'q-bar__fill--paused' },
  [TASK_STATUS.SUCCESS]:   { label: '已上传',   badge: 'q-badge--success', bar: 'q-bar__fill--done'   },
  [TASK_STATUS.ERROR]:     { label: '上传错误', badge: 'q-badge--error',   bar: 'q-bar__fill--error'  },
};

export function statusMeta(status) {
  return STATUS_META[status] || { label: status, badge: '', bar: 'q-bar__fill--upload' };
}

// ─── 谓词：给过滤 / 批量 / 按钮可用性共用 ────────────────────────
// "进行中"口径：等待 / 校验 / 暂停 / 上传 都算（含暂停，用户反馈要求）
export const isActive    = (t) => t.status === TASK_STATUS.PENDING
                                || t.status === TASK_STATUS.HASH
                                || t.status === TASK_STATUS.PAUSED
                                || t.status === TASK_STATUS.UPLOADING;
// "能暂停"：没到终态，且不是已经暂停
export const isPausable  = (t) => t.status === TASK_STATUS.PENDING
                                || t.status === TASK_STATUS.HASH
                                || t.status === TASK_STATUS.UPLOADING;
// "能开始"：暂停或失败的都可以点"开始"重新跑
export const isResumable = (t) => t.status === TASK_STATUS.PAUSED
                                || t.status === TASK_STATUS.ERROR;
export const isDone      = (t) => t.status === TASK_STATUS.SUCCESS;
export const isFailed    = (t) => t.status === TASK_STATUS.ERROR;
// 除了已完成，其它状态都允许用户"取消"（直接从列表移除）
export const isCancelable = (t) => t.status !== TASK_STATUS.SUCCESS;
