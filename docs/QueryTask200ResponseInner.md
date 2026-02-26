# QueryTask200ResponseInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**taskId** | **number** | 任务 ID | [optional] [default to undefined]
**status** | **number** | 任务状态码，202: 任务进行中，200: 任务成功完成且有返回结果，返回结果在 result 字段中，204: 任务成功完成且无返回结果，500: 任务执行失败 | [optional] [default to undefined]
**result** | [**QueryTask200ResponseInnerResult**](QueryTask200ResponseInnerResult.md) |  | [optional] [default to undefined]

## Example

```typescript
import { QueryTask200ResponseInner } from './api';

const instance: QueryTask200ResponseInner = {
    taskId,
    status,
    result,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
