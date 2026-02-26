# GetContentsView200ResponseContentsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | 目录或相簿名或文件名 | [optional] [default to undefined]
**path** | **Array&lt;string&gt;** | 文件路径，仅当设置了withPath为true时返回 | [optional] [default to undefined]
**inode** | **string** | 文件目录ID | [optional] [default to undefined]
**type** | **string** | 条目类型 | [optional] [default to undefined]
**creationTime** | **string** | 创建时间或上传时间 | [optional] [default to undefined]
**modificationTime** | **string** | 最近修改时间 | [optional] [default to undefined]
**versionId** | **number** | 版本号 | [optional] [default to undefined]
**contentType** | **string** | 媒体类型 | [optional] [default to undefined]
**size** | **string** | 文件大小 | [optional] [default to undefined]
**eTag** | **string** | ETag | [optional] [default to undefined]
**crc64** | **string** | CRC64校验值 | [optional] [default to undefined]
**metaData** | **{ [key: string]: string; }** | 文件元数据信息 | [optional] [default to undefined]
**previewByDoc** | **boolean** | 是否可通过wps预览 | [optional] [default to undefined]
**previewByCI** | **boolean** | 是否可通过万象预览 | [optional] [default to undefined]
**previewAsIcon** | **boolean** | 是否可用预览图作为icon | [optional] [default to undefined]
**fileType** | **string** | 文件类型 | [optional] [default to undefined]
**labels** | **Array&lt;string&gt;** | 简易文件标签列表 | [optional] [default to undefined]
**category** | **string** | 文件自定义分类 | [optional] [default to undefined]
**localCreationTime** | **string** | 本地创建时间 | [optional] [default to undefined]
**localModificationTime** | **string** | 本地修改时间 | [optional] [default to undefined]

## Example

```typescript
import { GetContentsView200ResponseContentsInner } from './api';

const instance: GetContentsView200ResponseContentsInner = {
    name,
    path,
    inode,
    type,
    creationTime,
    modificationTime,
    versionId,
    contentType,
    size,
    eTag,
    crc64,
    metaData,
    previewByDoc,
    previewByCI,
    previewAsIcon,
    fileType,
    labels,
    category,
    localCreationTime,
    localModificationTime,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
