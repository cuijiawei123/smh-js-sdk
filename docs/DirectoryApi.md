# DirectoryApi

All URIs are relative to *https://api.tencentsmh.cn*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**checkDirectoryStatus**](#checkdirectorystatus) | **HEAD** /api/v1/directory/{LibraryId}/{SpaceId}/{FilePath} | 检查目录或相簿状态|
|[**copyDirectory**](#copydirectory) | **PUT** /api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}#1 | 复制目录或相簿|
|[**createDirectory**](#createdirectory) | **PUT** /api/v1/directory/{LibraryId}/{SpaceId}/{FilePath} | 创建目录或相簿|
|[**deleteDirectory**](#deletedirectory) | **DELETE** /api/v1/directory/{LibraryId}/{SpaceId}/{FilePath} | 删除目录或相簿|
|[**infoFileOrDirectory**](#infofileordirectory) | **GET** /api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}#1 | 查看文件、目录或相簿详情|
|[**listDirectory**](#listdirectory) | **GET** /api/v1/directory/{LibraryId}/{SpaceId}/{FilePath} | 列出目录或相簿内容|
|[**moveDirectory**](#movedirectory) | **PUT** /api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}#2 | 重命名或移动目录或相簿|
|[**updateDirectoryLabels**](#updatedirectorylabels) | **POST** /api/v1/directory/{LibraryId}/{SpaceId}/{FilePath} | 更新目录自定义标签|
|[**updateFileLabels**](#updatefilelabels) | **POST** /api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}#1 | 更新文件标签或分类|

# **checkDirectoryStatus**
> checkDirectoryStatus()

用于检查目录或相簿状态

### Example

```typescript
import {
    DirectoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DirectoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.checkDirectoryStatus(
    libraryId,
    spaceId,
    filePath,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|
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
|**200** | 目录或相簿存在，返回 HTTP 200 OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **copyDirectory**
> CopyDirectory200Response copyDirectory(copyDirectoryRequest)

用于复制目录或相簿。 - 自动创建中间所需的各级父目录。 

### Example

```typescript
import {
    DirectoryApi,
    Configuration,
    CopyDirectoryRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DirectoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let copyDirectoryRequest: CopyDirectoryRequest; //
let conflictResolutionStrategy: 'ask' | 'rename'; //最后一级目录冲突时的处理方式，ask冲突时返回 HTTP 409，rename冲突时自动重命名最后一级目录，默认为 ask (optional) (default to 'ask')
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.copyDirectory(
    libraryId,
    spaceId,
    filePath,
    accessToken,
    copyDirectoryRequest,
    conflictResolutionStrategy,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **copyDirectoryRequest** | **CopyDirectoryRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **conflictResolutionStrategy** | [**&#39;ask&#39; | &#39;rename&#39;**]**Array<&#39;ask&#39; &#124; &#39;rename&#39;>** | 最后一级目录冲突时的处理方式，ask冲突时返回 HTTP 409，rename冲突时自动重命名最后一级目录，默认为 ask | (optional) defaults to 'ask'|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**CopyDirectory200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**202** | 当目录内容较多时以异步方式复制，返回 HTTP 202 Accepted |  -  |
|**204** | 当目录内容较少时以同步方式复制且 ConflictResolutionStrategy 为 ask，返回 HTTP 204 No Content |  -  |
|**200** | 当目录内容较少时以同步方式复制且 ConflictResolutionStrategy 为 rename，返回 HTTP 200 OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createDirectory**
> CreateDirectory201Response createDirectory()

用于创建目录或相簿。 - 媒体类型媒体库可以进一步设置是否为分相簿媒体库，当设置为不分相簿时，则不允许创建目录或相簿，当设置为分相簿时，仅允许创建1层目录或相簿；文件类型媒体库不限制目录层数； - 自动创建中间所需的各级父目录； - 即使 ConflictResolutionStrategy 为 rename，如果路径中的某一父级实际为文件，则依然会返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码。 

### Example

```typescript
import {
    DirectoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DirectoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let conflictResolutionStrategy: 'ask' | 'rename'; //最后一级目录冲突时的处理方式，ask冲突时返回 HTTP 409，rename冲突时自动重命名最后一级目录，默认为 ask (optional) (default to 'ask')
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let withInode: 0 | 1; //是否返回 inode，即文件目录 ID，0 或 1，默认不返回 (optional) (default to 0)

const { status, data } = await apiInstance.createDirectory(
    libraryId,
    spaceId,
    filePath,
    accessToken,
    conflictResolutionStrategy,
    userId,
    withInode
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **conflictResolutionStrategy** | [**&#39;ask&#39; | &#39;rename&#39;**]**Array<&#39;ask&#39; &#124; &#39;rename&#39;>** | 最后一级目录冲突时的处理方式，ask冲突时返回 HTTP 409，rename冲突时自动重命名最后一级目录，默认为 ask | (optional) defaults to 'ask'|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **withInode** | [**0 | 1**]**Array<0 &#124; 1>** | 是否返回 inode，即文件目录 ID，0 或 1，默认不返回 | (optional) defaults to 0|


### Return type

**CreateDirectory201Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 创建成功，返回 HTTP 201 Created；当 ConflictResolutionStrategy&#x3D;ask 且 with_inode&#x3D;0 时可能为空响应体 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteDirectory**
> DeleteFile200Response deleteDirectory()

用于删除目录或相簿。如果媒体库启用回收站功能，则该接口不会永久删除目录或相簿，而是将目录或相簿以及其下的文件移入回收站，可通过相关接口永久删除或恢复回收站内的目录或相簿，或直接清空回收站；

### Example

```typescript
import {
    DirectoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DirectoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let permanent: 0 | 1; //当媒体库开启回收站时，则该参数指定将文件移入回收站还是永久删除文件，1: 永久删除，0: 移入回收站，默认为 0 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.deleteDirectory(
    libraryId,
    spaceId,
    filePath,
    accessToken,
    permanent,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **permanent** | [**0 | 1**]**Array<0 &#124; 1>** | 当媒体库开启回收站时，则该参数指定将文件移入回收站还是永久删除文件，1: 永久删除，0: 移入回收站，默认为 0 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**DeleteFile200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 删除成功，返回 HTTP 204 No Content（未开启回收站） |  -  |
|**200** | 删除成功，返回 HTTP 200 OK（开启回收站） |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **infoFileOrDirectory**
> InfoFileOrDirectory200Response infoFileOrDirectory()

此接口可同时用于查看文件或文件夹详情，路径如果为文件，则返回文件详情，如果为文件夹，则返回文件夹详情。 

### Example

```typescript
import {
    DirectoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DirectoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let info: 1; //固定为 1 (default to 1)
let withInode: 0 | 1; //是否返回 inode，即文件目录 ID，0 或 1，默认不返回 (optional) (default to 0)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let withFavoriteStatus: 0 | 1; //是否返回收藏状态，0 或 1，默认不返回 (optional) (default to 0)

const { status, data } = await apiInstance.infoFileOrDirectory(
    libraryId,
    spaceId,
    filePath,
    info,
    withInode,
    accessToken,
    withFavoriteStatus
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **info** | [**1**]**Array<1>** | 固定为 1 | defaults to 1|
| **withInode** | [**0 | 1**]**Array<0 &#124; 1>** | 是否返回 inode，即文件目录 ID，0 或 1，默认不返回 | (optional) defaults to 0|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|
| **withFavoriteStatus** | [**0 | 1**]**Array<0 &#124; 1>** | 是否返回收藏状态，0 或 1，默认不返回 | (optional) defaults to 0|


### Return type

**InfoFileOrDirectory200Response**

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

# **listDirectory**
> ListDirectory200Response listDirectory()

用于列出目录或相簿内容。 目录内容的列出顺序为：首先按照字典序列出子目录，随后根据上传时间列出媒体库中的媒体资源，或根据文件名列出文件库中的文件资源。 

### Example

```typescript
import {
    DirectoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DirectoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let marker: string; //用于顺序列出分页的标识，不能与 page 和 page_size 参数同时使用 (optional) (default to undefined)
let limit: number; //用于顺序列出分页时本地列出的项目数限制，不能与 page 和 page_size 参数同时使用 (optional) (default to undefined)
let page: number; //分页码，默认第一页，不能与 marker 和 limit 参数同时使用 (optional) (default to undefined)
let pageSize: number; //分页大小，默认 20，不能与 marker 和 limit 参数同时使用 (optional) (default to 20)
let orderBy: 'name' | 'modificationTime' | 'size' | 'creationTime' | 'localCreationTime' | 'localModificationTime'; //排序字段，name|modificationTime|size|creationTime|localCreationTime|localModificationTime (optional) (default to 'name')
let orderByType: 'asc' | 'desc'; //排序方式，升序为 asc，降序为 desc (optional) (default to 'asc')
let filter: 'onlyDir' | 'onlyFile'; //筛选方式，不传返回全部，onlyDir 只返回文件夹，onlyFile 只返回文件 (optional) (default to undefined)
let sortType: 'union'; //排序方式，不传则文件和文件夹单独排序，先返回文件夹，后返回文件。union 文件和文件夹拉通排序 (optional) (default to undefined)
let withInode: 0 | 1; //是否返回 inode，即文件目录 ID，0 或 1，默认不返回 (optional) (default to 0)
let withFavoriteStatus: 0 | 1; //是否返回收藏状态，0 或 1，默认不返回 (optional) (default to 0)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.listDirectory(
    libraryId,
    spaceId,
    filePath,
    marker,
    limit,
    page,
    pageSize,
    orderBy,
    orderByType,
    filter,
    sortType,
    withInode,
    withFavoriteStatus,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **marker** | [**string**] | 用于顺序列出分页的标识，不能与 page 和 page_size 参数同时使用 | (optional) defaults to undefined|
| **limit** | [**number**] | 用于顺序列出分页时本地列出的项目数限制，不能与 page 和 page_size 参数同时使用 | (optional) defaults to undefined|
| **page** | [**number**] | 分页码，默认第一页，不能与 marker 和 limit 参数同时使用 | (optional) defaults to undefined|
| **pageSize** | [**number**] | 分页大小，默认 20，不能与 marker 和 limit 参数同时使用 | (optional) defaults to 20|
| **orderBy** | [**&#39;name&#39; | &#39;modificationTime&#39; | &#39;size&#39; | &#39;creationTime&#39; | &#39;localCreationTime&#39; | &#39;localModificationTime&#39;**]**Array<&#39;name&#39; &#124; &#39;modificationTime&#39; &#124; &#39;size&#39; &#124; &#39;creationTime&#39; &#124; &#39;localCreationTime&#39; &#124; &#39;localModificationTime&#39;>** | 排序字段，name|modificationTime|size|creationTime|localCreationTime|localModificationTime | (optional) defaults to 'name'|
| **orderByType** | [**&#39;asc&#39; | &#39;desc&#39;**]**Array<&#39;asc&#39; &#124; &#39;desc&#39;>** | 排序方式，升序为 asc，降序为 desc | (optional) defaults to 'asc'|
| **filter** | [**&#39;onlyDir&#39; | &#39;onlyFile&#39;**]**Array<&#39;onlyDir&#39; &#124; &#39;onlyFile&#39;>** | 筛选方式，不传返回全部，onlyDir 只返回文件夹，onlyFile 只返回文件 | (optional) defaults to undefined|
| **sortType** | [**&#39;union&#39;**]**Array<&#39;union&#39;>** | 排序方式，不传则文件和文件夹单独排序，先返回文件夹，后返回文件。union 文件和文件夹拉通排序 | (optional) defaults to undefined|
| **withInode** | [**0 | 1**]**Array<0 &#124; 1>** | 是否返回 inode，即文件目录 ID，0 或 1，默认不返回 | (optional) defaults to 0|
| **withFavoriteStatus** | [**0 | 1**]**Array<0 &#124; 1>** | 是否返回收藏状态，0 或 1，默认不返回 | (optional) defaults to 0|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**ListDirectory200Response**

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

# **moveDirectory**
> CopyDirectory200Response moveDirectory(moveDirectoryRequest)

用于重命名或移动目录或相簿。 要求权限： admin、space_admin 或 move_directory。 该接口的源和目标均需要指定完整的目录路径或相簿名；对于文件类型媒体库，源与目标可以跨越多层级多目录，来实现将目录移动到任意其他父目录下的功能，且支持同时修改目录名； 自动创建中间所需的各级父目录。 

### Example

```typescript
import {
    DirectoryApi,
    Configuration,
    MoveDirectoryRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DirectoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let moveDirectoryRequest: MoveDirectoryRequest; //
let conflictResolutionStrategy: 'ask' | 'rename'; //最后一级目录冲突时的处理方式，ask冲突时返回 HTTP 409，rename冲突时自动重命名最后一级目录，默认为 ask (optional) (default to 'ask')
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.moveDirectory(
    libraryId,
    spaceId,
    filePath,
    accessToken,
    moveDirectoryRequest,
    conflictResolutionStrategy,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **moveDirectoryRequest** | **MoveDirectoryRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **conflictResolutionStrategy** | [**&#39;ask&#39; | &#39;rename&#39;**]**Array<&#39;ask&#39; &#124; &#39;rename&#39;>** | 最后一级目录冲突时的处理方式，ask冲突时返回 HTTP 409，rename冲突时自动重命名最后一级目录，默认为 ask | (optional) defaults to 'ask'|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**CopyDirectory200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 重命名或移动成功，返回 HTTP 204 No Content（ConflictResolutionStrategy 为 ask） |  -  |
|**200** | 重命名或移动成功，返回 HTTP 200 OK（ConflictResolutionStrategy 为 rename） |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateDirectoryLabels**
> updateDirectoryLabels()

用于更新目录自定义标签。需要 admin 权限或 spaceAdmin 权限

### Example

```typescript
import {
    DirectoryApi,
    Configuration,
    UpdateDirectoryLabelsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DirectoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let update: 1; //固定为 1 (default to 1)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let updateDirectoryLabelsRequest: UpdateDirectoryLabelsRequest; // (optional)

const { status, data } = await apiInstance.updateDirectoryLabels(
    libraryId,
    spaceId,
    filePath,
    update,
    accessToken,
    updateDirectoryLabelsRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateDirectoryLabelsRequest** | **UpdateDirectoryLabelsRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **update** | [**1**]**Array<1>** | 固定为 1 | defaults to 1|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|


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
|**204** | 获取成功，返回 HTTP 204 NO CONTENT |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateFileLabels**
> updateFileLabels(updateFileLabelsRequest)

用于更新文件的标签（Labels）或分类（Category）。 需要 admin 权限或 spaceAdmin 权限。 

### Example

```typescript
import {
    DirectoryApi,
    Configuration,
    UpdateFileLabelsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DirectoryApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let update: 1; //固定为 1 (default to 1)
let updateFileLabelsRequest: UpdateFileLabelsRequest; //
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)

const { status, data } = await apiInstance.updateFileLabels(
    libraryId,
    spaceId,
    filePath,
    update,
    updateFileLabelsRequest,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateFileLabelsRequest** | **UpdateFileLabelsRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **update** | [**1**]**Array<1>** | 固定为 1 | defaults to 1|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|


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
|**204** | 获取成功，返回 HTTP 204 NO CONTENT |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

