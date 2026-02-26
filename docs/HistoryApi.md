# HistoryApi

All URIs are relative to *https://api.tencentsmh.cn*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deleteHistory**](#deletehistory) | **POST** /api/v1/directory-history/{LibraryId}/{SpaceId}/delete | 删除历史版本|
|[**emptyHistory**](#emptyhistory) | **DELETE** /api/v1/directory-history/{LibraryId}/library-history | 清空历史版本|
|[**getHistoryConfig**](#gethistoryconfig) | **GET** /api/v1/directory-history/{LibraryId}/library-history | 查询历史版本配置信息|
|[**listHistory**](#listhistory) | **GET** /api/v1/directory-history/{LibraryId}/{SpaceId}/history-list/{FilePath} | 查看历史版本列表|
|[**setHistoryConfig**](#sethistoryconfig) | **POST** /api/v1/directory-history/{LibraryId}/library-history | 设置历史版本配置信息|
|[**setHistoryLatest**](#sethistorylatest) | **POST** /api/v1/directory-history/{LibraryId}/{SpaceId}/latest-version/{HistoryId} | 设置历史版本为最新版本|

# **deleteHistory**
> deleteHistory(requestBody)

用于删除特定历史版本。权限要求：delete_history权限、admin权限或space_admin权限

### Example

```typescript
import {
    HistoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new HistoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let requestBody: Array<string>; //

const { status, data } = await apiInstance.deleteHistory(
    libraryId,
    spaceId,
    accessToken,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **Array<string>**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 删除成功，返回 HTTP 204 No Content |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **emptyHistory**
> EmptyHistory202Response emptyHistory()

用于清空整个library的历史版本，请求此接口时，需要先关闭历史版本。注意：此接口会清空整个library全部文件的历史版本，相应的空间会释放，不可找回数据，请谨慎操作！此接口有频控限制，每分钟最多调用1次，请勿频繁调用。权限要求：admin权限

### Example

```typescript
import {
    HistoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new HistoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)

const { status, data } = await apiInstance.emptyHistory(
    libraryId,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|


### Return type

**EmptyHistory202Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**202** | 删除成功，返回 HTTP 202 Accepted，后台异步任务处理 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getHistoryConfig**
> GetHistoryConfig200Response getHistoryConfig()

用于查询历史版本配置信息。权限要求：admin权限

### Example

```typescript
import {
    HistoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new HistoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)

const { status, data } = await apiInstance.getHistoryConfig(
    libraryId,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|


### Return type

**GetHistoryConfig200Response**

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

# **listHistory**
> ListHistory200Response listHistory()

用于查看历史版本列表。

### Example

```typescript
import {
    HistoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new HistoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径，对于多级目录，使用斜杠(/)分隔，例如 foo/bar.txt (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let marker: string; //用于顺序列出分页的标识 (optional) (default to undefined)
let limit: number; //用于顺序列出分页时本地列出的项目数限制，默认为 20；若不指定任何翻页参数，默认采用（marker，limit）参数翻页；若与（page，page_size）参数同时使用，默认采用（page，page_size）参数翻页 (optional) (default to 20)
let page: number; //分页码，默认第一页 (optional) (default to undefined)
let pageSize: number; //分页大小，默认 20；若与（marker，limit）参数同时使用，默认采用（page，page_size）参数翻页 (optional) (default to 20)
let orderBy: 'id' | 'creationTime'; //排序字段，按文件 id 排序为 id，按创建时间排序为 creationTime，默认为 id，最新版本排序始终在首位 (optional) (default to 'id')
let orderByType: 'asc' | 'desc'; //排序方式，升序为 asc，降序为 desc，默认为 desc (optional) (default to 'desc')

const { status, data } = await apiInstance.listHistory(
    libraryId,
    spaceId,
    filePath,
    accessToken,
    marker,
    limit,
    page,
    pageSize,
    orderBy,
    orderByType
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径，对于多级目录，使用斜杠(/)分隔，例如 foo/bar.txt | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **marker** | [**string**] | 用于顺序列出分页的标识 | (optional) defaults to undefined|
| **limit** | [**number**] | 用于顺序列出分页时本地列出的项目数限制，默认为 20；若不指定任何翻页参数，默认采用（marker，limit）参数翻页；若与（page，page_size）参数同时使用，默认采用（page，page_size）参数翻页 | (optional) defaults to 20|
| **page** | [**number**] | 分页码，默认第一页 | (optional) defaults to undefined|
| **pageSize** | [**number**] | 分页大小，默认 20；若与（marker，limit）参数同时使用，默认采用（page，page_size）参数翻页 | (optional) defaults to 20|
| **orderBy** | [**&#39;id&#39; | &#39;creationTime&#39;**]**Array<&#39;id&#39; &#124; &#39;creationTime&#39;>** | 排序字段，按文件 id 排序为 id，按创建时间排序为 creationTime，默认为 id，最新版本排序始终在首位 | (optional) defaults to 'id'|
| **orderByType** | [**&#39;asc&#39; | &#39;desc&#39;**]**Array<&#39;asc&#39; &#124; &#39;desc&#39;>** | 排序方式，升序为 asc，降序为 desc，默认为 desc | (optional) defaults to 'desc'|


### Return type

**ListHistory200Response**

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

# **setHistoryConfig**
> setHistoryConfig(setHistoryConfigRequest)

用于设置历史版本配置信息。权限要求：admin权限。多次调用接口会覆盖之前设置，以最后一次调用为准。更新时，可以设置部分字段；未传入字段，其值保持不变。配置设置生效可能有 1 分钟左右延迟。

### Example

```typescript
import {
    HistoryApi,
    Configuration,
    SetHistoryConfigRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new HistoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let setHistoryConfigRequest: SetHistoryConfigRequest; //

const { status, data } = await apiInstance.setHistoryConfig(
    libraryId,
    accessToken,
    setHistoryConfigRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setHistoryConfigRequest** | **SetHistoryConfigRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 设置成功，返回 HTTP 204 No Content |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setHistoryLatest**
> SetHistoryLatest200Response setHistoryLatest()

用于设置历史版本为最新版本。权限要求：admin权限、space_admin权限或set_history_latest权限

### Example

```typescript
import {
    HistoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new HistoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let historyId: string; //历史版本 ID (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)

const { status, data } = await apiInstance.setHistoryLatest(
    libraryId,
    spaceId,
    historyId,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **historyId** | [**string**] | 历史版本 ID | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|


### Return type

**SetHistoryLatest200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 设置成功，返回 HTTP 200 OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

