import { eventBus } from './event-bus';
import { logger } from '../utils/logger';

interface OrderCreatedPayload {
  userId: number;
  orderId: number;
  totalAmount: number;
  items: { productId: number; productName: string; quantity: number }[];
}

/**
 * 注册订单创建事件的消费者
 * 模拟真实场景：发通知、更新统计
 */
export function registerOrderCreatedListeners(): void {
  // 消费者1：发送通知（模拟短信/邮件服务）
  eventBus.subscribe<OrderCreatedPayload>('order:created', async (payload) => {
    try {
      // 模拟异步调用第三方通知服务
      await new Promise((resolve) => setTimeout(resolve, 100));
      logger.info(
        `📧 订单创建通知已发送: 用户 ${payload.userId}, 订单 ${payload.orderId}, 金额 ¥${payload.totalAmount}`
      );
    } catch (err: any) {
      logger.error('❌ 订单创建通知发送失败:', err.message);
    }
  });

  // 消费者2：更新统计数据（模拟报表系统）
  eventBus.subscribe<OrderCreatedPayload>('order:created', async (payload) => {
    try {
      // 模拟异步写入统计数据库
      await new Promise((resolve) => setTimeout(resolve, 50));
      const totalQuantity = payload.items.reduce((sum, item) => sum + item.quantity, 0);
      logger.info(
        `📊 订单统计已更新: 订单 ${payload.orderId}, 商品数 ${payload.items.length}, 总件数 ${totalQuantity}`
      );
    } catch (err: any) {
      logger.error('❌ 订单统计更新失败:', err.message);
    }
  });

  logger.info('📡 订单创建事件监听者已注册（2个消费者）');
}
