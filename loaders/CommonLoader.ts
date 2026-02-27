/**
 * CommonLoader - 上传/下载器公共基类
 * 提供状态管理、进度计算、速度统计、事件系统等公共功能
 */

import EventEmitter from '../utils/EventEmitter';
import { SMHError, ErrorCode, newError } from '../utils/ErrorHandler';
import { 
  TaskStatus, 
  IFile, 
  ProgressInfo,
  CommonLoaderOptions 
} from './types';

/**
 * CommonLoader 抽象基类
 * 提供上传/下载器的公共功能
 */
export abstract class CommonLoader<TCheckpoint = any> extends EventEmitter {
  // 任务ID
  public readonly id: string;
  
  // 文件信息
  public file: IFile;
  
  // 日志配置
  protected verbose: boolean = false;
  
  // 任务状态
  public state: TaskStatus = TaskStatus.WAITING;
  public message: string = '';
  
  // 进度信息
  public progress: number = 0;
  public loaded: number = 0;
  public speed: number = 0;
  public left_time: number = 0;
  
  // 进度计算相关
  protected startSize: number = 0;           // 断点续传时的起始大小
  protected lastEmittedProgress: number = 0; // 上次发出的进度值
  protected lastProgressLoaded: number = 0;  // updateProgress中上次的loaded值
  
  // 时间统计
  public start_time: number = 0;
  public end_time: number = 0;
  public used_avg_speed: number = 0;
  public used_time_len: number = 0;
  public avg_speed: number = 0;
  
  // 内部状态
  protected pauseFlag: boolean = false;
  protected cancelFlag: boolean = false;
  public error?: SMHError;
  
  // 取消控制器集合（支持多个并发请求同时 abort）
  protected abortControllers: Set<AbortController> = new Set();
  
  // 定时器
  protected tid_speed?: ReturnType<typeof setInterval>;
  
  // 速度计算
  protected speedList: number[] = [];
  protected speed_0_count: number = 0;
  protected upload_start_time: number = 0;
  protected start_done_part_loaded: number = 0;
  
  // 常量
  protected readonly PROGRESS_EMIT_STEP = 0.2;   // 进度触发步长
  protected readonly MAX_SPEED_0_COUNT = 10;     // 最大速度为0计数
  protected readonly MAX_RETRY_TIMES = 3;        // 最大重试次数
  
  constructor(file: IFile, options?: CommonLoaderOptions) {
    super();
    this.file = file;
    this.verbose = options?.verbose || false;
    this.id = options?.id || this.generateTaskId();
  }
  
  /**
   * 获取任务类型（子类实现）
   */
  protected abstract getTaskType(): string;
  
  /**
   * 日志输出
   */
  protected logInfo(...args: any[]): void {
    if (this.verbose) {
      const prefix = this.getTaskType().charAt(0).toUpperCase();
      console.info(`[${prefix}]`, ...args);
    }
  }
  
  protected logWarn(...args: any[]): void {
    if (this.verbose) {
      const prefix = this.getTaskType().charAt(0).toUpperCase();
      console.warn(`[${prefix}]`, ...args);
    }
  }
  
  protected logError(...args: any[]): void {
    if (this.verbose) {
      const prefix = this.getTaskType().charAt(0).toUpperCase();
      console.error(`[${prefix}]`, ...args);
    }
  }
  
  /**
   * 生成唯一任务ID
   */
  protected generateTaskId(): string {
    return `${this.getTaskType()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 获取checkpoint信息（子类实现）
   */
  abstract getCheckpoint(): TCheckpoint;
  
  /**
   * 等待开始
   */
  async wait(): Promise<void> {
    if (this.state === TaskStatus.WAITING) return;
    
    this.error = undefined;
    this.pauseCalcSpeed();
    this.pauseFlag = false;
    this.cancelFlag = false;
    
    if (this.state === TaskStatus.ERROR) {
      this.end_time = 0;
      this.message = '';
    }
    
    await this.changeState(TaskStatus.WAITING);
  }
  
  /**
   * 开始任务（子类实现）
   */
  abstract start(): Promise<void>;
  
  /**
   * 取消所有正在进行的 HTTP 请求
   */
  protected abortRequest(): void {
    for (const controller of this.abortControllers) {
      controller.abort();
    }
    this.abortControllers.clear();
  }
  
  /**
   * 创建新的取消控制器
   * 每个并发请求都持有独立的 AbortController，暂停时全部 abort
   */
  protected createAbortController(): AbortController {
    const controller = new AbortController();
    this.abortControllers.add(controller);
    return controller;
  }

  /**
   * 移除已完成请求的取消控制器
   */
  protected removeAbortController(controller: AbortController): void {
    this.abortControllers.delete(controller);
  }
  
  /**
   * 停止（暂停）任务
   */
  async pause(): Promise<void> {
    if (['paused', 'success', 'error', 'canceled'].includes(this.state)) {
      return;
    }
    
    this.pauseFlag = true;
    this.abortRequest();
    
    this.pauseCalcSpeed();
    this.calcTotalAvgSpeed();
    
    await this.changeState(TaskStatus.PAUSED);
  }
  
  /**
   * 取消任务
   */
  async cancel(): Promise<void> {
    // 防止重复调用
    if (this.cancelFlag || this.state === TaskStatus.CANCELED) {
      return;
    }
    
    this.cancelFlag = true;
    this.abortRequest();
    
    this.pauseCalcSpeed();
    this.calcTotalAvgSpeed();
  
    await this.changeState(TaskStatus.CANCELED);
  }
  
  /**
   * 开始计算速度
   */
  protected startCalcSpeed(): void {
    this.left_time = 0;
    this.speed = 0;
    this.lastProgressLoaded = this.loaded;
    this.speedList = [];
    
    if (this.tid_speed) clearInterval(this.tid_speed);
    this.tid_speed = setInterval(() => {
      const curSpeed = Math.max(0, this.loaded - this.lastProgressLoaded);
      
      this.speedList.push(curSpeed);
      if (this.speedList.length > 10) this.speedList.shift();
      
      this.speed = this.calcSmoothSpeed(this.speedList);
      this.left_time = this.speed === 0 ? 24 * 3600 : (this.file.size - this.loaded) / this.speed;
      
      this.lastProgressLoaded = this.loaded;
      
      // 检查超时
      this.checkTimeout();
    }, 1000);
  }
  
  /**
   * 停止计算速度
   */
  protected pauseCalcSpeed(): void {
    if (this.tid_speed) {
      clearInterval(this.tid_speed);
      this.tid_speed = undefined;
    }
    this.speed = 0;
  }
  
  /**
   * 计算平滑速度（滑动平均）
   */
  protected calcSmoothSpeed(speedList: number[]): number {
    if (speedList.length === 0) return 0;
    const sum = speedList.reduce((a, b) => a + b, 0);
    return sum / speedList.length;
  }
  
  /**
   * 计算总平均速度
   */
  protected calcTotalAvgSpeed(): void {
    const cur_time_len = Date.now() - this.upload_start_time;
    const cur_loaded_size = this.loaded - (this.start_done_part_loaded || 0);
    
    if (this.used_time_len && this.used_avg_speed) {
      this.avg_speed =
        (((this.used_time_len / 1000) * this.used_avg_speed + cur_loaded_size) / (this.used_time_len + cur_time_len)) *
        1000;
    } else {
      this.avg_speed = cur_time_len > 0 ? (cur_loaded_size / cur_time_len) * 1000 : 0;
    }
    this.used_time_len += cur_time_len;
    this.used_avg_speed = this.avg_speed;
  }
  
  /**
   * 检查超时
   */
  protected async checkTimeout(): Promise<void> {
    if (this.speed_0_count == null) this.speed_0_count = 0;
    
    if (this.speed === 0) {
      this.speed_0_count++;
    } else {
      this.speed_0_count = 0;
    }
  }
  
  /**
   * 更新进度
   * @param loaded 当前已处理的总字节数
   * @param options 选项
   */
  protected updateProgress(loaded: number, options?: { immediately?: boolean; init?: boolean }): void {
    // 如果是初始化调用，设置起始大小
    if (options?.init) {
      this.startSize = loaded;
      this.loaded = loaded;
      this.lastProgressLoaded = loaded;
      this.progress = this.file.size > 0 ? (loaded / this.file.size) * 100 : 0;
      this.lastEmittedProgress = this.progress;
      this.notifyProgress('running', this.progress);
      return;
    }
    
    this.loaded = loaded;
    this.progress = this.file.size > 0 ? (loaded / this.file.size) * 100 : 0;
    
    if (this.speed > 0) {
      const remainingBytes = this.file.size > loaded ? this.file.size - loaded : 0;
      this.left_time = remainingBytes / this.speed;
    }
    
    // 使用节流机制，避免频繁触发进度事件
    const progressDiff = Math.abs(this.progress - this.lastEmittedProgress);
    if (progressDiff > 0 && (options?.immediately || progressDiff >= this.PROGRESS_EMIT_STEP)) {
      this.lastEmittedProgress = this.progress;
      this.notifyProgress('running', this.progress);
    }
  }
  
  /**
   * 改变状态
   */
  protected async changeState(state: TaskStatus, error?: SMHError): Promise<void> {
    this.state = state;
    
    const cp = this.getCheckpoint();
    
    // 触发事件
    this.emit('statechange', { checkpoint: cp, state, error });
  }
  
  /**
   * 通知进度
   */
  protected notifyProgress(state: string, progress: number): void {
    const progressInfo: ProgressInfo = {
      loaded: this.loaded,
      total: this.file.size,
      progress: progress,
      speed: this.speed,
      leftTime: this.left_time
    };
    
    this.emit('progress', progressInfo);
  }
  
  /**
   * 处理错误
   */
  protected async handleError(e: Error): Promise<SMHError> {
    const smhError: SMHError = e instanceof SMHError 
      ? e 
      : newError(ErrorCode.OPERATION_FAILED, e.message, e);

    if (this.cancelFlag) {
      await this.changeState(TaskStatus.ERROR, smhError);
      return smhError;
    }
    
    if (e.message === 'paused') {
      await this.pause();
      return smhError;
    }
    
    this.message = smhError.message;
    this.error = smhError;
    this.end_time = Date.now();
    
    this.pauseCalcSpeed();
    this.calcTotalAvgSpeed();
    
    await this.changeState(TaskStatus.ERROR, smhError);

    return smhError;
  }
}
