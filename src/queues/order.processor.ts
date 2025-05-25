import { orderQueue } from './order.queue';
import { logger } from '../utils/logger';

interface OrderJobData {
  userId: number;
  orderId: number;
  totalAmount: number;
  items: { productId: number; productName: string; quantity: number }[];
}

/**
 * 注册订单队列的处理器（Worker）
 * 每个处理器独立运行，失败时互不影响
 */
export function registerOrderProcessors(): void {
  // 处理器1：发送通知（模拟短信/邮件/推送服务）
  orderQueue.process('notify', async (job) => {
    const { userId, orderId, totalAmount } = job.data as OrderJobData;

    // 模拟异步调用第三方通知服务
    await new Promise((resolve) => setTimeout(resolve, 100));

    logger.info(
      `📧 [队列] 订单创建通知已发送: 用户 ${userId}, 订单 ${orderId}, 金额 ¥${totalAmount}`
    );
  });

  // 处理器2：更新统计数据（模拟报表系统）
  orderQueue.process('stats', async (job) => {
    const { orderId, items } = job.data as OrderJobData;

    // 模拟异步写入统计数据库
    await new Promise((resolve) => setTimeout(resolve, 50));

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    logger.info(
      `📊 [队列] 订单统计已更新: 订单 ${orderId}, 商品数 ${items.length}, 总件数 ${totalQuantity}`
    );
  });

  logger.info('🛠️ 订单队列处理器已注册（2个 Worker）');
}
