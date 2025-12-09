# 📋 人工验收测试清单 (Manual QA Checklist)

**基准文档**: `doc/raw_project_requirement.md`
**测试目标**: 确保所有功能点严格符合原始需求文档，无遗漏、无超纲。
**测试人**: `__________` | **日期**: `__________`

---

### 🔐 第 0 步：准备测试账号 (Mock Credentials)

请确保 `src/services/api/authApi.ts` 中包含以下账号数据：

| 角色 | 用户名 | 密码 | Onboarding Status | 用途 |
| :--- | :--- | :--- | :--- | :--- |
| **HR Admin** | `hr` | `123` | N/A | 测试 HR 仪表盘、审批 |
| **老员工 (已转正)** | `employee` | `123` | `Approved` | 测试员工主页、个人信息、Visa |
| **新员工 (未填表)** | `new_user` | `123` | `Pending` | 测试 Onboarding 流程 |

---

### 🏗️ 第一部分：公共与入口 (Entry & Auth)

#### 1.1 注册 (Registration)
[cite_start]*参考: Section 1* [cite: 58-61]

- [ ] **Token 拦截**: 尝试不带 Token 访问 `/register`，应被拦截或报错 (Token 是唯一途径)。
- [ ] **字段验证**: 注册页必须包含 `Email`, `Username`, `Password`。

#### 1.2 登录 (Login)
[cite_start]*参考: Section 2 & HR Section 1* [cite: 62-64, 336-340]

- [ ] **权限拦截**: 未登录访问受保护页面（如 `/employee/home`），必须强制重定向回 `/login`。
- [ ] **员工跳转**: 使用 `employee` (已批准) 登录，必须重定向到 **Personal Information** 页。
- [ ] **HR 跳转**: 使用 `hr` 登录，必须重定向到 **HR Home** 页。

---

### 📝 第二部分：Onboarding 流程 (New Hire)

*前置条件: 使用 `new_user` 登录*
[cite_start]*参考: Section 3* [cite: 65-109]

#### 2.1 表单字段逻辑
- [ ] **Email 只读**: 邮箱必须预填充且**不可编辑**。
- [ ] **身份逻辑 (Citizen)**:
    - [ ] 选择 "Citizen" 或 "Green Card" 时，**不应**出现 Work Auth 下拉框。
- [ ] **身份逻辑 (Non-Citizen)**:
    - [ ] 选择 "No" 时，必须出现 Work Auth 下拉框 (H1-B, L2, F1, etc.)。
    - [ ] 选择 "Other" 时，必须出现额外的 Title, Start Date, End Date 输入框。
    - [ ] 无论何种 Non-Citizen，都必须上传 Work Auth 文件。
- [ ] **驾照逻辑**:
    - [ ] 只有选择 "Yes" 时，才显示驾照号码、过期日和上传按钮。
- [ ] **Reference**: 必须包含 Address, Relationship 字段，且只能填 **1** 个人。
- [ ] **Emergency Contact**: 必须允许添加 **至少 1 个** 联系人。

#### 2.2 文档与提交
- [ ] **预览功能**: 点击文档列表中的文件，必须弹出 `<object>` 预览窗口。
- [ ] **下载功能**: 每个文档旁必须有下载链接/按钮。
- [ ] **提交锁定**: 提交成功后，页面应显示 "Please wait for HR to review"，且**无法**通过修改 URL 进入主页。

---

### 👤 第三部分：员工门户 (Employee Portal)

*前置条件: 使用 `employee` (Approved) 登录*
[cite_start]*参考: Section 4 - 8* [cite: 110-334]

#### 3.1 导航与主页
- [ ] **导航菜单**: 必须包含 `Personal Information`, `Visa Status Management`, `Housing`, `Report Facility Issue` (如适用)。
- [ ] **Visa 菜单隐身**: 将 Mock 数据的 Citizenship 改为 "Citizen" 后刷新，**不应**看到 "Visa Status Management" 菜单。
- [ ] **Hover 效果**: 鼠标悬停在 Visa 菜单上时，应显示 "OPT STEM Management" 链接。

#### 3.2 个人信息 (Personal Information)
- [ ] **信息完整性**: 必须显示 SSN (后4位), Avatar, Employment Dates。
- [ ] **编辑保护**: 点击 `Edit` -> 修改数据 -> 点击 `Cancel`。
    - [ ] 必须弹出 Confirm 框，文案严格匹配: **"Are you sure to discard all your changes?"**
    - [ ] 确认取消后，数据必须回滚到修改前的状态。

#### 3.3 Visa 管理 (Visa Status)
- [ ] **流程顺序验证**:
    - [ ] 未上传 I-983 时，无法上传 I-20。
    - [ ] 未上传 I-20 时，无法上传 OPT Receipt。
    - [ ] 必须严格遵循 `I-983 -> I-20 -> Receipt -> EAD` 的顺序。
- [ ] **历史记录**: 页面底部必须有文档列表，按 `createdDate` **倒序**排列。

#### 3.4 房屋 (Housing)
- [ ] **只读限制**: 房屋地址、室友信息必须可见但**不可修改**。
- [ ] **室友显示**: 优先显示 "Preferred Name"，没有则显示 "First Name"。
- [ ] **报修 (Report)**: 能提交 Title 和 Description。
- [ ] **评论**: 在已有的 Report 下，员工可以添加评论。

---

### 👔 第四部分：HR 管理门户 (HR Portal)

*前置条件: 使用 `hr` 登录*
[cite_start]*参考: HR Section* [cite: 335-471]

#### 4.1 员工档案 (Employee Profiles)
- [ ] **分页格式**: 列表顶部必须显示 `<当前页/总页数>` (例如 `<10/100>`)。
- [ ] **搜索功能**:
    - [ ] 支持输入 First Name。
    - [ ] 支持输入 Last Name。
    - [ ] 支持输入 Preferred Name。
    - [ ] 搜索不存在的名字时，显示 "No record found"。

#### 4.2 招聘与 Token (Hire)
- [ ] **生成 Token**: 输入 Email 点击生成，Token 默认有效期应为 **3 小时**。
- [ ] **审核模式**: 点击 Onboarding 申请查看详情时，所有表单字段必须**不可编辑**。
- [ ] **文档评论**: 必须能对**每一个**单独的文档添加评论。
- [ ] **拒绝逻辑**: 点击 Reject 按钮时，必须强制要求填写 Comment (拒绝理由)。

#### 4.3 房屋管理 (House Management)
- [ ] **管理功能**: 必须有 "Add House" 和 "Delete House" 按钮。
- [ ] **详情视图**: 点击房屋，需显示 Facility 详情 (床/桌/椅数量)。
- [ ] **报修分页**: 房屋详情页内的 Facility Report 列表，每页只应显示 **3 - 5 条**。

---

### 🚦 测试结果记录

| 模块 | 测试状态 | 备注 (Fail Items) |
| :--- | :--- | :--- |
| **Auth** | [ ] Pass / [ ] Fail | |
| **Onboarding** | [ ] Pass / [ ] Fail | |
| **Employee Portal** | [ ] Pass / [ ] Fail | |
| **HR Portal** | [ ] Pass / [ ] Fail | |