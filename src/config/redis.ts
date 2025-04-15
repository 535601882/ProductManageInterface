import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

export let redisConnected = false;

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  db: env.REDIS_DB,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.warn(`Redis 重连次数超过3次，停止重试`);
      return null; // 停止重试
    }
    return Math.min(times * 100, 3000);
  },
  lazyConnect: true, // 首次使用时才连接
});

export async function testRedisConnection(): Promise<boolean> {
  if (!env.CACHE_ENABLED) {
    logger.info('⏭️ 缓存已禁用，跳过 Redis 连接');
    redisConnected = false;
    return false;
  }

  try {
    await redis.connect();
    await redis.ping();
    redisConnected = true;
    logger.info('✅ Redis 连接成功');
    return true;
  } catch (err) {
    redisConnected = false;
    logger.warn('⚠️ Redis 连接失败，服务将以无缓存模式运行');
    return false;
  }
}
