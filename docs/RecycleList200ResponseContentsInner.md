# RecycleList200ResponseContentsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**recycledItemId** | **number** | 回收站id | [optional] [default to undefined]
**originalPath** | **Array&lt;string&gt;** | 原始路径 | [optional] [default to undefined]
**spaceId** | **string** | 空间 ID | [optional] [default to undefined]
**size** | **string** | 文件大小，为了避免数字精度问题，这里为字符串格式 | [optional] [default to undefined]
**previewByDoc** | **boolean** | 是否可通过 wps 预览 | [optional] [default to undefined]
**previewByCI** | **boolean** | 是否可通过万象预览 | [optional] [default to undefined]
**previewAsIcon** | **boolean** | 是否可用预览图当做 icon | [optional] [default to undefined]
**fileType** | **string** | 文件类型：excel、powerpoint 等 | [optional] [default to undefined]
**name** | **string** | 目录或相簿名或文件名 | [optional] [default to undefined]
**type** | **string** | 条目类型：dir-目录或相簿，file-文件，image-图片，video-视频 | [optional] [default to undefined]
**creationTime** | **string** | 目录或相簿的创建时间或文件的上传时间 | [optional] [default to undefined]
**modificationTime** | **string** | 目录或相簿的修改时间 | [optional] [default to undefined]
**removalTime** | **string** | 目录或相簿的删除时间 | [optional] [default to undefined]
**remainingTime** | **number** | 剩余天数，不足一天的部分不计入 | [optional] [default to undefined]

## Example

```typescript
import { RecycleList200ResponseContentsInner } from './api';

const instance: RecycleList200ResponseContentsInner = {
    recycledItemId,
    originalPath,
    spaceId,
    size,
    previewByDoc,
    previewByCI,
    previewAsIcon,
    fileType,
    name,
    type,
    creationTime,
    modificationTime,
    removalTime,
    remainingTime,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
