 Bug 有效性仲裁报告 (Validity Verification Report)
#	问题点 (Issue)	判定 (Verdict)	原始依据 (Evidence)	严重程度 (Severity)
1	Auth - 注册: 注册页缺失 Username 字段	✅ VALID	Section 1, Line 6: "Users must provide a password, unique username, and unique email address (it does not necessarily need to be real)."<br><br>文档明确要求注册时必须提供 username、password 和 email 三个字段。	High
2	Onboarding - 头像: 未上传时缺失默认图片显示	✅ VALID	Section 3.c.ii, Line 21: "Avatar (should have a default picture if the user does not upload one)"<br><br>文档明确要求如果用户未上传头像，必须显示默认图片。	Medium
3a	Onboarding - 文档: 缺失下载链接	✅ VALID	Section 3.d.ii, Line 41: "Each document must have a download link."<br><br>文档明确要求每个文档必须有下载链接。	Medium
3b	Onboarding - 文档: 被拒绝后登录无法看到错误提示	✅ VALID	Section 3.e.iii, Lines 48-49: "If rejected, an email must be sent to the user. The user should be able to log in and see what is wrong or which document is missing."<br><br>文档明确要求被拒绝后，用户登录时应能看到错误信息或缺失文档的提示。	High
4	Employee - 主页: Body 缺失欢迎语 "Hello [Name]..."	✅ VALID	Section 4, Lines 56-57: "The body of the home page should display a welcome message (e.g., 'Hello Zack, Welcome to BeaconFire')."<br><br>文档明确要求主页 Body 必须显示欢迎语，并提供了具体示例格式。	Low
5a	Employee - 导航: Housing, House Detail, Report Issue 混淆在同一页	⚠️ AMBIGUOUS	Section 4, Lines 52-55: 导航栏列出了三个独立项目：<br>• "c. Housing"<br>• "d. House Detail"<br>• "e. Report Facility Issue"<br><br>但 Section 8 实现描述中：<br>• 8.a 讲 Housing (只读查看)<br>• 8.b 讲 House Detail Page (查看详情)<br>• 8.c 讲 Facility Reporting Page (报修)<br><br>文档在导航栏要求 3 个独立菜单项，但在实现描述中它们是同一个 Housing 功能的子页面。需产品经理明确是否应该是 3 个独立路由还是嵌套路由。	Medium
5b	Employee - 导航: Visa 菜单缺失 Hover 显示 "OPT STEM" 效果	✅ VALID	Section 4.b, Lines 53-54: "Visa Status Management (only if the user is NOT a citizen or green card holder)<br>– When hovering over it, show a link to OPT STEM Management"<br><br>文档明确要求 Visa Status Management 菜单在鼠标悬停时必须显示 "OPT STEM Management" 链接。	Low
6	Employee - 个人信息: Employment/Contact 等板块缺失 Edit/Save/Cancel 交互	✅ VALID	Section 6(c), Lines 105-107: "Each section should have an Edit button.<br>• When clicked, it should be replaced by Save and Cancel buttons.<br>• If the user clicks Cancel, an alert should appear: 'Are you sure to discard all your changes?'"<br><br>文档明确要求 "Each section"（每个板块） 都应该有 Edit 按钮，包括 Name、Address、Contact Info、Employment、Emergency Contact 等所有板块。	High
7	Employee - Visa: 流程顺序 (I-983 → I-20 → Receipt → EAD) 未强制执行	⚠️ AMBIGUOUS	Section 7.b, Lines 125-128: 文档列出了 4 个步骤：<br>i. (DOWNLOAD) I-983<br>ii. (UPLOAD) I-20<br>iii. (UPLOAD) OPT STEM Receipt<br>iv. (UPLOAD) OPT STEM EAD<br><br>但文档仅描述了顺序关系（例如 "After submitting the I-983 to the school, the student will receive a new I-20"），并未明确说明系统必须技术上强制执行这个顺序（即禁止用户跳步上传）。<br><br>这更像是业务流程的自然顺序，而非技术限制。需产品经理明确是否需要前端强制校验步骤顺序。	Medium
8	Employee - Housing: 页面结构不正确，需确认只读	⚠️ AMBIGUOUS	Section 8.a, Lines 151-152: "Employees can only view the details about the house, but cannot change the house assigned to them."<br><br>文档明确要求员工只能查看房屋信息，不能修改。但问题描述 "页面结构似乎不正确" 过于模糊，无法判定具体 Bug。需提供具体的页面行为描述才能仲裁。	N/A
9	HR - Hire: 缺失 "Application Review" (审核 Onboarding) 模块	✅ VALID	Section HR-5.b, Lines 275-305: 文档详细描述了 Application Review 功能：<br>• "HR should review employees' onboarding applications"<br>• "Form Application: All fields not editable, all fields populated"<br>• "Supporting Documentation: view each document and add comments"<br>• "HR may Approve or Reject an application"<br>• "HR should be able to view all ongoing onboarding applications"<br><br>这是一个完整的功能模块，必须实现。	High
10	HR - House: 详情页缺失 Facility Report 分页 (3-5条/页) 和弹窗逻辑	✅ VALID	Section HR-6.c.iii, Lines 343-344: "Display all facility reports with Title + Date + Status format.<br>Only 3–5 reports per page."<br><br>Lines 347-357: "Clicking a report shows details:<br>a. Title<br>b. Description<br>c. Created By<br>d. Report Date<br>e. Status<br>f. If applicable, comments"<br><br>文档明确要求 Facility Report 列表必须分页（每页 3-5 条），并且点击报告时必须显示详情（包括评论历史）。	High
📌 仲裁总结 (Summary)
✅ 确认为有效 Bug (8 个):
注册页缺失 Username 字段
Onboarding 头像缺失默认图片
Onboarding 文档缺失下载链接
Onboarding 被拒绝后无错误提示
员工主页缺失欢迎语
Visa 菜单缺失 Hover 效果
个人信息板块缺失统一的 Edit 交互
HR Hire 缺失 Application Review 模块
HR House 缺失 Facility Report 分页和详情弹窗
⚠️ 需进一步明确 (2 个):
Housing 导航结构: 文档在导航栏要求 3 个独立项，但描述中更像子页面关系
Visa 流程强制顺序: 文档描述了业务顺序，但未明确是否需要技术强制校验
建议优先级 (Priority):
P0 (Critical): Issue #1, #3b, #6, #9
P1 (High): Issue #10
P2 (Medium): Issue #2, #3a, #5a, #7
P3 (Low): Issue #4, #5b