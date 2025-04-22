import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

export let redisConnected = false;

// 用临时连接检测 Redis 可用性，避免污染全局实例
export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  db: env.REDIS_DB,
  lazyConnect: true, // 首次使用时才连接
});

export async function testRedisConnection(): Promise<boolean> {
  if (!env.CACHE_ENABLED) {
    logger.info('⏭️ 缓存已禁用，跳过 Redis 连接');
    redisConnected = false;
    return false;
  }

  // 使用临时实例检测，失败时静默断开，不触发全局重连
  const tester = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    lazyConnect: true,
    connectTimeout: 2000,
    maxRetriesPerRequest: 0,
    retryStrategy: () => null, // 不重试
  });

  try {
    await tester.connect();
    await tester.ping();
    await tester.disconnect();
    redisConnected = true;
    logger.info('✅ Redis 连接成功');
    return true;
  } catch (err) {
    await tester.disconnect();
    redisConnected = false;
    logger.warn('⚠️ Redis 连接失败，服务将以无缓存模式运行');
    return false;
  }
}
