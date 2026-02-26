# ListRecentlyUsedFile200ResponseContentsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | 文件名 | [optional] [default to undefined]
**spaceId** | **string** | 空间ID | [optional] [default to undefined]
**inode** | **string** | 文件ID | [optional] [default to undefined]
**size** | **string** | 文件大小，为了避免数字精度问题，这里为字符串格式 | [optional] [default to undefined]
**actionType** | **string** | 加入最近使用列表时的操作类型 | [optional] [default to undefined]
**operationTime** | **string** | ISO 8601格式的日期与时间字符串，表示加入最近使用文件列表的时间 | [optional] [default to undefined]
**creationTime** | **string** | ISO 8601格式的日期与时间字符串，表示文件的上传时间 | [optional] [default to undefined]
**crc64** | **string** | 文件的CRC64-ECMA182校验值，为了避免数字精度问题，这里为字符串格式 | [optional] [default to undefined]
**path** | **Array&lt;string&gt;** | 字符串数组，表示文件的路径，仅当设置了withPath为true时返回该字段 | [optional] [default to undefined]

## Example

```typescript
import { ListRecentlyUsedFile200ResponseContentsInner } from './api';

const instance: ListRecentlyUsedFile200ResponseContentsInner = {
    name,
    spaceId,
    inode,
    size,
    actionType,
    operationTime,
    creationTime,
    crc64,
    path,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
