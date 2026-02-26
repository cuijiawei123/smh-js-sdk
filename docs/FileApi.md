# FileApi

All URIs are relative to *https://api.tencentsmh.cn*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**abortFileUpload**](#abortfileupload) | **DELETE** /api/v1/file/{LibraryId}/{SpaceId}/{ConfirmKey} | 取消上传任务|
|[**checkFileStatus**](#checkfilestatus) | **HEAD** /api/v1/file/{LibraryId}/{SpaceId}/{FilePath} | 检查文件状态|
|[**completeFileUpload**](#completefileupload) | **POST** /api/v1/file/{LibraryId}/{SpaceId}/{ConfirmKey}#1 | 完成上传文件|
|[**convertFile**](#convertfile) | **PUT** /api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#2 | 文档转码|
|[**copyFile**](#copyfile) | **PUT** /api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#3 | 复制文件|
|[**createSymlink**](#createsymlink) | **PUT** /api/v1/file/{LibraryId}/{SpaceId}/{FilePath} | 创建符号链接|
|[**deleteFile**](#deletefile) | **DELETE** /api/v1/file/{LibraryId}/{SpaceId}/{FilePath} | 删除文件|
|[**downloadFile**](#downloadfile) | **GET** /api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#2 | 下载文件|
|[**formUploadFile**](#formuploadfile) | **POST** /api/v1/file/{LibraryId}/{SpaceId}/{FilePath} | 开始表单上传文件|
|[**getCover**](#getcover) | **GET** /api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#1 | 获取照片/视频封面缩略图|
|[**getFileInfoByInode**](#getfileinfobyinode) | **GET** /api/v1/inode/{LibraryId}/{SpaceId}/{INode} | 根据文件ID查询文件信息|
|[**getFileUpload**](#getfileupload) | **GET** /api/v1/file/{LibraryId}/{SpaceId}/{ConfirmKey} | 获取文件上传任务状态|
|[**infoFile**](#infofile) | **GET** /api/v1/file/{LibraryId}/{SpaceId}/{FilePath} | 获取文件下载链接和信息|
|[**moveFile**](#movefile) | **PUT** /api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#4 | 重命名或移动文件|
|[**multipartUploadFile**](#multipartuploadfile) | **POST** /api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#1 | 开始分块上传文件|
|[**previewFile**](#previewfile) | **GET** /api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#3 | 获取 HTML 格式文档预览|
|[**renewMultipartUpload**](#renewmultipartupload) | **POST** /api/v1/file/{LibraryId}/{SpaceId}/{ConfirmKey} | 分块上传任务续期|
|[**simpleUploadFile**](#simpleuploadfile) | **PUT** /api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#1 | 开始简单上传文件|

# **abortFileUpload**
> abortFileUpload()

用于取消上传任务。 要求权限： admin、space_admin、upload_file、upload_file_force、begin_upload 或 begin_upload_force（注意：虽然本接口为删除接口，但因为删除的是上传任务信息，故仍需上传文件的相关权限） 如果上传任务为分块上传任务，那么该请求将同时放弃 COS 中的分块上传任务。 

### Example

```typescript
import {
    FileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let confirmKey: string; //确认参数 (default to undefined)
let upload: 1; //上传任务标识 (default to 1)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.abortFileUpload(
    libraryId,
    spaceId,
    confirmKey,
    upload,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **confirmKey** | [**string**] | 确认参数 | defaults to undefined|
| **upload** | [**1**]**Array<1>** | 上传任务标识 | defaults to 1|
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
|**204** | 删除成功，返回 HTTP 204 No Content |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **checkFileStatus**
> checkFileStatus()

用于检查文件状态

### Example

```typescript
import {
    FileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let historyId: string; //历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版 (optional) (default to undefined)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.checkFileStatus(
    libraryId,
    spaceId,
    filePath,
    historyId,
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
| **historyId** | [**string**] | 历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版 | (optional) defaults to undefined|
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
|**200** | 文件存在，返回 HTTP 200 OK |  * x-smh-type - 文件类型 <br>  * x-smh-creation-time - 文件完成上传的时间 <br>  * x-smh-modification-time - 文件最近一次被覆盖的时间 <br>  * x-smh-content-type - 媒体类型 <br>  * x-smh-size - 文件大小 <br>  * x-smh-etag - 文件 ETag <br>  * x-smh-crc64 - 文件的 CRC64-ECMA182 校验值，为了避免数字精度问题，这里为字符串格式 <br>  * x-smh-meta-* - 自定义元数据 <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **completeFileUpload**
> CompleteFileUpload200Response completeFileUpload()

用于完成上传文件。 要求权限：admin、space_admin、upload_file、upload_file_force 或 confirm_upload。 在文件上传完成后，请务必及时调用该接口，否则文件将不能被正确存储；如果调用该接口时实际并未完成文件上传，将返回错误信息。 

### Example

```typescript
import {
    FileApi,
    Configuration,
    CompleteFileUploadRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let confirmKey: string; //确认参数，指定为开始上传文件时响应体中的 confirmKey 字段的值 (default to undefined)
let confirm: 1; //完成上传标识 (default to 1)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let conflictResolutionStrategy: 'ask' | 'rename' | 'overwrite'; //文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件；不传则沿用开始上传时的设置 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let withInode: 0 | 1; //是否返回 inode（文件目录 ID），0 或 1，默认 0 (optional) (default to 0)
let completeFileUploadRequest: CompleteFileUploadRequest; // (optional)

const { status, data } = await apiInstance.completeFileUpload(
    libraryId,
    spaceId,
    confirmKey,
    confirm,
    accessToken,
    conflictResolutionStrategy,
    userId,
    withInode,
    completeFileUploadRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **completeFileUploadRequest** | **CompleteFileUploadRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **confirmKey** | [**string**] | 确认参数，指定为开始上传文件时响应体中的 confirmKey 字段的值 | defaults to undefined|
| **confirm** | [**1**]**Array<1>** | 完成上传标识 | defaults to 1|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **conflictResolutionStrategy** | [**&#39;ask&#39; | &#39;rename&#39; | &#39;overwrite&#39;**]**Array<&#39;ask&#39; &#124; &#39;rename&#39; &#124; &#39;overwrite&#39;>** | 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件；不传则沿用开始上传时的设置 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **withInode** | [**0 | 1**]**Array<0 &#124; 1>** | 是否返回 inode（文件目录 ID），0 或 1，默认 0 | (optional) defaults to 0|


### Return type

**CompleteFileUpload200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 上传成功，返回 HTTP 200 OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **convertFile**
> ConvertFile202Response convertFile(convertFileRequest)

用于转换文档格式，当前仅支持 doc/docx 转 pdf。 要求权限： 非 acl 鉴权：admin、space_admin acl 鉴权：canDownload（当前文件夹可下载）& canUpload（目标文件夹可上传） 非 acl 鉴权是指当前用户对所有文件的操作权限，详情可参考生成访问令牌接口； acl 鉴权是通过共享授权接口给指定用户，以文件夹为单位授予的权限，详情可参考角色授权模块； 该接口的源和目标均需要指定完整的文件路径，源与目标可以跨越目录，来实现将文件移动到任意其他目录下的功能，且支持同时修改文件名； 不会自动创建中间所需的各级父目录，所以必须保证路径的各级目录存在。 

### Example

```typescript
import {
    FileApi,
    Configuration,
    ConvertFileRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let convert: 1; //文档转码操作标识，固定值为1 (default to 1)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let convertFileRequest: ConvertFileRequest; //
let conflictResolutionStrategy: 'ask' | 'rename' | 'overwrite'; //文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename (optional) (default to 'rename')
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.convertFile(
    libraryId,
    spaceId,
    filePath,
    convert,
    accessToken,
    convertFileRequest,
    conflictResolutionStrategy,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **convertFileRequest** | **ConvertFileRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **convert** | [**1**]**Array<1>** | 文档转码操作标识，固定值为1 | defaults to 1|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **conflictResolutionStrategy** | [**&#39;ask&#39; | &#39;rename&#39; | &#39;overwrite&#39;**]**Array<&#39;ask&#39; &#124; &#39;rename&#39; &#124; &#39;overwrite&#39;>** | 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename | (optional) defaults to 'rename'|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**ConvertFile202Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**202** | 文档转码任务创建成功，返回 HTTP 202 Accepted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **copyFile**
> CopyFile200Response copyFile(copyFileRequest)

用于复制文件。 要求权限： admin、space_admin 或 copy_file/copy_file_force。 该接口的源和目标均需要指定完整的文件路径，源与目标可以跨越目录，来实现将文件复制到任意其他目录下的功能，且支持同时修改文件名； 不会自动创建中间所需的各级父目录，所以必须保证路径的各级目录存在。 

### Example

```typescript
import {
    FileApi,
    Configuration,
    CopyFileRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let copyFileRequest: CopyFileRequest; //
let conflictResolutionStrategy: 'ask' | 'rename' | 'overwrite'; //文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename (optional) (default to 'rename')
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.copyFile(
    libraryId,
    spaceId,
    filePath,
    accessToken,
    copyFileRequest,
    conflictResolutionStrategy,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **copyFileRequest** | **CopyFileRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **conflictResolutionStrategy** | [**&#39;ask&#39; | &#39;rename&#39; | &#39;overwrite&#39;**]**Array<&#39;ask&#39; &#124; &#39;rename&#39; &#124; &#39;overwrite&#39;>** | 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename | (optional) defaults to 'rename'|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**CopyFile200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 复制成功，返回 HTTP 200 OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createSymlink**
> CreateSymlink200Response createSymlink(createSymlinkRequest)

用于创建符号链接。 要求权限： 非 acl 鉴权：admin、space_admin 或 upload_file/upload_file_force/create_symlink/create_symlink_force acl 鉴权：canUpload（当前文件夹可上传） 非 acl 鉴权是指当前用户对所有文件的操作权限，详情可参考生成访问令牌接口； acl 鉴权是通过共享授权接口给指定用户，以文件夹为单位授予的权限，详情可参考角色授权模块； 符号链接本身与文件的概念一致，可以通过删除文件、重命名或移动文件、复制文件等接口删除、重命名或移动或复制符号链接本身，而不会影响符号链接所指向的文件； 与标准文件系统略有不同，符号链接所指向的文件，不会因为重命名或移动而丢失指向； 当符号链接指向的文件被覆盖上传时，该符号链接将指向新上传的文件。 

### Example

```typescript
import {
    FileApi,
    Configuration,
    CreateSymlinkRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let createSymlinkRequest: CreateSymlinkRequest; //
let conflictResolutionStrategy: 'ask' | 'rename' | 'overwrite'; //文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite覆盖已有文件，默认为 rename (optional) (default to 'rename')
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.createSymlink(
    libraryId,
    spaceId,
    filePath,
    accessToken,
    createSymlinkRequest,
    conflictResolutionStrategy,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createSymlinkRequest** | **CreateSymlinkRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **conflictResolutionStrategy** | [**&#39;ask&#39; | &#39;rename&#39; | &#39;overwrite&#39;**]**Array<&#39;ask&#39; &#124; &#39;rename&#39; &#124; &#39;overwrite&#39;>** | 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite覆盖已有文件，默认为 rename | (optional) defaults to 'rename'|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**CreateSymlink200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 创建成功，返回 HTTP 200 OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteFile**
> DeleteFile200Response deleteFile()

用于删除文件。 要求权限： admin、space_admin 或 delete_file（未开启回收站或 Permanent 为 0）/delete_file_permanent（开启回收站且 Permanent 为 1） 如果媒体库启用回收站功能，则该接口不会永久删除文件，而是将文件移入回收站，可通过相关接口永久删除或恢复回收站内的文件，或直接清空回收站。 

### Example

```typescript
import {
    FileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let permanent: 0 | 1; //当媒体库开启回收站时，则该参数指定将文件移入回收站还是永久删除文件，1: 永久删除，0: 移入回收站，默认为 0 (optional) (default to 0)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.deleteFile(
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
| **permanent** | [**0 | 1**]**Array<0 &#124; 1>** | 当媒体库开启回收站时，则该参数指定将文件移入回收站还是永久删除文件，1: 永久删除，0: 移入回收站，默认为 0 | (optional) defaults to 0|
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

# **downloadFile**
> downloadFile()

用于下载文件。 可以直接在使用文件的参数中指定该 URL，例如对于图片文件可直接在小程序 <image> 标签、 HTML <img> 标签或小程序 wx.previewImage 接口等中使用，该接口将自动 302 跳转到真实的图片 URL；视频和文件同理； 

### Example

```typescript
import {
    FileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let historyId: string; //历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版 (optional) (default to undefined)
let contentDisposition: 'inline' | 'attachment'; //用于设置Content-Disposition响应头，支持 inline 或者 attachment，可选参数，不传默认为inline (optional) (default to 'inline')
let purpose: 'download' | 'preview'; //用途，可选参数，可以设置为download或者preview，用于决定是否将该文件加入最近使用文件列表中，如果设置为preview，则会将该文件加入最近使用文件列表中，否则不会加入 (optional) (default to undefined)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let trafficLimit: number; //单链接下载限速，范围100KB/s-100MB/s，单位B (optional) (default to undefined)

const { status, data } = await apiInstance.downloadFile(
    libraryId,
    spaceId,
    filePath,
    historyId,
    contentDisposition,
    purpose,
    accessToken,
    userId,
    trafficLimit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **historyId** | [**string**] | 历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版 | (optional) defaults to undefined|
| **contentDisposition** | [**&#39;inline&#39; | &#39;attachment&#39;**]**Array<&#39;inline&#39; &#124; &#39;attachment&#39;>** | 用于设置Content-Disposition响应头，支持 inline 或者 attachment，可选参数，不传默认为inline | (optional) defaults to 'inline'|
| **purpose** | [**&#39;download&#39; | &#39;preview&#39;**]**Array<&#39;download&#39; &#124; &#39;preview&#39;>** | 用途，可选参数，可以设置为download或者preview，用于决定是否将该文件加入最近使用文件列表中，如果设置为preview，则会将该文件加入最近使用文件列表中，否则不会加入 | (optional) defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **trafficLimit** | [**number**] | 单链接下载限速，范围100KB/s-100MB/s，单位B | (optional) defaults to undefined|


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
|**302** | 获取成功，返回 HTTP 302 Found |  * Location - 可直接用于展示或下载的文件 URL <br>  * x-smh-type - 文件类型 <br>  * x-smh-creation-time - 文件完成上传的时间 <br>  * x-smh-modification-time - 文件最近一次被覆盖的时间 <br>  * x-smh-content-type - 媒体类型 <br>  * x-smh-size - 文件大小 <br>  * x-smh-etag - 文件 ETag <br>  * x-smh-crc64 - 文件的 CRC64-ECMA182 校验值，为了避免数字精度问题，这里为字符串格式 <br>  * x-smh-meta-* - 自定义元数据 <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **formUploadFile**
> FormUploadFile200Response formUploadFile()

用于开始表单上传文件（multipart/form-data）。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 调用该接口将返回一系列用于 form 表单上传（multipart/form-data 格式）和确认上传完成的参数，上传的目标 URL 为 https://{Domain}/，其中 Domain 为响应体中的 domain 字段，例如 https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/； form 表单上传时还需要指定一系列额外的信息字段，这些字段的名和值包含在响应体中的 form 字段中，可以在 HTML form 表单中通过隐藏域或通过 JS 相关库、小程序 wx.uploadFile 等指定这些字段； form 表单中的文件字段，其表单字段名固定为 file，且必须作为表单中的最后一项； 在完成实际上传后，上传的目标 URL 将返回 HTTP 204 No Content，由于可能的跨域限制，建议直接通过相关接口的回调来判断是否上传完成，并且在上传完成后及时调用完成上传文件接口，确认上传结果； 默认情况下同名文件将自动修改文件名，可在完成上传文件接口中获取最终的文件路径； 不会自动创建所需的各级父目录，所以必须保证路径的各级目录存在。 

### Example

```typescript
import {
    FileApi,
    Configuration,
    FormUploadFileRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let conflictResolutionStrategy: 'ask' | 'rename' | 'overwrite'; //文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename (optional) (default to 'rename')
let filesize: number; //上传文件大小，单位为字节（Byte），用于判断剩余空间是否足够 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let xSmhMeta: string; //自定义元数据，名称以 x-smh-meta- 开头的扩展头，值为字符串 (optional) (default to undefined)
let trafficLimit: number; //单链接下载限速，范围100KB/s-100MB/s，单位B (optional) (default to undefined)
let preferSameOrigin: boolean; //是否倾向于保持相同域名，可选参数，可能的值为 true 或 false。此参数仅当上传文件的路径存在同名文件，且 ConflictResolutionStrategy 设置为 rename 或 overwrite 时生效。当设置此参数时，后台会尽量保证新上传的文件与原文件使用相同的域名进行上传或下载，但在特殊情况下仍有可能使用不同域名，因此不应过于依赖此参数。 (optional) (default to undefined)
let formUploadFileRequest: FormUploadFileRequest; // (optional)

const { status, data } = await apiInstance.formUploadFile(
    libraryId,
    spaceId,
    filePath,
    accessToken,
    conflictResolutionStrategy,
    filesize,
    userId,
    xSmhMeta,
    trafficLimit,
    preferSameOrigin,
    formUploadFileRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **formUploadFileRequest** | **FormUploadFileRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **conflictResolutionStrategy** | [**&#39;ask&#39; | &#39;rename&#39; | &#39;overwrite&#39;**]**Array<&#39;ask&#39; &#124; &#39;rename&#39; &#124; &#39;overwrite&#39;>** | 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename | (optional) defaults to 'rename'|
| **filesize** | [**number**] | 上传文件大小，单位为字节（Byte），用于判断剩余空间是否足够 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **xSmhMeta** | [**string**] | 自定义元数据，名称以 x-smh-meta- 开头的扩展头，值为字符串 | (optional) defaults to undefined|
| **trafficLimit** | [**number**] | 单链接下载限速，范围100KB/s-100MB/s，单位B | (optional) defaults to undefined|
| **preferSameOrigin** | [**boolean**] | 是否倾向于保持相同域名，可选参数，可能的值为 true 或 false。此参数仅当上传文件的路径存在同名文件，且 ConflictResolutionStrategy 设置为 rename 或 overwrite 时生效。当设置此参数时，后台会尽量保证新上传的文件与原文件使用相同的域名进行上传或下载，但在特殊情况下仍有可能使用不同域名，因此不应过于依赖此参数。 | (optional) defaults to undefined|


### Return type

**FormUploadFile200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 上传任务创建成功，返回 HTTP 201 Created（不符合秒传条件时返回） |  -  |
|**202** | beginningHash 匹配秒传文件，返回 HTTP 202 Accepted（响应体为空） |  -  |
|**200** | fullHash 匹配秒传文件，返回 HTTP 200 OK（完全符合秒传条件时返回） |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCover**
> getCover()

用于获取照片/视频封面缩略图。 视频封面使用该视频的首帧图片； 针对照片或视频封面，优先使用人脸识别智能缩放裁剪为 {Size}px × {Size}px 大小，如果未识别到人脸则居中缩放裁剪为 {Size}px × {Size}px 大小，如果未指定 {Size} 参数则使用照片或视频封面原图，最后 302 跳转到对应的图片的 URL； 可以直接在使用图片的参数中指定该 URL，例如小程序 <image> 标签、 HTML <img> 标签或小程序 wx.previewImage 接口等，该接口将自动 302 跳转到真实的图片 URL； 如果文件不属于可预览的媒体类型，则会跳转至文件的下载链接。 

### Example

```typescript
import {
    FileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let preview: number; //预览标识，固定值为1 (default to 1)
let size: number; //缩放大小，优先使用人脸识别智能缩放裁剪为 size×size，未识别到人脸则居中缩放裁剪为 size×size；不传则使用原图 (optional) (default to undefined)
let scale: number; //等比例缩放百分比（1-100），当未传 size 时生效 (optional) (default to undefined)
let widthSize: number; //缩放宽度，当未传 size 和 scale 时生效；未传高度时，高度按等比例缩放 (optional) (default to undefined)
let heightSize: number; //缩放高度，当未传 size 和 scale 时生效；未传宽度时，宽度按等比例缩放 (optional) (default to undefined)
let frameNumber: number; //帧数，针对 gif 的降帧处理 (optional) (default to undefined)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.getCover(
    libraryId,
    spaceId,
    filePath,
    preview,
    size,
    scale,
    widthSize,
    heightSize,
    frameNumber,
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
| **preview** | [**number**] | 预览标识，固定值为1 | defaults to 1|
| **size** | [**number**] | 缩放大小，优先使用人脸识别智能缩放裁剪为 size×size，未识别到人脸则居中缩放裁剪为 size×size；不传则使用原图 | (optional) defaults to undefined|
| **scale** | [**number**] | 等比例缩放百分比（1-100），当未传 size 时生效 | (optional) defaults to undefined|
| **widthSize** | [**number**] | 缩放宽度，当未传 size 和 scale 时生效；未传高度时，高度按等比例缩放 | (optional) defaults to undefined|
| **heightSize** | [**number**] | 缩放高度，当未传 size 和 scale 时生效；未传宽度时，宽度按等比例缩放 | (optional) defaults to undefined|
| **frameNumber** | [**number**] | 帧数，针对 gif 的降帧处理 | (optional) defaults to undefined|
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
|**302** | 获取成功，返回 HTTP 302 Found，响应头 Location 包含可直接用于展示或下载的文件 URL |  * Location - 可直接用于展示或下载的文件 URL <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFileInfoByInode**
> GetFileInfoByInode200Response getFileInfoByInode()

根据文件 ID 查询文件信息

### Example

```typescript
import {
    FileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let iNode: string; //文件ID (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)

const { status, data } = await apiInstance.getFileInfoByInode(
    libraryId,
    spaceId,
    iNode,
    accessToken
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **iNode** | [**string**] | 文件ID | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|


### Return type

**GetFileInfoByInode200Response**

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

# **getFileUpload**
> GetFileUpload200Response getFileUpload()

用于获取文件上传任务状态。 要求权限： admin、space_admin、upload_file、upload_file_force、begin_upload 或 begin_upload_force（注意：虽然本接口为读接口，但因为读取的是上传任务信息，故仍需上传文件的相关权限） 

### Example

```typescript
import {
    FileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let confirmKey: string; //确认参数 (default to undefined)
let upload: 1; //上传任务标识 (default to 1)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.getFileUpload(
    libraryId,
    spaceId,
    confirmKey,
    upload,
    accessToken,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **confirmKey** | [**string**] | 确认参数 | defaults to undefined|
| **upload** | [**1**]**Array<1>** | 上传任务标识 | defaults to 1|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**GetFileUpload200Response**

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

# **infoFile**
> InfoFile200Response infoFile()

用于获取文件下载链接和信息。 要求权限：无 

### Example

```typescript
import {
    FileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let info: 1; //获取文件信息标识 (default to 1)
let historyId: string; //历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版 (optional) (default to undefined)
let contentDisposition: 'inline' | 'attachment'; //用于设置Content-Disposition响应头，支持 inline 或者 attachment，可选参数，不传默认为inline (optional) (default to 'inline')
let purpose: 'download' | 'preview'; //用途，可选参数，可以设置为download或者preview，用于决定是否将该文件加入最近使用文件列表中，如果设置为preview，则会将该文件加入最近使用文件列表中，否则不会加入 (optional) (default to undefined)
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let trafficLimit: number; //单链接下载限速，范围100KB/s-100MB/s，单位B (optional) (default to undefined)
let preCheck: 1; //是否只用于校验文件是否可预览和下载，设置该参数后返回结果中不包含cosUrl (optional) (default to undefined)

const { status, data } = await apiInstance.infoFile(
    libraryId,
    spaceId,
    filePath,
    info,
    historyId,
    contentDisposition,
    purpose,
    accessToken,
    userId,
    trafficLimit,
    preCheck
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **info** | [**1**]**Array<1>** | 获取文件信息标识 | defaults to 1|
| **historyId** | [**string**] | 历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版 | (optional) defaults to undefined|
| **contentDisposition** | [**&#39;inline&#39; | &#39;attachment&#39;**]**Array<&#39;inline&#39; &#124; &#39;attachment&#39;>** | 用于设置Content-Disposition响应头，支持 inline 或者 attachment，可选参数，不传默认为inline | (optional) defaults to 'inline'|
| **purpose** | [**&#39;download&#39; | &#39;preview&#39;**]**Array<&#39;download&#39; &#124; &#39;preview&#39;>** | 用途，可选参数，可以设置为download或者preview，用于决定是否将该文件加入最近使用文件列表中，如果设置为preview，则会将该文件加入最近使用文件列表中，否则不会加入 | (optional) defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **trafficLimit** | [**number**] | 单链接下载限速，范围100KB/s-100MB/s，单位B | (optional) defaults to undefined|
| **preCheck** | [**1**]**Array<1>** | 是否只用于校验文件是否可预览和下载，设置该参数后返回结果中不包含cosUrl | (optional) defaults to undefined|


### Return type

**InfoFile200Response**

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

# **moveFile**
> MoveFile200Response moveFile(moveFileRequest)

用于重命名或移动文件。 要求权限： admin、space_admin 或 move_file/move_file_force。 该接口的源和目标均需要指定完整的文件路径，源与目标可以跨越目录，来实现将文件移动到任意其他目录下的功能，且支持同时修改文件名； 不会自动创建中间所需的各级父目录，所以必须保证路径的各级目录存在。 

### Example

```typescript
import {
    FileApi,
    Configuration,
    MoveFileRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let moveFileRequest: MoveFileRequest; //
let conflictResolutionStrategy: 'ask' | 'rename' | 'overwrite'; //文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename (optional) (default to 'rename')
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.moveFile(
    libraryId,
    spaceId,
    filePath,
    accessToken,
    moveFileRequest,
    conflictResolutionStrategy,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **moveFileRequest** | **MoveFileRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **conflictResolutionStrategy** | [**&#39;ask&#39; | &#39;rename&#39; | &#39;overwrite&#39;**]**Array<&#39;ask&#39; &#124; &#39;rename&#39; &#124; &#39;overwrite&#39;>** | 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename | (optional) defaults to 'rename'|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|


### Return type

**MoveFile200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 重命名或移动成功，返回 HTTP 200 OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **multipartUploadFile**
> MultipartUploadFile200Response multipartUploadFile()

用于开始分块上传文件。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 分块上传指使用通过 HTTP PUT 请求上传一个文件的分块，通过多次上传完成整个文件的上传，每次请求的请求体为文件内容的单个分块； 调用该接口将返回一系列用于分块上传请求和确认上传完成的参数，上传的目标 URL 为 https://{Domain}{Path}?uploadId={UploadId}&partNumber={PartNumber}，其中 Domain 为响应体中的 domain 字段，Path 为响应体中的 path 字段，UploadId 为响应体中的 uploadId 字段，PartNumber 为从 1 开始的分块顺序，例如 https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/smhxxx/xxx.mp4?uploadId=xxx&partNumber=1； 上传每个分块时还需要指定一系列额外的请求头部字段，这些字段的名和值包含在响应体中的 headers 字段中； 当在浏览器使用 JS 上传文件时，需要提前在绑定的 COS 存储桶中设置跨域访问 CORS 设置； 在完成实际上传后，上传的目标 URL 将返回 HTTP 200 OK； 与对象存储 COS 的分块上传不同，SMH 的分块上传无需记录 ETag，也无需在完成上传时传入这些 ETag，只需保证上传分块的连续即可，SMH 将在完成上传时自动执行这些操作； 默认情况下同名文件将自动修改文件名，可在完成上传文件接口中获取最终的文件路径； 不会自动创建所需的各级父目录，所以必须保证路径的各级目录存在。 

### Example

```typescript
import {
    FileApi,
    Configuration,
    MultipartUploadFileRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let multipart: 1; //是否为分块上传标识，固定值为1 (default to 1)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let conflictResolutionStrategy: 'ask' | 'rename' | 'overwrite'; //文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename (optional) (default to 'rename')
let filesize: number; //上传文件大小，单位为字节（Byte），用于判断剩余空间是否足够 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let xSmhMeta: string; //自定义元数据，名称以 x-smh-meta- 开头的扩展头，值为字符串 (optional) (default to undefined)
let trafficLimit: number; //单链接下载限速，范围100KB/s-100MB/s，单位B (optional) (default to undefined)
let preferSameOrigin: boolean; //是否倾向于保持相同域名，可选参数，可能的值为 true 或 false。此参数仅当上传文件的路径存在同名文件，且 ConflictResolutionStrategy 设置为 rename 或 overwrite 时生效。当设置此参数时，后台会尽量保证新上传的文件与原文件使用相同的域名进行上传或下载，但在特殊情况下仍有可能使用不同域名，因此不应过于依赖此参数。 (optional) (default to undefined)
let multipartUploadFileRequest: MultipartUploadFileRequest; // (optional)

const { status, data } = await apiInstance.multipartUploadFile(
    libraryId,
    spaceId,
    filePath,
    multipart,
    accessToken,
    conflictResolutionStrategy,
    filesize,
    userId,
    xSmhMeta,
    trafficLimit,
    preferSameOrigin,
    multipartUploadFileRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **multipartUploadFileRequest** | **MultipartUploadFileRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **multipart** | [**1**]**Array<1>** | 是否为分块上传标识，固定值为1 | defaults to 1|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **conflictResolutionStrategy** | [**&#39;ask&#39; | &#39;rename&#39; | &#39;overwrite&#39;**]**Array<&#39;ask&#39; &#124; &#39;rename&#39; &#124; &#39;overwrite&#39;>** | 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename | (optional) defaults to 'rename'|
| **filesize** | [**number**] | 上传文件大小，单位为字节（Byte），用于判断剩余空间是否足够 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **xSmhMeta** | [**string**] | 自定义元数据，名称以 x-smh-meta- 开头的扩展头，值为字符串 | (optional) defaults to undefined|
| **trafficLimit** | [**number**] | 单链接下载限速，范围100KB/s-100MB/s，单位B | (optional) defaults to undefined|
| **preferSameOrigin** | [**boolean**] | 是否倾向于保持相同域名，可选参数，可能的值为 true 或 false。此参数仅当上传文件的路径存在同名文件，且 ConflictResolutionStrategy 设置为 rename 或 overwrite 时生效。当设置此参数时，后台会尽量保证新上传的文件与原文件使用相同的域名进行上传或下载，但在特殊情况下仍有可能使用不同域名，因此不应过于依赖此参数。 | (optional) defaults to undefined|


### Return type

**MultipartUploadFile200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 上传任务创建成功，返回 HTTP 201 Created（不符合秒传条件时返回） |  -  |
|**202** | beginningHash 匹配秒传文件，返回 HTTP 202 Accepted（响应体为空） |  -  |
|**200** | fullHash 匹配秒传文件，返回 HTTP 200 OK（完全符合秒传条件时返回） |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **previewFile**
> previewFile()

用于获取 HTML 格式文档预览。 返回HTML或JPG格式的文档用于预览； 如果文件不属于可预览的文档类型，则会跳转至文件的下载链接。 

### Example

```typescript
import {
    FileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let preview: 1; //文档预览标识，固定值为1 (default to 1)
let historyId: string; //历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版 (optional) (default to undefined)
let type: string; //文档预览方式，如果设置为 pic 则以 jpg 格式预览文档首页，否则以 html 格式预览文档 (optional) (default to 'html')
let accessToken: string; //访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)

const { status, data } = await apiInstance.previewFile(
    libraryId,
    spaceId,
    filePath,
    preview,
    historyId,
    type,
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
| **preview** | [**1**]**Array<1>** | 文档预览标识，固定值为1 | defaults to 1|
| **historyId** | [**string**] | 历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版 | (optional) defaults to undefined|
| **type** | [**string**] | 文档预览方式，如果设置为 pic 则以 jpg 格式预览文档首页，否则以 html 格式预览文档 | (optional) defaults to 'html'|
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
|**302** | 获取成功，返回 HTTP 302 Found，响应头 Location 包含可直接用于展示或下载的文件 URL |  * Location - 可直接用于展示或下载的文件 URL <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **renewMultipartUpload**
> RenewMultipartUpload200Response renewMultipartUpload()

用于分块上传任务续期。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 仅支持分块上传任务的续期。 

### Example

```typescript
import {
    FileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let confirmKey: string; //确认参数，指定为开始上传文件时响应体中的 confirmKey 字段的值 (default to undefined)
let renew: 1; //续期标识 (default to 1)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let trafficLimit: number; //单链接下载限速，范围100KB/s-100MB/s，单位B (optional) (default to undefined)

const { status, data } = await apiInstance.renewMultipartUpload(
    libraryId,
    spaceId,
    confirmKey,
    renew,
    accessToken,
    userId,
    trafficLimit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **confirmKey** | [**string**] | 确认参数，指定为开始上传文件时响应体中的 confirmKey 字段的值 | defaults to undefined|
| **renew** | [**1**]**Array<1>** | 续期标识 | defaults to 1|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **trafficLimit** | [**number**] | 单链接下载限速，范围100KB/s-100MB/s，单位B | (optional) defaults to undefined|


### Return type

**RenewMultipartUpload200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 续期成功，返回 HTTP 200 OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **simpleUploadFile**
> SimpleUploadFile200Response simpleUploadFile()

用于开始简单上传文件。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 PUT 简单上传指使用 HTTP PUT 请求上传一个文件，请求体即为文件的内容； 调用该接口将返回一系列用于 PUT 简单上传请求和确认上传完成的参数，上传的目标 URL 为 https://{Domain}{Path}，其中 Domain 为响应体中的 domain 字段，Path 为响应体中的 path 字段，例如 https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/smhxxx/xxx.mp4； PUT 简单上传时还需要指定一系列额外的请求头部字段，这些字段的名和值包含在响应体中的 headers 字段中； 当在浏览器使用 JS 上传文件时，需要提前在绑定的 COS 存储桶中设置跨域访问 CORS 设置； 在完成实际上传后，上传的目标 URL 将返回 HTTP 200 OK； 默认情况下同名文件将自动修改文件名，可在完成上传文件接口中获取最终的文件路径； 不会自动创建所需的各级父目录，所以必须保证路径的各级目录存在。 

### Example

```typescript
import {
    FileApi,
    Configuration,
    SimpleUploadFileRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let libraryId: string; //媒体库 ID，必选参数 (default to undefined)
let spaceId: string; //空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 (default to undefined)
let filePath: string; //文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 (default to undefined)
let accessToken: string; //访问令牌，必选参数 (default to undefined)
let conflictResolutionStrategy: 'ask' | 'rename' | 'overwrite'; //文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename (optional) (default to 'rename')
let filesize: number; //上传文件大小，单位为字节（Byte），用于判断剩余空间是否足够 (optional) (default to undefined)
let userId: string; //用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 (optional) (default to undefined)
let xSmhMeta: string; //自定义元数据，名称以 x-smh-meta- 开头的扩展头，值为字符串 (optional) (default to undefined)
let trafficLimit: number; //单链接下载限速，范围100KB/s-100MB/s，单位B (optional) (default to undefined)
let preferSameOrigin: boolean; //是否倾向于保持相同域名，可选参数，可能的值为 true 或 false。此参数仅当上传文件的路径存在同名文件，且 ConflictResolutionStrategy 设置为 rename 或 overwrite 时生效。当设置此参数时，后台会尽量保证新上传的文件与原文件使用相同的域名进行上传或下载，但在特殊情况下仍有可能使用不同域名，因此不应过于依赖此参数。 (optional) (default to undefined)
let simpleUploadFileRequest: SimpleUploadFileRequest; // (optional)

const { status, data } = await apiInstance.simpleUploadFile(
    libraryId,
    spaceId,
    filePath,
    accessToken,
    conflictResolutionStrategy,
    filesize,
    userId,
    xSmhMeta,
    trafficLimit,
    preferSameOrigin,
    simpleUploadFileRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **simpleUploadFileRequest** | **SimpleUploadFileRequest**|  | |
| **libraryId** | [**string**] | 媒体库 ID，必选参数 | defaults to undefined|
| **spaceId** | [**string**] | 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数 | defaults to undefined|
| **filePath** | [**string**] | 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空 | defaults to undefined|
| **accessToken** | [**string**] | 访问令牌，必选参数 | defaults to undefined|
| **conflictResolutionStrategy** | [**&#39;ask&#39; | &#39;rename&#39; | &#39;overwrite&#39;**]**Array<&#39;ask&#39; &#124; &#39;rename&#39; &#124; &#39;overwrite&#39;>** | 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename | (optional) defaults to 'rename'|
| **filesize** | [**number**] | 上传文件大小，单位为字节（Byte），用于判断剩余空间是否足够 | (optional) defaults to undefined|
| **userId** | [**string**] | 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数 | (optional) defaults to undefined|
| **xSmhMeta** | [**string**] | 自定义元数据，名称以 x-smh-meta- 开头的扩展头，值为字符串 | (optional) defaults to undefined|
| **trafficLimit** | [**number**] | 单链接下载限速，范围100KB/s-100MB/s，单位B | (optional) defaults to undefined|
| **preferSameOrigin** | [**boolean**] | 是否倾向于保持相同域名，可选参数，可能的值为 true 或 false。此参数仅当上传文件的路径存在同名文件，且 ConflictResolutionStrategy 设置为 rename 或 overwrite 时生效。当设置此参数时，后台会尽量保证新上传的文件与原文件使用相同的域名进行上传或下载，但在特殊情况下仍有可能使用不同域名，因此不应过于依赖此参数。 | (optional) defaults to undefined|


### Return type

**SimpleUploadFile200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 上传任务创建成功，返回 HTTP 201 Created（不符合秒传条件时返回） |  -  |
|**202** | beginningHash 匹配秒传文件，返回 HTTP 202 Accepted（响应体为空） |  -  |
|**200** | fullHash 匹配秒传文件，返回 HTTP 200 OK（完全符合秒传条件时返回） |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

