# Housing Service API 接口文档

## 全局说明

### 认证方式
- 所有接口均需在 Header 中携带 JWT Token：`Authorization: Bearer <token>`
- API Gateway 会验证 JWT 并自动在请求头中注入以下信息：
  - `X-User-Id`: 用户 ID
  - `X-Username`: 用户名
  - `X-User-Roles`: 用户角色 (例如: "HR" 或 "EMPLOYEE")
  - `X-House-Id`: 员工分配的房屋 ID (仅 EMPLOYEE 角色)

### 统一前缀
- 所有接口前缀：`/api`

### 通用错误码
- `401 Unauthorized`: JWT Token 无效或过期
- `403 Forbidden`: 权限不足（如员工尝试访问 HR 专用接口）
- `404 Not Found`: 资源不存在
- `400 Bad Request`: 请求参数错误

### 统一响应格式
所有接口返回格式统一为：
```json
{
  "success": true,
  "message": "Success",
  "data": { /* 具体数据 */ },
  "timestamp": "2025-12-12T10:30:00"
}
```

---

## 1. House Management (房屋管理)

### 1.1 获取所有房屋（角色视图）

**接口名**: Get All Houses (Role-based View)

**Endpoint**: `GET /api/houses`

**说明**: 
- HR 角色: 返回所有房屋及详细信息（地址、员工数量、房东信息）
- EMPLOYEE 角色: 仅返回自己被分配的房屋及室友列表

**Request**: 无需参数

**Response Success (200) - HR View**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "address": "123 Maple Street, Boston, MA 02115",
      "maxOccupant": 4,
      "numberOfEmployees": 3,
      "landlordId": 1,
      "landlordFullName": "John Smith",
      "landlordPhone": "+1-617-555-0123",
      "landlordEmail": "john.smith@landlords.com",
      "viewType": "HR_VIEW"
    },
    {
      "id": 2,
      "address": "456 Oak Avenue, Cambridge, MA 02139",
      "maxOccupant": 6,
      "numberOfEmployees": 5,
      "landlordId": 2,
      "landlordFullName": "Emily Johnson",
      "landlordPhone": "+1-617-555-0456",
      "landlordEmail": "emily.j@realestate.com",
      "viewType": "HR_VIEW"
    }
  ],
  "timestamp": "2025-12-12T10:30:00"
}
```

**Response Success (200) - Employee View**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "address": "123 Maple Street, Boston, MA 02115",
      "roommates": [
        {
          "employeeId": 5,
          "name": "Alice Wang",
          "phone": "+1-617-555-7890"
        },
        {
          "employeeId": 8,
          "name": "Bob Chen",
          "phone": "+1-617-555-7891"
        },
        {
          "employeeId": 12,
          "name": "Carol Liu",
          "phone": "+1-617-555-7892"
        }
      ],
      "viewType": "EMPLOYEE_VIEW"
    }
  ],
  "timestamp": "2025-12-12T10:30:00"
}
```

---

### 1.2 获取房屋详情（角色视图）

**接口名**: Get House Detail (Role-based View)

**Endpoint**: `GET /api/houses/{id}`

**说明**:
- HR 角色: 返回完整房屋信息（房东、设施、员工数量）
- EMPLOYEE 角色: 仅能查看自己被分配的房屋，返回地址和室友列表

**Request**:
- Path Parameter: `id` (房屋 ID)

**Response Success (200) - HR View**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "address": "123 Maple Street, Boston, MA 02115",
    "maxOccupant": 4,
    "numberOfEmployees": 3,
    "landlord": {
      "id": 1,
      "firstName": "John",
      "lastName": "Smith",
      "fullName": "John Smith",
      "email": "john.smith@landlords.com",
      "cellPhone": "+1-617-555-0123"
    },
    "facilitySummary": {
      "Bed": 4,
      "Mattress": 4,
      "Table": 2,
      "Chair": 8
    },
    "facilities": [
      {
        "id": 1,
        "houseId": 1,
        "type": "Bed",
        "description": "Queen size bed with wooden frame",
        "quantity": 4
      },
      {
        "id": 2,
        "houseId": 1,
        "type": "Mattress",
        "description": "Memory foam mattress",
        "quantity": 4
      },
      {
        "id": 3,
        "houseId": 1,
        "type": "Table",
        "description": "Dining table",
        "quantity": 1
      },
      {
        "id": 4,
        "houseId": 1,
        "type": "Table",
        "description": "Coffee table",
        "quantity": 1
      },
      {
        "id": 5,
        "houseId": 1,
        "type": "Chair",
        "description": "Dining chairs",
        "quantity": 8
      }
    ],
    "viewType": "HR_VIEW"
  },
  "timestamp": "2025-12-12T10:30:00"
}
```

**Response Success (200) - Employee View**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "address": "123 Maple Street, Boston, MA 02115",
    "roommates": [
      {
        "employeeId": 5,
        "name": "Alice Wang",
        "phone": "+1-617-555-7890"
      },
      {
        "employeeId": 8,
        "name": "Bob Chen",
        "phone": "+1-617-555-7891"
      },
      {
        "employeeId": 12,
        "name": "Carol Liu",
        "phone": "+1-617-555-7892"
      }
    ],
    "viewType": "EMPLOYEE_VIEW"
  },
  "timestamp": "2025-12-12T10:30:00"
}
```

**Error**:
- `403`: Employee 尝试访问未分配给自己的房屋

---

### 1.3 创建房屋 (HR Only)

**接口名**: Create House

**Endpoint**: `POST /api/houses`

**权限**: 仅 HR

**Request Body**:
```json
{
  // 方式1: 使用现有房东 ID
  "landlordId": 1,
  
  // 方式2: 创建新房东（二选一）
  "landlord": {
    "firstName": "Michael",
    "lastName": "Brown",
    "email": "michael.brown@property.com",
    "cellPhone": "+1-617-555-9999"
  },
  
  "address": "789 Pine Road, Somerville, MA 02144",
  "maxOccupant": 5,
  
  // 可选: 同时添加设施
  "facilities": [
    {
      "type": "Bed",
      "description": "Twin size bed",
      "quantity": 5
    },
    {
      "type": "Table",
      "description": "Study desk",
      "quantity": 3
    }
  ]
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "message": "House created successfully",
  "data": {
    "id": 3,
    "address": "789 Pine Road, Somerville, MA 02144",
    "maxOccupant": 5,
    "numberOfEmployees": 0,
    "landlord": {
      "id": 3,
      "firstName": "Michael",
      "lastName": "Brown",
      "fullName": "Michael Brown",
      "email": "michael.brown@property.com",
      "cellPhone": "+1-617-555-9999"
    },
    "facilitySummary": {
      "Bed": 5,
      "Table": 3
    },
    "facilities": [
      {
        "id": 10,
        "houseId": 3,
        "type": "Bed",
        "description": "Twin size bed",
        "quantity": 5
      },
      {
        "id": 11,
        "houseId": 3,
        "type": "Table",
        "description": "Study desk",
        "quantity": 3
      }
    ],
    "residents": []
  },
  "timestamp": "2025-12-12T10:35:00"
}
```

**Error**:
- `400`: 地址为空或最大入住人数小于 1

---

### 1.4 更新房屋 (HR Only)

**接口名**: Update House

**Endpoint**: `PUT /api/houses/{id}`

**权限**: 仅 HR

**Request**:
- Path Parameter: `id` (房屋 ID)

**Request Body**:
```json
{
  "landlordId": 2,
  "address": "123 Maple Street, Unit 2B, Boston, MA 02115",
  "maxOccupant": 5
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "House updated successfully",
  "data": {
    "id": 1,
    "address": "123 Maple Street, Unit 2B, Boston, MA 02115",
    "maxOccupant": 5,
    "numberOfEmployees": 3,
    "landlord": {
      "id": 2,
      "firstName": "Emily",
      "lastName": "Johnson",
      "fullName": "Emily Johnson",
      "email": "emily.j@realestate.com",
      "cellPhone": "+1-617-555-0456"
    },
    "facilitySummary": {
      "Bed": 4,
      "Mattress": 4,
      "Table": 2,
      "Chair": 8
    },
    "facilities": [],
    "residents": []
  },
  "timestamp": "2025-12-12T10:40:00"
}
```

**Error**:
- `404`: 房屋不存在

---

### 1.5 删除房屋 (HR Only)

**接口名**: Delete House

**Endpoint**: `DELETE /api/houses/{id}`

**权限**: 仅 HR

**Request**:
- Path Parameter: `id` (房屋 ID)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "House deleted successfully",
  "data": null,
  "timestamp": "2025-12-12T10:45:00"
}
```

**Error**:
- `404`: 房屋不存在
- `400`: 房屋内还有员工居住，无法删除

---

### 1.6 获取我的房屋 (Employee)

**接口名**: Get My House

**Endpoint**: `GET /api/houses/my-house`

**权限**: Employee

**说明**: 返回当前员工被分配的房屋信息及室友列表

**Request**: 无需参数

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "address": "123 Maple Street, Boston, MA 02115",
    "landlordContact": {
      "fullName": "John Smith",
      "phone": "+1-617-555-0123",
      "email": "john.smith@landlords.com"
    },
    "facilitySummary": {
      "Bed": 4,
      "Mattress": 4,
      "Table": 2,
      "Chair": 8
    },
    "residents": [
      {
        "employeeId": 5,
        "name": "Alice Wang",
        "phone": "+1-617-555-7890"
      },
      {
        "employeeId": 8,
        "name": "Bob Chen",
        "phone": "+1-617-555-7891"
      },
      {
        "employeeId": 12,
        "name": "Carol Liu",
        "phone": "+1-617-555-7892"
      }
    ]
  },
  "timestamp": "2025-12-12T10:50:00"
}
```

**Response Success (200) - No House Assigned**:
```json
{
  "success": true,
  "message": "You are not assigned to any house",
  "data": null,
  "timestamp": "2025-12-12T10:50:00"
}
```

---

### 1.7 获取房屋摘要列表

**接口名**: Get House Summaries

**Endpoint**: `GET /api/houses/summaries`

**说明**: 用于下拉选择框等场景，返回简化的房屋列表

**Request**: 无需参数

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "address": "123 Maple Street, Boston, MA 02115",
      "maxOccupant": 4,
      "currentOccupant": 3
    },
    {
      "id": 2,
      "address": "456 Oak Avenue, Cambridge, MA 02139",
      "maxOccupant": 6,
      "currentOccupant": 5
    },
    {
      "id": 3,
      "address": "789 Pine Road, Somerville, MA 02144",
      "maxOccupant": 5,
      "currentOccupant": 0
    }
  ],
  "timestamp": "2025-12-12T10:55:00"
}
```

---

### 1.8 检查房屋可用性

**接口名**: Check House Availability

**Endpoint**: `GET /api/houses/{houseId}/availability`

**说明**: 检查房屋是否还有空位

**Request**:
- Path Parameter: `houseId` (房屋 ID)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "houseId": 1,
    "address": "123 Maple Street, Boston, MA 02115",
    "maxOccupant": 4,
    "currentOccupant": 3,
    "availableSlots": 1,
    "isAvailable": true
  },
  "timestamp": "2025-12-12T11:00:00"
}
```

---

## 2. Landlord Management (房东管理)

### 2.1 创建房东 (HR Only)

**接口名**: Create Landlord

**Endpoint**: `POST /api/landlords`

**权限**: 仅 HR

**Request Body**:
```json
{
  "firstName": "Sarah",
  "lastName": "Williams",
  "email": "sarah.williams@housing.com",
  "cellPhone": "+1-617-555-1234"
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Landlord created successfully",
  "data": {
    "id": 4,
    "firstName": "Sarah",
    "lastName": "Williams",
    "fullName": "Sarah Williams",
    "email": "sarah.williams@housing.com",
    "cellPhone": "+1-617-555-1234"
  },
  "timestamp": "2025-12-12T11:05:00"
}
```

**Error**:
- `400`: 姓名为空或邮箱格式不正确

---

### 2.2 获取房东详情

**接口名**: Get Landlord by ID

**Endpoint**: `GET /api/landlords/{id}`

**Request**:
- Path Parameter: `id` (房东 ID)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Smith",
    "fullName": "John Smith",
    "email": "john.smith@landlords.com",
    "cellPhone": "+1-617-555-0123"
  },
  "timestamp": "2025-12-12T11:10:00"
}
```

**Error**:
- `404`: 房东不存在

---

### 2.3 获取所有房东 (HR Only)

**接口名**: Get All Landlords

**Endpoint**: `GET /api/landlords`

**权限**: 仅 HR

**Request**: 无需参数

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Smith",
      "fullName": "John Smith",
      "email": "john.smith@landlords.com",
      "cellPhone": "+1-617-555-0123"
    },
    {
      "id": 2,
      "firstName": "Emily",
      "lastName": "Johnson",
      "fullName": "Emily Johnson",
      "email": "emily.j@realestate.com",
      "cellPhone": "+1-617-555-0456"
    },
    {
      "id": 3,
      "firstName": "Michael",
      "lastName": "Brown",
      "fullName": "Michael Brown",
      "email": "michael.brown@property.com",
      "cellPhone": "+1-617-555-9999"
    }
  ],
  "timestamp": "2025-12-12T11:15:00"
}
```

---

### 2.4 更新房东 (HR Only)

**接口名**: Update Landlord

**Endpoint**: `PUT /api/landlords/{id}`

**权限**: 仅 HR

**Request**:
- Path Parameter: `id` (房东 ID)

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Smith-Jones",
  "email": "john.jones@newdomain.com",
  "cellPhone": "+1-617-555-0199"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Landlord updated successfully",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Smith-Jones",
    "fullName": "John Smith-Jones",
    "email": "john.jones@newdomain.com",
    "cellPhone": "+1-617-555-0199"
  },
  "timestamp": "2025-12-12T11:20:00"
}
```

**Error**:
- `404`: 房东不存在

---

### 2.5 删除房东 (HR Only)

**接口名**: Delete Landlord

**Endpoint**: `DELETE /api/landlords/{id}`

**权限**: 仅 HR

**Request**:
- Path Parameter: `id` (房东 ID)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Landlord deleted successfully",
  "data": null,
  "timestamp": "2025-12-12T11:25:00"
}
```

**Error**:
- `404`: 房东不存在
- `400`: 该房东名下还有房屋，无法删除

---

### 2.6 搜索房东

**接口名**: Search Landlords

**Endpoint**: `GET /api/landlords/search?keyword={keyword}`

**Request**:
- Query Parameter: `keyword` (搜索关键词，匹配姓名)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Smith",
      "fullName": "John Smith",
      "email": "john.smith@landlords.com",
      "cellPhone": "+1-617-555-0123"
    }
  ],
  "timestamp": "2025-12-12T11:30:00"
}
```

---

## 3. Facility Management (设施管理)

### 3.1 添加设施 (HR Only)

**接口名**: Add Facility

**Endpoint**: `POST /api/facilities`

**权限**: 仅 HR

**Request Body**:
```json
{
  "houseId": 1,
  "type": "Sofa",
  "description": "3-seater leather sofa",
  "quantity": 1
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Facility added successfully",
  "data": {
    "id": 15,
    "houseId": 1,
    "type": "Sofa",
    "description": "3-seater leather sofa",
    "quantity": 1
  },
  "timestamp": "2025-12-12T11:35:00"
}
```

**Error**:
- `404`: 房屋不存在
- `400`: 类型为空或数量为负数

---

### 3.2 获取设施详情 (HR Only)

**接口名**: Get Facility by ID

**Endpoint**: `GET /api/facilities/{id}`

**权限**: 仅 HR

**Request**:
- Path Parameter: `id` (设施 ID)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "houseId": 1,
    "type": "Bed",
    "description": "Queen size bed with wooden frame",
    "quantity": 4
  },
  "timestamp": "2025-12-12T11:40:00"
}
```

**Error**:
- `404`: 设施不存在

---

### 3.3 获取房屋所有设施 (HR Only)

**接口名**: Get Facilities by House ID

**Endpoint**: `GET /api/facilities/house/{houseId}`

**权限**: 仅 HR

**Request**:
- Path Parameter: `houseId` (房屋 ID)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "houseId": 1,
      "type": "Bed",
      "description": "Queen size bed with wooden frame",
      "quantity": 4
    },
    {
      "id": 2,
      "houseId": 1,
      "type": "Mattress",
      "description": "Memory foam mattress",
      "quantity": 4
    },
    {
      "id": 3,
      "houseId": 1,
      "type": "Table",
      "description": "Dining table",
      "quantity": 1
    },
    {
      "id": 5,
      "houseId": 1,
      "type": "Chair",
      "description": "Dining chairs",
      "quantity": 8
    }
  ],
  "timestamp": "2025-12-12T11:45:00"
}
```

---

### 3.4 获取房屋设施汇总 (HR Only)

**接口名**: Get Facility Summary

**Endpoint**: `GET /api/facilities/house/{houseId}/summary`

**权限**: 仅 HR

**说明**: 返回各类设施的数量汇总（床、床垫、桌子、椅子等）

**Request**:
- Path Parameter: `houseId` (房屋 ID)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "type": "Bed",
      "totalQuantity": 4
    },
    {
      "type": "Mattress",
      "totalQuantity": 4
    },
    {
      "type": "Table",
      "totalQuantity": 2
    },
    {
      "type": "Chair",
      "totalQuantity": 8
    }
  ],
  "timestamp": "2025-12-12T11:50:00"
}
```

---

### 3.5 更新设施 (HR Only)

**接口名**: Update Facility

**Endpoint**: `PUT /api/facilities/{id}`

**权限**: 仅 HR

**Request**:
- Path Parameter: `id` (设施 ID)

**Request Body**:
```json
{
  "type": "Bed",
  "description": "King size bed with metal frame",
  "quantity": 3
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Facility updated successfully",
  "data": {
    "id": 1,
    "houseId": 1,
    "type": "Bed",
    "description": "King size bed with metal frame",
    "quantity": 3
  },
  "timestamp": "2025-12-12T11:55:00"
}
```

**Error**:
- `404`: 设施不存在

---

### 3.6 删除设施 (HR Only)

**接口名**: Delete Facility

**Endpoint**: `DELETE /api/facilities/{id}`

**权限**: 仅 HR

**Request**:
- Path Parameter: `id` (设施 ID)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Facility deleted successfully",
  "data": null,
  "timestamp": "2025-12-12T12:00:00"
}
```

**Error**:
- `404`: 设施不存在

---

## 4. Facility Report Management (设施报修管理)

### 4.1 创建设施报修 (Employee)

**接口名**: Create Facility Report

**Endpoint**: `POST /api/facility-reports`

**权限**: Employee

**说明**: 员工可以报告房屋内的设施问题

**Request Body**:
```json
{
  "facilityId": 1,
  "title": "Bed frame broken",
  "description": "The wooden bed frame in the master bedroom has a crack on the left side support beam. It makes creaking noises when used."
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "id": 10,
    "facilityId": 1,
    "facilityType": "Bed",
    "houseId": 1,
    "houseAddress": "123 Maple Street, Boston, MA 02115",
    "title": "Bed frame broken",
    "description": "The wooden bed frame in the master bedroom has a crack on the left side support beam. It makes creaking noises when used.",
    "employeeId": 5,
    "createdBy": "Alice Wang",
    "createDate": "2025-12-12T12:05:00",
    "status": "Open",
    "statusDisplayName": "Open",
    "comments": []
  },
  "timestamp": "2025-12-12T12:05:00"
}
```

**Error**:
- `404`: 设施不存在
- `400`: 标题为空

---

### 4.2 获取报修详情

**接口名**: Get Report Details

**Endpoint**: `GET /api/facility-reports/{id}`

**Request**:
- Path Parameter: `id` (报修记录 ID)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 10,
    "facilityId": 1,
    "facilityType": "Bed",
    "houseId": 1,
    "houseAddress": "123 Maple Street, Boston, MA 02115",
    "title": "Bed frame broken",
    "description": "The wooden bed frame in the master bedroom has a crack on the left side support beam. It makes creaking noises when used.",
    "employeeId": 5,
    "createdBy": "Alice Wang",
    "createDate": "2025-12-12T12:05:00",
    "status": "InProgress",
    "statusDisplayName": "In Progress",
    "comments": [
      {
        "id": 1,
        "facilityReportId": 10,
        "employeeId": 5,
        "createdBy": "Alice Wang",
        "comment": "This issue is urgent, please fix as soon as possible.",
        "createDate": "2025-12-12T12:10:00",
        "lastModificationDate": null,
        "displayDate": "2025-12-12T12:10:00",
        "canEdit": true
      },
      {
        "id": 2,
        "facilityReportId": 10,
        "employeeId": 100,
        "createdBy": "HR Admin",
        "comment": "We have contacted the landlord. Repair scheduled for Dec 15.",
        "createDate": "2025-12-12T14:30:00",
        "lastModificationDate": null,
        "displayDate": "2025-12-12T14:30:00",
        "canEdit": false
      }
    ]
  },
  "timestamp": "2025-12-12T15:00:00"
}
```

**Error**:
- `404`: 报修记录不存在

---

### 4.3 获取房屋所有报修记录（分页，HR Only）

**接口名**: Get Reports by House ID (Paginated)

**Endpoint**: `GET /api/facility-reports/house/{houseId}?page={page}&size={size}`

**权限**: 仅 HR

**说明**: 分页获取指定房屋的报修记录，每页 3-5 条，按创建时间排序

**Request**:
- Path Parameter: `houseId` (房屋 ID)
- Query Parameters:
  - `page`: 页码（从 0 开始，默认 0）
  - `size`: 每页数量（默认 5）

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "content": [
      {
        "id": 10,
        "title": "Bed frame broken",
        "createDate": "2025-12-12T12:05:00",
        "status": "InProgress",
        "statusDisplayName": "In Progress"
      },
      {
        "id": 9,
        "title": "Leaking faucet in bathroom",
        "createDate": "2025-12-10T09:30:00",
        "status": "Closed",
        "statusDisplayName": "Closed"
      },
      {
        "id": 8,
        "title": "Broken chair",
        "createDate": "2025-12-08T16:20:00",
        "status": "Open",
        "statusDisplayName": "Open"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 5,
      "offset": 0
    },
    "totalElements": 3,
    "totalPages": 1,
    "last": true,
    "first": true,
    "size": 5,
    "number": 0,
    "numberOfElements": 3,
    "empty": false
  },
  "timestamp": "2025-12-12T15:05:00"
}
```

---

### 4.4 获取房屋所有报修记录（不分页，HR Only）

**接口名**: Get All Reports by House ID

**Endpoint**: `GET /api/facility-reports/house/{houseId}/all`

**权限**: 仅 HR

**Request**:
- Path Parameter: `houseId` (房屋 ID)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 10,
      "title": "Bed frame broken",
      "createDate": "2025-12-12T12:05:00",
      "status": "InProgress",
      "statusDisplayName": "In Progress"
    },
    {
      "id": 9,
      "title": "Leaking faucet in bathroom",
      "createDate": "2025-12-10T09:30:00",
      "status": "Closed",
      "statusDisplayName": "Closed"
    },
    {
      "id": 8,
      "title": "Broken chair",
      "createDate": "2025-12-08T16:20:00",
      "status": "Open",
      "statusDisplayName": "Open"
    }
  ],
  "timestamp": "2025-12-12T15:10:00"
}
```

---

### 4.5 更新报修状态 (HR Only)

**接口名**: Update Report Status

**Endpoint**: `PATCH /api/facility-reports/{id}/status`

**权限**: 仅 HR

**说明**: HR 可以更新报修状态（Open / InProgress / Closed）

**Request**:
- Path Parameter: `id` (报修记录 ID)

**Request Body**:
```json
{
  "status": "InProgress"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Report status updated successfully",
  "data": {
    "id": 10,
    "facilityId": 1,
    "facilityType": "Bed",
    "houseId": 1,
    "houseAddress": "123 Maple Street, Boston, MA 02115",
    "title": "Bed frame broken",
    "description": "The wooden bed frame in the master bedroom has a crack on the left side support beam. It makes creaking noises when used.",
    "employeeId": 5,
    "createdBy": "Alice Wang",
    "createDate": "2025-12-12T12:05:00",
    "status": "InProgress",
    "statusDisplayName": "In Progress",
    "comments": []
  },
  "timestamp": "2025-12-12T15:15:00"
}
```

**Error**:
- `404`: 报修记录不存在
- `400`: 状态值无效（必须是 Open, InProgress, 或 Closed）

---

### 4.6 更新报修内容

**接口名**: Update Report

**Endpoint**: `PUT /api/facility-reports/{id}`

**权限**: 仅报修创建者

**说明**: 员工只能更新自己创建的报修记录

**Request**:
- Path Parameter: `id` (报修记录 ID)

**Request Body**:
```json
{
  "title": "Bed frame broken - Urgent",
  "description": "The wooden bed frame in the master bedroom has a crack on the left side support beam. It makes creaking noises when used. UPDATE: The crack is getting worse and may collapse soon."
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {
    "id": 10,
    "facilityId": 1,
    "facilityType": "Bed",
    "houseId": 1,
    "houseAddress": "123 Maple Street, Boston, MA 02115",
    "title": "Bed frame broken - Urgent",
    "description": "The wooden bed frame in the master bedroom has a crack on the left side support beam. It makes creaking noises when used. UPDATE: The crack is getting worse and may collapse soon.",
    "employeeId": 5,
    "createdBy": "Alice Wang",
    "createDate": "2025-12-12T12:05:00",
    "status": "InProgress",
    "statusDisplayName": "In Progress",
    "comments": []
  },
  "timestamp": "2025-12-12T15:20:00"
}
```

**Error**:
- `404`: 报修记录不存在
- `403`: 只能更新自己创建的报修记录

---

### 4.7 添加评论

**接口名**: Add Comment

**Endpoint**: `POST /api/facility-reports/comments`

**说明**: 员工和 HR 都可以为报修记录添加评论

**Request Body**:
```json
{
  "facilityReportId": 10,
  "comment": "I've taken photos of the damage. Can share if needed."
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": 3,
    "facilityReportId": 10,
    "employeeId": 5,
    "createdBy": "Alice Wang",
    "comment": "I've taken photos of the damage. Can share if needed.",
    "createDate": "2025-12-12T15:25:00",
    "lastModificationDate": null,
    "displayDate": "2025-12-12T15:25:00",
    "canEdit": true
  },
  "timestamp": "2025-12-12T15:25:00"
}
```

**Error**:
- `404`: 报修记录不存在
- `400`: 评论内容为空

---

### 4.8 更新评论

**接口名**: Update Comment

**Endpoint**: `PUT /api/facility-reports/comments/{commentId}`

**权限**: 仅评论创建者

**说明**: 员工只能更新自己的评论，HR 只能更新 HR 创建的评论

**Request**:
- Path Parameter: `commentId` (评论 ID)

**Request Body**:
```json
{
  "comment": "I've taken photos of the damage and sent them via email to HR."
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "id": 3,
    "facilityReportId": 10,
    "employeeId": 5,
    "createdBy": "Alice Wang",
    "comment": "I've taken photos of the damage and sent them via email to HR.",
    "createDate": "2025-12-12T15:25:00",
    "lastModificationDate": "2025-12-12T15:30:00",
    "displayDate": "2025-12-12T15:30:00",
    "canEdit": true
  },
  "timestamp": "2025-12-12T15:30:00"
}
```

**Error**:
- `404`: 评论不存在
- `403`: 只能更新自己创建的评论

---

### 4.9 获取报修的所有评论

**接口名**: Get Report Comments

**Endpoint**: `GET /api/facility-reports/{reportId}/comments`

**Request**:
- Path Parameter: `reportId` (报修记录 ID)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "facilityReportId": 10,
      "employeeId": 5,
      "createdBy": "Alice Wang",
      "comment": "This issue is urgent, please fix as soon as possible.",
      "createDate": "2025-12-12T12:10:00",
      "lastModificationDate": null,
      "displayDate": "2025-12-12T12:10:00",
      "canEdit": true
    },
    {
      "id": 2,
      "facilityReportId": 10,
      "employeeId": 100,
      "createdBy": "HR Admin",
      "comment": "We have contacted the landlord. Repair scheduled for Dec 15.",
      "createDate": "2025-12-12T14:30:00",
      "lastModificationDate": null,
      "displayDate": "2025-12-12T14:30:00",
      "canEdit": false
    },
    {
      "id": 3,
      "facilityReportId": 10,
      "employeeId": 5,
      "createdBy": "Alice Wang",
      "comment": "I've taken photos of the damage and sent them via email to HR.",
      "createDate": "2025-12-12T15:25:00",
      "lastModificationDate": "2025-12-12T15:30:00",
      "displayDate": "2025-12-12T15:30:00",
      "canEdit": true
    }
  ],
  "timestamp": "2025-12-12T15:35:00"
}
```

---

### 4.10 获取我的报修记录 (Employee)

**接口名**: Get My Reports

**Endpoint**: `GET /api/facility-reports/my-reports`

**权限**: Employee

**说明**: 获取当前员工提交的所有报修记录

**Request**: 无需参数

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 10,
      "title": "Bed frame broken",
      "createDate": "2025-12-12T12:05:00",
      "status": "InProgress",
      "statusDisplayName": "In Progress"
    },
    {
      "id": 7,
      "title": "Air conditioner not cooling",
      "createDate": "2025-12-05T10:15:00",
      "status": "Closed",
      "statusDisplayName": "Closed"
    }
  ],
  "timestamp": "2025-12-12T15:40:00"
}
```

---

### 4.11 获取当前房屋的报修记录 (Employee)

**接口名**: Get Reports for My House

**Endpoint**: `GET /api/facility-reports/house/current`

**权限**: Employee

**说明**: 获取当前员工所在房屋的所有报修记录（包括室友提交的）

**Request**: 无需参数（房屋 ID 从 JWT 的 X-House-Id 头中获取）

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 10,
      "title": "Bed frame broken",
      "createDate": "2025-12-12T12:05:00",
      "status": "InProgress",
      "statusDisplayName": "In Progress"
    },
    {
      "id": 9,
      "title": "Leaking faucet in bathroom",
      "createDate": "2025-12-10T09:30:00",
      "status": "Closed",
      "statusDisplayName": "Closed"
    },
    {
      "id": 8,
      "title": "Broken chair",
      "createDate": "2025-12-08T16:20:00",
      "status": "Open",
      "statusDisplayName": "Open"
    }
  ],
  "timestamp": "2025-12-12T15:45:00"
}
```

**Response Success (200) - No House Assigned**:
```json
{
  "success": true,
  "message": "You are not assigned to any house",
  "data": [],
  "timestamp": "2025-12-12T15:45:00"
}
```

---

## 附录

### 报修状态枚举值
| 状态值 | 显示名称 | 说明 |
|--------|----------|------|
| `Open` | Open | 待处理 |
| `InProgress` | In Progress | 处理中 |
| `Closed` | Closed | 已关闭 |

### 常见设施类型
- Bed (床)
- Mattress (床垫)
- Table (桌子)
- Chair (椅子)
- Sofa (沙发)
- Desk (书桌)
- Dresser (衣柜)
- Refrigerator (冰箱)
- Microwave (微波炉)
- Air Conditioner (空调)

### 角色权限说明
- **HR**: 拥有所有权限，可以管理房屋、房东、设施，查看所有报修记录并更新状态
- **EMPLOYEE**: 只能查看自己被分配的房屋信息、室友列表，可以创建报修记录并添加评论
