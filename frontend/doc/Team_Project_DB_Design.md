# Database Design Specification
**文件名**: `doc/Team_Project_DB_Design.md`
**状态**: Updated for Hybrid ID Strategy (Mongo=String, SQL=Number)
**用途**: 定义后端数据库 Schema 及前端 TypeScript Interface 的单一数据源。

## 1. Authentication Service (SQL)
负责用户登录、鉴权及注册 Token 管理。

### Table: User
* **ID**: Primary Key (**Number**)
* **Username**: String (Unique)
* **Email**: String (Unique)
* **Password**: String (Encrypted)
* **CreateDate**: Datetime
* **LastModificationDate**: Datetime

### Table: Role
* **ID**: Primary Key (**Number**)
* **RoleName**: String (e.g., 'HR', 'Employee')
* **RoleDescription**: String
* **CreateDate**: Datetime
* **LastModificationDate**: Datetime

### Table: UserRole (Mapping Table)
* **ID**: Primary Key (**Number**)
* **UserID**: Foreign Key -> User.ID (**Number**)
* **RoleID**: Foreign Key -> Role.ID (**Number**)
* **ActiveFlag**: Boolean
* **CreateDate**: Datetime
* **LastModificationDate**: Datetime

### Table: RegistrationToken
* **ID**: Primary Key (**Number**)
* **Token**: String (Unique)
* **Email**: String (Target Email)
* **ExpirationDate**: Datetime
* **CreateBy**: String (HR User ID - **Number**)
* **CreateDate**: Datetime

---

## 2. Employee Service (MongoDB)
采用 MongoDB 文档存储。
*注意：本服务使用 ObjectId 字符串 ID，区别于 SQL 服务的数字 ID。*

### Collection: Employee
**Root Fields:**
* **ID**: Primary Key (**String**)  <-- MongoDB ObjectId
* **UserID**: **Number** (Ref -> Auth.User.ID)
* **FirstName**: String
* **LastName**: String
* **MiddleName**: String
* **PreferredName**: String
* **Email**: String
* **CellPhone**: String
* **AlternatePhone**: String
* **Gender**: String
* **SSN**: String
* **DOB**: Date
* **StartDate**: Date
* **EndDate**: Date
* **DriverLicense**: String
* **DriverLicenseExpiration**: Date
* **HouseID**: **Number** (Ref -> HousingService.House.ID)

**Nested Array: contacts** (包含 Reference 和 Emergency Contact，通过 Type 区分)
* **Type**: String (Enum: 'Reference', 'Emergency')
* **Name**: String (or split into First/Last based on requirement)
* **Phone**: String
* **Email**: String
* **Relationship**: String

**Nested Array: addresses**
* **Type**: String (Enum: 'Primary', 'Secondary')
* **AddressLine1**: String
* **AddressLine2**: String
* **City**: String
* **State**: String
* **ZipCode**: String

**Nested Array: visaStatuses**
* **VisaType**: String (Enum: 'OPT', 'H1B', 'L2', 'F1', 'H4', 'Other')
* **ActiveFlag**: Boolean
* **StartDate**: Date
* **EndDate**: Date
* **LastModificationDate**: Date

**Nested Array: personalDocuments**
* **ID**: **String** (MongoDB 子文档或 S3 Key 通常为 String)
* **Path**: String (S3 URL)
* **Title**: String (e.g., 'Driver License', 'OPT Receipt')
* **Comment**: String
* **CreateDate**: Date

---

## 3. Application Service (MySQL)
负责管理 Onboarding 和 VISA 申请的状态流转。

### Table: ApplicationWorkFlow
* **ID**: Primary Key (**Number**)
* **EmployeeID**: Foreign Key -> Employee.ID (**String**) <-- 必须匹配 MongoDB ID 类型
* **CreateDate**: Datetime
* **LastModificationDate**: Datetime
* **Status**: String (Enum: 'Open', 'Pending', 'Approved', 'Rejected')
* **Comment**: String (Rejection reason or HR notes)
* **Type**: String (Enum: 'Onboarding', 'OPT')

### Table: DigitalDocument
系统要求的文档模板配置表
* **ID**: Primary Key (**Number**)
* **Type**: String (e.g., 'I-983', 'I-20')
* **IsRequired**: Boolean
* **Path**: String (Template S3 URL)
* **Description**: String
* **Title**: String

---

## 4. Housing Service (MySQL)
负责房屋管理及设施报修。

### Table: House
* **ID**: Primary Key (**Number**)
* **LandlordID**: Foreign Key -> Landlord.ID (**Number**)
* **Address**: String
* **MaxOccupant**: Integer

### Table: Landlord
* **ID**: Primary Key (**Number**)
* **FirstName**: String
* **LastName**: String
* **Email**: String
* **CellPhone**: String

### Table: Facility
* **ID**: Primary Key (**Number**)
* **HouseID**: Foreign Key -> House.ID (**Number**)
* **Type**: String (e.g., 'Bed', 'Mattress', 'Table')
* **Description**: String
* **Quantity**: Integer

### Table: FacilityReport (Issue Ticket)
* **ID**: Primary Key (**Number**)
* **FacilityID**: Foreign Key -> Facility.ID (**Number**)
* **EmployeeID**: Foreign Key -> Employee.ID (**String**) <-- 必须匹配 MongoDB ID 类型
* **Title**: String
* **Description**: String
* **CreateDate**: Datetime
* **Status**: String (Enum: 'Open', 'In Progress', 'Closed')

### Table: FacilityReportDetail (Comments)
* **ID**: Primary Key (**Number**)
* **FacilityReportID**: Foreign Key -> FacilityReport.ID (**Number**)
* **EmployeeID**: Foreign Key -> Employee.ID (**String**) <-- 必须匹配 MongoDB ID 类型
* **Comment**: String
* **CreateDate**: Datetime
* **LastModificationDate**: Datetime