frontend_spec.md

前端总体规范（React + Ant Design + Redux + 路由 + 页面跳转逻辑）

本规范文件整合全部前端需求，包括技术栈、页面结构、目录结构、状态管理设计、跳转逻辑、校验规则、动态字段逻辑、评论机制、HR 管理扩展能力等，用作后续自动化生成代码的唯一依据。

目录（Table of Contents）

技术栈与总体约定

UI 组件与样式规范

Redux 状态管理规范

页面结构与功能规范
 4.1 公共页面
 4.2 Onboarding（含新增校验与 token 逻辑）
 4.3 员工端页面（含动态菜单规则与邮件通知逻辑）
 4.4 HR 端页面（含文档级评论、申请级评论、新增删除房屋）

路由跳转规范

完整项目目录结构（包含全部子结构）

命名规范

新增补充内容汇总（追踪变更用）

1. 技术栈与总体约定
框架：React 
React 版本（与 package.json 中 "react"、"react-dom" 保持一致）

UI：Ant Design

路由：React Router v6+

状态：Redux Toolkit（必须 asyncThunk）

接口封装：services/api

文档预览统一：Modal + <object>

表单统一使用 AntD Form

表格统一使用 AntD Table

所有页面必须严格按规范字段、校验与跳转规则实现

2. UI 组件与样式规范
2.1 Ant Design 使用规则

基础组件使用规范（业务代码层）
- 业务代码（`src/features/**`）中，按钮、输入框、表单、表格等基础组件必须通过 `components/common` 引入，如 `AppButton`、`AppInput`、`AppTable`、`AppForm`。
- 业务代码中禁止直接从 `antd` 引入 `Button`、`Input`、`Form`、`Table` 等基础组件。

封装层使用规范（`components/common` 层）
- `components/common/*` 内部允许直接使用 `antd` 组件来实现封装。
- 封装组件应尽量保持“薄封装”，优先透传 `antd` 原有的 props，而不是重新设计一套 props。

特殊 / 复杂组件使用规范
- 对于使用频率较低或较复杂的组件（如 `Tree`、`Upload.Dragger` 等），可以按需：
  - 在业务代码中直接从 `antd` 引入，或
  - 在 `components/common` 中增加单独封装组件。
- 是否封装复杂组件视项目规模逐步扩展，不强制一次性全部封装。

交互与流程组件规范
- 全局调用类方法（如 `Modal.confirm`、`message`、`notification`）可以在业务代码中直接使用，也可封装后使用。
- 弹窗使用 `Modal` 或 `Modal.confirm`。
- 多步流程使用 `Steps` 或 `Timeline`。

2.2 样式规范

全局样式：styles/global.css

全站主题：config/theme.ts

使用局部 CSS/Less，不得引入其它 UI 库

3. Redux 状态管理规范
3.1 必须管理的状态模块

Auth

User

Onboarding

Visa

Housing

FacilityIssue

HR

3.2 Redux 规则

异步请求统一在 slice 中，不放在组件中

必须使用 Redux Toolkit（RTK）

3.3 Redux + 路由

登录成功后根据 onboardingStatus 或角色跳转

HR 列表返回应恢复过滤条件与分页

4. 页面结构与功能规范 (Updated Sections)
4.1 公共页面
LoginPage

登录后跳转：

员工且未完成 onboarding → /onboarding/form

员工已完成 onboarding → /employee/home

HR → /hr/home

文档预览与下载


预览：使用 <object> 预览 PDF、图片等文档 。


下载：所有文档列表项必须提供显式的 下载（Download） 按钮或链接 。

4.2 Onboarding 流程（包含补充关键点）
RegistrationPage

必须通过带 token 的 URL 打开

token 校验失败 → 显示错误 Result + 返回登录

token 有效期显示（HR 生成 token 时定义）

设置密码成功 → /onboarding/form

OnboardingFormPage（新增要求）

分段表单

基于工作授权类型动态展示/必填字段

若选择“有驾照”，必须填写驾照相关字段


Reference（推荐人）板块（必填）：需包含姓名、电话、邮箱、关系 。

紧急联系人必须至少 1 条

保存并继续 → /onboarding/docs

OnboardingDocsPage

上传文档列表

所有必填文档上传后方可提交

每份文档都必须提供 HR 的逐条评论入口（评论 Modal）

“提交申请” → /onboarding/submit-result

OnboardingSubmitResultPage

说明等待 HR 审核

需要提示：审核结果将通过邮件通知员工

4.3 员工端页面（包含补充规则）
EmployeeHomePage


欢迎语区域：显示 "Welcome, [Name]"，支持自定义欢迎消息或 Quick Links 。


基础主页布局

PersonalInfoPage

可编辑卡片（Edit 模式切换）

取消编辑（Cancel）：

点击 Cancel 时必须弹出确认框 (Modal.confirm)


文案必须严格匹配："Are you sure to discard all your changes?" 。

VisaStatusPage

OPT / STEM OPT 多步骤上传

上传记录逆序

上传后必须提示：“已发送邮件给 HR”

仅非 Citizen/Green Card 显示本菜单

HousingPage / HouseDetailPage

展示员工房屋信息、室友列表等

FacilityIssuePage

报修表单

报修列表

记录评论 Drawer / Collapse

4.4 HR 端页面（含文档级评论、申请级评论、房屋增删扩展）
HrHomePage

Application Tracking 表格

EmployeeProfilePage

搜索功能完善：

支持按 Name (First/Last/Preferred) 搜索 。


结果状态处理：明确处理“无结果 (No record found)”、“单条结果”、“多条结果”三种状态的 UI 展示 。

员工详情显示

VisaManagementPage

Approve / Reject

Reject → 必须填写拒绝原因

审批完成后需提示：已发送邮件给员工

Hire 模块

HireTokenPage

Token 有效期展示（默认 3 小时）

生成后 message.success

HireApplicationListPage

onboarding 申请列表

HireApplicationDetailPage

左侧：只读表单

右侧：文档列表

文档级评论（每条文档一个 comment Modal）

申请级评论（单独一个整体文本域）

Approve / Reject（Reject → 原因 Modal）

House 管理模块

HouseManagementPage

房屋列表（Table）

新增房屋按钮 → Modal 表单

删除房屋按钮 → Modal.confirm

点击行 → /hr/houses/:id

HouseDetailManagementPage

房屋信息、设施信息

报修记录 + 详情 Modal

员工列表可跳转到员工档案

5. 路由跳转规范
5.1 基本规则

未登录访问受保护页面 → /login?redirect=xxx

登录后：

员工未完成 onboarding → onboarding 流程

员工完成 onboarding → /employee/home

HR → /hr/home

5.2 onboarding 路由（含补充）
页面	动作	跳转
Registration	设置密码成功	/onboarding/form
Form	保存并继续	/onboarding/docs
Docs	提交	/onboarding/submit-result
SubmitResult	返回	/login

审核后跳转逻辑：

通过 → 员工登录进入 /employee/home

拒绝 → 员工登录进入 /onboarding/form 并展示拒绝原因

6. 完整项目目录结构（含全部子目录）
root/
  .env                        <-- 环境变量
  
  doc/                        <-- 文档与规则中心 (AI Context)
    ai_rules.md               <-- 核心：AI 生成规范与 API 契约
    frontend_requirement.md   <-- 核心：业务逻辑与页面流程
    Team_Project_DB_Design.md <-- 核心：数据结构定义
    P3-2-Team_Project_DB_Design.pdf
    API_SERVICE_LAYER.md
    HousingDTO.md
    INFRASTRUCTURE_CHECK.md
    TYPE_DEFINITIONS_CHECK.md

  src/
    assets/
    
    components/               <-- (待创建) 公共组件
      common/                 <-- 基础封装 (AppButton, AppInput 等)
      document/               <-- 文档列表/预览组件
      layout/                 <-- 布局组件 (MainLayout, AuthLayout)

    features/                 <-- (待创建) 业务模块
      auth/
      onboarding/
      employee/
      hr/

    services/
      api/
        axiosClient.ts        <-- 拦截器配置
        applicationApi.ts
        employeeApi.ts
        housingApi.ts
        userApi.ts
        index.ts              <-- Barrel export

    store/
      hooks.ts                <-- useAppDispatch, useAppSelector
      index.ts                <-- Redux Store 配置
      slices/                 <-- (待创建) Redux Slices

    types/
      application.ts
      employee.ts
      housing.ts
      user.ts
      request.ts              <-- Request DTOs
      response.ts             <-- ApiResponse Wrapper
      enums.ts                <-- 独立枚举定义
      index.ts                <-- Barrel export

    utils/
      mockUtils.ts            <-- Mock 延迟与开关逻辑
      validators.ts           <-- (待创建)
      formatDate.ts           <-- (待创建)

    App.css
    App.tsx                   <-- 主应用入口
    index.css
    main.tsx                  <-- Vite 入口
    vite-env.d.ts

7. 命名规范

组件：PascalCase

hooks：useXxx

Slice：xxxSlice.ts

目录：feature-first
