# CreateSearchRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**keyword** | **string** | 搜索关键字，可使用空格分隔多个关键字，关键字之间为\&quot;或\&quot;的关系并优先展示匹配关键字较多的项目 | [optional] [default to undefined]
**scope** | **string** | 搜索范围，指定搜索的目录，可选参数，如搜索根目录可指定为空字符串、\&quot;/\&quot;或不指定该字段 | [optional] [default to undefined]
**type** | [**CreateSearchRequestType**](CreateSearchRequestType.md) |  | [optional] [default to undefined]
**extname** | **Array&lt;string&gt;** | 搜索文件后缀，可选参数，字符串数组 | [optional] [default to undefined]
**minFileSize** | **number** | 搜索文件大小范围，整数，单位 Byte，可选参数 | [optional] [default to undefined]
**maxFileSize** | **number** | 搜索文件大小范围，整数，单位 Byte，可选参数 | [optional] [default to undefined]
**modificationTimeStart** | **string** | 搜索更新时间范围，时间戳字符串，与时区无关，可选参数 | [optional] [default to undefined]
**modificationTimeEnd** | **string** | 搜索更新时间范围，时间戳字符串，与时区无关，可选参数 | [optional] [default to undefined]
**orderBy** | **string** | 排序字段，可选参数，当前支持按名称、修改时间、文件大小、创建时间排序 | [optional] [default to undefined]
**orderByType** | **string** | 排序方式，升序为 asc，降序为 desc，可选参数 | [optional] [default to undefined]
**searchMode** | **string** | 搜索方式，快速为 fast，普通为 normal，可选参数，默认 normal | [optional] [default to undefined]
**labels** | **Array&lt;string&gt;** | 简易文件标签，字符串数组 | [optional] [default to undefined]
**categories** | **Array&lt;string&gt;** | 文件自定义分类信息，字符串数组 | [optional] [default to undefined]

## Example

```typescript
import { CreateSearchRequest } from './api';

const instance: CreateSearchRequest = {
    keyword,
    scope,
    type,
    extname,
    minFileSize,
    maxFileSize,
    modificationTimeStart,
    modificationTimeEnd,
    orderBy,
    orderByType,
    searchMode,
    labels,
    categories,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
