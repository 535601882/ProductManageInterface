// 通用类型定义

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export enum UserStatus {
  DISABLED = 0,
  ACTIVE = 1,
}

export enum ProductStatus {
  OFFLINE = 0,
  ONLINE = 1,
}

export enum OrderStatus {
  PENDING = 0,    // 待支付
  PAID = 1,       // 已支付
  SHIPPED = 2,    // 已发货
  COMPLETED = 3,  // 已完成
  CANCELLED = 4,  // 已取消
}
