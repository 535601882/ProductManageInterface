import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Order } from './order.model';
import { Product } from './product.model';

@Table({
  tableName: 'order_items',
  comment: '订单商品表',
  timestamps: false, // 关联表不需要 createdAt/updatedAt
})
export class OrderItem extends Model<OrderItem> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Order)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  orderId!: number;

  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  productId!: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  productName!: string;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: '下单时单价（快照）',
  })
  price!: number;

  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  quantity!: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: '小计',
  })
  subtotal!: number;

  @BelongsTo(() => Order)
  order!: Order;

  @BelongsTo(() => Product)
  product!: Product;
}
