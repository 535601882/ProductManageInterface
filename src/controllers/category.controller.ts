import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { cacheService } from '../services/cache.service';
import { success, error } from '../utils/response';
import Joi from 'joi';

// 创建分类校验规则
export const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).required().messages({
    'any.required': '分类名称不能为空',
  }),
  parentId: Joi.number().integer().min(0).default(0),
  sort: Joi.number().integer().default(0),
});

// 更新分类校验规则
export const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).optional(),
  parentId: Joi.number().integer().min(0).optional(),
  sort: Joi.number().integer().optional(),
});

export class CategoryController {
  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: 创建分类
   *     tags: [分类]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name: { type: string, description: '分类名称' }
   *               parentId: { type: integer, description: '父分类ID', default: 0 }
   *               sort: { type: integer, description: '排序', default: 0 }
   *     responses:
   *       201:
   *         description: 创建成功
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.create(req.body);
      await cacheService.delPattern('category:*');
      success(res, category, '创建成功', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: 分类列表
   *     tags: [分类]
   *     responses:
   *       200:
   *         description: 查询成功
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await cacheService.getOrSet(
        'category:list',
        async () => categoryService.findAll(),
        600 // 分类列表缓存 10 分钟
      );
      success(res, categories);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: 分类详情
   *     tags: [分类]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: 查询成功
   */
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const cacheKey = `category:detail:${id}`;

      const category = await cacheService.getOrSet(
        cacheKey,
        async () => {
          const c = await categoryService.findById(id);
          return c ? c.toJSON() : null;
        },
        600,
        { cacheNull: true }
      );

      if (!category) {
        error(res, '分类不存在', 404, 404);
        return;
      }
      success(res, category);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /categories/{id}:
   *   put:
   *     summary: 更新分类
   *     tags: [分类]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               parentId: { type: integer }
   *               sort: { type: integer }
   *     responses:
   *       200:
   *         description: 更新成功
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const category = await categoryService.update(id, req.body);
      await cacheService.del(`category:detail:${id}`);
      await cacheService.del('category:list');
      success(res, category, '更新成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /categories/{id}:
   *   delete:
   *     summary: 删除分类
   *     tags: [分类]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: 删除成功
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await categoryService.delete(id);
      await cacheService.del(`category:detail:${id}`);
      await cacheService.del('category:list');
      success(res, null, '删除成功');
    } catch (err) {
      next(err);
    }
  }
}

export const categoryController = new CategoryController();
