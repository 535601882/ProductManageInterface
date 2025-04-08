import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import rbacRoutes from './rbac.routes';
import { success } from '../utils/response';
import { dbConnected } from '../config/database';

const router = Router();

// 健康检查
router.get('/health', (req: Request, res: Response) => {
  success(res, {
    status: 'ok',
    dbConnected,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, dbConnected ? '服务运行正常' : '服务运行中（数据库未连接）');
});

// 注册各模块路由
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/rbac', rbacRoutes);

export default router;
