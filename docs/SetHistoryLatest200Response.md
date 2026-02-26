# SetHistoryLatest200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | 文件名 | [optional] [default to undefined]
**type** | **string** | 文件类型 | [optional] [default to undefined]
**creationTime** | **string** | ISO 8601格式的日期与时间字符串，表示最新版本文件的创建时间 | [optional] [default to undefined]
**modificationTime** | **string** | ISO 8601格式的日期与时间字符串，表示最新版本文件的修改时间 | [optional] [default to undefined]
**setLatestTime** | **string** | ISO 8601格式的日期与时间字符串，表示文件被设置为最新版本的时间 | [optional] [default to undefined]
**contentType** | **string** | 媒体类型 | [optional] [default to undefined]
**size** | **number** | 最新版本的文件大小 | [optional] [default to undefined]
**eTag** | **string** | 文件 ETag | [optional] [default to undefined]
**crc64** | **string** | 文件的 CRC64-ECMA182 校验值，为了避免数字精度问题，这里为字符串格式 | [optional] [default to undefined]
**previewByDoc** | **boolean** | 是否可通过 wps 预览 | [optional] [default to undefined]
**previewByCI** | **boolean** | 是否可通过万象预览 | [optional] [default to undefined]
**previewAsIcon** | **boolean** | 是否可用预览图当做 icon | [optional] [default to undefined]
**fileType** | **string** | 文件类型，例如 excel、powerpoint 等 | [optional] [default to undefined]

## Example

```typescript
import { SetHistoryLatest200Response } from './api';

const instance: SetHistoryLatest200Response = {
    name,
    type,
    creationTime,
    modificationTime,
    setLatestTime,
    contentType,
    size,
    eTag,
    crc64,
    previewByDoc,
    previewByCI,
    previewAsIcon,
    fileType,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
