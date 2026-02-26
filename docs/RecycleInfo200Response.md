# RecycleInfo200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** | 条目类型：file-文件，仅用于文件类型媒体库 | [optional] [default to undefined]
**creationTime** | **string** | 文件创建时间或上传时间 | [optional] [default to undefined]
**modificationTime** | **string** | 文件最近一次被覆盖的时间 | [optional] [default to undefined]
**contentType** | **string** | 媒体类型 | [optional] [default to undefined]
**size** | **string** | 文件大小字符串格式 | [optional] [default to undefined]
**eTag** | **string** | 文件 ETag | [optional] [default to undefined]
**crc64** | **string** | 文件的 CRC64-ECMA182 校验值，字符串格式 | [optional] [default to undefined]
**cosUrl** | **string** | 文件访问 url | [optional] [default to undefined]
**cosUrlExpiration** | **string** | cosUrl 有效时间 | [optional] [default to undefined]
**metaData** | **{ [key: string]: string; }** | 文件元数据信息 | [optional] [default to undefined]
**previewByDoc** | **boolean** | 是否可通过 wps 预览 | [optional] [default to undefined]
**previewByCI** | **boolean** | 是否可通过万象预览 | [optional] [default to undefined]
**previewAsIcon** | **boolean** | 是否可用预览图作为 icon | [optional] [default to undefined]
**fileType** | **string** | 文件类型：excel、powerpoint 等 | [optional] [default to undefined]
**availableCosUrls** | **Array&lt;string&gt;** | 备用 cosUrl 数组 | [optional] [default to undefined]
**labels** | **Array&lt;string&gt;** | 简易文件标签列表 | [optional] [default to undefined]
**category** | **string** | 文件自定义的分类 | [optional] [default to undefined]
**localCreationTime** | **string** | 文件对应的本地创建时间 | [optional] [default to undefined]
**localModificationTime** | **string** | 文件对应的本地修改时间 | [optional] [default to undefined]

## Example

```typescript
import { RecycleInfo200Response } from './api';

const instance: RecycleInfo200Response = {
    type,
    creationTime,
    modificationTime,
    contentType,
    size,
    eTag,
    crc64,
    cosUrl,
    cosUrlExpiration,
    metaData,
    previewByDoc,
    previewByCI,
    previewAsIcon,
    fileType,
    availableCosUrls,
    labels,
    category,
    localCreationTime,
    localModificationTime,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
