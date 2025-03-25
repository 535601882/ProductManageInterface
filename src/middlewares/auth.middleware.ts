import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { error } from '../utils/response';

// 扩展 Express Request 类型，增加 user 属性
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * JWT 认证中间件
 * 从请求头 Authorization: Bearer <token> 中提取并验证 token
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // 获取 Authorization 头
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      error(res, '未提供认证令牌', 401, 401);
      return;
    }

    // 检查 Bearer 格式
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      error(res, '认证格式错误，应为: Bearer <token>', 401, 401);
      return;
    }

    const token = parts[1];

    // 验证 token
    const payload = verifyAccessToken(token);

    // 将用户信息挂载到请求对象上，供后续使用
    req.user = payload;

    next();
  } catch (err) {
    error(res, 'Token无效或已过期', 401, 401);
  }
}
