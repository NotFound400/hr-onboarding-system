AI Code Generation Rules & Standards
文件名: ai_rules.md 版本: 1.0 用途: 本文件定义了前端工程规范、数据契约及 Mock 策略。所有 AI 生成的代码必须严格遵循此规范。

1. 数据契约与响应结构 (Data Contract)
1.1 统一响应封装 (Standard Response Wrapper)
本项目后端采用 业务状态与 HTTP 状态分离 的模式。 前端定义的所有 API 响应类型（以及 Mock 数据）必须包裹在以下接口中：

TypeScript

// src/types/response.ts

export interface ApiResponse<T> {
  success: boolean;       // true: 业务成功; false: 业务失败 (校验不通过等)
  message: string;        // 后端返回的提示信息 (用于 Toast 展示)
  data: T | null;         // 实际业务数据 Payload
}

### 1.2 命名与数据结构权威 (Naming & Data Structure Authority)

**核心原则：代码优于文档 (Code over Documentation)**

1.  **唯一真理来源**: `src/types/*.ts` 中的 TypeScript Interface 定义是本项目字段命名和数据结构的**最高权威**。
2.  **字段命名规范**:
    * **绝对禁止**直接照搬 `doc/Team_Project_DB_Design.md` 或 PDF 中的列名（如 `FirstName`, `EmployeeID`）。
    * **必须**使用 `src/types` 中已定义的变量名（统一使用 **camelCase**，如 `firstName`, `employeeId`）。
    * 如果 `src/types` 中缺少某个字段，请遵循 **camelCase** 风格补充，禁止使用 PascalCase。
3.  **冲突解决**:
    * **命名冲突**: 如果 DB 文档叫 `CellPhone`，但 TS 定义是 `mobilePhone`，**以 TS 为准**。
    * **类型冲突**: 如果 DB 文档说 ID 是 String，但 TS 定义是 Number，**以 TS 为准**。

**ID 类型规范 (Hybrid ID Strategy)**:
虽然以 TS 为准，但在补充新类型时，需遵循以下**混合 ID 策略**：
* **MongoDB 实体 (Employee)**:
    * 自身 ID 及作为外键引用时 (如 `employeeId`)，必须定义为 **`string`**。
* **SQL 实体 (User, House, Application 等)**:
    * 自身 ID 及作为外键引用时 (如 `userId`, `houseId`)，保持为 **`number`**。

**结构对齐**:
* TS 接口应保留 DB 设计中的**嵌套结构**（例如 `Employee` 包含 `contacts` 数组），不要随意将结构扁平化，除非是为了特定的 `Request DTO`。


枚举定义: 必须为状态字段定义 TypeScript Enum，例如：

ApplicationStatus: 'Pending' | 'Rejected' | 'Approved'

VisaStatusType: 'OPT' | 'H1B' | 'L2' | 'F1'

ContactType: 'Reference' | 'Emergency'

MongoDB 嵌套结构: Employee 实体必须包含嵌套的数组对象，而非扁平字段。

❌ 错误: referenceName, emergencyPhone

✅ 正确:

TypeScript

interface Employee {
  id: string;
  firstName: string;
  // ...
  contacts: Contact[];       // 包含 Reference 和 Emergency，通过 type 区分
  addresses: Address[];      // 包含 Primary 和 Secondary
  visaStatuses: VisaStatus[];
  personalDocuments: PersonalDocument[];
}
2. 架构设计与 API 交互 (Architecture & API)
2.1 Axios 拦截器逻辑 (Interceptor Logic)
在 src/services/api/axiosClient.ts 中，必须实现全局拦截器以统一处理业务状态：

Response Interceptor:

HTTP Status 200:

检查 response.data.success。

如果为 true: 直接返回 response.data.data (即剥离 ApiResponse 外壳，组件层只获取 Payload)。

如果为 false: 调用 Ant Design message.error(response.data.message)，并执行 Promise.reject(new Error(response.data.message))。

HTTP Status 4xx/5xx:

统一捕获错误，显示通用错误提示，并 Promise.reject。

2.2 Service 层职责 (Service Layer Responsibility)
位置: src/services/api/*.ts

数据映射 (Data Mapping):

UI 表单（如 OnboardingForm）可能是扁平的。

必须在 Service 层将扁平的表单数据转换为符合 DB 设计的嵌套结构（如将 refName 塞入 contacts 数组），然后再发送给后端。

返回值: Service 函数的返回值类型应为 Promise<T> (Payload)，而不是 Promise<ApiResponse<T>>。

3. Mock 策略 (Frontend-First Strategy)
由于后端尚未开发，前端采用 完全 Mock 策略。

开关控制: 使用环境变量 REACT_APP_USE_MOCK=true (或 import.meta.env.VITE_USE_MOCK)。

实现位置: Mock 逻辑必须封装在 Service 文件内部，对组件层透明。

Mock 数据规范:

Mock 数据变量必须包含完整的 ApiResponse 结构 (即包含 success: true 和 message)。

原因: 即使在 Mock 模式下，也需要模拟拦截器剥离数据的过程，或者在 Service 内部模拟这一行为。

代码示例:

TypeScript

// src/services/api/userApi.ts
const MOCK_RESPONSE: ApiResponse<User> = {
    success: true,
    message: "Success",
    data: { ... } // 符合 DB 结构的 User 对象
};

export const getUserProfile = async (): Promise<User> => {
    if (process.env.REACT_APP_USE_MOCK === 'true') {
        await delay(500); // 模拟网络延迟
        // 模拟拦截器行为
        if (!MOCK_RESPONSE.success) throw new Error(MOCK_RESPONSE.message);
        return MOCK_RESPONSE.data!;
    }
    return axiosClient.get('/user/profile'); // 拦截器会自动处理解包
};
4. 前端技术栈规范 (Tech Stack Rules)
UI 库: Ant Design 5.x

基础组件 (Button, Input) 需通过 src/components/common 进行二次封装后使用。

复杂交互 (Modal, Steps) 可直接使用 AntD。

状态管理: Redux Toolkit (RTK)

所有异步请求必须使用 createAsyncThunk。

Slice 中处理 Loading 和 Error 状态。

代码风格:

Strict Types: 禁止使用 any 类型。

Functional Components: 必须使用 React Hooks。

Scoped Styles: 使用 CSS Modules 或 Styled Components，禁止行内 Style。

5. 生成步骤指南 (Implementation Phases)
AI 在生成代码时，请严格按照以下顺序进行，不要跳跃：

Phase 1: Type Definitions

读取 DB Design PDF，生成 src/types/ 下所有接口文件。

Phase 2: Infrastructure

配置 Axios Client (拦截器)、Redux Store、Mock 开关工具函数。

Phase 3: Mock Services

创建 Service 文件，填入符合 Type 定义的 Mock 数据，实现 Mock/Real 切换逻辑。

Phase 4: Layout & Routes

实现登录页、主布局、路由守卫 (AuthGuard)。

Phase 5: Feature Implementation

实现具体业务模块 (Onboarding, Employee Profile, HR Dashboard)。

确保表单字段校验逻辑与 Requirement 文档一致。