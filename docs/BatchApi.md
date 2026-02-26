# BatchApi

All URIs are relative to *https://api.tencentsmh.cn*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**batchCopy**](#batchcopy) | **POST** /api/v1/batch/{LibraryId}/{SpaceId} | 批量复制目录或文件|
|[**batchDelete**](#batchdelete) | **POST** /api/v1/batch/{LibraryId}/{SpaceId}#2 | 批量删除目录或文件|
|[**batchMove**](#batchmove) | **POST** /api/v1/batch/{LibraryId}/{SpaceId}#1 | 批量重命名或移动目录或文件|

# **batchCopy**
> BatchCopy200Response batchCopy(batchCopyRequest)

用于批量复制目录或文件

### Example

```typescript
import {
    BatchApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BatchApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let copy: 1; //开启批量复制操作 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let batchCopyRequest: Array<BatchCopyRequestInner>; //
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.batchCopy(
    libraryId,
    spaceId,
    copy,
    accessToken,
    batchCopyRequest,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **batchCopyRequest** | **Array<BatchCopyRequestInner>**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **copy** | [**1**]**Array<1>** | 开启批量复制操作 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**BatchCopy200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 同步操作全部执行成功 |  -  |
|**202** | 异步操作任务已接受 |  -  |
|**207** | 同步操作存在部分或全部执行失败 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **batchDelete**
> BatchDelete200Response batchDelete(batchDeleteRequest)

用于批量删除目录或文件

### Example

```typescript
import {
    BatchApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BatchApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let _delete: 1; //开启批量删除操作 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let batchDeleteRequest: Array<BatchDeleteRequestInner>; //
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.batchDelete(
    libraryId,
    spaceId,
    _delete,
    accessToken,
    batchDeleteRequest,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **batchDeleteRequest** | **Array<BatchDeleteRequestInner>**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **_delete** | [**1**]**Array<1>** | 开启批量删除操作 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**BatchDelete200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 同步操作全部执行成功 |  -  |
|**202** | 异步操作任务已接受 |  -  |
|**207** | 同步操作存在部分或全部执行失败 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **batchMove**
> BatchMove200Response batchMove(batchMoveRequest)

用于批量重命名或移动目录或文件

### Example

```typescript
import {
    BatchApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BatchApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let move: 1; //开启批量重命名或移动操作 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let batchMoveRequest: Array<BatchMoveRequestInner>; //
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.batchMove(
    libraryId,
    spaceId,
    move,
    accessToken,
    batchMoveRequest,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **batchMoveRequest** | **Array<BatchMoveRequestInner>**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **move** | [**1**]**Array<1>** | 开启批量重命名或移动操作 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**BatchMove200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 同步操作全部执行成功 |  -  |
|**202** | 异步操作任务已接受 |  -  |
|**207** | 同步操作存在部分或全部执行失败 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

