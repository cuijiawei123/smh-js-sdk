# SearchApi

All URIs are relative to *https://api.tencentsmh.cn*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createSearch**](#createsearch) | **POST** /api/v1/search/{LibraryId}/{SpaceId}/space-contents | 搜索目录与文件|
|[**deleteSearch**](#deletesearch) | **DELETE** /api/v1/search/{LibraryId}/{SpaceId}/{SearchId} | 删除搜索任务|
|[**searchMore**](#searchmore) | **GET** /api/v1/search/{LibraryId}/{SpaceId}/{SearchId} | 继续获取搜索结果|

# **createSearch**
> CreateSearch200Response createSearch(createSearchRequest)

用于搜索目录与文件。 使用本接口发起异步搜索任务时，接口将在大约 2s 的时间返回，如果在返回时有部分或全部搜索结果，则返回已搜索出的结果的第一页（每页 20 个），如果暂未搜索到结果则返回空数组，因此该接口实际返回的 contents 数量可能为 0 到 20 之间不等，且是否还有更多搜索结果，不应参考 contents 的数量，而应参考 hasMore 字段； 当需要获取后续页时，使用【继续获取搜索结果】接口； 

### Example

```typescript
import {
    SearchApi,
    Configuration,
    CreateSearchRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SearchApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let createSearchRequest: CreateSearchRequest; //
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let withInode: 0 | 1; //0 或 1，是否返回 inode，即文件目录 ID，可选，默认不返回 (optional) (default to undefined)
let withFavoriteStatus: 0 | 1; //0 或 1，是否返回收藏状态，可选，默认不返回 (optional) (default to undefined)

const { status, data } = await apiInstance.createSearch(
    libraryId,
    spaceId,
    accessToken,
    createSearchRequest,
    userId,
    withInode,
    withFavoriteStatus
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createSearchRequest** | **CreateSearchRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **withInode** | [**0 | 1**]**Array<0 &#124; 1>** | 0 或 1，是否返回 inode，即文件目录 ID，可选，默认不返回 | (optional) defaults to undefined|
| **withFavoriteStatus** | [**0 | 1**]**Array<0 &#124; 1>** | 0 或 1，是否返回收藏状态，可选，默认不返回 | (optional) defaults to undefined|


### Return type

**CreateSearch200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 搜索成功 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteSearch**
> deleteSearch()

用于删除搜索任务。 当客户端跳出搜索界面或更新搜索条件时，建议调用本接口结束并删除前次搜索任务。 

### Example

```typescript
import {
    SearchApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SearchApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let searchId: string; //搜索任务 ID (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.deleteSearch(
    libraryId,
    spaceId,
    searchId,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **searchId** | [**string**] | 搜索任务 ID | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 删除成功 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **searchMore**
> SearchMore200Response searchMore()

用于继续获取搜索结果

### Example

```typescript
import {
    SearchApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SearchApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let searchId: string; //搜索任务 ID (default to undefined)
let marker: string; //分页标识，创建搜索任务时或继续获取搜索结果时返回的 nextMarker 字段 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let withInode: 0 | 1; //0 或 1，是否返回 inode，即文件目录 ID，可选，默认不返回 (optional) (default to undefined)
let withFavoriteStatus: 0 | 1; //0 或 1，是否返回收藏状态，可选，默认不返回 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.searchMore(
    libraryId,
    spaceId,
    searchId,
    marker,
    accessToken,
    withInode,
    withFavoriteStatus,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **searchId** | [**string**] | 搜索任务 ID | defaults to undefined|
| **marker** | [**string**] | 分页标识，创建搜索任务时或继续获取搜索结果时返回的 nextMarker 字段 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **withInode** | [**0 | 1**]**Array<0 &#124; 1>** | 0 或 1，是否返回 inode，即文件目录 ID，可选，默认不返回 | (optional) defaults to undefined|
| **withFavoriteStatus** | [**0 | 1**]**Array<0 &#124; 1>** | 0 或 1，是否返回收藏状态，可选，默认不返回 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**SearchMore200Response**

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

