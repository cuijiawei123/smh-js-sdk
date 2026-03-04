import { describe, it, expect } from 'vitest';
import { SMHError, ErrorCode, newError, analyzeError } from '../../utils/ErrorHandler';

describe('ErrorCode', () => {
  it('should have all expected error codes', () => {
    expect(ErrorCode.FILE_NOT_FOUND).toBe('FileNotFound');
    expect(ErrorCode.UPLOAD_FAILED).toBe('UploadFailed');
    expect(ErrorCode.DOWNLOAD_FAILED).toBe('DownloadFailed');
    expect(ErrorCode.NETWORK_ERROR).toBe('NetworkError');
    expect(ErrorCode.INVALID_PARAMETER).toBe('InvalidParameter');
    expect(ErrorCode.OPERATION_FAILED).toBe('OperationFailed');
    expect(ErrorCode.FILE_CRC64_MISMATCH).toBe('FileCrc64Mismatch');
    expect(ErrorCode.UPLOAD_CANCELED).toBe('UploadCanceled');
    expect(ErrorCode.DOWNLOAD_CANCELED).toBe('DownloadCanceled');
  });
});

describe('SMHError', () => {
  describe('constructor', () => {
    it('should create from ErrorCode and message', () => {
      const error = new SMHError(ErrorCode.UPLOAD_FAILED, 'Upload failed');
      expect(error.code).toBe(ErrorCode.UPLOAD_FAILED);
      expect(error.message).toBe('Upload failed');
      expect(error.name).toBe('SMHError');
      expect(error.timestamp).toBeGreaterThan(0);
    });

    it('should create from Error object', () => {
      const cause = new Error('original error');
      const error = new SMHError(cause);
      expect(error.code).toBe(ErrorCode.OPERATION_FAILED);
      expect(error.message).toBe('original error');
      expect(error.cause).toBe(cause);
    });

    it('should create from SMHError (copy)', () => {
      const original = new SMHError(ErrorCode.NETWORK_ERROR, 'network issue');
      const copy = new SMHError(original);
      expect(copy.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(copy.message).toBe('network issue');
    });

    it('should create from ISMHError object', () => {
      const errorObj = {
        message: 'custom error',
        code: ErrorCode.FILE_NOT_FOUND,
        status: 404,
        reqId: 'req-123',
        timestamp: Date.now(),
      };
      const error = new SMHError(errorObj);
      expect(error.code).toBe(ErrorCode.FILE_NOT_FOUND);
      expect(error.status).toBe(404);
      expect(error.reqId).toBe('req-123');
    });

    it('should create from plain string (non-ErrorCode)', () => {
      const error = new SMHError('something went wrong');
      expect(error.message).toBe('something went wrong');
      expect(error.code).toBe(ErrorCode.OPERATION_FAILED);
    });

    it('should create from ErrorCode string', () => {
      const error = new SMHError(ErrorCode.FILE_TOO_LARGE);
      expect(error.code).toBe(ErrorCode.FILE_TOO_LARGE);
      expect(error.message).toBe(ErrorCode.FILE_TOO_LARGE);
    });

    it('should include cause stack in error stack', () => {
      const cause = new Error('root cause');
      const error = new SMHError(ErrorCode.UPLOAD_FAILED, 'upload error', cause);
      expect(error.stack).toContain('Caused by:');
      expect(error.stack).toContain('root cause');
    });

    it('should handle response parameter', () => {
      const error = new SMHError(
        ErrorCode.UPLOAD_FAILED,
        'failed',
        undefined,
        { statusCode: 500, body: 'server error' }
      );
      expect(error.response).toEqual({ statusCode: 500, body: 'server error' });
    });

    it('should be instanceof Error', () => {
      const error = new SMHError(ErrorCode.NETWORK_ERROR);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SMHError);
    });

    it('should set prototype correctly for instanceof check', () => {
      const error = new SMHError(ErrorCode.NETWORK_ERROR);
      expect(Object.getPrototypeOf(error)).toBe(SMHError.prototype);
    });
  });

  describe('toLogString', () => {
    it('should format basic error', () => {
      const error = new SMHError(ErrorCode.UPLOAD_FAILED, 'upload error');
      const log = error.toLogString();
      expect(log).toContain('[UploadFailed]');
      expect(log).toContain('upload error');
    });

    it('should include status', () => {
      const error = new SMHError({
        message: 'not found',
        code: ErrorCode.FILE_NOT_FOUND,
        status: 404,
        timestamp: Date.now(),
      });
      const log = error.toLogString();
      expect(log).toContain('Status: 404');
    });

    it('should include reqId', () => {
      const error = new SMHError({
        message: 'error',
        code: ErrorCode.OPERATION_FAILED,
        reqId: 'req-abc',
        timestamp: Date.now(),
      });
      const log = error.toLogString();
      expect(log).toContain('ReqId: req-abc');
    });

    it('should include cause', () => {
      const cause = new Error('root cause');
      const error = new SMHError(ErrorCode.UPLOAD_FAILED, 'failed', cause);
      const log = error.toLogString();
      expect(log).toContain('Caused by: root cause');
    });

    it('should include response', () => {
      const error = new SMHError(ErrorCode.UPLOAD_FAILED, 'failed', undefined, {
        key: 'value',
      });
      const log = error.toLogString();
      expect(log).toContain('key: value');
    });

    it('should stringify object values in response', () => {
      const error = new SMHError(ErrorCode.UPLOAD_FAILED, 'failed', undefined, {
        nested: { a: 1 },
      });
      const log = error.toLogString();
      expect(log).toContain('nested: {"a":1}');
    });
  });

  describe('toJSON', () => {
    it('should serialize all fields', () => {
      const cause = new Error('root');
      const error = new SMHError(ErrorCode.UPLOAD_FAILED, 'failed', cause, { key: 'val' });
      const json = error.toJSON();
      
      expect(json.name).toBe('SMHError');
      expect(json.code).toBe(ErrorCode.UPLOAD_FAILED);
      expect(json.message).toBe('failed');
      expect(json.timestamp).toBeGreaterThan(0);
      expect(json.cause).toEqual({ name: 'Error', message: 'root' });
      expect(json.response).toEqual({ key: 'val' });
    });

    it('should handle no cause', () => {
      const error = new SMHError(ErrorCode.NETWORK_ERROR, 'net error');
      const json = error.toJSON();
      expect(json.cause).toBeUndefined();
    });
  });
});

describe('newError', () => {
  it('should create SMHError with convenience function', () => {
    const error = newError(ErrorCode.FILE_NOT_FOUND, 'not found');
    expect(error).toBeInstanceOf(SMHError);
    expect(error.code).toBe(ErrorCode.FILE_NOT_FOUND);
    expect(error.message).toBe('not found');
  });

  it('should pass cause and response', () => {
    const cause = new Error('original');
    const error = newError(ErrorCode.UPLOAD_FAILED, 'failed', cause, { status: 500 });
    expect(error.cause).toBe(cause);
    expect(error.response).toEqual({ status: 500 });
  });
});

describe('analyzeError', () => {
  it('should detect 403 as expired', () => {
    const result = analyzeError({ response: { status: 403 } });
    expect(result.isExpired).toBe(true);
    expect(result.statusCode).toBe(403);
  });

  it('should detect "Request has expired" message as expired', () => {
    const error = new Error('Request has expired');
    const result = analyzeError(error);
    expect(result.isExpired).toBe(true);
  });

  it('should not flag non-expired errors', () => {
    const result = analyzeError({ response: { status: 500 } });
    expect(result.isExpired).toBeFalsy();
    expect(result.statusCode).toBe(500);
  });

  it('should handle null/undefined error', () => {
    const result = analyzeError(null);
    expect(result.isExpired).toBeFalsy();
    expect(result.statusCode).toBeUndefined();
  });

  it('should extract statusCode from error.status', () => {
    const result = analyzeError({ status: 404 });
    expect(result.statusCode).toBe(404);
  });

  it('should extract statusCode from error.statusCode', () => {
    const result = analyzeError({ statusCode: 502 });
    expect(result.statusCode).toBe(502);
  });

  it('should prioritize response.status over error.status', () => {
    const result = analyzeError({ response: { status: 403 }, status: 200 });
    expect(result.statusCode).toBe(403);
  });
});
