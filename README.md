# 商品管理后台 API

## 这套代码是干嘛的

说白了就是个电商后台的接口服务，从最简单的增删改查开始，一路加料：登录认证、权限控制、Redis 缓存、数据库事务、定时任务、消息队列……一点一点把复杂度堆上去。

## 技术栈

- **框架**：Express.js + TypeScript
- **数据库**：MySQL 8（Sequelize ORM）
- **缓存**：Redis 7（ioredis + Bull 队列）
- **认证**：JWT 双令牌（AccessToken + RefreshToken）
- **校验**：Joi
- **文档**：Swagger UI
- **任务调度**：node-schedule
- **日志**：winston

## 功能一览

| 做了什么 | 关键词 |
|---------|--------|
| 用户、商品、分类的增删改查 | 基础 CRUD |
| 登录注册、JWT 双令牌、Bearer Token 认证 | 登录认证 |
| 角色、权限、用户绑定角色、接口粒度权限校验 | RBAC |
| 商品/分类读接口加 Redis 缓存，防穿透击穿雪崩 | Redis 缓存 |
| 下单事务、库存扣减、乐观锁防并发超卖 | 事务 |
| 超 30 分钟未支付订单自动取消，恢复库存 | 定时任务 |
| 订单创建后走 EventBus 异步发通知、更新统计 | 内存队列 |
| 用 Bull + Redis 做持久化队列，支持失败重试 | MQ 队列 |
| 微服务拆分、服务注册发现、RPC 通信 | 微服务 | 

## 快速跑起来

### 1.  clone 下来装依赖

```bash
git clone <仓库地址>
cd product-manage-api
pnpm install
```

### 2. 起数据库和 Redis（有 Docker 的话一行搞定）

```bash
docker-compose up -d mysql redis
```

没有 Docker 也行，只要本地有 MySQL 和 Redis，改 `.env` 里的连接配置就能跑。

### 3. 改环境变量

复制一份 `.env.example` 成 `.env`，按需改：

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=product_manage
DB_USER=product_user
DB_PASSWORD=product_pass

JWT_SECRET=你随便写个长串
JWT_REFRESH_SECRET=再写个不一样的长串

REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_ENABLED=true
```

### 4. 启动服务

```bash
# 开发模式（热更新）
pnpm dev

# 或者编译后跑
pnpm build
pnpm start
```

服务起来后：
- API 地址：`http://localhost:3000/api`
- Swagger 文档：`http://localhost:3000/api-docs`

## 项目结构

```
src/
├── app.ts                  # 入口，挂载路由、中间件、错误处理
├── config/                 # 配置：数据库、Redis、环境变量、Swagger
├── controllers/            # 控制器：处理 HTTP 请求
├── services/               # 服务层：业务逻辑
├── models/                 # Sequelize 模型 + 关联关系
├── routes/                 # 路由定义
├── middlewares/            # 中间件：认证、权限校验、参数校验、错误处理
├── jobs/                   # 定时任务
├── events/                 # 内存事件总线（EventBus）
├── queues/                 # Bull 队列配置 + Worker
├── utils/                  # 工具：JWT、响应封装、日志
└── types/                  # 类型声明
```

分层比较清晰，controller → service → model，中间件横插一刀做校验和权限，算是比较标准的写法。

## 主要接口

| 模块 | 接口 | 说明 |
|------|------|------|
| 认证 | `POST /auth/register` | 注册 |
| 认证 | `POST /auth/login` | 登录（返回双令牌 + 权限列表） |
| 认证 | `POST /auth/refresh` | 刷新 AccessToken |
| 认证 | `GET /auth/me` | 当前用户信息（含权限） |
| 商品 | `GET /products` | 商品列表（带 Redis 缓存） |
| 商品 | `GET /products/:id` | 商品详情（带 Redis 缓存） |
| 订单 | `POST /orders` | 创建订单（事务 + 乐观锁 + 队列入队） |
| 订单 | `PUT /orders/:id/pay` | 支付订单 |
| 权限 | `POST /rbac/roles` | 创建角色（可同时配权限） |
| 权限 | `POST /rbac/permissions` | 创建权限 |

完整接口去 Swagger 文档里看：`http://localhost:3000/api-docs`

## 几个值得留意的实现

**乐观锁**

商品表加了 `version` 字段（Sequelize 自动维护），下单扣库存时如果版本号对不上会直接抛错，防止两个人同时下单导致超卖。

**缓存策略**

读接口走 `Cache Aside`：先查 Redis，命中直接返回；没命中查库，回填 Redis。写操作后清相关缓存。还做了空值缓存防穿透、互斥锁防击穿、随机过期时间防雪崩。

**无 Redis 降级**

Redis 没起或者连不上的时候，服务照样能跑：
- 缓存逻辑直接跳过，走数据库
- Bull 队列退化成内存 EventBus
- 定时任务的分布式锁跳过，单实例正常执行

**订单超时自动取消**

每 5 分钟扫一次，把超过 30 分钟还没支付的订单自动关掉，库存退回去。多实例部署时靠 Redis 分布式锁保证只有一个实例在执行扫描。

## 常见问题

**Q：启动报数据库连接失败？**

大概率是 MySQL 没起，或者 `.env` 里的账号密码对不上。用 `docker-compose up -d mysql` 一键起，账号密码默认是 `product_user` / `product_pass`。

**Q：Swagger 上看不到某些接口？**

 controller 里的方法前面要加 `@swagger` JSDoc 注释，swagger-jsdoc 是靠这个扫描的。如果接口写了但 Swagger 上没有，检查 controller 里有没有漏写注释。

**Q：Redis 连不上影响功能吗？**

不影响核心功能。没有 Redis 时缓存自动跳过、队列退化成内存模式、定时锁不生效，服务照样能正常响应。



## License

MIT
