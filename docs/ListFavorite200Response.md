# ListFavorite200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**nextMarker** | **string** | 用于顺序列出分页的标识，仅当使用marker、limit方式分页且当前不为最后一页时会返回 | [optional] [default to undefined]
**totalNum** | **number** | 收藏文件目录的总数，仅当使用page、pageSize方式分页时会返回 | [optional] [default to undefined]
**contents** | [**Array&lt;ListFavorite200ResponseContentsInner&gt;**](ListFavorite200ResponseContentsInner.md) | 收藏的文件目录集合 | [optional] [default to undefined]

## Example

```typescript
import { ListFavorite200Response } from './api';

const instance: ListFavorite200Response = {
    nextMarker,
    totalNum,
    contents,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
