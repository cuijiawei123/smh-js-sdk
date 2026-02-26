# BatchMoveRequestInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**fromSpaceId** | **string** | 跨空间移动时指定源空间ID | [optional] [default to undefined]
**from** | **string** | 被重命名或移动的源目录、相簿或文件路径 | [default to undefined]
**to** | **string** | 目标目录、相簿或文件路径 | [default to undefined]
**conflictResolutionStrategy** | **string** | 冲突处理方式；当目标为空间存在历史版本时，不支持移动覆盖 | [optional] [default to undefined]

## Example

```typescript
import { BatchMoveRequestInner } from './api';

const instance: BatchMoveRequestInner = {
    fromSpaceId,
    from,
    to,
    conflictResolutionStrategy,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
