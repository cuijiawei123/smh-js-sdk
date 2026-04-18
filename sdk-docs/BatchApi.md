# 批量操作

本文介绍实现批量操作功能的示例代码和描述。包括批量复制、批量移动和批量删除三个部分。

## 注意事项

- 若您使用批量复制或批量移动，需要具有源文件的读权限和目标位置的写权限。
- 若您使用批量删除，需要具有目标文件或目录的删除权限。
- 批量操作不保证事务性，部分操作可能成功，部分操作可能失败。


## 前期准备

开始操作前，确保您已经完成了 SDK 初始化。

---

## 批量复制

### 功能说明

batchCopy 实现批量复制目录或文件到指定位置，支持设置冲突解决策略。当操作数量较多或文件较大时，系统会返回异步任务 ID，需要通过任务 ID 查询任务状态。

### 使用示例

```typescript
const res = await smh.batch.batchCopy({
    spaceId: 'space-id-1',
    copy: 1,
    batchCopyRequest: [
        {
            copyFrom: '/source/xxx',
            to: '/dest/xxx',
            conflictResolutionStrategy: 'rename'
        },
        {
            copyFrom: '/source/xxx',
            to: '/dest/xxx',
            conflictResolutionStrategy: 'overwrite'
        }
    ],
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('批量复制成功', res.data);
} else if (res.status === 202) {
    console.log('异步任务已创建，任务ID:', res.data.taskId);
} else if (res.status === 207) {
    console.log('部分操作失败', res.data);
}
```

### 参数说明

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | String | 是 |
| copy | 开启批量复制操作，固定值为 1 | Number | 是 |
| batchCopyRequest | 批量复制请求数组 | Array | 是 |
| userId | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份 | String | 否 |

**batchCopyRequest 数组元素说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| copyFrom | 源文件或目录路径 | String | 是 |
| to | 目标文件或目录路径 | String | 是 |
| conflictResolutionStrategy | 冲突解决策略，可选值：`rename`（重命名）、`overwrite`（覆盖）、`ask`（询问）。默认为 `ask` | String | 否 |

---

## 批量移动

### 功能说明

batchMove 实现批量移动或重命名目录或文件，支持设置冲突解决策略。当操作数量较多或文件较大时，系统会返回异步任务 ID，需要通过任务 ID 查询任务状态。

### 使用示例

```typescript
const res = await smh.batch.batchMove({
    spaceId: 'space-id-1',
    move: 1,
    batchMoveRequest: [
        {
            from: '/source/xxx',
            to: '/dest/xxx',
            conflictResolutionStrategy: 'rename'
        },
        {
            from: '/source/xxx',
            to: '/dest/xxx',
            conflictResolutionStrategy: 'overwrite'
        }
    ],
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('批量移动成功', res.data);
} else if (res.status === 202) {
    console.log('异步任务已创建，任务ID:', res.data.taskId);
} else if (res.status === 207) {
    console.log('部分操作失败', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | String | 是 |
| move | 开启批量移动操作，固定值为 1 | Number | 是 |
| batchMoveRequest | 批量移动请求数组 | Array | 是 |
| userId | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份 | String | 否 |

**batchMoveRequest 数组元素说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| from | 源文件或目录路径 | String | 是 |
| to | 目标文件或目录路径 | String | 是 |
| conflictResolutionStrategy | 冲突解决策略，可选值：`rename`（重命名）、`overwrite`（覆盖）、`ask`（询问）。默认为 `ask` | String | 否 |

---

## 批量删除

### 功能说明

batchDelete 实现批量删除目录或文件，支持永久删除或移至回收站。当操作数量较多或文件较大时，系统会返回异步任务 ID，需要通过任务 ID 查询任务状态。

### 使用示例

```typescript
const res = await smh.batch.batchDelete({
    spaceId: 'space-id-1',
    _delete: 1,
    batchDeleteRequest: [
        { path: '/test/xxx' },
        { path: '/test/xxx', permanent: true },
        { path: '/test/xxx' }
    ],
    userId: 'xxx'
});

if (res.status === 200) {
    console.log('批量删除成功', res.data);
} else if (res.status === 202) {
    console.log('异步任务已创建，任务ID:', res.data.taskId);
} else if (res.status === 207) {
    console.log('部分操作失败', res.data);
}
```

### 参数说明

| 参数名 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| spaceId | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | String | 是 |
| _delete | 开启批量删除操作，固定值为 1 | Number | 是 |
| batchDeleteRequest | 批量删除请求数组 | Array | 是 |
| userId | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份 | String | 否 |

**batchDeleteRequest 数组元素说明**

| 字段 | 参数描述 | 类型 | 是否必填 |
|--------|----------|------|----------|
| path | 要删除的文件或目录路径 | String | 是 |
| permanent | 是否永久删除，`true` 表示永久删除，`false` 表示移至回收站。默认为 `false` | Boolean | 否 |

---
