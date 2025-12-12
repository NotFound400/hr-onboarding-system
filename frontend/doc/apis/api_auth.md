# API Handoff Checklist - Auth Service Response

---

## 1️⃣ Authentication APIs

### 1.1 用户登录 (Login)

**前端调用位置:** `src/services/api/userApi.ts` - `login()`

**状态:** ✅ 已完成 (已更新 - Fix #3)

#### 前端期望

- **Endpoint:** `POST /auth/login`
- **Request:**

```json
{
  "username": "admin",
  "password": "admin1"
}
```

#### 后端实际

**Endpoint:** `POST /api/auth/login`

**Request Body Example:**

```json
{
  "usernameOrEmail": "hr_admin",
  "password": "password123"
}
```

> ⚠️ 注意: 字段名是 `usernameOrEmail`，但后端也支持 `username` 字段名

**🆕 Response Example (200 OK - Fix #3 更新):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuZXd1c2VyIiwidXNlcklkIjo4LCJyb2xlcyI6WyJFbXBsb3llZSJdLCJpYXQiOjE3NjU0NzA2ODgsImV4cCI6MTc2NTU1NzA4OCwiaG91c2VJZCI6MSwiZW1wbG95ZWVJZCI6IjY5M2FkYzllYTk1N2Q1YWZjNWJkMmRiNiJ9.xxxxx",
    "tokenType": "Bearer",
    "expiresAt": "2025-12-12T16:31:28.743099700Z",
    "user": {
      "id": 8,
      "username": "newuser",
      "email": "newuser@test.com",
      "active": true,
      "createDate": "2025-12-11T07:00:46",
      "lastModificationDate": "2025-12-11T07:00:46",
      "password": "",
      "roles": ["Employee"]
    },
    "role": "Employee",
    "roles": ["Employee"],
    "houseId": 1,
    "employeeId": "693adc9ea957d5afc5bd2db6"
  }
}
```

> 🆕 **Fix #3 更新**: Response 现在包含 `houseId` 和 `employeeId` 字段

**Response Example (HR User - houseId 为 null):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresAt": "2025-12-12T16:33:49.339991400Z",
    "user": {
      "id": 1,
      "username": "hr_admin",
      "email": "hr@example.com",
      "active": true,
      "roles": ["Employee", "HR"]
    },
    "role": "Employee",
    "roles": ["Employee", "HR"],
    "houseId": null,
    "employeeId": null
  }
}
```

> ℹ️ HR 用户可能没有 Employee 记录，所以 `houseId` 和 `employeeId` 可能为 `null`

**Response Example (400 Bad Request - Invalid Credentials):**

```json
{
  "success": false,
  "message": "Invalid username/email or password",
  "data": null
}
```

**差异说明:**

- [x] 有差异，具体说明：
  1. **Path**: 后端路径有 `/api` 前缀 → `POST /api/auth/login`
  2. **Request**: 字段名是 `usernameOrEmail`（但 `username` 也可以用）
  3. **Response**: 响应被包装在 `{success, message, data}` 结构中
  4. **Response**: 🆕 新增 `houseId` 字段（员工分配的房屋 ID）
  5. **Response**: 🆕 新增 `employeeId` 字段（MongoDB ObjectId）
  6. **Response**: 额外返回了 `tokenType`, `expiresAt`, `roles` 数组

**🆕 JWT Token Claims (Fix #3 更新):**

```json
{
  "sub": "newuser",
  "userId": 8,
  "roles": ["Employee"],
  "iat": 1765470688,
  "exp": 1765557088,
  "houseId": 1,
  "employeeId": "693adc9ea957d5afc5bd2db6"
}
```

> 🆕 **Fix #3 更新**: JWT Token 现在包含 `houseId` 和 `employeeId` claims

**前端适配方式:**

```typescript
// 提取实际数据
const response = await axiosClient.post("/auth/login", {
  usernameOrEmail: username,
  password,
});
const loginData = response.data.data; // 注意要取 .data.data
const token = loginData.token;
const user = loginData.user;
const houseId = loginData.houseId; // 🆕 获取分配的房屋ID
const employeeId = loginData.employeeId; // 🆕 获取Employee MongoDB ID

// 可以存储在 localStorage 或 state 中供后续使用
localStorage.setItem("houseId", houseId?.toString() || "");
```

---

### 1.2 用户注册 (Register)

**前端调用位置:** `src/services/api/userApi.ts` - `registerUser()`

**状态:** ✅ 已完成 (已更新 - Fix #2)

#### 前端期望

- **Endpoint:** `POST /auth/register`
- **Request:**

```json
{
  "token": "mock-token-abc123",
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "Password123"
}
```

#### 后端实际

**Endpoint:** `POST /api/auth/register`

**Request Body Example:**

```json
{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "new_employee",
  "email": "newemployee@example.com",
  "password": "password123"
}
```

> ✅ 后端同时支持 `token` 和 `registrationToken` 字段名

**Response Example (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 2,
    "username": "new_employee",
    "email": "newemployee@example.com",
    "roles": ["Employee"]
  }
}
```

**Response Example (400 Bad Request - Invalid Token):**

```json
{
  "success": false,
  "message": "Invalid registration token or email",
  "data": null
}
```

**Response Example (400 Bad Request - Email Exists):**

```json
{
  "success": false,
  "message": "Email is already registered",
  "data": null
}
```

**差异说明:**

- [x] 有差异：
  1. **Path**: 后端路径有 `/api` 前缀
  2. **Response**: 响应被包装在 `{success, message, data}` 结构中
  3. **Response**: 没有 `createDate` 和 `lastModificationDate` 字段

**🆕 Fix #2 行为更新:**

> 注册成功后，后端会自动在 Employee Service (MongoDB) 中创建 Employee 记录，包含:
>
> - `userID`: 关联到 Auth Service 的 User ID
> - `email`: 用户邮箱
> - `houseID`: 从注册 Token 中获取的房屋分配
>
> 前端无需额外调用，Employee 记录会自动创建。

**前端适配方式:**

```typescript
const response = await axiosClient.post("/auth/register", {
  token,
  username,
  email,
  password,
});
const userData = response.data.data;
```

---

### 1.3 验证注册 Token (Validate Token)

**前端调用位置:** `src/services/api/userApi.ts` - `validateToken()`

**状态:** ✅ 已完成 (已更新 - Fix #1)

#### 前端期望

- **Endpoint:** `GET /auth/validate-token/{token}`
- **Response (Valid Token):**

```json
{
  "valid": true,
  "email": "newuser@example.com"
}
```

#### 后端实际

**Endpoint:** `GET /api/auth/validate-token/{token}`

**Response Example (Valid Token - 200 OK):**

```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "id": 1,
    "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "newemployee@example.com",
    "expirationDate": "2025-12-10T18:00:00",
    "houseId": 1
  }
}
```

> 🆕 **Fix #1 更新**: Response 现在包含 `houseId` 字段

**Response Example (Invalid Token - 400 Bad Request):**

```json
{
  "success": false,
  "message": "Invalid registration token",
  "data": null
}
```

**Response Example (Expired Token - 400 Bad Request):**

```json
{
  "success": false,
  "message": "Registration token has expired",
  "data": null
}
```

**差异说明:**

- [x] 有差异：
  1. **Path**: 后端路径有 `/api` 前缀
  2. **Response**: 用 `success` 代替 `valid`
  3. **Response**: 响应被包装在 `{success, message, data}` 结构中
  4. **Response**: 额外返回了 `id`, `token`, `expirationDate`, `houseId`

**前端适配方式:**

```typescript
const response = await axiosClient.get(`/auth/validate-token/${token}`);
const isValid = response.data.success; // 用 success 代替 valid
const email = response.data.data?.email || "";
const houseId = response.data.data?.houseId; // 🆕 可选：获取分配的房屋ID
```

---

### 1.4 生成注册 Token (Generate Token)

**前端调用位置:** `src/services/api/userApi.ts` - `generateRegistrationToken()`

**状态:** ✅ 已完成 (已更新 - Fix #1)

#### 前端期望

- **Endpoint:** `POST /auth/registration-token`
- **Request:**

```json
{
  "email": "newemployee@example.com",
  "name": "John Smith"
}
```

#### 后端实际

**Endpoint:** `POST /api/auth/registration-token`

**Headers Required:**

```
Authorization: Bearer <hr-jwt-token>
```

**🆕 Request Body Example (Fix #1 - houseId 必填):**

```json
{
  "email": "newemployee@example.com",
  "houseId": 1
}
```

> ⚠️ **重要更新 (Fix #1):**
>
> - `houseId` 字段现在是**必填**的
> - 后端不支持 `name` 字段，请前端移除此字段
> - HR 必须选择一个房屋分配给新员工

**🆕 Response Example (200 OK - Fix #1):**

```json
{
  "success": true,
  "message": "Registration token generated",
  "data": {
    "id": 1,
    "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "newemployee@example.com",
    "expirationDate": "2025-12-10T18:00:00",
    "createdByUserId": "1",
    "houseId": 1,
    "houseAddress": "123 Main St, Apt 1"
  }
}
```

> 🆕 **Fix #1 更新**: Response 现在包含 `houseId` 和 `houseAddress` 字段

**Response Example (400 Bad Request - Missing House ID):**

```json
{
  "success": false,
  "message": "House ID is required - employee must be assigned to a house",
  "data": null
}
```

**Response Example (400 Bad Request - House Full):**

```json
{
  "success": false,
  "message": "House at '123 Main St' is at full capacity (3/3 occupants). Please select a different house.",
  "data": null
}
```

**Response Example (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Authorization required",
  "data": null
}
```

**Response Example (403 Forbidden):**

```json
{
  "success": false,
  "message": "Access denied. HR role required.",
  "data": null
}
```

**差异说明:**

- [x] 有差异：
  1. **Path**: 后端路径有 `/api` 前缀
  2. **Response**: 响应被包装在 `{success, message, data}` 结构中
  3. **Request**: 🆕 需要 `houseId` 字段（必填）
  4. **Request**: 不支持 `name` 字段
  5. **Response**: 🆕 返回 `houseId` 和 `houseAddress`

**前端适配方式:**

```typescript
const response = await axiosClient.post(
  "/auth/registration-token",
  {
    email,
    houseId, // 🆕 必填字段
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
const tokenData = response.data.data;
```

---

## 2️⃣ User Profile APIs

### 2.1 获取当前用户信息 (Get Profile)

**前端调用位置:** `src/services/api/userApi.ts` - `getCurrentUser()`

**状态:** ✅ 已完成

#### 后端实际

**Endpoint:** `GET /api/auth/profile`

**Headers Required:**

```
Authorization: Bearer <jwt-token>
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "username": "hr_admin",
    "email": "hr@company.com",
    "active": true,
    "createDate": "2025-12-07T12:23:12",
    "lastModificationDate": "2025-12-07T12:23:12",
    "roles": ["Employee", "HR"]
  }
}
```

---

## 3️⃣ Housing Service APIs (新增)

### 3.1 获取可用房屋列表 (Get House Summaries)

**前端调用位置:** HR Hiring 页面 - 用于房屋选择下拉框

**状态:** ✅ 已完成

**Endpoint:** `GET /api/housing/houses/summaries`

**Headers Required:**

```
Authorization: Bearer <hr-jwt-token>
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": null,
  "data": [
    {
      "id": 1,
      "address": "123 Main St, Apt 1",
      "maxOccupant": 3,
      "currentOccupant": 1,
      "availableSpots": 2
    },
    {
      "id": 2,
      "address": "456 Oak Ave, Unit 2",
      "maxOccupant": 3,
      "currentOccupant": 3,
      "availableSpots": 0
    },
    {
      "id": 3,
      "address": "789 Pine Rd, Suite 3",
      "maxOccupant": 4,
      "currentOccupant": 0,
      "availableSpots": 4
    }
  ]
}
```

**前端适配方式:**

```typescript
export const getAvailableHouses = async () => {
  const response = await axiosClient.get("/housing/houses/summaries");

  if (response.data.success) {
    // 过滤出有空位的房屋
    return response.data.data.filter((house: any) => house.availableSpots > 0);
  } else {
    throw new Error(response.data.message);
  }
};
```

---

### 3.2 检查房屋可用性 (Check House Availability)

**状态:** ✅ 已完成

**Endpoint:** `GET /api/housing/houses/{houseId}/availability`

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "houseId": 1,
    "address": "123 Main St, Apt 1",
    "maxOccupant": 3,
    "currentOccupants": 1,
    "available": true
  }
}
```

---

### 3.3 🆕 获取房屋详情 (Get House Detail - Fix #3)

**前端调用位置:** Employee Housing 页面

**状态:** ✅ 已完成 (Fix #3 更新)

**Endpoint:** `GET /api/housing/houses/{id}`

**Headers Required:**

```
Authorization: Bearer <jwt-token>
```

> 🆕 **Fix #3 更新**: API Gateway 会自动从 JWT 中提取 `houseId` 并添加 `X-House-Id` header

**Response Example (Employee View - 200 OK):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 1,
    "address": "123 Main St, Apt 1",
    "viewType": "EMPLOYEE_VIEW",
    "roommates": [
      {
        "employeeId": 8,
        "name": "John",
        "phone": "123-456-7890"
      },
      {
        "employeeId": 9,
        "name": "Jane",
        "phone": "234-567-8901"
      }
    ]
  }
}
```

**Response Example (HR View - 200 OK):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 1,
    "address": "123 Main St, Apt 1",
    "viewType": "HR_VIEW",
    "maxOccupant": 3,
    "currentOccupant": 2,
    "landlord": {
      "id": 1,
      "firstName": "Bob",
      "lastName": "Smith",
      "email": "bob@landlord.com",
      "cellPhone": "555-123-4567"
    },
    "facilities": [
      { "type": "Bed", "quantity": 3 },
      { "type": "Mattress", "quantity": 3 },
      { "type": "Table", "quantity": 1 },
      { "type": "Chair", "quantity": 4 }
    ]
  }
}
```

**Response Example (403 Forbidden - Access Denied):**

```json
{
  "success": false,
  "message": "Access to house denied: You can only view the house you are assigned to",
  "data": null
}
```

> ⚠️ **重要**: Employee 只能查看自己分配的房屋。如果请求的 house ID 与 JWT 中的 `houseId` 不匹配，会返回 403 错误。

**前端适配方式:**

```typescript
// Employee 查看自己的房屋
export const getMyHouse = async () => {
  // 从 localStorage 或 login response 获取 houseId
  const houseId = localStorage.getItem("houseId");

  if (!houseId) {
    throw new Error("No house assigned");
  }

  const response = await axiosClient.get(`/housing/houses/${houseId}`);

  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.message);
  }
};
```

---

## 4️⃣ 新增: Employee My House API

### 4.1 获取我的房屋 (Get My House)

**前端调用位置:** Employee Housing 页面

**状态:** ✅ 已完成

**Endpoint:** `GET /api/housing/houses/my-house`

**Headers Required:**

```
Authorization: Bearer <jwt-token>
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 1,
    "address": "123 Main St, Apt 1",
    "roommates": [
      {
        "employeeId": 8,
        "name": "John",
        "phone": "123-456-7890"
      }
    ]
  }
}
```

**Response Example (No House Assigned):**

```json
{
  "success": true,
  "message": "You are not assigned to any house",
  "data": null
}
```

---

## 5️⃣ 数据类型约定

### ID 字段类型

| Service             | Field                       | Type       | 说明                   | 示例                         |
| ------------------- | --------------------------- | ---------- | ---------------------- | ---------------------------- |
| Auth Service        | `User.id`                   | **Number** | SQL Primary Key (Long) | `1`                          |
| Auth Service        | `RegistrationToken.houseId` | **Number** | 🆕 关联到 House.id     | `1`                          |
| Auth Service        | `LoginResponse.houseId`     | **Number** | 🆕 员工分配的房屋 ID   | `1`                          |
| Auth Service        | `LoginResponse.employeeId`  | **String** | 🆕 MongoDB ObjectId    | `"693adc9ea957d5afc5bd2db6"` |
| Employee Service    | `Employee.id`               | **String** | MongoDB ObjectId       | `"507f1f77bcf86cd799439011"` |
| Employee Service    | `Employee.userID`           | **Number** | 关联到 User.id         | `1`                          |
| Employee Service    | `Employee.houseID`          | **Number** | 🆕 关联到 House.id     | `1`                          |
| Application Service | `Application.id`            | **Number** | SQL Primary Key        | `1`                          |
| Application Service | `Application.employeeId`    | **String** | 关联到 Employee.id     | `"507f1f77bcf86cd799439011"` |
| Housing Service     | `House.id`                  | **Number** | SQL Primary Key        | `1`                          |

**后端确认：**

- [x] 已确认，ID 类型与上述约定一致

---

## 6️⃣ 通用响应格式

### 成功响应

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### 错误响应

```json
{
  "success": false,
  "message": "Error message here",
  "data": null
}
```

**后端确认：**

- [x] 使用上述格式（所有 API 都使用此包装格式）

---

## 7️⃣ 认证方式

### JWT Token

**后端确认：**

- [x] 使用 JWT Bearer Token 认证
- **Token 格式要求:** `Authorization: Bearer <token>`
- **Token 过期时间:** 24 小时 (86400000ms)
- **🆕 Token Claims 结构 (Fix #3 更新):**

```json
{
  "sub": "newuser",
  "userId": 8,
  "roles": ["Employee"],
  "houseId": 1,
  "employeeId": "693adc9ea957d5afc5bd2db6",
  "iat": 1765470688,
  "exp": 1765557088
}
```

> 🆕 **Fix #3 更新**:
>
> - JWT 现在包含 `houseId` claim（员工分配的房屋 ID）
> - JWT 现在包含 `employeeId` claim（MongoDB ObjectId）
> - HR 用户的 `houseId` 和 `employeeId` 可能为 null

### 🆕 API Gateway Headers (Fix #3)

API Gateway 会自动从 JWT 中提取信息并添加以下 headers 到下游服务：

| Header          | 描述                   | 示例                                |
| --------------- | ---------------------- | ----------------------------------- |
| `X-User-Id`     | 用户 ID                | `8`                                 |
| `X-Username`    | 用户名                 | `newuser`                           |
| `X-User-Roles`  | 用户角色（逗号分隔）   | `Employee` 或 `Employee,HR`         |
| `X-House-Id`    | 🆕 分配的房屋 ID       | `1` (如果有)                        |
| `X-Employee-Id` | 🆕 MongoDB Employee ID | `693adc9ea957d5afc5bd2db6` (如果有) |

> 前端不需要手动添加这些 headers，API Gateway 会自动处理。

---

## 8️⃣ 联调准备清单

### 后端提供

- [x] **API Base URL（开发环境）:** `http://localhost:8080/api`
- [x] **API Base URL（直连 Auth Service）:** `http://localhost:8081/api`
- [x] **API Base URL（直连 Housing Service）:** `http://localhost:8083/api`
- [x] **API Base URL（直连 Employee Service）:** `http://localhost:8082`
- [x] **Swagger/OpenAPI 文档地址:**
  - Auth Service: `http://localhost:8081/swagger-ui.html`
  - Email Service: `http://localhost:8085/swagger-ui.html`
  - Housing Service: `http://localhost:8083/swagger-ui.html`
- [x] **测试账号:**
  - HR 账号: `username: hr_admin  password: password123`
  - Employee 账号: 需要通过注册流程创建
- [x] **CORS 配置完成:** 允许 `localhost:3000`, `localhost:5173`, `localhost:5174`
- [x] **测试数据已准备:**
  - 3 个房屋 (House ID: 1, 2, 3)
  - 房屋最大容量: 3, 3, 4

### 前端需要配置

- [ ] 更新 `axiosClient.ts` 中的 `baseURL` 为 `http://localhost:8080/api`
- [ ] 关闭 Mock 模式：`isMockMode()` 返回 `false`
- [ ] 适配响应格式：从 `response.data.data` 提取实际数据
- [ ] 🆕 **HR Hiring 页面**: 添加房屋选择下拉框
- [ ] 🆕 **HR Hiring 页面**: 调用 Housing Service 获取可用房屋
- [ ] 🆕 **Login 后存储 houseId**: 从 login response 获取并存储 `houseId`
- [ ] 🆕 **Employee Housing 页面**: 使用存储的 `houseId` 获取房屋详情
- [ ] 测试所有 API 调用

---

## 9️⃣ 前端适配指南

### 9.1 配置 Base URL

```typescript
// src/services/api/axiosClient.ts
const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api", // 通过 API Gateway
  // 或者直连: 'http://localhost:8081/api'  // 直连 Auth Service
  timeout: 10000,
});
```

### 9.2 适配响应格式

所有后端响应都包装在 `{success, message, data}` 结构中：

```typescript
// ❌ 错误方式
const user = response.data;

// ✅ 正确方式
const user = response.data.data;

// ✅ 或者创建拦截器自动处理
axiosClient.interceptors.response.use((response) => {
  // 自动提取 data
  if (response.data && response.data.success !== undefined) {
    return {
      ...response,
      data: response.data.data,
      success: response.data.success,
      message: response.data.message,
    };
  }
  return response;
});
```

### 9.3 处理错误响应

```typescript
try {
  const response = await axiosClient.post("/auth/login", credentials);
  if (response.data.success) {
    const loginData = response.data.data;
    // 处理成功
  } else {
    // 业务错误
    console.error(response.data.message);
  }
} catch (error) {
  // 网络错误或 4xx/5xx
  if (error.response) {
    console.error(error.response.data.message);
  }
}
```

### 9.4 🆕 Login API 适配示例 (Fix #3 更新)

```typescript
// src/services/api/userApi.ts
export const login = async (username: string, password: string) => {
  const response = await axiosClient.post("/auth/login", {
    usernameOrEmail: username, // 后端字段名
    password,
  });

  if (response.data.success) {
    const { token, user, roles, houseId, employeeId } = response.data.data;

    // 存储 token
    localStorage.setItem("token", token);

    // 🆕 存储 houseId 和 employeeId 供后续使用
    if (houseId) {
      localStorage.setItem("houseId", houseId.toString());
    }
    if (employeeId) {
      localStorage.setItem("employeeId", employeeId);
    }

    return { token, user, roles, houseId, employeeId };
  } else {
    throw new Error(response.data.message);
  }
};
```

### 9.5 Validate Token API 适配示例

```typescript
export const validateToken = async (token: string) => {
  const response = await axiosClient.get(`/auth/validate-token/${token}`);

  return {
    valid: response.data.success, // 映射 success -> valid
    email: response.data.data?.email || "",
    houseId: response.data.data?.houseId, // 🆕 获取分配的房屋ID
    message: response.data.message,
  };
};
```

### 9.6 🆕 Generate Registration Token 适配示例 (Fix #1 更新)

```typescript
export const generateRegistrationToken = async (
  email: string,
  houseId: number
) => {
  const response = await axiosClient.post("/auth/registration-token", {
    email,
    houseId, // 🆕 必填字段
  });

  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.message);
  }
};
```

### 9.7 🆕 Get Available Houses 适配示例 (新增)

```typescript
export const getAvailableHouses = async () => {
  const response = await axiosClient.get("/housing/houses/summaries");

  if (response.data.success) {
    // 过滤出有空位的房屋
    return response.data.data.filter((house: any) => house.availableSpots > 0);
  } else {
    throw new Error(response.data.message);
  }
};
```

### 9.8 🆕 Get My House 适配示例 (Fix #3 新增)

```typescript
// 方式1: 使用 /my-house endpoint
export const getMyHouse = async () => {
  const response = await axiosClient.get("/housing/houses/my-house");

  if (response.data.success) {
    return response.data.data;
  } else if (response.data.data === null) {
    // 用户未分配房屋
    return null;
  } else {
    throw new Error(response.data.message);
  }
};

// 方式2: 使用存储的 houseId 直接获取
export const getHouseById = async (houseId: number) => {
  const response = await axiosClient.get(`/housing/houses/${houseId}`);

  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.message);
  }
};

// Employee Housing 页面使用示例
const EmployeeHousingPage = () => {
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHouse = async () => {
      try {
        // 从 localStorage 获取 houseId (login 时存储的)
        const houseId = localStorage.getItem("houseId");

        if (!houseId) {
          setError("You are not assigned to any house");
          return;
        }

        const houseData = await getHouseById(Number(houseId));
        setHouse(houseData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHouse();
  }, []);

  // ... render
};
```

### 9.9 🆕 HR Hiring Form 组件示例 (新增)

```tsx
// HRHiringForm.tsx
import { useState, useEffect } from "react";
import { getAvailableHouses, generateRegistrationToken } from "../services/api";

const HRHiringForm = () => {
  const [email, setEmail] = useState("");
  const [houseId, setHouseId] = useState<number | null>(null);
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 加载可用房屋列表
    const loadHouses = async () => {
      try {
        const availableHouses = await getAvailableHouses();
        setHouses(availableHouses);
      } catch (err) {
        setError("Failed to load houses");
      }
    };
    loadHouses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseId) {
      setError("Please select a house");
      return;
    }

    setLoading(true);
    try {
      const result = await generateRegistrationToken(email, houseId);
      alert(`Token generated! House: ${result.houseAddress}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Assign to House:</label>
        <select
          value={houseId || ""}
          onChange={(e) => setHouseId(Number(e.target.value))}
          required
        >
          <option value="">Select a house...</option>
          {houses.map((house) => (
            <option key={house.id} value={house.id}>
              {house.address} ({house.availableSpots} spots available)
            </option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Generating..." : "Generate Token"}
      </button>
    </form>
  );
};

export default HRHiringForm;
```

---

## 📝 差异总结

| API            | 主要差异                                                 |
| -------------- | -------------------------------------------------------- |
| 所有 API       | Path 有 `/api` 前缀                                      |
| 所有 API       | Response 包装在 `{success, message, data}` 中            |
| Login          | Request 字段是 `usernameOrEmail`（`username` 也支持）    |
| Login          | 🆕 **Response 包含 `houseId` 和 `employeeId`** (Fix #3)  |
| Login          | 🆕 **JWT Token 包含 `houseId` 和 `employeeId`** (Fix #3) |
| Validate Token | 用 `success` 代替 `valid`                                |
| Validate Token | 🆕 Response 包含 `houseId`                               |
| Generate Token | 不支持 `name` 字段                                       |
| Generate Token | 🆕 **`houseId` 现在是必填字段**                          |
| Generate Token | 🆕 Response 包含 `houseId` 和 `houseAddress`             |
| Generate Token | 需要 HR 角色的 JWT Token                                 |
| Register       | 🆕 自动创建 Employee 记录（含 houseID）                  |
| Get House      | 🆕 **Employee 只能查看自己分配的房屋** (Fix #3)          |

---

## 🆕 Fix #1, Fix #2, Fix #3 更新摘要

### Fix #1: 生成 Token 时分配房屋

- **Request 变更**: `houseId` 是必填字段
- **Response 变更**: 返回 `houseId` 和 `houseAddress`
- **验证**: 后端会检查房屋是否有空位，满员会返回错误
- **前端影响**: HR Hiring 页面需要添加房屋选择下拉框

### Fix #2: 注册时创建 Employee 记录

- **行为变更**: 注册成功后自动在 MongoDB 创建 Employee 记录
- **Employee 记录包含**: `userID`, `email`, `houseID`
- **前端影响**: 无需修改，Employee 记录自动创建

### Fix #3: Login 返回 houseId 和 employeeId

- **Login Response 变更**: 返回 `houseId` 和 `employeeId`
- **JWT Token 变更**: Token claims 包含 `houseId` 和 `employeeId`
- **API Gateway 变更**: 自动添加 `X-House-Id` header 到下游服务
- **Housing Service 变更**: 使用 `X-House-Id` header 验证 Employee 访问权限
- **前端影响**:
  - Login 后存储 `houseId` 供后续使用
  - Employee Housing 页面使用存储的 `houseId` 获取房屋详情
  - Employee 只能查看自己分配的房屋，否则返回 403 错误

### 完整用户流程

```
1. HR 生成 Token (带 houseId) → Token 保存到数据库
2. Employee 注册 → User + Employee (带 houseID) 创建
3. Employee 登录 → 返回 token、houseId、employeeId
4. Employee 查看房屋:
   - 前端使用存储的 houseId 调用 /housing/houses/{houseId}
   - API Gateway 从 JWT 提取 houseId，添加 X-House-Id header
   - Housing Service 验证请求的 houseId 与 X-House-Id 匹配
   - 返回房屋详情或 403 错误
```
