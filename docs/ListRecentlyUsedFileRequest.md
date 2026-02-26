# ListRecentlyUsedFileRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**marker** | **string** | 用于顺序列出分页的标识，可选参数，不传默认第一页 | [optional] [default to undefined]
**limit** | **number** | 用于顺序列出分页时本地列出的项目数限制，可选参数，不传则默认20 | [optional] [default to undefined]
**filterActionBy** | **string** | 筛选操作方式，可选，不传返回全部，preview只返回预览操作，modify返回编辑操作 | [optional] [default to undefined]
**type** | [**ListRecentlyUsedFileRequestType**](ListRecentlyUsedFileRequestType.md) |  | [optional] [default to undefined]
**withPath** | **boolean** | 是否返回文件路径，true|false，默认为false，可选参数 | [optional] [default to undefined]

## Example

```typescript
import { ListRecentlyUsedFileRequest } from './api';

const instance: ListRecentlyUsedFileRequest = {
    marker,
    limit,
    filterActionBy,
    type,
    withPath,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
