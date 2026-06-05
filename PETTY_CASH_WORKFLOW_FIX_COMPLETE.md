# Petty Cash Workflow Timeline Fix Complete

## Date: March 8, 2026

## Issue
The petty cash timeline was showing "Approved by HR Manager" for shipping line clerk requests, even though shipping line clerks are under the Operations department and their requests should go directly to the Operations Manager, not through HR.

## Root Cause
The timeline rendering logic was showing HR Manager, Declaration Manager, and Operations Manager sections for ALL requests, regardless of the requester's role and department. This caused incorrect workflow visualization.

## Correct Workflows by Role

### 1. Shipping Line Clerk (Operations Department)
```
Request Created
  ↓
Operations Manager
  ↓
COO
  ↓
Finance Manager
  ↓
Cashier
```

### 2. Documentation Officer (HR Department)
```
Request Created
  ↓
HR Manager
  ↓
Operations Manager
  ↓
COO
  ↓
Finance Manager
  ↓
Cashier
```

### 3. Declarant (Declaration Department)
```
Request Created
  ↓
Declaration Manager
  ↓
COO
  ↓
Finance Manager
  ↓
Cashier
```

### 4. Operations Clerk / Permits Clerk (Operations Department)
```
Request Created
  ↓
Operations Manager
  ↓
COO
  ↓
Finance Manager
  ↓
Cashier
```

### 5. COO (Executive)
```
Request Created
  ↓
Finance Manager (Direct - No approvals needed)
  ↓
Cashier
```

## Solution
Updated the timeline rendering logic to show approval stages based on the requester's role:

### 1. HR Manager Section
**Condition**: Only show for `documentation_officer` requests
```typescript
{selectedRequest.requester?.role === 'documentation_officer' && 
 (selectedRequest.hrComment || selectedRequest.hrManagerId || 
  selectedRequest.status === 'PENDING_MANAGER_APPROVAL' || 
  selectedRequest.status === 'REJECTED_BY_HR') && (
```

### 2. Declaration Manager Section
**Condition**: Only show for `declarant` requests
```typescript
{selectedRequest.requester?.role === 'declarant' && 
 (selectedRequest.declarationManagerComment || selectedRequest.declarationManagerId || 
  selectedRequest.status === 'PENDING_COO_APPROVAL' || 
  selectedRequest.status === 'REJECTED_BY_DECLARATION_MANAGER') && (
```

### 3. Operations Manager Section
**Condition**: Show for operations department roles and after HR/Declaration Manager approval
```typescript
{((selectedRequest.requester?.role === 'shipping_line_clerk' || 
   selectedRequest.requester?.role === 'operation_clerk' ||
   selectedRequest.requester?.role === 'permits_clerk' ||
   selectedRequest.requester?.role === 'documentation_officer' && selectedRequest.hrManagerId) &&
  (selectedRequest.managerComment || selectedRequest.managerId || 
   selectedRequest.status === 'PENDING_COO_APPROVAL' || 
   selectedRequest.status === 'REJECTED_BY_MANAGER')) && (
```

### 4. COO Section
**Condition**: Show for all requests except COO's own requests (which skip approvals)
- Remains unchanged as COO approval is required for all non-COO requests

### 5. Finance Manager & Cashier Sections
**Condition**: Show for all requests
- Remains unchanged as all requests go through finance and cashier

## Changes Made

**File**: `app/src/pages/PettyCashPage.tsx`

1. Added role-based condition to HR Manager timeline section
2. Added role-based condition to Declaration Manager timeline section
3. Updated Operations Manager timeline section to include role checks

## Timeline Examples

### Shipping Line Clerk Request (Marcus Wilson)
```
✓ Request Created
  by Marcus Wilson
  3/8/2026, 4:20:47 PM

⏰ Pending Operations Manager Approval  ← Current Status
  Operations Department

(COO section will appear after Operations Manager approves)
(Finance Manager section will appear after COO approves)
(Cashier section will appear after Finance Manager processes)
```

### Documentation Officer Request
```
✓ Request Created
  by Documentation Officer
  
⏰ Pending HR Manager Approval
  HR Department

(Operations Manager section will appear after HR approves)
(COO section will appear after Operations Manager approves)
(Finance Manager section will appear after COO approves)
(Cashier section will appear after Finance Manager processes)
```

### Declarant Request
```
✓ Request Created
  by Declarant
  
⏰ Pending Declaration Manager Approval
  Declaration Department

(COO section will appear after Declaration Manager approves)
(Finance Manager section will appear after COO approves)
(Cashier section will appear after Finance Manager processes)
```

## Department Structure

### Operations Department
- Shipping Line Clerk → Operations Manager
- Operations Clerk → Operations Manager
- Permits Clerk → Operations Manager

### HR Department
- Documentation Officer → HR Manager → Operations Manager

### Declaration Department
- Declarant → Declaration Manager

### Executive
- COO → Direct to Finance (no approvals)

## Files Modified
- `app/src/pages/PettyCashPage.tsx`

## Testing Checklist

### Shipping Line Clerk
- [ ] Create request → Timeline shows only "Request Created" + "Pending Operations Manager Approval"
- [ ] Should NOT show HR Manager section
- [ ] Should NOT show Declaration Manager section
- [ ] Operations Manager approves → Shows "Approved by Operations Manager" + "Pending COO Approval"

### Documentation Officer
- [ ] Create request → Timeline shows "Request Created" + "Pending HR Manager Approval"
- [ ] HR Manager approves → Shows "Approved by HR Manager" + "Pending Operations Manager Approval"
- [ ] Operations Manager approves → Shows "Approved by Operations Manager" + "Pending COO Approval"

### Declarant
- [ ] Create request → Timeline shows "Request Created" + "Pending Declaration Manager Approval"
- [ ] Should NOT show HR Manager section
- [ ] Should NOT show Operations Manager section initially
- [ ] Declaration Manager approves → Shows "Approved by Declaration Manager" + "Pending COO Approval"

### Operations Clerk / Permits Clerk
- [ ] Create request → Timeline shows "Request Created" + "Pending Operations Manager Approval"
- [ ] Should NOT show HR Manager section
- [ ] Should NOT show Declaration Manager section

## Deployment

Build Status: ✅ Successful
Server: Running at http://localhost:4173/

## Summary

The petty cash timeline now correctly displays approval stages based on the requester's role and department:

- **Shipping Line Clerk** requests go directly to Operations Manager (no HR Manager)
- **Documentation Officer** requests go through HR Manager first, then Operations Manager
- **Declarant** requests go through Declaration Manager only (no Operations Manager initially)
- **Operations/Permits Clerks** requests go directly to Operations Manager
- **COO** requests skip all approvals and go directly to Finance Manager

Each role now sees only the relevant approval stages for their department's workflow, providing accurate and clear visibility into the request progress.
