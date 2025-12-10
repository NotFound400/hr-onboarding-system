# 📋 人工验收测试清单 (Manual QA Checklist)

**基准文档**: `doc/raw_project_requirement.md`
**测试目标**: 确保所有功能点严格符合原始需求文档，无遗漏、无超纲。
**测试人**: `__________` | **日期**: `__________`

---

### 🔐 第 0 步：准备测试账号 (Mock Credentials)

✅ **已配置完成！** 以下账号已在 `src/services/api/userApi.ts` 中配置：

| 角色 | 用户名 | 密码 | User ID | Onboarding Status | Visa Type | 用途 |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| **HR Admin** | `admin` | `admin1` | 999 | N/A | N/A | 测试 HR 仪表盘、审批 |
| **老员工 (已转正, OPT)** | `employee` | `123` | 100 | `Approved` | OPT | 测试员工主页、个人信息、**Visa 管理流程** |
| **新员工 (未填表)** | `new_user` | `123` | 200 | `Pending` | N/A | 测试 Onboarding 流程 |

测试TOKEN:
Token: mock-token-abc123
Email: newuser@example.com
有效期: 2025-12-31 23:59:59
跳转链接： http://localhost:5173/register?token=mock-token-abc123  或是 http://localhost:5173/#/register?token=mock-token-abc123

> 📖 详细配置说明请参考: [`doc/MOCK_DATA_CONFIG.md`](./MOCK_DATA_CONFIG.md)

---

### 🚪 1. 注册与登录 (Entry & Auth)
#### 1.1 注册流程 (Registration)
[cite_start]*参考: Section 1* [cite: 58-61]

- [Y] **唯一入口验证**:
    - [Y] 尝试直接访问 `/register`（不带 Token），应报错或跳转登录页。
    - [Y] [cite_start]只有通过 HR 生成的链接（如 `/register?token=xyz`）才能进入 [cite: 59-60]。
- [NA] **账户创建**:
    - [N] [cite_start]必须输入: `Username`, `Password`, `Email` [cite: 61]。
    - [NA] [cite_start]Email 和 Username 必须唯一 [cite: 61]。

#### 1.2 登录流程 (Login)
[cite_start]*参考: Section 2 & HR-1* [cite: 62-64, 336-340]

- [Y] [cite_start]**未登录拦截**: 访问 `/employee/home` 等受保护路由，必须强制跳回 `/login` [cite: 64]。
- [Y] **员工路由**:
    - [Y] [cite_start]员工登录后，必须**重定向到 Personal Information 页面** (`/employee/profile`)，而不是主页 [cite: 63]。
- [Y] **HR 路由**:
    - [Y] [cite_start]HR 登录后，必须**重定向到 HR Home 页面** [cite: 342]。

---

### 📝 2. Onboarding 表单 (Onboarding)

*前置条件: 使用 `New User` 账号登录*
[cite_start]*参考: Section 3* [cite: 65-109]

#### 2.1 个人信息字段逻辑
- [Y] [cite_start]**Email 字段**: 必须预填充注册时的 Email，且**不可编辑** [cite: 80]。
- [N] [cite_start]**头像 (Avatar)**: 如果用户未上传，必须显示**默认图片** [cite: 76-77]。
- [ ] [cite_start]**身份逻辑 (Citizenship Logic)** [cite: 82-88]:
    - [Y] 选择 "Citizen" 或 "Green Card": **不应**显示 Work Authorization 部分。
    - [ ] 选择 "No": 必须显示 Work Auth 下拉框 (H1-B, L2, F1, H4, Other)。
        - [Y] [cite_start]选择 "Other": 必须显示 **Work Auth Type 输入框** + Start Date + End Date [cite: 84]。
        - [Y] [cite_start]选择其他 (如 F1): 显示 Start Date + End Date [cite: 85]。
        - [ ] [cite_start]**强制上传**: 所有非公民必须上传 Work Auth 文件 (EAD, H1B doc 等) [cite: 86-88]。
- [Y] [cite_start]**驾照逻辑 (Driver's License)** [cite: 89-92]:
    - [Y] 选择 "No": 隐藏相关字段。
    - [Y] 选择 "Yes": 显示 License Number, Expiration Date, Upload Copy。
- [Y] [cite_start]**推荐人 (Reference)** [cite: 93-94]:
    - [Y] **数量限制**: 只能填写 **1 个** 推荐人。
    - [Y] **字段完整性**: 必须包含 Name, Phone, **Address**, Email, Relationship。
- [Y] [cite_start]**紧急联系人 (Emergency Contact)** [cite: 95-96]:
    - [Y] **数量要求**: 必须至少填写 **1 个**，允许添加多个。

#### 2.2 文档与提交逻辑
- [IC] **文档页面**:
    - [Y] [cite_start]必须列出所有数字文档 (Digital Documents) [cite: 97]。
    - [ ] [cite_start]**预览**: 点击文档，弹出 `<object>` 预览窗口 [cite: 102]。
    - [N] [cite_start]**下载**: 每个文档必须有下载链接 [cite: 99]。
- [IC] **提交状态**:
    - [Y] [cite_start]点击 Submit 后，页面显示 "Please wait for HR to review..." [cite: 107]。
    - [Y] [cite_start]此时**禁止**访问主页 (Home Page) [cite: 107]。
    - [ ] [cite_start]如果被 HR 拒绝 (Rejected): 用户登录后应能看到错误信息或缺失文件的提示 [cite: 108-109]。

---

### 🏠 3. 员工门户 (Employee Portal)

*前置条件: 使用 `Employee` (Approved) 账号登录*
[cite_start]*参考: Section 4-8* [cite: 110-334]

#### 3.1 导航栏与主页
- [N] [cite_start]**欢迎语**: 主页 Body 必须显示 "Hello [Name], Welcome to BeaconFire" [cite: 120-121]。
- [IC] [cite_start]**导航项** [cite: 112-119]:
    - [Y] Personal Information
    - [Y] Visa Status Management (**仅非公民可见**)
    - [N] Housing
    - [N] House Detail
    - [N] Report Facility Issue
- [N] [cite_start]**Hover 特效**: 鼠标悬停在 "Visa Status Management" 上时，显示 "OPT STEM Management" 链接 [cite: 115-116]。

#### 3.2 个人信息 (Personal Info)
- [ ] [cite_start]**布局检查**: 是否包含 Employment, Contact, Emergency Contact 等板块 [cite: 236-263]。
- [Y] [cite_start]**SSN 显示**: 仅显示**后 4 位** [cite: 242]。
- [IC] [cite_start]**编辑/取消 (Edit/Cancel)** [cite: 264-269]:
    - [IC] 点击 Edit 后，按钮变为 Save 和 Cancel。
    - [IC] 点击 Cancel 时，**必须弹出 Alert**: `"Are you sure to discard all your changes?"` (文案必须完全一致)。
- [N] [cite_start]**文档列表**: 按 `createdDate` **倒序**排列 (最新的在最上面) [cite: 276]。

#### 3.3 Visa 状态管理 (Visa Status)
*前置条件: 账号为 Non-Citizen*
[cite_start]*参考: Section 7* [cite: 277-302]

**🎯 如何触发此流程:**
1. 使用 `employee` / `123` 登录（已配置为 OPT 签证持有者）
2. 登录后，导航栏会显示 "Visa Status Management" 选项
3. 点击进入 Visa Status 页面
4. 页面会显示当前 OPT 签证状态和 4 个文档上传步骤

**✅ 代码位置:** `src/features/employee/pages/VisaStatusPage.tsx` (Lines 207-257)

- [ ] **流程顺序 (Flow)**: 验证以下顺序是否强制执行：
    1.  **Step 1: I-983** (Training Plan for STEM OPT) - 下载并填写
    2.  **Step 2: I-20** (Certificate of Eligibility) - 上传（必需）
    3.  **Step 3: OPT Receipt** - 上传（必需）
    4.  **Step 4: OPT EAD** (Employment Authorization Document) - 上传（必需）
- [ ] [cite_start]**邮件通知**: 每次上传文件后，系统是否发送了确认邮件？[cite: 289-290]。
    - 当前实现：上传成功后显示消息 "XXX uploaded successfully. Email notification sent to HR."

#### 3.4 房屋 (Housing)
[cite_start]*参考: Section 8* [cite: 303-334]

- [ ] [cite_start]**分配机制**: 房屋是系统自动分配的，员工**无法修改** [cite: 304-305]。
- [ ] **室友列表**:
    - [ ] [cite_start]显示室友姓名 (优先显示 Preferred Name) [cite: 311]。
    - [ ] [cite_start]显示室友电话 [cite: 312]。
- [ ] **设施报修 (Facility Reporting)**:
    - [ ] [cite_start]**新建**: 输入 Title 和 Description。默认状态为 `Open` [cite: 317-327]。
    - [ ] [cite_start]**评论**: 员工可以在 Report 下添加评论 [cite: 334]。
    - [ ] [cite_start]**列表**: 显示 Title, Description, Created By, Date, Status [cite: 320-325]。

---

### 👔 4. HR 管理门户 (HR Portal)

*前置条件: 使用 `HR` 账号登录*
[cite_start]*参考: HR Section* [cite: 335-471]

#### 4.1 仪表盘 (Home)
- [Y] [cite_start]**待办事项 (Tracking Table)** [cite: 350-358]:
    - [Y] 是否显示需要 HR 操作的任务 (如 Approve Visa, Review Onboarding)？
    - [Y] 字段: Name, Type of Application, Status, Last Modification Date。

#### 4.2 员工档案 (Employee Profile)
- [Y] [cite_start]**分页显示**: 必须显示当前记录位置，格式为 **`<10/100>`** [cite: 368-370]。
- [Y] [cite_start]**搜索栏** [cite: 372-374]:
    - [Y] 必须支持搜 First Name **或** Last Name **或** Preferred Name。
    - [Y] 测试：搜不到时显示 "No record found"。

#### 4.3 招聘与 Token (Hire)
- [Y] **生成 Token**:
    - [Y] 输入 Email，生成链接。
    - [Y] [cite_start]**有效期**: 默认必须是 **3 小时** [cite: 398]。
- [ ] **审核 Onboarding**:
    - [ ] [cite_start]查看申请时，所有字段必须是 **只读 (Not Editable)** 的 [cite: 406]。
    - [ ] [cite_start]**评论**: 必须能对**每一个**单独的文档添加评论 (不仅仅是整个申请) [cite: 410]。
    - [ ] [cite_start]**拒绝**: 点击 Reject 必须填写 Comment [cite: 418]。
    - [ ] [cite_start]**状态流转**: Approve 后状态变为 `Completed`，允许员工开启下一个申请 (如 OPT) [cite: 416]。

#### 4.4 房屋管理 (House Management)
- [Y] [cite_start]**列表视图** [cite: 429-435]:
    - [Y] 显示 Address, # of Employees, Landlord Info。
- [IC] **详情视图**:
    - [Y] [cite_start]**设施计数**: 显示 Beds, Mattresses, Tables, Chairs 的数量 [cite: 444-447]。
    - [N] [cite_start]**报修列表分页**: **每页只显示 3-5 条报告** (Strict Requirement) [cite: 451]。
    - [N] [cite_start]**报修详情**: 点击报告，弹窗显示详细信息和评论历史 [cite: 453-463]。


---

### 🚦 测试结果记录

| 模块 | 测试状态 | 备注 (Fail Items) |
| :--- | :--- | :--- |
| **Auth** | [ ] Pass / [ ] Fail | |
| **Onboarding** | [ ] Pass / [ ] Fail | |
| **Employee Portal** | [ ] Pass / [ ] Fail | |
| **HR Portal** | [ ] Pass / [ ] Fail | |