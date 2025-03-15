import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  HasMany,
} from 'sequelize-typescript';
import { Product } from './product.model';

@Table({
  tableName: 'categories',
  comment: '商品分类表',
})
export class Category extends Model<Category> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  name!: string;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: '父分类ID，0为顶级分类',
  })
  parentId!: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: '排序',
  })
  sort!: number;

  @HasMany(() => Product)
  products!: Product[];
}
