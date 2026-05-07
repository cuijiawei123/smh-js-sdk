# SMH 上传队列 Demo

基于 **Vite + React + smh-js-sdk** 的极简上传队列管理 Demo。

> 代码架构、模块职责、调用链路的详细梳理见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 功能

- 顶部「添加文件」批量加入队列，自动调度（默认并发 2）
- **Hash 校验** / **上传** 两阶段共用一条进度条，按状态切色
- 每个任务：暂停 / 开始 / 取消 / 从列表移除
- 实时速度（滑动平均估算）
- 大文件分块上传：暂停保存 checkpoint，点"开始"从断点继续
- 批量：清除已完成 / 暂停全部 / 开始全部 / 删除全部
- 状态过滤 Tabs：全部 / 上传中 / 失败 / 已完成

## 运行

```powershell
cd demo/queue
npm install
npm run dev
```

浏览器会自动打开 <http://localhost:5191>。

## 凭证

`src/App.jsx` 顶部 `DEFAULT_CRED` 已填入用户提供的 SMH 凭证：

- `basePath`: `https://smh3jsttekkpsoqw.api.tencentsmh.cn`
- `libraryId`: `smh3jsttekkpsoqw`
- `spaceId`: `space232t1yug3w7up`
- `accessToken`: 预填

## 文件说明

| 文件 | 作用 |
| --- | --- |
| `src/upload-queue.js` | 队列管理器：并发控制、pause/resume/cancel/remove、进度分阶段、订阅通知 |
| `src/App.jsx` | UI：header、统计、列表、任务行组件 |
| `src/app.css` | 样式（纯 CSS，~230 行） |

## 进度阶段

SDK 上报的 `info.state` 会在上传过程中切换：

- `'computing_hash'` → **Hash 校验阶段**：计算秒传 beginning hash / full hash。Demo 里展示紫色进度条（`q-badge--hash`）。
- `'running'` / 其他 → **上传阶段**：分片 PUT 或 simpleUpload。Demo 里展示蓝色进度条（`q-badge--active`）。

> 小文件（<32MB）走 SDK 的 simpleUpload，可能直接跳过 hash 阶段；大文件会先计算 hash，再进入上传。

## 注意

- 当前实现不持久化到 localStorage，刷新页面队列即丢失（作为 demo 足够）
- 断点续传依赖 SDK 内存 checkpoint，**仅应用内暂停恢复有效**；想跨页面续传参考 `demo/dotnet/webui/src/upload-manager.js` 的 IndexedDB 持久化方案
- 浏览器沙箱下无法获取绝对路径，刷新后 File 对象丢失，需重新选择文件
