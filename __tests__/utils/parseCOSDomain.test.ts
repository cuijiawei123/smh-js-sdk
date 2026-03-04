import { describe, it, expect } from 'vitest';
import { parseCOSDomain } from '../../utils/index';

describe('parseCOSDomain', () => {
  it('should parse standard COS domain', () => {
    const result = parseCOSDomain('my-bucket-1250000000.cos.ap-guangzhou.myqcloud.com');
    expect(result).toEqual({
      bucket: 'my-bucket-1250000000',
      region: 'ap-guangzhou',
    });
  });

  it('should parse domain with different region', () => {
    const result = parseCOSDomain('test-bucket.cos.ap-shanghai.myqcloud.com');
    expect(result).toEqual({
      bucket: 'test-bucket',
      region: 'ap-shanghai',
    });
  });

  it('should parse domain with dashes in bucket name', () => {
    const result = parseCOSDomain('my-test-bucket-123.cos.ap-beijing.myqcloud.com');
    expect(result).toEqual({
      bucket: 'my-test-bucket-123',
      region: 'ap-beijing',
    });
  });

  it('should throw for invalid domain format', () => {
    expect(() => parseCOSDomain('invalid-domain.com')).toThrow('Invalid COS domain format');
  });

  it('should throw for empty string', () => {
    expect(() => parseCOSDomain('')).toThrow('Invalid COS domain format');
  });

  it('should throw for domain without cos prefix', () => {
    expect(() => parseCOSDomain('bucket.cdn.ap-guangzhou.myqcloud.com')).toThrow('Invalid COS domain format');
  });

  it('should throw for domain with missing region', () => {
    expect(() => parseCOSDomain('bucket.cos.myqcloud.com')).toThrow('Invalid COS domain format');
  });

  it('should handle international regions', () => {
    const result = parseCOSDomain('bucket.cos.na-siliconvalley.myqcloud.com');
    expect(result).toEqual({
      bucket: 'bucket',
      region: 'na-siliconvalley',
    });
  });
});
