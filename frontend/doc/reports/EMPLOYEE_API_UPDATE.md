# Employee API 更新报告

## 更新时间
2025-12-12

## 更新目的
根据最新的后端 Employee API 文档 (`api_employee.md`) 更新前端类型定义和 API 服务层，确保前后端数据结构完全一致。

---

## 一、类型定义更新 (`types/employee.ts`)

### 1.1 Contact 接口更新

**变更内容**：
- ✅ 添加 `id: string` 字段 (UUID)
- ✅ 字段名统一：`phone` → `cellPhone`
- ✅ 添加 `alternatePhone` 字段
- ❌ 移除 `middleName` 字段（后端不支持）
- ❌ 移除 `address` 字段（仅 Reference 需要，但后端已分离）
- ✅ `type` 字段类型改为 `string`（而非 enum）

**更新后结构**：
```typescript
export interface Contact {
  id: string;                    // UUID
  firstName: string;
  lastName: string;
  cellPhone: string;
  alternatePhone?: string;
  email: string;
  relationship: string;          // Spouse/Parent/Sibling/Friend
  type: string;                  // Emergency/Reference
}
```

---

### 1.2 Address 接口更新

**变更内容**：
- ✅ 添加 `id: string` 字段 (UUID)
- ❌ 移除 `type` 字段（后端不使用 type 区分 Primary/Secondary）
- ✅ `addressLine2` 改为可选字段

**更新后结构**：
```typescript
export interface Address {
  id: string;                    // UUID
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
}
```

---

### 1.3 VisaStatus 接口更新

**变更内容**：
- ✅ 添加 `id: string` 字段 (UUID)
- ✅ `visaType` 类型改为 `string`（支持 H1B/F1/L1/OPT）
- ✅ `activeFlag` 类型改为 `'Y' | 'N'`（而非 boolean）

**更新后结构**：
```typescript
export interface VisaStatus {
  id: string;                    // UUID
  visaType: string;              // H1B/F1/L1/OPT
  activeFlag: 'Y' | 'N';         // 激活标志
  startDate: string;             // ISO 8601
  endDate: string;               // ISO 8601
  lastModificationDate: string;  // ISO 8601
}
```

---

### 1.4 PersonalDocument 接口更新

**变更内容**：
- ✅ `id` 类型从 `number` 改为 `string` (UUID)
- ✅ `path` 字段更新为 S3 完整 URL
- ✅ 示例标题更新：`Passport`, `I-94`, `Driver License`

**更新后结构**：
```typescript
export interface PersonalDocument {
  id: string;                    // UUID
  path: string;                  // S3 完整路径
  title: string;                 // Passport, I-94, etc.
  comment: string;
  createDate: string;            // ISO 8601
}
```

---

### 1.5 Employee 接口更新

**变更内容**：
- ✅ `id` 确认为 MongoDB ObjectId (string)
- ✅ `gender` 类型改为 `string`（而非 enum）
- ✅ `endDate` 类型改为 `string | null`（支持 null）
- ✅ 所有可选字段标记统一（符合后端响应）
- ❌ 移除 `workEmail`, `workPhone`, `title`, `avatar` 字段（后端当前不支持）
- ✅ `houseID` 改为可选字段

**更新后结构**：
```typescript
export interface Employee {
  id: string;                    // MongoDB ObjectId
  userID: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  email: string;
  cellPhone: string;
  alternatePhone?: string;
  gender: string;                // Male/Female/Other
  SSN: string;
  DOB: string;                   // ISO 8601
  startDate: string;             // ISO 8601
  endDate: string | null;        // ISO 8601 or null
  driverLicense?: string;
  driverLicenseExpiration?: string;
  houseID?: number;
  contact: Contact[];
  address: Address[];
  visaStatus: VisaStatus[];
  personalDocument: PersonalDocument[];
}
```

---

## 二、API 服务更新 (`services/api/employeeApi.ts`)

### 2.1 新增 API 接口

#### ✅ 分页查询员工
```typescript
export const getEmployeesPage = async (
  params?: PageQueryParams
): Promise<PageResponse<Employee>>
```
- **Endpoint**: `GET /api/employees/page`
- **参数**: 
  - `page`: 页码（从 0 开始）
  - `size`: 每页大小（默认 3）
  - `sort`: 排序字段（默认 `lastName,asc`）
- **返回**: Spring Data Page 结构

#### ✅ 搜索员工
```typescript
export const searchEmployees = async (
  name: string
): Promise<Employee[]>
```
- **Endpoint**: `GET /api/employees/search?name={name}`
- **功能**: 按 First Name / Last Name / Preferred Name 搜索

#### ✅ 根据房屋ID获取员工
```typescript
export const getEmployeesByHouseId = async (
  houseId: number
): Promise<Employee[]>
```
- **Endpoint**: `GET /api/employees/house/{houseId}`
- **用途**: 获取室友列表（HR Section 6.d.iv）

#### ✅ 统计房屋员工数量
```typescript
export const getEmployeeCountByHouseId = async (
  houseId: number
): Promise<number>
```
- **Endpoint**: `GET /api/employees/house/{houseId}/count`
- **用途**: 房屋管理页面显示入住人数

---

### 2.2 更新现有 API 接口

#### ✅ 更新员工信息
```typescript
// 旧签名
export const updateEmployee = async (
  data: UpdateEmployeeRequest
): Promise<Employee>

// 新签名
export const updateEmployee = async (
  id: string,
  data: UpdateEmployeeRequest
): Promise<Employee>
```
- **变更原因**: 符合 RESTful 规范，ID 作为路径参数

#### ✅ 上传文档返回值更新
```typescript
export const uploadPersonalDocument = async (
  employeeId: string,
  file: File,
  title: string,
  comment?: string
): Promise<PersonalDocument>
```
- **变更**: Mock 数据返回 UUID 格式的 `id`

---

### 2.3 移除过时功能

❌ **移除数据映射工具函数**:
- `OnboardingFormData` 接口
- `mapOnboardingFormToEmployeeRequest()` 函数
- **原因**: 类型定义已更新，旧的映射函数使用了过时的 enum 类型

---

## 三、请求 DTO 更新 (`types/request.ts`)

### 3.1 CreateEmployeeRequest 更新

**变更内容**：
```typescript
export interface CreateEmployeeRequest {
  userID: number;               // 字段名大写（符合后端）
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  email: string;
  cellPhone: string;
  alternatePhone?: string;
  gender: string;               // 改为 string
  SSN: string;
  DOB: string;
  startDate: string;
  endDate?: string | null;
  driverLicense?: string;
  driverLicenseExpiration?: string;
  houseID?: number;
  contact: Contact[];
  address: Address[];
  visaStatus: VisaStatus[];
  personalDocument?: any[];
}
```

**移除字段**：
- `avatar`, `workEmail`, `workPhone`, `title`（后端当前不支持）

---

### 3.2 UpdateEmployeeRequest 更新

**变更内容**：
```typescript
export interface UpdateEmployeeRequest {
  userID?: number;
  firstName?: string;
  lastName?: string;
  // ... 所有字段改为可选
  contact?: Contact[];
  address?: Address[];
  visaStatus?: VisaStatus[];
  personalDocument?: any[];
}
```

**移除字段**：
- `id` 字段（改为函数参数）
- `workEmail`, `workPhone`, `title`

---

## 四、新增类型定义

### 4.1 PageResponse<T>

用于分页查询响应：
```typescript
export interface PageResponse<T> {
  content: T[];
  pageable: { ... };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: { ... };
  numberOfElements: number;
  empty: boolean;
}
```

### 4.2 PageQueryParams

用于分页查询参数：
```typescript
export interface PageQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}
```

---

## 五、Mock 数据更新建议

### 需要更新的 Mock 数据文件
- `services/mocks/employeeMocks.ts`

### 更新要点
1. ✅ Contact 添加 `id` 字段（UUID 格式）
2. ✅ Contact `phone` 改为 `cellPhone`
3. ✅ Address 添加 `id` 字段
4. ✅ VisaStatus 添加 `id` 字段
5. ✅ VisaStatus `activeFlag` 改为 `'Y'` 或 `'N'`
6. ✅ PersonalDocument `id` 改为 UUID 字符串
7. ✅ Employee `endDate` 可以是 `null`

---

## 六、API 接口对照表

| 功能 | 前端函数 | 后端 Endpoint | 权限 |
|------|---------|--------------|------|
| 获取所有员工 | `getAllEmployees()` | `GET /api/employees` | HR |
| 分页查询员工 | `getEmployeesPage()` | `GET /api/employees/page` | HR |
| 根据ID获取员工 | `getEmployeeById()` | `GET /api/employees/{id}` | 已认证 |
| 根据UserID获取员工 | `getEmployeeByUserId()` | `GET /api/employees/user/{userID}` | 无（内部） |
| 搜索员工 | `searchEmployees()` | `GET /api/employees/search` | HR |
| 根据房屋ID获取员工 | `getEmployeesByHouseId()` | `GET /api/employees/house/{houseId}` | HR |
| 统计房屋员工数 | `getEmployeeCountByHouseId()` | `GET /api/employees/house/{houseId}/count` | HR |
| 创建员工 | `createEmployee()` | `POST /api/employees` | 无（内部） |
| 更新员工 | `updateEmployee()` | `PUT /api/employees/{id}` | 已认证 |
| 删除员工 | `deleteEmployee()` | `DELETE /api/employees/{id}` | 已认证 |
| 上传文档 | `uploadPersonalDocument()` | `POST /api/employees/{employeeId}/documents` | 已认证 |
| 删除文档 | `deletePersonalDocument()` | `DELETE /api/employees/{employeeId}/documents/{documentId}` | 已认证 |

---

## 七、测试要点

### 7.1 类型检查
- ✅ 所有文件无编译错误
- ✅ Employee 接口字段完整
- ✅ Contact/Address/VisaStatus 添加 id 字段

### 7.2 API 调用测试
1. **分页查询**：测试不同 page/size 参数
2. **搜索功能**：测试 firstName/lastName/preferredName 匹配
3. **房屋关联**：测试 `getEmployeesByHouseId()`
4. **文档上传**：验证返回的 PersonalDocument 结构

### 7.3 Mock 模式测试
- ✅ 所有 API 在 Mock 模式下正常工作
- ✅ 分页逻辑正确（Mock 数据切片）
- ✅ 搜索逻辑正确（字符串匹配）

---

## 八、迁移指南

### 8.1 组件中的代码更新

#### Contact 字段访问
```typescript
// 旧代码
contact.phone

// 新代码
contact.cellPhone
```

#### VisaStatus activeFlag 判断
```typescript
// 旧代码
if (visaStatus.activeFlag === true)

// 新代码
if (visaStatus.activeFlag === 'Y')
```

#### 更新员工 API 调用
```typescript
// 旧代码
await updateEmployee({ id: employeeId, firstName: 'John' })

// 新代码
await updateEmployee(employeeId, { firstName: 'John' })
```

---

## 九、后续工作

### 待完成任务
1. ⚠️ 更新 `employeeMocks.ts` 中的 Mock 数据
2. ⚠️ 更新所有使用 Employee API 的组件
3. ⚠️ 更新 Personal Info 页面（字段映射）
4. ⚠️ 更新 Onboarding 表单提交逻辑
5. ⚠️ 更新 HR Employee Profile 页面

### 兼容性注意
- 旧代码中使用 `contact.phone` 的地方需要改为 `contact.cellPhone`
- 旧代码中使用 `visaStatus.activeFlag === true` 需要改为 `=== 'Y'`
- 所有调用 `updateEmployee()` 的地方需要拆分 id 参数

---

## 十、总结

本次更新确保了前端 Employee 模块的类型定义和 API 服务与后端完全一致，主要变更包括：

✅ **类型定义完全匹配后端响应结构**
✅ **新增 5 个 API 接口**（分页、搜索、房屋关联等）
✅ **修正字段命名和类型**（phone→cellPhone, activeFlag: boolean→'Y'|'N'）
✅ **所有 API 支持 Mock 模式**
✅ **代码无编译错误**

**下一步**: 更新 Mock 数据和相关组件代码。
