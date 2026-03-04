import { describe, it, expect, vi } from 'vitest';
import EventEmitter from '../../utils/EventEmitter';

type Listener = (params?: any) => void;

describe('EventEmitter', () => {
  it('should create an instance with empty listeners', () => {
    const emitter = new EventEmitter();
    expect(emitter.listeners).toEqual({});
  });

  describe('on', () => {
    it('should register a listener', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn() as Listener;
      emitter.on('test', fn);
      emitter.emit('test');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should support chaining', () => {
      const emitter = new EventEmitter();
      const result = emitter.on('test', vi.fn() as Listener);
      expect(result).toBe(emitter);
    });

    it('should register multiple listeners for the same event', () => {
      const emitter = new EventEmitter();
      const fn1 = vi.fn() as Listener;
      const fn2 = vi.fn() as Listener;
      emitter.on('test', fn1);
      emitter.on('test', fn2);
      emitter.emit('test');
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
    });

    it('should register listeners for different events independently', () => {
      const emitter = new EventEmitter();
      const fn1 = vi.fn() as Listener;
      const fn2 = vi.fn() as Listener;
      emitter.on('a', fn1);
      emitter.on('b', fn2);
      emitter.emit('a');
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).not.toHaveBeenCalled();
    });
  });

  describe('emit', () => {
    it('should pass data to listeners', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn() as Listener;
      emitter.on('test', fn);
      emitter.emit('test', { key: 'value' });
      expect(fn).toHaveBeenCalledWith({ key: 'value' });
    });

    it('should pass string data', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn() as Listener;
      emitter.on('test', fn);
      emitter.emit('test', 'hello');
      expect(fn).toHaveBeenCalledWith('hello');
    });

    it('should handle emit with no listeners', () => {
      const emitter = new EventEmitter();
      expect(() => emitter.emit('nonexistent')).not.toThrow();
    });

    it('should support chaining', () => {
      const emitter = new EventEmitter();
      const result = emitter.emit('test');
      expect(result).toBe(emitter);
    });

    it('should call listeners in registration order', () => {
      const emitter = new EventEmitter();
      const order: number[] = [];
      emitter.on('test', () => order.push(1));
      emitter.on('test', () => order.push(2));
      emitter.on('test', () => order.push(3));
      emitter.emit('test');
      expect(order).toEqual([1, 2, 3]);
    });

    it('should emit without data (undefined)', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn() as Listener;
      emitter.on('test', fn);
      emitter.emit('test');
      expect(fn).toHaveBeenCalledWith(undefined);
    });
  });

  describe('once', () => {
    it('should only trigger listener once', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn() as Listener;
      emitter.once('test', fn);
      emitter.emit('test');
      emitter.emit('test');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass data to once listener', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn() as Listener;
      emitter.once('test', fn);
      emitter.emit('test', { data: 42 });
      expect(fn).toHaveBeenCalledWith({ data: 42 });
    });

    it('should support chaining', () => {
      const emitter = new EventEmitter();
      const result = emitter.once('test', vi.fn() as Listener);
      expect(result).toBe(emitter);
    });

    it('should handle null callback gracefully', () => {
      const emitter = new EventEmitter();
      const result = emitter.once('test', null as any);
      expect(result).toBe(emitter);
    });

    it('should remove once listener even when mixed with regular listeners', () => {
      const emitter = new EventEmitter();
      const onceFn = vi.fn() as Listener;
      const regularFn = vi.fn() as Listener;
      emitter.on('test', regularFn);
      emitter.once('test', onceFn);
      emitter.emit('test');
      emitter.emit('test');
      expect(onceFn).toHaveBeenCalledTimes(1);
      expect(regularFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('off', () => {
    it('should remove a specific listener', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn() as Listener;
      emitter.on('test', fn);
      emitter.off('test', fn);
      emitter.emit('test');
      expect(fn).not.toHaveBeenCalled();
    });

    it('should remove all listeners with wildcard *', () => {
      const emitter = new EventEmitter();
      const fn1 = vi.fn() as Listener;
      const fn2 = vi.fn() as Listener;
      emitter.on('test', fn1);
      emitter.on('test', fn2);
      emitter.off('test', '*');
      emitter.emit('test');
      expect(fn1).not.toHaveBeenCalled();
      expect(fn2).not.toHaveBeenCalled();
    });

    it('should not affect other events when removing', () => {
      const emitter = new EventEmitter();
      const fn1 = vi.fn() as Listener;
      const fn2 = vi.fn() as Listener;
      emitter.on('a', fn1);
      emitter.on('b', fn2);
      emitter.off('a', fn1);
      emitter.emit('b');
      expect(fn2).toHaveBeenCalledTimes(1);
    });

    it('should handle removing non-existent listener', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn() as Listener;
      expect(() => emitter.off('test', fn)).not.toThrow();
    });

    it('should support chaining', () => {
      const emitter = new EventEmitter();
      const result = emitter.off('test', '*');
      expect(result).toBe(emitter);
    });

    it('should only remove matching listener when multiple registered', () => {
      const emitter = new EventEmitter();
      const fn1 = vi.fn() as Listener;
      const fn2 = vi.fn() as Listener;
      emitter.on('test', fn1);
      emitter.on('test', fn2);
      emitter.off('test', fn1);
      emitter.emit('test');
      expect(fn1).not.toHaveBeenCalled();
      expect(fn2).toHaveBeenCalledTimes(1);
    });
  });
});
