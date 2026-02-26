# TaskApi

All URIs are relative to *https://api.tencentsmh.cn*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**queryLibraryTask**](#querylibrarytask) | **GET** /api/v1/task/{LibraryId}/{TaskIdList} | 查询媒体库任务接口|
|[**queryTask**](#querytask) | **GET** /api/v1/task/{LibraryId}/{SpaceId}/{TaskIdList} | 查询任务接口|

# **queryLibraryTask**
> Array<QueryLibraryTask200ResponseInner> queryLibraryTask()

用于查询媒体库级别耗时任务执行情况。任务的具体返回请参阅会产生异步任务的接口说明，部分接口会根据任务耗时情况返回同步或异步结果，此时异步结果通常与同步结果的格式保持一致；仅能查询到任务结束时间在最近30天的任务，更早期的任务无法查询；

### Example

```typescript
import {
    TaskApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TaskApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let taskIdList: string; //任务 ID 列表，用逗号分隔，例如 10 或 10,12,13 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.queryLibraryTask(
    libraryId,
    taskIdList,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **taskIdList** | [**string**] | 任务 ID 列表，用逗号分隔，例如 10 或 10,12,13 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**Array<QueryLibraryTask200ResponseInner>**

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

# **queryTask**
> Array<QueryTask200ResponseInner> queryTask()

用于查询耗时任务执行情况。任务的具体返回请参阅会产生异步任务的接口说明，部分接口会根据任务耗时情况返回同步或异步结果，此时异步结果通常与同步结果的格式保持一致；仅能查询到任务结束时间在最近30天的任务，更早期的任务无法查询；

### Example

```typescript
import {
    TaskApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TaskApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let taskIdList: string; //任务 ID 列表，用逗号分隔，例如 10 或 10,12,13 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.queryTask(
    libraryId,
    spaceId,
    taskIdList,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **taskIdList** | [**string**] | 任务 ID 列表，用逗号分隔，例如 10 或 10,12,13 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**Array<QueryTask200ResponseInner>**

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

