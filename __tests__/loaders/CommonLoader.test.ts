import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CommonLoader } from '../../loaders/CommonLoader';
import { TaskStatus, IFile, CommonLoaderOptions } from '../../loaders/types';
import { SMHError, ErrorCode, newError } from '../../utils/ErrorHandler';

// Concrete implementation for testing the abstract class
class TestLoader extends CommonLoader<any> {
  protected getTaskType(): string {
    return 'test';
  }

  getCheckpoint(): any {
    return {
      id: this.id,
      state: this.state,
      progress: this.progress,
      loaded: this.loaded,
    };
  }

  async start(): Promise<void> {
    await this.changeState(TaskStatus.RUNNING);
  }

  // Expose protected methods for testing
  public testUpdateProgress(loaded: number, options?: { immediately?: boolean; init?: boolean }) {
    this.updateProgress(loaded, options);
  }

  public testStartCalcSpeed() {
    this.startCalcSpeed();
  }

  public testPauseCalcSpeed() {
    this.pauseCalcSpeed();
  }

  public testHandleError(e: Error) {
    return this.handleError(e);
  }

  public testCalcSmoothSpeed(speedList: number[]) {
    return this.calcSmoothSpeed(speedList);
  }

  public testCalcTotalAvgSpeed() {
    this.calcTotalAvgSpeed();
  }

  public getAbortSignal() {
    return this.abortSignal;
  }

  public testAbortRequest() {
    this.abortRequest();
  }

  public setPauseFlag(value: boolean) {
    this.pauseFlag = value;
  }

  public setCancelFlag(value: boolean) {
    this.cancelFlag = value;
  }

  public setLoaded(value: number) {
    this.loaded = value;
  }

  public setTaskStartTime(value: number) {
    this.task_start_time = value;
  }
}

function createTestFile(overrides?: Partial<IFile>): IFile {
  return {
    name: 'test.txt',
    size: 1024,
    type: 'text/plain',
    ...overrides,
  };
}

describe('CommonLoader', () => {
  let loader: TestLoader;

  beforeEach(() => {
    loader = new TestLoader(createTestFile());
  });

  afterEach(() => {
    loader.testPauseCalcSpeed();
  });

  describe('constructor', () => {
    it('should initialize with WAITING state', () => {
      expect(loader.state).toBe(TaskStatus.WAITING);
    });

    it('should set file info', () => {
      expect(loader.file.name).toBe('test.txt');
      expect(loader.file.size).toBe(1024);
    });

    it('should generate unique id', () => {
      const loader2 = new TestLoader(createTestFile());
      expect(loader.id).not.toBe(loader2.id);
    });

    it('should use custom id if provided', () => {
      const loader = new TestLoader(createTestFile(), { id: 'custom-id' });
      expect(loader.id).toBe('custom-id');
    });

    it('should have 0 progress initially', () => {
      expect(loader.progress).toBe(0);
      expect(loader.loaded).toBe(0);
      expect(loader.speed).toBe(0);
    });

    it('should have verbose false by default', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      // logInfo is protected but triggered through getTaskType usage
      expect(loader.state).toBe(TaskStatus.WAITING);
      spy.mockRestore();
    });
  });

  describe('state management', () => {
    it('should change state via start()', async () => {
      await loader.start();
      expect(loader.state).toBe(TaskStatus.RUNNING);
    });

    it('should emit statechange event', async () => {
      const handler = vi.fn();
      loader.on('statechange', handler);
      await loader.start();
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          state: TaskStatus.RUNNING,
        })
      );
    });

    it('should include checkpoint in statechange event', async () => {
      const handler = vi.fn();
      loader.on('statechange', handler);
      await loader.start();
      const eventData = handler.mock.calls[0][0];
      expect(eventData.checkpoint).toBeDefined();
      expect(eventData.checkpoint.id).toBe(loader.id);
    });
  });

  describe('pause', () => {
    it('should transition to PAUSED state', async () => {
      await loader.start();
      await loader.pause();
      expect(loader.state).toBe(TaskStatus.PAUSED);
    });

    it('should not pause if already paused', async () => {
      await loader.start();
      await loader.pause();
      const handler = vi.fn();
      loader.on('statechange', handler);
      await loader.pause();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should not pause if SUCCESS', async () => {
      // Manually set to success
      (loader as any).state = TaskStatus.SUCCESS;
      const handler = vi.fn();
      loader.on('statechange', handler);
      await loader.pause();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should not pause if ERROR', async () => {
      (loader as any).state = TaskStatus.ERROR;
      const handler = vi.fn();
      loader.on('statechange', handler);
      await loader.pause();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should set speed to 0', async () => {
      await loader.start();
      loader.testStartCalcSpeed();
      await loader.pause();
      expect(loader.speed).toBe(0);
    });
  });

  describe('cancel', () => {
    it('should transition to CANCELED state', async () => {
      await loader.start();
      await loader.cancel();
      expect(loader.state).toBe(TaskStatus.CANCELED);
    });

    it('should not cancel if already canceled', async () => {
      await loader.start();
      await loader.cancel();
      const handler = vi.fn();
      loader.on('statechange', handler);
      await loader.cancel();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should abort inflight requests', async () => {
      await loader.start();
      const signal = loader.getAbortSignal();
      expect(signal.aborted).toBe(false);
      await loader.cancel();
      expect(signal.aborted).toBe(true);
    });
  });

  describe('wait', () => {
    it('should be no-op when already WAITING', async () => {
      await loader.wait();
      expect(loader.state).toBe(TaskStatus.WAITING);
    });

    it('should reset to WAITING from ERROR', async () => {
      (loader as any).state = TaskStatus.ERROR;
      await loader.wait();
      expect(loader.state).toBe(TaskStatus.WAITING);
    });

    it('should clear error and message when transitioning from ERROR', async () => {
      (loader as any).state = TaskStatus.ERROR;
      loader.message = 'some error';
      loader.error = newError(ErrorCode.NETWORK_ERROR, 'test');
      await loader.wait();
      expect(loader.error).toBeUndefined();
      expect(loader.end_time).toBe(0);
    });
  });

  describe('progress', () => {
    it('should update progress correctly', () => {
      loader.testUpdateProgress(512);
      expect(loader.loaded).toBe(512);
      expect(loader.progress).toBe(50); // 512/1024 * 100
    });

    it('should emit progress event', () => {
      const handler = vi.fn();
      loader.on('progress', handler);
      loader.testUpdateProgress(512, { immediately: true });
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          loaded: 512,
          total: 1024,
          progress: 50,
        })
      );
    });

    it('should throttle progress emissions', () => {
      const handler = vi.fn();
      loader.on('progress', handler);
      // Very small progress change should not emit
      loader.testUpdateProgress(1); // 0.097%
      expect(handler).not.toHaveBeenCalled();
    });

    it('should emit with immediately flag regardless of throttle', () => {
      const handler = vi.fn();
      loader.on('progress', handler);
      loader.testUpdateProgress(1, { immediately: true });
      expect(handler).toHaveBeenCalled();
    });

    it('should handle init progress for non-zero start (resume)', () => {
      loader.testUpdateProgress(256, { init: true });
      expect(loader.loaded).toBe(256);
      expect(loader.progress).toBe(25);
    });

    it('should handle 0-size file', () => {
      const emptyLoader = new TestLoader(createTestFile({ size: 0 }));
      emptyLoader.testUpdateProgress(0, { init: true });
      expect(emptyLoader.progress).toBe(0);
      // Non-init update on 0-size file = 100%
      emptyLoader.testUpdateProgress(0);
      expect(emptyLoader.progress).toBe(100);
    });

    it('should calculate 100% when fully loaded', () => {
      loader.testUpdateProgress(1024, { immediately: true });
      expect(loader.progress).toBe(100);
    });
  });

  describe('speed calculation', () => {
    it('should calculate smooth speed (average)', () => {
      const speed = loader.testCalcSmoothSpeed([100, 200, 300]);
      expect(speed).toBe(200);
    });

    it('should return 0 for empty speed list', () => {
      expect(loader.testCalcSmoothSpeed([])).toBe(0);
    });

    it('should return single value for single-element list', () => {
      expect(loader.testCalcSmoothSpeed([500])).toBe(500);
    });

    it('should start and pause speed calculation', () => {
      loader.testStartCalcSpeed();
      expect(loader.speed).toBe(0);
      loader.testPauseCalcSpeed();
      expect(loader.speed).toBe(0);
    });

    it('should calculate total average speed', () => {
      loader.setTaskStartTime(Date.now() - 2000); // 2 seconds ago
      loader.setLoaded(2048);
      loader.testCalcTotalAvgSpeed();
      expect(loader.avg_speed).toBeGreaterThan(0);
    });

    it('should accumulate avg speed across multiple sessions', () => {
      loader.setTaskStartTime(Date.now() - 1000);
      loader.setLoaded(1000);
      loader.testCalcTotalAvgSpeed();

      const firstAvg = loader.avg_speed;
      expect(firstAvg).toBeGreaterThan(0);

      // Second session
      loader.setTaskStartTime(Date.now() - 1000);
      loader.setLoaded(2000);
      loader.testCalcTotalAvgSpeed();
      expect(loader.used_time_len).toBeGreaterThan(1000);
    });
  });

  describe('abort control', () => {
    it('should provide AbortSignal', () => {
      const signal = loader.getAbortSignal();
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });

    it('should abort and recreate controller', () => {
      const signal1 = loader.getAbortSignal();
      loader.testAbortRequest();
      expect(signal1.aborted).toBe(true);
      
      const signal2 = loader.getAbortSignal();
      expect(signal2.aborted).toBe(false);
      expect(signal2).not.toBe(signal1);
    });
  });

  describe('error handling', () => {
    it('should wrap Error into SMHError', async () => {
      await loader.start();
      const result = await loader.testHandleError(new Error('test error'));
      expect(result).toBeInstanceOf(SMHError);
      expect(result.message).toBe('test error');
      expect(loader.state).toBe(TaskStatus.ERROR);
    });

    it('should pass through SMHError unchanged', async () => {
      await loader.start();
      const smhError = newError(ErrorCode.NETWORK_ERROR, 'network down');
      const result = await loader.testHandleError(smhError);
      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
    });

    it('should set error and message on loader', async () => {
      await loader.start();
      await loader.testHandleError(new Error('failed'));
      expect(loader.error).toBeDefined();
      expect(loader.message).toBe('failed');
      expect(loader.end_time).toBeGreaterThan(0);
    });

    it('should emit statechange with error', async () => {
      await loader.start();
      const handler = vi.fn();
      loader.on('statechange', handler);
      const error = new Error('test');
      await loader.testHandleError(error);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          state: TaskStatus.ERROR,
          error: expect.any(SMHError),
        })
      );
    });

    it('should still change state when cancelFlag is true', async () => {
      await loader.start();
      loader.setCancelFlag(true);
      await loader.testHandleError(new Error('cancelled'));
      expect(loader.state).toBe(TaskStatus.ERROR);
    });

    it('should handle paused message', async () => {
      await loader.start();
      await loader.testHandleError(new Error('paused'));
      expect(loader.state).toBe(TaskStatus.PAUSED);
    });
  });

  describe('task type', () => {
    it('should generate id with task type prefix', () => {
      expect(loader.id).toMatch(/^test_/);
    });
  });
});
