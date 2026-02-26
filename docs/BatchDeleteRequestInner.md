# BatchDeleteRequestInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**path** | **string** | 被删除的目录、相簿或文件路径 | [default to undefined]
**permanent** | **boolean** | 当开启回收站时，指定移入回收站或永久删除，默认 false | [optional] [default to undefined]

## Example

```typescript
import { BatchDeleteRequestInner } from './api';

const instance: BatchDeleteRequestInner = {
    path,
    permanent,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
