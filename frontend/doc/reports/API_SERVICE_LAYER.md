# API Service Layer Documentation

## 概览

本项目的 API Service 层严格遵循 `ai_rules.md` 中定义的规范，实现了：

1. **统一响应封装**: 所有 API 响应都包裹在 `ApiResponse<T>` 中
2. **业务状态与 HTTP 状态分离**: 拦截器自动处理业务逻辑
3. **Mock 优先策略**: 支持前端独立开发，无需后端依赖
4. **数据映射**: Service 层负责扁平表单数据与 DB 嵌套结构的转换

---

## 目录结构

```
src/services/api/
├── axiosClient.ts       # Axios 实例 + 全局拦截器
├── userApi.ts          # 用户认证 API
├── employeeApi.ts      # 员工管理 API (包含数据映射工具)
├── applicationApi.ts   # 申请工作流 API
├── housingApi.ts       # 房屋管理 API
└── index.ts            # 统一导出
```

---

## 核心组件

### 1. axiosClient.ts - Axios 拦截器

#### Response Interceptor 逻辑

```typescript
// HTTP 200 成功
if (apiResponse.success === true) {
  return apiResponse.data;  // 剥离外壳，返回 Payload
}

// 业务失败
if (apiResponse.success === false) {
  message.error(apiResponse.message);
  throw new Error(apiResponse.message);
}

// HTTP 4xx/5xx
switch (status) {
  case 401: 跳转登录
  case 403: 权限不足
  case 404: 资源不存在
  case 500: 服务器错误
}
```

#### 特性
- ✅ 自动添加 JWT Token 到请求头
- ✅ 统一错误处理和 Toast 提示
- ✅ 401 自动清除 Token 并跳转登录
- ✅ 业务状态与 HTTP 状态分离

---

### 2. Mock 策略

#### 开关控制

通过环境变量 `VITE_USE_MOCK` 控制：

```env
# .env.development
VITE_USE_MOCK=true   # 前端开发阶段使用 Mock

# .env.production
VITE_USE_MOCK=false  # 生产环境调用真实后端
```

#### Mock 数据规范

所有 Mock 数据必须符合 DB Design 的完整结构：

```typescript
const MOCK_EMPLOYEE: Employee = {
  id: 'emp-001',
  userId: '1',
  contacts: [/* 嵌套数组 */],
  addresses: [/* 嵌套数组 */],
  visaStatuses: [/* 嵌套数组 */],
  personalDocuments: [/* 嵌套数组 */],
  // ... 其他字段
};
```

#### Mock 行为模拟

```typescript
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  if (USE_MOCK) {
    await delay(500);  // 模拟网络延迟
    return MOCK_LOGIN_RESPONSE;
  }
  
  return axiosClient.post('/auth/login', credentials) as Promise<LoginResponse>;
};
```

---

### 3. Service 层职责

#### 数据映射 (employeeApi.ts)

Service 层提供 `mapOnboardingFormToEmployeeRequest` 函数，负责将扁平的表单数据转换为符合 DB 设计的嵌套结构：

##### 输入 (扁平表单)
```typescript
interface OnboardingFormData {
  firstName: string;
  lastName: string;
  refName: string;          // 扁平字段
  refPhone: string;         // 扁平字段
  emergencyName: string;    // 扁平字段
  emergencyPhone: string;   // 扁平字段
  addressLine1: string;     // 扁平字段
  city: string;
  // ...
}
```

##### 输出 (嵌套结构)
```typescript
interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  contacts: Contact[];      // 嵌套数组
  addresses: Address[];     // 嵌套数组
  visaStatuses: VisaStatus[]; // 嵌套数组
}
```

##### 使用示例
```typescript
import { mapOnboardingFormToEmployeeRequest, createEmployee } from '@/services/api';

const handleSubmit = async (formData: OnboardingFormData) => {
  // 1. 数据映射
  const employeeRequest = mapOnboardingFormToEmployeeRequest(formData, userId);
  
  // 2. 调用 API
  const employee = await createEmployee(employeeRequest);
};
```

---

## API 函数清单

### userApi.ts - 用户认证

| 函数 | 返回类型 | 说明 |
|------|---------|------|
| `login(credentials)` | `Promise<LoginResponse>` | 用户登录 |
| `register(data)` | `Promise<User>` | 用户注册 |
| `getUserProfile()` | `Promise<User>` | 获取当前用户信息 |
| `logout()` | `Promise<void>` | 退出登录 |
| `validateRegistrationToken(token)` | `Promise<RegistrationToken>` | 验证注册 Token |
| `generateRegistrationToken(email)` | `Promise<RegistrationToken>` | HR 生成注册 Token |

### employeeApi.ts - 员工管理

| 函数 | 返回类型 | 说明 |
|------|---------|------|
| `getAllEmployees()` | `Promise<Employee[]>` | 获取所有员工 |
| `getEmployeeById(id)` | `Promise<Employee>` | 根据 ID 获取员工 |
| `getEmployeeByUserId(userId)` | `Promise<Employee>` | 根据 User ID 获取员工 |
| `createEmployee(data)` | `Promise<Employee>` | 创建员工 (Onboarding) |
| `updateEmployee(data)` | `Promise<Employee>` | 更新员工信息 |
| `deleteEmployee(id)` | `Promise<void>` | 删除员工 |
| `uploadPersonalDocument(...)` | `Promise<PersonalDocument>` | 上传员工文档 |
| `deletePersonalDocument(employeeId, docId)` | `Promise<void>` | 删除员工文档 |

**工具函数**:
- `mapOnboardingFormToEmployeeRequest(formData, userId)` - 数据映射

### applicationApi.ts - 申请工作流

| 函数 | 返回类型 | 说明 |
|------|---------|------|
| `getAllApplications()` | `Promise<ApplicationDetail[]>` | 获取所有申请 (HR) |
| `getApplicationsByStatus(status)` | `Promise<ApplicationDetail[]>` | 根据状态获取申请 |
| `getApplicationById(id)` | `Promise<ApplicationDetail>` | 根据 ID 获取申请 |
| `getApplicationsByEmployeeId(empId)` | `Promise<ApplicationWorkFlow[]>` | 根据员工 ID 获取申请 |
| `createApplication(data)` | `Promise<ApplicationWorkFlow>` | 创建新申请 |
| `updateApplicationStatus(data)` | `Promise<ApplicationWorkFlow>` | 更新申请状态 (HR) |
| `deleteApplication(id)` | `Promise<void>` | 删除申请 |
| `getAllDigitalDocuments()` | `Promise<DigitalDocument[]>` | 获取所有文档模板 |
| `getDigitalDocumentByType(type)` | `Promise<DigitalDocument>` | 根据类型获取模板 |
| `getRequiredDocuments()` | `Promise<DigitalDocument[]>` | 获取必需文档列表 |

### housingApi.ts - 房屋管理

| 函数 | 返回类型 | 说明 |
|------|---------|------|
| `getAllHouses()` | `Promise<House[]>` | 获取所有房屋 |
| `getHouseById(id)` | `Promise<HouseDetail>` | 获取房屋详情 |
| `createHouse(data)` | `Promise<House>` | 创建房屋 |
| `updateHouse(id, data)` | `Promise<House>` | 更新房屋 |
| `deleteHouse(id)` | `Promise<void>` | 删除房屋 |
| `getAllLandlords()` | `Promise<Landlord[]>` | 获取所有房东 |
| `getLandlordById(id)` | `Promise<Landlord>` | 获取房东详情 |
| `createLandlord(data)` | `Promise<Landlord>` | 创建房东 |
| `getFacilitiesByHouseId(houseId)` | `Promise<Facility[]>` | 获取房屋设施列表 |
| `createFacility(data)` | `Promise<Facility>` | 创建设施 |
| `updateFacility(id, data)` | `Promise<Facility>` | 更新设施 |
| `deleteFacility(id)` | `Promise<void>` | 删除设施 |
| `getAllFacilityReports()` | `Promise<FacilityReport[]>` | 获取所有报修工单 |
| `getFacilityReportsByStatus(status)` | `Promise<FacilityReport[]>` | 根据状态获取报修 |
| `getFacilityReportById(id)` | `Promise<FacilityReportDetail>` | 获取报修详情 |
| `getFacilityReportsByEmployeeId(empId)` | `Promise<FacilityReport[]>` | 根据员工 ID 获取报修 |
| `createFacilityReport(data)` | `Promise<FacilityReport>` | 创建报修工单 |
| `updateFacilityReportStatus(data)` | `Promise<FacilityReport>` | 更新报修状态 |
| `addFacilityReportComment(data)` | `Promise<FacilityReportDetail>` | 添加报修评论 |
| `deleteFacilityReport(id)` | `Promise<void>` | 删除报修工单 |

---

## 使用示例

### 1. 登录流程

```typescript
import { login } from '@/services/api';

const handleLogin = async (username: string, password: string) => {
  try {
    const response = await login({ username, password });
    
    // 拦截器已剥离 ApiResponse，直接获得 LoginResponse
    localStorage.setItem('authToken', response.token);
    console.log('User:', response.user);
    console.log('Role:', response.role);
  } catch (error) {
    // 错误已由拦截器处理（Toast 提示）
    console.error('Login failed:', error);
  }
};
```

### 2. Onboarding 表单提交

```typescript
import { mapOnboardingFormToEmployeeRequest, createEmployee } from '@/services/api';

const handleOnboardingSubmit = async (formData: OnboardingFormData) => {
  try {
    // 1. 数据映射 (扁平 -> 嵌套)
    const employeeRequest = mapOnboardingFormToEmployeeRequest(formData, currentUserId);
    
    // 2. 调用 API
    const employee = await createEmployee(employeeRequest);
    
    message.success('Onboarding 成功！');
    navigate('/dashboard');
  } catch (error) {
    // 错误已由拦截器处理
  }
};
```

### 3. 获取员工列表 (HR Dashboard)

```typescript
import { getAllEmployees } from '@/services/api';

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getAllEmployees();
        setEmployees(data);
      } catch (error) {
        // 错误已由拦截器处理
      }
    };
    
    fetchEmployees();
  }, []);
  
  return (
    <Table dataSource={employees} columns={columns} />
  );
};
```

### 4. HR 审批申请

```typescript
import { updateApplicationStatus } from '@/services/api';

const handleApprove = async (applicationId: string) => {
  try {
    await updateApplicationStatus({
      id: applicationId,
      status: 'Approved',
      comment: 'All documents verified',
    });
    
    message.success('申请已批准');
    refetch();
  } catch (error) {
    // 错误已由拦截器处理
  }
};
```

---

## 类型安全

所有 Service 函数返回值类型为 `Promise<T>` (Payload)，而非 `Promise<ApiResponse<T>>`，因为拦截器已经剥离了外壳。

```typescript
// ✅ 正确
export const getUserProfile = async (): Promise<User> => {
  return axiosClient.get('/auth/profile') as Promise<User>;
};

// ❌ 错误
export const getUserProfile = async (): Promise<ApiResponse<User>> => {
  // ...
};
```

---

## 环境配置

### .env 文件

```bash
# .env.development (开发环境 - 使用 Mock)
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK=true

# .env.production (生产环境 - 调用真实后端)
VITE_API_BASE_URL=https://api.production.com/api
VITE_USE_MOCK=false
```

### 切换 Mock 模式

1. **启用 Mock**: 设置 `VITE_USE_MOCK=true`
   - 前端独立开发，无需后端
   - 所有数据来自 Mock 数据

2. **禁用 Mock**: 设置 `VITE_USE_MOCK=false`
   - 调用真实后端 API
   - `VITE_API_BASE_URL` 指向后端地址

---

## 注意事项

1. **所有 ID 字段都是 `string` 类型** (MySQL 和 MongoDB ID 统一处理)
2. **Employee 实体必须包含嵌套数组** (contacts, addresses, visaStatuses, personalDocuments)
3. **Service 层负责数据映射**，组件层不应直接处理数据转换
4. **Mock 数据必须包含完整结构**，不能省略嵌套字段
5. **拦截器会自动显示错误 Toast**，组件层无需重复处理

---

## 下一步

- [ ] 配置 Redux Store (Phase 2)
- [ ] 实现路由和布局 (Phase 4)
- [ ] 创建具体业务组件 (Phase 5)
