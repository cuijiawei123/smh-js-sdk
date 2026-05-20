# 配额管理

本文介绍配额管理功能的示例代码和描述。包括创建配额、获取租户空间配额、获取租户空间配额（按空间查询）、获取租户配额信息、修改配额和根据配额 ID 修改配额六个部分。

## 注意事项

- 配额与租户空间是一对多的关系，即多个租户空间可以共享同一个配额，但每个租户空间只能设置一个配额。
- 当在配置了配额的租户空间中上传即将超过配额的文件时，会返回 QuotaLimitReached 错误码。
- 租户空间的剩余空间非实时更新，当系统负荷较高时可能会有比较大的更新延时，进而可能导致意外超出配额。
- 如果配置了超额自动删除选项，可能导致旧文件被删除。

## 前期准备

开始操作前，确保您已经完成了 [SDK 初始化](./Started.md)。

---

## 创建配额

### 功能说明

createQuota 实现创建配额，用于为租户空间设置存储配额限制。支持为多个租户空间设置共享配额，并可配置超额自动删除策略。

### 使用示例

```typescript
// 基础创建配额
const res = await smh.quota.createQuota({
    userId: 'xxx',
    createQuotaRequest: {
        spaces: ['space-id-1'],
        capacity: '1099511627776',
        removeWhenExceed: true,
        removeAfterDays: 30,
        removeNewest: false
    }
});

if (res.status === 201) {
    console.log('配额创建成功', res.data);
    console.log('配额 ID:', res.data.quotaId);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| userId | 用户身份识别 | String | 否 |
| createQuotaRequest | 创建配额请求对象 | Object | 是 |

**createQuotaRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaces | 对于多租户空间媒体库，指定配额所涵盖的租户空间 | Array | 否 |
| capacity | 配额的具体值，单位为字节（Byte），建议指定为字符串形式 | String | 否 |
| removeWhenExceed | 超限时是否自动删除文件 | Boolean | 是 |
| removeAfterDays | 存储量超限后在进行文件删除前等待的天数 | Number | 是 |
| removeNewest | 是否从最新的文件开始删除，默认为 false | Boolean | 否 |

### 返回值说明

**HTTP 状态码：201**

创建成功，返回配额 ID。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| quotaId | 配额 ID | Number |

---

## 获取租户空间配额

> ⚠️ **即将下线**：`getQuota` 接口计划下线，建议使用 `getSpaceQuota` 替代。

### 功能说明

getQuota 实现获取租户空间配额，用于查询指定租户空间的配额信息。

### 使用示例

```typescript
const res = await smh.quota.getQuota({
    spaceId: 'your-space-id',
    userId: 'xxx',
});

if (res.status === 200) {
    console.log('配额信息获取成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回配额信息。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| id | 配额 ID | Number |
| capacity | 配额的具体值，单位为字节（Byte），字符串格式 | String |

---

## 获取租户空间配额（按空间查询）

### 功能说明

getSpaceQuota 实现获取指定空间的配额信息，用于查询指定空间的配额详情。与 getQuota 类似，但使用独立的接口路径。

### 使用示例

```typescript
const res = await smh.quota.getSpaceQuota({
    spaceId: 'your-space-id',
    userId: 'xxx',
});

if (res.status === 200) {
    console.log('空间配额信息获取成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | String | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回配额信息。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| id | 配额 ID | Number |
| capacity | 配额的具体值，单位为字节（Byte），字符串格式 | String |

---

## 获取租户配额信息

### 功能说明

getQuotaInfo 实现获取租户配额信息，用于根据配额 ID 查询配额的详细信息。

### 使用示例

```typescript
const res = await smh.quota.getQuotaInfo({
    quotaId: '602'
});

if (res.status === 200) {
    console.log('配额详细信息获取成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| quotaId | 配额 ID | String | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回配额详细信息。

**响应字段说明**

| 字段 | 说明 | 类型 |
|------|------|------|
| spaces | 配额所使用的空间 ID 集合 | Array |
| capacity | 配额的具体值，单位为字节（Byte），字符串格式 | String |

---

## 修改配额

### 功能说明

updateQuota 实现修改配额，用于修改指定租户空间的配额设置。

### 使用示例

```typescript
const res = await smh.quota.updateQuota({
    spaceId: 'your-space-id',
    updateQuotaRequest: {
        capacity: '10995116277760',
        removeWhenExceed: true,
        removeAfterDays: 30,
        removeNewest: false
    }
});

if (res.status === 204) {
    console.log('配额修改成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| userId | 用户身份识别 | String | 否 |
| updateQuotaRequest | 修改配额请求对象 | Object | 是 |

**updateQuotaRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| capacity | 配额的具体值，单位为字节（Byte），建议指定为字符串形式 | String | 是 |
| removeWhenExceed | 超限时是否自动删除文件，默认为 false | Boolean | 否 |
| removeAfterDays | 存储量超限后在进行文件删除前等待的天数 | Number | 否 |
| removeNewest | 是否从最新的文件开始删除，默认为 false | Boolean | 否 |

### 返回值说明

**HTTP 状态码：204**

修改成功，无响应体。

---

## 根据配额 ID 修改配额

### 功能说明

updateQuotaById 实现根据配额 ID 修改配额，用于修改指定配额的设置。

### 使用示例

```typescript
const res = await smh.quota.updateQuotaById({
    quotaId: '602',
    updateQuotaByIdRequest: {
        capacity: '1099511627776',
        removeWhenExceed: true,
        removeAfterDays: 30,
        removeNewest: false
    }
});

if (res.status === 204) {
    console.log('配额修改成功');
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| quotaId | 配额 ID | String | 是 |
| userId | 用户身份识别 | String | 否 |
| updateQuotaByIdRequest | 修改配额请求对象 | Object | 是 |

**updateQuotaByIdRequest 对象说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaces | 配额所涵盖的租户空间（多租户空间媒体库） | Array | 否 |
| capacity | 配额的具体值，单位为字节（Byte），建议指定为字符串形式 | String | 否 |
| removeWhenExceed | 超限时是否自动删除文件，默认为 false | Boolean | 否 |
| removeAfterDays | 存储量超限后在进行文件删除前等待的天数 | Number | 否 |
| removeNewest | 是否从最新的文件开始删除，默认为 false | Boolean | 否 |

### 返回值说明

**HTTP 状态码：204**

修改成功，无响应体。

---
