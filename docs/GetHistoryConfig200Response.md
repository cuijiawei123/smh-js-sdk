# GetHistoryConfig200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**enableFileHistory** | **boolean** | 是否打开历史版本 | [optional] [default to undefined]
**fileHistoryCount** | **number** | 历史版本最大数量，范围：1-999个 | [optional] [default to undefined]
**fileHistoryExpireDay** | **number** | 历史版本过期时间，范围：0-999天，0表示永不过期 | [optional] [default to undefined]
**mergeInterval** | **number** | 历史版本合并时间，即在 mergeInterval 秒内的覆盖操作，只会生成1个历史版本 | [optional] [default to undefined]

## Example

```typescript
import { GetHistoryConfig200Response } from './api';

const instance: GetHistoryConfig200Response = {
    enableFileHistory,
    fileHistoryCount,
    fileHistoryExpireDay,
    mergeInterval,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
