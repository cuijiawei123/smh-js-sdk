# CompleteFileUpload200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**path** | **Array&lt;string&gt;** | 字符串数组 或 null，如果是字符串数组则表示最终的文件路径，数组中的最后一个元素代表最终的文件名，其他元素代表每一级目录名；如果是 null 则表示该文件所在的目录或其某个父级目录已被删除 | [optional] [default to undefined]
**name** | **string** | 最终文件名 | [optional] [default to undefined]
**type** | **string** | 文件类型 | [optional] [default to undefined]
**inode** | **string** | 文件目录ID（当 with_inode&#x3D;1 时返回） | [optional] [default to undefined]
**creationTime** | **string** | 文件首次完成上传的时间 | [optional] [default to undefined]
**modificationTime** | **string** | 文件最近一次被覆盖的时间 | [optional] [default to undefined]
**contentType** | **string** | 媒体类型 | [optional] [default to undefined]
**size** | **string** | 文件大小，为字符串格式 | [optional] [default to undefined]
**eTag** | **string** | 文件 ETag | [optional] [default to undefined]
**crc64** | **string** | 文件的 CRC64-ECMA182 校验值，为字符串格式 | [optional] [default to undefined]
**metaData** | **{ [key: string]: string; }** | 元数据，如果没有元数据则不存在该字段 | [optional] [default to undefined]
**virusAuditStatus** | **number** | 查毒状态：0 未检测，1 检测中，2 无风险，3 风险文件，4 无法检测，5 人为标记为无风险，6 检测任务失败 | [optional] [default to undefined]
**isOverwritten** | **boolean** | 文件上传时是否发生文件覆盖 | [optional] [default to undefined]
**previewByDoc** | **boolean** | 是否可通过 wps 预览 | [optional] [default to undefined]
**previewByCI** | **boolean** | 是否可通过万象预览 | [optional] [default to undefined]
**previewAsIcon** | **boolean** | 是否可用预览图作为 icon | [optional] [default to undefined]
**fileType** | **string** | 文件类型：excel、powerpoint 等 | [optional] [default to undefined]

## Example

```typescript
import { CompleteFileUpload200Response } from './api';

const instance: CompleteFileUpload200Response = {
    path,
    name,
    type,
    inode,
    creationTime,
    modificationTime,
    contentType,
    size,
    eTag,
    crc64,
    metaData,
    virusAuditStatus,
    isOverwritten,
    previewByDoc,
    previewByCI,
    previewAsIcon,
    fileType,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
