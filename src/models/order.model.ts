import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model';
import { OrderItem } from './order-item.model';

@Table({
  tableName: 'orders',
  comment: '订单表',
})
export class Order extends Model<Order> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  userId!: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: '订单总金额',
  })
  totalAmount!: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.TINYINT,
    comment: '状态: 0-待支付 1-已支付 2-已取消',
  })
  status!: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  address!: string;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => OrderItem, { as: 'items', foreignKey: 'orderId' })
  items!: OrderItem[];
}
