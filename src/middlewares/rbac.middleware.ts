import { Request, Response, NextFunction } from 'express';
import { rbacService } from '../services/rbac.service';
import { error } from '../utils/response';

/**
 * 生成权限校验中间件
 * @param requiredPermission 要求的权限标识，格式: resource:action
 *   例如: 'user:create', 'product:delete', 'order:read'
 */
export function requirePermission(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 确保用户已通过JWT认证
      if (!req.user) {
        error(res, '未登录或登录已过期', 401, 401);
        return;
      }

      // 超级管理员直接放行（假设用户ID为1的是admin）
      if (req.user.userId === 1) {
        next();
        return;
      }

      // 检查用户权限
      const hasPermission = await rbacService.checkUserPermission(
        req.user.userId,
        requiredPermission
      );

      if (!hasPermission) {
        error(res, `权限不足，需要: ${requiredPermission}`, 403, 403);
        return;
      }

      next();
    } catch (err) {
      error(res, '权限校验失败', 500, 500);
    }
  };
}

/**
 * 校验多个权限中的任意一个（OR关系）
 */
export function requireAnyPermission(...permissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        error(res, '未登录或登录已过期', 401, 401);
        return;
      }

      if (req.user.userId === 1) {
        next();
        return;
      }

      const userPermissions = await rbacService.getUserPermissions(req.user.userId);
      const hasAny = permissions.some((p) => userPermissions.includes(p));

      if (!hasAny) {
        error(res, `权限不足，需要以下任意权限: ${permissions.join(', ')}`, 403, 403);
        return;
      }

      next();
    } catch (err) {
      error(res, '权限校验失败', 500, 500);
    }
  };
}
