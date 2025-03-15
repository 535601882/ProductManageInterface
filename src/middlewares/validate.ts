import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { error } from '../utils/response';

/**
 * 请求参数校验中间件工厂函数
 * @param schema Joi 校验模式
 * @param property 校验的属性: 'body' | 'query' | 'params'
 */
export function validate(
  schema: Joi.ObjectSchema,
  property: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error: validationError } = schema.validate(req[property], {
      abortEarly: false, // 返回所有错误，不只是第一个
      stripUnknown: true, // 移除未定义的属性
    });

    if (validationError) {
      const messages = validationError.details.map((detail) => detail.message).join('; ');
      error(res, `参数校验失败: ${messages}`, 400, 400);
      return;
    }

    next();
  };
}
