# FormUploadFile201Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**domain** | **string** | 实际上传文件时的域名 | [optional] [default to undefined]
**path** | **string** | 实际文件上传时的 URL 路径，表单上传中固定为 \&quot;/\&quot; | [optional] [default to undefined]
**form** | **{ [key: string]: string; }** | 实际上传时除文件字段以外需要指定的其他字段，这些字段应当在文件字段之前 | [optional] [default to undefined]
**confirmKey** | **string** | 用于完成文件上传的确认参数 | [optional] [default to undefined]
**expiration** | **string** | 上传信息有效期，超过有效期后将失效，需要重新调用本接口获取新的上传参数 | [optional] [default to undefined]
**availableDomainNum** | **number** | 可用域名数量 | [optional] [default to undefined]

## Example

```typescript
import { FormUploadFile201Response } from './api';

const instance: FormUploadFile201Response = {
    domain,
    path,
    form,
    confirmKey,
    expiration,
    availableDomainNum,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
