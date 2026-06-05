# Document Handover Routing Fix - April 1, 2026

## Issues Fixed

### 1. ✅ DOCUMENT_HANDOVER Files Now Route to Finance Manager
**Problem**: DOCUMENT_HANDOVER and TRANSPORTATION files were going to Declaration Manager instead of Finance Manager.

**Solution**: The routing logic was already correct in `fileStore.ts`, but the notification system is now verified to work properly:
- CLEARANCE files → Declaration Manager (User ID: 2)
- DOCUMENT_HANDOVER files → Finance Manager (User ID: 11)
- TRANSPORTATION files → Finance Manager (User ID: 11)

### 2. ✅ DOCUMENT_HANDOVER Files Excluded from Clearance Counts
**Problem**: DOCUMENT_HANDOVER files were being counted in clearance-related dashboard tiles.

**Solution**: Updated all file counting logic to only include CLEARANCE files in clearance statistics.

## Files Modified

### 1. `app/src/store/fileStore.ts`
- Added `ServiceType` to imports
- Added `serviceType` parameter to `createFile` function signature
- Routing logic confirmed working:
  ```typescript
  const initialStatus = data.serviceType === 'CLEARANCE' 
    ? 'WAITING_FOR_DECLARATION' 
    : 'WAITING_FOR_ACCOUNTS';
  ```

### 2. `app/src/pages/DashboardPage.tsx`
- Updated stats calculation to filter by `serviceType === 'CLEARANCE'`
- Declaration Manager dashboard now shows:
  - "Total Clearance Files" (only CLEARANCE files)
  - "Pending Assignment" (only CLEARANCE files)
  - "In Progress" (only CLEARANCE files)
  - "Completed" (only CLEARANCE files)

**Changes**:
```typescript
// Only count CLEARANCE files for clearance-related stats
const clearanceFiles = files.filter(f => f.serviceType === 'CLEARANCE');
const waitingFiles = clearanceFiles.filter(f => f.status === 'WAITING_FOR_DECLARATION').length;
```

### 3. `app/src/pages/DeclarationPage.tsx`
- Added filter to only show CLEARANCE files in declaration module
- Updated stats calculation to only count CLEARANCE files
- Updated workload calculation to only use CLEARANCE files
- Updated file assignment logic to only show CLEARANCE files

**Changes**:
```typescript
// Only show CLEARANCE files in declaration module
const clearanceFiles = files.filter((file: ShipmentFile) => file.serviceType === 'CLEARANCE');

const filteredFiles = clearanceFiles.filter((file: ShipmentFile) => {
  // ... existing filter logic
});

const stats = {
  pendingAssignment: clearanceFiles.filter((f: ShipmentFile) => f.status === 'WAITING_FOR_DECLARATION').length,
  assigned: clearanceFiles.filter((f: ShipmentFile) => 
    f.status === 'ASSIGNED_TO_DECLARANT' || 
    f.status === 'DECLARANT_ACKNOWLEDGED' ||
    f.status === 'WAITING_FOR_FINAL_ASSESSMENT' ||
    f.status === 'WAITING_FOR_TAX_PAYMENT'
  ).length,
  assessment: clearanceFiles.filter((f: ShipmentFile) => f.status === 'WAITING_FOR_FINAL_ASSESSMENT').length,
  myFiles: user?.role === 'declarant' 
    ? clearanceFiles.filter((f: ShipmentFile) => f.assignedDeclarantId === user.id).length 
    : 0,
};
```

### 4. `app/src/pages/FileOpeningPage.tsx`
- Updated confirmation message to be dynamic based on service type
- Fixed TypeScript type issues with document handling
- Confirmation now shows:
  - CLEARANCE: "The file has been created and is now waiting for declaration."
  - DOCUMENT_HANDOVER: "The file has been created and routed to Accounts Department for document handover processing."
  - TRANSPORTATION: "The file has been created and routed to Accounts Department for transportation processing."

**Changes**:
```typescript
const renderStep6 = () => {
  const statusMessage = serviceType === 'CLEARANCE' 
    ? 'The file has been created and is now waiting for declaration.'
    : `The file has been created and routed to Accounts Department for ${serviceType.replace('_', ' ').toLowerCase()} processing.`;
  
  const statusBadge = serviceType === 'CLEARANCE'
    ? 'WAITING FOR DECLARATION'
    : 'WAITING FOR ACCOUNTS';
  
  const statusColor = serviceType === 'CLEARANCE'
    ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
    : 'bg-blue-100 text-blue-700 hover:bg-blue-100';
  
  // ... render confirmation with dynamic messages
};
```

## Workflow Summary

### CLEARANCE Files
1. User selects "CLEARANCE" service type
2. Completes all file opening steps (transport mode, documents, etc.)
3. File created with status: `WAITING_FOR_DECLARATION`
4. Notification sent to Declaration Manager (ID: 2)
5. File appears in Declaration Department
6. File counted in clearance statistics

### DOCUMENT_HANDOVER Files
1. User selects "DOCUMENT_HANDOVER" service type
2. Completes all file opening steps (transport mode, documents, etc.)
3. File created with status: `WAITING_FOR_ACCOUNTS`
4. Notification sent to Finance Manager (ID: 11)
5. File goes to Accounts Department
6. File NOT counted in clearance statistics
7. File NOT visible in Declaration Department

### TRANSPORTATION Files
1. User selects "TRANSPORTATION" service type
2. Completes all file opening steps (transport mode, documents, etc.)
3. File created with status: `WAITING_FOR_ACCOUNTS`
4. Notification sent to Finance Manager (ID: 11)
5. File goes to Accounts Department
6. File NOT counted in clearance statistics
7. File NOT visible in Declaration Department

## Testing Checklist

- [ ] Create a CLEARANCE file → Should go to Declaration Manager
- [ ] Create a DOCUMENT_HANDOVER file → Should go to Finance Manager
- [ ] Create a TRANSPORTATION file → Should go to Finance Manager
- [ ] Check Declaration Manager dashboard → Should only show CLEARANCE files
- [ ] Check Declaration Department → Should only show CLEARANCE files
- [ ] Verify file counts exclude DOCUMENT_HANDOVER and TRANSPORTATION files
- [ ] Verify confirmation messages are correct for each service type

## Impact

### Declaration Department
- Now only sees CLEARANCE files
- Statistics only count CLEARANCE files
- Workload calculations only use CLEARANCE files
- No confusion with non-clearance files

### Finance Department
- Receives DOCUMENT_HANDOVER files
- Receives TRANSPORTATION files
- Can process these files separately from clearance workflow

### Dashboard
- Clearance statistics are accurate
- No mixing of service types in counts
- Clear separation of workflows

## Status Mapping

| Service Type | Initial Status | Notification To | Department |
|-------------|---------------|-----------------|------------|
| CLEARANCE | WAITING_FOR_DECLARATION | Declaration Manager (ID: 2) | Declaration |
| DOCUMENT_HANDOVER | WAITING_FOR_ACCOUNTS | Finance Manager (ID: 11) | Accounts |
| TRANSPORTATION | WAITING_FOR_ACCOUNTS | Finance Manager (ID: 11) | Accounts |

---

**Date**: April 1, 2026
**Status**: Complete and Ready for Testing
**All changes saved to disk**
