import { describe, it, expect } from 'vitest';
import {
  updateCRC64,
  finalizeCRC64,
  combineCRC64,
  combinePartsCRC64,
  calculateBufferCRC64,
  CRC64_INIT_VALUE,
} from '../../utils/crc64';

describe('CRC64', () => {
  describe('calculateBufferCRC64', () => {
    it('should calculate CRC64 for empty buffer', () => {
      const buffer = new ArrayBuffer(0);
      const result = calculateBufferCRC64(buffer);
      // Empty buffer with init XOR out should produce consistent result
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should calculate CRC64 for known data', () => {
      const data = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
      const result = calculateBufferCRC64(data.buffer);
      expect(typeof result).toBe('string');
      // CRC64 should be a decimal string
      expect(/^\d+$/.test(result)).toBe(true);
    });

    it('should produce different CRC64 for different data', () => {
      const data1 = new Uint8Array([1, 2, 3]);
      const data2 = new Uint8Array([4, 5, 6]);
      const crc1 = calculateBufferCRC64(data1.buffer);
      const crc2 = calculateBufferCRC64(data2.buffer);
      expect(crc1).not.toBe(crc2);
    });

    it('should produce same CRC64 for same data', () => {
      const data1 = new Uint8Array([1, 2, 3, 4, 5]);
      const data2 = new Uint8Array([1, 2, 3, 4, 5]);
      expect(calculateBufferCRC64(data1.buffer)).toBe(calculateBufferCRC64(data2.buffer));
    });

    it('should handle single byte', () => {
      const data = new Uint8Array([0]);
      const result = calculateBufferCRC64(data.buffer);
      expect(typeof result).toBe('string');
    });

    it('should handle 256 bytes (full byte range)', () => {
      const data = new Uint8Array(256);
      for (let i = 0; i < 256; i++) data[i] = i;
      const result = calculateBufferCRC64(data.buffer);
      expect(typeof result).toBe('string');
    });
  });

  describe('updateCRC64', () => {
    it('should accept Uint8Array', () => {
      const data = new Uint8Array([1, 2, 3]);
      const result = updateCRC64(CRC64_INIT_VALUE, data);
      expect(typeof result).toBe('bigint');
    });

    it('should accept ArrayBuffer', () => {
      const data = new ArrayBuffer(3);
      const view = new Uint8Array(data);
      view.set([1, 2, 3]);
      const result = updateCRC64(CRC64_INIT_VALUE, data);
      expect(typeof result).toBe('bigint');
    });

    it('should produce same result for Uint8Array and ArrayBuffer with same data', () => {
      const arr = new Uint8Array([10, 20, 30]);
      const buf = arr.buffer.slice(0);
      const crc1 = updateCRC64(CRC64_INIT_VALUE, arr);
      const crc2 = updateCRC64(CRC64_INIT_VALUE, buf);
      expect(crc1).toBe(crc2);
    });

    it('should be incrementally computable', () => {
      const fullData = new Uint8Array([1, 2, 3, 4, 5, 6]);
      const part1 = new Uint8Array([1, 2, 3]);
      const part2 = new Uint8Array([4, 5, 6]);

      const fullCrc = updateCRC64(CRC64_INIT_VALUE, fullData);
      let incrementalCrc = updateCRC64(CRC64_INIT_VALUE, part1);
      incrementalCrc = updateCRC64(incrementalCrc, part2);

      expect(incrementalCrc).toBe(fullCrc);
    });
  });

  describe('finalizeCRC64', () => {
    it('should return decimal string', () => {
      const crc = updateCRC64(CRC64_INIT_VALUE, new Uint8Array([1, 2, 3]));
      const result = finalizeCRC64(crc);
      expect(/^\d+$/.test(result)).toBe(true);
    });

    it('should be deterministic', () => {
      const crc = updateCRC64(CRC64_INIT_VALUE, new Uint8Array([42]));
      expect(finalizeCRC64(crc)).toBe(finalizeCRC64(crc));
    });
  });

  describe('combineCRC64', () => {
    it('should return crc1 when len2 is 0', () => {
      const crc1 = '12345';
      const result = combineCRC64(crc1, '67890', 0);
      expect(result).toBe('12345');
    });

    it('should produce consistent results', () => {
      const data1 = new Uint8Array([1, 2, 3]);
      const data2 = new Uint8Array([4, 5, 6]);

      const crc1 = calculateBufferCRC64(data1.buffer);
      const crc2 = calculateBufferCRC64(data2.buffer);

      const combined = combineCRC64(crc1, crc2, data2.length);
      expect(typeof combined).toBe('string');
      expect(/^\d+$/.test(combined)).toBe(true);
    });

    it('combined CRC64 should match full CRC64 for concatenated data', () => {
      const data1 = new Uint8Array([1, 2, 3, 4]);
      const data2 = new Uint8Array([5, 6, 7, 8]);
      const fullData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

      const crc1 = calculateBufferCRC64(data1.buffer);
      const crc2 = calculateBufferCRC64(data2.buffer);
      const combined = combineCRC64(crc1, crc2, data2.length);

      const fullCrc = calculateBufferCRC64(fullData.buffer);
      expect(combined).toBe(fullCrc);
    });
  });

  describe('combinePartsCRC64', () => {
    it('should return finalized init value for empty parts', () => {
      const result = combinePartsCRC64([]);
      expect(typeof result).toBe('string');
      // Should equal finalizeCRC64(CRC64_INIT_VALUE) 
      expect(result).toBe(finalizeCRC64(CRC64_INIT_VALUE));
    });

    it('should return single part CRC64 for one part', () => {
      const data = new Uint8Array([1, 2, 3]);
      const crc = calculateBufferCRC64(data.buffer);
      const result = combinePartsCRC64([{ crc64: crc, size: 3 }]);
      expect(result).toBe(crc);
    });

    it('should combine multiple parts correctly', () => {
      const data1 = new Uint8Array([1, 2]);
      const data2 = new Uint8Array([3, 4]);
      const data3 = new Uint8Array([5, 6]);
      const fullData = new Uint8Array([1, 2, 3, 4, 5, 6]);

      const parts = [
        { crc64: calculateBufferCRC64(data1.buffer), size: 2 },
        { crc64: calculateBufferCRC64(data2.buffer), size: 2 },
        { crc64: calculateBufferCRC64(data3.buffer), size: 2 },
      ];

      const combined = combinePartsCRC64(parts);
      const fullCrc = calculateBufferCRC64(fullData.buffer);
      expect(combined).toBe(fullCrc);
    });

    it('should handle null/undefined input', () => {
      const result = combinePartsCRC64(null as any);
      expect(typeof result).toBe('string');
    });
  });

  describe('CRC64_INIT_VALUE', () => {
    it('should be a bigint', () => {
      expect(typeof CRC64_INIT_VALUE).toBe('bigint');
    });

    it('should equal 0xFFFFFFFFFFFFFFFF', () => {
      expect(CRC64_INIT_VALUE).toBe(BigInt('0xFFFFFFFFFFFFFFFF'));
    });
  });
});
