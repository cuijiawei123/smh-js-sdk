# ListDirectory200ResponseContentsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | 目录或相簿名或文件名 | [optional] [default to undefined]
**path** | **Array&lt;string&gt;** | 文件具体目录 | [optional] [default to undefined]
**inode** | **string** | 文件目录ID | [optional] [default to undefined]
**versionId** | **number** | 版本号 | [optional] [default to undefined]
**type** | **string** | 条目类型 | [optional] [default to undefined]
**creationTime** | **string** | ISO 8601格式的日期与时间字符串，表示目录或相簿的创建时间或文件的上传时间 | [optional] [default to undefined]
**modificationTime** | **string** | 文件最近一次被覆盖的时间，或者目录内最近一次增删子目录或文件的时间 | [optional] [default to undefined]
**contentType** | **string** | 媒体类型 | [optional] [default to undefined]
**size** | **string** | 文件大小，字符串格式以避免精度问题 | [optional] [default to undefined]
**eTag** | **string** | 子目录或文件的 ETag | [optional] [default to undefined]
**isFavorite** | **boolean** | 是否被收藏，当 WithFavoriteStatus &#x3D; 1 时返回 | [optional] [default to undefined]
**crc64** | **string** | 文件的 CRC64-ECMA182 校验值，字符串格式 | [optional] [default to undefined]
**metaData** | **{ [key: string]: string; }** | 文件元数据信息 | [optional] [default to undefined]
**previewByDoc** | **boolean** | 是否可通过 wps 预览 | [optional] [default to undefined]
**previewByCI** | **boolean** | 是否可通过万象预览 | [optional] [default to undefined]
**previewAsIcon** | **boolean** | 是否可用预览图作为 icon | [optional] [default to undefined]
**fileType** | **string** | 文件类型：excel、powerpoint 等 | [optional] [default to undefined]
**category** | **string** | 文件分类，比如 image、video、doc 等 | [optional] [default to undefined]
**labels** | **Array&lt;string&gt;** | 简易文件标签，字符串数组 | [optional] [default to undefined]
**localCreationTime** | **string** | 文件对应的本地创建时间 | [optional] [default to undefined]
**localModificationTime** | **string** | 文件对应的本地修改时间 | [optional] [default to undefined]

## Example

```typescript
import { ListDirectory200ResponseContentsInner } from './api';

const instance: ListDirectory200ResponseContentsInner = {
    name,
    path,
    inode,
    versionId,
    type,
    creationTime,
    modificationTime,
    contentType,
    size,
    eTag,
    isFavorite,
    crc64,
    metaData,
    previewByDoc,
    previewByCI,
    previewAsIcon,
    fileType,
    category,
    labels,
    localCreationTime,
    localModificationTime,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
