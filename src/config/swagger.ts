import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '商品管理后台 API',
      version: '1.0.0',
      description: '基于 Express + TypeScript + MySQL 的商品管理后台接口文档',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: '本地开发服务器',
      },
    ],
    components: {
      schemas: {
        // 通用响应结构
        ApiResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 200 },
            message: { type: 'string', example: '操作成功' },
            data: { type: 'object' },
            timestamp: { type: 'integer', example: 1704067200000 },
          },
        },
        // 分页结构
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            pageSize: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 10 },
          },
        },
        // 用户模型
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'admin' },
            email: { type: 'string', example: 'admin@example.com' },
            status: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // 商品模型
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'iPhone 15 Pro' },
            description: { type: 'string', example: '最新款苹果手机' },
            price: { type: 'number', example: 7999.00 },
            stock: { type: 'integer', example: 100 },
            categoryId: { type: 'integer', example: 1 },
            status: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // 分类模型
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: '电子产品' },
            parentId: { type: 'integer', example: 0 },
            sort: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // 角色模型
        Role: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: '管理员' },
            description: { type: 'string', example: '拥有所有权限' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // 权限模型
        Permission: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: '创建商品' },
            resource: { type: 'string', example: 'product' },
            action: { type: 'string', example: 'create' },
            description: { type: 'string', example: '允许创建新商品' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // 订单模型
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            totalAmount: { type: 'number', example: 1999.0 },
            status: { type: 'integer', example: 0, description: '0-待支付 1-已支付 2-已取消' },
            address: { type: 'string', example: '北京市朝阳区xxx街道' },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // 订单商品模型
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            orderId: { type: 'integer', example: 1 },
            productId: { type: 'integer', example: 1 },
            productName: { type: 'string', example: 'iPhone 15 Pro' },
            price: { type: 'number', example: 7999.0 },
            quantity: { type: 'integer', example: 1 },
            subtotal: { type: 'number', example: 7999.0 },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // 扫描注释生成文档
};

export const swaggerSpec = swaggerJsdoc(options);
