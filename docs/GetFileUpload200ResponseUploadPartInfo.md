# GetFileUpload200ResponseUploadPartInfo

如果为分块上传则返回该字段，包含继续进行分块上传的信息（可参阅开始分块上传文件接口）；否则不返回该字段

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**domain** | **string** | 实际上传文件时的域名 | [optional] [default to undefined]
**path** | **string** | 实际文件上传时的 URL 路径 | [optional] [default to undefined]
**uploadId** | **string** | 实际文件上传时需指定的请求参数 | [optional] [default to undefined]
**headers** | **{ [key: string]: string; }** | 实际上传时需指定的请求头部 | [optional] [default to undefined]
**expiration** | **string** | 上传信息有效期 | [optional] [default to undefined]

## Example

```typescript
import { GetFileUpload200ResponseUploadPartInfo } from './api';

const instance: GetFileUpload200ResponseUploadPartInfo = {
    domain,
    path,
    uploadId,
    headers,
    expiration,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
