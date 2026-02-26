# UpdateFileLabelsRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**labels** | **Array&lt;string&gt;** | 文件标签列表，比如大象 | [optional] [default to undefined]
**category** | **string** | 文件自定义的分类，string类型，最大长度16字节 | [optional] [default to undefined]
**localCreationTime** | **string** | 文件对应的本地创建时间 | [optional] [default to undefined]
**localModificationTime** | **string** | 文件对应的本地修改时间 | [optional] [default to undefined]

## Example

```typescript
import { UpdateFileLabelsRequest } from './api';

const instance: UpdateFileLabelsRequest = {
    labels,
    category,
    localCreationTime,
    localModificationTime,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
