import { describe, it, expect } from 'vitest';
import { TaskStatus } from '../../loaders/types';

describe('TaskStatus', () => {
  it('should have all expected status values', () => {
    expect(TaskStatus.WAITING).toBe('waiting');
    expect(TaskStatus.START).toBe('start');
    expect(TaskStatus.COMPUTING_HASH).toBe('computing_hash');
    expect(TaskStatus.CREATED).toBe('created');
    expect(TaskStatus.PREPARING).toBe('preparing');
    expect(TaskStatus.RUNNING).toBe('running');
    expect(TaskStatus.PAUSED).toBe('paused');
    expect(TaskStatus.COMPLETE).toBe('complete');
    expect(TaskStatus.CONFIRMING).toBe('confirming');
    expect(TaskStatus.SUCCESS).toBe('success');
    expect(TaskStatus.RAPID_SUCCESS).toBe('rapid_success');
    expect(TaskStatus.ERROR).toBe('error');
    expect(TaskStatus.CANCELED).toBe('canceled');
  });

  it('should have 13 total status values', () => {
    const values = Object.values(TaskStatus);
    expect(values).toHaveLength(13);
  });

  it('should have unique values', () => {
    const values = Object.values(TaskStatus);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});
