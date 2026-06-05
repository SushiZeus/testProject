# Service Type Implementation - March 27, 2026 ✅

## Feature Implemented

Added service type selection during file opening to route files to different departments based on the service required.

## Service Types

### 1. CLEARANCE
- **Description**: Full customs clearance process
- **Routing**: Goes to Declaration Manager → Declaration Department
- **Initial Status**: WAITING_FOR_DECLARATION
- **Workflow**: Normal clearance workflow (declaration → operations → delivery)

### 2. DOCUMENT HANDOVER
- **Description**: Document delivery only (no clearance needed)
- **Routing**: Goes directly to Accounts Department (Finance Manager)
- **Initial Status**: WAITING_FOR_ACCOUNTS
- **Workflow**: Accounts processing → Delivery

### 3. TRANSPORTATION
- **Description**: Transport service only (no clearance needed)
- **Routing**: Goes directly to Accounts Department (Finance Manager)
- **Initial Status**: WAITING_FOR_ACCOUNTS
- **Workflow**: Accounts processing → Delivery

## Implementation Details

### 1. New Type Added
```typescript
export type ServiceType = 'CLEARANCE' | 'DOCUMENT_HANDOVER' | 'TRANSPORTATION';
```

### 2. New Statuses Added
- `WAITING_FOR_ACCOUNTS` - For non-clearance files waiting for accounts
- `ACCOUNTS_PROCESSING` - Accounts department processing the file
- `ACCOUNTS_APPROVED` - Approved by accounts, ready for delivery/handover

### 3. ShipmentFile Interface Updated
Added `serviceType: ServiceType` field to track the service type for each file.

### 4. File Opening Page Updated
- Added service type selection UI after contact person selection
- Three card-style buttons for service type selection
- Visual indicator showing which department the file will be routed to
- Warning message for non-clearance files

### 5. File Creation Logic Updated
- `createFile()` function now accepts `serviceType` parameter
- Initial status determined based on service type:
  - CLEARANCE → WAITING_FOR_DECLARATION
  - DOCUMENT_HANDOVER → WAITING_FOR_ACCOUNTS
  - TRANSPORTATION → WAITING_FOR_ACCOUNTS

### 6. Notification Routing Updated
- CLEARANCE files notify Declaration Manager (ID: 2)
- DOCUMENT_HANDOVER and TRANSPORTATION files notify Finance Manager (ID: 11)

## User Interface

### Service Type Selection
Located in Step 1 of file opening, after contact person selection:

```
┌─────────────────────────────────────────────────────────┐
│ Service Type *                                          │
│ Select the type of service required for this shipment  │
│                                                         │
│ ┌──────────┐  ┌──────────────────┐  ┌──────────────┐ │
│ │ CLEARANCE│  │ DOCUMENT HANDOVER│  │TRANSPORTATION│ │
│ │ Full     │  │ Document         │  │ Transport    │ │
│ │ customs  │  │ delivery only    │  │ service only │ │
│ └──────────┘  └──────────────────┘  └──────────────┘ │
│                                                         │
│ ⚠️ Note: This file will be routed to the Accounts     │
│    Department instead of Declaration.                  │
└─────────────────────────────────────────────────────────┘
```

### Visual Feedback
- Selected service type highlighted in blue
- Warning message appears for non-clearance services
- Clear indication of routing destination

## Workflow Comparison

### CLEARANCE Workflow
```
File Created
  ↓
WAITING_FOR_DECLARATION
  ↓
Declaration Manager assigns declarant
  ↓
Declaration process
  ↓
READY_FOR_OPERATIONS
  ↓
Operations process
  ↓
Delivery
```

### DOCUMENT_HANDOVER / TRANSPORTATION Workflow
```
File Created
  ↓
WAITING_FOR_ACCOUNTS
  ↓
Finance Manager processes
  ↓
ACCOUNTS_PROCESSING
  ↓
ACCOUNTS_APPROVED
  ↓
Delivery/Handover
```

## Files Modified

1. **app/src/types/index.ts**
   - Added ServiceType enum
   - Added serviceType field to ShipmentFile interface
   - Added new account-related statuses

2. **app/src/utils/statusColors.ts**
   - Added colors for new statuses

3. **app/src/pages/FileOpeningPage.tsx**
   - Added serviceType state
   - Added service type selection UI
   - Updated file creation to include serviceType
   - Updated notification routing based on service type

4. **app/src/store/fileStore.ts**
   - Updated createFile to accept serviceType
   - Added logic to set initial status based on service type
   - Updated activity log descriptions

## Benefits

✅ **Flexible Routing**: Files automatically routed to correct department
✅ **Clear Separation**: Clearance vs non-clearance workflows clearly separated
✅ **User Friendly**: Simple selection with clear descriptions
✅ **Efficient**: Non-clearance files skip unnecessary declaration steps
✅ **Transparent**: Users see where their file will be routed

## Testing Checklist

### Test CLEARANCE Service
1. ✅ Create file with CLEARANCE service type
2. ✅ Verify status is WAITING_FOR_DECLARATION
3. ✅ Verify Declaration Manager receives notification
4. ✅ Verify file appears in Declaration page

### Test DOCUMENT_HANDOVER Service
1. ✅ Create file with DOCUMENT_HANDOVER service type
2. ✅ Verify status is WAITING_FOR_ACCOUNTS
3. ✅ Verify Finance Manager receives notification
4. ✅ Verify file does NOT appear in Declaration page
5. ✅ Verify warning message shows during creation

### Test TRANSPORTATION Service
1. ✅ Create file with TRANSPORTATION service type
2. ✅ Verify status is WAITING_FOR_ACCOUNTS
3. ✅ Verify Finance Manager receives notification
4. ✅ Verify file does NOT appear in Declaration page
5. ✅ Verify warning message shows during creation

## Next Steps

To complete the accounts workflow, you'll need to:

1. Create an Accounts/Finance page to handle WAITING_FOR_ACCOUNTS files
2. Add buttons for Finance Manager to:
   - Accept file (ACCOUNTS_PROCESSING)
   - Approve file (ACCOUNTS_APPROVED)
   - Request additional information
3. Route approved files to delivery clerk
4. Add accounts-specific fields if needed (invoice numbers, payment details, etc.)

## Notes

- Service type is mandatory and must be selected during file creation
- Service type cannot be changed after file creation (business rule)
- All three service types use the same file structure
- Only the workflow and routing differ based on service type

---

**Implementation Complete**: Service type selection is now functional and files are correctly routed based on the selected service!
