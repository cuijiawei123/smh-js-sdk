# TokenApi

All URIs are relative to *https://api.tencentsmh.cn*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createToken**](#createtoken) | **GET** /api/v1/token | 生成访问令牌|
|[**deleteToken**](#deletetoken) | **DELETE** /api/v1/token/{LibraryId}/{AccessToken} | 删除访问令牌|
|[**deleteUserTokens**](#deleteusertokens) | **DELETE** /api/v1/token/{LibraryId} | 删除特定用户的所有访问令牌|
|[**renewToken**](#renewtoken) | **POST** /api/v1/token/{LibraryId}/{AccessToken} | 续期访问令牌|

# **createToken**
> CreateToken200Response createToken()

用于生成调用智能媒资托管服务的访问令牌（Access Token）。

### Example

```typescript
import {
    TokenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TokenApi(configuration);

let libraryId: string; //媒体库ID，在媒体托管控制台创建媒体库后获取。 (default to undefined)
let librarySecret: string; //媒体库密钥，在媒体托管控制台创建媒体库后获取。 (default to undefined)
let spaceId: string; //空间ID，可同时指定多个空间ID，使用英文逗号（,）分隔。 (optional) (default to undefined)
let userId: string; //用户身份识别，由业务后台自行控制。 (optional) (default to undefined)
let clientId: string; //客户端识别，由业务后台自行控制。 (optional) (default to undefined)
let sessionId: string; //SessionId，由业务后台自行控制。 (optional) (default to undefined)
let period: number; //令牌有效时长及每次使用令牌后自动续期的有效时长，单位为秒。 (optional) (default to 86400)
let grant: 'admin' | 'create_space' | 'delete_space' | 'space_admin' | 'create_directory' | 'delete_directory' | 'delete_directory_permanent' | 'move_directory' | 'copy_directory' | 'upload_file' | 'upload_file_force' | 'begin_upload' | 'begin_upload_force' | 'confirm_upload' | 'create_symlink' | 'create_symlink_force' | 'delete_file' | 'delete_file_permanent' | 'move_file' | 'move_file_force' | 'copy_file' | 'copy_file_force' | 'delete_recycled' | 'restore_recycled'; //授予的权限，如为空则只授予读取权限。 (optional) (default to undefined)

const { status, data } = await apiInstance.createToken(
    libraryId,
    librarySecret,
    spaceId,
    userId,
    clientId,
    sessionId,
    period,
    grant
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库ID，在媒体托管控制台创建媒体库后获取。 | defaults to undefined|
| **librarySecret** | [**string**] | 媒体库密钥，在媒体托管控制台创建媒体库后获取。 | defaults to undefined|
| **spaceId** | [**string**] | 空间ID，可同时指定多个空间ID，使用英文逗号（,）分隔。 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，由业务后台自行控制。 | (optional) defaults to undefined|
| **clientId** | [**string**] | 客户端识别，由业务后台自行控制。 | (optional) defaults to undefined|
| **sessionId** | [**string**] | SessionId，由业务后台自行控制。 | (optional) defaults to undefined|
| **period** | [**number**] | 令牌有效时长及每次使用令牌后自动续期的有效时长，单位为秒。 | (optional) defaults to 86400|
| **grant** | [**&#39;admin&#39; | &#39;create_space&#39; | &#39;delete_space&#39; | &#39;space_admin&#39; | &#39;create_directory&#39; | &#39;delete_directory&#39; | &#39;delete_directory_permanent&#39; | &#39;move_directory&#39; | &#39;copy_directory&#39; | &#39;upload_file&#39; | &#39;upload_file_force&#39; | &#39;begin_upload&#39; | &#39;begin_upload_force&#39; | &#39;confirm_upload&#39; | &#39;create_symlink&#39; | &#39;create_symlink_force&#39; | &#39;delete_file&#39; | &#39;delete_file_permanent&#39; | &#39;move_file&#39; | &#39;move_file_force&#39; | &#39;copy_file&#39; | &#39;copy_file_force&#39; | &#39;delete_recycled&#39; | &#39;restore_recycled&#39;**]**Array<&#39;admin&#39; &#124; &#39;create_space&#39; &#124; &#39;delete_space&#39; &#124; &#39;space_admin&#39; &#124; &#39;create_directory&#39; &#124; &#39;delete_directory&#39; &#124; &#39;delete_directory_permanent&#39; &#124; &#39;move_directory&#39; &#124; &#39;copy_directory&#39; &#124; &#39;upload_file&#39; &#124; &#39;upload_file_force&#39; &#124; &#39;begin_upload&#39; &#124; &#39;begin_upload_force&#39; &#124; &#39;confirm_upload&#39; &#124; &#39;create_symlink&#39; &#124; &#39;create_symlink_force&#39; &#124; &#39;delete_file&#39; &#124; &#39;delete_file_permanent&#39; &#124; &#39;move_file&#39; &#124; &#39;move_file_force&#39; &#124; &#39;copy_file&#39; &#124; &#39;copy_file_force&#39; &#124; &#39;delete_recycled&#39; &#124; &#39;restore_recycled&#39;>** | 授予的权限，如为空则只授予读取权限。 | (optional) defaults to undefined|


### Return type

**CreateToken200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 生成成功，返回HTTP 200 OK。 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteToken**
> deleteToken()

用于删除指定的访问令牌（Access Token）。删除指定访问令牌无需校验媒体库密钥，故可在客户端调用该接口。

### Example

```typescript
import {
    TokenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TokenApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let accessToken: string; //访问令牌 (default to undefined)

const { status, data } = await apiInstance.deleteToken(
    libraryId,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌 | defaults to undefined|


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
|**204** | 删除成功，返回HTTP 204 No Content。 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteUserTokens**
> deleteUserTokens()

用于删除特定用户的所有访问令牌（Access Token）。调用该接口需要用到媒体库密钥，所以必须在后端调用该接口以保证密钥安全；必须指定 UserId 参数，因此在创建访问令牌时，如果后续计划主动删除对应的访问令牌，则在创建时也需要指定 UserId；

### Example

```typescript
import {
    TokenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TokenApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let librarySecret: string; //媒体库密钥 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let clientId: string; //客户端识别，多个 ClientId 用英文逗号分隔，一次最多不超过 100 个 (optional) (default to undefined)
let sessionId: string; //会话识别，多个 SessionId 用英文逗号分隔，一次最多不超过 100 个 (optional) (default to undefined)

const { status, data } = await apiInstance.deleteUserTokens(
    libraryId,
    librarySecret,
    userId,
    clientId,
    sessionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **librarySecret** | [**string**] | 媒体库密钥 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **clientId** | [**string**] | 客户端识别，多个 ClientId 用英文逗号分隔，一次最多不超过 100 个 | (optional) defaults to undefined|
| **sessionId** | [**string**] | 会话识别，多个 SessionId 用英文逗号分隔，一次最多不超过 100 个 | (optional) defaults to undefined|


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

# **renewToken**
> CreateToken200Response renewToken()

用于续期访问令牌（Access Token）。续期时不支持指定新的有效时长，仅按照获取令牌时指定的有效时长续期。

### Example

```typescript
import {
    TokenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TokenApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let accessToken: string; //访问令牌 (default to undefined)

const { status, data } = await apiInstance.renewToken(
    libraryId,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌 | defaults to undefined|


### Return type

**CreateToken200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 续期成功，返回HTTP 200 OK。 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

