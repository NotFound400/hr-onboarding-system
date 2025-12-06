Database Design Specification
文件名: db_design.md 来源: 基于 P3-2-Team_Project_DB_Design.pdf 整理 用途: 定义后端数据库 Schema 及前端 TypeScript Interface 的单一数据源。

1. Authentication Service (SQL)
负责用户登录、鉴权及注册 Token 管理。

Table: User
ID: Primary Key (String/Int)

Username: String (Unique)

Email: String (Unique)

Password: String (Encrypted)

CreateDate: Datetime

LastModificationDate: Datetime

Table: Role
ID: Primary Key

RoleName: String (e.g., 'HR', 'Employee')

RoleDescription: String

CreateDate: Datetime

LastModificationDate: Datetime

Table: UserRole (Mapping Table)
ID: Primary Key

UserID: Foreign Key -> User.ID

RoleID: Foreign Key -> Role.ID

ActiveFlag: Boolean

CreateDate: Datetime

LastModificationDate: Datetime

Table: RegistrationToken
ID: Primary Key

Token: String (Unique)

Email: String (Target Email)

ExpirationDate: Datetime

CreateBy: String (HR User ID)

CreateDate: Datetime

2. Employee Service (MongoDB)
采用 MongoDB 文档存储，包含大量的嵌套数组（Nested Arrays）。

Collection: Employee
Root Fields:

ID: ObjectId (String)

UserID: String (Ref -> Auth.User.ID)

FirstName: String

LastName: String

MiddleName: String

PreferredName: String

Email: String

CellPhone: String

AlternatePhone: String

Gender: String

SSN: String

DOB: Date

StartDate: Date

EndDate: Date

DriverLicense: String

DriverLicenseExpiration: Date

HouseID: String (Ref -> HousingService.House.ID)

Nested Array: contacts 包含 Reference 和 Emergency Contact，通过 Type 区分

Type: String (Enum: 'Reference', 'Emergency')

Name: String (or split into First/Last based on requirement)

Phone: String

Email: String

Relationship: String

Nested Array: addresses

Type: String (Enum: 'Primary', 'Secondary')

AddressLine1: String

AddressLine2: String

City: String

State: String

ZipCode: String

Nested Array: visaStatuses

VisaType: String (Enum: 'OPT', 'H1B', 'L2', 'F1', 'H4', 'Other')

ActiveFlag: Boolean

StartDate: Date

EndDate: Date

LastModificationDate: Date

Nested Array: personalDocuments

ID: String

Path: String (S3 URL)

Title: String (e.g., 'Driver License', 'OPT Receipt')

Comment: String

CreateDate: Date

3. Application Service (MySQL)
负责管理 Onboarding 和 VISA 申请的状态流转。

Table: ApplicationWorkFlow
ID: Primary Key

EmployeeID: Foreign Key -> Employee.ID

CreateDate: Datetime

LastModificationDate: Datetime

Status: String (Enum: 'Open', 'Pending', 'Approved', 'Rejected')

Comment: String (Rejection reason or HR notes)

Type: String (Enum: 'Onboarding', 'OPT')

Table: DigitalDocument
系统要求的文档模板配置表

ID: Primary Key

Type: String (e.g., 'I-983', 'I-20')

IsRequired: Boolean

Path: String (Template S3 URL)

Description: String

Title: String

4. Housing Service (MySQL)
负责房屋管理及设施报修。

Table: House
ID: Primary Key

LandlordID: Foreign Key -> Landlord.ID

Address: String

MaxOccupant: Integer

Table: Landlord
ID: Primary Key

FirstName: String

LastName: String

Email: String

CellPhone: String

Table: Facility
ID: Primary Key

HouseID: Foreign Key -> House.ID

Type: String (e.g., 'Bed', 'Mattress', 'Table')

Description: String

Quantity: Integer

Table: FacilityReport (Issue Ticket)
ID: Primary Key

FacilityID: Foreign Key -> Facility.ID

EmployeeID: Foreign Key -> Employee.ID

Title: String

Description: String

CreateDate: Datetime

Status: String (Enum: 'Open', 'In Progress', 'Closed')

Table: FacilityReportDetail (Comments)
ID: Primary Key

FacilityReportID: Foreign Key -> FacilityReport.ID

EmployeeID: Foreign Key -> Employee.ID

Comment: String

CreateDate: Datetime

LastModificationDate: Datetime