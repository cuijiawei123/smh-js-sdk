# GetUsage200ResponseInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**spaceId** | **string** | 租户空间 ID | [optional] [default to undefined]
**capacity** | **string** | 租户空间配额，如果为 null 则无配额 | [optional] [default to undefined]
**availableSpace** | **string** | 租户空间可用容量，如果为 null 则无配额 | [optional] [default to undefined]
**size** | **string** | 租户空间已上传文件占用的存储额度 | [optional] [default to undefined]

## Example

```typescript
import { GetUsage200ResponseInner } from './api';

const instance: GetUsage200ResponseInner = {
    spaceId,
    capacity,
    availableSpace,
    size,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
