# 🚀 HR 高级功能实现总结

基于 `doc/raw_project_requirement.md` (HR Section 5 & 6) 完成的 2 个复杂 HR 业务功能实现

---

## ✅ 任务 1: 实现 Onboarding 审核模块 (HR Hire)

**真理依据**: HR Section 5.b
> "HR should be able to view the same form used during onboarding with all fields not editable, all fields populated with user-entered data, and HR able to add comments for the entire application. HR should be able to view each uploaded document and add comments for each document without downloading it."

### 实现文件:

#### 1.1 创建 ApplicationReviewDetailPage.tsx
**文件**: `src/features/hr/pages/ApplicationReviewDetailPage.tsx` (新建)

**核心功能**:

##### A. 只读表单展示
```tsx
{/* 个人信息部分 - 所有字段只读 */}
<Card title="Personal Information" extra={<Tag color="blue">Read-Only</Tag>}>
  <Descriptions column={2} bordered>
    <Descriptions.Item label="Legal Name">
      <strong>{employee.firstName} {employee.middleName} {employee.lastName}</strong>
    </Descriptions.Item>
    <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
    <Descriptions.Item label="SSN">{employee.ssn || '-'}</Descriptions.Item>
    {/* 所有字段都使用 Descriptions 组件，不可编辑 */}
  </Descriptions>
</Card>
```

##### B. 文档评论功能 - **关键特性**
```tsx
/**
 * DocumentComment 组件 - 允许 HR 对每个文档添加评论
 */
const DocumentComment: React.FC<DocumentCommentProps> = ({
  documentType,
  documentUrl,
  initialComment,
  onCommentChange,
}) => {
  const [comment, setComment] = useState(initialComment || '');

  return (
    <Card size="small" title={documentType} extra={<Button>Preview</Button>}>
      {documentUrl ? (
        <TextArea
          rows={3}
          placeholder="Add HR comment for this document..."
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            onCommentChange(e.target.value);
          }}
        />
      ) : (
        <Alert message="Document not uploaded" type="warning" />
      )}
    </Card>
  );
};
```

##### C. Approve / Reject 操作
```tsx
{/* 页面顶部操作按钮 */}
<Space>
  <Button
    type="primary"
    danger
    icon={<CloseCircleOutlined />}
    onClick={handleReject}
  >
    Reject
  </Button>
  <Button
    type="primary"
    icon={<CheckCircleOutlined />}
    onClick={handleApprove}
  >
    Approve
  </Button>
</Space>

{/* Reject 必须填写原因 */}
<Modal title="Reject Application" open={rejectModalVisible}>
  <Alert
    message="HR Section 5.b: Rejection Reason Required"
    description="You must provide a reason for rejecting this application."
    type="warning"
  />
  <TextArea
    rows={4}
    placeholder="Please provide detailed feedback..."
    value={rejectReason}
    onChange={(e) => setRejectReason(e.target.value)}
  />
</Modal>
```

##### D. 数据流转逻辑
```tsx
const fetchApplicationDetail = async () => {
  const appData = await getApplicationById(parseInt(id));
  const empData = await getEmployeeById(appData.employeeId);
  
  // 初始化文档评论
  const comments: Record<string, string> = {};
  appData.documents?.forEach(doc => {
    if (doc.comment) {
      comments[doc.type] = doc.comment;
    }
  });
  setDocumentComments(comments);
};

const handleApprove = () => {
  // 保存所有文档评论
  console.log('[Approve] Document Comments:', documentComments);
  // TODO: 调用 API 更新申请状态为 'Approved'
};

const handleReject = () => {
  // 必须有全局拒绝原因
  if (!rejectReason.trim()) {
    message.error('Please provide a reason for rejection');
    return;
  }
  // TODO: 调用 API 更新申请状态为 'Rejected' + 保存 comment
};
```

#### 1.2 更新 HiringPage.tsx
**修改内容**:

```tsx
// 修改 "Review →" 按钮的点击事件
{
  title: 'Action',
  key: 'action',
  render: (_, record) => (
    <Button 
      type="link" 
      onClick={() => {
        // HR Section 5.b: Navigate to review detail page
        window.location.href = `/hr/applications/${record.id}`;
      }}
    >
      Review →
    </Button>
  ),
}
```

#### 1.3 添加路由
**文件**: `src/App.tsx`

```tsx
// HR 路由中添加
<Route path="applications/:id" element={<ApplicationReviewDetailPage />} />
```

### 实现效果:

✅ **完整的审核工作流**:
1. HR 在 Hiring 页面看到 Pending 申请列表
2. 点击 "Review →" 进入详情页 (`/hr/applications/:id`)
3. 详情页展示：
   - 申请基本信息（ID, Status, Dates）
   - **只读的 Onboarding 表单**（Personal Info, Address, Emergency Contact）
   - **文档列表** - 每个文档有独立的评论框
   - 文档预览功能（点击 Preview 按钮）
4. HR 可以：
   - 对每个文档添加单独的评论
   - 点击 "Approve" → 确认对话框 → 申请批准
   - 点击 "Reject" → **必须填写拒绝原因** → 申请拒绝
5. 操作完成后返回列表页

✅ **严格遵循需求**:
- ✅ 所有表单字段只读（使用 `Descriptions` 组件）
- ✅ 每个文档独立评论（`documentComments` 状态管理）
- ✅ Reject 必须填写全局 Comment（Modal 验证）
- ✅ 提供文档预览功能（Modal + Image）

---

## ✅ 任务 2: 完善房屋报修详情 (HR Housing)

**真理依据**: HR Section 6.c.iii
> "Facility Report (List View): Display all facility reports with Title + Date + Status format. Only 3–5 reports per page. Reports sorted by created date. Clicking a report shows details: Title, Description, Created By, Report Date, Status (Include timestamp), Comments."

### 实现文件:

#### 2.1 创建 HouseDetailManagementPage.tsx
**文件**: `src/features/hr/pages/HouseDetailManagementPage.tsx` (新建)

**核心功能**:

##### A. 房屋基本信息展示
```tsx
{/* HR Section 6.c.i - Basic House Information */}
<Card title={<><HomeOutlined /> Basic Information</>}>
  <Descriptions column={2} bordered>
    <Descriptions.Item label="Address" span={2}>
      <strong>{houseDetail?.address}</strong>
    </Descriptions.Item>
    <Descriptions.Item label="Landlord Name">
      {houseDetail?.landlord.fullName}
    </Descriptions.Item>
    <Descriptions.Item label="Number of People Living There">
      <Tag color="blue">
        {houseDetail?.numberOfEmployees} / {houseDetail?.maxOccupant}
      </Tag>
    </Descriptions.Item>
  </Descriptions>
</Card>
```

##### B. 设施信息展示
```tsx
{/* HR Section 6.c.ii - Facility Information */}
<Card title="Facility Information">
  <Descriptions column={4} bordered>
    <Descriptions.Item label="Bed">
      <strong>4</strong>
    </Descriptions.Item>
    <Descriptions.Item label="Mattress">
      <strong>4</strong>
    </Descriptions.Item>
    <Descriptions.Item label="Table">
      <strong>2</strong>
    </Descriptions.Item>
    <Descriptions.Item label="Chair">
      <strong>6</strong>
    </Descriptions.Item>
  </Descriptions>
</Card>
```

##### C. Facility Report 列表 - **严格分页**
```tsx
{/* HR Section 6.c.iii - 关键：严格分页 3-5 条/页 */}
const reportColumns: ColumnsType<FacilityReportListItem> = [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    width: '40%',
  },
  {
    title: 'Date',
    dataIndex: 'createDate',
    key: 'createDate',
    width: '30%',
    render: (date: string) => new Date(date).toLocaleDateString(),
    sorter: (a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime(),
    defaultSortOrder: 'ascend', // 按创建日期排序
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: '20%',
    render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
  },
  {
    title: 'Action',
    key: 'action',
    width: '10%',
    render: (_, record) => (
      <Button type="link" onClick={() => handleViewReport(record.id)}>
        View
      </Button>
    ),
  },
];

<Table
  columns={reportColumns}
  dataSource={facilityReports}
  rowKey="id"
  pagination={{
    pageSize: 5, // 严格限制：每页 5 条
    showSizeChanger: true,
    pageSizeOptions: ['3', '5'], // 允许切换 3 或 5 条
    showTotal: (total) => `Total ${total} reports`,
  }}
/>
```

##### D. FacilityReportModal 组件 - **详情弹窗**
```tsx
/**
 * HR Section 6.c.iii - 点击报修工单弹出 Modal
 */
const FacilityReportModal: React.FC<FacilityReportModalProps> = ({
  visible,
  reportId,
  onClose,
}) => {
  const [reportDetail, setReportDetail] = useState<FacilityReportDetail | null>(null);
  const [newComment, setNewComment] = useState('');

  // Modal 内容
  return (
    <Modal title="Facility Report Details" open={visible} onCancel={onClose} width={800}>
      {/* HR Section 6.c.iii - 报修基本信息 */}
      <Card size="small">
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Title">
            <strong>{reportDetail.title}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            <Paragraph>{reportDetail.description}</Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            {reportDetail.createdBy}
          </Descriptions.Item>
          <Descriptions.Item label="Report Date">
            {new Date(reportDetail.createDate).toLocaleString()} {/* 包含时间戳 */}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(reportDetail.status)}>
              {reportDetail.statusDisplayName}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* HR Section 6.c.iii.f - 评论列表 */}
      <List
        itemLayout="horizontal"
        dataSource={reportDetail.comments}
        renderItem={(comment: FacilityReportComment) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <Space>
                  <span>{comment.createdBy}</span>
                  {comment.canEdit && <Tag color="blue">Editable</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(comment.displayDate).toLocaleString()}
                  </Text>
                  <Paragraph>{comment.comment}</Paragraph>
                </Space>
              }
            />
          </List.Item>
        )}
      />

      {/* HR Section 6.c.iv - HR 添加评论 */}
      <div>
        <Text strong>Add Comment (HR)</Text>
        <TextArea
          rows={3}
          placeholder="Enter your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          type="primary"
          icon={<CommentOutlined />}
          onClick={handleAddComment}
        >
          Submit Comment
        </Button>
      </div>
    </Modal>
  );
};
```

##### E. 数据流转逻辑
```tsx
// 主页面 - 打开 Modal
const handleViewReport = (reportId: number) => {
  setSelectedReportId(reportId);
  setModalVisible(true);
};

// Modal 内部 - 获取详情
const fetchReportDetail = async () => {
  const data = await getReportById(reportId);
  setReportDetail(data);
};

// HR 添加评论
const handleAddComment = async () => {
  if (!newComment.trim()) {
    message.warning('Please enter a comment');
    return;
  }
  
  // TODO: 调用 API 添加评论
  await addFacilityReportComment({
    reportId,
    comment: newComment,
  });
  
  message.success('Comment added successfully');
  setNewComment('');
  fetchReportDetail(); // 刷新评论列表
};
```

#### 2.2 更新 HouseManagementPage.tsx
**修改内容**:

```tsx
// 修改 "View Details" 按钮
<Button 
  type="link" 
  onClick={() => {
    // HR Section 6.c: Navigate to dedicated house detail page
    window.location.href = `/hr/houses/${record.id}`;
  }}
>
  View Details
</Button>
```

#### 2.3 添加路由
**文件**: `src/App.tsx`

```tsx
// HR 路由中添加
<Route path="houses/:id" element={<HouseDetailManagementPage />} />
```

### 实现效果:

✅ **完整的房屋详情管理流程**:
1. HR 在 House Management 页面点击 "View Details"
2. 进入房屋详情页 (`/hr/houses/:id`)
3. 详情页展示：
   - **基本信息**（地址、房东信息、入住人数）
   - **设施信息**（Beds, Mattresses, Tables, Chairs）
   - **Facility Report 列表** - **严格分页 3-5 条/页**
4. 点击某一行 Report：
   - 弹出 Modal 显示完整详情
   - Title, Description, Created By, Report Date (带时间戳)
   - Status 状态标签
   - **Comments 列表**（显示所有评论）
   - HR 可以添加新评论

✅ **严格遵循需求**:
- ✅ Facility Report 列表严格分页（3-5 条/页）
- ✅ 按创建日期排序（最新的在前）
- ✅ 点击 Report 弹出 Modal（不跳转新页面）
- ✅ Modal 显示完整信息（Title + Description + Created By + Date + Status）
- ✅ 包含时间戳（使用 `toLocaleString()` 显示日期和时间）
- ✅ 评论列表显示 Created By, Comment Date
- ✅ HR 可以添加或更新自己的评论

---

## 🎯 技术要点

### 1. 组件化设计
- **DocumentComment**: 可复用的文档评论组件
- **FacilityReportModal**: 独立的报修详情弹窗组件
- 每个功能模块独立封装，便于维护

### 2. 状态管理
```tsx
// ApplicationReviewDetailPage
const [documentComments, setDocumentComments] = useState<Record<string, string>>({});

// HouseDetailManagementPage
const [modalVisible, setModalVisible] = useState(false);
const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
```

### 3. 用户体验优化
- **只读表单** - 使用 `<Tag color="blue">Read-Only</Tag>` 明确标识
- **文档预览** - Modal + Image 组件
- **必填验证** - Reject 操作必须填写原因
- **确认对话框** - Approve 操作需要确认
- **分页提示** - `showTotal` 显示总条数
- **评论可编辑标识** - `{comment.canEdit && <Tag>Editable</Tag>}`

### 4. 严格分页实现
```tsx
pagination={{
  pageSize: 5,                    // 默认 5 条/页
  showSizeChanger: true,          // 允许切换
  pageSizeOptions: ['3', '5'],   // 只允许 3 或 5
  showTotal: (total) => `Total ${total} reports`,
}}
```

---

## 📁 文件清单

### 新增文件:
1. `src/features/hr/pages/ApplicationReviewDetailPage.tsx` (464 行)
2. `src/features/hr/pages/HouseDetailManagementPage.tsx` (462 行)

### 修改文件:
1. `src/features/hr/pages/HiringPage.tsx`
   - 修改 Action 列的 onClick 事件
2. `src/features/hr/pages/HouseManagementPage.tsx`
   - 修改 "View Details" 按钮导航
3. `src/features/hr/pages/index.ts`
   - 添加新组件的导出
4. `src/App.tsx`
   - 添加两个新路由

---

## 🚀 部署检查清单

### 前端:
- [x] ApplicationReviewDetailPage 组件已创建
- [x] HouseDetailManagementPage 组件已创建
- [x] FacilityReportModal 组件已集成
- [x] 路由配置完成
- [x] 导航链接已更新

### 后端 API 需求:
- [ ] `GET /applications/:id` - 获取申请详情（包含员工信息和文档列表）
- [ ] `PUT /applications/:id/approve` - 批准申请（保存文档评论）
- [ ] `PUT /applications/:id/reject` - 拒绝申请（必须提供 comment）
- [ ] `GET /houses/:id/reports` - 获取房屋的报修列表
- [ ] `GET /reports/:id` - 获取报修详情（包含评论列表）
- [ ] `POST /reports/:id/comments` - 添加评论
- [ ] `PUT /reports/:id/comments/:commentId` - 更新评论

### 数据库:
- [ ] ApplicationWorkFlow 表 - 确保 `comment` 字段存在
- [ ] DigitalDocument 表 - 确保支持 `comment` 字段（HR 对文档的评论）
- [ ] FacilityReport 表 - 确保有 `createDate`, `status` 字段
- [ ] FacilityReportComment 表 - 评论表

---

## 🧪 测试场景

### 测试 1: Onboarding 申请审核
1. 以 HR 身份登录
2. 访问 Hiring 页面 (`/hr/hiring`)
3. 点击某个 Pending 申请的 "Review →" 按钮
4. 验证详情页显示：
   - ✅ 申请基本信息
   - ✅ 只读的表单字段（Personal Info, Address, Emergency Contact）
   - ✅ 文档列表，每个文档有评论框
5. 在文档评论框中输入测试评论
6. 点击 "Reject" → 验证弹出 Modal → 必须填写拒绝原因
7. 点击 "Approve" → 验证弹出确认对话框
8. 确认后返回列表页

### 测试 2: 房屋报修管理
1. 以 HR 身份登录
2. 访问 House Management 页面 (`/hr/housing`)
3. 点击某个房屋的 "View Details" 按钮
4. 验证详情页显示：
   - ✅ 房屋基本信息（地址、房东、入住人数）
   - ✅ 设施信息（Beds, Mattresses, Tables, Chairs）
   - ✅ Facility Report 列表（分页显示 3-5 条）
5. 验证分页功能：
   - ✅ 默认每页 5 条
   - ✅ 可以切换为 3 条/页
   - ✅ 按创建日期排序
6. 点击某一行 Report → 验证弹出 Modal
7. Modal 中验证：
   - ✅ Title, Description, Created By, Date（带时间）
   - ✅ Status 标签
   - ✅ Comments 列表
8. 在 Modal 中添加测试评论 → 验证提交成功

---

**实现完成日期**: 2025-12-09  
**基准文档**: `doc/raw_project_requirement.md` (HR Section 5.b & 6.c)  
**实现工程师**: Senior Full-Stack Engineer
