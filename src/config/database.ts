import { Sequelize } from 'sequelize-typescript';
import { env } from './env';
import { logger } from '../utils/logger';

export let dbConnected = false;

export const sequelize = new Sequelize({
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'mysql',
  logging: env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true, // 默认添加 createdAt 和 updatedAt
    underscored: true, // 字段名使用下划线命名
  },
});

// 数据库连接测试
export async function testConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    dbConnected = true;
    logger.info('✅ 数据库连接成功');
    return true;
  } catch (err: any) {
    dbConnected = false;
    logger.error('❌ 数据库连接失败:', err.message);
    logger.info('💡 提示：请确保 MySQL 已启动。可使用 Docker 一键启动：docker-compose up -d mysql');
    return false;
  }
}
