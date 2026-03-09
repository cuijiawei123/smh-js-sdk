/// <reference types="node" />
/**
 * Formatter 集成测试
 * 覆盖：formatSize、formatTime、formatRemainingTime 的各种分支
 */
import { describe, it, expect } from 'vitest';
import { formatSize, formatTime, formatRemainingTime } from '../../utils/Formatter';
import { skipIfNoConfig } from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('Formatter', () => {

  // ─── formatSize ────────────────────────────────────────

  describe('formatSize', () => {
    it('0 字节应返回 "0 B"', () => {
      expect(formatSize(0)).toBe('0 B');
    });

    it('字节级别', () => {
      expect(formatSize(512)).toBe('512.00 B');
    });

    it('KB 级别', () => {
      expect(formatSize(1024)).toBe('1.00 KB');
      expect(formatSize(1536)).toBe('1.50 KB');
    });

    it('MB 级别', () => {
      expect(formatSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatSize(1024 * 1024 * 5.5)).toBe('5.50 MB');
    });

    it('GB 级别', () => {
      expect(formatSize(1024 * 1024 * 1024)).toBe('1.00 GB');
    });

    it('TB 级别', () => {
      expect(formatSize(1024 * 1024 * 1024 * 1024)).toBe('1.00 TB');
    });
  });

  // ─── formatTime ────────────────────────────────────────

  describe('formatTime', () => {
    it('小于 60 秒应只显示秒', () => {
      expect(formatTime(5000)).toBe('5s');
      expect(formatTime(0)).toBe('0s');
    });

    it('大于等于 60 秒应显示分钟和秒', () => {
      expect(formatTime(90000)).toBe('1m 30s');
      expect(formatTime(60000)).toBe('1m 0s');
    });

    it('大于等于 3600 秒应显示小时、分钟和秒', () => {
      expect(formatTime(3600000)).toBe('1h 0m 0s');
      expect(formatTime(3661000)).toBe('1h 1m 1s');
      expect(formatTime(7200000 + 150000 + 5000)).toBe('2h 2m 35s');
    });
  });

  // ─── formatRemainingTime ───────────────────────────────

  describe('formatRemainingTime', () => {
    it('负数和 0 应返回 "--"', () => {
      expect(formatRemainingTime(-1)).toBe('--');
      expect(formatRemainingTime(0)).toBe('--');
    });

    it('Infinity 应返回 "--"', () => {
      expect(formatRemainingTime(Infinity)).toBe('--');
    });

    it('NaN 应返回 "--"', () => {
      expect(formatRemainingTime(NaN)).toBe('--');
    });

    it('小于 60 秒应显示 0:SS 格式', () => {
      expect(formatRemainingTime(5)).toBe('0:05');
      expect(formatRemainingTime(45)).toBe('0:45');
    });

    it('大于等于 60 秒应显示 M:SS 格式', () => {
      expect(formatRemainingTime(90)).toBe('1:30');
      expect(formatRemainingTime(600)).toBe('10:00');
    });

    it('大于等于 3600 秒应显示 H:MM:SS 格式', () => {
      expect(formatRemainingTime(3600)).toBe('1:00:00');
      expect(formatRemainingTime(3661)).toBe('1:01:01');
      expect(formatRemainingTime(7200 + 150 + 5)).toBe('2:02:35');
    });
  });
});
