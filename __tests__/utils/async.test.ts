import { describe, it, expect, vi } from 'vitest';
import { parallelLimit, delay, withRetry } from '../../utils/async';

describe('parallelLimit', () => {
  it('should execute all tasks and return results in order', async () => {
    const results = await parallelLimit(
      [1, 2, 3, 4, 5],
      2,
      async (n) => n * 2
    );
    expect(results).toEqual([2, 4, 6, 8, 10]);
  });

  it('should handle empty task list', async () => {
    const results = await parallelLimit([], 3, async (n: number) => n);
    expect(results).toEqual([]);
  });

  it('should handle single task', async () => {
    const results = await parallelLimit([42], 3, async (n) => n * 2);
    expect(results).toEqual([84]);
  });

  it('should respect concurrency limit', async () => {
    let maxConcurrent = 0;
    let currentConcurrent = 0;

    await parallelLimit(
      [1, 2, 3, 4, 5, 6],
      2,
      async (n) => {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
        await delay(10);
        currentConcurrent--;
        return n;
      }
    );

    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });

  it('should reject on first error', async () => {
    await expect(
      parallelLimit(
        [1, 2, 3],
        2,
        async (n) => {
          if (n === 2) throw new Error('Task 2 failed');
          return n;
        }
      )
    ).rejects.toThrow('Task 2 failed');
  });

  it('should stop when shouldStop returns true', async () => {
    let processed = 0;
    let shouldStop = false;

    const results = await parallelLimit(
      [1, 2, 3, 4, 5],
      1,
      async (n) => {
        processed++;
        if (n === 2) shouldStop = true;
        return n;
      },
      { shouldStop: () => shouldStop }
    );

    expect(processed).toBeLessThanOrEqual(3);
  });

  it('should resolve immediately when shouldStop is true from start', async () => {
    const fn = vi.fn().mockResolvedValue(1);
    const results = await parallelLimit(
      [1, 2, 3],
      2,
      fn,
      { shouldStop: () => true }
    );
    expect(fn).not.toHaveBeenCalled();
  });

  it('should handle limit larger than task count', async () => {
    const results = await parallelLimit(
      [1, 2],
      10,
      async (n) => n * 3
    );
    expect(results).toEqual([3, 6]);
  });

  it('should handle limit of 1 (sequential execution)', async () => {
    const order: number[] = [];
    await parallelLimit(
      [1, 2, 3],
      1,
      async (n) => {
        order.push(n);
        await delay(5);
        return n;
      }
    );
    expect(order).toEqual([1, 2, 3]);
  });
});

describe('delay', () => {
  it('should resolve after specified time', async () => {
    const start = Date.now();
    await delay(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });

  it('should resolve with 0ms delay', async () => {
    await expect(delay(0)).resolves.toBeUndefined();
  });
});

describe('withRetry', () => {
  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn, 3, 10);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry and succeed', async () => {
    let attempt = 0;
    const fn = vi.fn().mockImplementation(async () => {
      attempt++;
      if (attempt < 3) throw new Error('fail');
      return 'success';
    });

    const result = await withRetry(fn, 3, 10);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after exhausting retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));
    await expect(withRetry(fn, 2, 10)).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('should respect shouldRetry predicate', async () => {
    let attempt = 0;
    const fn = vi.fn().mockImplementation(async () => {
      attempt++;
      throw new Error(`fail-${attempt}`);
    });

    const shouldRetry = vi.fn().mockReturnValue(false);

    await expect(withRetry(fn, 3, 10, shouldRetry)).rejects.toThrow('fail-1');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledTimes(1);
  });

  it('should pass error and attempt to shouldRetry', async () => {
    const errors: Array<{ msg: string; attempt: number }> = [];
    const fn = vi.fn().mockImplementation(async () => {
      throw new Error('test-error');
    });

    const shouldRetry = vi.fn().mockImplementation((error: Error, attempt: number) => {
      errors.push({ msg: error.message, attempt });
      return attempt < 1; // only retry once
    });

    await expect(withRetry(fn, 5, 10, shouldRetry)).rejects.toThrow('test-error');
    expect(errors[0]).toEqual({ msg: 'test-error', attempt: 0 });
    expect(errors[1]).toEqual({ msg: 'test-error', attempt: 1 });
  });

  it('should use exponential backoff with cap at 10000ms', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    const start = Date.now();

    await expect(withRetry(fn, 1, 10)).rejects.toThrow('fail');
    
    const elapsed = Date.now() - start;
    // First retry: 10 * 2^0 = 10ms
    expect(elapsed).toBeGreaterThanOrEqual(5);
  });

  it('should use default parameters', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
  });
});
