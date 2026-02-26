# GetFileInfoByInode200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**path** | **Array&lt;string&gt;** | 字符串数组，文件目录路径 | [optional] [default to undefined]
**name** | **string** | 字符串，文件目录名称 | [optional] [default to undefined]
**type** | **string** | 字符串，文件目录类型：dir-目录或相簿；file-文件，仅用于文件类型媒体库 | [optional] [default to undefined]
**creationTime** | **string** | 文件目录创建时间 | [optional] [default to undefined]
**modificationTime** | **string** | 文件最近一次被覆盖的时间，或者目录内最近一次增删子目录或文件的时间 | [optional] [default to undefined]
**contentType** | **string** | 媒体类型（仅非目录或相簿返回） | [optional] [default to undefined]
**size** | **string** | 文件目录大小（仅非目录或相簿返回） | [optional] [default to undefined]
**crc64** | **string** | 文件的 CRC64-ECMA182 校验值，为了避免数字精度问题，这里为字符串格式（仅非目录或相簿返回） | [optional] [default to undefined]

## Example

```typescript
import { GetFileInfoByInode200Response } from './api';

const instance: GetFileInfoByInode200Response = {
    path,
    name,
    type,
    creationTime,
    modificationTime,
    contentType,
    size,
    crc64,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
