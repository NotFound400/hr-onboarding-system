# 前后端联调契约单 (API Handoff Checklist)

## 📋 填写说明
**后端开发者请按以下格式填写每个 API 的实际请求和响应示例：**

1. 找到对应的 API 接口
2. 将实际的 Request Body 和 Response 粘贴到对应的代码块中
3. 标记完成状态（✅ 已完成 / ⏳ 开发中 / ❌ 未开始）
4. 如有差异，在 **差异说明** 中注明

---

## 1️⃣ Authentication APIs (认证相关)

### 1.1 用户登录 (Login)

**前端调用位置:** `src/services/api/userApi.ts` - `login()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `POST /auth/login`
- **Request:**
```json
{
  "username": "admin",
  "password": "admin1"
}
```
- **Response (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 999,
    "username": "admin",
    "email": "admin@company.com",
    "createDate": "2024-01-01T00:00:00Z",
    "lastModificationDate": "2024-01-01T00:00:00Z"
  },
  "role": "HR"
}
```

#### 后端实际 (由后端填写)

**Endpoint:** `POST /auth/login` _(请确认实际路径)_

**Request Body Example:**
```json
{
  "_comment": "后端请粘贴实际的请求示例"
}
```

**Response Example (200 OK):**
```json
{
  "_comment": "后端请粘贴实际的响应示例"
}
```

**Response Example (401 Unauthorized):**
```json
{
  "_comment": "后端请粘贴实际的错误响应示例"
}
```

**差异说明:**
- [ ] 无差异，与前端期望一致
- [ ] 有差异，具体说明：_____________

---

### 1.2 用户注册 (Register)

**前端调用位置:** `src/services/api/userApi.ts` - `registerUser()`

**状态:** ❌ 待后端填写

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
- **Response (Success):**
```json
{
  "id": 101,
  "username": "newuser",
  "email": "newuser@example.com",
  "createDate": "2024-12-08T10:00:00Z",
  "lastModificationDate": "2024-12-08T10:00:00Z"
}
```

#### 后端实际 (由后端填写)

**Endpoint:** `POST /auth/register`

**Request Body Example:**
```json
{
  "_comment": "后端请粘贴实际的请求示例"
}
```

**Response Example (200 OK):**
```json
{
  "_comment": "后端请粘贴实际的响应示例"
}
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

### 1.3 验证注册 Token (Validate Token)

**前端调用位置:** `src/services/api/userApi.ts` - `validateToken()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `GET /auth/validate-token/{token}`
- **Response (Valid Token):**
```json
{
  "valid": true,
  "email": "newuser@example.com"
}
```
- **Response (Invalid Token):**
```json
{
  "valid": false,
  "email": "",
  "message": "Token is invalid or expired"
}
```

#### 后端实际 (由后端填写)

**Endpoint:** `GET /auth/validate-token/{token}`

**Response Example (Valid):**
```json
{
  "_comment": "后端请粘贴实际的响应示例"
}
```

**Response Example (Invalid):**
```json
{
  "_comment": "后端请粘贴实际的响应示例"
}
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

### 1.4 生成注册 Token (Generate Token)

**前端调用位置:** `src/services/api/userApi.ts` - `generateRegistrationToken()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `POST /auth/registration-token`
- **Request:**
```json
{
  "email": "newemployee@example.com",
  "name": "John Smith"
}
```
- **Response:**
```json
{
  "id": 1,
  "token": "abc123def456",
  "email": "newemployee@example.com",
  "expirationDate": "2025-12-31T23:59:59Z",
  "createBy": "hr-user-1",
  "createDate": "2024-12-08T10:00:00Z"
}
```

#### 后端实际 (由后端填写)

**Endpoint:** `POST /auth/registration-token`

**Request Body Example:**
```json
{
  "_comment": "后端请粘贴实际的请求示例"
}
```

**Response Example:**
```json
{
  "_comment": "后端请粘贴实际的响应示例"
}
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

## 2️⃣ Employee APIs (员工相关)

### 2.1 获取所有员工 (Get All Employees)

**前端调用位置:** `src/services/api/employeeApi.ts` - `getAllEmployees()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `GET /employees`
- **Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "userID": 1,
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "Michael",
    "preferredName": "Johnny",
    "email": "john.doe@example.com",
    "cellPhone": "123-456-7890",
    "alternatePhone": "",
    "gender": "Male",
    "SSN": "123-45-6789",
    "DOB": "1990-01-15",
    "startDate": "2024-01-01",
    "endDate": "",
    "driverLicense": "D1234567",
    "driverLicenseExpiration": "2026-01-15",
    "houseID": 1,
    "contact": [
      {
        "type": "Emergency",
        "firstName": "Jane",
        "lastName": "Doe",
        "phone": "098-765-4321",
        "email": "jane.doe@example.com",
        "relationship": "Spouse"
      }
    ],
    "address": [
      {
        "type": "Primary",
        "addressLine1": "123 Main St",
        "addressLine2": "Apt 4B",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      }
    ],
    "visaStatus": [
      {
        "visaType": "H1B",
        "activeFlag": true,
        "startDate": "2024-01-01",
        "endDate": "2027-01-01",
        "lastModificationDate": "2024-01-01T00:00:00Z"
      }
    ],
    "personalDocument": []
  }
]
```

#### 后端实际 (由后端填写)

**Endpoint:** `GET /employees`

**Response Example:**
```json
[
  {
    "_comment": "后端请粘贴实际的响应示例（至少包含一个完整的员工对象）"
  }
]
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

### 2.2 根据 ID 获取员工 (Get Employee by ID)

**前端调用位置:** `src/services/api/employeeApi.ts` - `getEmployeeById()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `GET /employees/{id}`
- **Path Parameter:** `id` (String, MongoDB ObjectId)
- **Example:** `GET /employees/507f1f77bcf86cd799439011`

#### 后端实际 (由后端填写)

**Endpoint:** `GET /employees/{id}`

**Response Example (200 OK):**
```json
{
  "_comment": "后端请粘贴实际的响应示例"
}
```

**Response Example (404 Not Found):**
```json
{
  "_comment": "后端请粘贴实际的错误响应"
}
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

### 2.3 根据 User ID 获取员工 (Get Employee by User ID)

**前端调用位置:** `src/services/api/employeeApi.ts` - `getEmployeeByUserId()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `GET /employees/user/{userId}`
- **Path Parameter:** `userId` (Number)
- **Example:** `GET /employees/user/1`

#### 后端实际 (由后端填写)

**Endpoint:** `GET /employees/user/{userId}`

**Response Example:**
```json
{
  "_comment": "后端请粘贴实际的响应示例"
}
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

### 2.4 创建员工 (Create Employee)

**前端调用位置:** `src/services/api/employeeApi.ts` - `createEmployee()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `POST /employees`
- **Request:**
```json
{
  "userID": 100,
  "firstName": "Alice",
  "lastName": "Wang",
  "email": "alice.wang@example.com",
  "cellPhone": "111-222-3333",
  "gender": "Female",
  "SSN": "987-65-4321",
  "DOB": "1995-05-20",
  "startDate": "2024-02-01",
  "driverLicense": "D9876543",
  "driverLicenseExpiration": "2027-05-20"
}
```

#### 后端实际 (由后端填写)

**Endpoint:** `POST /employees`

**Request Body Example:**
```json
{
  "_comment": "后端请粘贴实际的请求示例"
}
```

**Response Example:**
```json
{
  "_comment": "后端请粘贴实际的响应示例"
}
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

### 2.5 更新员工 (Update Employee)

**前端调用位置:** `src/services/api/employeeApi.ts` - `updateEmployee()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `PUT /employees/{id}`
- **Request:**
```json
{
  "firstName": "Alice",
  "lastName": "Wang",
  "cellPhone": "111-222-9999",
  "email": "alice.wang.updated@example.com"
}
```

#### 后端实际 (由后端填写)

**Endpoint:** `PUT /employees/{id}`

**Request Body Example:**
```json
{
  "_comment": "后端请粘贴实际的请求示例"
}
```

**Response Example:**
```json
{
  "_comment": "后端请粘贴实际的响应示例"
}
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

## 3️⃣ Application APIs (申请工作流)

### 3.1 获取员工的申请列表 (Get Applications by Employee ID)

**前端调用位置:** `src/services/api/applicationApi.ts` - `getApplicationsByEmployeeId()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `GET /applications/employee/{employeeId}`
- **Path Parameter:** `employeeId` (String, MongoDB ObjectId)
- **Response:**
```json
[
  {
    "id": 1,
    "employeeId": "507f1f77bcf86cd799439011",
    "type": "Onboarding",
    "status": "Pending",
    "comment": "",
    "createDate": "2024-01-01T00:00:00Z",
    "lastModificationDate": "2024-01-01T00:00:00Z"
  }
]
```

#### 后端实际 (由后端填写)

**Endpoint:** `GET /applications/employee/{employeeId}`

**Response Example:**
```json
[
  {
    "_comment": "后端请粘贴实际的响应示例"
  }
]
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

### 3.2 创建申请 (Create Application)

**前端调用位置:** `src/services/api/applicationApi.ts` - `createApplication()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `POST /applications`
- **Request:**
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "type": "Onboarding",
  "status": "Pending",
  "comment": ""
}
```

#### 后端实际 (由后端填写)

**Endpoint:** `POST /applications`

**Request Body Example:**
```json
{
  "_comment": "后端请粘贴实际的请求示例"
}
```

**Response Example:**
```json
{
  "_comment": "后端请粘贴实际的响应示例"
}
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

### 3.3 更新申请状态 (Update Application Status)

**前端调用位置:** `src/services/api/applicationApi.ts` - `updateApplicationStatus()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `PUT /applications/{id}/status`
- **Request:**
```json
{
  "status": "Approved",
  "comment": "All documents verified"
}
```

#### 后端实际 (由后端填写)

**Endpoint:** `PUT /applications/{id}/status`

**Request Body Example:**
```json
{
  "_comment": "后端请粘贴实际的请求示例"
}
```

**Response Example:**
```json
{
  "_comment": "后端请粘贴实际的响应示例"
}
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

## 4️⃣ Housing APIs (房屋管理)

### 4.1 获取所有房屋 (Get All Houses)

**前端调用位置:** `src/services/api/housingApi.ts` - `getAllHouses()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `GET /houses`
- **Response:**
```json
[
  {
    "id": 1,
    "address": "123 Main Street, City, State 12345",
    "maxOccupant": 4,
    "numberOfEmployees": 3,
    "landlordId": 1,
    "landlordFullName": "John Doe",
    "landlordPhone": "123-456-7890",
    "landlordEmail": "john.doe@example.com"
  }
]
```

#### 后端实际 (由后端填写)

**Endpoint:** `GET /houses`

**Response Example:**
```json
[
  {
    "_comment": "后端请粘贴实际的响应示例"
  }
]
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

### 4.2 创建房屋 (Create House)

**前端调用位置:** `src/services/api/housingApi.ts` - `createHouse()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `POST /houses`
- **Request:**
```json
{
  "address": "456 Oak Avenue, City, State 54321",
  "maxOccupancy": 6,
  "landlord": {
    "firstName": "Jane",
    "lastName": "Smith",
    "phoneNumber": "098-765-4321",
    "email": "jane.smith@example.com"
  },
  "facilityInfo": "3 beds, 2 baths, WiFi, laundry"
}
```

#### 后端实际 (由后端填写)

**Endpoint:** `POST /houses`

**Request Body Example:**
```json
{
  "_comment": "后端请粘贴实际的请求示例"
}
```

**Response Example:**
```json
{
  "_comment": "后端请粘贴实际的响应示例"
}
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

### 4.3 删除房屋 (Delete House)

**前端调用位置:** `src/services/api/housingApi.ts` - `deleteHouse()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `DELETE /houses/{id}`
- **Path Parameter:** `id` (Number)
- **Response:** `204 No Content` 或 `200 OK`

#### 后端实际 (由后端填写)

**Endpoint:** `DELETE /houses/{id}`

**Response Example:**
```json
{
  "_comment": "后端请粘贴实际的响应示例（如果有响应体）"
}
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

### 4.4 获取员工的房屋信息 (Get Employee House)

**前端调用位置:** `src/services/api/housingApi.ts` - `getEmployeeHouse()`

**状态:** ❌ 待后端填写

#### 前端期望
- **Endpoint:** `GET /houses/employee/{employeeId}`
- **Response:**
```json
{
  "id": 1,
  "address": "123 Main Street, City, State 12345",
  "residents": [
    {
      "employeeId": 1,
      "name": "Alice Johnson",
      "phone": "111-222-3333"
    },
    {
      "employeeId": 2,
      "name": "Bob Smith",
      "phone": "222-333-4444"
    }
  ]
}
```

#### 后端实际 (由后端填写)

**Endpoint:** `GET /houses/employee/{employeeId}`

**Response Example:**
```json
{
  "_comment": "后端请粘贴实际的响应示例"
}
```

**差异说明:**
- [ ] 无差异
- [ ] 有差异：_____________

---

## 5️⃣ 关键字段类型约定

### ID 类型约定（混合策略）

| 服务 | ID 字段 | 类型 | 说明 | 示例 |
|------|---------|------|------|------|
| Employee Service | `Employee.id` | **String** | MongoDB ObjectId | `"507f1f77bcf86cd799439011"` |
| Employee Service | `Employee.userID` | **Number** | 关联到 User.id | `1` |
| Application Service | `Application.id` | **Number** | SQL Primary Key | `1` |
| Application Service | `Application.employeeId` | **String** | 关联到 Employee.id | `"507f1f77bcf86cd799439011"` |
| Housing Service | `House.id` | **Number** | SQL Primary Key | `1` |
| Auth Service | `User.id` | **Number** | SQL Primary Key | `1` |

**后端确认：**
- [ ] 已确认，ID 类型与上述约定一致
- [ ] 有差异，具体说明：_____________

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
  "message": "Error message",
  "error": "Detailed error description"
}
```

**后端确认：**
- [ ] 使用上述格式
- [ ] 使用其他格式，具体说明：_____________

---

## 7️⃣ 认证方式

### JWT Token

**前端行为：**
- 登录后将 token 存储在 `localStorage.getItem('token')`
- 每个请求自动在 Header 中添加：`Authorization: Bearer {token}`

**后端确认：**
- [ ] 使用 JWT Bearer Token 认证
- [ ] Token 格式要求：_____________
- [ ] Token 过期时间：_____________
- [ ] 其他说明：_____________

---

## 8️⃣ 联调准备清单

### 后端需要提供

- [ ] API Base URL（开发环境）：_____________
- [ ] API Base URL（测试环境）：_____________
- [ ] Swagger/OpenAPI 文档地址：_____________
- [ ] 测试账号：
  - HR 账号：`username: _______ password: _______`
  - Employee 账号：`username: _______ password: _______`
- [ ] CORS 配置完成（允许前端域名访问）
- [ ] 测试数据已准备（至少包含 2 个 Employee，1 个 House）

### 前端需要配置

- [ ] 更新 `axiosClient.ts` 中的 `baseURL`
- [ ] 关闭 Mock 模式：`isMockMode()` 返回 `false`
- [ ] 测试所有 API 调用

---

## 9️⃣ 常见问题 (FAQ)

### Q1: 前端如何切换到真实 API？
**A:** 修改 `src/utils/mockUtils.ts`：
```typescript
export const isMockMode = (): boolean => {
  return false; // 改为 false
};
```

### Q2: 如何配置 API Base URL？
**A:** 修改 `src/services/api/axiosClient.ts`：
```typescript
const axiosClient = axios.create({
  baseURL: 'http://your-backend-url/api', // 修改为后端地址
  timeout: 10000,
});
```

### Q3: 遇到 CORS 错误怎么办？
**A:** 后端需要配置允许前端域名的 CORS：
```java
// Spring Boot 示例
@CrossOrigin(origins = "http://localhost:5174")
```

---

## 🎯 完成标准

当以下所有项都勾选时，表示可以开始联调：

- [ ] 所有 API 的实际示例已填写
- [ ] ID 类型约定已确认
- [ ] 认证方式已确认
- [ ] 测试账号已提供
- [ ] API Base URL 已提供
- [ ] CORS 已配置
- [ ] 测试数据已准备

---

**最后更新时间:** 2024-12-08  
**填写人（后端）:** _____________  
**审核人（前端）:** _____________
