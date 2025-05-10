import { startOrderTimeoutJob } from './order-timeout.job';
import { logger } from '../utils/logger';

/**
 * 启动所有定时任务
 */
export function startAllJobs(): void {
  startOrderTimeoutJob();
  logger.info('⏰ 所有定时任务已启动');
}
