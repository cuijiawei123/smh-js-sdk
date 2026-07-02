# 上传文件

本文介绍如何进行文件上传，包括简单上传、分片上传、秒传检测、断点续传、暂停/恢复、取消上传等功能。

---

## 前期准备

开始操作前，确保您已经完成了 SDK 初始化。

如果您还没有初始化 SDK，请先参考 [快速开始文档](./Started.md) 完成。

完成初始化后，您就可以使用 `smh.createUploadTask()` 方法创建上传任务了。

---

## 功能特性

- ✅ **简单上传** - 适用于小文件的直接上传
- ✅ **分片上传** - 大文件自动分片并发上传，提升上传速度
- ✅ **秒传功能** - 文件 hash 匹配时直接完成上传，无需重新上传
- ✅ **断点续传** - 支持暂停后从断点继续上传，节省流量和时间
- ✅ **暂停/恢复** - 随时暂停和恢复上传任务
- ✅ **取消上传** - 取消上传并清理服务端临时资源
- ✅ **进度监控** - 实时监控上传进度、速度和剩余时间
- ✅ **事件监听** - 丰富的事件系统，监听上传过程中的各种状态变化
- ✅ **CRC64 校验** - 基于 WebAssembly 的 CRC64 完整性校验
- ✅ **签名自动续期** - 分片上传时自动续期签名，避免长时间上传因签名过期失败

---

## 快速开始

### 基础上传示例

```typescript
import { SMHClient } from '@tencent/smh-js-sdk';

const smh = new SMHClient({
    basePath: 'https://smhxxx.api.tencentsmh.cn', // 专属域名（推荐）
    accessToken: 'your-access-token',
    libraryId: 'your-library-id',
    spaceId: 'your-space-id',
});

async function uploadFile(browserFile: File) {
    try {
        // 创建上传任务（同步方法，无需 await）
        const task = smh.createUploadTask({
            filePath: `/uploads/${browserFile.name}`,   // 远端保存路径
            file: browserFile,                          // 浏览器 File 对象
        });

        // 监听上传进度
        task.on('progress', (data) => {
            console.log(`上传进度: ${data.progress.toFixed(2)}%`);
            console.log(`已上传: ${data.loaded} / ${data.total} 字节`);
            console.log(`速度: ${data.speed} 字节/秒`);
            console.log(`剩余时间: ${data.leftTime} 秒`);
        });

        // 监听状态变化
        task.on('statechange', (data) => {
            console.log(`状态变化: ${data.state}`);
        });

        // 开始上传（异步方法，需要 await）
        await task.start();

        console.log('✓ 文件上传成功！');
    } catch (error) {
        console.error('✗ 上传失败:', error.message);
    }
}

// 配合 <input type="file"> 使用
const input = document.querySelector('input[type="file"]') as HTMLInputElement;
input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) {
        uploadFile(file);
    }
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 | 默认值 |
|--------|----------|------|----------|--------|
| filePath | 远端文件保存路径 | String | 是 | - |
| file | 浏览器 File 对象（通过 `<input type="file">` 或拖拽等方式获取） | File | 是 | - |
| spaceId | 空间 ID（SMHClient 已设置时可省略） | String | 否 | - |
| userId | 用户 ID | String | 否 | - |
| chunkSize | 分片大小（MB），分片上传时每个分片的大小 | Number | 否 | 5 |
| parallel | 并发上传数（分片上传时同时上传的分片数） | Number | 否 | 2 |
| partFileSize | 触发分片上传的文件大小阈值（MB），超过此大小自动使用分片上传 | Number | 否 | 32 |
| conflictResolutionStrategy | 文件冲突解决策略，可选值：ask、overwrite、rename | String | 否 | rename |
| autoCreateDir | 上传到不存在的目录时是否自动创建所需父目录后重试。开启后，若上传因 `DirectoryNotFound` 失败，SDK 会对目标文件所在目录调用一次 `createDirectory`（服务端自动递归创建中间各级父目录），然后重试上传一次 | Boolean | 否 | false |
| enableInstantUpload | 是否启用秒传功能，当文件已存在时直接完成上传 | Boolean | 否 | true |
| trafficLimit | 单链接上传限速，范围 100KB/s - 100MB/s，单位：字节/秒（B/s） | Number | 否 | - |
| checkpoint | 断点信息（用于恢复上传） | UploadCheckpoint | 否 | - |
| onProgress | 进度回调函数 | Function | 否 | - |
| onStateChange | 状态变化回调函数 | Function | 否 | - |
| onPartComplete | 分片完成回调函数 | Function | 否 | - |
| verbose | 是否输出详细日志，调试时使用 | Boolean | 否 | false |

---

## 上传模式

### 1. 简单上传

适用于小文件（小于 `partFileSize`，默认 32MB）。SDK 自动判断文件大小选择上传模式。

```typescript
const task = smh.createUploadTask({
    filePath: '/uploads/small-file.txt',
    file: browserFile,
});

await task.start();
```

### 2. 分片上传

适用于大文件（大于 `partFileSize`），自动分片并发上传。分片上传支持签名自动续期，长时间上传不会因签名过期而失败。

```typescript
const task = smh.createUploadTask({
    filePath: '/uploads/large-video.mp4',
    file: browserFile,
    chunkSize: 5,        // 每个分片 5MB
    parallel: 2,         // 同时上传 2 个分片
    partFileSize: 32,    // 超过 32MB 使用分片上传
});

// 监听分片完成事件
task.on('partialcomplete', (data) => {
    console.log(`分片 ${data.partInfo.part_number} 上传完成`);
});

await task.start();
```

---

## 事件监听

上传任务支持多种事件监听，方便实时监控上传状态。

### 1. progress 事件

监听上传进度变化。

```typescript
task.on('progress', (data) => {
    console.log(`进度: ${data.progress.toFixed(2)}%`);
    console.log(`已上传: ${data.loaded} 字节`);
    console.log(`总大小: ${data.total} 字节`);
    console.log(`当前速度: ${data.speed} 字节/秒`);
    console.log(`剩余时间: ${data.leftTime} 秒`);
});
```

**事件数据：**
| 字段 | 类型 | 说明 |
|------|------|------|
| progress | Number | 上传进度（0-100） |
| loaded | Number | 已上传字节数 |
| total | Number | 文件总字节数 |
| speed | Number | 当前上传速度（字节/秒） |
| leftTime | Number | 预计剩余时间（秒） |

---

### 2. statechange 事件

监听任务状态变化。

```typescript
task.on('statechange', (data) => {
    console.log(`状态变化: ${data.state}`);
    
    if (data.state === 'success') {
        console.log('✓ 上传成功！');
    } else if (data.state === 'rapid_success') {
        console.log('✓ 秒传成功！');
    } else if (data.state === 'error') {
        console.error('✗ 上传失败:', data.error);
    }
});
```

**任务状态：**
| 状态 | 说明 |
|------|------|
| waiting | 等待开始 |
| start | 开始处理 |
| computing_hash | 计算哈希中（用于秒传检测和 CRC64 校验） |
| created | 已创建上传任务 |
| running | 正在上传 |
| paused | 已暂停 |
| confirming | 确认中（上传完成后与服务端确认） |
| success | 上传成功 |
| rapid_success | 秒传成功 |
| error | 上传失败 |
| canceled | 已取消 |

---

### 3. partialcomplete 事件

监听分片上传完成（仅分片上传模式）。

```typescript
task.on('partialcomplete', (data) => {
    console.log(`分片 ${data.partInfo.part_number} 完成`);
    console.log(`分片大小: ${data.partInfo.chunk_size} 字节`);
    console.log(`分片范围: ${data.partInfo.from}-${data.partInfo.to}`);
});
```

---

## 秒传功能

秒传功能可以大幅提升上传效率，当后端检测到文件已存在时，直接返回成功，无需重新上传。

SDK 会自动计算文件的 beginningHash（文件头部哈希），服务端匹配后可能需要进一步计算 fullHash（完整文件哈希）来确认。文件大小需 ≥ 1MB 才会触发秒传检测。

### 使用示例

```typescript
const task = smh.createUploadTask({
    filePath: '/uploads/existing-file.txt',
    file: browserFile,
    enableInstantUpload: true,    // 默认即为 true
});

// 监听秒传事件
task.on('statechange', (data) => {
    if (data.state === 'rapid_success') {
        console.log('✓ 秒传成功！文件已存在，无需上传。');
    } else if (data.state === 'success') {
        console.log('✓ 上传成功！文件已上传完成。');
    }
});

await task.start();
```

---

## 自动创建目录（autoCreateDir）

将文件上传到不存在的目录（例如 `reports/2026/q2/data.csv`，而 `reports/2026/q2` 尚未创建）时，上传接口会返回 `DirectoryNotFound` 错误导致失败。

开启 `autoCreateDir` 后，SDK 会在捕获到该错误时，自动对目标文件所在目录调用一次创建目录接口，然后重试上传一次。SMH 服务端会自动递归创建中间所需的各级父目录，因此无需逐级手动创建。

### 使用示例

```typescript
const task = smh.createUploadTask({
    filePath: 'reports/2026/q2/data.csv',  // reports/2026/q2 目录可不存在
    file: browserFile,
    autoCreateDir: true,                   // 开启自动建目录
});

await task.start();   // 目录会被自动创建，文件成功上传
```

### 说明

- 默认值为 `false`，不开启时行为不变（上传到不存在的目录仍会失败）。
- 简单上传与分片上传两种模式均生效。
- 仅在确为"目标父目录不存在"（`DirectoryNotFound`）时触发，且最多自动重试一次；若创建目录后上传仍失败（如父级路径上存在同名文件、媒体库限制目录层数等），将抛出原始错误。
- 上传到空间根目录（`filePath` 不含 `/`）时无需创建目录，该选项不产生额外请求。

---

## 暂停和恢复

### 暂停上传

```typescript
const task = smh.createUploadTask({
    filePath: '/uploads/large-video.mp4',
    file: browserFile,
});

// 监听进度，在 30% 时暂停
task.on('progress', (data) => {
    if (data.progress >= 30 && task.state === 'running') {
        console.log('暂停上传...');
        task.pause();
    }
});

task.on('statechange', (data) => {
    if (data.state === 'paused') {
        console.log('✓ 上传已暂停');
        
        // 保存断点信息
        const checkpoint = task.getCheckpoint();
        console.log(`暂停进度: ${checkpoint.progress.toFixed(2)}%`);
    }
});

await task.start();
```

### 恢复上传（断点续传）

使用保存的 checkpoint 信息恢复上传：

```typescript
// 方式一：直接恢复已暂停的任务
await task.start();

// 方式二：使用 checkpoint 创建新任务恢复上传
const checkpoint = task.getCheckpoint();

const newTask = smh.createUploadTask({
    filePath: '/uploads/large-video.mp4',
    file: browserFile,     // 需要同一个 File 对象
    checkpoint: checkpoint,
});

await newTask.start();
```

> **注意**：断点续传要求使用相同的 `File` 对象。如果页面刷新后 `File` 对象丢失，需要用户重新选择文件。

---

## 取消上传

取消上传会通知服务端清理临时资源（如未确认的分片），并重置任务状态。

```typescript
const task = smh.createUploadTask({
    filePath: '/uploads/large-video.mp4',
    file: browserFile,
});

// 监听进度，在 20% 时取消
let wasCanceled = false;
task.on('progress', (data) => {
    if (!wasCanceled && data.progress >= 20) {
        wasCanceled = true;
        console.log('取消上传...');
        task.cancel();
    }
});

task.on('statechange', (data) => {
    if (data.state === 'canceled') {
        console.log('✓ 上传已取消');
    }
});

await task.start();
```

---
