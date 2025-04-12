import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  Default,
  BelongsToMany,
} from 'sequelize-typescript';
import { Role } from './role.model';
import { UserRole } from './user-role.model';

@Table({
  tableName: 'users',
  comment: '用户表',
})
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(50))
  username!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  password!: string;

  @AllowNull(true)
  @Unique
  @Column(DataType.STRING(100))
  email!: string;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  phone!: string;

  @AllowNull(false)
  @Default(1)
  @Column({
    type: DataType.TINYINT,
    comment: '状态: 0-禁用 1-启用',
  })
  status!: number;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  avatar!: string;

  @BelongsToMany(() => Role, () => UserRole)
  roles!: Role[];
}
