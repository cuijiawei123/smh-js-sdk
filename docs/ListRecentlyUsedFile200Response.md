# ListRecentlyUsedFile200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**nextMarker** | **string** | 用于顺序列出分页的标识，仅当不为最后一页时会返回该字段 | [optional] [default to undefined]
**contents** | [**Array&lt;ListRecentlyUsedFile200ResponseContentsInner&gt;**](ListRecentlyUsedFile200ResponseContentsInner.md) | 最近使用文件列表的具体内容 | [optional] [default to undefined]

## Example

```typescript
import { ListRecentlyUsedFile200Response } from './api';

const instance: ListRecentlyUsedFile200Response = {
    nextMarker,
    contents,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
