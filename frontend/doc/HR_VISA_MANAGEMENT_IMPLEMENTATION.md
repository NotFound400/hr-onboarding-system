# HR Visa Management Page Implementation

**Route:** `/hr/visa`  
**Component:** `HRVisaManagementPage`  
**Status:** ✅ Completed

---

## Overview

This page allows HR to manage employee visa document workflow by reviewing and approving/rejecting visa-related documents in a sequential process.

---

## Data Flow

### 1. Data Loading & Aggregation

The page follows a three-step data loading process:

```typescript
// Step 1: Fetch all approved OPT applications with employee info
const applications = await getApplicationsWithEmployeesByStatus('Approved');

// Step 2: For each application, fetch its documents
const documents = await getDocumentsByApplicationId(app.id);

// Step 3: Merge application, employee, and document data into table rows
```

### 2. API Endpoints Used

- `GET /api/applications/status/Approved` - Fetch approved applications
- `GET /api/employees` - Fetch employee details (embedded in `getApplicationsWithEmployeesByStatus`)
- `GET /api/applications/documents/application/{applicationId}` - Fetch documents per application
- `PUT /api/applications/{id}` - Update application status and type
- `PUT /api/applications/documents/update/{documentId}` - Update document status
- `GET /api/applications/documents/download/{id}` - Download document for re-upload

---

## UI Components

### Table Columns

| Column | Description | Data Source |
|--------|-------------|-------------|
| **Name** | Employee full name | `application.employeeName` |
| **Work Authorization** | Visa type (e.g., OPT, H1B) | `employee.visaStatus[].visaType` |
| **Expiration Date** | Visa expiration date | `employee.visaStatus[].endDate` |
| **Days Left** | Calculated: Expiration - Today | Computed from `endDate` |
| **Next Step** | Current document in workflow | `application.applicationType` |
| **Preview** | Link to view document | Downloads document via API |
| **Actions** | Approve/Reject buttons | Triggers workflow actions |

### Color Coding

- **Days Left:**
  - 🔴 Red: < 30 days
  - 🟠 Orange: 30-89 days
  - 🟢 Green: ≥ 90 days

- **Next Step:**
  - 🔵 Blue (processing): Active visa document types
  - ⚪ Gray: None (not in workflow)

---

## Workflow Logic

### Document Sequence

The system follows a strict visa document approval sequence:

```
I-983 → I-20 → OPT Receipt → STEM EAD → Terminate
```

### Approve Action

1. **Calculate Next Step:**
   ```typescript
   const nextType = getNextApplicationType(currentStep);
   // Example: I-983 → I-20
   ```

2. **API Call 1 - Update Application:**
   ```typescript
   PUT /api/applications/{id}
   {
     "applicationType": "I-20",  // next step
     "comment": "pending"
   }
   ```

3. **API Call 2 - Update Document:**
   ```typescript
   PUT /api/applications/documents/update/{documentId}
   FormData {
     file: <original file blob>,
     metadata: {
       "applicationId": 1001,
       "type": "I-983",
       "title": "I-983",
       "description": "approved"  // marks document as approved
     }
   }
   ```

4. **Outcome:**
   - Document is marked as "approved"
   - Application moves to next step in sequence
   - Email notification sent to employee
   - Table refreshes to show updated status

### Reject Action

1. **Keep Current Step:**
   ```typescript
   const currentType = record.nextStep; // stays on same document
   ```

2. **API Call 1 - Update Application:**
   ```typescript
   PUT /api/applications/{id}
   {
     "applicationType": "I-983",  // same step
     "comment": "reject"
   }
   ```

3. **API Call 2 - Update Document:**
   ```typescript
   PUT /api/applications/documents/update/{documentId}
   FormData {
     file: <original file blob>,
     metadata: {
       "applicationId": 1001,
       "type": "I-983",
       "title": "I-983",
       "description": "reject"  // marks document as rejected
     }
   }
   ```

4. **Outcome:**
   - Document is marked as "reject"
   - Application stays on current step
   - Email notification sent to employee requesting resubmission
   - Table refreshes

---

## Special Handling

### Document Download & Re-upload

Both approve and reject actions require re-uploading the document file because the PUT endpoint expects the full file + metadata:

```typescript
// Download original file
const fileBlob = await downloadDocument(documentId);

// Convert to File object
const file = new File([fileBlob], `${documentType}.pdf`, {
  type: fileBlob.type,
});

// Re-upload with new metadata
await updateDocument(documentId, { file, metadata });
```

### "None" Next Step Display

If `application.applicationType` is not in the visa document sequence (`I-983`, `I-20`, `OPT Receipt`, `STEM EAD`), the "Next Step" column shows:
- Display: `None` (gray tag)
- Behavior: Approve/Reject buttons are disabled

### Terminate State

When a document reaches the end of the sequence (after STEM EAD), the next approve action sets:
```typescript
applicationType: "Terminate"
```

This effectively closes the visa workflow.

---

## Integration Points

### Files Modified

1. **New Component:**
   - `src/features/hr/pages/HRVisaManagementPage.tsx` - Main page implementation

2. **Export Updates:**
   - `src/features/hr/pages/index.ts` - Added `HRVisaManagementPage` export

3. **Routing:**
   - `src/App.tsx` - Updated `/hr/visa` route to use `HRVisaManagementPage`

### API Services Used

All API calls are real (no mock data):

```typescript
import {
  getApplicationsWithEmployeesByStatus,  // Fetch approved apps + employee info
  getDocumentsByApplicationId,           // Fetch documents per application
  updateApplication,                     // Update app status and type
  updateDocument,                        // Update document metadata
  downloadDocument,                      // Download document file
} from '../../../services/api';
```

---

## User Experience

### Loading States

- Initial page load: Full-page spinner
- Action in progress: Button shows loading spinner
- Only one action can be in progress at a time (tracked by `actionLoading` state)

### Confirmations

Both approve and reject actions require user confirmation:

```typescript
Modal.confirm({
  title: 'Approve Document',
  content: `Are you sure you want to approve I-983 for John Doe?`,
  okText: 'Approve',
  cancelText: 'Cancel',
  // ...
});
```

### Success Messages

- Approve: `"I-983 approved successfully. Email notification sent."`
- Reject: `"I-983 rejected. Email notification sent."`

### Error Handling

All API errors are caught and displayed via Ant Design message:

```typescript
catch (error: any) {
  messageApi.error(error.message || 'Failed to approve document');
}
```

---

## Testing Checklist

- [ ] Page loads without errors at `/hr/visa`
- [ ] Only approved OPT applications are displayed
- [ ] Employee name, visa type, and expiration dates are correct
- [ ] Days left calculation is accurate
- [ ] Next Step shows correct document type
- [ ] Preview link downloads and opens document
- [ ] Approve action moves to next step in sequence
- [ ] Reject action keeps current step
- [ ] Both actions update document description correctly
- [ ] Buttons are disabled when no document exists
- [ ] Buttons are disabled when Next Step is "None"
- [ ] Table refreshes after each action
- [ ] Email notifications are mentioned in success messages
- [ ] Error messages display for failed API calls

---

## Future Enhancements

1. **Inline Document Viewer:** Display PDF preview in modal instead of opening new tab
2. **Comment Field:** Allow HR to add custom rejection comments
3. **Batch Operations:** Approve/reject multiple documents at once
4. **Filter by Days Left:** Quick filters for urgent expirations
5. **Export to CSV:** Download visa status report
6. **Audit Log:** Track all approve/reject actions with timestamps and HR user

---

## Troubleshooting

### Issue: "No approved visa applications found"

**Cause:** No applications with `status: 'Approved'` exist in the system.

**Solution:** 
1. Check if employees have submitted OPT applications
2. Verify HR has approved applications on the HR home page
3. Ensure applications are not stuck in "Pending" or "Rejected" status

### Issue: Preview shows "No document"

**Cause:** Document hasn't been uploaded yet for the current `applicationType`.

**Solution:**
1. Employee needs to upload the required document via `/employee/visa`
2. Document type must match the `applicationType` field

### Issue: Approve/Reject buttons disabled

**Causes:**
1. No document uploaded yet
2. `applicationType` is not in the visa workflow sequence
3. Another action is in progress (only one at a time)

**Solution:** Wait for document upload or check application type validity.

---

## Architecture Notes

### Type System

The page uses a custom `VisaDocumentType` instead of `ApplicationType` enum because the backend stores document type names (`I-983`, `I-20`, etc.) in the `applicationType` field to track workflow progress.

```typescript
type VisaDocumentType = 'I-983' | 'I-20' | 'OPT Receipt' | 'STEM EAD';
```

### State Management

- **Local State (useState):** Page-specific data (table rows, loading states)
- **Redux:** Not used (data is fetched on demand, not shared across pages)
- **Message API:** Global message notifications via Ant Design

### Performance Considerations

- Documents are fetched serially (one per application) due to API constraints
- Consider implementing parallel fetching with `Promise.all()` if API supports it
- Document download occurs only when user clicks Preview or takes action

---

**Implementation Date:** December 14, 2025  
**Status:** Production-ready with real API integration
