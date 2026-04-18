# 容量查询

本文介绍查询空间容量和媒体库容量功能的示例代码和描述。包括批量查询空间容量信息和查询媒体库容量信息两个部分。

## 注意事项

- 若您使用容量查询功能，需要具有相应空间或媒体库的读权限。
- 查询空间容量时，可以同时查询多个空间的容量信息。

## 前期准备

开始操作前，确保您已经完成了 [SDK 初始化](./Started.md)。

---

## 批量查询空间容量信息

### 功能说明

getUsage 实现批量查询一个或多个租户空间的容量信息，包括空间配额、可用容量和已使用容量等。

### 使用示例

```typescript
const res = await smh.usage.getUsage({
    spaceIds: 'space-id-1,space-id-2',
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('获取空间容量信息成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceIds | 空间 ID，多个空间 ID 用英文逗号分隔 | String | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

请求成功，返回空间容量信息数组。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| spaceId | 租户空间 ID | String |
| capacity | 租户空间配额（单位：字节），null 表示无配额限制 | String或null |
| availableSpace | 租户空间可用容量（单位：字节），null 表示无配额限制 | String或null |
| size | 租户空间已上传文件占用的存储额度（单位：字节） | String |

---

## 查询媒体库容量信息

### 功能说明

getLibraryUsage 实现查询整个媒体库的容量信息。

### 使用示例

```typescript
const res = await smh.usage.getLibraryUsage({
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('获取媒体库容量信息成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

请求成功，返回媒体库容量信息。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| totalFileSize | 媒体库中所有文件占用的存储额度（单位：字节） | String |

---
