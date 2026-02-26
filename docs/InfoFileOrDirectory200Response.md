# InfoFileOrDirectory200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**path** | **Array&lt;string&gt;** | 完整路径 | [optional] [default to undefined]
**inode** | **string** | 文件目录 ID | [optional] [default to undefined]
**name** | **string** | 目录或相簿名或文件名 | [optional] [default to undefined]
**type** | **string** | 条目类型 | [optional] [default to undefined]
**userId** | **string** | 创建人 ID | [optional] [default to undefined]
**creationTime** | **string** | ISO 8601格式的日期与时间字符串，表示目录或相簿的创建时间或文件的上传时间 | [optional] [default to undefined]
**modificationTime** | **string** | 文件最近一次被覆盖的时间，或者目录内最近一次增删子目录或文件的时间 | [optional] [default to undefined]
**contentType** | **string** | 媒体类型（仅非目录或相簿返回） | [optional] [default to undefined]
**size** | **string** | 文件大小（仅非目录或相簿返回），字符串格式以避免精度问题 | [optional] [default to undefined]
**eTag** | **string** | 目录或文件的 ETag | [optional] [default to undefined]
**isFavorite** | **boolean** | 是否被收藏，当 WithFavoriteStatus &#x3D; 1 时返回 | [optional] [default to undefined]
**crc64** | **string** | 文件的 CRC64-ECMA182 校验值（仅非目录或相簿返回），字符串格式 | [optional] [default to undefined]
**versionId** | **number** | 版本号（仅非目录或相簿返回） | [optional] [default to undefined]
**metaData** | **{ [key: string]: string; }** | 文件元数据信息（仅非目录或相簿返回） | [optional] [default to undefined]
**previewByDoc** | **boolean** | 是否可通过 wps 预览（仅非目录或相簿返回） | [optional] [default to undefined]
**previewByCI** | **boolean** | 是否可通过万象预览（仅非目录或相簿返回） | [optional] [default to undefined]
**previewAsIcon** | **boolean** | 是否可用预览图作为 icon（仅非目录或相簿返回） | [optional] [default to undefined]
**fileType** | **string** | 文件类型：excel、powerpoint 等（仅非目录或相簿返回） | [optional] [default to undefined]
**labels** | **Array&lt;string&gt;** | 简易文件标签列表 | [optional] [default to undefined]
**category** | **number** | 文件自定义的分类，int类型 | [optional] [default to undefined]
**linkTo** | **string** | 符号链接指向的下一级文件的inode，当文件为符号链接时返回 | [optional] [default to undefined]

## Example

```typescript
import { InfoFileOrDirectory200Response } from './api';

const instance: InfoFileOrDirectory200Response = {
    path,
    inode,
    name,
    type,
    userId,
    creationTime,
    modificationTime,
    contentType,
    size,
    eTag,
    isFavorite,
    crc64,
    versionId,
    metaData,
    previewByDoc,
    previewByCI,
    previewAsIcon,
    fileType,
    labels,
    category,
    linkTo,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
