# GetFileUpload200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**confirmed** | **boolean** | 布尔型，代表当前上传任务是否为已完成 | [optional] [default to undefined]
**path** | **Array&lt;string&gt;** | 字符串数组 或 null，如果是字符串数组则表示最终的文件路径，数组中的最后一个元素代表最终的文件名，其他元素代表每一级目录名，因为可能存在同名文件自动重命名，所以这里的最终路径可能不等同于开始上传时指定的路径；如果是 null 则表示该文件所在的目录或其某个父级目录已被删除，该文件已经无法访问 | [optional] [default to undefined]
**type** | **string** | 文件类型 | [optional] [default to undefined]
**creationTime** | **string** | 上传任务创建时间 | [optional] [default to undefined]
**conflictResolutionStrategy** | **string** | 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件 | [optional] [default to undefined]
**force** | **boolean** | 是否强制覆盖同路径文件 | [optional] [default to undefined]
**availableDomainNum** | **number** | 可用域名数量 | [optional] [default to undefined]
**uploadId** | **string** | 如果为分块上传则返回该字段，作为实际文件上传时需指定的请求参数；否则不返回该字段 | [optional] [default to undefined]
**parts** | [**Array&lt;GetFileUpload200ResponsePartsInner&gt;**](GetFileUpload200ResponsePartsInner.md) | 如果为分块上传则返回该字段，包含已上传的分块信息；否则不返回该字段 | [optional] [default to undefined]
**uploadPartInfo** | [**GetFileUpload200ResponseUploadPartInfo**](GetFileUpload200ResponseUploadPartInfo.md) |  | [optional] [default to undefined]

## Example

```typescript
import { GetFileUpload200Response } from './api';

const instance: GetFileUpload200Response = {
    confirmed,
    path,
    type,
    creationTime,
    conflictResolutionStrategy,
    force,
    availableDomainNum,
    uploadId,
    parts,
    uploadPartInfo,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
