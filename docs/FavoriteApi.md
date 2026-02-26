# FavoriteApi

All URIs are relative to *https://api.tencentsmh.cn*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createFavorite**](#createfavorite) | **POST** /api/v1/favorite/{LibraryId}/{SpaceId} | 收藏指定空间文件|
|[**deleteFavorite**](#deletefavorite) | **POST** /api/v1/favorite/{LibraryId}/{SpaceId}#1 | 取消收藏指定空间文件|
|[**listFavorite**](#listfavorite) | **GET** /api/v1/favorite/{LibraryId}/{SpaceId}/list | 查看指定空间收藏列表|

# **createFavorite**
> CreateFavorite200Response createFavorite(createFavoriteRequest)

收藏文件目录。需要提供路径或inode，二者二选一；如果同时提供，以inode为准。 

### Example

```typescript
import {
    FavoriteApi,
    Configuration,
    CreateFavoriteRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FavoriteApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let createFavoriteRequest: CreateFavoriteRequest; //

const { status, data } = await apiInstance.createFavorite(
    libraryId,
    spaceId,
    accessToken,
    createFavoriteRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createFavoriteRequest** | **CreateFavoriteRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|


### Return type

**CreateFavorite200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 收藏成功 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteFavorite**
> deleteFavorite(deleteFavoriteRequest)

取消收藏。根据路径或inode取消收藏，二者二选一；如果同时提供，以inode为准。 

### Example

```typescript
import {
    FavoriteApi,
    Configuration,
    CreateFavoriteRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FavoriteApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let cancel: 1; //取消收藏标志，传递该参数表示执行取消收藏操作 (default to undefined)
let deleteFavoriteRequest: CreateFavoriteRequest; //

const { status, data } = await apiInstance.deleteFavorite(
    libraryId,
    spaceId,
    accessToken,
    cancel,
    deleteFavoriteRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deleteFavoriteRequest** | **CreateFavoriteRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **cancel** | [**1**]**Array<1>** | 取消收藏标志，传递该参数表示执行取消收藏操作 | defaults to undefined|


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
|**204** | 取消收藏成功，无响应体 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listFavorite**
> ListFavorite200Response listFavorite()

查看指定空间收藏列表，支持分页和排序

### Example

```typescript
import {
    FavoriteApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FavoriteApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let marker: string; //用于顺序列出分页的标识，可选参数 (optional) (default to undefined)
let limit: number; //用于顺序列出分页时本地列出的项目数限制，默认为20，可选参数 (optional) (default to 20)
let page: number; //分页码，默认第一页，可选参数，不能与marker和limit参数同时使用 (optional) (default to undefined)
let pageSize: number; //分页大小，默认20，可选参数，不能与marker和limit参数同时使用 (optional) (default to 20)
let orderBy: 'favoriteTime'; //排序字段，按收藏时间排序为favoriteTime（默认），目前仅支持按收藏时间排序，可选参数 (optional) (default to 'favoriteTime')
let orderByType: 'asc' | 'desc'; //排序方式，升序为asc，降序为desc（默认），可选参数 (optional) (default to 'desc')
let withPath: boolean; //是否返回path，返回为true，不返回为false（默认），可选参数 (optional) (default to false)

const { status, data } = await apiInstance.listFavorite(
    libraryId,
    spaceId,
    accessToken,
    marker,
    limit,
    page,
    pageSize,
    orderBy,
    orderByType,
    withPath
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **marker** | [**string**] | 用于顺序列出分页的标识，可选参数 | (optional) defaults to undefined|
| **limit** | [**number**] | 用于顺序列出分页时本地列出的项目数限制，默认为20，可选参数 | (optional) defaults to 20|
| **page** | [**number**] | 分页码，默认第一页，可选参数，不能与marker和limit参数同时使用 | (optional) defaults to undefined|
| **pageSize** | [**number**] | 分页大小，默认20，可选参数，不能与marker和limit参数同时使用 | (optional) defaults to 20|
| **orderBy** | [**&#39;favoriteTime&#39;**]**Array<&#39;favoriteTime&#39;>** | 排序字段，按收藏时间排序为favoriteTime（默认），目前仅支持按收藏时间排序，可选参数 | (optional) defaults to 'favoriteTime'|
| **orderByType** | [**&#39;asc&#39; | &#39;desc&#39;**]**Array<&#39;asc&#39; &#124; &#39;desc&#39;>** | 排序方式，升序为asc，降序为desc（默认），可选参数 | (optional) defaults to 'desc'|
| **withPath** | [**boolean**] | 是否返回path，返回为true，不返回为false（默认），可选参数 | (optional) defaults to false|


### Return type

**ListFavorite200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 获取成功 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

