# BatchDelete200ResponseResultInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **number** | 单个项目的删除结果，200-移入回收站成功，204-永久删除成功，403/404/500 等-删除失败 | [optional] [default to undefined]
**recycledItemId** | **number** | 回收站项目 ID，用于从回收站永久删除或恢复指定项目 | [optional] [default to undefined]
**path** | **Array&lt;string&gt;** | 发起请求时传入的对应路径的数组形式 | [optional] [default to undefined]

## Example

```typescript
import { BatchDelete200ResponseResultInner } from './api';

const instance: BatchDelete200ResponseResultInner = {
    status,
    recycledItemId,
    path,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
