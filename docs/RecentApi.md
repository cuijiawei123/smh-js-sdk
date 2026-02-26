# RecentApi

All URIs are relative to *https://api.tencentsmh.cn*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**listRecentlyUsedFile**](#listrecentlyusedfile) | **POST** /api/v1/recent/{LibraryId}/{SpaceId}/recently-used-file | 查看最近使用文件列表|

# **listRecentlyUsedFile**
> ListRecentlyUsedFile200Response listRecentlyUsedFile()

用于查看最近使用文件列表，仅文件预览及文件编辑操作会被记录到最近使用文件列表中，返回的文件列表按照操作时间进行倒序排列

### Example

```typescript
import {
    RecentApi,
    Configuration,
    ListRecentlyUsedFileRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new RecentApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let listRecentlyUsedFileRequest: ListRecentlyUsedFileRequest; // (optional)

const { status, data } = await apiInstance.listRecentlyUsedFile(
    libraryId,
    spaceId,
    accessToken,
    listRecentlyUsedFileRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **listRecentlyUsedFileRequest** | **ListRecentlyUsedFileRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|


### Return type

**ListRecentlyUsedFile200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 查看最近使用文件列表成功 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

