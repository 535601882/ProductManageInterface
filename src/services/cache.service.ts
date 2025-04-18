import { redis, redisConnected } from '../config/redis';
import { logger } from '../utils/logger';

const NULL_PLACEHOLDER = '__NULL__';

class CacheService {
  /**
   * 从缓存获取数据
   * @returns 命中返回解析后的数据；未命中或 Redis 不可用返回 null
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redisConnected) return null;

    try {
      const data = await redis.get(key);
      if (data === null) return null;
      if (data === NULL_PLACEHOLDER) return null as unknown as T; // 空值缓存标记
      return JSON.parse(data) as T;
    } catch (err) {
      logger.warn(`Redis GET 失败 [${key}]:`, err);
      return null;
    }
  }

  /**
   * 写入缓存
   * @param ttl 过期时间（秒）
   */
  async set(key: string, value: any, ttl: number): Promise<void> {
    if (!redisConnected) return;

    try {
      const serialized = JSON.stringify(value);
      await redis.set(key, serialized, 'EX', ttl);
    } catch (err) {
      logger.warn(`Redis SET 失败 [${key}]:`, err);
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string | string[]): Promise<void> {
    if (!redisConnected) return;

    try {
      const keys = Array.isArray(key) ? key : [key];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      logger.warn(`Redis DEL 失败 [${key}]:`, err);
    }
  }

  /**
   * 按模式删除缓存（如 product:list:*）
   */
  async delPattern(pattern: string): Promise<void> {
    if (!redisConnected) return;

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug(`缓存清理: ${pattern} (${keys.length} 个 key)`);
      }
    } catch (err) {
      logger.warn(`Redis DEL pattern 失败 [${pattern}]:`, err);
    }
  }

  /**
   * Cache Aside 核心方法：先读缓存，未命中则查库并回填
   *
   * 防护策略：
   * - 缓存穿透：cacheNull=true 时缓存空值 60s
   * - 缓存击穿：互斥锁（SET NX EX），只有一个线程重建缓存
   * - 缓存雪崩：过期时间附加 0~60s 随机偏移
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number,
    options: { cacheNull?: boolean; lockTimeout?: number } = {}
  ): Promise<T> {
    // 1. 先查缓存
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    // 若 Redis 不可用，直接降级查库
    if (!redisConnected) {
      return factory();
    }

    const lockKey = `${key}:lock`;
    const lockTimeout = options.lockTimeout || 10;

    // 2. 尝试获取互斥锁
    try {
      const acquired = await redis.set(lockKey, '1', 'NX', 'EX', lockTimeout);

      if (acquired === 'OK') {
        try {
          // 双重检查：抢到锁后再查一次，防止其他线程已写入
          const doubleCheck = await this.get<T>(key);
          if (doubleCheck !== null) return doubleCheck;

          // 执行查库
          const result = await factory();

          if (result !== null && result !== undefined) {
            // 随机过期时间防雪崩（附加 0~60s 偏移）
            const expire = ttl + Math.floor(Math.random() * 60);
            await this.set(key, result, expire);
          } else if (options.cacheNull) {
            // 缓存空值防穿透
            await this.set(key, NULL_PLACEHOLDER, 60);
          }

          return result;
        } finally {
          // 释放锁
          await redis.del(lockKey);
        }
      }
    } catch (err) {
      logger.warn(`缓存锁获取失败 [${key}]:`, err);
    }

    // 3. 没抢到锁：短暂等待后重试
    await new Promise((resolve) => setTimeout(resolve, 50));
    const retry = await this.get<T>(key);
    if (retry !== null) return retry;

    // 4. 最终降级：直接查库
    logger.debug(`缓存降级查库 [${key}]`);
    return factory();
  }
}

export const cacheService = new CacheService();
