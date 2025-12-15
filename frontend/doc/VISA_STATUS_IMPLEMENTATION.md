# Visa Status Management Page Implementation

## File Location
`src/features/employee/pages/VisaStatusPage_New.tsx`

## Overview
This page implements the Visa Status Management functionality as specified, allowing employees to upload and manage visa-related documents with intelligent enable/disable logic based on application type.

## Features Implemented

### 1. UI Layout ✅
- **Vertical Layout**: Document sections arranged vertically in specific order
- **Four Document Types** (in order):
  1. I-983 - Form I-983 for OPT STEM extension
  2. I-20 - Certificate of Eligibility for Nonimmigrant Student Status
  3. OPT Receipt - OPT STEM application receipt notice
  4. STEM EAD - Employment Authorization Document for STEM OPT

### 2. Data Fetching ✅
**On Initial Load:**
- `GET /api/applications/{applicationId}` - Fetches application status
- `GET /api/applications/documents/application/{applicationId}` - Fetches existing documents
- Maps returned files to UI elements based on their `type` field

### 3. State & Interaction Logic ✅
**Upload Box Enable/Disable Rules:**
- **Specific Step**: If `applicationType` matches a document type (e.g., 'I-983'), only that box is enabled
- **Terminated**: If `applicationType === 'Terminate'`, all upload boxes are disabled
- **Default**: If `applicationType` is `null` or `'OPT'`, the I-983 box is enabled by default
- **Other cases**: All boxes remain disabled

### 4. File Upload/Update Logic ✅
**Scenario A - File Exists (Update):**
```typescript
PUT /api/applications/documents/update/{documentId}
Content-Type: multipart/form-data
```

**Scenario B - No File (Create):**
```typescript
POST /api/applications/documents/upload
Content-Type: multipart/form-data
```

### 5. API Payload ✅
**FormData Structure:**
```javascript
FormData {
  file: File,                    // Actual file object
  metadata: JSON.stringify({     // Metadata as stringified JSON
    applicationId: number,
    type: string,                // e.g., 'I-983', 'I-20', etc.
    title: string,               // Same as type
    description: "Pending"
  })
}
```

## Component Structure

### State Management
```typescript
const [loading, setLoading] = useState(true);
const [uploading, setUploading] = useState<string | null>(null);
const [application, setApplication] = useState<Application | null>(null);
const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
const [documentSlots, setDocumentSlots] = useState<DocumentSlot[]>([]);
```

### Key Functions

#### `initializeVisaPage()`
- Fetches application and documents on page load
- Handles errors gracefully

#### `updateDocumentSlots(applicationType, docs)`
- Applies enable/disable logic based on application type
- Maps existing documents to slots

#### `handleFileUpload(slot, file)`
- Determines whether to POST (create) or PUT (update)
- Constructs proper FormData payload
- Refreshes document list after successful upload

#### `createUploadProps(slot)`
- Returns Ant Design Upload component props
- Includes custom `beforeUpload` handler
- Disables upload when not enabled or currently uploading

## Usage

### To Use This New Implementation:

1. **Replace the old file:**
   ```bash
   # Backup old file
   mv src/features/employee/pages/VisaStatusPage.tsx src/features/employee/pages/VisaStatusPage_Old.tsx
   
   # Use new implementation
   mv src/features/employee/pages/VisaStatusPage_New.tsx src/features/employee/pages/VisaStatusPage.tsx
   ```

2. **Update applicationId logic:**
   - Currently uses hardcoded `mockApplicationId = 1001`
   - Replace with actual logic to fetch employee's active OPT application:
   ```typescript
   // Example:
   const applications = await getActiveApplications(employeeId);
   const optApp = applications.find(app => app.applicationType === 'OPT');
   const applicationId = optApp?.id;
   ```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/applications/{id}` | GET | Fetch application status and type |
| `/api/applications/documents/application/{id}` | GET | Fetch existing documents |
| `/api/applications/documents/upload` | POST | Upload new document |
| `/api/applications/documents/update/{id}` | PUT | Update existing document |

## Visual Features

- **Color-coded borders**: Blue for enabled sections, gray for disabled
- **Status indicators**: Green checkmark for uploaded, gray X for not available
- **Loading states**: Shows spinner during upload
- **Success feedback**: Toast messages after successful upload/update
- **File info display**: Shows current file and status when document exists

## Error Handling

- Validates employee ID exists
- Handles API errors with user-friendly messages
- Prevents uploads when disabled
- Shows appropriate error states

## Testing Checklist

- [ ] Page loads and fetches application data
- [ ] Document slots render in correct order
- [ ] Enable/disable logic works for different `applicationType` values
- [ ] Upload creates new document (POST)
- [ ] Update replaces existing document (PUT)
- [ ] FormData payload is constructed correctly
- [ ] Success messages appear after upload
- [ ] Error messages appear on failure
- [ ] Loading states display correctly
- [ ] Document list refreshes after upload

## Notes

- The implementation uses Ant Design Upload component with custom handler
- All uploads are prevented from automatic submission (`beforeUpload` returns `false`)
- File types accepted: `.pdf, .jpg, .jpeg, .png`
- The page gracefully handles missing application or employee ID
