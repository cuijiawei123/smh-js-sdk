/**
 * Async - 异步工具函数
 */

export interface ParallelLimitOptions {
  /**
   * 可选的停止检查函数
   * 返回 true 时停止启动新任务
   */
  shouldStop?: () => boolean;
}

/**
 * 并发控制函数 - 滑动窗口模式
 * 限制同时执行的异步任务数量
 * 
 * @param tasks 任务列表
 * @param limit 最大并发数
 * @param fn 任务执行函数
 * @param options 选项
 * @returns 所有任务的结果数组
 * 
 * @example
 * ```typescript
 * const results = await parallelLimit(
 *   [1, 2, 3, 4, 5],
 *   2,
 *   async (num) => num * 2,
 *   { shouldStop: () => isCanceled }
 * );
 * ```
 */
export async function parallelLimit<T, R>(
  tasks: T[],
  limit: number,
  fn: (task: T) => Promise<R>,
  options?: ParallelLimitOptions
): Promise<R[]> {
  const results: R[] = new Array(tasks.length);
  let nextIndex = 0;
  let activeCount = 0;
  let firstError: Error | null = null;
  
  const shouldStop = options?.shouldStop || (() => false);
  
  return new Promise((resolve, reject) => {
    let completedCount = 0;
    
    const startNext = () => {
      while (
        activeCount < limit &&
        nextIndex < tasks.length &&
        !firstError &&
        !shouldStop()
      ) {
        const currentIndex = nextIndex++;
        const task = tasks[currentIndex];
        activeCount++;
        
        (async () => {
          try {
            if (shouldStop() || firstError) {
              return;
            }
            results[currentIndex] = await fn(task);
          } catch (error) {
            if (!firstError) {
              firstError = error as Error;
            }
          } finally {
            activeCount--;
            completedCount++;
            
            if (firstError) {
              if (activeCount === 0) {
                reject(firstError);
              }
            } else if (completedCount === tasks.length) {
              resolve(results);
            } else if (!shouldStop()) {
              startNext();
            } else if (activeCount === 0) {
              resolve(results);
            }
          }
        })();
      }
      
      // 处理空任务列表
      if (tasks.length === 0) {
        resolve(results);
      } else if (activeCount === 0 && nextIndex === 0 && shouldStop()) {
        resolve(results);
      }
    };
    
    startNext();
  });
}

/**
 * 延迟执行
 * @param ms 延迟毫秒数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 带重试的异步执行
 * @param fn 要执行的异步函数
 * @param maxRetries 最大重试次数
 * @param retryDelay 重试间隔（毫秒）
 * @param shouldRetry 可选的重试条件判断函数
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000,
  shouldRetry?: (error: Error, attempt: number) => boolean
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const shouldAttemptRetry = shouldRetry 
          ? shouldRetry(lastError, attempt) 
          : true;
          
        if (shouldAttemptRetry) {
          // 指数退避
          const backoffDelay = retryDelay * Math.pow(2, attempt);
          await delay(Math.min(backoffDelay, 10000));
          continue;
        }
      }
      
      throw lastError;
    }
  }
  
  throw lastError;
}
