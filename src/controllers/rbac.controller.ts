import { Request, Response, NextFunction } from 'express';
import { rbacService } from '../services/rbac.service';
import { success, error } from '../utils/response';
import Joi from 'joi';

// 创建角色校验
export const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(255).optional(),
});

// 创建权限校验
export const createPermissionSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  resource: Joi.string().min(2).max(50).required(),
  action: Joi.string().valid('create', 'read', 'update', 'delete').required(),
  description: Joi.string().max(255).optional(),
});

// 分配权限校验
export const assignPermissionsSchema = Joi.object({
  permissionIds: Joi.array().items(Joi.number().integer()).min(1).required(),
});

// 分配角色校验
export const assignRolesSchema = Joi.object({
  roleIds: Joi.array().items(Joi.number().integer()).min(1).required(),
});

export class RbacController {
  // ==================== 角色管理 ====================

  async createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await rbacService.createRole(req.body);
      success(res, role, '角色创建成功', 201);
    } catch (err) {
      next(err);
    }
  }

  async findAllRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await rbacService.findAllRoles();
      success(res, roles);
    } catch (err) {
      next(err);
    }
  }

  async findRoleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const role = await rbacService.findRoleById(id);
      if (!role) {
        error(res, '角色不存在', 404, 404);
        return;
      }
      success(res, role);
    } catch (err) {
      next(err);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const role = await rbacService.updateRole(id, req.body);
      success(res, role, '角色更新成功');
    } catch (err) {
      next(err);
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await rbacService.deleteRole(id);
      success(res, null, '角色删除成功');
    } catch (err) {
      next(err);
    }
  }

  // ==================== 权限管理 ====================

  async createPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permission = await rbacService.createPermission(req.body);
      success(res, permission, '权限创建成功', 201);
    } catch (err) {
      next(err);
    }
  }

  async findAllPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permissions = await rbacService.findAllPermissions();
      success(res, permissions);
    } catch (err) {
      next(err);
    }
  }

  // ==================== 角色-权限分配 ====================

  async assignPermissionsToRole(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const roleId = parseInt(req.params.id);
      const { permissionIds } = req.body;
      await rbacService.assignPermissionsToRole(roleId, permissionIds);
      success(res, null, '权限分配成功');
    } catch (err) {
      next(err);
    }
  }

  // ==================== 用户-角色分配 ====================

  async assignRolesToUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const { roleIds } = req.body;
      await rbacService.assignRolesToUser(userId, roleIds);
      success(res, null, '角色分配成功');
    } catch (err) {
      next(err);
    }
  }
}

export const rbacController = new RbacController();
