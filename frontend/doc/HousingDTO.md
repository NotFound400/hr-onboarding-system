### HouseDTO.ListResponse (HR Housing List)
```json
{
  "id": 1,
  "address": "123 Main Street, City, State 12345",
  "maxOccupant": 4,
  "numberOfEmployees": 3,
  "landlordId": 1,
  "landlordFullName": "John Doe",
  "landlordPhone": "123-456-7890",
  "landlordEmail": "john.doe@example.com"
}
```

### HouseDTO.DetailResponse (HR Housing Detail)
```json
{
  "id": 1,
  "address": "123 Main Street",
  "maxOccupant": 4,
  "numberOfEmployees": 3,
  "landlord": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "cellPhone": "123-456-7890"
  },
  "facilitySummary": {
    "Bed": 4,
    "Mattress": 4,
    "Table": 2,
    "Chair": 6
  },
  "facilities": [
    {
      "id": 1,
      "type": "Bed",
      "description": "Queen size bed",
      "quantity": 2
    }
  ]
}
```

### HouseDTO.EmployeeViewResponse (Employee View)
```json
{
  "id": 1,
  "address": "123 Main Street, City, State 12345",
  "residents": [
    {
      "employeeId": 101,
      "name": "Alice",
      "phone": "111-222-3333"
    },
    {
      "employeeId": 102,
      "name": "Bob",
      "phone": "444-555-6666"
    }
  ]
}
```

### FacilityReportDTO.ListItem (Report List)
```json
{
  "id": 1,
  "title": "Broken bed frame",
  "createDate": "2024-01-15T10:30:00",
  "status": "Open",
  "statusDisplayName": "Open"
}
```

### FacilityReportDTO.DetailResponse (Report Detail)
```json
{
  "id": 1,
  "facilityId": 1,
  "facilityType": "Bed",
  "houseId": 1,
  "houseAddress": "123 Main Street",
  "title": "Broken bed frame",
  "description": "The bed frame is broken and needs repair",
  "employeeId": 101,
  "createdBy": "Alice Smith",
  "createDate": "2024-01-15T10:30:00",
  "status": "InProgress",
  "statusDisplayName": "In Progress",
  "comments": [
    {
      "id": 1,
      "employeeId": 101,
      "createdBy": "Alice Smith",
      "comment": "Please fix ASAP",
      "createDate": "2024-01-15T10:30:00",
      "displayDate": "2024-01-15T10:30:00",
      "canEdit": true
    },
    {
      "id": 2,
      "employeeId": 200,
      "createdBy": "HR Admin",
      "comment": "Maintenance scheduled for tomorrow",
      "createDate": "2024-01-15T14:00:00",
      "displayDate": "2024-01-15T14:00:00",
      "canEdit": false
    }
  ]
}
```