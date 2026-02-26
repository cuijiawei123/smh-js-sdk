# UsageApi

All URIs are relative to *https://api.tencentsmh.cn*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getLibraryUsage**](#getlibraryusage) | **GET** /api/v1/usage/{LibraryId} | 查询媒体库容量信息|
|[**getUsage**](#getusage) | **GET** /api/v1/usage/{LibraryId}/{SpaceIds} | 批量查询列出租户空间容量信息|

# **getLibraryUsage**
> GetLibraryUsage200Response getLibraryUsage()

用于查询媒体库级别的容量信息。 要求权限：admin 

### Example

```typescript
import {
    UsageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsageApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.getLibraryUsage(
    libraryId,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**GetLibraryUsage200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 获取成功，返回 HTTP 200 OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUsage**
> Array<GetUsage200ResponseInner> getUsage()

用于批量查询列出租户空间容量信息。 要求权限：admin 或 space_admin 如果要查询任意空间的容量信息则需要 admin 权限，如果是 space_admin 权限，则只能查询访问令牌指定的租户空间的容量信息 

### Example

```typescript
import {
    UsageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsageApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceIds: string; //空间列表，以逗号分隔，如 space1,space2 (default to undefined)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.getUsage(
    libraryId,
    spaceIds,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceIds** | [**string**] | 空间列表，以逗号分隔，如 space1,space2 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**Array<GetUsage200ResponseInner>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 获取成功，返回 HTTP 200 OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

