# CreateSymlink200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**path** | **Array&lt;string&gt;** | 字符串数组 或 null，如果是字符串数组则表示最终的符号链接路径，数组中的最后一个元素代表最终的文件名，其他元素代表每一级目录名，因为可能存在同名文件自动重命名，所以这里的最终路径可能不等同于移动或重命名时指定的目标路径；如果是 null 则表示目标路径的某级父级目录已被删除，该目标符号链接已经无法访问 | [optional] [default to undefined]

## Example

```typescript
import { CreateSymlink200Response } from './api';

const instance: CreateSymlink200Response = {
    path,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
