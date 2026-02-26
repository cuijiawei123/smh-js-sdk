# RecycleRestoreBatch200ResponseResultInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **number** | 200：恢复成功，其他：恢复失败 | [optional] [default to undefined]
**path** | **Array&lt;string&gt;** | 表示最终的文件路径 | [optional] [default to undefined]
**recycledItemId** | **number** | 发起请求时传入的回收站项目 ID | [optional] [default to undefined]

## Example

```typescript
import { RecycleRestoreBatch200ResponseResultInner } from './api';

const instance: RecycleRestoreBatch200ResponseResultInner = {
    status,
    path,
    recycledItemId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
