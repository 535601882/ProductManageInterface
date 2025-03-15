import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';


// 自定义应用错误
export class AppError extends Error {
  public code: number;
  public statusCode: number;

  constructor(message: string, code = 500, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 错误处理
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  res.status(404).json({
    code: 404,
    message: `未找到路由: ${req.method} ${req.originalUrl}`,
    data: null,
    timestamp: Date.now(),
  });
}

// 全局错误处理中间件（必须放在最后）
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 记录错误日志
  logger.error('请求错误:', {
    url: req.originalUrl,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });

  // 如果是自定义应用错误
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      data: null,
      timestamp: Date.now(),
    });
    return;
  }

  // Sequelize 唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    res.status(400).json({
      code: 400,
      message: '数据已存在，请检查唯一字段',
      data: null,
      timestamp: Date.now(),
    });
    return;
  }

  // Sequelize 验证错误
  if (err.name === 'SequelizeValidationError') {
    const messages = (err as any).errors.map((e: any) => e.message).join(', ');
    res.status(400).json({
      code: 400,
      message: `参数校验失败: ${messages}`,
      data: null,
      timestamp: Date.now(),
    });
    return;
  }

  // 其他未知错误
  res.status(500).json({
    code: 500,
    message: env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
    data: null,
    timestamp: Date.now(),
  });
}

import { env } from '../config/env';
