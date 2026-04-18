# 空间管理

本文介绍空间管理功能的示例代码和描述。包括创建租户空间、列出租户空间、查询空间属性、修改空间属性、列出空间首页内容、空间文件数量统计、删除租户空间、查询媒体库空间数量、查询空间大小和设置空间限速等功能。

## 注意事项

- 创建租户空间需要 admin 或 create_space 权限。
- 列出所有租户空间需要 admin 或 space_admin 权限，否则仅列出当前访问令牌所代表的用户所创建的租户空间。
- 修改租户空间属性需要 admin 或 space_admin 权限（非 acl 鉴权）。
- 删除租户空间需要 admin 或 delete_space 权限。

## 前期准备

开始操作前，确保您已经完成了 [SDK 初始化](./Started.md)。

---

## 创建租户空间

### 功能说明

createSpace 实现创建租户空间。可以设置空间的公有读属性、多相簿模式、允许上传的文件类型、敏感内容检测等扩展属性。

### 使用示例

```typescript
const res = await smh.space.createSpace({
    userId: 'user-id',
    createSpaceRequest: {
        isMultiAlbum: true,
        allowPhoto: true,
        allowVideo: true,
        allowPhotoExtname: ['.jpg', '.png', '.gif'],
        allowVideoExtname: ['.mp4', '.mov'],
        recognizeSensitiveContent: true
    }
});

if (res.status === 201) {
    console.log('空间创建成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| userId | 用户身份识别 | String | 否 |
| createSpaceRequest | 租户空间的扩展属性 | Object | 否 |

**createSpaceRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| isPublicRead | 是否为公有读，默认 false | Boolean | 否 |
| isMultiAlbum | 是否为多相簿空间，默认 false | Boolean | 否 |
| allowPhoto | 是否允许上传照片，默认 false | Boolean | 否 |
| allowVideo | 是否允许上传视频，默认 false | Boolean | 否 |
| allowPhotoExtname | 允许上传的照片扩展名列表 | Array | 否 |
| allowVideoExtname | 允许上传的视频扩展名列表 | Array | 否 |
| recognizeSensitiveContent | 是否检测敏感内容，默认 false | Boolean | 否 |
| spaceTag | 空间标识 | String | 否 |

### 返回值说明

**HTTP 状态码：201**

创建成功。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| spaceId | 新创建的租户空间的空间 ID | String |

---

## 列出租户空间

### 功能说明

listSpace 实现列出租户空间列表信息。支持分页查询。

### 使用示例

```typescript
const res = await smh.space.listSpace({
    marker: 'next-page-marker',
    limit: 50
});

if (res.status === 200) {
    console.log('空间列表', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| marker | 用于顺序列出分页的标识 | String | 否 |
| limit | 用于顺序列出分页时本地列出的项目数限制 | Number | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| list | 租户空间列表 | Array |
| marker | 用于顺序列出分页的标识 | String |

---

## 查询租户空间属性

### 功能说明

getSpaceExtension 实现查询租户空间的扩展属性。

### 使用示例

```typescript
const res = await smh.space.getSpaceExtension({
    spaceId: 'your-space-id'
});

if (res.status === 200) {
    console.log('空间属性', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回空间扩展属性（isPublicRead、allowPhoto、allowVideo 等）。

---

## 修改租户空间属性

### 功能说明

updateSpaceExtension 实现修改租户空间属性。需要 admin 或 space_admin 权限。

### 使用示例

```typescript
const res = await smh.space.updateSpaceExtension({
    spaceId: 'your-space-id',
    updateSpaceExtensionRequest: {
        isPublicRead: true,
        allowPhoto: true,
        allowVideo: true,
        allowPhotoExtname: ['.jpg', '.png', '.heic'],
        allowVideoExtname: ['.mp4', '.mov', '.avi']
    }
});

if (res.status === 204) {
    console.log('空间属性修改成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| userId | 用户身份识别 | String | 否 |
| updateSpaceExtensionRequest | 租户空间的扩展属性 | Object | 是 |

**updateSpaceExtensionRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| isPublicRead | 是否为公有读 | Boolean | 否 |
| allowPhoto | 是否允许上传照片（媒体类型媒体库） | Boolean | 否 |
| allowVideo | 是否允许上传视频（媒体类型媒体库） | Boolean | 否 |
| allowPhotoExtname | 允许的照片扩展名（媒体类型媒体库） | Array | 否 |
| allowVideoExtname | 允许的视频扩展名（媒体类型媒体库） | Array | 否 |
| allowFileExtname | 允许的文件扩展名（非媒体类型媒体库） | Array | 否 |
| recognizeSensitiveContent | 是否检测敏感内容 | Boolean | 否 |

### 返回值说明

**HTTP 状态码：204**

修改成功，无响应体。

---

## 列出空间首页内容

### 功能说明

getContentsView 实现列出空间首页内容，会忽略目录的层级关系，列出空间下所有文件。

### 使用示例

```typescript
const res = await smh.space.getContentsView({
    spaceId: 'your-space-id',
    filter: 'onlyFile',
    orderBy: 'modificationTime',
    orderByType: 'desc',
    withPath: true
});

if (res.status === 200) {
    console.log('空间内容', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| filter | 筛选方式：onlyDir、onlyFile | String | 是 |
| marker | 用于顺序列出分页的标识 | String | 否 |
| limit | 分页限制 | Number | 否 |
| orderBy | 排序字段：name、modificationTime、size、creationTime 等 | String | 否 |
| orderByType | 排序方式：asc、desc | String | 否 |
| withPath | 是否返回 path，默认 false | Boolean | 否 |
| userId | 用户身份识别 | String | 否 |
| category | 文件自定义分类 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回 nextMarker 和 contents 数组。

---

## 空间文件数量统计

### 功能说明

getFileCountInSpace 实现空间文件数量统计。需要 admin 或 space_admin 权限。

### 使用示例

```typescript
const res = await smh.space.getFileCountInSpace({
    spaceId: 'your-space-id'
});

if (res.status === 200) {
    console.log('文件统计', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |

### 返回值说明

**HTTP 状态码：200**

获取成功。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| fileNum | 总文件数量，字符串格式 | String |
| dirNum | 总文件夹数量，字符串格式 | String |
| recycledFileNum | 回收站文件数量，字符串格式 | String |
| recycledDirNum | 回收站文件夹数量，字符串格式 | String |
| historyFileNum | 历史版本文件数量，字符串格式 | String |

---

## 删除租户空间

### 功能说明

deleteSpace 实现删除租户空间。需要 admin 或 delete_space 权限。

### 使用示例

```typescript
const res = await smh.space.deleteSpace({
    spaceId: 'your-space-id',
    force: 1
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| userId | 用户身份识别 | String | 否 |
| force | 是否强制删除，0: 非强制（默认），1: 强制 | Number | 否 |

### 返回值说明

**HTTP 状态码：204**

删除成功，无响应体。

---

## 查询媒体库租户空间数量

### 功能说明

getLibrarySpaceCount 实现查询媒体库中的租户空间数量。

### 使用示例

```typescript
const res = await smh.space.getLibrarySpaceCount({});

if (res.status === 200) {
    console.log('空间数量:', res.data.total);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| total | 租户空间数量 | Number |

---

## 查询租户空间大小

### 功能说明

getSpaceSize 实现查询租户空间大小。

### 使用示例

```typescript
const res = await smh.space.getSpaceSize({
    spaceId: 'your-space-id'
});

if (res.status === 200) {
    console.log('占用空间:', res.data.size, '字节');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| size | 租户空间大小（单位：字节），字符串格式 | String |

---

## 设置租户空间限速

### 功能说明

setSpaceTrafficLimit 实现设置租户空间的下载限速。需要 admin 或 space_admin 权限。

### 使用示例

```typescript
// 设置下载限速为 1MB/s
const res = await smh.space.setSpaceTrafficLimit({
    spaceId: 'your-space-id',
    setSpaceTrafficLimitRequest: {
        downloadTrafficLimit: 1048576
    }
});

if (res.status === 204) {
    console.log('限速设置成功');
}

// 取消限速
const res2 = await smh.space.setSpaceTrafficLimit({
    spaceId: 'your-space-id',
    setSpaceTrafficLimitRequest: {
        downloadTrafficLimit: -1
    }
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| setSpaceTrafficLimitRequest | 限速设置对象 | Object | 是 |

**setSpaceTrafficLimitRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| downloadTrafficLimit | 空间下载限速，范围 100KB/s-100MB/s，单位字节，-1 表示取消限速 | Number | 是 |

### 返回值说明

**HTTP 状态码：204**

修改成功，无响应体。

---
