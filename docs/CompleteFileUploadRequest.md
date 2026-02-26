# CompleteFileUploadRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**crc64** | **string** | 文件的 CRC64-ECMA182 校验值，为字符串格式；指定则进行校验，校验失败返回 400 BadCrc64 | [optional] [default to undefined]
**labels** | **Array&lt;string&gt;** | 文件标签列表，可选参数 | [optional] [default to undefined]
**category** | **string** | 文件自定义的分类，可选参数 | [optional] [default to undefined]
**localCreationTime** | **string** | 文件对应的本地创建时间，时间戳字符串，可选参数 | [optional] [default to undefined]
**localModificationTime** | **string** | 文件对应的本地修改时间，时间戳字符串，可选参数 | [optional] [default to undefined]

## Example

```typescript
import { CompleteFileUploadRequest } from './api';

const instance: CompleteFileUploadRequest = {
    crc64,
    labels,
    category,
    localCreationTime,
    localModificationTime,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
