# BatchCopyRequestInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**copyFromSpaceId** | **string** | 跨空间复制时指定源空间ID | [optional] [default to undefined]
**copyFrom** | **string** | 被复制的源目录、相簿或文件路径 | [default to undefined]
**to** | **string** | 目标目录、相簿或文件路径 | [default to undefined]
**conflictResolutionStrategy** | **string** | 冲突处理方式 | [optional] [default to undefined]

## Example

```typescript
import { BatchCopyRequestInner } from './api';

const instance: BatchCopyRequestInner = {
    copyFromSpaceId,
    copyFrom,
    to,
    conflictResolutionStrategy,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
