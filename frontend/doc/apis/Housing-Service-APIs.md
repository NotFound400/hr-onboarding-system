# Housing Service API Documentation

## 概述

Housing Service 是一个房屋管理微服务，提供房屋、设施、设施报修和房东管理功能。API 基于用户角色（HR/Employee）返回不同的数据视图。

**Base URL:** `/api/housing`

**通用请求头:**
| Header | 描述 | 必需 |
|--------|------|------|
| X-User-Id | 用户ID | 部分API需要 |
| X-Username | 用户名 | 可选 |
| X-User-Roles | 用户角色（如：HR, EMPLOYEE） | 部分API需要 |

---

## 通用响应格式

所有API响应都使用统一的 `ApiResponse` 格式：

```json
{
  "success": true,
  "message": "Success",
  "data": { },
  "errors": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

**错误响应示例:**
```json
{
  "success": false,
  "message": "Resource not found",
  "data": null,
  "errors": ["House with id 999 not found"],
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 1. House Management APIs (房屋管理)

### 1.1 获取所有房屋列表（基于角色）

根据用户角色返回不同数据：HR查看所有房屋完整信息，Employee只查看自己分配的房屋。

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/houses` |
| **权限** | HR / Employee |

**Request Headers:**
```
X-User-Id: 1
X-Username: john.doe
X-User-Roles: HR
```

**Response (HR View):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "address": "123 Main Street, Apt 101",
      "maxOccupant": 4,
      "numberOfEmployees": 3,
      "landlordId": 1,
      "landlordFullName": "John Smith",
      "landlordPhone": "123-456-7890",
      "landlordEmail": "john.smith@email.com",
      "viewType": "HR_VIEW"
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

**Response (Employee View):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "address": "123 Main Street, Apt 101",
      "roommates": [
        {
          "employeeId": 2,
          "name": "Jane Doe",
          "phone": "111-222-3333"
        }
      ],
      "viewType": "EMPLOYEE_VIEW"
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 1.2 获取房屋详情（基于角色）

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/houses/{id}` |
| **权限** | HR / Employee |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 房屋ID |

**Request Headers:**
```
X-User-Id: 1
X-User-Roles: HR
```

**Response (HR View):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "address": "123 Main Street, Apt 101",
    "maxOccupant": 4,
    "numberOfEmployees": 3,
    "landlord": {
      "id": 1,
      "firstName": "John",
      "lastName": "Smith",
      "fullName": "John Smith",
      "email": "john.smith@email.com",
      "cellPhone": "123-456-7890"
    },
    "facilitySummary": {
      "Bed": 4,
      "Mattress": 4,
      "Table": 2,
      "Chair": 4
    },
    "facilities": [
      {
        "id": 1,
        "houseId": 1,
        "type": "Bed",
        "description": "Single bed",
        "quantity": 4
      }
    ],
    "viewType": "HR_VIEW"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

**Response (Employee View):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "address": "123 Main Street, Apt 101",
    "roommates": [
      {
        "employeeId": 2,
        "name": "Jane Doe",
        "phone": "111-222-3333"
      },
      {
        "employeeId": 3,
        "name": "Bob Wilson",
        "phone": "444-555-6666"
      }
    ],
    "viewType": "EMPLOYEE_VIEW"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 1.3 创建房屋 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `POST` |
| **URI** | `/api/housing/houses` |
| **权限** | HR |

**Request Headers:**
```
X-User-Roles: HR
Content-Type: application/json
```

**Request Body:**
```json
{
  "landlordId": 1,
  "address": "456 Oak Avenue, Suite 200",
  "maxOccupant": 6,
  "facilities": [
    {
      "houseId": null,
      "type": "Bed",
      "description": "Queen size bed",
      "quantity": 6
    },
    {
      "houseId": null,
      "type": "Desk",
      "description": "Study desk",
      "quantity": 6
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "House created successfully",
  "data": {
    "id": 2,
    "address": "456 Oak Avenue, Suite 200",
    "maxOccupant": 6,
    "numberOfEmployees": 0,
    "landlord": {
      "id": 1,
      "firstName": "John",
      "lastName": "Smith",
      "fullName": "John Smith",
      "email": "john.smith@email.com",
      "cellPhone": "123-456-7890"
    },
    "facilitySummary": {
      "Bed": 6,
      "Desk": 6
    },
    "facilities": [
      {
        "id": 3,
        "houseId": 2,
        "type": "Bed",
        "description": "Queen size bed",
        "quantity": 6
      },
      {
        "id": 4,
        "houseId": 2,
        "type": "Desk",
        "description": "Study desk",
        "quantity": 6
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 1.4 更新房屋 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `PUT` |
| **URI** | `/api/housing/houses/{id}` |
| **权限** | HR |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 房屋ID |

**Request Headers:**
```
X-User-Roles: HR
Content-Type: application/json
```

**Request Body:**
```json
{
  "landlordId": 2,
  "address": "456 Oak Avenue, Suite 201",
  "maxOccupant": 8
}
```

**Response:**
```json
{
  "success": true,
  "message": "House updated successfully",
  "data": {
    "id": 2,
    "address": "456 Oak Avenue, Suite 201",
    "maxOccupant": 8,
    "numberOfEmployees": 0,
    "landlord": {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Doe",
      "fullName": "Jane Doe",
      "email": "jane.doe@email.com",
      "cellPhone": "987-654-3210"
    },
    "facilitySummary": {},
    "facilities": []
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 1.5 删除房屋 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `DELETE` |
| **URI** | `/api/housing/houses/{id}` |
| **权限** | HR |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 房屋ID |

**Request Headers:**
```
X-User-Roles: HR
```

**Response:**
```json
{
  "success": true,
  "message": "House deleted successfully",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 1.6 获取HR房屋列表（显式HR端点）

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/houses/hr/list` |
| **权限** | HR |

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "address": "123 Main Street, Apt 101",
      "maxOccupant": 4,
      "numberOfEmployees": 3,
      "landlordId": 1,
      "landlordFullName": "John Smith",
      "landlordPhone": "123-456-7890",
      "landlordEmail": "john.smith@email.com"
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 1.7 获取HR房屋详情（显式HR端点）

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/houses/hr/{id}` |
| **权限** | HR |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 房屋ID |

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "address": "123 Main Street, Apt 101",
    "maxOccupant": 4,
    "numberOfEmployees": 3,
    "landlord": {
      "id": 1,
      "firstName": "John",
      "lastName": "Smith",
      "fullName": "John Smith",
      "email": "john.smith@email.com",
      "cellPhone": "123-456-7890"
    },
    "facilitySummary": {
      "Bed": 4,
      "Mattress": 4
    },
    "facilities": [
      {
        "id": 1,
        "houseId": 1,
        "type": "Bed",
        "description": "Single bed",
        "quantity": 4
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 1.8 获取我的房屋 (Employee)

员工获取自己被分配的房屋信息及室友列表。

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/houses/my-house` |
| **权限** | Employee |

**Request Headers:**
```
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "address": "123 Main Street, Apt 101",
    "residents": [
      {
        "employeeId": 1,
        "name": "Current User",
        "phone": "111-111-1111"
      },
      {
        "employeeId": 2,
        "name": "Jane Doe",
        "phone": "222-222-2222"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 1.9 员工查看房屋详情（显式Employee端点）

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/houses/employee/{id}` |
| **权限** | Employee（必须是该房屋的住户） |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 房屋ID |

**Request Headers:**
```
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "address": "123 Main Street, Apt 101",
    "residents": [
      {
        "employeeId": 1,
        "name": "Current User",
        "phone": "111-111-1111"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 1.10 获取房屋摘要列表（下拉选择用）

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/houses/summaries` |
| **权限** | 所有用户 |

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "address": "123 Main Street, Apt 101",
      "maxOccupant": 4,
      "currentOccupant": 3
    },
    {
      "id": 2,
      "address": "456 Oak Avenue",
      "maxOccupant": 6,
      "currentOccupant": 2
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 1.11 获取单个房屋摘要

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/houses/{id}/summary` |
| **权限** | 所有用户 |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 房屋ID |

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "address": "123 Main Street, Apt 101",
    "maxOccupant": 4,
    "currentOccupant": 3
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 1.12 检查房屋可用性

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/houses/{houseId}/availability` |
| **权限** | 所有用户 |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| houseId | Long | 房屋ID |

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "houseId": 1,
    "maxOccupant": 4,
    "currentOccupant": 3,
    "availableSpots": 1,
    "isAvailable": true
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 2. Facility Management APIs (设施管理)

### 2.1 添加设施 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `POST` |
| **URI** | `/api/housing/facilities` |
| **权限** | HR |

**Request Headers:**
```
X-User-Roles: HR
Content-Type: application/json
```

**Request Body:**
```json
{
  "houseId": 1,
  "type": "Bed",
  "description": "King size bed with memory foam mattress",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Facility added successfully",
  "data": {
    "id": 5,
    "houseId": 1,
    "type": "Bed",
    "description": "King size bed with memory foam mattress",
    "quantity": 2
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 2.2 获取设施详情 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/facilities/{id}` |
| **权限** | HR |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 设施ID |

**Request Headers:**
```
X-User-Roles: HR
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "houseId": 1,
    "type": "Bed",
    "description": "Single bed",
    "quantity": 4
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 2.3 获取房屋所有设施 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/facilities/house/{houseId}` |
| **权限** | HR |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| houseId | Long | 房屋ID |

**Request Headers:**
```
X-User-Roles: HR
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "houseId": 1,
      "type": "Bed",
      "description": "Single bed",
      "quantity": 4
    },
    {
      "id": 2,
      "houseId": 1,
      "type": "Mattress",
      "description": "Spring mattress",
      "quantity": 4
    },
    {
      "id": 3,
      "houseId": 1,
      "type": "Table",
      "description": "Study table",
      "quantity": 2
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 2.4 获取房屋设施统计摘要 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/facilities/house/{houseId}/summary` |
| **权限** | HR |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| houseId | Long | 房屋ID |

**Request Headers:**
```
X-User-Roles: HR
```

**Response:**
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
      "totalQuantity": 4
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 2.5 更新设施 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `PUT` |
| **URI** | `/api/housing/facilities/{id}` |
| **权限** | HR |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 设施ID |

**Request Headers:**
```
X-User-Roles: HR
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "Bed",
  "description": "Updated: Queen size bed",
  "quantity": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Facility updated successfully",
  "data": {
    "id": 1,
    "houseId": 1,
    "type": "Bed",
    "description": "Updated: Queen size bed",
    "quantity": 5
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 2.6 删除设施 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `DELETE` |
| **URI** | `/api/housing/facilities/{id}` |
| **权限** | HR |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 设施ID |

**Request Headers:**
```
X-User-Roles: HR
```

**Response:**
```json
{
  "success": true,
  "message": "Facility deleted successfully",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 3. Facility Report Management APIs (设施报修管理)

### 3.1 创建设施报修 (Employee)

| 项目 | 内容 |
|------|------|
| **Method** | `POST` |
| **URI** | `/api/housing/facility-reports` |
| **权限** | Employee |

**Request Headers:**
```
X-User-Id: 1
Content-Type: application/json
```

**Request Body:**
```json
{
  "facilityId": 1,
  "title": "Bed frame broken",
  "description": "The bed frame has a crack on the left side and needs repair or replacement."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "id": 1,
    "facilityId": 1,
    "facilityType": "Bed",
    "houseId": 1,
    "houseAddress": "123 Main Street, Apt 101",
    "title": "Bed frame broken",
    "description": "The bed frame has a crack on the left side and needs repair or replacement.",
    "employeeId": 1,
    "createdBy": "John Doe",
    "createDate": "2024-01-15T10:30:00",
    "status": "Open",
    "statusDisplayName": "Open",
    "comments": []
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 3.2 获取报修详情

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/facility-reports/{id}` |
| **权限** | HR / Employee |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 报修ID |

**Request Headers:**
```
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "facilityId": 1,
    "facilityType": "Bed",
    "houseId": 1,
    "houseAddress": "123 Main Street, Apt 101",
    "title": "Bed frame broken",
    "description": "The bed frame has a crack on the left side.",
    "employeeId": 1,
    "createdBy": "John Doe",
    "createDate": "2024-01-15T10:30:00",
    "status": "InProgress",
    "statusDisplayName": "In Progress",
    "comments": [
      {
        "id": 1,
        "facilityReportId": 1,
        "employeeId": 2,
        "createdBy": "HR Manager",
        "comment": "We have scheduled a repair for next week.",
        "createDate": "2024-01-16T09:00:00",
        "lastModificationDate": null,
        "displayDate": "2024-01-16T09:00:00",
        "canEdit": false
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 3.3 获取房屋报修列表（分页）(HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/facility-reports/house/{houseId}` |
| **权限** | HR |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| houseId | Long | 房屋ID |

**Query Parameters:**
| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| page | int | 0 | 页码（从0开始） |
| size | int | 5 | 每页数量 |

**Request Headers:**
```
X-User-Roles: HR
```

**Request Example:**
```
GET /api/housing/facility-reports/house/1?page=0&size=5
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "content": [
      {
        "id": 1,
        "title": "Bed frame broken",
        "createDate": "2024-01-15T10:30:00",
        "status": "Open",
        "statusDisplayName": "Open"
      },
      {
        "id": 2,
        "title": "Air conditioner not working",
        "createDate": "2024-01-14T15:00:00",
        "status": "InProgress",
        "statusDisplayName": "In Progress"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 5
    },
    "totalElements": 2,
    "totalPages": 1,
    "last": true,
    "first": true
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 3.4 获取房屋所有报修（不分页）(HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/facility-reports/house/{houseId}/all` |
| **权限** | HR |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| houseId | Long | 房屋ID |

**Request Headers:**
```
X-User-Roles: HR
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "title": "Bed frame broken",
      "createDate": "2024-01-15T10:30:00",
      "status": "Open",
      "statusDisplayName": "Open"
    },
    {
      "id": 2,
      "title": "Air conditioner not working",
      "createDate": "2024-01-14T15:00:00",
      "status": "InProgress",
      "statusDisplayName": "In Progress"
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 3.5 更新报修状态 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `PATCH` |
| **URI** | `/api/housing/facility-reports/{id}/status` |
| **权限** | HR |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 报修ID |

**Request Headers:**
```
X-User-Roles: HR
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "InProgress"
}
```

> **Status 可选值:** `Open`, `InProgress`, `Closed`

**Response:**
```json
{
  "success": true,
  "message": "Report status updated successfully",
  "data": {
    "id": 1,
    "facilityId": 1,
    "facilityType": "Bed",
    "houseId": 1,
    "houseAddress": "123 Main Street, Apt 101",
    "title": "Bed frame broken",
    "description": "The bed frame has a crack on the left side.",
    "employeeId": 1,
    "createdBy": "John Doe",
    "createDate": "2024-01-15T10:30:00",
    "status": "InProgress",
    "statusDisplayName": "In Progress",
    "comments": []
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 3.6 更新报修内容（仅创建者）

| 项目 | 内容 |
|------|------|
| **Method** | `PUT` |
| **URI** | `/api/housing/facility-reports/{id}` |
| **权限** | 报修创建者 |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 报修ID |

**Request Headers:**
```
X-User-Id: 1
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Bed frame broken - URGENT",
  "description": "The bed frame has completely broken and needs immediate replacement."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {
    "id": 1,
    "facilityId": 1,
    "facilityType": "Bed",
    "houseId": 1,
    "houseAddress": "123 Main Street, Apt 101",
    "title": "Bed frame broken - URGENT",
    "description": "The bed frame has completely broken and needs immediate replacement.",
    "employeeId": 1,
    "createdBy": "John Doe",
    "createDate": "2024-01-15T10:30:00",
    "status": "Open",
    "statusDisplayName": "Open",
    "comments": []
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 3.7 添加评论

| 项目 | 内容 |
|------|------|
| **Method** | `POST` |
| **URI** | `/api/housing/facility-reports/comments` |
| **权限** | HR / Employee |

**Request Headers:**
```
X-User-Id: 1
Content-Type: application/json
```

**Request Body:**
```json
{
  "facilityReportId": 1,
  "comment": "I can provide more photos if needed."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": 2,
    "facilityReportId": 1,
    "employeeId": 1,
    "createdBy": "John Doe",
    "comment": "I can provide more photos if needed.",
    "createDate": "2024-01-16T14:00:00",
    "lastModificationDate": null,
    "displayDate": "2024-01-16T14:00:00",
    "canEdit": true
  },
  "timestamp": "2024-01-16T14:00:00"
}
```

---

### 3.8 更新评论（仅创建者）

| 项目 | 内容 |
|------|------|
| **Method** | `PUT` |
| **URI** | `/api/housing/facility-reports/comments/{commentId}` |
| **权限** | 评论创建者 |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| commentId | Long | 评论ID |

**Request Headers:**
```
X-User-Id: 1
Content-Type: application/json
```

**Request Body:**
```json
{
  "comment": "Updated: I have attached photos to the email."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "id": 2,
    "facilityReportId": 1,
    "employeeId": 1,
    "createdBy": "John Doe",
    "comment": "Updated: I have attached photos to the email.",
    "createDate": "2024-01-16T14:00:00",
    "lastModificationDate": "2024-01-16T15:30:00",
    "displayDate": "2024-01-16T15:30:00",
    "canEdit": true
  },
  "timestamp": "2024-01-16T15:30:00"
}
```

---

### 3.9 获取报修所有评论

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/facility-reports/{reportId}/comments` |
| **权限** | HR / Employee |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| reportId | Long | 报修ID |

**Request Headers:**
```
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "facilityReportId": 1,
      "employeeId": 2,
      "createdBy": "HR Manager",
      "comment": "We have scheduled a repair for next week.",
      "createDate": "2024-01-16T09:00:00",
      "lastModificationDate": null,
      "displayDate": "2024-01-16T09:00:00",
      "canEdit": false
    },
    {
      "id": 2,
      "facilityReportId": 1,
      "employeeId": 1,
      "createdBy": "John Doe",
      "comment": "Thank you for the update.",
      "createDate": "2024-01-16T14:00:00",
      "lastModificationDate": null,
      "displayDate": "2024-01-16T14:00:00",
      "canEdit": true
    }
  ],
  "timestamp": "2024-01-16T14:30:00"
}
```

---

### 3.10 获取我的报修列表 (Employee)

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/facility-reports/my-reports` |
| **权限** | Employee |

**Request Headers:**
```
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "title": "Bed frame broken",
      "createDate": "2024-01-15T10:30:00",
      "status": "InProgress",
      "statusDisplayName": "In Progress"
    },
    {
      "id": 3,
      "title": "Leaking faucet",
      "createDate": "2024-01-10T08:00:00",
      "status": "Closed",
      "statusDisplayName": "Closed"
    }
  ],
  "timestamp": "2024-01-16T10:00:00"
}
```

---

### 3.11 员工视图查看报修详情

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/facility-reports/{id}/employee-view` |
| **权限** | Employee |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 报修ID |

**Request Headers:**
```
X-User-Id: 1
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "title": "Bed frame broken",
    "description": "The bed frame has a crack on the left side.",
    "createdBy": "John Doe",
    "createDate": "2024-01-15T10:30:00",
    "status": "InProgress",
    "statusDisplayName": "In Progress",
    "comments": [
      {
        "id": 1,
        "facilityReportId": 1,
        "employeeId": 2,
        "createdBy": "HR Manager",
        "comment": "We have scheduled a repair for next week.",
        "createDate": "2024-01-16T09:00:00",
        "lastModificationDate": null,
        "displayDate": "2024-01-16T09:00:00",
        "canEdit": false
      }
    ]
  },
  "timestamp": "2024-01-16T10:00:00"
}
```

---

## 4. Landlord Management APIs (房东管理)

### 4.1 创建房东 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `POST` |
| **URI** | `/api/housing/landlords` |
| **权限** | HR |

**Request Headers:**
```
X-User-Roles: HR
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Robert",
  "lastName": "Johnson",
  "email": "robert.johnson@email.com",
  "cellPhone": "555-123-4567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Landlord created successfully",
  "data": {
    "id": 3,
    "firstName": "Robert",
    "lastName": "Johnson",
    "fullName": "Robert Johnson",
    "email": "robert.johnson@email.com",
    "cellPhone": "555-123-4567"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 4.2 获取房东详情

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/landlords/{id}` |
| **权限** | 所有用户 |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 房东ID |

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Smith",
    "fullName": "John Smith",
    "email": "john.smith@email.com",
    "cellPhone": "123-456-7890"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 4.3 获取所有房东列表 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/landlords` |
| **权限** | HR |

**Request Headers:**
```
X-User-Roles: HR
```

**Response:**
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
      "email": "john.smith@email.com",
      "cellPhone": "123-456-7890"
    },
    {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Doe",
      "fullName": "Jane Doe",
      "email": "jane.doe@email.com",
      "cellPhone": "987-654-3210"
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 4.4 更新房东 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `PUT` |
| **URI** | `/api/housing/landlords/{id}` |
| **权限** | HR |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 房东ID |

**Request Headers:**
```
X-User-Roles: HR
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith.new@email.com",
  "cellPhone": "111-222-3333"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Landlord updated successfully",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Smith",
    "fullName": "John Smith",
    "email": "john.smith.new@email.com",
    "cellPhone": "111-222-3333"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 4.5 删除房东 (HR Only)

| 项目 | 内容 |
|------|------|
| **Method** | `DELETE` |
| **URI** | `/api/housing/landlords/{id}` |
| **权限** | HR |

**Path Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| id | Long | 房东ID |

**Request Headers:**
```
X-User-Roles: HR
```

**Response:**
```json
{
  "success": true,
  "message": "Landlord deleted successfully",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### 4.6 搜索房东

| 项目 | 内容 |
|------|------|
| **Method** | `GET` |
| **URI** | `/api/housing/landlords/search` |
| **权限** | 所有用户 |

**Query Parameters:**
| 参数 | 类型 | 描述 |
|------|------|------|
| keyword | String | 搜索关键词（姓名） |

**Request Example:**
```
GET /api/housing/landlords/search?keyword=john
```

**Response:**
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
      "email": "john.smith@email.com",
      "cellPhone": "123-456-7890"
    },
    {
      "id": 3,
      "firstName": "Johnny",
      "lastName": "Walker",
      "fullName": "Johnny Walker",
      "email": "johnny.walker@email.com",
      "cellPhone": "444-555-6666"
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 5. API 快速参考表

### House APIs

| Method | URI | 权限 | 描述 |
|--------|-----|------|------|
| GET | `/api/housing/houses` | HR/Employee | 获取房屋列表（基于角色） |
| GET | `/api/housing/houses/{id}` | HR/Employee | 获取房屋详情（基于角色） |
| POST | `/api/housing/houses` | HR | 创建房屋 |
| PUT | `/api/housing/houses/{id}` | HR | 更新房屋 |
| DELETE | `/api/housing/houses/{id}` | HR | 删除房屋 |
| GET | `/api/housing/houses/hr/list` | HR | HR专用-获取所有房屋 |
| GET | `/api/housing/houses/hr/{id}` | HR | HR专用-获取房屋详情 |
| GET | `/api/housing/houses/my-house` | Employee | 获取我的房屋 |
| GET | `/api/housing/houses/employee/{id}` | Employee | Employee专用-获取房屋详情 |
| GET | `/api/housing/houses/summaries` | All | 获取房屋摘要列表 |
| GET | `/api/housing/houses/{id}/summary` | All | 获取单个房屋摘要 |
| GET | `/api/housing/houses/{houseId}/availability` | All | 检查房屋可用性 |

### Facility APIs

| Method | URI | 权限 | 描述 |
|--------|-----|------|------|
| POST | `/api/housing/facilities` | HR | 添加设施 |
| GET | `/api/housing/facilities/{id}` | HR | 获取设施详情 |
| GET | `/api/housing/facilities/house/{houseId}` | HR | 获取房屋所有设施 |
| GET | `/api/housing/facilities/house/{houseId}/summary` | HR | 获取设施统计摘要 |
| PUT | `/api/housing/facilities/{id}` | HR | 更新设施 |
| DELETE | `/api/housing/facilities/{id}` | HR | 删除设施 |

### Facility Report APIs

| Method | URI | 权限 | 描述 |
|--------|-----|------|------|
| POST | `/api/housing/facility-reports` | Employee | 创建报修 |
| GET | `/api/housing/facility-reports/{id}` | HR/Employee | 获取报修详情 |
| GET | `/api/housing/facility-reports/house/{houseId}` | HR | 获取房屋报修（分页） |
| GET | `/api/housing/facility-reports/house/{houseId}/all` | HR | 获取房屋所有报修 |
| PATCH | `/api/housing/facility-reports/{id}/status` | HR | 更新报修状态 |
| PUT | `/api/housing/facility-reports/{id}` | Creator | 更新报修内容 |
| POST | `/api/housing/facility-reports/comments` | HR/Employee | 添加评论 |
| PUT | `/api/housing/facility-reports/comments/{commentId}` | Creator | 更新评论 |
| GET | `/api/housing/facility-reports/{reportId}/comments` | HR/Employee | 获取评论列表 |
| GET | `/api/housing/facility-reports/my-reports` | Employee | 获取我的报修 |
| GET | `/api/housing/facility-reports/{id}/employee-view` | Employee | 员工视图报修详情 |

### Landlord APIs

| Method | URI | 权限 | 描述 |
|--------|-----|------|------|
| POST | `/api/housing/landlords` | HR | 创建房东 |
| GET | `/api/housing/landlords/{id}` | All | 获取房东详情 |
| GET | `/api/housing/landlords` | HR | 获取所有房东 |
| PUT | `/api/housing/landlords/{id}` | HR | 更新房东 |
| DELETE | `/api/housing/landlords/{id}` | HR | 删除房东 |
| GET | `/api/housing/landlords/search?keyword=xxx` | All | 搜索房东 |

---

## 6. 状态码说明

| HTTP状态码 | 描述 |
|-----------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问（权限不足） |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |

---

## 7. 枚举值参考

### FacilityReportStatus（报修状态）

| 值 | 显示名称 | 中文名称 |
|----|----------|----------|
| Open | Open | 待处理 |
| InProgress | In Progress | 处理中 |
| Closed | Closed | 已关闭 |
