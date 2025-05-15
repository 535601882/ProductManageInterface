import { EventEmitter } from 'events';

/**
 * 全局事件总线
 * 基于 Node.js 内置 EventEmitter，内存级发布-订阅
 *
 * 适用场景：单机内解耦业务流程（订单创建后触发通知、统计等）
 * 局限性：进程重启事件丢失，无法跨进程通信（v8 将引入 MQ 解决）
 */
class EventBus extends EventEmitter {
  constructor() {
    super();
    // 不限制监听器数量，生产环境建议设置合理上限
    this.setMaxListeners(50);
  }

  /**
   * 发布事件
   */
  publish<T = any>(event: string, payload: T): void {
    this.emit(event, payload);
  }

  /**
   * 订阅事件
   */
  subscribe<T = any>(event: string, handler: (payload: T) => void): void {
    this.on(event, handler);
  }
}

export const eventBus = new EventBus();
