# BatchMove200ResponseResultInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **number** | 单个项目的重命名或移动结果，200-conflictResolutionStrategy 为 rename 时重命名或移动成功，204-conflictResolutionStrategy 为 ask 或 overwrite 时重命名或移动成功，403/404/409/500 等-重命名或移动失败 | [optional] [default to undefined]
**path** | **Array&lt;string&gt;** | 字符串数组，表示最终的路径，因为可能存在自动重命名，所以这里的最终路径可能不等同于重命名或移动时指定的路径 | [optional] [default to undefined]
**from** | **Array&lt;string&gt;** | 发起请求时传入的源路径的数组形式 | [optional] [default to undefined]
**to** | **Array&lt;string&gt;** | 发起请求时传入的目标路径的数组形式 | [optional] [default to undefined]

## Example

```typescript
import { BatchMove200ResponseResultInner } from './api';

const instance: BatchMove200ResponseResultInner = {
    status,
    path,
    from,
    to,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
