# UpdateSpaceExtensionRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**isPublicRead** | **boolean** | 是否为公有读，不指定默认为 false | [optional] [default to false]
**allowPhoto** | **boolean** | 是否允许上传照片，不指定默认为 false，该参数仅在媒体类型媒体库中生效 | [optional] [default to false]
**allowVideo** | **boolean** | 是否允许上传视频，不指定默认为 false，该参数仅在媒体类型媒体库中生效 | [optional] [default to false]
**allowPhotoExtname** | **Array&lt;string&gt;** | 允许上传的照片扩展名列表，默认为空数组，该参数仅在媒体类型媒体库中生效 | [optional] [default to undefined]
**allowVideoExtname** | **Array&lt;string&gt;** | 允许上传的视频扩展名列表，默认为空数组，该参数仅在媒体类型媒体库中生效 | [optional] [default to undefined]
**allowFileExtname** | **Array&lt;string&gt;** | 允许上传的文件扩展名列表，默认为空数组，该参数仅在非媒体类型媒体库中生效 | [optional] [default to undefined]
**recognizeSensitiveContent** | **boolean** | 是否检测敏感内容，不指定默认为 false | [optional] [default to false]

## Example

```typescript
import { UpdateSpaceExtensionRequest } from './api';

const instance: UpdateSpaceExtensionRequest = {
    isPublicRead,
    allowPhoto,
    allowVideo,
    allowPhotoExtname,
    allowVideoExtname,
    allowFileExtname,
    recognizeSensitiveContent,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
