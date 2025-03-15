import { User } from '../models';
import { AppError } from '../middlewares/error-handler';

export interface CreateUserInput {
  username: string;
  password: string;
  email?: string;
  phone?: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  phone?: string;
  status?: number;
  avatar?: string;
}

export class UserService {
  /**
   * 创建用户（注册）
   */
  async create(data: CreateUserInput): Promise<User> {
    // v1 版本：明文存储密码（v2 引入 bcrypt）
    const user = await User.create({
      ...data,
      status: 1,
    } as any);

    // 返回时去掉密码字段
    const result = user.toJSON();
    delete (result as any).password;
    return result as User;
  }

  /**
   * 根据ID查询用户
   */
  async findById(id: number): Promise<User | null> {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    return user;
  }

  /**
   * 根据用户名查询用户（包含密码，用于登录）
   */
  async findByUsername(username: string): Promise<User | null> {
    return User.findOne({ where: { username } });
  }

  /**
   * 用户列表（分页）
   */
  async findAll(page = 1, pageSize = 10): Promise<{ rows: User[]; count: number }> {
    const offset = (page - 1) * pageSize;
    const { rows, count } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit: pageSize,
      offset,
      order: [['created_at', 'DESC']],
    });
    return { rows, count };
  }

  /**
   * 更新用户
   */
  async update(id: number, data: UpdateUserInput): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('用户不存在', 404, 404);
    }

    await user.update(data);
    const result = user.toJSON();
    delete (result as any).password;
    return result as User;
  }

  /**
   * 删除用户
   */
  async delete(id: number): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('用户不存在', 404, 404);
    }
    await user.destroy();
  }
}

export const userService = new UserService();
