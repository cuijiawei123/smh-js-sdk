# GetQuota200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | 配额 ID，用于后续查询配额的具体信息、修改配额值或删除配额 | [optional] [default to undefined]
**capacity** | **string** | 配额的具体值，单位为字节（Byte），可以指定为数字形式或字符串形式，为了避免大数产生的精度损失，该字段指定为字符串形式 | [optional] [default to undefined]

## Example

```typescript
import { GetQuota200Response } from './api';

const instance: GetQuota200Response = {
    id,
    capacity,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
