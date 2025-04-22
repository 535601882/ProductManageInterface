import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { cacheService } from '../services/cache.service';
import { success, error, paginate } from '../utils/response';
import Joi from 'joi';

// 创建商品校验规则
export const createProductSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'any.required': '商品名称不能为空',
  }),
  description: Joi.string().max(500).optional(),
  price: Joi.number().min(0).required().messages({
    'number.min': '价格不能为负数',
    'any.required': '价格不能为空',
  }),
  stock: Joi.number().integer().min(0).default(0),
  categoryId: Joi.number().integer().optional(),
  images: Joi.string().optional(),
});

// 更新商品校验规则
export const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  categoryId: Joi.number().integer().optional(),
  status: Joi.number().valid(0, 1).optional(),
  images: Joi.string().optional(),
});

export class ProductController {
  /**
   * @swagger
   * /products:
   *   post:
   *     summary: 创建商品
   *     tags: [商品]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, price]
   *             properties:
   *               name: { type: string, description: '商品名称' }
   *               description: { type: string, description: '商品描述' }
   *               price: { type: number, description: '商品价格' }
   *               stock: { type: integer, description: '库存数量' }
   *               categoryId: { type: integer, description: '分类ID' }
   *               images: { type: string, description: '商品图片URL' }
   *     responses:
   *       201:
   *         description: 创建成功
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.create(req.body);
      // 写操作清除列表缓存
      await cacheService.delPattern('product:list:*');
      success(res, product, '创建成功', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /products:
   *   get:
   *     summary: 商品列表
   *     tags: [商品]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: pageSize
   *         schema: { type: integer, default: 10 }
   *       - in: query
   *         name: categoryId
   *         schema: { type: integer }
   *       - in: query
   *         name: keyword
   *         schema: { type: string }
   *       - in: query
   *         name: status
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: 查询成功
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const keyword = req.query.keyword as string | undefined;
      const status = req.query.status !== undefined ? parseInt(req.query.status as string) : undefined;

      const cacheKey = `product:list:${page}:${pageSize}:${categoryId || ''}:${keyword || ''}:${status || ''}`;

      const cached = await cacheService.getOrSet(
        cacheKey,
        async () => {
          const { rows, count } = await productService.findAll(page, pageSize, {
            categoryId,
            keyword,
            status,
          });
          return {
            list: rows,
            pagination: {
              page,
              pageSize,
              total: count,
              totalPages: Math.ceil(count / pageSize),
            },
          };
        },
        300 // 列表缓存 5 分钟
      );

      success(res, cached);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /products/{id}:
   *   get:
   *     summary: 商品详情
   *     tags: [商品]
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
      const cacheKey = `product:detail:${id}`;

      const product = await cacheService.getOrSet(
        cacheKey,
        async () => {
          const p = await productService.findById(id);
          return p ? p.toJSON() : null;
        },
        600, // 详情缓存 10 分钟
        { cacheNull: true } // 防止缓存穿透
      );

      if (!product) {
        error(res, '商品不存在', 404, 404);
        return;
      }
      success(res, product);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /products/{id}:
   *   put:
   *     summary: 更新商品
   *     tags: [商品]
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
   *               description: { type: string }
   *               price: { type: number }
   *               stock: { type: integer }
   *               categoryId: { type: integer }
   *               status: { type: integer }
   *               images: { type: string }
   *     responses:
   *       200:
   *         description: 更新成功
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const product = await productService.update(id, req.body);
      // 写操作清除相关缓存
      await cacheService.del(`product:detail:${id}`);
      await cacheService.delPattern('product:list:*');
      success(res, product, '更新成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /products/{id}:
   *   delete:
   *     summary: 删除商品
   *     tags: [商品]
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
      await productService.delete(id);
      // 写操作清除相关缓存
      await cacheService.del(`product:detail:${id}`);
      await cacheService.delPattern('product:list:*');
      success(res, null, '删除成功');
    } catch (err) {
      next(err);
    }
  }
}

export const productController = new ProductController();
