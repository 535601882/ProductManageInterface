import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { success, error } from '../utils/response';
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
   *               username:
   *                 type: string
   *                 description: 用户名
   *               password:
   *                 type: string
   *                 description: 密码
   *               email:
   *                 type: string
   *                 description: 邮箱
   *               phone:
   *                 type: string
   *                 description: 手机号
   *     responses:
   *       200:
   *         description: 注册成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.create(req.body);
      success(res, user, '注册成功', 201);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
