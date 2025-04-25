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
  Version,
} from 'sequelize-typescript';
import { Category } from './category.model';

@Table({
  tableName: 'products',
  comment: '商品表',
})
export class Product extends Model<Product> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description!: string;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: '商品价格',
  })
  price!: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: '库存数量',
  })
  stock!: number;

  @ForeignKey(() => Category)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  categoryId!: number;

  @BelongsTo(() => Category)
  category!: Category;

  @AllowNull(false)
  @Default(1)
  @Column({
    type: DataType.TINYINT,
    comment: '状态: 0-下架 1-上架',
  })
  status!: number;

  @AllowNull(true)
  @Column(DataType.STRING(500))
  images!: string;

  @Version
  @Column(DataType.INTEGER)
  version!: number;
}
