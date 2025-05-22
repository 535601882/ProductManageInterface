import { env } from '../config/env';

/**
 * Bull 队列 Redis 配置
 * 复用项目已有的 Redis 连接配置
 */
export const queueRedisConfig = {
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    db: env.REDIS_DB,
  },
};
