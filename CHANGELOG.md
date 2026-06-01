# Changelog

本文件记录 smh-js-sdk 各版本的变更内容。

## [1.0.14] - 2026-06-01

### 新增

- **压缩包预览**：新增 `previewZipFile` 接口，支持在不解压文件的情况下预览压缩包内容（文件数量、名称、大小、修改时间等），支持 `flat`（扁平列表）和 `tree`（树形结构）两种返回格式，支持加密压缩包预览
- **文件解压**：新增 `uncompressFile` 接口，支持将压缩包异步解压到 SMH 网盘指定目录，支持整包解压和选择性解压（`selectedFilePaths`）、冲突处理策略（`rename`/`overwrite`/`ask`）、加密压缩包（`password`）及跨空间解压（`targetSpaceId`）

---