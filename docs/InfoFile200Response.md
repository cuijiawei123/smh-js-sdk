# InfoFile200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**cosUrl** | **string** | 带签名的下载链接，签名有效时长约 2 小时，需在签名有效期内发起下载 | [optional] [default to undefined]
**type** | **string** | 文件类型 | [optional] [default to undefined]
**creationTime** | **string** | 文件首次完成上传的时间 | [optional] [default to undefined]
**modificationTime** | **string** | 文件最近一次被覆盖的时间 | [optional] [default to undefined]
**contentType** | **string** | 媒体类型 | [optional] [default to undefined]
**size** | **string** | 文件大小，为了避免数字精度问题，这里为字符串格式 | [optional] [default to undefined]
**eTag** | **string** | 文件 ETag | [optional] [default to undefined]
**crc64** | **string** | 文件的 CRC64-ECMA182 校验值，为了避免数字精度问题，这里为字符串格式 | [optional] [default to undefined]
**fileType** | **string** | 文件类型：excel、powerpoint 等 | [optional] [default to undefined]
**previewByDoc** | **boolean** | 是否可通过 wps 预览 | [optional] [default to undefined]
**previewByCI** | **boolean** | 是否可通过万象预览 | [optional] [default to undefined]
**previewAsIcon** | **boolean** | 是否可用预览图当做 icon | [optional] [default to undefined]
**metaData** | **{ [key: string]: string; }** | 元数据，如果没有元数据则不存在该字段 | [optional] [default to undefined]
**labels** | **Array&lt;string&gt;** | 简易文件标签列表，通过上传、修改文件时指定的 | [optional] [default to undefined]
**category** | **string** | 文件自定义的分类 | [optional] [default to undefined]
**localCreationTime** | **string** | 文件对应的本地创建时间，时间戳字符串 | [optional] [default to undefined]
**localModificationTime** | **string** | 文件对应的本地修改时间，时间戳字符串 | [optional] [default to undefined]
**versionId** | **number** | 文件版本号 | [optional] [default to undefined]

## Example

```typescript
import { InfoFile200Response } from './api';

const instance: InfoFile200Response = {
    cosUrl,
    type,
    creationTime,
    modificationTime,
    contentType,
    size,
    eTag,
    crc64,
    fileType,
    previewByDoc,
    previewByCI,
    previewAsIcon,
    metaData,
    labels,
    category,
    localCreationTime,
    localModificationTime,
    versionId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
