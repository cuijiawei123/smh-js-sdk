# SearchMore200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**searchId** | **string** | 搜索任务 ID，用于异步获取搜索结果 | [optional] [default to undefined]
**searchFinished** | **boolean** | 搜索是否已完成 | [optional] [default to undefined]
**hasMore** | **boolean** | 是否有更多搜索结果 | [optional] [default to undefined]
**nextMarker** | **number** | 用于获取后续页的分页标识，仅当 hasMore 为 true 时才返回该字段 | [optional] [default to undefined]
**contents** | [**Array&lt;CreateSearch200ResponseContentsInner&gt;**](CreateSearch200ResponseContentsInner.md) | 搜索结果，可能为空数组 | [optional] [default to undefined]

## Example

```typescript
import { SearchMore200Response } from './api';

const instance: SearchMore200Response = {
    searchId,
    searchFinished,
    hasMore,
    nextMarker,
    contents,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
