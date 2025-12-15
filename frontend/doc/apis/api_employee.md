# Employee Service API 接口文档

## 全局说明

### Base URL
```
http://your-domain.com/api
```

### 鉴权机制
- 所有受保护的接口都需要在请求头中携带 JWT Token：
  ```
  Authorization: Bearer <your_jwt_token>
  ```
- 鉴权失败返回 `401 Unauthorized`
- 权限不足返回 `403 Forbidden`

### 通用错误响应
```json
{
  "timestamp": "2025-12-12T10:30:00",
  "status": 401,
  "message": "Unauthorized"
}
```

```json
{
  "timestamp": "2025-12-12T10:30:00",
  "status": 403,
  "message": "Forbidden - Insufficient permissions"
}
```

---

## 员工管理接口

### 1. 获取所有员工列表

**接口名**：获取所有员工信息（无分页）

**Endpoint**：`GET /api/employees`

**权限要求**：需要 HR 角色

**Request**：
- 无请求参数

**Response**：

**Success (200)**：
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "userID": 1001,
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "Michael",
    "preferredName": "Johnny",
    "email": "john.doe@example.com",
    "cellPhone": "+1-555-123-4567",
    "alternatePhone": "+1-555-987-6543",
    "gender": "Male",
    "SSN": "123-45-6789",
    "DOB": "1990-05-15T00:00:00",
    "startDate": "2023-01-10T09:00:00",
    "endDate": null,
    "driverLicense": "D1234567",
    "driverLicenseExpiration": "2026-05-15T00:00:00",
    "houseID": 5001,
    "contact": [
      {
        "id": "c1e8d9f2-3b4a-5c6d-7e8f-9a0b1c2d3e4f",
        "firstName": "Jane",
        "lastName": "Doe",
        "cellPhone": "+1-555-111-2222",
        "alternatePhone": "",
        "email": "jane.doe@example.com",
        "relationship": "Spouse",
        "type": "Emergency"
      }
    ],
    "address": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "addressLine1": "123 Main Street",
        "addressLine2": "Apt 4B",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      }
    ],
    "visaStatus": [
      {
        "id": "v1a2b3c4-d5e6-7890-abcd-ef1234567890",
        "visaType": "H1B",
        "activeFlag": "Y",
        "startDate": "2023-01-01T00:00:00",
        "endDate": "2026-01-01T00:00:00",
        "lastModificationDate": "2023-01-05T10:30:00"
      }
    ],
    "personalDocument": [
      {
        "id": "d1e2f3g4-h5i6-7890-jklm-nop1234567890",
        "path": "https://s3.amazonaws.com/hr-docs/employees/507f1f77bcf86cd799439011/passport.pdf",
        "title": "Passport",
        "comment": "Valid until 2030",
        "createDate": "2023-01-10T14:20:00"
      }
    ]
  },
  {
    "id": "507f1f77bcf86cd799439022",
    "userID": 1002,
    "firstName": "Alice",
    "lastName": "Smith",
    "middleName": "Marie",
    "preferredName": "Ali",
    "email": "alice.smith@example.com",
    "cellPhone": "+1-555-234-5678",
    "alternatePhone": "",
    "gender": "Female",
    "SSN": "987-65-4321",
    "DOB": "1992-08-20T00:00:00",
    "startDate": "2022-06-15T09:00:00",
    "endDate": null,
    "driverLicense": "D9876543",
    "driverLicenseExpiration": "2027-08-20T00:00:00",
    "houseID": 5002,
    "contact": [],
    "address": [],
    "visaStatus": [],
    "personalDocument": []
  }
]
```

**Error**：
- `500 Internal Server Error`：服务器内部错误

---

### 2. 获取员工列表（分页）

**接口名**：获取员工信息（支持分页和排序）

**Endpoint**：`GET /api/employees/page`

**权限要求**：需要 HR 角色

**Request**：

**Query Params**：
- `page`：页码，从 0 开始（可选，默认 0）
- `size`：每页大小（可选，默认 3）
- `sort`：排序字段和方向（可选，默认 `lastName,asc`）

**请求示例**：
```
GET /api/employees/page?page=0&size=10&sort=lastName,asc
```

**Response**：

**Success (200)**：
```json
{
  "content": [
    {
      "id": "507f1f77bcf86cd799439011",
      "userID": 1001,
      "firstName": "John",
      "lastName": "Doe",
      "middleName": "Michael",
      "preferredName": "Johnny",
      "email": "john.doe@example.com",
      "cellPhone": "+1-555-123-4567",
      "alternatePhone": "+1-555-987-6543",
      "gender": "Male",
      "SSN": "123-45-6789",
      "DOB": "1990-05-15T00:00:00",
      "startDate": "2023-01-10T09:00:00",
      "endDate": null,
      "driverLicense": "D1234567",
      "driverLicenseExpiration": "2026-05-15T00:00:00",
      "houseID": 5001,
      "contact": [],
      "address": [],
      "visaStatus": [],
      "personalDocument": []
    },
    {
      "id": "507f1f77bcf86cd799439022",
      "userID": 1002,
      "firstName": "Alice",
      "lastName": "Smith",
      "middleName": "Marie",
      "preferredName": "Ali",
      "email": "alice.smith@example.com",
      "cellPhone": "+1-555-234-5678",
      "alternatePhone": "",
      "gender": "Female",
      "SSN": "987-65-4321",
      "DOB": "1992-08-20T00:00:00",
      "startDate": "2022-06-15T09:00:00",
      "endDate": null,
      "driverLicense": "D9876543",
      "driverLicenseExpiration": "2027-08-20T00:00:00",
      "houseID": 5002,
      "contact": [],
      "address": [],
      "visaStatus": [],
      "personalDocument": []
    }
  ],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "pageNumber": 0,
    "pageSize": 10,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 5,
  "totalElements": 50,
  "last": false,
  "first": true,
  "size": 10,
  "number": 0,
  "sort": {
    "sorted": true,
    "unsorted": false,
    "empty": false
  },
  "numberOfElements": 10,
  "empty": false
}
```

**Error**：
- `500 Internal Server Error`：服务器内部错误

---

### 3. 根据员工ID获取员工信息

**接口名**：查询指定员工的详细信息

**Endpoint**：`GET /api/employees/{id}`

**权限要求**：需要认证

**Request**：

**Path Variable**：
- `id`：员工ID（MongoDB ObjectId）

**请求示例**：
```
GET /api/employees/507f1f77bcf86cd799439011
```

**Response**：

**Success (200)**：
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userID": 1001,
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "preferredName": "Johnny",
  "email": "john.doe@example.com",
  "cellPhone": "+1-555-123-4567",
  "alternatePhone": "+1-555-987-6543",
  "gender": "Male",
  "SSN": "123-45-6789",
  "DOB": "1990-05-15T00:00:00",
  "startDate": "2023-01-10T09:00:00",
  "endDate": null,
  "driverLicense": "D1234567",
  "driverLicenseExpiration": "2026-05-15T00:00:00",
  "houseID": 5001,
  "contact": [
    {
      "id": "c1e8d9f2-3b4a-5c6d-7e8f-9a0b1c2d3e4f",
      "firstName": "Jane",
      "lastName": "Doe",
      "cellPhone": "+1-555-111-2222",
      "alternatePhone": "",
      "email": "jane.doe@example.com",
      "relationship": "Spouse",
      "type": "Emergency"
    }
  ],
  "address": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  ],
  "visaStatus": [
    {
      "id": "v1a2b3c4-d5e6-7890-abcd-ef1234567890",
      "visaType": "H1B",
      "activeFlag": "Y",
      "startDate": "2023-01-01T00:00:00",
      "endDate": "2026-01-01T00:00:00",
      "lastModificationDate": "2023-01-05T10:30:00"
    }
  ],
  "personalDocument": [
    {
      "id": "d1e2f3g4-h5i6-7890-jklm-nop1234567890",
      "path": "https://s3.amazonaws.com/hr-docs/employees/507f1f77bcf86cd799439011/passport.pdf",
      "title": "Passport",
      "comment": "Valid until 2030",
      "createDate": "2023-01-10T14:20:00"
    }
  ]
}
```

**Error**：
- `404 Not Found`：员工不存在
- `500 Internal Server Error`：服务器内部错误

---

### 4. 根据用户ID获取员工信息

**接口名**：通过用户ID查询员工信息（内部服务调用）

**Endpoint**：`GET /api/employees/user/{userID}`

**权限要求**：无（内部服务调用）

**Request**：

**Path Variable**：
- `userID`：用户ID（Long 类型）

**请求示例**：
```
GET /api/employees/user/1001
```

**Response**：

**Success (200)**：
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userID": 1001,
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "preferredName": "Johnny",
  "email": "john.doe@example.com",
  "cellPhone": "+1-555-123-4567",
  "alternatePhone": "+1-555-987-6543",
  "gender": "Male",
  "SSN": "123-45-6789",
  "DOB": "1990-05-15T00:00:00",
  "startDate": "2023-01-10T09:00:00",
  "endDate": null,
  "driverLicense": "D1234567",
  "driverLicenseExpiration": "2026-05-15T00:00:00",
  "houseID": 5001,
  "contact": [],
  "address": [],
  "visaStatus": [],
  "personalDocument": []
}
```

**Error**：
- `404 Not Found`：用户对应的员工不存在
- `500 Internal Server Error`：服务器内部错误

---

### 5. 更新员工信息

**接口名**：更新指定员工的完整信息

**Endpoint**：`PUT /api/employees/{id}`

**权限要求**：需要认证

**Request**：

**Path Variable**：
- `id`：员工ID（MongoDB ObjectId）

**Request Body**（JSON 格式）：
```json
{
  "userID": 1001,
  "firstName": "John",                      // 必填，名字
  "lastName": "Doe",                        // 必填，姓氏
  "middleName": "Michael",                  // 可选，中间名
  "preferredName": "Johnny",                // 可选，昵称
  "email": "john.doe@example.com",          // 必填，邮箱
  "cellPhone": "+1-555-123-4567",           // 必填，手机号
  "alternatePhone": "+1-555-987-6543",      // 可选，备用电话
  "gender": "Male",                         // 必填，性别
  "SSN": "123-45-6789",                     // 必填，社会保险号
  "DOB": "1990-05-15T00:00:00",             // 必填，生日
  "startDate": "2023-01-10T09:00:00",       // 必填，入职日期
  "endDate": null,                          // 可选，离职日期
  "driverLicense": "D1234567",              // 可选，驾照号
  "driverLicenseExpiration": "2026-05-15T00:00:00",  // 可选，驾照过期日期
  "houseID": 5001,                          // 可选，住房ID
  "contact": [                              // 可选，紧急联系人列表
    {
      "id": "c1e8d9f2-3b4a-5c6d-7e8f-9a0b1c2d3e4f",
      "firstName": "Jane",
      "lastName": "Doe",
      "cellPhone": "+1-555-111-2222",
      "alternatePhone": "",
      "email": "jane.doe@example.com",
      "relationship": "Spouse",
      "type": "Emergency"
    }
  ],
  "address": [                              // 可选，地址列表
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  ],
  "visaStatus": [                           // 可选，签证状态列表
    {
      "id": "v1a2b3c4-d5e6-7890-abcd-ef1234567890",
      "visaType": "H1B",
      "activeFlag": "Y",
      "startDate": "2023-01-01T00:00:00",
      "endDate": "2026-01-01T00:00:00",
      "lastModificationDate": "2023-01-05T10:30:00"
    }
  ],
  "personalDocument": [                     // 可选，个人文档列表
    {
      "id": "d1e2f3g4-h5i6-7890-jklm-nop1234567890",
      "path": "https://s3.amazonaws.com/hr-docs/employees/507f1f77bcf86cd799439011/passport.pdf",
      "title": "Passport",
      "comment": "Valid until 2030",
      "createDate": "2023-01-10T14:20:00"
    }
  ]
}
```

**Response**：

**Success (200)**：
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userID": 1001,
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "preferredName": "Johnny",
  "email": "john.doe@example.com",
  "cellPhone": "+1-555-123-4567",
  "alternatePhone": "+1-555-987-6543",
  "gender": "Male",
  "SSN": "123-45-6789",
  "DOB": "1990-05-15T00:00:00",
  "startDate": "2023-01-10T09:00:00",
  "endDate": null,
  "driverLicense": "D1234567",
  "driverLicenseExpiration": "2026-05-15T00:00:00",
  "houseID": 5001,
  "contact": [
    {
      "id": "c1e8d9f2-3b4a-5c6d-7e8f-9a0b1c2d3e4f",
      "firstName": "Jane",
      "lastName": "Doe",
      "cellPhone": "+1-555-111-2222",
      "alternatePhone": "",
      "email": "jane.doe@example.com",
      "relationship": "Spouse",
      "type": "Emergency"
    }
  ],
  "address": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  ],
  "visaStatus": [
    {
      "id": "v1a2b3c4-d5e6-7890-abcd-ef1234567890",
      "visaType": "H1B",
      "activeFlag": "Y",
      "startDate": "2023-01-01T00:00:00",
      "endDate": "2026-01-01T00:00:00",
      "lastModificationDate": "2023-01-05T10:30:00"
    }
  ],
  "personalDocument": [
    {
      "id": "d1e2f3g4-h5i6-7890-jklm-nop1234567890",
      "path": "https://s3.amazonaws.com/hr-docs/employees/507f1f77bcf86cd799439011/passport.pdf",
      "title": "Passport",
      "comment": "Valid until 2030",
      "createDate": "2023-01-10T14:20:00"
    }
  ]
}
```

**Error**：
- `400 Bad Request`：请求参数验证失败
  ```json
  {
    "timestamp": "2025-12-12T10:30:00",
    "status": 400,
    "message": "Invalid employee data"
  }
  ```
- `404 Not Found`：员工不存在
- `500 Internal Server Error`：服务器内部错误

---

### 6. 搜索员工

**接口名**：根据姓名搜索员工

**Endpoint**：`GET /api/employees/search`

**权限要求**：需要 HR 角色

**Request**：

**Query Params**：
- `name`：搜索关键词（必填）

**请求示例**：
```
GET /api/employees/search?name=John
```

**Response**：

**Success (200)**：
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "userID": 1001,
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "Michael",
    "preferredName": "Johnny",
    "email": "john.doe@example.com",
    "cellPhone": "+1-555-123-4567",
    "alternatePhone": "+1-555-987-6543",
    "gender": "Male",
    "SSN": "123-45-6789",
    "DOB": "1990-05-15T00:00:00",
    "startDate": "2023-01-10T09:00:00",
    "endDate": null,
    "driverLicense": "D1234567",
    "driverLicenseExpiration": "2026-05-15T00:00:00",
    "houseID": 5001,
    "contact": [],
    "address": [],
    "visaStatus": [],
    "personalDocument": []
  },
  {
    "id": "507f1f77bcf86cd799439022",
    "userID": 1003,
    "firstName": "Johnny",
    "lastName": "Smith",
    "middleName": "",
    "preferredName": "Jon",
    "email": "johnny.smith@example.com",
    "cellPhone": "+1-555-345-6789",
    "alternatePhone": "",
    "gender": "Male",
    "SSN": "456-78-9012",
    "DOB": "1988-03-12T00:00:00",
    "startDate": "2022-03-20T09:00:00",
    "endDate": null,
    "driverLicense": "D3456789",
    "driverLicenseExpiration": "2028-03-12T00:00:00",
    "houseID": 5003,
    "contact": [],
    "address": [],
    "visaStatus": [],
    "personalDocument": []
  }
]
```

**Error**：
- `500 Internal Server Error`：服务器内部错误

---

### 7. 删除员工

**接口名**：删除指定员工

**Endpoint**：`DELETE /api/employees/{id}`

**权限要求**：需要认证

**Request**：

**Path Variable**：
- `id`：员工ID（MongoDB ObjectId）

**请求示例**：
```
DELETE /api/employees/507f1f77bcf86cd799439011
```

**Response**：

**Success (200)**：
```
无响应体
```

**Error**：
- `404 Not Found`：员工不存在
- `500 Internal Server Error`：服务器内部错误

---

### 8. 根据房屋ID获取员工列表

**接口名**：查询指定房屋的所有员工（室友列表）

**Endpoint**：`GET /api/employees/house/{houseId}`

**权限要求**：需要 HR 角色

**Request**：

**Path Variable**：
- `houseId`：房屋ID（Long 类型）

**请求示例**：
```
GET /api/employees/house/5001
```

**Response**：

**Success (200)**：
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "userID": 1001,
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "Michael",
    "preferredName": "Johnny",
    "email": "john.doe@example.com",
    "cellPhone": "+1-555-123-4567",
    "alternatePhone": "+1-555-987-6543",
    "gender": "Male",
    "SSN": "123-45-6789",
    "DOB": "1990-05-15T00:00:00",
    "startDate": "2023-01-10T09:00:00",
    "endDate": null,
    "driverLicense": "D1234567",
    "driverLicenseExpiration": "2026-05-15T00:00:00",
    "houseID": 5001,
    "contact": [],
    "address": [],
    "visaStatus": [],
    "personalDocument": []
  },
  {
    "id": "507f1f77bcf86cd799439033",
    "userID": 1004,
    "firstName": "Sarah",
    "lastName": "Johnson",
    "middleName": "Elizabeth",
    "preferredName": "Sara",
    "email": "sarah.johnson@example.com",
    "cellPhone": "+1-555-456-7890",
    "alternatePhone": "",
    "gender": "Female",
    "SSN": "789-01-2345",
    "DOB": "1994-11-08T00:00:00",
    "startDate": "2023-05-01T09:00:00",
    "endDate": null,
    "driverLicense": "D7890123",
    "driverLicenseExpiration": "2029-11-08T00:00:00",
    "houseID": 5001,
    "contact": [],
    "address": [],
    "visaStatus": [],
    "personalDocument": []
  }
]
```

**Error**：
- `500 Internal Server Error`：服务器内部错误

---

### 9. 统计房屋员工数量

**接口名**：获取指定房屋的员工数量

**Endpoint**：`GET /api/employees/house/{houseId}/count`

**权限要求**：需要 HR 角色

**Request**：

**Path Variable**：
- `houseId`：房屋ID（Long 类型）

**请求示例**：
```
GET /api/employees/house/5001/count
```

**Response**：

**Success (200)**：
```json
2
```

**Error**：
- `500 Internal Server Error`：服务器内部错误

---

### 10. 创建员工

**接口名**：创建新员工（注册流程）

**Endpoint**：`POST /api/employees`

**权限要求**：无（内部服务调用）

**Request**：

**Request Body**（JSON 格式）：
```json
{
  "userID": 1005,                           // 必填，用户ID
  "firstName": "Emily",                     // 必填，名字
  "lastName": "Brown",                      // 必填，姓氏
  "middleName": "Grace",                    // 可选，中间名
  "preferredName": "Em",                    // 可选，昵称
  "email": "emily.brown@example.com",       // 必填，邮箱
  "cellPhone": "+1-555-567-8901",           // 必填，手机号
  "alternatePhone": "",                     // 可选，备用电话
  "gender": "Female",                       // 必填，性别
  "SSN": "234-56-7890",                     // 必填，社会保险号
  "DOB": "1996-02-14T00:00:00",             // 必填，生日
  "startDate": "2025-02-01T09:00:00",       // 必填，入职日期
  "endDate": null,                          // 可选，离职日期
  "driverLicense": "D2345678",              // 可选，驾照号
  "driverLicenseExpiration": "2030-02-14T00:00:00",  // 可选，驾照过期日期
  "houseID": null,                          // 可选，住房ID
  "contact": [],                            // 可选，紧急联系人列表
  "address": [],                            // 可选，地址列表
  "visaStatus": [],                         // 可选，签证状态列表
  "personalDocument": []                    // 可选，个人文档列表
}
```

**Response**：

**Success (201)**：
```json
{
  "id": "507f1f77bcf86cd799439044",
  "userID": 1005,
  "firstName": "Emily",
  "lastName": "Brown",
  "middleName": "Grace",
  "preferredName": "Em",
  "email": "emily.brown@example.com",
  "cellPhone": "+1-555-567-8901",
  "alternatePhone": "",
  "gender": "Female",
  "SSN": "234-56-7890",
  "DOB": "1996-02-14T00:00:00",
  "startDate": "2025-02-01T09:00:00",
  "endDate": null,
  "driverLicense": "D2345678",
  "driverLicenseExpiration": "2030-02-14T00:00:00",
  "houseID": null,
  "contact": [],
  "address": [],
  "visaStatus": [],
  "personalDocument": []
}
```

**Error**：
- `400 Bad Request`：请求参数验证失败
  ```json
  {
    "firstName": "First name is required",
    "email": "Invalid email format"
  }
  ```
- `500 Internal Server Error`：服务器内部错误

---

## 员工文档管理接口

### 11. 上传员工个人文档

**接口名**：上传员工个人文档到 S3

**Endpoint**：`POST /api/employees/{employeeId}/documents`

**权限要求**：需要认证

**Request**：

**Path Variable**：
- `employeeId`：员工ID（MongoDB ObjectId）

**Request Body**（multipart/form-data 格式）：
- `file`：文件对象（必填）
- `title`：文档标题（必填，如 "Passport", "I-94"）
- `comment`：文档备注（可选）

**请求示例（使用 FormData）**：
```javascript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('title', 'Passport');
formData.append('comment', 'Valid until 2030');

fetch('/api/employees/507f1f77bcf86cd799439011/documents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>'
  },
  body: formData
});
```

**Response**：

**Success (200)**：
```json
{
  "id": "d1e2f3g4-h5i6-7890-jklm-nop1234567890",
  "path": "https://hr-onboarding-docs.s3.us-east-1.amazonaws.com/employees/507f1f77bcf86cd799439011/documents/passport-1702345678901.pdf",
  "title": "Passport",
  "comment": "Valid until 2030",
  "createDate": "2025-12-12T10:30:00"
}
```

**Error**：
- `400 Bad Request`：文件上传失败或参数错误
  ```json
  {
    "timestamp": "2025-12-12T10:30:00",
    "status": 400,
    "message": "File is required"
  }
  ```
- `404 Not Found`：员工不存在
- `500 Internal Server Error`：S3 上传失败

---

### 12. 删除员工个人文档

**接口名**：删除员工的个人文档

**Endpoint**：`DELETE /api/employees/{employeeId}/documents/{documentId}`

**权限要求**：需要认证

**Request**：

**Path Variable**：
- `employeeId`：员工ID（MongoDB ObjectId）
- `documentId`：文档ID（UUID）

**请求示例**：
```
DELETE /api/employees/507f1f77bcf86cd799439011/documents/d1e2f3g4-h5i6-7890-jklm-nop1234567890
```

**Response**：

**Success (200)**：
```
无响应体
```

**Error**：
- `404 Not Found`：员工或文档不存在
- `500 Internal Server Error`：S3 删除失败或其他服务器错误

---

## 数据模型

### Employee（员工）
```json
{
  "id": "507f1f77bcf86cd799439011",                    // MongoDB ObjectId
  "userID": 1001,                                       // 关联的用户ID
  "firstName": "John",                                  // 名字
  "lastName": "Doe",                                    // 姓氏
  "middleName": "Michael",                              // 中间名
  "preferredName": "Johnny",                            // 昵称
  "email": "john.doe@example.com",                      // 邮箱
  "cellPhone": "+1-555-123-4567",                       // 手机号
  "alternatePhone": "+1-555-987-6543",                  // 备用电话
  "gender": "Male",                                     // 性别（Male/Female/Other）
  "SSN": "123-45-6789",                                 // 社会保险号
  "DOB": "1990-05-15T00:00:00",                         // 生日
  "startDate": "2023-01-10T09:00:00",                   // 入职日期
  "endDate": null,                                      // 离职日期
  "driverLicense": "D1234567",                          // 驾照号
  "driverLicenseExpiration": "2026-05-15T00:00:00",     // 驾照过期日期
  "houseID": 5001,                                      // 住房ID
  "contact": [],                                        // 紧急联系人列表
  "address": [],                                        // 地址列表
  "visaStatus": [],                                     // 签证状态列表
  "personalDocument": []                                // 个人文档列表
}
```

### Contact（联系人）
```json
{
  "id": "c1e8d9f2-3b4a-5c6d-7e8f-9a0b1c2d3e4f",         // UUID
  "firstName": "Jane",                                  // 名字
  "lastName": "Doe",                                    // 姓氏
  "cellPhone": "+1-555-111-2222",                       // 手机号
  "alternatePhone": "",                                 // 备用电话
  "email": "jane.doe@example.com",                      // 邮箱
  "relationship": "Spouse",                             // 关系（Spouse/Parent/Sibling/Friend）
  "type": "Emergency"                                   // 类型（Emergency/Reference）
}
```

### Address（地址）
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",         // UUID
  "addressLine1": "123 Main Street",                    // 地址第一行
  "addressLine2": "Apt 4B",                             // 地址第二行
  "city": "New York",                                   // 城市
  "state": "NY",                                        // 州/省
  "zipCode": "10001"                                    // 邮编
}
```

### VisaStatus（签证状态）
```json
{
  "id": "v1a2b3c4-d5e6-7890-abcd-ef1234567890",         // UUID
  "visaType": "H1B",                                    // 签证类型（H1B/F1/L1/OPT）
  "activeFlag": "Y",                                    // 是否激活（Y/N）
  "startDate": "2023-01-01T00:00:00",                   // 开始日期
  "endDate": "2026-01-01T00:00:00",                     // 结束日期
  "lastModificationDate": "2023-01-05T10:30:00"         // 最后修改日期
}
```

### PersonalDocument（个人文档）
```json
{
  "id": "d1e2f3g4-h5i6-7890-jklm-nop1234567890",                                                              // UUID
  "path": "https://hr-onboarding-docs.s3.us-east-1.amazonaws.com/employees/507f1f77bcf86cd799439011/passport.pdf",  // S3 文件路径
  "title": "Passport",                                                                                        // 文档标题
  "comment": "Valid until 2030",                                                                              // 备注
  "createDate": "2023-01-10T14:20:00"                                                                         // 创建日期
}
```

---

## 日期时间格式

所有日期时间字段使用 ISO 8601 格式：
- 格式：`yyyy-MM-dd'T'HH:mm:ss`
- 示例：`2025-12-12T10:30:00`

---

## 接口权限说明

| 接口 | 权限要求 |
|------|---------|
| GET /api/employees | HR |
| GET /api/employees/page | HR |
| GET /api/employees/{id} | 已认证 |
| GET /api/employees/user/{userID} | 无（内部服务） |
| PUT /api/employees/{id} | 已认证 |
| GET /api/employees/search | HR |
| DELETE /api/employees/{id} | 已认证 |
| GET /api/employees/house/{houseId} | HR |
| GET /api/employees/house/{houseId}/count | HR |
| POST /api/employees | 无（内部服务） |
| POST /api/employees/{employeeId}/documents | 已认证 |
| DELETE /api/employees/{employeeId}/documents/{documentId} | 已认证 |
