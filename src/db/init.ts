import '../models'; // 导入模型以触发 addModels
import { sequelize, testConnection } from '../config/database';
import { logger } from '../utils/logger';

/**
 * 初始化数据库：同步模型到数据库
 * 注意：生产环境建议使用迁移工具（如 sequelize-cli）
 */
async function initDatabase(): Promise<void> {
  try {
    await testConnection();

    // force: false 不会删除已有表；alter: true 会尝试更新表结构
    await sequelize.sync({ force: false, alter: true });
    logger.info('✅ 数据库模型同步完成');

    process.exit(0);
  } catch (err) {
    logger.error('❌ 数据库初始化失败:', err);
    process.exit(1);
  }
}

initDatabase();
