import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Role } from './role.model';

@Table({
  tableName: 'user_roles',
  comment: '用户角色关联表',
  timestamps: false, // 关联表不需要 createdAt/updatedAt
})
export class UserRole extends Model<UserRole> {
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  @ForeignKey(() => Role)
  @Column(DataType.INTEGER)
  roleId!: number;
}
