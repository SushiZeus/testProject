# Leave Management & HR User Management Implementation Plan

## Date: March 8, 2026

## Overview
Implement comprehensive HR user management and leave request system for DOW ELEF Management System.

## Requirements

### 1. HR User Management Module
- HR Manager can register new users
- Assign roles and departments
- System automatically grants module access based on role
- View all registered users
- Edit user details
- Activate/deactivate users

### 2. Leave Management Module
- Available to ALL users EXCEPT Managing Director
- Users can submit leave requests with:
  - Number of days
  - Start date
  - End date
  - Leave type (Annual, Sick, Emergency, etc.)
  - Description/reason
- HR Manager can:
  - View all leave requests
  - Approve/reject requests
  - View leave history
  - Track leave balances

## Data Structure

### User Type Extension
```typescript
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  department: string;
  phone: string;
  isActive: boolean;
  leaveBalance?: number; // Annual leave days remaining
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // HR Manager who created the user
}
```

### Leave Request Type
```typescript
interface LeaveRequest {
  id: string;
  requestNumber: string; // LR-2026-XXXX
  userId: string;
  user?: User;
  leaveType: 'ANNUAL' | 'SICK' | 'EMERGENCY' | 'UNPAID' | 'MATERNITY' | 'PATERNITY';
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  hrManagerId?: string;
  hrManager?: User;
  hrComment?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Module Access Matrix

### HR Manager Access
- Dashboard
- User Management (NEW)
- Leave Management (View All)
- Petty Cash
- Reports

### All Other Users (Except Managing Director)
- Dashboard
- Leave Management (Own Requests)
- Their role-specific modules
- Petty Cash

### Managing Director
- All modules EXCEPT Leave Management

## Implementation Steps

### Phase 1: Type Definitions
1. Create leave request types
2. Update user types with leave balance
3. Add leave-related permissions

### Phase 2: Data Store
1. Create `leaveStore.ts` for leave management
2. Add leave request CRUD operations
3. Implement approval workflow

### Phase 3: HR User Management
1. Create `UserManagementPage.tsx`
2. Add user registration form
3. Implement user listing and editing
4. Add role/department assignment

### Phase 4: Leave Management UI
1. Create `LeaveManagementPage.tsx`
2. Add leave request form
3. Create leave request list view
4. Implement approval interface for HR
5. Add leave history view

### Phase 5: Navigation & Permissions
1. Update `DashboardLayout.tsx` navigation
2. Add leave management to sidebar
3. Implement role-based access control
4. Hide leave module from Managing Director

### Phase 6: Notifications
1. Notify HR when leave requested
2. Notify user when leave approved/rejected
3. Add leave-related notifications

## UI Components Needed

### User Management
- User registration form
- User list table
- User edit dialog
- Role/department selector
- User activation toggle

### Leave Management
- Leave request form
- Leave request list
- Leave approval dialog
- Leave history view
- Leave balance display

## Workflow

### Leave Request Workflow
```
User submits leave request
  ↓
HR Manager receives notification
  ↓
HR Manager reviews request
  ↓
HR Manager approves/rejects
  ↓
User receives notification
  ↓
Leave balance updated (if approved)
```

### User Registration Workflow
```
HR Manager opens User Management
  ↓
Fills registration form
  ↓
Selects role and department
  ↓
System creates user account
  ↓
System assigns module access based on role
  ↓
User can login with credentials
```

## Leave Types & Policies

### Annual Leave
- 21 days per year
- Requires advance notice
- Deducted from leave balance

### Sick Leave
- Up to 14 days per year
- May require medical certificate
- Not deducted from annual leave

### Emergency Leave
- Up to 3 days per occurrence
- Immediate approval consideration
- Deducted from annual leave

### Unpaid Leave
- No limit
- Not deducted from leave balance
- Affects salary

### Maternity Leave
- 84 days (12 weeks)
- Separate from annual leave

### Paternity Leave
- 7 days
- Separate from annual leave

## Security Considerations

1. Only HR Manager and Administrator can register users
2. Users can only view their own leave requests
3. HR Manager can view all leave requests
4. Managing Director has no access to leave module
5. Leave balance cannot be manually edited by users
6. All leave actions are logged

## Success Criteria

- [ ] HR Manager can register new users
- [ ] Users automatically get correct module access
- [ ] All users (except MD) can request leave
- [ ] HR Manager can approve/reject leave
- [ ] Leave balances update correctly
- [ ] Notifications sent for all leave actions
- [ ] Leave history is maintained
- [ ] Managing Director cannot access leave module

## Next Steps

1. Create type definitions
2. Implement leave store
3. Build user management page
4. Build leave management page
5. Update navigation
6. Add notifications
7. Test all workflows
8. Deploy

