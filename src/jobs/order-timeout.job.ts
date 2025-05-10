import schedule from 'node-schedule';
import { Op } from 'sequelize';
import { Order, OrderItem } from '../models';
import { orderService } from '../services/order.service';
import { redis, redisConnected } from '../config/redis';
import { logger } from '../utils/logger';

const LOCK_KEY = 'job:order-timeout:lock';
const LOCK_TTL = 300; // 锁有效期 5 分钟
const TIMEOUT_MINUTES = 30; // 订单超时时间 30 分钟

/**
 * 启动订单超时自动取消任务
 * 每 5 分钟扫描一次，取消超过 30 分钟未支付的订单
 */
export function startOrderTimeoutJob(): void {
  // cron: 每5分钟执行一次
  schedule.scheduleJob('*/5 * * * *', async () => {
    logger.info('⏰ 开始执行订单超时扫描任务');

    // 尝试获取分布式锁（防止多实例重复执行）
    let lockAcquired = false;

    if (redisConnected) {
      const lockValue = `${Date.now()}`;
      const result = await redis.set(LOCK_KEY, lockValue, 'NX', 'EX', LOCK_TTL);
      if (result !== 'OK') {
        logger.info('🔒 订单超时任务已被其他实例锁定，跳过本次执行');
        return;
      }
      lockAcquired = true;
      logger.info('🔒 获取分布式锁成功');
    } else {
      logger.info('⚠️ Redis 不可用，跳过分布式锁（单实例模式）');
    }

    try {
      // 查询超时订单：待支付且创建时间超过30分钟
      const expireTime = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000);

      const orders = await Order.findAll({
        where: {
          status: 0, // 待支付
          createdAt: { [Op.lt]: expireTime },
        },
        include: [
          {
            model: OrderItem,
            as: 'items',
            attributes: ['productId', 'quantity'],
          },
        ],
      });

      if (orders.length === 0) {
        logger.info('📭 未发现超时订单');
        return;
      }

      logger.info(`📋 发现 ${orders.length} 个超时订单，开始自动取消`);

      let successCount = 0;
      let failCount = 0;

      for (const order of orders) {
        try {
          await orderService.cancelOrder(order.id);
          logger.info(`✅ 订单 ${order.id} 已自动取消，库存已恢复`);
          successCount++;
        } catch (err: any) {
          logger.error(`❌ 订单 ${order.id} 自动取消失败: ${err.message}`);
          failCount++;
        }
      }

      logger.info(`📊 订单超时任务完成：成功 ${successCount} 个，失败 ${failCount} 个`);
    } catch (err: any) {
      logger.error('❌ 订单超时扫描任务异常:', err.message);
    } finally {
      // 释放分布式锁
      if (lockAcquired) {
        await redis.del(LOCK_KEY);
        logger.info('🔓 分布式锁已释放');
      }
    }
  });

  logger.info('📅 订单超时自动取消任务已注册（每5分钟执行一次）');
}
