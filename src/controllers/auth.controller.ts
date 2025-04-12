import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { success, error } from '../utils/response';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { rbacService } from '../services/rbac.service';
import Joi from 'joi';

// 注册校验规则
export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.min': '用户名至少3个字符',
    'string.max': '用户名最多50个字符',
    'any.required': '用户名不能为空',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': '密码至少6个字符',
    'any.required': '密码不能为空',
  }),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
    'string.pattern.base': '手机号格式不正确',
  }),
});

// 登录校验规则
export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'any.required': '用户名不能为空',
  }),
  password: Joi.string().required().messages({
    'any.required': '密码不能为空',
  }),
});

export class AuthController {
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: 用户注册
   *     tags: [认证]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [username, password]
   *             properties:
   *               username: { type: string }
   *               password: { type: string }
   *               email: { type: string }
   *               phone: { type: string }
   *     responses:
   *       201:
   *         description: 注册成功
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.create(req.body);
      success(res, user, '注册成功', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: 用户登录
   *     tags: [认证]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [username, password]
   *             properties:
   *               username: { type: string }
   *               password: { type: string }
   *     responses:
   *       200:
   *         description: 登录成功，返回双令牌
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;

      // 查找用户
      const user = await userService.findByUsername(username);
      if (!user) {
        error(res, '用户名或密码错误', 401, 401);
        return;
      }

      // 校验密码
      const isValid = await userService.verifyPassword(password, user.password);
      if (!isValid) {
        error(res, '用户名或密码错误', 401, 401);
        return;
      }

      // 生成双令牌
      const payload = { userId: user.id, username: user.username };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // 返回用户信息（去除密码）
      const userInfo = user.toJSON();
      delete (userInfo as any).password;

      // 查询用户权限列表（供前端做路由/菜单过滤）
      const permissions = await rbacService.getUserPermissions(user.id);

      success(res, {
        user: userInfo,
        permissions,
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1小时，单位秒
      }, '登录成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /auth/refresh:
   *   post:
   *     summary: 刷新AccessToken
   *     tags: [认证]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [refreshToken]
   *             properties:
   *               refreshToken: { type: string }
   *     responses:
   *       200:
   *         description: 刷新成功
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        error(res, '缺少refreshToken', 400, 400);
        return;
      }

      // 验证 refreshToken
      const payload = verifyRefreshToken(refreshToken);

      // 查找用户确认存在
      const user = await userService.findById(payload.userId);
      if (!user) {
        error(res, '用户不存在', 401, 401);
        return;
      }

      // 生成新的双令牌（轮换机制）
      const newPayload = { userId: user.id, username: user.username };
      const newAccessToken = generateAccessToken(newPayload);
      const newRefreshToken = generateRefreshToken(newPayload);

      success(res, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600,
      }, '刷新成功');
    } catch (err) {
      error(res, 'Token无效或已过期', 401, 401);
    }
  }

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: 用户登出
   *     tags: [认证]
   *     responses:
   *       200:
   *         description: 登出成功
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // v2 版本：客户端删除Token即可
      // v4 版本将引入 Redis Token 黑名单
      success(res, null, '登出成功');
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
