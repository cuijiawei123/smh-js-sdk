# UpdateQuotaRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**capacity** | **string** | 配额的具体值，单位为字节（Byte），可以指定为数字形式或字符串形式，为了避免大数产生的精度损失，建议该字段指定为字符串形式，必选参数 | [default to undefined]
**removeWhenExceed** | **boolean** | 当指定为 false 时，配额仅用于上传时判断是否有足够空间，对于已经超限的空间不执行任何删除清理操作；当指定为 true 时，修改配额将检查当前存储量，如果存储量已经超限，那么将在 removeAfterDays 天数到达后开始删除文件已保证存储量在配额之下，默认删除最早的文件，如果 removeNewest 指定为 true 则删除最新的文件 | [optional] [default to false]
**removeAfterDays** | **number** | 存储量超限后在进行文件删除前等待的天数 | [optional] [default to undefined]
**removeNewest** | **boolean** | 是否从最新的文件开始删除，默认为 false，即从最旧的文件开始删除 | [optional] [default to false]

## Example

```typescript
import { UpdateQuotaRequest } from './api';

const instance: UpdateQuotaRequest = {
    capacity,
    removeWhenExceed,
    removeAfterDays,
    removeNewest,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
