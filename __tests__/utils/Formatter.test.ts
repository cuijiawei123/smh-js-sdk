import { describe, it, expect } from 'vitest';
import { formatSize, formatTime, formatRemainingTime } from '../../utils/Formatter';

describe('formatSize', () => {
  it('should format 0 bytes', () => {
    expect(formatSize(0)).toBe('0 B');
  });

  it('should format bytes (< 1KB)', () => {
    expect(formatSize(512)).toBe('512.00 B');
  });

  it('should format KB', () => {
    expect(formatSize(1024)).toBe('1.00 KB');
    expect(formatSize(1536)).toBe('1.50 KB');
  });

  it('should format MB', () => {
    expect(formatSize(1048576)).toBe('1.00 MB');
    expect(formatSize(5 * 1024 * 1024)).toBe('5.00 MB');
  });

  it('should format GB', () => {
    expect(formatSize(1073741824)).toBe('1.00 GB');
  });

  it('should format TB', () => {
    expect(formatSize(1099511627776)).toBe('1.00 TB');
  });

  it('should format fractional sizes', () => {
    expect(formatSize(1572864)).toBe('1.50 MB');
  });

  it('should format 1 byte', () => {
    expect(formatSize(1)).toBe('1.00 B');
  });

  it('should format very large file sizes', () => {
    const result = formatSize(5 * 1099511627776);
    expect(result).toBe('5.00 TB');
  });
});

describe('formatTime', () => {
  it('should format seconds only', () => {
    expect(formatTime(5000)).toBe('5s');
  });

  it('should format 0 milliseconds', () => {
    expect(formatTime(0)).toBe('0s');
  });

  it('should format minutes and seconds', () => {
    expect(formatTime(150000)).toBe('2m 30s');
  });

  it('should format hours, minutes and seconds', () => {
    expect(formatTime(3661000)).toBe('1h 1m 1s');
  });

  it('should format exact minute', () => {
    expect(formatTime(60000)).toBe('1m 0s');
  });

  it('should format exact hour', () => {
    expect(formatTime(3600000)).toBe('1h 0m 0s');
  });

  it('should handle sub-second values', () => {
    expect(formatTime(500)).toBe('0s');
  });

  it('should handle large values', () => {
    expect(formatTime(86400000)).toBe('24h 0m 0s');
  });
});

describe('formatRemainingTime', () => {
  it('should format seconds only', () => {
    expect(formatRemainingTime(45)).toBe('0:45');
  });

  it('should format minutes and seconds', () => {
    expect(formatRemainingTime(150)).toBe('2:30');
  });

  it('should format hours, minutes and seconds', () => {
    expect(formatRemainingTime(3661)).toBe('1:01:01');
  });

  it('should return -- for 0 seconds', () => {
    expect(formatRemainingTime(0)).toBe('--');
  });

  it('should return -- for negative seconds', () => {
    expect(formatRemainingTime(-5)).toBe('--');
  });

  it('should return -- for Infinity', () => {
    expect(formatRemainingTime(Infinity)).toBe('--');
  });

  it('should return -- for NaN', () => {
    expect(formatRemainingTime(NaN)).toBe('--');
  });

  it('should pad single-digit seconds', () => {
    expect(formatRemainingTime(5)).toBe('0:05');
  });

  it('should pad single-digit minutes in hour format', () => {
    expect(formatRemainingTime(3605)).toBe('1:00:05');
  });

  it('should format exact minute', () => {
    expect(formatRemainingTime(60)).toBe('1:00');
  });

  it('should format exact hour', () => {
    expect(formatRemainingTime(3600)).toBe('1:00:00');
  });
});
