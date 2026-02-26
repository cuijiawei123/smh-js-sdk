# CopyFile200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**path** | **Array&lt;string&gt;** | 字符串数组 或 null，如果是字符串数组则表示最终的文件路径，数组中的最后一个元素代表最终的文件名，其他元素代表每一级目录名；如果是 null 则表示目标路径的某级父级目录已被删除 | [optional] [default to undefined]

## Example

```typescript
import { CopyFile200Response } from './api';

const instance: CopyFile200Response = {
    path,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
