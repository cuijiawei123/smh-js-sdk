/**
 * Loaders 模块导出入口
 * 提供文件上传和下载功能
 */

// 上传器
export { Uploader } from './Uploader';

// 下载器
export { Downloader, type IRemoteFile } from './Downloader';

// 公共基类
export { CommonLoader } from './CommonLoader';

// 类型定义
export {
  TaskStatus,
  type IFile,
  type ProgressInfo,
  type IUpPartInfo,
  type UploadCheckpoint,
  type UploadOptions,
  type IDownPartInfo,
  type DownloadCheckpoint,
  type DownloadOptions,
  type UrlDownloadOptions,
  type CommonLoaderOptions
} from './types';
