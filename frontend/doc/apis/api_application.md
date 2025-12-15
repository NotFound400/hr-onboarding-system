# Application Service API 文档

## 全局说明

### 基础信息
- **Base URL**: `https://api.example.com/api`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`（除文件上传接口外）

### 认证要求
所有接口都需要在 Header 中携带：
```
Authorization: Bearer <your_jwt_token>
```

### 通用错误响应
- **401 Unauthorized**: 鉴权失败（Token 无效、过期或缺失）
- **403 Forbidden**: 权限不足（角色权限不匹配）

### 响应格式
所有接口（除文件下载外）统一返回如下结构：
```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

## Application Flow API

### 1. 创建新申请

**接口名**: 员工创建新的入职申请

**Endpoint**: `POST /api`

**角色要求**: Employee

**Request Body**:
```json
{
  "employeeId": "EMP20250001",                // 员工ID
  "applicationType": "ONBOARDING",            // 申请类型: ONBOARDING 或 OPT
  "comment": "This is my onboarding application for the software engineer position."
}
```

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1001,
    "employeeId": "EMP20250001",
    "createDate": "2025-12-12T10:30:00",
    "lastModificationDate": "2025-12-12T10:30:00",
    "status": "Open",
    "comment": "This is my onboarding application for the software engineer position.",
    "applicationType": "ONBOARDING"
  }
}
```

**Error (400)**:
```json
{
  "success": false,
  "message": "Invalid application type or missing required fields",
  "data": null
}
```

---

### 2. 获取最新激活的申请

**接口名**: 获取员工最近的活动申请

**Endpoint**: `GET /api/employee/latest/{employeeId}`

**角色要求**: Employee

**Path Parameters**:
- `employeeId`: 员工ID（例如：EMP20250001）

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1001,
    "employeeId": "EMP20250001",
    "createDate": "2025-12-12T10:30:00",
    "lastModificationDate": "2025-12-12T15:45:00",
    "status": "Pending",
    "comment": "Updated application with all required documents.",
    "applicationType": "ONBOARDING"
  }
}
```

**No Data (200)**:
```json
{
  "success": false,
  "message": "No active application found",
  "data": null
}
```

---

### 3. 获取员工所有激活的申请

**接口名**: 获取员工所有正在进行的申请列表

**Endpoint**: `GET /api/employee/{employeeId}`

**角色要求**: Employee

**Path Parameters**:
- `employeeId`: 员工ID（例如：EMP20250001）

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1001,
      "employeeId": "EMP20250001",
      "status": "Pending",
      "comment": "Onboarding application submitted",
      "applicationType": "ONBOARDING"
    },
    {
      "id": 1005,
      "employeeId": "EMP20250001",
      "status": "Open",
      "comment": "OPT application in progress",
      "applicationType": "OPT"
    }
  ]
}
```

---

### 4. 根据 ID 获取申请详情

**接口名**: 根据申请 ID 获取完整申请信息

**Endpoint**: `GET /api/{applicationId}`

**角色要求**: Employee

**Path Parameters**:
- `applicationId`: 申请ID（例如：1001）

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1001,
    "employeeId": "EMP20250001",
    "createDate": "2025-12-12T10:30:00",
    "lastModificationDate": "2025-12-12T15:45:00",
    "status": "Pending",
    "comment": "All documents uploaded and ready for review.",
    "applicationType": "ONBOARDING"
  }
}
```

**Error**:
```json
{
  "success": false,
  "message": "Application not found",
  "data": null
}
```

---

### 5. 更新申请

**接口名**: 员工更新已存在的申请（提交前）

**Endpoint**: `PUT /api/{applicationId}`

**角色要求**: Employee

**Path Parameters**:
- `applicationId`: 申请ID（例如：1001）

**Request Body**:
```json
{
  "comment": "Updated comment with additional information about my background.",
  "applicationType": "ONBOARDING"          // 可选，修改申请类型
}
```

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1001,
    "employeeId": "EMP20250001",
    "createDate": "2025-12-12T10:30:00",
    "lastModificationDate": "2025-12-12T16:20:00",
    "status": "Open",
    "comment": "Updated comment with additional information about my background.",
    "applicationType": "ONBOARDING"
  }
}
```

**Error (400)**:
```json
{
  "success": false,
  "message": "Cannot update application with status Pending or Approved",
  "data": null
}
```

---

### 6. 提交申请

**接口名**: 员工提交已完成的申请供 HR 审核

**Endpoint**: `POST /api/{applicationId}/submit`

**角色要求**: Employee

**Path Parameters**:
- `applicationId`: 申请ID（例如：1001）

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": null
}
```

**Error (400)**:
```json
{
  "success": false,
  "message": "Application already submitted or missing required documents",
  "data": null
}
```

---

### 7. 批准申请

**接口名**: HR 批准入职申请

**Endpoint**: `POST /api/{applicationId}/approve`

**角色要求**: HR

**Path Parameters**:
- `applicationId`: 申请ID（例如：1001）

**Request Body**:
```json
{
  "comment": "Application approved. Welcome to the team!"
}
```

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "status": "Approved",
    "comment": "Application approved. Welcome to the team!"
  }
}
```

**Error (400)**:
```json
{
  "success": false,
  "message": "Application is not in Pending status",
  "data": null
}
```

---

### 8. 拒绝申请

**接口名**: HR 拒绝入职申请

**Endpoint**: `POST /api/{applicationId}/reject`

**角色要求**: HR

**Path Parameters**:
- `applicationId`: 申请ID（例如：1001）

**Request Body**:
```json
{
  "comment": "Missing required documents. Please resubmit with all necessary files."
}
```

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "status": "Rejected",
    "comment": "Missing required documents. Please resubmit with all necessary files."
  }
}
```

**Error (400)**:
```json
{
  "success": false,
  "message": "Application is not in Pending status",
  "data": null
}
```

---

### 9. 列出所有进行中的申请

**接口名**: HR 获取所有正在处理的申请

**Endpoint**: `GET /api/ongoing`

**角色要求**: HR

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1001,
      "employeeId": "EMP20250001",
      "createDate": "2025-12-12T10:30:00",
      "lastModificationDate": "2025-12-12T15:45:00",
      "status": "Pending",
      "comment": "Onboarding application ready for review",
      "applicationType": "ONBOARDING"
    },
    {
      "id": 1003,
      "employeeId": "EMP20250003",
      "createDate": "2025-12-11T09:15:00",
      "lastModificationDate": "2025-12-11T14:30:00",
      "status": "Pending",
      "comment": "OPT extension application",
      "applicationType": "OPT"
    }
  ]
}
```

---

### 10. 获取员工的所有申请

**接口名**: HR 或员工查看某员工的所有申请

**Endpoint**: `GET /api/employee/{employeeId}/all`

**角色要求**: HR 或 Employee

**Path Parameters**:
- `employeeId`: 员工ID（例如：EMP20250001）

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1001,
      "employeeId": "EMP20250001",
      "createDate": "2025-12-12T10:30:00",
      "lastModificationDate": "2025-12-12T15:45:00",
      "status": "Approved",
      "comment": "Application approved. Welcome to the team!",
      "applicationType": "ONBOARDING"
    },
    {
      "id": 998,
      "employeeId": "EMP20250001",
      "createDate": "2025-11-20T08:00:00",
      "lastModificationDate": "2025-11-22T10:15:00",
      "status": "Rejected",
      "comment": "Incomplete documentation",
      "applicationType": "ONBOARDING"
    }
  ]
}
```

---

## Document Management API

### 11. 根据申请 ID 获取文档列表

**接口名**: 获取特定申请相关的所有文档

**Endpoint**: `GET /api/documents/application/{applicationId}`

**角色要求**: Employee

**Path Parameters**:
- `applicationId`: 申请ID（例如：1001）

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 5001,
      "type": "I-20",
      "isRequired": true,
      "path": "s3://hr-documents/EMP20250001/i20_document.pdf",
      "description": "Student visa I-20 form",
      "title": "I-20 Form",
      "applicationId": 1001
    },
    {
      "id": 5002,
      "type": "PASSPORT",
      "isRequired": true,
      "path": "s3://hr-documents/EMP20250001/passport_copy.pdf",
      "description": "Passport identification page",
      "title": "Passport Copy",
      "applicationId": 1001
    }
  ]
}
```

---

### 12. 根据员工 ID 获取文档列表

**接口名**: 获取某员工上传的所有文档

**Endpoint**: `GET /api/documents/employee/{employeeId}`

**角色要求**: Employee

**Path Parameters**:
- `employeeId`: 员工ID（例如：EMP20250001）

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 5001,
      "type": "I-20",
      "isRequired": true,
      "path": "s3://hr-documents/EMP20250001/i20_document.pdf",
      "description": "Student visa I-20 form",
      "title": "I-20 Form",
      "applicationId": 1001
    },
    {
      "id": 5005,
      "type": "RESUME",
      "isRequired": false,
      "path": "s3://hr-documents/EMP20250001/resume_2025.pdf",
      "description": "Updated resume",
      "title": "Resume - December 2025",
      "applicationId": 1001
    }
  ]
}
```

---

### 13. 根据文档类型获取文档列表

**接口名**: 获取指定类型的所有文档

**Endpoint**: `GET /api/documents/type/{type}`

**角色要求**: Employee

**Path Parameters**:
- `type`: 文档类型（例如：I-20, PASSPORT, RESUME）

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 5001,
      "type": "I-20",
      "isRequired": true,
      "path": "s3://hr-documents/EMP20250001/i20_document.pdf",
      "description": "Student visa I-20 form",
      "title": "I-20 Form",
      "applicationId": 1001
    },
    {
      "id": 5012,
      "type": "I-20",
      "isRequired": true,
      "path": "s3://hr-documents/EMP20250005/i20_form.pdf",
      "description": "I-20 for OPT extension",
      "title": "I-20 Document",
      "applicationId": 1008
    }
  ]
}
```

---

### 14. 获取必需文档列表

**接口名**: 获取所有标记为必需的文档

**Endpoint**: `GET /api/documents/required`

**角色要求**: Employee

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 5001,
      "type": "I-20",
      "isRequired": true,
      "path": "s3://hr-documents/EMP20250001/i20_document.pdf",
      "description": "Student visa I-20 form",
      "title": "I-20 Form",
      "applicationId": 1001
    },
    {
      "id": 5002,
      "type": "PASSPORT",
      "isRequired": true,
      "path": "s3://hr-documents/EMP20250001/passport_copy.pdf",
      "description": "Passport identification page",
      "title": "Passport Copy",
      "applicationId": 1001
    }
  ]
}
```

---

### 15. 上传文档

**接口名**: 上传文档及元数据

**Endpoint**: `POST /api/documents/upload`

**角色要求**: Employee

**Content-Type**: `multipart/form-data`

**Request**:
- **file**: (文件) 要上传的文档文件
- **metadata**: (JSON 字符串)
```json
{
  "type": "I-20",
  "title": "I-20 Form for Spring 2026",
  "description": "Student visa I-20 form for spring semester 2026",
  "applicationId": 1001
}
```

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 5015,
    "type": "I-20",
    "isRequired": false,
    "path": "s3://hr-documents/EMP20250001/i20_spring2026.pdf",
    "description": "Student visa I-20 form for spring semester 2026",
    "title": "I-20 Form for Spring 2026",
    "applicationId": 1001
  }
}
```

**Error**:
```json
{
  "success": false,
  "message": "File upload failed or invalid metadata",
  "data": null
}
```

---

### 16. 下载文档

**接口名**: 根据文档 ID 下载文档

**Endpoint**: `GET /api/documents/download/{id}`

**角色要求**: Employee

**Path Parameters**:
- `id`: 文档ID（例如：5001）

**Response**:

**Success (200)**: 
- **Content-Type**: `application/octet-stream`
- **Content-Disposition**: `attachment; filename="I-20 Form.pdf"`
- **Body**: 二进制文件数据

**Error (404)**:
```json
{
  "success": false,
  "message": "Document not found",
  "data": null
}
```

---

### 17. 删除文档

**接口名**: 根据文档 ID 删除文档

**Endpoint**: `DELETE /api/documents/delete/{id}`

**角色要求**: Employee

**Path Parameters**:
- `id`: 文档ID（例如：5001）

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": "Document deleted successfully"
}
```

**Error**:
```json
{
  "success": false,
  "message": "Document not found or already deleted",
  "data": null
}
```

---

### 18. 更新文档

**接口名**: 更新文档文件和/或元数据

**Endpoint**: `PUT /api/documents/update/{id}`

**角色要求**: Employee

**Content-Type**: `multipart/form-data`

**Path Parameters**:
- `id`: 文档ID（例如：5001）

**Request**:
- **file**: (文件) 新的文档文件
- **metadata**: (JSON 字符串)
```json
{
  "type": "I-20",
  "title": "Updated I-20 Form",
  "description": "Revised I-20 document with correct dates",
  "applicationId": 1001
}
```

**Response**:

**Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 5001,
    "type": "I-20",
    "isRequired": true,
    "path": "s3://hr-documents/EMP20250001/i20_updated.pdf",
    "description": "Revised I-20 document with correct dates",
    "title": "Updated I-20 Form",
    "applicationId": 1001
  }
}
```

**Error**:
```json
{
  "success": false,
  "message": "Document not found or update failed",
  "data": null
}
```

---

## 附录

### 数据类型枚举

#### ApplicationStatus（申请状态）
- `Open`: 草稿/未提交
- `Pending`: 已提交，待审核
- `Rejected`: 已拒绝
- `Approved`: 已通过

#### ApplicationType（申请类型）
- `ONBOARDING`: 入职申请
- `OPT`: OPT 申请

### 常见文档类型示例
- `I-20`: I-20 表格
- `PASSPORT`: 护照
- `RESUME`: 简历
- `DIPLOMA`: 学历证明
- `WORK_AUTHORIZATION`: 工作许可
