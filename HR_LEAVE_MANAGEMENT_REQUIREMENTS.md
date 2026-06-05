# HR & Leave Management System Requirements

## Date: March 8, 2026

## Overview
Implement comprehensive HR user management and leave request system for all employees.

## Key Requirements

### 1. HR User Management
✅ **Type Definitions Added**
- HR Manager can register all system users
- Assign roles and departments during registration
- System automatically creates module access based on role
- View, edit, activate/deactivate users

### 2. Leave Management Module
✅ **Type Definitions Added**
- Available to ALL users EXCEPT Managing Director
- Users can request leave with:
  - Leave type (Annual, Sick, Emergency, etc.)
  - Start date and end date
  - Number of days (auto-calculated)
  - Description/reason
- HR Manager can approve/reject all leave requests
- Track leave balances

## Implementation Status

### ✅ Phase 1: Type Definitions (COMPLETE)
- [x] Added `LeaveType` enum
- [x] Added `LeaveStatus` enum
- [x] Created `LeaveRequest` interface
- [x] Created `UserWithLeaveBalance` interface

### 🔄 Phase 2: Data Store (NEXT)
- [ ] Create `leaveStore.ts`
- [ ] Implement leave request CRUD operations
- [ ] Add approval workflow logic
- [ ] Calculate leave balances

### 🔄 Phase 3: HR User Management UI
- [ ] Create `UserManagementPage.tsx`
- [ ] Build user registration form
- [ ] Create user list table
- [ ] Add user edit functionality
- [ ] Implement role/department assignment

### 🔄 Phase 4: Leave Management UI
- [ ] Create `LeaveManagementPage.tsx`
- [ ] Build leave request form
- [ ] Create leave request list view
- [ ] Add HR approval interface
- [ ] Display leave history
- [ ] Show leave balance

### 🔄 Phase 5: Navigation & Access Control
- [ ] Update `DashboardLayout.tsx`
- [ ] Add "Leave Management" to sidebar
- [ ] Add "User Management" to HR sidebar
- [ ] Hide leave module from Managing Director
- [ ] Implement role-based permissions

### 🔄 Phase 6: Notifications
- [ ] Notify HR when leave requested
- [ ] Notify user when leave approved/rejected
- [ ] Add leave notifications to notification store

## Leave Types & Policies

### Annual Leave
- **Allocation**: 21 days per year
- **Deduction**: Yes, from annual leave balance
- **Approval**: HR Manager

### Sick Leave
- **Allocation**: 14 days per year
- **Deduction**: No, separate from annual leave
- **Approval**: HR Manager
- **Note**: May require medical certificate for >3 days

### Emergency Leave
- **Allocation**: Up to 3 days per occurrence
- **Deduction**: Yes, from annual leave balance
- **Approval**: HR Manager (expedited)

### Unpaid Leave
- **Allocation**: No limit
- **Deduction**: No (unpaid)
- **Approval**: HR Manager
- **Note**: Affects salary

### Maternity Leave
- **Allocation**: 84 days (12 weeks)
- **Deduction**: No, separate entitlement
- **Approval**: HR Manager

### Paternity Leave
- **Allocation**: 7 days
- **Deduction**: No, separate entitlement
- **Approval**: HR Manager

### Compassionate Leave
- **Allocation**: Up to 5 days per occurrence
- **Deduction**: No, separate from annual leave
- **Approval**: HR Manager
- **Note**: For bereavement or family emergencies

### Study Leave
- **Allocation**: As approved
- **Deduction**: Depends on company policy
- **Approval**: HR Manager + Management

## Module Access Matrix

### HR Manager
- Dashboard
- **User Management** (NEW)
- **Leave Management** (View & Approve All)
- Petty Cash
- Reports

### All Other Users (Except Managing Director)
- Dashboard
- **Leave Management** (Own Requests Only)
- Their role-specific modules
- Petty Cash

### Managing Director
- All modules
- **NO ACCESS to Leave Management**

## Workflows

### Leave Request Workflow
```
1. User submits leave request
   - Selects leave type
   - Enters start/end dates
   - System calculates days
   - Adds description
   
2. HR Manager receives notification
   
3. HR Manager reviews request
   - Views leave history
   - Checks leave balance
   - Reviews description
   
4. HR Manager approves/rejects
   - Adds comment (optional)
   - Confirms action
   
5. User receives notification
   
6. Leave balance updated (if approved)
```

### User Registration Workflow
```
1. HR Manager opens User Management
   
2. Clicks "Register New User"
   
3. Fills registration form:
   - Full name
   - Email
   - Phone
   - Role (dropdown)
   - Department (dropdown)
   - Initial password
   
4. System validates:
   - Email uniqueness
   - Required fields
   
5. System creates user account:
   - Generates user ID
   - Sets initial leave balance
   - Assigns module access based on role
   
6. User can login with credentials
   
7. HR Manager can edit/deactivate later
```

## UI Components Needed

### User Management Page
- User registration form dialog
- User list table with:
  - Name, Email, Role, Department
  - Status (Active/Inactive)
  - Actions (Edit, Deactivate)
- User edit dialog
- Role and department dropdowns
- Search and filter functionality

### Leave Management Page
- Leave request form dialog with:
  - Leave type selector
  - Date range picker
  - Days calculator
  - Description textarea
- Leave request list table with:
  - Request number
  - Leave type
  - Dates
  - Days
  - Status badge
  - Actions
- Leave balance card
- Leave history view
- HR approval dialog with:
  - Request details
  - Approve/Reject buttons
  - Comment field

## Database Schema (Mock Data)

### Leave Requests
```typescript
{
  id: 'lr_001',
  requestNumber: 'LR-2026-0001',
  userId: '1',
  leaveType: 'ANNUAL',
  startDate: new Date('2026-03-15'),
  endDate: new Date('2026-03-19'),
  numberOfDays: 5,
  description: 'Family vacation',
  status: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### User Leave Balances
```typescript
{
  userId: '1',
  annualLeaveBalance: 16, // 21 - 5 taken
  sickLeaveBalance: 14,
  totalLeaveTaken: 5
}
```

## Security & Permissions

### User Management
- Only HR Manager and Administrator can access
- Cannot delete users, only deactivate
- Cannot edit own role
- All actions logged

### Leave Management
- Users can only view/edit their own requests
- Users cannot edit approved/rejected requests
- HR Manager can view all requests
- Managing Director has NO access
- Leave balances cannot be manually edited by users

## Success Criteria

- [ ] HR Manager can register new users with role/department
- [ ] New users automatically get correct module access
- [ ] All users (except MD) can access leave management
- [ ] Users can submit leave requests
- [ ] HR Manager can approve/reject leave requests
- [ ] Leave balances update correctly
- [ ] Notifications sent for all leave actions
- [ ] Leave history is maintained
- [ ] Managing Director cannot see leave module
- [ ] System tracks all leave-related activities

## Next Steps

1. ✅ Create type definitions
2. Create leave store with mock data
3. Create user management store
4. Build User Management page
5. Build Leave Management page
6. Update navigation and permissions
7. Add notifications
8. Test all workflows
9. Deploy and verify

## Notes

- Leave balances reset annually (January 1st)
- Unused annual leave may carry over (company policy)
- Sick leave requires medical certificate after 3 consecutive days
- Emergency leave requires documentation
- All leave requests must be submitted in advance (except emergency)
- HR Manager can override leave balances if needed
- System maintains complete audit trail

