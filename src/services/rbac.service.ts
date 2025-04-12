import { Role, Permission, UserRole, RolePermission, User } from '../models';
import { AppError } from '../middlewares/error-handler';

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissionIds?: number[];
}

export interface CreatePermissionInput {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export class RbacService {
  // ==================== 角色管理 ====================

  async createRole(data: CreateRoleInput): Promise<Role> {
    const { permissionIds, ...roleData } = data;

    const role = await Role.create(roleData as any);

    // 如果有权限列表，一并绑定
    if (permissionIds && permissionIds.length > 0) {
      const records = permissionIds.map((permissionId) => ({
        roleId: role.id,
        permissionId,
      }));
      await RolePermission.bulkCreate(records as any);
    }

    return this.findRoleById(role.id) as Promise<Role>;
  }

  async findAllRoles(): Promise<Role[]> {
    return Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
      ],
    });
  }

  async findRoleById(id: number): Promise<Role | null> {
    return Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
      ],
    });
  }

  async updateRole(id: number, data: Partial<CreateRoleInput>): Promise<Role | null> {
    const { permissionIds, ...roleData } = data;

    const role = await Role.findByPk(id);
    if (!role) throw new AppError('角色不存在', 404, 404);

    // 更新角色字段
    await role.update(roleData);

    // 如果传了权限列表，全量覆盖绑定
    if (permissionIds !== undefined) {
      await RolePermission.destroy({ where: { roleId: id } });
      if (permissionIds.length > 0) {
        const records = permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        }));
        await RolePermission.bulkCreate(records as any);
      }
    }

    return this.findRoleById(id);
  }

  async deleteRole(id: number): Promise<void> {
    const role = await Role.findByPk(id);
    if (!role) throw new AppError('角色不存在', 404, 404);
    await role.destroy();
  }

  // ==================== 权限管理 ====================

  async createPermission(data: CreatePermissionInput): Promise<Permission> {
    return Permission.create(data as any);
  }

  async findAllPermissions(): Promise<Permission[]> {
    return Permission.findAll();
  }

  async findPermissionById(id: number): Promise<Permission | null> {
    return Permission.findByPk(id);
  }

  // ==================== 角色-权限关联 ====================

  async assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<void> {
    const role = await Role.findByPk(roleId);
    if (!role) throw new AppError('角色不存在', 404, 404);

    // 先清除原有权限，再批量添加（全量更新策略）
    await RolePermission.destroy({ where: { roleId } });

    const records = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }));
    await RolePermission.bulkCreate(records as any);
  }

  // ==================== 用户-角色关联 ====================

  async assignRolesToUser(userId: number, roleIds: number[]): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('用户不存在', 404, 404);

    await UserRole.destroy({ where: { userId } });

    const records = roleIds.map((roleId) => ({
      userId,
      roleId,
    }));
    await UserRole.bulkCreate(records as any);
  }

  // ==================== 权限校验 ====================

  /**
   * 获取用户的所有权限标识（resource:action 格式）
   */
  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) return [];

    const permissions = new Set<string>();
    const roles = (user as any).roles || [];

    for (const role of roles) {
      for (const perm of role.permissions || []) {
        permissions.add(`${perm.resource}:${perm.action}`);
      }
    }

    return Array.from(permissions);
  }

  /**
   * 检查用户是否拥有指定权限
   */
  async checkUserPermission(userId: number, requiredPermission: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.includes(requiredPermission);
  }
}

export const rbacService = new RbacService();
