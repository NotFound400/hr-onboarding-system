# 🗂️ Mock 数据配置说明

> **版本**: v1.0  
> **最后更新**: 2024-12-09  
> **用途**: 支持人工验收测试清单 (Manual_QA_Checklist.md)

---

## 📋 测试账号总览

按照 QA 清单要求配置的三个标准测试账号：

| 角色 | 用户名 | 密码 | User ID | Onboarding Status | 用途说明 |
|:---|:---|:---|:---:|:---:|:---|
| **HR Admin** | `admin` | `admin1` | 999 | N/A | 测试 HR 仪表盘、审批流程、员工管理 |
| **老员工** | `employee` | `123` | 100 | `Approved` | 测试员工门户、个人信息、Visa、房屋 |
| **新员工** | `new_user` | `123` | 200 | `Pending` | 测试 Onboarding 流程、表单提交 |

---

## 🔐 账号详细配置

### 1. admin (HR 管理员)
- **文件位置**: `src/services/api/userApi.ts`
- **User ID**: 999
- **角色**: `HR`
- **权限**: 
  - 访问所有 HR 页面 (`/hr/*`)
  - 生成注册 Token
  - 审批 Onboarding 申请
  - 管理员工档案
  - 管理房屋信息
- **登录后跳转**: `/hr/home`

### 2. employee (已批准员工)
- **文件位置**: 
  - User: `src/services/api/userApi.ts` (userID=100)
  - Employee: `src/services/api/employeeApi.ts` (MOCK_EMPLOYEE_APPROVED)
  - Application: `src/services/api/applicationApi.ts` (applicationId=100)
- **User ID**: 100
- **Employee ID**: `507f1f77bcf86cd799439100` (MongoDB ObjectId)
- **角色**: `Employee`
- **Onboarding Status**: `Approved` (2024-01-15 批准)
- **个人信息**:
  ```typescript
  {
    firstName: 'Emily',
    lastName: 'Johnson',
    middleName: 'Rose',
    preferredName: 'Em',
    email: 'employee@company.com',
    cellPhone: '555-123-4567',
    SSN: '987-65-4321',
    DOB: '1992-05-20',
    gender: 'Female',
    visaType: 'Citizen',
    houseID: 1, // 分配到 House #1
  }
  ```
- **房屋信息**: House #1 (123 Main Street), 与 Alice Wang, Bob Smith 同住
- **登录后跳转**: `/employee/personal-info` (per Section 2.a)
- **可访问页面**:
  - Personal Information
  - ~~Visa Status Management~~ (公民身份不显示此菜单)
  - Housing
  - Report Facility Issue

### 3. new_user (待入职新员工)
- **文件位置**: 
  - User: `src/services/api/userApi.ts` (userID=200)
  - Application: `src/services/api/applicationApi.ts` (applicationId=200)
- **User ID**: 200
- **Employee ID**: 未创建 (需填写 Onboarding 表单后生成)
- **角色**: `Employee`
- **Onboarding Status**: `Pending` (2024-12-01 创建，等待填表)
- **Application**:
  ```typescript
  {
    id: 200,
    employeeId: '200',
    type: 'Onboarding',
    status: 'Pending',
    comment: 'Waiting for employee to submit onboarding form',
  }
  ```
- **登录后跳转**: `/onboarding/form` (Section 3.b)
- **测试场景**:
  - 填写完整 Onboarding 表单
  - 测试 Email 只读 (预填充 `newuser@company.com`)
  - 测试 Citizen/Non-Citizen 身份逻辑
  - 测试驾照条件显示
  - 测试 Reference 和 Emergency Contact
  - 提交后看到 "Please wait for HR to review" (Section 3.e.i)

---

## 🏠 房屋数据配置

### House #1 (分配给 employee 账号)
- **ID**: 1
- **地址**: `123 Main Street, City, State 12345`
- **最大入住人数**: 4
- **当前入住人数**: 3
- **房东**: John Doe (123-456-7890)
- **室友列表**:
  1. **Em** (Emily Johnson, employee 账号, employeeId=100) - 555-123-4567
  2. **Alice Wang** (employeeId=1) - 111-222-3333
  3. **Bob Smith** (employeeId=2) - 444-555-6666
- **设施**:
  - Bed: 4 张
  - Mattress: 4 张
  - Table: 2 张
  - Chair: 6 把
- **报修工单** (3 条):
  - #1: Broken bed frame (Open)
  - #2: Leaking faucet (In Progress)
  - #3: Broken chair (Closed)

### House #2
- **ID**: 2
- **地址**: `456 Oak Avenue, City, State 12345`
- **最大入住人数**: 6
- **当前入住人数**: 4
- **房东**: Jane Smith (098-765-4321)

---

## 📄 Application 数据配置

### Onboarding Applications
1. **applicationId=200** (new_user) - `Pending` ⏳
2. **applicationId=100** (employee) - `Approved` ✅ (2024-01-15 批准)
3. **applicationId=1** (John Doe) - `Pending`
4. **applicationId=2** (Alice Johnson) - `Approved`
5. **applicationId=3** (Bob Smith) - `Rejected`

### OPT/Visa Applications
- **applicationId=4** (Chen Wei) - OPT `Pending`
- **applicationId=5** (Maria Garcia) - OPT `Approved`

---

## 🧪 QA 测试流程

### 测试流程 1: HR 管理员功能
1. 登录: `admin` / `admin1`
2. 验证跳转到 `/hr/home`
3. 查看 Application Tracking Table (应有 Pending 申请)
4. 测试生成 Registration Token (默认 3 小时有效期)
5. 测试审批 new_user 的 Onboarding 申请
6. 测试搜索员工 (First Name: Emily, Last Name: Johnson, Preferred Name: Em)
7. 测试房屋管理 (Add/Delete House)

### 测试流程 2: 已批准员工功能
1. 登录: `employee` / `123`
2. 验证跳转到 `/employee/personal-info`
3. 验证导航菜单**不显示** "Visa Status Management" (因为是 Citizen)
4. 测试编辑个人信息，点击 Cancel 时弹出确认框: "Are you sure to discard all your changes?"
5. 测试查看房屋信息 (应显示 House #1, 3 个室友)
6. 测试提交 Facility Report
7. 测试添加 Report 评论

### 测试流程 3: 新员工 Onboarding
1. 登录: `new_user` / `123`
2. 验证跳转到 `/onboarding/form`
3. 验证 Email 只读 (预填充 `newuser@company.com`)
4. 测试 Citizen 逻辑:
   - 选择 "Citizen" → 不显示 Work Auth 下拉框
5. 测试 Non-Citizen 逻辑:
   - 选择 "No" → 显示 Work Auth 下拉框 (H1-B, L2, F1, etc.)
   - 选择 "Other" → 显示额外的 Title, Start Date, End Date 输入框
   - 必须上传 Work Auth 文件
6. 测试驾照逻辑:
   - 选择 "Yes" → 显示驾照号码、过期日、上传按钮
7. 测试 Reference (只能填 1 个人，必须包含 Address, Relationship)
8. 测试 Emergency Contact (至少 1 个)
9. 提交表单后验证显示 "Please wait for HR to review"
10. 验证提交后无法通过 URL 访问 `/employee/home` (应被拦截)

---

## 🔍 数据查找说明

### 根据 User ID 查找对应数据

| User ID | Username | Employee ID | House ID | Application ID |
|:---:|:---:|:---:|:---:|:---:|
| 999 | admin | N/A (HR 无 Employee 记录) | N/A | N/A |
| 100 | employee | 507f1f77bcf86cd799439100 | 1 | 100 |
| 200 | new_user | 未创建 | 未分配 | 200 |
| 1 | (legacy) | 507f1f77bcf86cd799439011 | 1 | 1 |

### 登录流程跳转逻辑 (LoginPage.tsx)

```typescript
// 1. HR 用户直接跳转
if (role === 'HR') {
  navigate('/hr/home');
}

// 2. Employee 用户检查 Onboarding 状态
const employee = await getEmployeeByUserId(user.id);
const applications = await getApplicationsByEmployeeId(employee.id);
const onboardingApp = applications.find(app => app.type === 'Onboarding');

if (!onboardingApp) {
  navigate('/onboarding/form'); // 无申请记录 → 填表
} else if (onboardingApp.status === 'Approved') {
  navigate('/employee/personal-info'); // 已批准 → 员工门户
} else {
  navigate('/onboarding/form'); // Pending/Rejected → 填表/修改
}
```

---

## 📝 Mock 数据文件清单

| 文件 | 内容 | 相关账号 |
|:---|:---|:---|
| `userApi.ts` | 用户登录凭证、Token 生成 | admin, employee, new_user |
| `employeeApi.ts` | Employee 详细信息 | employee (MOCK_EMPLOYEE_APPROVED) |
| `applicationApi.ts` | Onboarding/OPT 申请记录 | employee (已批准), new_user (待处理) |
| `housingApi.ts` | 房屋、房东、设施、报修工单 | House #1 分配给 employee |

---

## ⚠️ 注意事项

1. **Email 预填充**: new_user 登录后，Onboarding 表单的 Email 字段应预填充为 `newuser@company.com` 且不可编辑 (Section 3.c.v)
2. **Visa 菜单隐藏**: employee 是 Citizen，导航菜单中**不应显示** "Visa Status Management" (Section 4.a)
3. **Cancel 确认框**: 编辑个人信息时点击 Cancel，必须弹出确认框，文案严格匹配: **"Are you sure to discard all your changes?"** (Section 6.c)
4. **Room mate 显示**: 房屋页面优先显示 "Preferred Name" (Em)，没有则显示 "First Name" (Section 8.b.ii)
5. **Token 有效期**: HR 生成 Token 默认 3 小时 (Section HR.5.a.ii)
6. **报修分页**: 房屋详情页的 Facility Report 列表每页显示 **3-5 条** (Section HR.6.c.iii)
7. **员工分页显示**: HR 查看员工档案时，必须显示 `<当前页/总页数>` 格式 (Section HR.3.a.ii)

---

## 🚀 快速验证命令

```bash
# 1. 检查所有测试账号是否配置正确
grep -n "admin\|employee\|new_user" src/services/api/userApi.ts

# 2. 检查 Employee Mock 数据
grep -n "MOCK_EMPLOYEE_APPROVED" src/services/api/employeeApi.ts

# 3. 检查 Application 状态
grep -n "status: 'Approved'\|status: 'Pending'" src/services/api/applicationApi.ts

# 4. 检查房屋分配
grep -n "houseID: 1" src/services/api/employeeApi.ts
grep -n "employeeId: 100" src/services/api/housingApi.ts
```

---

**配置完成！** 🎉 现在可以使用 QA 清单进行完整的人工验收测试。
