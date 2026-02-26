# GetSpaceExtension200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**isPublicRead** | **boolean** | 是否为公有读，不指定默认为 false | [optional] [default to undefined]
**allowPhoto** | **boolean** | 是否允许上传照片，不指定默认为 false | [optional] [default to undefined]
**allowVideo** | **boolean** | 是否允许上传视频，不指定默认为 false | [optional] [default to undefined]
**allowPhotoExtname** | **Array&lt;string&gt;** | 允许的照片扩展名数组，默认为空数组 | [optional] [default to undefined]
**allowVideoExtname** | **Array&lt;string&gt;** | 允许的视频扩展名数组，默认为空数组 | [optional] [default to undefined]
**recognizeSensitiveContent** | **boolean** | 是否检测敏感内容，不指定默认为 false | [optional] [default to undefined]

## Example

```typescript
import { GetSpaceExtension200Response } from './api';

const instance: GetSpaceExtension200Response = {
    isPublicRead,
    allowPhoto,
    allowVideo,
    allowPhotoExtname,
    allowVideoExtname,
    recognizeSensitiveContent,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
