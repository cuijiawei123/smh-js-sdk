# QuotaApi

All URIs are relative to *https://api.tencentsmh.cn*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createQuota**](#createquota) | **POST** /api/v1/quota/{LibraryId} | 创建配额|
|[**getQuota**](#getquota) | **GET** /api/v1/quota/{LibraryId}/{SpaceId} | 获取租户空间配额|
|[**getQuotaInfo**](#getquotainfo) | **GET** /api/v1/quota/{LibraryId}/{QuotaId} | 获取租户配额信息|
|[**updateQuota**](#updatequota) | **PUT** /api/v1/quota/{LibraryId}/{SpaceId} | 修改配额|
|[**updateQuotaById**](#updatequotabyid) | **PUT** /api/v1/quota/{LibraryId}/{QuotaId} | 修改配额|

# **createQuota**
> CreateQuota201Response createQuota(createQuotaRequest)

用于创建配额。当在配置了配额的租户空间中上传即将超过配额的文件时，会返回 QuotaLimitReached 错误码；租户空间的剩余空间非实时更新，当系统负荷较高时可能会有比较大的更新延时，进而可能导致意外超出配额，如果配置了超额自动删除选项，可能进一步导致旧文件被删除；配额与租户空间是一对多的关系，即多个租户空间可以共享同一个配额，但每个租户空间只能设置一个配额。

### Example

```typescript
import {
    QuotaApi,
    Configuration,
    CreateQuotaRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new QuotaApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let createQuotaRequest: CreateQuotaRequest; //
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.createQuota(
    libraryId,
    accessToken,
    createQuotaRequest,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createQuotaRequest** | **CreateQuotaRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**CreateQuota201Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 创建成功，返回 HTTP 201 Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getQuota**
> GetQuota200Response getQuota()

用于获取租户空间配额

### Example

```typescript
import {
    QuotaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new QuotaApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.getQuota(
    libraryId,
    spaceId,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**GetQuota200Response**

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

# **getQuotaInfo**
> GetQuotaInfo200Response getQuotaInfo()

用于获取租户配额信息

### Example

```typescript
import {
    QuotaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new QuotaApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let quotaId: string; //配额 ID，必选参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.getQuotaInfo(
    libraryId,
    quotaId,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **quotaId** | [**string**] | 配额 ID，必选参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**GetQuotaInfo200Response**

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

# **updateQuota**
> updateQuota(updateQuotaRequest)

用于修改配额

### Example

```typescript
import {
    QuotaApi,
    Configuration,
    UpdateQuotaRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new QuotaApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let updateQuotaRequest: UpdateQuotaRequest; //
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.updateQuota(
    libraryId,
    spaceId,
    accessToken,
    updateQuotaRequest,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateQuotaRequest** | **UpdateQuotaRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


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
|**204** | 修改成功，返回 HTTP 204 No Content |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateQuotaById**
> updateQuotaById(updateQuotaByIdRequest)

用于根据配额 ID 修改配额

### Example

```typescript
import {
    QuotaApi,
    Configuration,
    UpdateQuotaByIdRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new QuotaApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let quotaId: string; //配额 ID，创建配额时会返回，也可以通过【获取租户空间配额】接口查询指定租户空间所在的配额 ID (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let updateQuotaByIdRequest: UpdateQuotaByIdRequest; //
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.updateQuotaById(
    libraryId,
    quotaId,
    accessToken,
    updateQuotaByIdRequest,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateQuotaByIdRequest** | **UpdateQuotaByIdRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **quotaId** | [**string**] | 配额 ID，创建配额时会返回，也可以通过【获取租户空间配额】接口查询指定租户空间所在的配额 ID | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


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
|**204** | 修改成功，返回 HTTP 204 No Content |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

