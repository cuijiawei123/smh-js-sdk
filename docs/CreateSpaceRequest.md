# CreateSpaceRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**isPublicRead** | **boolean** | 是否为公有读，不指定默认为 false。 | [optional] [default to false]
**isMultiAlbum** | **boolean** | 是否为多相簿空间，不指定默认为 false。 | [optional] [default to false]
**allowPhoto** | **boolean** | 是否允许上传照片，不指定默认为 false。 | [optional] [default to false]
**allowVideo** | **boolean** | 是否允许上传视频，不指定默认为 false。 | [optional] [default to false]
**allowPhotoExtname** | **Array&lt;string&gt;** | 允许上传的照片扩展名列表，默认为空数组。 | [optional] [default to undefined]
**allowVideoExtname** | **Array&lt;string&gt;** | 允许上传的视频扩展名列表，默认为空数组。 | [optional] [default to undefined]
**recognizeSensitiveContent** | **boolean** | 是否检测敏感内容，不指定默认为 false。 | [optional] [default to false]
**spaceTag** | **string** | 空间标识，用于区分个人空间和团队空间。 | [optional] [default to undefined]

## Example

```typescript
import { CreateSpaceRequest } from './api';

const instance: CreateSpaceRequest = {
    isPublicRead,
    isMultiAlbum,
    allowPhoto,
    allowVideo,
    allowPhotoExtname,
    allowVideoExtname,
    recognizeSensitiveContent,
    spaceTag,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
