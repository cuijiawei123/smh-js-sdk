/// <reference types="node" />
/**
 * ErrorHandler 集成测试
 * 覆盖：analyzeError、SMHError 各种构造方式、toLogString、toJSON、newError
 */
import { describe, it, expect } from 'vitest';
import {
  analyzeError,
  ErrorCode,
  SMHError,
  newError,
  ISMHError,
} from '../../utils/ErrorHandler';
import { skipIfNoConfig } from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('ErrorHandler', () => {

  // ─── analyzeError ──────────────────────────────────────

  describe('analyzeError', () => {
    it('应识别 403 为过期错误', () => {
      const result = analyzeError({ response: { status: 403 } });
      expect(result.isExpired).toBe(true);
      expect(result.statusCode).toBe(403);
    });

    it('应识别 "Request has expired" 消息为过期错误', () => {
      const result = analyzeError(new Error('Request has expired'));
      expect(result.isExpired).toBe(true);
    });

    it('非过期错误应返回 isExpired=false', () => {
      const result = analyzeError({ response: { status: 404 } });
      expect(result.isExpired).toBeFalsy();
      expect(result.statusCode).toBe(404);
    });

    it('从 status 字段提取状态码', () => {
      const result = analyzeError({ status: 500 });
      expect(result.statusCode).toBe(500);
      expect(result.isExpired).toBeFalsy();
    });

    it('从 statusCode 字段提取状态码', () => {
      const result = analyzeError({ statusCode: 502 });
      expect(result.statusCode).toBe(502);
    });

    it('无状态码时 statusCode 为 undefined', () => {
      const result = analyzeError(new Error('random error'));
      expect(result.statusCode).toBeUndefined();
      expect(result.isExpired).toBe(false);
    });

    it('null/undefined 输入不抛异常', () => {
      expect(() => analyzeError(null)).not.toThrow();
      expect(() => analyzeError(undefined)).not.toThrow();
    });
  });

  // ─── SMHError 构造 ────────────────────────────────────

  describe('SMHError 构造', () => {
    it('从 ErrorCode 字符串构造', () => {
      const err = new SMHError(ErrorCode.UPLOAD_FAILED, 'upload failed');
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(SMHError);
      expect(err.name).toBe('SMHError');
      expect(err.code).toBe(ErrorCode.UPLOAD_FAILED);
      expect(err.message).toBe('upload failed');
      expect(err.timestamp).toBeGreaterThan(0);
    });

    it('从 ErrorCode 构造，无 message 时使用 code 作为 message', () => {
      const err = new SMHError(ErrorCode.FILE_NOT_FOUND);
      expect(err.message).toBe(ErrorCode.FILE_NOT_FOUND);
    });

    it('从 ErrorCode 构造，附带 cause 和 response', () => {
      const cause = new Error('root cause');
      const response = { requestId: 'abc123' };
      const err = new SMHError(ErrorCode.NETWORK_ERROR, 'network err', cause, response);
      expect(err.cause).toBe(cause);
      expect(err.response).toEqual(expect.objectContaining({ requestId: 'abc123' }));
      expect(err.stack).toContain('Caused by:');
    });

    it('从普通 Error 构造', () => {
      const original = new Error('original error');
      const err = new SMHError(original);
      expect(err.code).toBe(ErrorCode.OPERATION_FAILED);
      expect(err.message).toBe('original error');
      expect(err.cause).toBe(original);
    });

    it('从 SMHError 拷贝构造', () => {
      const original = newError(ErrorCode.DOWNLOAD_FAILED, 'dl failed', undefined, { size: 100 });
      const copy = new SMHError(original);
      expect(copy.code).toBe(ErrorCode.DOWNLOAD_FAILED);
      expect(copy.message).toBe('dl failed');
      expect(copy.response).toEqual(expect.objectContaining({ size: 100 }));
    });

    it('从 ISMHError 对象构造', () => {
      const info: ISMHError = {
        message: 'custom error',
        code: ErrorCode.INVALID_PARAMETER,
        status: 400,
        reqId: 'req-001',
        timestamp: Date.now(),
        response: { detail: 'bad param' },
      };
      const err = new SMHError(info);
      expect(err.code).toBe(ErrorCode.INVALID_PARAMETER);
      expect(err.status).toBe(400);
      expect(err.reqId).toBe('req-001');
      expect(err.response).toEqual(expect.objectContaining({ detail: 'bad param' }));
    });

    it('从普通字符串（非 ErrorCode）构造', () => {
      const err = new SMHError('some random string');
      expect(err.message).toBe('some random string');
      expect(err.code).toBe(ErrorCode.OPERATION_FAILED);
    });

    it('附加 response 参数应合并到 response 属性', () => {
      const err = new SMHError(ErrorCode.FILE_TOO_LARGE, 'too large', undefined, { maxSize: 100 });
      expect(err.response.maxSize).toBe(100);
    });
  });

  // ─── toLogString ──────────────────────────────────────

  describe('toLogString', () => {
    it('基本格式：[code] message', () => {
      const err = newError(ErrorCode.UPLOAD_FAILED, 'upload failed');
      const log = err.toLogString();
      expect(log).toContain(`[${ErrorCode.UPLOAD_FAILED}]`);
      expect(log).toContain('upload failed');
    });

    it('包含 status 信息', () => {
      const info: ISMHError = {
        message: 'forbidden',
        code: ErrorCode.NETWORK_ERROR,
        status: 403,
        timestamp: Date.now(),
      };
      const err = new SMHError(info);
      expect(err.toLogString()).toContain('Status: 403');
    });

    it('包含 reqId 信息', () => {
      const info: ISMHError = {
        message: 'err',
        code: ErrorCode.OPERATION_FAILED,
        reqId: 'req-xyz',
        timestamp: Date.now(),
      };
      const err = new SMHError(info);
      expect(err.toLogString()).toContain('ReqId: req-xyz');
    });

    it('包含 response 中的对象和原始值', () => {
      const err = newError(ErrorCode.FILE_SIZE_MISMATCH, 'size mismatch', undefined, {
        expected: 1024,
        detail: { a: 1 },
      });
      const log = err.toLogString();
      expect(log).toContain('Response:');
      expect(log).toContain('expected: 1024');
      expect(log).toContain('detail: {"a":1}');
    });

    it('包含 cause 信息', () => {
      const err = newError(ErrorCode.DOWNLOAD_FAILED, 'dl err', new Error('root'));
      expect(err.toLogString()).toContain('Caused by: root');
    });
  });

  // ─── toJSON ───────────────────────────────────────────

  describe('toJSON', () => {
    it('返回完整 JSON 结构', () => {
      const cause = new Error('root');
      const err = newError(ErrorCode.PART_UPLOAD_FAILED, 'part failed', cause, { partNumber: 3 });
      const json = err.toJSON();

      expect(json.name).toBe('SMHError');
      expect(json.code).toBe(ErrorCode.PART_UPLOAD_FAILED);
      expect(json.message).toBe('part failed');
      expect(json.timestamp).toBeGreaterThan(0);
      expect(json.response).toEqual(expect.objectContaining({ partNumber: 3 }));
      expect(json.cause).toEqual({ name: 'Error', message: 'root' });
    });

    it('无 cause 时 cause 为 undefined', () => {
      const err = newError(ErrorCode.INVALID_FILE, 'bad file');
      const json = err.toJSON();
      expect(json.cause).toBeUndefined();
    });
  });

  // ─── newError 工厂 ────────────────────────────────────

  describe('newError', () => {
    it('应创建 SMHError 实例', () => {
      const err = newError(ErrorCode.REQUEST_TIMEOUT, 'timeout');
      expect(err).toBeInstanceOf(SMHError);
      expect(err.code).toBe(ErrorCode.REQUEST_TIMEOUT);
      expect(err.message).toBe('timeout');
    });

    it('应正确传递 cause 和 response', () => {
      const cause = new Error('original');
      const err = newError(ErrorCode.RENEW_UPLOAD_FAILED, 'renew failed', cause, { uploadId: 'u1' });
      expect(err.cause).toBe(cause);
      expect(err.response).toEqual(expect.objectContaining({ uploadId: 'u1' }));
    });
  });
});
