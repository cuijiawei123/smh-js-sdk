# 下载文件

本文介绍如何进行文件下载，包括浏览器 URL 下载、流式下载、分片下载、断点续传、暂停/恢复、取消下载等功能。

---

## 前期准备

开始操作前，确保您已经完成了 SDK 初始化。

如果您还没有初始化 SDK，请先参考 [快速开始文档](./Started.md) 完成。

JS SDK 提供两种下载方式：

1. **URL 下载（推荐）** - 通过 `smh.downloadByUrl()` 触发浏览器原生下载，不占用内存，适合任意大小的文件
2. **流式下载** - 通过 `smh.createDownloadTask()` 使用 `fetch` + `ReadableStream` 下载到内存，返回 `Blob` 对象，适合需要在前端处理文件内容的场景

> **注意**：JS SDK 的 `createDownloadTask` 是**同步方法**（无需 `await`），与 Node SDK 不同。

---

## 功能特性

- ✅ **URL 下载** - 浏览器原生下载，零内存占用，适合任意大小文件
- ✅ **流式下载** - 使用 `fetch` + `ReadableStream`，实时获取下载数据
- ✅ **分片下载** - 大文件自动分片并发下载，提升下载速度
- ✅ **CRC64 校验** - 下载完成后自动校验数据完整性
- ✅ **断点续传** - 支持暂停后从断点继续下载
- ✅ **暂停/恢复** - 随时暂停和恢复下载任务
- ✅ **取消下载** - 取消下载并释放内存
- ✅ **进度监控** - 实时监控下载进度、速度和剩余时间
- ✅ **事件监听** - 丰富的事件系统，监听下载过程中的各种状态变化
- ✅ **自动重试** - 网络错误或 URL 过期时自动重新获取下载 URL 并重试

---

## 方式一：URL 下载（推荐）

通过 `<a>` 标签触发浏览器原生下载，**不会将文件内容加载到内存中**，适合任意大小的文件下载。

### 使用示例

```typescript
import { SMHClient } from '@tencent/smh-js-sdk';

const smh = new SMHClient({
    basePath: 'https://smhxxx.api.tencentsmh.cn', // 专属域名（推荐）
    accessToken: 'your-access-token',
    libraryId: 'your-library-id',
    spaceId: 'your-space-id',
});

// 基础用法
await smh.downloadByUrl({
    filePath: '/documents/example.pdf',
});

// 自定义保存文件名
await smh.downloadByUrl({
    filePath: '/documents/example.pdf',
    fileName: '我的文档.pdf',
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 | 默认值 |
|--------|----------|------|----------|--------|
| filePath | 远端文件路径 | String | 是 | - |
| spaceId | 空间 ID（SMHClient 已设置时可省略） | String | 否 | - |
| userId | 用户 ID | String | 否 | - |
| trafficLimit | 单链接下载限速，单位：字节/秒（B/s） | Number | 否 | - |
| fileName | 下载保存的文件名，默认从 filePath 提取 | String | 否 | - |

### 工作原理

1. 调用文件信息接口获取 COS 签名下载 URL（cosUrl）
2. 创建一个隐藏的 `<a>` 标签，设置 `href` 为下载 URL，`download` 为文件名
3. 模拟点击触发浏览器原生下载
4. 下载过程由浏览器接管，不占用 JS 内存

> **提示**：URL 下载不支持进度监控、暂停/恢复等功能。如果需要这些能力，请使用流式下载。

---

## 方式二：流式下载

使用 `fetch` + `ReadableStream` 将文件下载到内存中，返回 `Blob` 对象。适合需要在前端处理文件内容的场景（如预览、二次处理等）。

### 基础下载示例

```typescript
async function downloadFile() {
    try {
        // 创建下载任务（同步方法，无需 await）
        const task = smh.createDownloadTask({
            filePath: '/documents/example.pdf',
        });

        // 监听下载进度
        task.on('progress', (data) => {
            console.log(`下载进度: ${data.progress.toFixed(2)}%`);
            console.log(`已下载: ${data.loaded} / ${data.total} 字节`);
        });

        // 监听状态变化
        task.on('statechange', (data) => {
            console.log(`状态变化: ${data.state}`);
        });

        // 开始下载
        await task.start();

        // 获取下载结果
        const blob = task.getResult();
        console.log('✓ 文件下载成功！', blob);
    } catch (error) {
        console.error('✗ 下载失败:', error.message);
    }
}
```

### 使用 startAndGetBlob 直接获取 Blob

`startAndGetBlob()` 方法在下载完成后直接返回 `Blob` 对象，使用更加便捷：

```typescript
async function downloadAndPreview() {
    const task = smh.createDownloadTask({
        filePath: '/images/photo.jpg',
    });

    // 直接获取 Blob
    const blob = await task.startAndGetBlob();

    // 创建预览 URL
    const url = URL.createObjectURL(blob);
    const img = document.createElement('img');
    img.src = url;
    document.body.appendChild(img);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 | 默认值 |
|--------|----------|------|----------|--------|
| filePath | 远端文件路径 | String | 是 | - |
| spaceId | 空间 ID（SMHClient 已设置时可省略） | String | 否 | - |
| userId | 用户 ID | String | 否 | - |
| chunkSize | 分片大小（MB） | Number | 否 | 5 |
| parallel | 并发下载数（分片下载时） | Number | 否 | 2 |
| partFileSize | 触发分片下载的文件大小阈值（MB） | Number | 否 | 32 |
| trafficLimit | 单链接下载限速，单位：字节/秒（B/s） | Number | 否 | - |
| checkpoint | 断点信息（用于恢复下载） | DownloadCheckpoint | 否 | - |
| onProgress | 进度回调函数 | Function | 否 | - |
| onStateChange | 状态变化回调函数 | Function | 否 | - |
| onPartComplete | 分片完成回调函数 | Function | 否 | - |
| verbose | 是否输出详细日志，调试时使用 | Boolean | 否 | false |

---

## 下载模式

### 1. 简单下载

适用于小文件（小于 `partFileSize`，默认 32MB），使用单个 `fetch` 请求完成下载。

```typescript
const task = smh.createDownloadTask({
    filePath: '/downloads/small-file.txt',
});

const blob = await task.startAndGetBlob();
```

---

### 2. 分片下载

适用于大文件（大于 `partFileSize`），自动分片并发下载。每个分片使用 HTTP Range 请求下载，下载完成后自动合并为完整的 Blob。

```typescript
const task = smh.createDownloadTask({
    filePath: '/downloads/large-video.mp4',
    chunkSize: 5,       // 每个分片 5MB
    parallel: 2,        // 同时下载 2 个分片
    partFileSize: 32,   // 超过 32MB 使用分片下载
});

// 监听分片完成事件
task.on('partialcomplete', (data) => {
    console.log(`分片 ${data.partInfo.part_number} 下载完成`);
});

const blob = await task.startAndGetBlob();
```

---

## 事件监听

下载任务支持多种事件监听，方便实时监控下载状态。

### 1. progress 事件

监听下载进度变化。

```typescript
task.on('progress', (data) => {
    console.log(`进度: ${data.progress.toFixed(2)}%`);
    console.log(`已下载: ${data.loaded} 字节`);
    console.log(`总大小: ${data.total} 字节`);
    console.log(`当前速度: ${data.speed} 字节/秒`);
    console.log(`剩余时间: ${data.leftTime} 秒`);
});
```

**事件数据：**
| 字段 | 类型 | 说明 |
|------|------|------|
| progress | Number | 下载进度（0-100） |
| loaded | Number | 已下载字节数 |
| total | Number | 文件总字节数 |
| speed | Number | 当前下载速度（字节/秒） |
| leftTime | Number | 预计剩余时间（秒） |

---

### 2. statechange 事件

监听任务状态变化。

```typescript
task.on('statechange', (data) => {
    console.log(`状态变化: ${data.state}`);
    
    if (data.state === 'success') {
        console.log('✓ 下载成功！');
    } else if (data.state === 'error') {
        console.error('✗ 下载失败:', data.error);
    }
});
```

**任务状态：**
| 状态 | 说明 |
|------|------|
| waiting | 等待开始 |
| start | 开始下载 |
| preparing | 准备中（获取下载 URL、初始化分片） |
| running | 下载中 |
| paused | 已暂停 |
| success | 下载成功 |
| error | 下载失败 |
| canceled | 已取消 |

---

### 3. partialcomplete 事件

监听分片下载完成（仅分片下载模式）。

```typescript
task.on('partialcomplete', (data) => {
    console.log(`分片 ${data.partInfo.part_number} 完成`);
    console.log(`分片大小: ${data.partInfo.size} 字节`);
    console.log(`分片范围: ${data.partInfo.start}-${data.partInfo.end}`);
});
```

---

## 暂停和恢复

### 暂停下载

```typescript
const task = smh.createDownloadTask({
    filePath: '/videos/large-video.mp4',
});

// 监听进度，在 30% 时暂停
task.on('progress', (data) => {
    if (data.progress >= 30 && task.state === 'running') {
        console.log('暂停下载...');
        task.pause();
    }
});

task.on('statechange', (data) => {
    if (data.state === 'paused') {
        console.log('✓ 下载已暂停');
        
        // 保存断点信息
        const checkpoint = task.getCheckpoint();
        console.log(`暂停进度: ${checkpoint.progress.toFixed(2)}%`);
    }
});

await task.start();
```

### 恢复下载

```typescript
// 方式一：直接恢复已暂停的任务
await task.start();

// 方式二：使用 checkpoint 创建新任务恢复
const checkpoint = task.getCheckpoint();

const newTask = smh.createDownloadTask({
    filePath: '/videos/large-video.mp4',
    checkpoint: checkpoint,
});

await newTask.start();
```

> **注意**：简单下载（非分片）暂停后恢复时会从头重新下载。分片下载支持真正的断点续传，已完成的分片不会重复下载。

---

## 取消下载

取消下载会清理所有已下载的分片数据并释放内存。

```typescript
const task = smh.createDownloadTask({
    filePath: '/videos/large-video.mp4',
});

// 监听进度，在 20% 时取消
let wasCanceled = false;
task.on('progress', (data) => {
    if (!wasCanceled && data.progress >= 20) {
        wasCanceled = true;
        console.log('取消下载...');
        task.cancel();
    }
});

task.on('statechange', (data) => {
    if (data.state === 'canceled') {
        console.log('✓ 下载已取消');
    }
});

await task.start();
```

---

## CRC64 数据校验

下载完成后，SDK 会自动校验文件的 CRC64 值，确保下载数据完整性：

- **简单下载**：在 `ReadableStream` 读取过程中实时计算 CRC64
- **分片下载**：每个分片分别计算 CRC64，所有分片下载完成后合并校验

如果 CRC64 校验失败，会抛出 `FILE_CRC64_MISMATCH` 错误。

---

## 获取下载结果

流式下载完成后，可以通过以下方式获取下载的 `Blob` 对象：

```typescript
// 方式一：通过 startAndGetBlob() 直接获取
const blob = await task.startAndGetBlob();

// 方式二：通过 getResult() 获取
await task.start();
const blob = task.getResult();
```

### Blob 常见用途

```typescript
const blob = await task.startAndGetBlob();

// 1. 创建预览 URL
const previewUrl = URL.createObjectURL(blob);

// 2. 转为 ArrayBuffer
const buffer = await blob.arrayBuffer();

// 3. 转为文本
const text = await blob.text();

// 4. 触发浏览器下载
const a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = 'filename.pdf';
a.click();

// 5. 创建 File 对象
const file = new File([blob], 'filename.pdf', { type: blob.type });
```

---
