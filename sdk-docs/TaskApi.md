# 任务管理

本文介绍任务管理功能的示例代码和描述。包括查询任务和查询媒体库任务两个部分。

## 注意事项

- 仅能查询到任务结束时间在最近 30 天的任务，更早期的任务无法查询。

## 前期准备

开始操作前，确保您已经完成了 [SDK 初始化](./Started.md)。

---

## 查询任务

### 功能说明

queryTask 实现查询任务，用于查询指定空间下的耗时任务执行情况。支持查询单个或多个任务的状态和结果。

### 使用示例

```typescript
// 查询单个任务
const res = await smh.task.queryTask({
    spaceId: 'your-space-id',
    taskIdList: '6927125',
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('任务查询成功', res.data);
}

// 查询多个任务
const res2 = await smh.task.queryTask({
    spaceId: 'your-space-id',
    taskIdList: '10,12,13',
    userId: 'xxx'
});
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID | String | 是 |
| taskIdList | 任务 ID 列表，用逗号分隔 | String | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回任务状态列表。

**响应字段说明**

响应体为数组，每个元素包含以下字段：

| 字段 | 说明 | 类型 |
|------|------|------|
| taskId | 任务 ID | Number |
| status | 任务状态码，202: 进行中，200: 成功有结果，204: 成功无结果，500: 失败 | Number |
| result | 任务成功完成后的返回结果，仅当 status 为 200 时存在 | Object |

---

## 查询媒体库任务

### 功能说明

queryLibraryTask 实现查询媒体库任务，用于查询媒体库级别的耗时任务执行情况。

### 使用示例

```typescript
const res = await smh.task.queryLibraryTask({
    taskIdList: '6927125',
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('媒体库任务查询成功', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| taskIdList | 任务 ID 列表，用逗号分隔 | String | 是 |
| userId | 用户身份识别 | String | 否 |

### 返回值说明

**HTTP 状态码：200**

获取成功，返回任务状态列表（格式同查询任务）。

---

## 任务状态说明

| 状态码 | 说明 | 是否完成 |
|--------|------|----------|
| 202 | 任务进行中 | 否 |
| 200 | 任务成功完成且有返回结果 | 是 |
| 204 | 任务成功完成且无返回结果 | 是 |
| 500 | 任务执行失败 | 是 |

---
