import { Request, Response, NextFunction } from 'express';
import { rbacService } from '../services/rbac.service';
import { success, error } from '../utils/response';
import Joi from 'joi';

// 创建角色校验
export const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(255).optional(),
  permissionIds: Joi.array().items(Joi.number().integer()).optional(),
});

// 更新角色校验
export const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(255).optional(),
  permissionIds: Joi.array().items(Joi.number().integer()).optional(),
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

  /**
   * @swagger
   * /rbac/roles:
   *   post:
   *     summary: 创建角色
   *     tags: [权限管理]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name: { type: string, description: '角色名称' }
   *               description: { type: string, description: '角色描述' }
   *               permissionIds: { type: array, items: { type: integer }, description: '权限ID数组，可选' }
   *     responses:
   *       201:
   *         description: 角色创建成功
   */
  async createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await rbacService.createRole(req.body);
      success(res, role, '角色创建成功', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /rbac/roles:
   *   get:
   *     summary: 角色列表
   *     tags: [权限管理]
   *     responses:
   *       200:
   *         description: 查询成功
   */
  async findAllRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await rbacService.findAllRoles();
      success(res, roles);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /rbac/roles/{id}:
   *   get:
   *     summary: 角色详情
   *     tags: [权限管理]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: 查询成功
   */
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

  /**
   * @swagger
   * /rbac/roles/{id}:
   *   put:
   *     summary: 更新角色
   *     tags: [权限管理]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               description: { type: string }
   *               permissionIds: { type: array, items: { type: integer }, description: '权限ID数组，传则全量覆盖' }
   *     responses:
   *       200:
   *         description: 更新成功
   */
  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const role = await rbacService.updateRole(id, req.body);
      success(res, role, '角色更新成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /rbac/roles/{id}:
   *   delete:
   *     summary: 删除角色
   *     tags: [权限管理]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: 删除成功
   */
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

  /**
   * @swagger
   * /rbac/permissions:
   *   post:
   *     summary: 创建权限
   *     tags: [权限管理]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, resource, action]
   *             properties:
   *               name: { type: string, description: '权限名称' }
   *               resource: { type: string, description: '资源名，如product、user' }
   *               action: { type: string, description: '操作类型：create/read/update/delete' }
   *               description: { type: string, description: '权限描述' }
   *     responses:
   *       201:
   *         description: 权限创建成功
   */
  async createPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permission = await rbacService.createPermission(req.body);
      success(res, permission, '权限创建成功', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /rbac/permissions:
   *   get:
   *     summary: 权限列表
   *     tags: [权限管理]
   *     responses:
   *       200:
   *         description: 查询成功
   */
  async findAllPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permissions = await rbacService.findAllPermissions();
      success(res, permissions);
    } catch (err) {
      next(err);
    }
  }

  // ==================== 角色-权限分配 ====================

  /**
   * @swagger
   * /rbac/roles/{id}/permissions:
   *   post:
   *     summary: 为角色分配权限
   *     tags: [权限管理]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *         description: 角色ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [permissionIds]
   *             properties:
   *               permissionIds: { type: array, items: { type: integer }, description: '权限ID数组' }
   *     responses:
   *       200:
   *         description: 分配成功
   */
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

  /**
   * @swagger
   * /rbac/users/{id}/roles:
   *   post:
   *     summary: 为用户分配角色
   *     tags: [权限管理]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *         description: 用户ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [roleIds]
   *             properties:
   *               roleIds: { type: array, items: { type: integer }, description: '角色ID数组' }
   *     responses:
   *       200:
   *         description: 分配成功
   */
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
