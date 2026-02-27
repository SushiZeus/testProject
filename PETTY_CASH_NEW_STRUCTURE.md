# Petty Cash Page - New Structure Specification

## Overview
Complete redesign with separate tables for different user roles and workflows.

## User Roles & Their Views

### 1. Regular Users (Documentation Officer, Declarant, etc.)
**Single Table:**
- "My Requests" - Only their own requests
- Actions: View, Delete, Resubmit (if rejected)

### 2. Managers (HR, Operations, Declaration)
**Two Separate Tables:**

**Table 1: "Requests to Approve"**
- Shows requests from subordinates pending their approval
- Actions: View, Approve, Reject
- Empty state: "No requests pending your approval"

**Table 2: "My Requests"**
- Shows their own requests
- Actions: View, Delete, Resubmit (if rejected)
- Empty state: "You haven't made any requests"

### 3. COO
**Two Separate Tables:**

**Table 1: "Requests to Approve"**
- Shows all requests with status PENDING_COO_APPROVAL
- Actions: View, Approve, Reject
- Empty state: "No requests pending your approval"

**Table 2: "My Requests"**
- Shows their own requests
- Actions: View, Delete
- Empty state: "You haven't made any requests"

### 4. Finance Manager
**Three Separate Tables:**

**Table 1: "Accounts Department Requests"**
- Shows requests from accounts staff with status PENDING_FINANCE
- Actions: View, Approve, Reject
- Empty state: "No requests from accounts department"

**Table 2: "COO Approved Requests"**
- Shows requests with status APPROVED_BY_COO or COO_DIRECT_TO_FINANCE
- Actions: View, WAITING (mark as waiting for funds), APPROVED (approve for payment)
- Empty state: "No requests approved by COO"

**Table 3: "My Requests"**
- Shows their own requests
- Actions: View, Delete
- Empty state: "You haven't made any requests"

### 5. Cashier
**Single Table:**
- "Requests for Payment"
- Shows requests with status PENDING_PAYMENT
- Actions: View, PAID (mark as paid)
- Empty state: "No requests ready for payment"

### 6. Executives (Managing Director, Commercial Manager, Administrator)
**All Requests View:**
- Shows all requests in the system
- Tabs: All, Pending, Approved, Paid, Rejected, My Requests
- Full access to all actions

## Status Flow

```
CREATED
  ↓
PENDING_HR_APPROVAL (if from Documentation Officer)
  ↓ (HR Manager approves)
PENDING_COO_APPROVAL
  ↓ (COO approves)
APPROVED_BY_COO
  ↓ (Finance Manager clicks WAITING or APPROVED)
PENDING_FINANCE (if WAITING) or PENDING_PAYMENT (if APPROVED)
  ↓ (Cashier clicks PAID)
PAID
```

## Button Actions

### Approve Button (Managers & COO)
- Green button with checkmark icon
- Opens dialog with comment field
- Updates status to next stage
- Sends notification to next approver

### Reject Button (Managers & COO)
- Red button with X icon
- Opens dialog with required comment field
- Updates status to REJECTED_BY_[ROLE]
- Sends notification to requester

### WAITING Button (Finance Manager only)
- Orange button with clock icon
- Marks request as PENDING_FINANCE
- Notifies requester about waiting status
- Request stays in "COO Approved Requests" table

### APPROVED Button (Finance Manager only)
- Green button with checkmark icon
- Moves request to PENDING_PAYMENT status
- Notifies cashier
- Request moves to cashier's table

### PAID Button (Cashier only)
- Green button with dollar icon
- Marks request as PAID
- Generates payment reference
- Notifies requester and finance manager

## Implementation Plan

1. ✅ Create PettyCashTable component (DONE)
2. Create separate sections for each role
3. Update handlers for new buttons
4. Update status flow logic
5. Test each role's view
6. Update notifications

## Files to Modify

1. `app/src/pages/PettyCashPage.tsx` - Main component
2. `app/src/components/PettyCashTable.tsx` - Table component (DONE)
3. `app/src/store/pettyCashStore.ts` - Add new status types if needed
4. `app/src/types/index.ts` - Verify status types

## Next Steps

Due to file size, implement in phases:
1. Phase 1: Update state and handlers
2. Phase 2: Replace render section with new tables
3. Phase 3: Test and refine
