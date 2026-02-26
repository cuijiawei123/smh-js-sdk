# CreateSearch200ResponseContentsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** | 条目类型：dir-目录或相簿；file-文件，仅用于文件类型媒体库；image-图片，仅用于媒体类型媒体库；video-视频，仅用于媒体类型媒体库；symlink-符号链接 | [optional] [default to undefined]
**inode** | **string** | 文件目录ID | [optional] [default to undefined]
**name** | **string** | 目录或相簿名或文件名 | [optional] [default to undefined]
**creationTime** | **string** | ISO 8601格式的日期与时间字符串，表示目录或相簿的创建时间或文件的上传时间 | [optional] [default to undefined]
**modificationTime** | **string** | 文件最近一次被覆盖的时间，或者目录内最近一次增删子目录或文件的时间 | [optional] [default to undefined]
**contentType** | **string** | 媒体类型 | [optional] [default to undefined]
**versionId** | **number** | 版本号 | [optional] [default to undefined]
**size** | **string** | 文件大小，为了避免数字精度问题，这里为字符串格式 | [optional] [default to undefined]
**isFavorite** | **boolean** | 是否被收藏，当 WithFavoriteStatus &#x3D; 1 时返回 | [optional] [default to undefined]
**eTag** | **string** | 文件 ETag | [optional] [default to undefined]
**crc64** | **string** | 文件的 CRC64-ECMA182 校验值，为了避免数字精度问题，这里为字符串格式 | [optional] [default to undefined]
**metaData** | **{ [key: string]: string; }** | 文件元数据信息 | [optional] [default to undefined]
**path** | **Array&lt;string&gt;** | 当前项目所在的目录，包含当前项目的 name | [optional] [default to undefined]
**userId** | **string** | 创建/更新者 用户 ID | [optional] [default to undefined]
**previewByDoc** | **boolean** | 是否可通过 wps 预览 | [optional] [default to undefined]
**previewByCI** | **boolean** | 是否可通过万象预览 | [optional] [default to undefined]
**previewAsIcon** | **boolean** | 是否可使用预览图当做 icon | [optional] [default to undefined]
**fileType** | **string** | 文件类型：excel、powerpoint 等 | [optional] [default to undefined]
**labels** | **Array&lt;string&gt;** | 简易文件标签，字符串数组 | [optional] [default to undefined]
**category** | **string** | 自定义文件分类，比如image、video、doc等 | [optional] [default to undefined]
**localCreationTime** | **string** | 文件对应的本地创建时间 | [optional] [default to undefined]
**localModificationTime** | **string** | 文件对应的本地修改时间 | [optional] [default to undefined]

## Example

```typescript
import { CreateSearch200ResponseContentsInner } from './api';

const instance: CreateSearch200ResponseContentsInner = {
    type,
    inode,
    name,
    creationTime,
    modificationTime,
    contentType,
    versionId,
    size,
    isFavorite,
    eTag,
    crc64,
    metaData,
    path,
    userId,
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
