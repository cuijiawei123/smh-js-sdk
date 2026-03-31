/* tslint:disable */
/* eslint-disable */
/**
 * 腾讯云智能媒资托管服务API - SMH客户端
 * 提供集中管理和网络请求重试功能
 * 
 * @class SMHClient
 */

import { Configuration } from '../configuration';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { getUserAgent } from '../version';
import { SMHError, ErrorCode, wrapErrorToSMHError } from '../utils/ErrorHandler';

// 导入上传/下载相关
import { Uploader } from '../loaders/Uploader';
import { Downloader, IRemoteFile } from '../loaders/Downloader';
import type { UploadOptions } from '../loaders/types';
import type { DownloadOptions, UrlDownloadOptions } from '../loaders/types';

// 创建上传/下载任务时的选项类型（libraryId、spaceId、accessToken 变为可选）
type CreateUploadTaskOptions = Omit<UploadOptions, 'libraryId' | 'spaceId' | 'accessToken'> & {
    libraryId?: string;
    spaceId?: string;
    accessToken?: string;
};

type CreateDownloadTaskOptions = Omit<DownloadOptions, 'libraryId' | 'spaceId' | 'accessToken'> & {
    libraryId?: string;
    spaceId?: string;
    accessToken?: string;
};

type UrlDownloadClientOptions = Omit<UrlDownloadOptions, 'libraryId' | 'spaceId' | 'accessToken'> & {
    libraryId?: string;
    spaceId?: string;
    accessToken?: string;
};

// 导入所有API类
import { BatchApi } from '../apis/batch-api';
import { DirectoryApi } from '../apis/directory-api';
import { FavoriteApi } from '../apis/favorite-api';
import { FileApi } from '../apis/file-api';
import { HistoryApi } from '../apis/history-api';
import { QuotaApi } from '../apis/quota-api';
import { RecentApi } from '../apis/recent-api';
import { RecycledApi } from '../apis/recycled-api';
import { SearchApi } from '../apis/search-api';
import { SpaceApi } from '../apis/space-api';
import { TaskApi } from '../apis/task-api';
import { TokenApi } from '../apis/token-api';
import { UsageApi } from '../apis/usage-api';

export interface SMHClientOptions {
    basePath?: string;
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
    baseOptions?: any;
    libraryId?: string;
    spaceId?: string;
    accessToken?: string;
}


// 类型工具：将接口中的 libraryId、spaceId 和 accessToken 变为可选
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 为每个 API 的请求参数类型创建包装类型
type WrapApiMethods<T> = {
    [K in keyof T]: T[K] extends (requestParameters: infer P, ...args: infer A) => infer R
        ? P extends { libraryId: string; spaceId: string; accessToken?: string }
            ? (requestParameters: MakeOptional<P, 'libraryId' | 'spaceId' | 'accessToken'>, ...args: A) => R
            : P extends { libraryId: string; accessToken?: string }
            ? (requestParameters: MakeOptional<P, 'libraryId' | 'accessToken'>, ...args: A) => R
            : P extends { libraryId: string; spaceId: string }
            ? (requestParameters: MakeOptional<P, 'libraryId' | 'spaceId'>, ...args: A) => R
            : P extends { libraryId: string }
            ? (requestParameters: MakeOptional<P, 'libraryId'>, ...args: A) => R
            : T[K]
        : T[K];
};

export class SMHClient {
    private configuration: Configuration;
    private axiosInstance: AxiosInstance;
    private defaultLibraryId?: string;
    private defaultSpaceId?: string;
    private defaultAccessToken?: string;
    
    // 原始API实例
    private _batch: BatchApi;
    private _directory: DirectoryApi;
    private _favorite: FavoriteApi;
    private _file: FileApi;
    private _history: HistoryApi;
    private _quota: QuotaApi;
    private _recent: RecentApi;
    private _recycled: RecycledApi;
    private _search: SearchApi;
    private _space: SpaceApi;
    private _task: TaskApi;
    private _token: TokenApi;
    private _usage: UsageApi;
    
    // 包装后的API实例
    public readonly batch: WrapApiMethods<BatchApi>;
    public readonly directory: WrapApiMethods<DirectoryApi>;
    public readonly favorite: WrapApiMethods<FavoriteApi>;
    public readonly file: WrapApiMethods<FileApi>;
    public readonly history: WrapApiMethods<HistoryApi>;
    public readonly quota: WrapApiMethods<QuotaApi>;
    public readonly recent: WrapApiMethods<RecentApi>;
    public readonly recycled: WrapApiMethods<RecycledApi>;
    public readonly search: WrapApiMethods<SearchApi>;
    public readonly space: WrapApiMethods<SpaceApi>;
    public readonly task: WrapApiMethods<TaskApi>;
    public readonly token: WrapApiMethods<TokenApi>;
    public readonly usage: WrapApiMethods<UsageApi>;


    constructor(options: SMHClientOptions = {}) {
        // 保存默认参数
        this.defaultLibraryId = options.libraryId;
        this.defaultSpaceId = options.spaceId;
        this.defaultAccessToken = options.accessToken;
        
        // 创建axios实例并配置重试拦截器
        this.axiosInstance = axios.create({
            timeout: options.timeout || 30000,
            ...options.baseOptions,
        headers: {
                // TODO：暂定Client-Version，后面需改成X-SMH-SDK-Version
                'Client-Version': getUserAgent(),
                ...options.baseOptions?.headers,
            }
        });

        // 配置重试拦截器
        this.setupRetryInterceptor(options.maxRetries || 3, options.retryDelay || 1000);

        // 创建配置
        this.configuration = new Configuration({
            basePath: options.basePath,
            baseOptions: options.baseOptions
        });

        // 初始化所有原始API实例，传入 axiosInstance 使重试拦截器生效
        const basePath = this.configuration.basePath;
        this._batch = new BatchApi(this.configuration, basePath, this.axiosInstance);
        this._directory = new DirectoryApi(this.configuration, basePath, this.axiosInstance);
        this._favorite = new FavoriteApi(this.configuration, basePath, this.axiosInstance);
        this._file = new FileApi(this.configuration, basePath, this.axiosInstance);
        this._history = new HistoryApi(this.configuration, basePath, this.axiosInstance);
        this._quota = new QuotaApi(this.configuration, basePath, this.axiosInstance);
        this._recent = new RecentApi(this.configuration, basePath, this.axiosInstance);
        this._recycled = new RecycledApi(this.configuration, basePath, this.axiosInstance);
        this._search = new SearchApi(this.configuration, basePath, this.axiosInstance);
        this._space = new SpaceApi(this.configuration, basePath, this.axiosInstance);
        this._task = new TaskApi(this.configuration, basePath, this.axiosInstance);
        this._token = new TokenApi(this.configuration, basePath, this.axiosInstance);
        this._usage = new UsageApi(this.configuration, basePath, this.axiosInstance);

        // 创建包装后的API实例
        this.batch = this.wrapApi(this._batch);
        this.directory = this.wrapApi(this._directory);
        this.favorite = this.wrapApi(this._favorite);
        this.file = this.wrapApi(this._file);
        this.history = this.wrapApi(this._history);
        this.quota = this.wrapApi(this._quota);
        this.recent = this.wrapApi(this._recent);
        this.recycled = this.wrapApi(this._recycled);
        this.search = this.wrapApi(this._search);
        this.space = this.wrapApi(this._space);
        this.task = this.wrapApi(this._task);
        this.token = this.wrapApi(this._token);
        this.usage = this.wrapApi(this._usage);
    }


    /**
     * 设置重试拦截器
     */
    private setupRetryInterceptor(maxRetries: number, retryDelay: number): void {
        this.axiosInstance.interceptors.response.use(undefined, async (error: AxiosError) => {
            const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
            
        // 如果已经重试过，或者不是网络错误/服务器错误，直接返回错误
        if (!config || (config._retryCount ?? 0) >= maxRetries) {
            return Promise.reject(error);
        }

            // 只对网络错误和服务器错误进行重试
            if (error.code === 'ECONNABORTED' || 
                error.code === 'ETIMEDOUT' ||
                (error.response && error.response.status >= 500)) {
                
                config._retryCount = (config._retryCount || 0) + 1;
                
                // 计算延迟时间（指数退避）
                const delay = retryDelay * Math.pow(2, config._retryCount - 1);
                
                // 延迟后重试
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(this.axiosInstance.request(config));
                    }, delay);
                });
            }
            
            return Promise.reject(error);
        });
    }

    /**
     * 更新配置
     */
    public updateConfig(options: Partial<SMHClientOptions>): void {
        if (options.basePath) {
            this.configuration.basePath = options.basePath;
        }
        
        if (options.baseOptions) {
            this.configuration.baseOptions = {
                ...this.configuration.baseOptions,
                ...options.baseOptions
            };
        }
    }

    /**
     * 获取当前配置
     */
    public getConfig(): Configuration {
        return this.configuration;
    }

    /**
     * 设置访问令牌
     */
    public setAccessToken(token: string): void {
        this.configuration.accessToken = token;
    }

    /**
     * 清除访问令牌
     */
    public clearAccessToken(): void {
        this.configuration.accessToken = undefined;
    }

    /**
     * 更新默认的 libraryId
     */
    public setDefaultLibraryId(libraryId: string): void {
        this.defaultLibraryId = libraryId;
    }

    /**
     * 更新默认的 spaceId
     */
    public setDefaultSpaceId(spaceId: string): void {
        this.defaultSpaceId = spaceId;
    }

    /**
     * 更新默认的 accessToken
     */
    public setDefaultAccessToken(accessToken: string): void {
        this.defaultAccessToken = accessToken;
    }

    /**
     * 获取默认的 libraryId
     */
    public getDefaultLibraryId(): string | undefined {
        return this.defaultLibraryId;
    }

    /**
     * 获取默认的 spaceId
     */
    public getDefaultSpaceId(): string | undefined {
        return this.defaultSpaceId;
    }

    /**
     * 获取默认的 accessToken
     */
    public getDefaultAccessToken(): string | undefined {
        return this.defaultAccessToken;
    }

    /**
     * 包装API实例，自动注入 libraryId 和 accessToken
     */
    private wrapApi<T extends object>(apiInstance: T): any {
        return new Proxy(apiInstance, {
            get: (target: any, prop: string) => {
                const originalMethod = target[prop];
                
                // 如果不是函数，直接返回
                if (typeof originalMethod !== 'function') {
                    return originalMethod;
                }

                // 返回包装后的方法
                return async (...args: any[]) => {
                    // 第一个参数通常是 requestParameters 对象，浅拷贝避免修改调用者原始对象
                    if (args.length > 0 && typeof args[0] === 'object' && args[0] !== null) {
                        const requestParams = { ...args[0] };
                        
                        // 自动注入 libraryId（如果未提供且有默认值）
                        if (prop !== 'createToken' && prop !== 'renewToken') {
                            if (!requestParams.libraryId && this.defaultLibraryId) {
                                requestParams.libraryId = this.defaultLibraryId;
                            }
                        }
                        // 自动注入 spaceId（如果未提供且有默认值）
                        if (!requestParams.spaceId && this.defaultSpaceId) {
                            requestParams.spaceId = this.defaultSpaceId;
                        }
                        // 自动注入 accessToken（如果未提供且有默认值）
                        if (!requestParams.accessToken && this.defaultAccessToken) {
                            requestParams.accessToken = this.defaultAccessToken;
                        }

                        args[0] = requestParams;
                    }

                    try {
                        // 调用原始方法
                        const result = await originalMethod.apply(target, args);

                        // 如果是 deleteToken 操作，清理对应的 defaultAccessToken
                        if (prop === 'deleteToken' && args.length > 0 && typeof args[0] === 'object' && args[0] !== null) {
                            const requestParams = args[0];
                            // 如果删除的 token 是当前的 defaultAccessToken，则清理
                            if (requestParams.accessToken && requestParams.accessToken === this.defaultAccessToken) {
                                this.defaultAccessToken = undefined;
                            }
                        }

                        return result;
                    } catch (e: any) {
                        // 已经是 SMHError 则直接抛出
                        if (e instanceof SMHError) {
                            throw e;
                        }
                        // 将 AxiosError 等统一包装为 SMHError
                        throw wrapErrorToSMHError(
                            e,
                            ErrorCode.OPERATION_FAILED,
                            `${String(prop)} failed`,
                            { api: String(prop) }
                        );
                    }
                };
            }
        });
    }

    /**
     * 创建上传任务
     * 自动注入 libraryId、spaceId、accessToken 和 configuration
     * @returns Uploader 实例
     */
    public createUploadTask(options: CreateUploadTaskOptions): Uploader {
        const mergedOptions: UploadOptions = {
            ...options,
            libraryId: options.libraryId || this.defaultLibraryId || '',
            spaceId: options.spaceId || this.defaultSpaceId || '',
            accessToken: options.accessToken || this.defaultAccessToken || '',
        };

        return new Uploader(mergedOptions, this.configuration);
    }

    /**
     * 创建下载任务
     * 自动注入 libraryId、spaceId、accessToken 和 configuration
     * @returns Downloader 实例
     */
    public createDownloadTask(options: CreateDownloadTaskOptions): Downloader {
        const mergedOptions: DownloadOptions = {
            ...options,
            libraryId: options.libraryId || this.defaultLibraryId || '',
            spaceId: options.spaceId || this.defaultSpaceId || '',
            accessToken: options.accessToken || this.defaultAccessToken || '',
        };

        const remoteFile: IRemoteFile = {
            name: options.filePath.split('/').pop() || 'unknown',
            path: options.filePath,
            size: undefined,
            type: undefined,
        };

        return new Downloader(remoteFile, mergedOptions, this.configuration);
    }

    /**
     * 通过浏览器 URL 方式下载文件（推荐用于 Web 端）
     * 获取 cosUrl 后通过 <a> 标签触发浏览器原生下载，
     * 不需要将文件内容加载到内存中，适合任意大小的文件。
     * 
     * @example
     * ```typescript
     * await client.downloadByUrl({
     *   filePath: 'docs/file.pdf',
     *   fileName: 'my-file.pdf'  // 可选，自定义保存文件名
     * });
     * ```
     */
    public async downloadByUrl(options: UrlDownloadClientOptions): Promise<void> {
        const mergedOptions: UrlDownloadOptions = {
            ...options,
            libraryId: options.libraryId || this.defaultLibraryId || '',
            spaceId: options.spaceId || this.defaultSpaceId || '',
            accessToken: options.accessToken || this.defaultAccessToken || '',
        };

        return Downloader.downloadByUrl(mergedOptions, this.configuration);
    }

}