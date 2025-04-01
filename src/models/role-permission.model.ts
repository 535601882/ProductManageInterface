import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Role } from './role.model';
import { Permission } from './permission.model';

@Table({
  tableName: 'role_permissions',
  comment: '角色权限关联表',
  timestamps: false,
})
export class RolePermission extends Model<RolePermission> {
  @ForeignKey(() => Role)
  @Column(DataType.INTEGER)
  roleId!: number;

  @ForeignKey(() => Permission)
  @Column(DataType.INTEGER)
  permissionId!: number;
}
