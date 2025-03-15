import { sequelize } from '../config/database';
import { User } from './user.model';
import { Category } from './category.model';
import { Product } from './product.model';

// 注册所有模型
sequelize.addModels([User, Category, Product]);

export { sequelize, User, Category, Product };
