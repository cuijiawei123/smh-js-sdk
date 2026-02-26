# ListDirectory200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**path** | **Array&lt;string&gt;** | 返回当前请求的目录结构，如果当前请求的是根目录，则该字段为空数组 | [optional] [default to undefined]
**fileCount** | **number** | 当前目录中的文件数（不包含孙子级） | [optional] [default to undefined]
**subDirCount** | **number** | 当前目录中的子目录数（不包含孙子级） | [optional] [default to undefined]
**totalNum** | **number** | 当前目录中的所有文件和子目录数量（不包含孙子级） | [optional] [default to undefined]
**nextMarker** | [**ListDirectory200ResponseNextMarker**](ListDirectory200ResponseNextMarker.md) |  | [optional] [default to undefined]
**contents** | [**Array&lt;ListDirectory200ResponseContentsInner&gt;**](ListDirectory200ResponseContentsInner.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ListDirectory200Response } from './api';

const instance: ListDirectory200Response = {
    path,
    fileCount,
    subDirCount,
    totalNum,
    nextMarker,
    contents,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
