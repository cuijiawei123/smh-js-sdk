# RenewMultipartUpload200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**domain** | **string** | 实际上传文件时的域名 | [optional] [default to undefined]
**path** | **string** | 实际文件上传时的 URL 路径 | [optional] [default to undefined]
**uploadId** | **string** | 实际文件上传时需指定的请求参数 | [optional] [default to undefined]
**headers** | [**RenewMultipartUpload200ResponseHeaders**](RenewMultipartUpload200ResponseHeaders.md) |  | [optional] [default to undefined]
**confirmKey** | **string** | 用于完成文件上传的确认参数 | [optional] [default to undefined]
**expiration** | **string** | 上传信息有效期，超过有效期后将失效，需要调用分块上传任务续期接口获取新的上传参数 | [optional] [default to undefined]
**availableDomainNum** | **number** | 可用域名数量 | [optional] [default to undefined]

## Example

```typescript
import { RenewMultipartUpload200Response } from './api';

const instance: RenewMultipartUpload200Response = {
    domain,
    path,
    uploadId,
    headers,
    confirmKey,
    expiration,
    availableDomainNum,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
