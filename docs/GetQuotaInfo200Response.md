# GetQuotaInfo200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**spaces** | **Array&lt;string&gt;** | 配额所使用的空间空间 ID 集合 | [optional] [default to undefined]
**capacity** | **string** | 配额的具体值，单位为字节（Byte），可以指定为数字形式或字符串形式，为了避免大数产生的精度损失，该字段指定为字符串形式 | [optional] [default to undefined]

## Example

```typescript
import { GetQuotaInfo200Response } from './api';

const instance: GetQuotaInfo200Response = {
    spaces,
    capacity,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
