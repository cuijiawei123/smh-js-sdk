# SpaceApi

All URIs are relative to *https://api.tencentsmh.cn*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createSpace**](#createspace) | **POST** /api/v1/space/{LibraryId} | 创建租户空间|
|[**deleteSpace**](#deletespace) | **DELETE** /api/v1/space/{LibraryId}/{SpaceId} | 删除租户空间|
|[**getContentsView**](#getcontentsview) | **GET** /api/v1/space/{LibraryId}/{SpaceId}/contents-view | 列出空间首页内容|
|[**getFileCountInSpace**](#getfilecountinspace) | **GET** /api/v1/space/{LibraryId}/{SpaceId}/file-count | 空间文件数量统计|
|[**getLibrarySpaceCount**](#getlibraryspacecount) | **GET** /api/v1/space/{LibraryId}/count | 查询媒体库租户空间数量|
|[**getSpaceExtension**](#getspaceextension) | **GET** /api/v1/space/{LibraryId}/{SpaceId}/extension | 查询租户空间属性|
|[**getSpaceSize**](#getspacesize) | **GET** /api/v1/space/{LibraryId}/{SpaceId}/size | 查询租户空间大小|
|[**listSpace**](#listspace) | **GET** /api/v1/space/{LibraryId}/list | 列出租户空间|
|[**setSpaceTrafficLimit**](#setspacetrafficlimit) | **POST** /api/v1/space/{LibraryId}/{SpaceId}/traffic-limit | 设置租户空间限速|
|[**updateSpaceExtension**](#updatespaceextension) | **POST** /api/v1/space/{LibraryId}/{SpaceId}/extension | 修改租户空间属性|

# **createSpace**
> CreateSpace201Response createSpace()

用于创建租户空间。需要 admin 或 create_space 权限，有关权限详情请参见生成访问令牌接口。

### Example

```typescript
import {
    SpaceApi,
    Configuration,
    CreateSpaceRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SpaceApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let createSpaceRequest: CreateSpaceRequest; //租户空间的扩展属性 (optional)

const { status, data } = await apiInstance.createSpace(
    libraryId,
    accessToken,
    userId,
    createSpaceRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createSpaceRequest** | **CreateSpaceRequest**| 租户空间的扩展属性 | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**CreateSpace201Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 创建成功，返回HTTP 201 Created。 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteSpace**
> deleteSpace()

用于删除租户空间。 要求权限：admin 或 delete_space 

### Example

```typescript
import {
    SpaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SpaceApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let force: 0 | 1; //是否强制删除，1:强制删除，不判断space是否为空; 0:非强制删除，不允许删除非空的space (optional) (default to 0)

const { status, data } = await apiInstance.deleteSpace(
    libraryId,
    spaceId,
    accessToken,
    userId,
    force
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **force** | [**0 | 1**]**Array<0 &#124; 1>** | 是否强制删除，1:强制删除，不判断space是否为空; 0:非强制删除，不允许删除非空的space | (optional) defaults to 0|


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
|**204** | 删除成功，返回 HTTP 204 No Content |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getContentsView**
> GetContentsView200Response getContentsView()

用于列出空间首页内容，会忽略目录的层级关系，列出空间下所有文件。 要求权限：read_only 或 space_admin 或 admin 

### Example

```typescript
import {
    SpaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SpaceApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filter: 'onlyDir' | 'onlyFile'; //筛选方式 (default to undefined)
let marker: string; //用于顺序列出分页的标识 (optional) (default to undefined)
let limit: number; //用于顺序列出分页时本地列出的项目数限制 (optional) (default to undefined)
let orderBy: 'name' | 'modificationTime' | 'size' | 'creationTime' | 'uploadTime' | 'localCreationTime' | 'localModificationTime'; //排序字段 (optional) (default to 'name')
let orderByType: 'asc' | 'desc'; //排序方式 (optional) (default to 'asc')
let withPath: boolean; //是否返回 path (optional) (default to false)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let category: string; //文件自定义的分类 (optional) (default to undefined)

const { status, data } = await apiInstance.getContentsView(
    libraryId,
    spaceId,
    filter,
    marker,
    limit,
    orderBy,
    orderByType,
    withPath,
    accessToken,
    userId,
    category
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filter** | [**&#39;onlyDir&#39; | &#39;onlyFile&#39;**]**Array<&#39;onlyDir&#39; &#124; &#39;onlyFile&#39;>** | 筛选方式 | defaults to undefined|
| **marker** | [**string**] | 用于顺序列出分页的标识 | (optional) defaults to undefined|
| **limit** | [**number**] | 用于顺序列出分页时本地列出的项目数限制 | (optional) defaults to undefined|
| **orderBy** | [**&#39;name&#39; | &#39;modificationTime&#39; | &#39;size&#39; | &#39;creationTime&#39; | &#39;uploadTime&#39; | &#39;localCreationTime&#39; | &#39;localModificationTime&#39;**]**Array<&#39;name&#39; &#124; &#39;modificationTime&#39; &#124; &#39;size&#39; &#124; &#39;creationTime&#39; &#124; &#39;uploadTime&#39; &#124; &#39;localCreationTime&#39; &#124; &#39;localModificationTime&#39;>** | 排序字段 | (optional) defaults to 'name'|
| **orderByType** | [**&#39;asc&#39; | &#39;desc&#39;**]**Array<&#39;asc&#39; &#124; &#39;desc&#39;>** | 排序方式 | (optional) defaults to 'asc'|
| **withPath** | [**boolean**] | 是否返回 path | (optional) defaults to false|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **category** | [**string**] | 文件自定义的分类 | (optional) defaults to undefined|


### Return type

**GetContentsView200Response**

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

# **getFileCountInSpace**
> GetFileCountInSpace200Response getFileCountInSpace()

用于空间文件数量统计。 需要拥有 admin 或 space_admin 权限。 

### Example

```typescript
import {
    SpaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SpaceApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)

const { status, data } = await apiInstance.getFileCountInSpace(
    libraryId,
    spaceId,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|


### Return type

**GetFileCountInSpace200Response**

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

# **getLibrarySpaceCount**
> GetLibrarySpaceCount200Response getLibrarySpaceCount()

用于查询媒体库中的租户空间数量

### Example

```typescript
import {
    SpaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SpaceApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.getLibrarySpaceCount(
    libraryId,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**GetLibrarySpaceCount200Response**

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

# **getSpaceExtension**
> GetSpaceExtension200Response getSpaceExtension()

用于查询租户空间的扩展属性

### Example

```typescript
import {
    SpaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SpaceApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.getSpaceExtension(
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

**GetSpaceExtension200Response**

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

# **getSpaceSize**
> GetSpaceSize200Response getSpaceSize()

用于查询租户空间大小

### Example

```typescript
import {
    SpaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SpaceApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.getSpaceSize(
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

**GetSpaceSize200Response**

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

# **listSpace**
> ListSpace200Response listSpace()

用于列出租户空间列表信息。如需列出所有租户空间，需要 admin 或 space_admin 权限，否则仅列出当前访问令牌所代表的用户所创建的租户空间。

### Example

```typescript
import {
    SpaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SpaceApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let marker: string; //用于顺序列出分页的标识。 (optional) (default to undefined)
let limit: number; //用于顺序列出分页时本地列出的项目数限制。 (optional) (default to undefined)

const { status, data } = await apiInstance.listSpace(
    libraryId,
    accessToken,
    userId,
    marker,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **marker** | [**string**] | 用于顺序列出分页的标识。 | (optional) defaults to undefined|
| **limit** | [**number**] | 用于顺序列出分页时本地列出的项目数限制。 | (optional) defaults to undefined|


### Return type

**ListSpace200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 获取成功，返回HTTP 200 OK。 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setSpaceTrafficLimit**
> setSpaceTrafficLimit(setSpaceTrafficLimitRequest)

用于设置租户空间的下载限速，要求权限：admin或space_admin

### Example

```typescript
import {
    SpaceApi,
    Configuration,
    SetSpaceTrafficLimitRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SpaceApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let setSpaceTrafficLimitRequest: SetSpaceTrafficLimitRequest; //

const { status, data } = await apiInstance.setSpaceTrafficLimit(
    libraryId,
    spaceId,
    accessToken,
    setSpaceTrafficLimitRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setSpaceTrafficLimitRequest** | **SetSpaceTrafficLimitRequest**|  | |
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
|**204** | 修改成功，返回HTTP 204 No Content |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateSpaceExtension**
> updateSpaceExtension()

用于修改租户空间属性。 要求权限：非 acl 鉴权：admin 或 space_admin； acl 鉴权：无权限 

### Example

```typescript
import {
    SpaceApi,
    Configuration,
    UpdateSpaceExtensionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SpaceApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let updateSpaceExtensionRequest: UpdateSpaceExtensionRequest; //租户空间的扩展属性 (optional)

const { status, data } = await apiInstance.updateSpaceExtension(
    libraryId,
    spaceId,
    accessToken,
    userId,
    updateSpaceExtensionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateSpaceExtensionRequest** | **UpdateSpaceExtensionRequest**| 租户空间的扩展属性 | |
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

