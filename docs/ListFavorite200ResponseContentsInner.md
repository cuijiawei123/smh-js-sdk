# ListFavorite200ResponseContentsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**spaceId** | **string** | 空间ID | [optional] [default to undefined]
**type** | **string** | 文件目录类型，如果文件已被删除，则不返回该字段 | [optional] [default to undefined]
**inode** | **string** | 文件或目录ID | [optional] [default to undefined]
**name** | **string** | 文件或目录名称，如果文件已被删除，则返回空字符串 | [optional] [default to undefined]
**size** | **string** | 文件的大小，如果为目录则不返回该字段，如果文件已被删除，则不返回该字段 | [optional] [default to undefined]
**creationTime** | **string** | 文件或目录的创建时间，如果文件已被删除，则不返回该字段 | [optional] [default to undefined]
**modificationTime** | **string** | 文件最近一次被覆盖的时间，如果文件已被删除，则不返回该字段 | [optional] [default to undefined]
**favoriteTime** | **string** | 文件或目录的收藏时间 | [optional] [default to undefined]
**fileType** | **string** | 文件类型，如果文件已被删除，则不返回该字段，如果为目录则不返回该字段 | [optional] [default to undefined]
**path** | **Array&lt;string&gt;** | 字符串数组，文件目录路径 | [optional] [default to undefined]
**userId** | **string** | 收藏人ID | [optional] [default to undefined]
**eTag** | **string** | 目录或文件的ETag | [optional] [default to undefined]
**virusAuditStatus** | **number** | 查毒状态（0-6） | [optional] [default to undefined]
**labels** | **Array&lt;string&gt;** | 文件标签数组 | [optional] [default to undefined]
**category** | **string** | 自定义文件分类，比如image、video、doc等 | [optional] [default to undefined]
**contentType** | **string** | 媒体类型（仅非目录或相簿返回） | [optional] [default to undefined]
**crc64** | **string** | 文件的CRC64-ECMA182校验值 | [optional] [default to undefined]
**previewByDoc** | **boolean** | 是否可通过wps预览（仅非目录或相簿返回） | [optional] [default to undefined]
**previewByCI** | **boolean** | 是否可通过万象预览（仅非目录或相簿返回） | [optional] [default to undefined]
**previewAsIcon** | **boolean** | 是否可用预览图作为icon（仅非目录或相簿返回） | [optional] [default to undefined]
**removedByQuota** | **boolean** | 是否因为配额超限而被删除文件（仅非目录或相簿返回） | [optional] [default to undefined]
**metaData** | **{ [key: string]: string; }** | 元数据（仅非目录或相簿返回） | [optional] [default to undefined]

## Example

```typescript
import { ListFavorite200ResponseContentsInner } from './api';

const instance: ListFavorite200ResponseContentsInner = {
    spaceId,
    type,
    inode,
    name,
    size,
    creationTime,
    modificationTime,
    favoriteTime,
    fileType,
    path,
    userId,
    eTag,
    virusAuditStatus,
    labels,
    category,
    contentType,
    crc64,
    previewByDoc,
    previewByCI,
    previewAsIcon,
    removedByQuota,
    metaData,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
