import { Response } from 'express';

// 统一响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
  timestamp: number;
}

/**
 * 成功响应
 */
export function success<T>(res: Response, data: T, message = '操作成功', code = 200): void {
  const response: ApiResponse<T> = {
    code,
    message,
    data,
    timestamp: Date.now(),
  };
  res.status(code).json(response);
}

/**
 * 错误响应
 */
export function error(res: Response, message = '操作失败', code = 500, statusCode = 500): void {
  const response: ApiResponse = {
    code,
    message,
    data: null,
    timestamp: Date.now(),
  };
  res.status(statusCode).json(response);
}

/**
 * 分页响应
 */
export function paginate<T>(
  res: Response,
  list: T[],
  pagination: { page: number; pageSize: number; total: number },
  message = '查询成功'
): void {
  const response: ApiResponse = {
    code: 200,
    message,
    data: {
      list,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.pageSize),
      },
    },
    timestamp: Date.now(),
  };
  res.status(200).json(response);
}
