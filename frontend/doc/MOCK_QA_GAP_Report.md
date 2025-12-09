### 🚪 1. 注册与登录 (Entry & Auth)
#### 1.1 注册 (Registration)
[cite_start]*参考: Section 1* [cite: 58-61]
- **字段验证**: 注册页缺失 `Username`

### 📝 2. Onboarding 表单 (Onboarding)
#### 2.1 个人信息字段逻辑
2. Onboarding 表单 (Onboarding)
- [N] [cite_start]**头像 (Avatar)**: 如果用户未上传，必须显示**默认图片** [cite: 76-77]。

#### 2.2 文档与提交逻辑
- **文档页面**:
    [IC] [cite_start]**下载**: 每个文档必须有下载链接 [cite: 99]。
    [ ] [cite_start]如果被 HR 拒绝 (Rejected): 用户登录后应能看到错误信息或缺失文件的提示 [cite: 108-109]。

### 🏠 3. 员工门户 (Employee Portal)
- [cite_start]**欢迎语**: 主页 Body 必须显示 "Hello [Name], Welcome to BeaconFire" [cite: 120-121]。
#### 3.1 导航栏与主页
  [cite_start]**导航项** [cite: 112-119]:
    Housing, House Detail, Report Facility Issue Appear to be same page

**Hover 特效**: 鼠标悬停在 "Visa Status Management" 上时，显示 "OPT STEM Management" 链接 [cite: 115-116]。

#### 3.2 个人信息 (Personal Info)
Employment, Contact, Emergency Contact 等板块 [cite: 236-263]。都需要添加Edit, 逻辑和 Name板块保持一致

#### 3.3 Visa 状态管理 (Visa Status)
**流程顺序 (Flow)** 顺序并未强制执行：
    1.  **Step 1: I-983** (Training Plan for STEM OPT) - 下载并填写
    2.  **Step 2: I-20** (Certificate of Eligibility) - 上传（必需）
    3.  **Step 3: OPT Receipt** - 上传（必需）
    4.  **Step 4: OPT EAD** (Employment Authorization Document) - 上传（必需）

#### 3.4 房屋 (Housing)
房屋页面似乎不正确，需要满足：
6. House Management

a. HR should be able to view, add, and delete house properties belonging to the company.

b. View
i. HR should be able to view all houses with the following details:

Address

Number of employees in the house

Landlord Information:
 a. Legal Full Name
 b. Phone
 c. Email

c. House Detail View
i. Basic House Information:

Address

Landlord Name, Phone, Email

Number of people living there

ii. Facility Information:

Number of Beds

Number of Mattresses

Number of Tables

Number of Chairs

iii. Facility Report (List View)

Display all facility reports with Title + Date + Status format.

Only 3–5 reports per page.

Reports sorted by created date.

Clicking a report shows details:
 a. Title
 b. Description
 c. Created By
 d. Report Date
 e. Status (Open, In Progress, Closed)
  i. Include timestamp of when created
 f. If applicable, comments:
  i. Description
  ii. Created By
  iii. Comment Date (created date or last modification date)

iv. HR may add or update comments they created.

d. Employee Information (List)
i. Name (Preferred Name if present, else First Name)
ii. Phone
iii. Email
iv. Clicking an employee redirects to their Employee Profile page.


### 👔 4. HR 管理门户 (HR Portal)
#### 4.3 招聘与 Token (Hire)
- **审核 Onboarding** 模块不存在或有误

#### 4.4 房屋管理 (House Management)
 **详情视图**: 不完全
    - **报修列表分页**: **每页只显示 3-5 条报告** (Strict Requirement) [cite: 451]。
    - **报修详情**: 点击报告，弹窗显示详细信息和评论历史 [cite: 453-463]。




