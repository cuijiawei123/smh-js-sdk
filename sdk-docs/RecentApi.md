# 最近使用文件

本文介绍获取最近使用文件功能的示例代码和描述。

## 注意事项

- 若您使用获取最近使用文件功能，需要具有空间的读权限。

## 前期准备

开始操作前，确保您已经完成了 [SDK 初始化](./Started.md)。

---

## 获取最近使用文件

### 功能说明

listRecentlyUsedFile 实现获取用户最近使用的文件列表，支持按操作类型、文件类型等条件进行过滤，并可选择是否返回文件完整路径。

### 使用示例

```typescript
const res = await smh.recent.listRecentlyUsedFile({
    spaceId: 'your-space-id',
    listRecentlyUsedFileRequest: {
        marker: 'xxx',
        limit: 20,
        filterActionBy: 'preview',
        type: ['pdf', 'word'],
        withPath: true
    }
});

if (res.status === 200) {
    console.log('获取最近使用文件成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| listRecentlyUsedFileRequest | 获取最近使用文件请求对象 | Object | 是 |

**listRecentlyUsedFileRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| marker | 用于顺序列出分页的标识，不传默认第一页 | String | 否 |
| limit | 用于顺序列出分页时本地列出的项目数限制，不传则默认 20 | Number | 否 |
| filterActionBy | 筛选操作方式，不传返回全部。可选值：`preview`（只返回预览操作）、`modify`（返回编辑操作） | String | 否 |
| type | 筛选文件类型，字符串或字符串数组 | String/Array | 否 |
| withPath | 是否返回文件的完整路径信息，默认为 false | Boolean | 否 |

---

## 文件类型说明（type 参数）

### 预定义类型

| 类型值 | 描述 | 包含的文件扩展名 |
|--------|------|------------------|
| all | 搜索所有文件（默认值） | 所有文件类型 |
| document | 搜索所有文档 | pdf、powerpoint、excel、word、text 类型 |
| pdf | 仅搜索 PDF 文档 | .pdf |
| powerpoint | 仅搜索演示文稿 | .ppt、.pptx、.pot、.potx 等 |
| excel | 仅搜索表格文件 | .xls、.xlsx、.ett、.xltx、.csv 等 |
| word | 仅搜索文档 | .doc、.docx、.dot、.wps、.wpt 等 |
| text | 仅搜索纯文本 | .txt、.asp、.htm 等 |

### 使用示例

```typescript
// 使用预定义类型
type: 'document'

// 使用预定义类型数组
type: ['pdf', 'word', 'excel']

// 使用文件扩展名数组
type: ['.pdf', '.doc', '.xlsx']
```

---

## 返回值说明

**HTTP 状态码：200**

请求成功，返回最近使用文件列表。

**响应示例**

```json
{
  "nextMarker": "xxx",
  "contents": [
    {
      "name": "文档.docx",
      "spaceId": "space-id-1",
      "inode": "xxxxx",
      "size": "2048576",
      "actionType": "preview",
      "operationTime": "2025-12-03T10:30:00Z",
      "creationTime": "2025-12-01T08:00:00Z",
      "crc64": "xxxxxx",
      "path": ["folder1", "文档.doc"]
    }
  ]
}
```

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| nextMarker | 用于顺序列出分页的标识 | String |
| contents | 最近使用文件列表 | Array |

**contents 数组元素说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| name | 文件名 | String |
| spaceId | 空间 ID | String |
| inode | 文件 ID | String |
| size | 文件大小（字节），字符串格式 | String |
| actionType | 操作类型：preview、modify | String |
| operationTime | 加入最近使用文件列表的时间 | String |
| creationTime | 文件的上传时间 | String |
| crc64 | 文件的 CRC64-ECMA182 校验值 | String |
| path | 文件路径，仅当 withPath 为 true 时返回 | Array |

---
