import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { success, error, paginate } from '../utils/response';
import Joi from 'joi';

// 更新用户校验规则
export const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(50).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
    'string.pattern.base': '手机号格式不正确',
  }),
  status: Joi.number().valid(0, 1).optional(),
  avatar: Joi.string().uri().optional(),
});

export class UserController {
  /**
   * @swagger
   * /users:
   *   get:
   *     summary: 用户列表
   *     tags: [用户]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           default: 10
   *     responses:
   *       200:
   *         description: 查询成功
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const { rows, count } = await userService.findAll(page, pageSize);
      paginate(res, rows, { page, pageSize, total: count });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: 用户详情
   *     tags: [用户]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 查询成功
   */
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.findById(id);
      if (!user) {
        error(res, '用户不存在', 404, 404);
        return;
      }
      success(res, user);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     summary: 更新用户
   *     tags: [用户]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username: { type: string }
   *               email: { type: string }
   *               phone: { type: string }
   *               status: { type: integer }
   *               avatar: { type: string }
   *     responses:
   *       200:
   *         description: 更新成功
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.update(id, req.body);
      success(res, user, '更新成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     summary: 删除用户
   *     tags: [用户]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 删除成功
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await userService.delete(id);
      success(res, null, '删除成功');
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
