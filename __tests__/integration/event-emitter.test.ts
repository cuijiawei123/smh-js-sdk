/// <reference types="node" />
/**
 * EventEmitter 集成测试
 * 覆盖：on、once、off（单个/通配符）、emit、链式调用
 */
import { describe, it, expect, vi } from 'vitest';
import EventEmitter from '../../utils/EventEmitter';
import { skipIfNoConfig } from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('EventEmitter', () => {

  // ─── on ────────────────────────────────────────────────

  describe('on', () => {
    it('应注册并触发事件监听器', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn();
      emitter.on('test', fn);
      emitter.emit('test', { value: 1 });
      expect(fn).toHaveBeenCalledWith({ value: 1 });
    });

    it('应支持同一事件注册多个监听器', () => {
      const emitter = new EventEmitter();
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      emitter.on('evt', fn1);
      emitter.on('evt', fn2);
      emitter.emit('evt', 'data');
      expect(fn1).toHaveBeenCalledWith('data');
      expect(fn2).toHaveBeenCalledWith('data');
    });

    it('应支持链式调用', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn();
      const result = emitter.on('a', fn);
      expect(result).toBe(emitter);
    });

    it('多次 emit 应多次触发', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn();
      emitter.on('ping', fn);
      emitter.emit('ping');
      emitter.emit('ping');
      emitter.emit('ping');
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  // ─── once ──────────────────────────────────────────────

  describe('once', () => {
    it('应只触发一次', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn();
      emitter.once('one-time', fn);
      emitter.emit('one-time', 'first');
      emitter.emit('one-time', 'second');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('first');
    });

    it('callback 为 falsy 时应安全返回', () => {
      const emitter = new EventEmitter();
      const result = emitter.once('test', undefined as any);
      expect(result).toBe(emitter);
    });

    it('多个 once 监听器应各自只触发一次', () => {
      const emitter = new EventEmitter();
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      emitter.once('evt', fn1);
      emitter.once('evt', fn2);
      emitter.emit('evt', 'data');
      emitter.emit('evt', 'data2');
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
    });
  });

  // ─── off ───────────────────────────────────────────────

  describe('off', () => {
    it('应移除指定监听器', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn();
      emitter.on('evt', fn);
      emitter.off('evt', fn);
      emitter.emit('evt');
      expect(fn).not.toHaveBeenCalled();
    });

    it('使用 "*" 应移除所有监听器', () => {
      const emitter = new EventEmitter();
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      emitter.on('evt', fn1);
      emitter.on('evt', fn2);
      emitter.off('evt', '*');
      emitter.emit('evt');
      expect(fn1).not.toHaveBeenCalled();
      expect(fn2).not.toHaveBeenCalled();
    });

    it('移除不存在的监听器应安全返回', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn();
      expect(() => emitter.off('nonexistent', fn)).not.toThrow();
    });

    it('应支持链式调用', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn();
      const result = emitter.off('evt', fn);
      expect(result).toBe(emitter);
    });
  });

  // ─── emit ──────────────────────────────────────────────

  describe('emit', () => {
    it('无监听器时应安全调用', () => {
      const emitter = new EventEmitter();
      expect(() => emitter.emit('nothing')).not.toThrow();
    });

    it('应支持 string 数据', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn();
      emitter.on('msg', fn);
      emitter.emit('msg', 'hello');
      expect(fn).toHaveBeenCalledWith('hello');
    });

    it('应支持 object 数据', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn();
      emitter.on('msg', fn);
      emitter.emit('msg', { key: 'value' });
      expect(fn).toHaveBeenCalledWith({ key: 'value' });
    });

    it('应支持无数据调用', () => {
      const emitter = new EventEmitter();
      const fn = vi.fn();
      emitter.on('evt', fn);
      emitter.emit('evt');
      expect(fn).toHaveBeenCalledWith(undefined);
    });

    it('emit 应支持链式调用', () => {
      const emitter = new EventEmitter();
      const result = emitter.emit('test');
      expect(result).toBe(emitter);
    });

    it('混合 on 和 once 监听器应正确触发', () => {
      const emitter = new EventEmitter();
      const onFn = vi.fn();
      const onceFn = vi.fn();
      emitter.on('evt', onFn);
      emitter.once('evt', onceFn);
      emitter.emit('evt', 'data');
      emitter.emit('evt', 'data2');
      expect(onFn).toHaveBeenCalledTimes(2);
      expect(onceFn).toHaveBeenCalledTimes(1);
    });
  });

  // ─── 不同事件互不干扰 ──────────────────────────────────

  describe('事件隔离', () => {
    it('不同事件名的监听器互不干扰', () => {
      const emitter = new EventEmitter();
      const fnA = vi.fn();
      const fnB = vi.fn();
      emitter.on('a', fnA);
      emitter.on('b', fnB);
      emitter.emit('a', 'data-a');
      expect(fnA).toHaveBeenCalledWith('data-a');
      expect(fnB).not.toHaveBeenCalled();
    });
  });
});
