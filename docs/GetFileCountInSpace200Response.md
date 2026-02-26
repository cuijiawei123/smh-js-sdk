# GetFileCountInSpace200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**fileNum** | **string** | 总文件数量（包括回收站和历史版本） | [optional] [default to undefined]
**dirNum** | **string** | 总文件夹数量（包括回收站） | [optional] [default to undefined]
**recycledFileNum** | **string** | 回收站文件数量 | [optional] [default to undefined]
**recycledDirNum** | **string** | 回收站文件夹数量 | [optional] [default to undefined]
**historyFileNum** | **string** | 历史版本文件数量 | [optional] [default to undefined]

## Example

```typescript
import { GetFileCountInSpace200Response } from './api';

const instance: GetFileCountInSpace200Response = {
    fileNum,
    dirNum,
    recycledFileNum,
    recycledDirNum,
    historyFileNum,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
