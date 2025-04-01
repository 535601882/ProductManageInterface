import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  BelongsToMany,
} from 'sequelize-typescript';
import { Role } from './role.model';
import { RolePermission } from './role-permission.model';

@Table({
  tableName: 'permissions',
  comment: '权限表',
})
export class Permission extends Model<Permission> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  name!: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  resource!: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  action!: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  description!: string;

  @BelongsToMany(() => Role, () => RolePermission)
  roles!: Role[];
}
