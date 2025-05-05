import { Request, Response, NextFunction } from 'express';
import { orderService, CreateOrderInput } from '../services/order.service';
import { success, error, paginate } from '../utils/response';
import Joi from 'joi';

// 订单商品项校验
const orderItemSchema = Joi.object({
  productId: Joi.number().integer().min(1).required(),
  quantity: Joi.number().integer().min(1).required(),
});

// 创建订单校验
export const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  address: Joi.string().min(5).max(255).required(),
});

export class OrderController {
  /**
   * @swagger
   * /orders:
   *   post:
   *     summary: 创建订单
   *     tags: [订单]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [items, address]
   *             properties:
   *               items:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     productId: { type: integer }
   *                     quantity: { type: integer }
   *               address: { type: string }
   *     responses:
   *       201:
   *         description: 创建成功
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const order = await orderService.createOrder(userId, req.body as CreateOrderInput);
      success(res, order, '订单创建成功', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /orders:
   *   get:
   *     summary: 订单列表
   *     tags: [订单]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: pageSize
   *         schema: { type: integer, default: 10 }
   *     responses:
   *       200:
   *         description: 查询成功
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const { rows, count } = await orderService.findAll(userId, page, pageSize);
      paginate(res, rows, { page, pageSize, total: count });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /orders/{id}:
   *   get:
   *     summary: 订单详情
   *     tags: [订单]
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
      const userId = req.user!.userId;
      const id = parseInt(req.params.id);
      const order = await orderService.findById(id, userId);
      if (!order) {
        error(res, '订单不存在', 404, 404);
        return;
      }
      success(res, order);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /orders/{id}/pay:
   *   put:
   *     summary: 支付订单
   *     tags: [订单]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: 支付成功
   */
  async pay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = parseInt(req.params.id);
      const order = await orderService.payOrder(id, userId);
      success(res, order, '支付成功');
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
