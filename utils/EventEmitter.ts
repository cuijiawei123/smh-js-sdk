/**
 * EventEmitter - 事件发射器
 * 用于实现上传/下载任务的事件机制
 */

const getList = Symbol('getList');

type Callback = (params?: any) => void;
interface Listener extends Callback {
  once?: boolean;
}
type Listeners = Record<string, Array<Listener>>;

class EventEmitter {
  listeners: Listeners;

  constructor() {
    this.listeners = {};
  }

  [getList](action: string): Array<Listener> {
    if (!this.listeners[action]) {
      this.listeners[action] = [];
    }
    return this.listeners[action];
  }

  on(action: string, callback: Listener): EventEmitter {
    this[getList](action).push(callback);
    return this;
  }

  once(action: string, callback: Listener): EventEmitter {
    if (!callback) return this;
    const listener = callback;
    listener.once = true;
    this.on(action, listener);
    return this;
  }

  off(action: string, callback: Listener | '*'): EventEmitter {
    const list = this[getList](action);
    if (callback === '*') {
      for (let i = list.length - 1; i >= 0; i -= 1) {
        list.splice(i, 1);
      }
    } else {
      for (let i = list.length - 1; i >= 0; i -= 1) {
        if (callback === list[i]) {
          list.splice(i, 1);
        }
      }
    }
    return this;
  }

  emit(action: string, data?: string | object): EventEmitter {
    const list = this[getList](action).map(cb => cb);
    for (let i = 0; i < list.length; i += 1) {
      const callback = list[i];
      callback(data);
      if (list[i].once) {
        this.off(action, list[i]);
      }
    }
    return this;
  }
}

export default EventEmitter;
