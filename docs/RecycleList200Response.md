# RecycleList200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**totalNum** | **number** | 回收站所有文件和文件夹总数 | [optional] [default to undefined]
**nextMarker** | **string** | 用于顺序列出分页的标识 | [optional] [default to undefined]
**contents** | [**Array&lt;RecycleList200ResponseContentsInner&gt;**](RecycleList200ResponseContentsInner.md) |  | [optional] [default to undefined]

## Example

```typescript
import { RecycleList200Response } from './api';

const instance: RecycleList200Response = {
    totalNum,
    nextMarker,
    contents,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
