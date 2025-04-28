import { Product, Order, OrderItem } from '../models';
import { sequelize } from '../config/database';
import { AppError } from '../middlewares/error-handler';
import { OptimisticLockError } from 'sequelize';

export interface OrderItemInput {
  productId: number;
  quantity: number;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  address: string;
}

export class OrderService {
  /**
   * 创建订单（核心事务方法）
   * 流程：查库存 → 扣库存（乐观锁保护）→ 创建订单 → 创建订单商品
   */
  async createOrder(userId: number, input: CreateOrderInput): Promise<Order> {
    const { items, address } = input;

    if (!items || items.length === 0) {
      throw new AppError('订单商品不能为空', 400, 400);
    }

    try {
      const order = await sequelize.transaction(async (t) => {
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
          // 1. 查询商品（事务内）
          const product = await Product.findByPk(item.productId, {
            transaction: t,
            lock: t.LOCK.UPDATE, // 悲观锁辅助，防止同一事务内并发问题
          });

          if (!product) {
            throw new AppError(`商品 ID ${item.productId} 不存在`, 400, 400);
          }

          if (product.stock < item.quantity) {
            throw new AppError(`商品「${product.name}」库存不足，剩余 ${product.stock}`, 400, 400);
          }

          // 2. 扣减库存（乐观锁自动保护）
          product.stock -= item.quantity;
          await product.save({ transaction: t });

          // 3. 累加金额
          const subtotal = Number(product.price) * item.quantity;
          totalAmount += subtotal;

          orderItemsData.push({
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: item.quantity,
            subtotal,
          });
        }

        // 4. 创建订单
        const newOrder = await Order.create(
          {
            userId,
            totalAmount,
            status: 0, // 待支付
            address,
          },
          { transaction: t }
        );

        // 5. 创建订单商品
        await OrderItem.bulkCreate(
          orderItemsData.map((item) => ({
            ...item,
            orderId: newOrder.id,
          })),
          { transaction: t }
        );

        return newOrder;
      });

      // 事务成功后返回完整订单（含 items）
      return this.findById(order.id, userId) as Promise<Order>;
    } catch (err) {
      // 乐观锁冲突时给用户友好的提示
      if (err instanceof OptimisticLockError) {
        throw new AppError('商品信息已被修改，请刷新后重试', 409, 409);
      }
      throw err;
    }
  }

  /**
   * 查询用户订单列表
   */
  async findAll(userId: number, page = 1, pageSize = 10): Promise<{ rows: Order[]; count: number }> {
    const offset = (page - 1) * pageSize;
    return Order.findAndCountAll({
      where: { userId },
      limit: pageSize,
      offset,
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * 查询订单详情（含商品明细）
   */
  async findById(id: number, userId: number): Promise<Order | null> {
    return Order.findOne({
      where: { id, userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });
  }

  /**
   * 支付订单（模拟）
   */
  async payOrder(id: number, userId: number): Promise<Order | null> {
    const order = await Order.findOne({ where: { id, userId } });
    if (!order) {
      throw new AppError('订单不存在', 404, 404);
    }

    if (order.status !== 0) {
      throw new AppError('订单状态不允许支付', 400, 400);
    }

    await order.update({ status: 1 }); // 已支付
    return order;
  }
}

export const orderService = new OrderService();
