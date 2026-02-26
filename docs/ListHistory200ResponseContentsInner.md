# ListHistory200ResponseContentsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | 历史版本 ID，最新历史版本不返回这一字段 | [optional] [default to undefined]
**createdBy** | **string** | 创建人 ID | [optional] [default to undefined]
**creationWay** | **number** | 创建方式，0：创建，1：更新 | [optional] [default to undefined]
**version** | **number** | 版本号 | [optional] [default to undefined]
**isLatestVersion** | **boolean** | 是否最新版本 | [optional] [default to undefined]
**name** | **string** | 目录或相簿名或文件名 | [optional] [default to undefined]
**size** | **number** | 历史版本文件大小 | [optional] [default to undefined]
**crc64** | **string** | 文件的 CRC64-ECMA182 校验值，为了避免数字精度问题，这里为字符串格式 | [optional] [default to undefined]
**contentType** | **string** | 文件元类型 | [optional] [default to undefined]
**creationTime** | **string** | ISO 8601格式的日期与时间字符串，表示文件的创建时间 | [optional] [default to undefined]
**setLatestTime** | **string** | 设置为最新版本的时间 | [optional] [default to undefined]

## Example

```typescript
import { ListHistory200ResponseContentsInner } from './api';

const instance: ListHistory200ResponseContentsInner = {
    id,
    createdBy,
    creationWay,
    version,
    isLatestVersion,
    name,
    size,
    crc64,
    contentType,
    creationTime,
    setLatestTime,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
