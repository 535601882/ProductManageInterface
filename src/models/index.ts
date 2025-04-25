import { sequelize } from '../config/database';
import { User } from './user.model';
import { Role } from './role.model';
import { Permission } from './permission.model';
import { UserRole } from './user-role.model';
import { RolePermission } from './role-permission.model';
import { Category } from './category.model';
import { Product } from './product.model';
import { Order } from './order.model';
import { OrderItem } from './order-item.model';

// 注册所有模型
sequelize.addModels([User, Role, Permission, UserRole, RolePermission, Category, Product, Order, OrderItem]);

// 建立模型关联
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { as: 'product', foreignKey: 'productId' });

export {
  sequelize,
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Category,
  Product,
  Order,
  OrderItem,
};
