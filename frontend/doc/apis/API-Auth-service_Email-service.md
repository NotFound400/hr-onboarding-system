# 后端 API 接口文档 (Auth Service & Email Service)

## 1️⃣ Authentication Service

**Base URL:** `http://localhost:8081` (直连) 或 `http://localhost:8080` (通过 API Gateway)  
**Swagger UI:** `http://localhost:8081/swagger-ui.html`

---

### 1.1 用户登录 (Login)

**状态:** ✅ 已完成

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "usernameOrEmail": "hr_admin",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJocl9hZG1pbiIsInVzZXJJZCI6MSwicm9sZXMiOlsiRW1wbG95ZWUiLCJIUiJdLCJpYXQiOjE3MzM3NTAwMDAsImV4cCI6MTczMzgzNjQwMH0.xxxxx",
    "tokenType": "Bearer",
    "expiresAt": "2025-12-10T15:44:30.000Z",
    "user": {
      "id": 1,
      "username": "hr_admin",
      "email": "hr@company.com",
      "password": "",
      "active": true,
      "createDate": "2025-12-09T10:00:00",
      "lastModificationDate": "2025-12-09T10:00:00",
      "roles": ["Employee", "HR"]
    },
    "role": "Employee",
    "roles": ["Employee", "HR"]
  }
}
```

**Response (400 Bad Request - 密码错误):**

```json
{
  "success": false,
  "message": "Invalid username/email or password",
  "data": null
}
```

**差异说明:**

- [x] 有差异：请求字段是 `usernameOrEmail` 而不是 `username`
- [x] 有差异：响应包含 `success`, `message`, `data` 包装结构

---

### 1.2 用户注册 (Register)

**状态:** ✅ 已完成

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "new_employee",
  "email": "newemployee@example.com",
  "password": "password123"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 2,
    "username": "new_employee",
    "email": "newemployee@example.com",
    "password": "",
    "active": true,
    "createDate": "2025-12-10T10:00:00",
    "lastModificationDate": "2025-12-10T10:00:00",
    "roles": ["Employee"]
  }
}
```

**Response (400 Bad Request - Token 无效):**

```json
{
  "success": false,
  "message": "Invalid registration token or email",
  "data": null
}
```

**Response (400 Bad Request - 邮箱已存在):**

```json
{
  "success": false,
  "message": "Email is already registered",
  "data": null
}
```

**Response (400 Bad Request - 用户名已存在):**

```json
{
  "success": false,
  "message": "Username is already taken",
  "data": null
}
```

**差异说明:**

- [x] 有差异：请求字段 `token` 在后端是 `registrationToken`（但 Swagger UI 显示为 token）

---

### 1.3 验证注册 Token (Validate Token)

**状态:** ✅ 已完成

**Endpoint:** `GET /api/auth/validate-token/{token}`

**Example:** `GET /api/auth/validate-token/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**Response (200 OK - Token 有效):**

```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "id": 1,
    "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "newemployee@example.com",
    "expirationDate": "2025-12-10T18:44:30",
    "createdByUserId": "1",
    "createBy": "1",
    "createDate": "2025-12-10T15:44:30"
  }
}
```

**Response (400 Bad Request - Token 无效):**

```json
{
  "success": false,
  "message": "Invalid registration token",
  "data": null
}
```

**Response (400 Bad Request - Token 过期):**

```json
{
  "success": false,
  "message": "Registration token has expired",
  "data": null
}
```

**差异说明:**

- [x] 有差异：响应结构不同，包含完整 token 信息而不是 `valid: true/false`

---

### 1.4 生成注册 Token (Generate Token) - HR Only

**状态:** ✅ 已完成

**Endpoint:** `POST /api/auth/registration-token`

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "email": "newemployee@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Registration token generated",
  "data": {
    "id": 1,
    "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "newemployee@example.com",
    "expirationDate": "2025-12-10T18:44:30",
    "createdByUserId": "1",
    "createBy": "1",
    "createDate": "2025-12-10T15:44:30"
  }
}
```

**Response (403 Forbidden - 非 HR 角色):**

```json
{
  "success": false,
  "message": "Access denied. HR role required.",
  "data": null
}
```

**差异说明:**

- [x] 有差异：请求只需要 `email`，不需要 `name` 字段

---

### 1.5 获取用户资料 (Get Profile)

**状态:** ✅ 已完成

**Endpoint:** `GET /api/auth/profile`

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "username": "hr_admin",
    "email": "hr@company.com",
    "password": "",
    "active": true,
    "createDate": "2025-12-09T10:00:00",
    "lastModificationDate": "2025-12-09T10:00:00",
    "roles": ["Employee", "HR"]
  }
}
```

**Response (401 Unauthorized - 无 Token):**

```json
{
  "success": false,
  "message": "Authorization required",
  "data": null
}
```

---

### 1.6 用户登出 (Logout)

**状态:** ✅ 已完成

**Endpoint:** `POST /api/auth/logout`

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

## 2️⃣ Email Service

**Base URL:** `http://localhost:8085`  
**Swagger UI:** `http://localhost:8085/swagger-ui.html`

**说明:** Email Service 主要被其他后端服务调用，前端一般不直接调用。

---

### 2.1 发送注册邮件 (Send Registration Email)

**状态:** ✅ 已完成

**Endpoint:** `POST /api/email/registration` (同步) 或 `POST /api/email/async/registration` (异步)

**Request Body:**

```json
{
  "to": "newemployee@example.com",
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "registrationLink": "http://localhost:3000/register?token=a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Registration email sent",
  "data": null
}
```

---

### 2.2 发送申请状态邮件 (Send Application Status Email)

**状态:** ✅ 已完成

**Endpoint:** `POST /api/email/application-status` 或 `POST /api/email/async/application-status`

**Request Body:**

```json
{
  "to": "employee@example.com",
  "employeeName": "John Doe",
  "status": "Approved",
  "comment": "Welcome to the team!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Application status email sent",
  "data": null
}
```

---

### 2.3 发送 OPT 更新邮件 (Send OPT Update Email)

**状态:** ✅ 已完成

**Endpoint:** `POST /api/email/opt-update` 或 `POST /api/email/async/opt-update`

**Request Body:**

```json
{
  "to": "employee@example.com",
  "employeeName": "John Doe",
  "documentType": "I-20",
  "status": "Received",
  "nextStep": "Please upload your OPT STEM Receipt"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "OPT update email sent",
  "data": null
}
```

---

### 2.4 发送设施报告邮件 (Send Facility Report Email)

**状态:** ✅ 已完成

**Endpoint:** `POST /api/email/facility-report` 或 `POST /api/email/async/facility-report`

**Request Body:**

```json
{
  "to": "employee@example.com",
  "employeeName": "John Doe",
  "reportTitle": "Broken AC in Room 101",
  "status": "In Progress"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Facility report email sent",
  "data": null
}
```

---

## 3️⃣ 通用响应格式

### 成功响应

```json
{
  "success": true,
  "message": "success message",
  "data": { ... }
}
```

### 错误响应

```json
{
  "success": false,
  "message": "error description",
  "data": null
}
```

---

## 4️⃣ 认证方式

### JWT Token

| 项目           | 说明                            |
| -------------- | ------------------------------- |
| 认证方式       | JWT Bearer Token                |
| Token 格式     | `Authorization: Bearer <token>` |
| Token 过期时间 | 24 小时 (86400000ms)            |
| Token 存储位置 | `localStorage.getItem('token')` |

### JWT Token 结构

```json
{
  "sub": "username",
  "userId": 1,
  "roles": ["Employee", "HR"],
  "iat": 1733750000,
  "exp": 1733836400
}
```

---

## 5️⃣ ID 类型约定

| 服务         | 字段                   | 类型              | 示例 |
| ------------ | ---------------------- | ----------------- | ---- |
| Auth Service | `User.id`              | **Long (Number)** | `1`  |
| Auth Service | `Role.id`              | **Long (Number)** | `1`  |
| Auth Service | `RegistrationToken.id` | **Long (Number)** | `1`  |

---

## 6️⃣ 联调准备清单

### 后端已完成

- [x] API Base URL（开发环境）：
  - Auth Service: `http://localhost:8081`
  - Email Service: `http://localhost:8085`
  - API Gateway: `http://localhost:8080`
- [x] Swagger/OpenAPI 文档地址：
  - Auth Service: `http://localhost:8081/swagger-ui.html`
  - Email Service: `http://localhost:8085/swagger-ui.html`
- [x] 测试账号：
  - HR 账号：`username: hr_admin, password: password123`
- [x] JWT Token 过期时间：24 小时

### 前端需要配置

- [ ] 更新 API Base URL 为 `http://localhost:8080`（通过 API Gateway）
- [ ] 请求字段调整：
  - 登录：使用 `usernameOrEmail` 而不是 `username`
  - 注册：使用 `token` 字段（后端内部是 `registrationToken`）

---

## 7️⃣ 错误码说明

| HTTP Status | 含义       | 场景                         |
| ----------- | ---------- | ---------------------------- |
| 200         | 成功       | 正常响应                     |
| 201         | 创建成功   | 注册成功                     |
| 400         | 请求错误   | 参数错误、验证失败           |
| 401         | 未授权     | Token 无效或过期             |
| 403         | 禁止访问   | 无权限（如非 HR 生成 Token） |
| 500         | 服务器错误 | 内部错误                     |
