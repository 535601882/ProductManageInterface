import Queue from 'bull';
import { queueRedisConfig } from './config';
import { logger } from '../utils/logger';

/**
 * 订单队列
 * 用于异步处理订单创建后的附属操作（通知、统计等）
 */
export const orderQueue = new Queue('order', queueRedisConfig);

// 队列事件监听（用于日志和监控）
orderQueue.on('completed', (job) => {
  logger.info(`✅ 队列任务完成 [${job.name}]: ${job.id}`);
});

orderQueue.on('failed', (job, err) => {
  logger.error(`❌ 队列任务失败 [${job.name}]: ${job.id}, 错误: ${err.message}`);
});

orderQueue.on('stalled', (job) => {
  logger.warn(`⚠️ 队列任务停滞 [${job.name}]: ${job.id}`);
});
