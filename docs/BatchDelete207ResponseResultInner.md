# BatchDelete207ResponseResultInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **number** | 单个项目的删除结果，200-移入回收站成功，204-永久删除成功，403/404/500 等-删除失败 | [optional] [default to undefined]
**recycledItemId** | **number** |  | [optional] [default to undefined]
**path** | **Array&lt;string&gt;** | 发起请求时传入的对应路径的数组形式 | [optional] [default to undefined]

## Example

```typescript
import { BatchDelete207ResponseResultInner } from './api';

const instance: BatchDelete207ResponseResultInner = {
    status,
    recycledItemId,
    path,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
