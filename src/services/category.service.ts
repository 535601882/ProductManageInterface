import { Category } from '../models';
import { AppError } from '../middlewares/error-handler';

export interface CreateCategoryInput {
  name: string;
  parentId?: number;
  sort?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  parentId?: number;
  sort?: number;
}

export class CategoryService {
  /**
   * 创建分类
   */
  async create(data: CreateCategoryInput): Promise<Category> {
    const category = await Category.create({
      ...data,
      parentId: data.parentId || 0,
      sort: data.sort || 0,
    } as any);
    return category;
  }

  /**
   * 查询所有分类（树形结构）
   */
  async findAll(): Promise<Category[]> {
    const categories = await Category.findAll({
      order: [
        ['parent_id', 'ASC'],
        ['sort', 'ASC'],
      ],
    });
    return categories;
  }

  /**
   * 根据ID查询分类
   */
  async findById(id: number): Promise<Category | null> {
    return Category.findByPk(id);
  }

  /**
   * 更新分类
   */
  async update(id: number, data: UpdateCategoryInput): Promise<Category | null> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError('分类不存在', 404, 404);
    }
    await category.update(data);
    return category;
  }

  /**
   * 删除分类
   */
  async delete(id: number): Promise<void> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError('分类不存在', 404, 404);
    }
    await category.destroy();
  }
}

export const categoryService = new CategoryService();
