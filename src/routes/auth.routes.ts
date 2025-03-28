import { Router } from 'express';
import {
  authController,
  registerSchema,
  loginSchema,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { Request, Response } from 'express';
import { success, error } from '../utils/response';
import { userService } from '../services/user.service';

const router = Router();

// 注册
router.post('/register', validate(registerSchema, 'body'), authController.register);

// 登录
router.post('/login', validate(loginSchema, 'body'), authController.login);

// 刷新Token
router.post('/refresh', authController.refresh);

// 登出
router.post('/logout', authController.logout);

// 获取当前登录用户信息（需要认证）
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await userService.findById(userId);
    if (!user) {
      error(res, '用户不存在', 404, 404);
      return;
    }
    success(res, user);
  } catch (err) {
    error(res, '获取用户信息失败', 500, 500);
  }
});

export default router;
