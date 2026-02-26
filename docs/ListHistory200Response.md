# ListHistory200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**totalNum** | **number** | 历史版本总数，采用 page 模式才会返回该字段 | [optional] [default to undefined]
**hasMore** | **boolean** | 是否有更多搜索结果 | [optional] [default to undefined]
**nextMarker** | **string** | 用于获取后续页的分页标识，仅当 hasMore 为 true 时才返回该字段 | [optional] [default to undefined]
**contents** | [**Array&lt;ListHistory200ResponseContentsInner&gt;**](ListHistory200ResponseContentsInner.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ListHistory200Response } from './api';

const instance: ListHistory200Response = {
    totalNum,
    hasMore,
    nextMarker,
    contents,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
