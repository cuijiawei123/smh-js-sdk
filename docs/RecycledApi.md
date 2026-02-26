# RecycledApi

All URIs are relative to *https://api.tencentsmh.cn*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**recycleEmpty**](#recycleempty) | **DELETE** /api/v1/recycled/{LibraryId}/{SpaceId} | 清空回收站|
|[**recycleInfo**](#recycleinfo) | **GET** /api/v1/recycled/{LibraryId}/{SpaceId}/{RecycledItemId} | 查看回收站文件详情|
|[**recycleList**](#recyclelist) | **GET** /api/v1/recycled/{LibraryId}/{SpaceId} | 列出回收站项目|
|[**recyclePreview**](#recyclepreview) | **GET** /api/v1/recycled/{LibraryId}/{SpaceId}/{RecycledItemId}#1 | 预览回收站项目|
|[**recyclePurge**](#recyclepurge) | **DELETE** /api/v1/recycled/{LibraryId}/{SpaceId}/{RecycledItemId} | 永久删除指定回收站项目|
|[**recyclePurgeBatch**](#recyclepurgebatch) | **POST** /api/v1/recycled/{LibraryId}/{SpaceId}#1 | 永久删除指定回收站项目（批量）|
|[**recycleRestore**](#recyclerestore) | **POST** /api/v1/recycled/{LibraryId}/{SpaceId}/{RecycledItemId} | 恢复指定回收站项目|
|[**recycleRestoreBatch**](#recyclerestorebatch) | **POST** /api/v1/recycled/{LibraryId}/{SpaceId} | 批量恢复回收站项目|
|[**recycleSetLifecycle**](#recyclesetlifecycle) | **POST** /api/v1/recycled/{LibraryId}/{SpaceId}#2 | 设置回收站生命周期|

# **recycleEmpty**
> recycleEmpty()

用于清空回收站。要求权限：admin、space_admin 或 delete_recycled。调用清空回收站接口时，回收站内的文件将首先在回收站内不可见，删除和释放空间的操作将异步执行。

### Example

```typescript
import {
    RecycledApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RecycledApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.recycleEmpty(
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

# **recycleInfo**
> RecycleInfo200Response recycleInfo()

用于查看回收站文件详情，以便进行预览

### Example

```typescript
import {
    RecycledApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RecycledApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let recycledItemId: number; //回收站 ID (default to undefined)
let info: number; //获取文件详情，固定值为1 (default to 1)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)

const { status, data } = await apiInstance.recycleInfo(
    libraryId,
    spaceId,
    recycledItemId,
    info,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **recycledItemId** | [**number**] | 回收站 ID | defaults to undefined|
| **info** | [**number**] | 获取文件详情，固定值为1 | defaults to 1|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|


### Return type

**RecycleInfo200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 获取成功，返回文件详情 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **recycleList**
> RecycleList200Response recycleList()

用于列出回收站项目。目录内容的列出顺序为：默认无排序，根据传入参数 orderBy 和 orderByType 来决定排列顺序。

### Example

```typescript
import {
    RecycledApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RecycledApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let marker: string; //用于顺序列出分页的标识，不能与 page 和 page_size 参数同时使用 (optional) (default to undefined)
let limit: number; //用于顺序列出分页时本地列出的项目数限制，不能与 page 和 page_size 参数同时使用 (optional) (default to undefined)
let page: number; //分页码，默认第一页，不能与 marker 和 limit 参数同时使用 (optional) (default to undefined)
let pageSize: number; //分页大小，默认 20，不能与 marker 和 limit 参数同时使用 (optional) (default to undefined)
let orderBy: 'name' | 'modificationTime' | 'size' | 'removalTime' | 'remainingTime'; //排序字段，按名称排序为 name，按修改时间排序为 modificationTime，按文件大小排序为 size，按删除时间排序为 removalTime，按剩余时间排序为 remainingTime (optional) (default to undefined)
let orderByType: 'asc' | 'desc'; //排序方式，升序为 asc，降序为 desc (optional) (default to undefined)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.recycleList(
    libraryId,
    spaceId,
    marker,
    limit,
    page,
    pageSize,
    orderBy,
    orderByType,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **marker** | [**string**] | 用于顺序列出分页的标识，不能与 page 和 page_size 参数同时使用 | (optional) defaults to undefined|
| **limit** | [**number**] | 用于顺序列出分页时本地列出的项目数限制，不能与 page 和 page_size 参数同时使用 | (optional) defaults to undefined|
| **page** | [**number**] | 分页码，默认第一页，不能与 marker 和 limit 参数同时使用 | (optional) defaults to undefined|
| **pageSize** | [**number**] | 分页大小，默认 20，不能与 marker 和 limit 参数同时使用 | (optional) defaults to undefined|
| **orderBy** | [**&#39;name&#39; | &#39;modificationTime&#39; | &#39;size&#39; | &#39;removalTime&#39; | &#39;remainingTime&#39;**]**Array<&#39;name&#39; &#124; &#39;modificationTime&#39; &#124; &#39;size&#39; &#124; &#39;removalTime&#39; &#124; &#39;remainingTime&#39;>** | 排序字段，按名称排序为 name，按修改时间排序为 modificationTime，按文件大小排序为 size，按删除时间排序为 removalTime，按剩余时间排序为 remainingTime | (optional) defaults to undefined|
| **orderByType** | [**&#39;asc&#39; | &#39;desc&#39;**]**Array<&#39;asc&#39; &#124; &#39;desc&#39;>** | 排序方式，升序为 asc，降序为 desc | (optional) defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**RecycleList200Response**

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

# **recyclePreview**
> RecyclePreview200Response recyclePreview()

可用于预览文档、图片、视频等文件类型；文档类型可返回HTML或JPG格式；视频返回首帧图片；照片或视频封面支持智能裁剪为指定大小，未识别到人脸时居中缩放裁剪；当未指定 size 参数时使用原图；接口返回302并跳转到可直接用于展示或下载的文件URL。

### Example

```typescript
import {
    RecycledApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RecycledApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let recycledItemId: number; //回收站 ID (default to undefined)
let preview: number; //预览标志，固定值为1 (default to 1)
let type: string; //文档类型文件的预览方式，设置为 pic 时以JPG格式预览文档首页，否则以HTML格式预览文档 (optional) (default to undefined)
let size: number; //图片或视频封面的缩放大小，优先使用人脸识别智能缩放裁剪为 size×size 大小 (optional) (default to undefined)
let scale: number; //图片或视频封面的等比例缩放百分比，不传 size 时生效 (optional) (default to undefined)
let widthSize: number; //图片或视频封面的缩放宽度，不传高度时按等比例缩放，不传 size 和 scale 时生效 (optional) (default to undefined)
let heightSize: number; //图片或视频封面的缩放高度，不传宽度时按等比例缩放，不传 size 和 scale 时生效 (optional) (default to undefined)
let frameNumber: number; //gif 文件降帧的帧数，仅在预览 gif 类型文件时生效 (optional) (default to undefined)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)

const { status, data } = await apiInstance.recyclePreview(
    libraryId,
    spaceId,
    recycledItemId,
    preview,
    type,
    size,
    scale,
    widthSize,
    heightSize,
    frameNumber,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **recycledItemId** | [**number**] | 回收站 ID | defaults to undefined|
| **preview** | [**number**] | 预览标志，固定值为1 | defaults to 1|
| **type** | [**string**] | 文档类型文件的预览方式，设置为 pic 时以JPG格式预览文档首页，否则以HTML格式预览文档 | (optional) defaults to undefined|
| **size** | [**number**] | 图片或视频封面的缩放大小，优先使用人脸识别智能缩放裁剪为 size×size 大小 | (optional) defaults to undefined|
| **scale** | [**number**] | 图片或视频封面的等比例缩放百分比，不传 size 时生效 | (optional) defaults to undefined|
| **widthSize** | [**number**] | 图片或视频封面的缩放宽度，不传高度时按等比例缩放，不传 size 和 scale 时生效 | (optional) defaults to undefined|
| **heightSize** | [**number**] | 图片或视频封面的缩放高度，不传宽度时按等比例缩放，不传 size 和 scale 时生效 | (optional) defaults to undefined|
| **frameNumber** | [**number**] | gif 文件降帧的帧数，仅在预览 gif 类型文件时生效 | (optional) defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|


### Return type

**RecyclePreview200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**302** | 获取成功，重定向到可直接用于展示或下载的文件 URL |  * Location - 可直接用于展示或下载的文件 URL <br>  |
|**200** | 某些场景下可能直接返回 JSON（例如预览信息），此处保留兼容 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **recyclePurge**
> recyclePurge()

用于永久删除指定回收站项目。要求权限：admin、space_admin 或 delete_recycled。

### Example

```typescript
import {
    RecycledApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RecycledApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let recycledItemId: number; //回收站项目 ID (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.recyclePurge(
    libraryId,
    spaceId,
    recycledItemId,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **recycledItemId** | [**number**] | 回收站项目 ID | defaults to undefined|
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

# **recyclePurgeBatch**
> recyclePurgeBatch(recyclePurgeBatchRequest)

用于永久删除指定回收站项目（批量）。要求权限：admin、space_admin 或 delete_recycled。

### Example

```typescript
import {
    RecycledApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RecycledApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let _delete: number; //永久删除标志，固定值为1 (default to 1)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let recyclePurgeBatchRequest: Array<number>; //
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.recyclePurgeBatch(
    libraryId,
    spaceId,
    _delete,
    accessToken,
    recyclePurgeBatchRequest,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **recyclePurgeBatchRequest** | **Array<number>**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **_delete** | [**number**] | 永久删除标志，固定值为1 | defaults to 1|
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
|**204** | 删除成功，无响应体 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **recycleRestore**
> RecycleRestore200Response recycleRestore()

用于恢复指定回收站项目。要求权限：admin、space_admin 或 restore_recycled。恢复项目时需保证该项目所在的目录存在。

### Example

```typescript
import {
    RecycledApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RecycledApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let recycledItemId: number; //回收站项目 ID (default to undefined)
let restore: 1; //固定为 1 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let conflictResolutionStrategy: 'ask' | 'rename' | 'overwrite'; //路径冲突时的处理方式，ask: 冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename: 冲突时自动重命名文件，overwrite: 如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 ask (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let restorePathStrategy: 'originalPath' | 'fallbackToRoot'; //恢复项目源路径的处理方式，originalPath:恢复到原始路径，原始路径不存在则报错; fallbackToRoot:恢复到原始路径，原始路径不存在则恢复到根目录，默认为 originalPath (optional) (default to undefined)

const { status, data } = await apiInstance.recycleRestore(
    libraryId,
    spaceId,
    recycledItemId,
    restore,
    accessToken,
    conflictResolutionStrategy,
    userId,
    restorePathStrategy
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **recycledItemId** | [**number**] | 回收站项目 ID | defaults to undefined|
| **restore** | [**1**]**Array<1>** | 固定为 1 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **conflictResolutionStrategy** | [**&#39;ask&#39; | &#39;rename&#39; | &#39;overwrite&#39;**]**Array<&#39;ask&#39; &#124; &#39;rename&#39; &#124; &#39;overwrite&#39;>** | 路径冲突时的处理方式，ask: 冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename: 冲突时自动重命名文件，overwrite: 如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 ask | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **restorePathStrategy** | [**&#39;originalPath&#39; | &#39;fallbackToRoot&#39;**]**Array<&#39;originalPath&#39; &#124; &#39;fallbackToRoot&#39;>** | 恢复项目源路径的处理方式，originalPath:恢复到原始路径，原始路径不存在则报错; fallbackToRoot:恢复到原始路径，原始路径不存在则恢复到根目录，默认为 originalPath | (optional) defaults to undefined|


### Return type

**RecycleRestore200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 恢复成功 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **recycleRestoreBatch**
> RecycleRestoreBatch200Response recycleRestoreBatch(recycleRestoreBatchRequest)

用于恢复指定回收站项目（批量）。要求权限：admin、space_admin 或 restore_recycled。恢复项目时需保证该项目所在的目录存在；恢复项目时如果有同名文件存在，则默认重命名文件。

### Example

```typescript
import {
    RecycledApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RecycledApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let restore: number; //恢复，固定值为1 (default to 1)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let recycleRestoreBatchRequest: Array<number>; //
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let restorePathStrategy: 'originalPath' | 'fallbackToRoot'; //恢复项目源路径的处理方式，originalPath:恢复到原始路径，原始路径不存在则报错; fallbackToRoot:恢复到原始路径，原始路径不存在则恢复到根目录，默认为 originalPath (optional) (default to undefined)

const { status, data } = await apiInstance.recycleRestoreBatch(
    libraryId,
    spaceId,
    restore,
    accessToken,
    recycleRestoreBatchRequest,
    userId,
    restorePathStrategy
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **recycleRestoreBatchRequest** | **Array<number>**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **restore** | [**number**] | 恢复，固定值为1 | defaults to 1|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **restorePathStrategy** | [**&#39;originalPath&#39; | &#39;fallbackToRoot&#39;**]**Array<&#39;originalPath&#39; &#124; &#39;fallbackToRoot&#39;>** | 恢复项目源路径的处理方式，originalPath:恢复到原始路径，原始路径不存在则报错; fallbackToRoot:恢复到原始路径，原始路径不存在则恢复到根目录，默认为 originalPath | (optional) defaults to undefined|


### Return type

**RecycleRestoreBatch200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 同步恢复全部执行成功 |  -  |
|**202** | 异步方式恢复 |  -  |
|**207** | 同步恢复存在部分或全部执行失败 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **recycleSetLifecycle**
> recycleSetLifecycle(recycleSetLifecycleRequest)

用于设置回收站生命周期。未对租户空间设置时，采用媒体库默认值；当延长保留天数时，已有文件同步使用新值；当缩短保留天数时，已有文件沿用旧值，新删除文件使用新值。

### Example

```typescript
import {
    RecycledApi,
    Configuration,
    RecycleSetLifecycleRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new RecycledApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let lifecycle: number; //设置回收站生命周期标志，固定值为1 (default to 1)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let recycleSetLifecycleRequest: RecycleSetLifecycleRequest; //

const { status, data } = await apiInstance.recycleSetLifecycle(
    libraryId,
    spaceId,
    lifecycle,
    accessToken,
    recycleSetLifecycleRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **recycleSetLifecycleRequest** | **RecycleSetLifecycleRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **lifecycle** | [**number**] | 设置回收站生命周期标志，固定值为1 | defaults to 1|
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
|**204** | 修改成功，无响应体 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

