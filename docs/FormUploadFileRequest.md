# FormUploadFileRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**fullHash** | **string** | SMH 定义的文件的 fullHash 值，用于秒传，可选参数 | [optional] [default to undefined]
**beginningHash** | **string** | 文件前 1M 的 fullHash 值，用于秒传，可选参数 | [optional] [default to undefined]
**size** | **string** | 文件大小，用于秒传，size &gt;&#x3D; 1M 的文件才能实现秒传，可选参数 | [optional] [default to undefined]
**labels** | **Array&lt;string&gt;** | 文件标签列表，可选参数 | [optional] [default to undefined]
**category** | **string** | 文件自定义的分类，可选参数 | [optional] [default to undefined]
**localCreationTime** | **string** | 文件对应的本地创建时间，时间戳字符串，可选参数 | [optional] [default to undefined]
**localModificationTime** | **string** | 文件对应的本地修改时间，时间戳字符串，可选参数 | [optional] [default to undefined]

## Example

```typescript
import { FormUploadFileRequest } from './api';

const instance: FormUploadFileRequest = {
    fullHash,
    beginningHash,
    size,
    labels,
    category,
    localCreationTime,
    localModificationTime,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
