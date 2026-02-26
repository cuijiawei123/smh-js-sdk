# SetHistoryConfigRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**enableFileHistory** | **boolean** | 是否打开历史版本，默认为 false，即关闭状态 | [optional] [default to undefined]
**fileHistoryCount** | **number** | 历史版本最大数量，范围：1-999个；第一次设置必填 | [optional] [default to undefined]
**fileHistoryExpireDay** | **number** | 历史版本过期时间，范围：0-999天，0表示永不过期；第一次设置必填 | [optional] [default to undefined]
**mergeInterval** | **number** | 历史版本合并时间，即在mergeInterval时间内的覆盖操作，只会生成1个历史版本，减少冗余的历史版本，默认为0秒（不合并），范围：0或5-600，可选参数 | [optional] [default to undefined]

## Example

```typescript
import { SetHistoryConfigRequest } from './api';

const instance: SetHistoryConfigRequest = {
    enableFileHistory,
    fileHistoryCount,
    fileHistoryExpireDay,
    mergeInterval,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
