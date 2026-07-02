# Changelog

本文件记录 smh-js-sdk 各版本的变更内容。

## [1.0.15] - 2026-07-02

### 新增

- **上传自动创建目录**：`createUploadTask` 新增 `autoCreateDir` 选项（默认 `false`）。开启后，若上传因目标父目录不存在（`DirectoryNotFound`）失败，SDK 会自动对目标目录调用一次 `createDirectory`（服务端递归创建各级父目录）并重试一次上传，简单上传与分片上传均生效
- **在线文档编辑**：新增 `officeEdit` 接口，打开数据万象在线文档编辑入口，返回可直接嵌入 iframe 的编辑器 HTML 页面。支持 Word / Excel / PPT / PDF 系列格式，文件不超过 200MB；需在 library 级别开白 `enableDocEdit`，未开启返回 `DocEditNotEnabled`

---

## [1.0.14] - 2026-06-01

### 新增

- **压缩包预览**：新增 `previewZipFile` 接口，支持在不解压文件的情况下预览压缩包内容（文件数量、名称、大小、修改时间等），支持 `flat`（扁平列表）和 `tree`（树形结构）两种返回格式，支持加密压缩包预览
- **文件解压**：新增 `uncompressFile` 接口，支持将压缩包异步解压到 SMH 网盘指定目录，支持整包解压和选择性解压（`selectedFilePaths`）、冲突处理策略（`rename`/`overwrite`/`ask`）、加密压缩包（`password`）及跨空间解压（`targetSpaceId`）

---