import { Product, Category } from '../models';
import { AppError } from '../middlewares/error-handler';

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: number;
  images?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: number;
  status?: number;
  images?: string;
}

export class ProductService {
  /**
   * 创建商品
   */
  async create(data: CreateProductInput): Promise<Product> {
    const product = await Product.create(data as any);
    return product;
  }

  /**
   * 根据ID查询商品
   */
  async findById(id: number): Promise<Product | null> {
    return Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });
  }

  /**
   * 商品列表（分页 + 筛选）
   */
  async findAll(
    page = 1,
    pageSize = 10,
    filters: { categoryId?: number; keyword?: string; status?: number } = {}
  ): Promise<{ rows: Product[]; count: number }> {
    const offset = (page - 1) * pageSize;
    const where: any = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.status !== undefined) {
      where.status = filters.status;
    }
    if (filters.keyword) {
      where.name = { $like: `%${filters.keyword}%` };
    }

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      limit: pageSize,
      offset,
      order: [['created_at', 'DESC']],
    });

    return { rows, count };
  }

  /**
   * 更新商品
   */
  async update(id: number, data: UpdateProductInput): Promise<Product | null> {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('商品不存在', 404, 404);
    }

    await product.update(data);
    return product;
  }

  /**
   * 删除商品
   */
  async delete(id: number): Promise<void> {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('商品不存在', 404, 404);
    }
    await product.destroy();
  }
}

export const productService = new ProductService();
