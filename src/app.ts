import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { sequelize, testConnection, dbConnected } from './config/database';
import { testRedisConnection } from './config/redis';
import { swaggerSpec } from './config/swagger';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler, AppError } from './middlewares/error-handler';
import { startAllJobs } from './jobs/scheduler';
import { registerOrderCreatedListeners } from './events/order-created.listener';
import { registerOrderProcessors } from './queues/order.processor';

// 导入模型（触发 addModels）
import './models';

// 导入路由
import apiRoutes from './routes';

const app: Application = express();

// ==================== 全局中间件 ====================

// 解析 JSON 请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 跨域支持
app.use(cors());

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ==================== API 文档 ====================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ==================== 数据库状态检查中间件 ====================
app.use('/api', (req, res, next) => {
  if (!dbConnected && req.path !== '/health') {
    res.status(503).json({
      code: 503,
      message: '数据库服务不可用，请先启动 MySQL。提示：docker-compose up -d mysql',
      data: null,
      timestamp: Date.now(),
    });
    return;
  }
  next();
});

// ==================== 路由 ====================

app.use('/api', apiRoutes);

// ==================== 错误处理 ====================

// 404 处理
app.use(notFoundHandler);

// 全局错误处理（必须放在最后）
app.use(errorHandler);

// ==================== 启动服务 ====================

const PORT = env.PORT;

async function startServer(): Promise<void> {
  // 测试 Redis 连接（失败不阻断，优雅降级）
  await testRedisConnection();

  // 测试数据库连接（失败不退出，继续启动）
  const connected = await testConnection();

  if (connected && env.NODE_ENV === 'development') {
    try {
      await sequelize.sync({ alter: true });
      logger.info('✅ 数据库模型同步完成');
    } catch (err) {
      logger.error('⚠️ 数据库模型同步失败:', err);
    }
  }

  app.listen(PORT, () => {
    logger.info(`🚀 服务器启动成功: http://localhost:${PORT}`);
    logger.info(`📚 API 文档地址: http://localhost:${PORT}/api-docs`);
    if (!connected) {
      logger.info('⚠️ 当前处于无数据库模式，Swagger 文档可正常访问');
      logger.info('💡 启动 MySQL 后接口即可使用：docker-compose up -d mysql');
    }
  });

  // 数据库连接成功后启动定时任务和事件监听
  if (connected) {
    startAllJobs();
    registerOrderCreatedListeners();
    registerOrderProcessors();
  }
}

startServer();
