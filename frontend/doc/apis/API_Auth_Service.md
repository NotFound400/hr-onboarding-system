# API Handoff Checklist - Auth Service Response

---

## 1️⃣ Authentication APIs

### 1.1 用户登录 (Login)

**前端调用位置:** `src/services/api/userApi.ts` - `login()`

**状态:** ✅ 已完成

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

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJocl9hZG1pbiIsInVzZXJJZCI6MSwicm9sZXMiOlsiRW1wbG95ZWUiLCJIUiJdLCJpYXQiOjE3MzM4NTYwMDAsImV4cCI6MTczMzk0MjQwMH0.xxxxx",
    "tokenType": "Bearer",
    "expiresAt": "2025-12-11T15:30:00Z",
    "user": {
      "id": 1,
      "username": "hr_admin",
      "email": "hr@company.com",
      "roles": ["Employee", "HR"]
    },
    "role": "Employee",
    "roles": ["Employee", "HR"]
  }
}
```

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
  4. **Response**: `user` 对象没有 `createDate` 和 `lastModificationDate` 字段
  5. **Response**: 额外返回了 `tokenType`, `expiresAt`, `roles` 数组

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

**Response Example (403 Forbidden - Not HR):**

```json
{
  "success": false,
  "message": "Access denied. HR role required.",
  "data": null
}
```

**Response Example (401 Unauthorized - No Token):**

```json
{
  "success": false,
  "message": "Authorization required",
  "data": null
}
```

**差异说明:**

- [x] 有差异：
  1. **Path**: 后端路径有 `/api` 前缀
  2. **Request**: 不支持 `name` 字段（请前端移除）
  3. **🆕 Request**: `houseId` 现在是**必填字段**
  4. **Response**: 响应被包装在 `{success, message, data}` 结构中
  5. **Response**: 字段名是 `createdByUserId` 而不是 `createBy`
  6. **🆕 Response**: 包含 `houseId` 和 `houseAddress` 字段
  7. **Auth**: 需要 HR 角色的 JWT Token

**🆕 前端适配方式 (Fix #1):**

```typescript
// HR 生成注册 Token 时必须选择房屋
const response = await axiosClient.post("/auth/registration-token", {
  email,
  houseId, // 🆕 必填：从房屋选择下拉框获取
});

if (response.data.success) {
  const tokenData = response.data.data;
  console.log(`Token generated for house: ${tokenData.houseAddress}`);
} else {
  // 处理错误（如房屋已满）
  console.error(response.data.message);
}
```

**🆕 前端 UI 建议 (Fix #1):**

HR 在生成注册 Token 的表单中需要:

1. Email 输入框 (必填)
2. **房屋选择下拉框 (必填)** - 需要调用 Housing Service API 获取可用房屋列表

```typescript
// 获取可用房屋列表（调用 Housing Service）
const getAvailableHouses = async () => {
  const response = await axiosClient.get("/housing/houses/available");
  return response.data.data; // 返回有空位的房屋列表
};
```

---

## 2️⃣ Housing Service APIs (🆕 新增)

### 2.1 获取所有房屋摘要 (Get House Summaries)

**前端调用位置:** HR Hiring Management 页面 - 房屋选择下拉框

**状态:** ✅ 已完成

**Endpoint:** `GET /api/housing/houses/summaries`

**Headers Required:**

```
Authorization: Bearer <jwt-token>
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": "House summaries retrieved",
  "data": [
    {
      "id": 1,
      "address": "123 Main St, Apt 1",
      "maxOccupant": 4,
      "currentOccupants": 2,
      "availableSpots": 2
    },
    {
      "id": 2,
      "address": "456 Oak Ave, Unit 2",
      "maxOccupant": 3,
      "currentOccupants": 3,
      "availableSpots": 0
    }
  ]
}
```

**前端适配方式:**

```typescript
// 获取房屋列表用于下拉选择
const response = await axiosClient.get("/housing/houses/summaries");
const houses = response.data.data;

// 过滤出有空位的房屋
const availableHouses = houses.filter((h) => h.availableSpots > 0);
```

---

### 2.2 检查房屋可用性 (Check House Availability)

**前端调用位置:** 可选 - 实时验证房屋是否有空位

**状态:** ✅ 已完成

**Endpoint:** `GET /api/housing/houses/{houseId}/availability`

**Response Example (200 OK):**

```json
{
  "success": true,
  "message": "House availability checked",
  "data": {
    "houseId": 1,
    "address": "123 Main St, Apt 1",
    "maxOccupant": 4,
    "currentOccupants": 2,
    "available": true
  }
}
```

---

## 5️⃣ 关键字段类型约定

### ID 类型约定（混合策略）

| 服务                | ID 字段                     | 类型       | 说明                   | 示例                         |
| ------------------- | --------------------------- | ---------- | ---------------------- | ---------------------------- |
| Auth Service        | `User.id`                   | **Number** | SQL Primary Key (Long) | `1`                          |
| Auth Service        | `RegistrationToken.houseId` | **Number** | 🆕 关联到 House.id     | `1`                          |
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
- **Token Claims 结构:**

```json
{
  "sub": "hr_admin", // username
  "userId": 1, // user ID (Number)
  "roles": ["Employee", "HR"], // 角色数组
  "iat": 1733856000, // issued at
  "exp": 1733942400 // expiration
}
```

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

### 9.4 Login API 适配示例

```typescript
// src/services/api/userApi.ts
export const login = async (username: string, password: string) => {
  const response = await axiosClient.post("/auth/login", {
    usernameOrEmail: username, // 后端字段名
    password,
  });

  if (response.data.success) {
    const { token, user, roles } = response.data.data;
    localStorage.setItem("token", token);
    return { token, user, roles };
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

### 9.8 🆕 HR Hiring Form 组件示例 (新增)

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

| API            | 主要差异                                              |
| -------------- | ----------------------------------------------------- |
| 所有 API       | Path 有 `/api` 前缀                                   |
| 所有 API       | Response 包装在 `{success, message, data}` 中         |
| Login          | Request 字段是 `usernameOrEmail`（`username` 也支持） |
| Validate Token | 用 `success` 代替 `valid`                             |
| Validate Token | 🆕 Response 包含 `houseId`                            |
| Generate Token | 不支持 `name` 字段                                    |
| Generate Token | 🆕 **`houseId` 现在是必填字段**                       |
| Generate Token | 🆕 Response 包含 `houseId` 和 `houseAddress`          |
| Generate Token | 需要 HR 角色的 JWT Token                              |
| Register       | 🆕 自动创建 Employee 记录（含 houseID）               |

---

## 🆕 Fix #1 & Fix #2 更新摘要

### Fix #1: 生成 Token 时分配房屋

- **Request 变更**: `houseId` 是必填字段
- **Response 变更**: 返回 `houseId` 和 `houseAddress`
- **验证**: 后端会检查房屋是否有空位，满员会返回错误
- **前端影响**: HR Hiring 页面需要添加房屋选择下拉框

### Fix #2: 注册时创建 Employee 记录

- **行为变更**: 注册成功后自动在 MongoDB 创建 Employee 记录
- **Employee 记录包含**: `userID`, `email`, `houseID`
- **前端影响**: 无需修改，Employee 记录自动创建
