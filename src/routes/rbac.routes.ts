import { Router } from 'express';
import {
  rbacController,
  createRoleSchema,
  createPermissionSchema,
  assignPermissionsSchema,
  assignRolesSchema,
} from '../controllers/rbac.controller';
import { validate } from '../middlewares/validate';

const router = Router();

// 角色管理
router.post('/roles', validate(createRoleSchema, 'body'), rbacController.createRole);
router.get('/roles', rbacController.findAllRoles);
router.get('/roles/:id', rbacController.findRoleById);
router.put('/roles/:id', rbacController.updateRole);
router.delete('/roles/:id', rbacController.deleteRole);

// 为角色分配权限
router.post(
  '/roles/:id/permissions',
  validate(assignPermissionsSchema, 'body'),
  rbacController.assignPermissionsToRole
);

// 权限管理
router.post('/permissions', validate(createPermissionSchema, 'body'), rbacController.createPermission);
router.get('/permissions', rbacController.findAllPermissions);

// 为用户分配角色
router.post(
  '/users/:id/roles',
  validate(assignRolesSchema, 'body'),
  rbacController.assignRolesToUser
);

export default router;
