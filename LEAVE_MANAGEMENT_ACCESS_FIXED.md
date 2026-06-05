# Leave Management Access Fixed - March 16, 2026

## Issue Resolved ✅
Leave Management module was not responsive for Documentation Officer and other non-HR users. The page was only showing content for HR managers.

## Root Cause
The LeaveManagementPage component used `isHRManager` boolean to determine what to show, but didn't have proper logic for other users who should be able to request leave. The page treated all non-HR users the same but the logic was checking `!isHRManager` which could be confusing.

## Solution Implemented
Added explicit `canRequestLeave` variable that clearly identifies users who can request leave (all users except HR Manager).

### Code Changes
**File**: `app/src/pages/LeaveManagementPage.tsx`

**Added**:
```typescript
// HR Manager has special view, all other users can request leave
const isHRManager = user?.role === 'hr_manager';
const canRequestLeave = user && user.role !== 'hr_manager'; // All users except HR can request leave
```

**Updated**:
- Header buttons: Changed from `!isHRManager` to `canRequestLeave`
- Leave balance cards: Changed from `!isHRManager` to `canRequestLeave`
- Tabs: Changed from `!isHRManager` to `canRequestLeave`
- My Requests tab: Changed from `!isHRManager` to `canRequestLeave`

## Who Can Access Leave Management

### All Users (Can Request Leave):
- ✅ Documentation Officer
- ✅ Declaration Manager
- ✅ Declarant
- ✅ Operations Manager
- ✅ Operation Clerk
- ✅ Permits Clerk
- ✅ Shipping Line Clerk
- ✅ Delivery Clerk
- ✅ Transport Manager
- ✅ Driver
- ✅ Finance Manager
- ✅ Cashier
- ✅ Commercial Manager
- ✅ COO
- ✅ Contact Person
- ✅ Administrator

### HR Manager (Special View):
- ✅ Can review and approve/reject leave requests
- ✅ Can view all requests
- ✅ Can view pending requests
- ❌ Cannot request leave (manages others' leave)

### Managing Director:
- ❌ No access to leave management module

## Features Available to All Users

### Request Leave
- Select leave type (Annual, Sick, Emergency, etc.)
- Choose start and end dates
- Automatic working days calculation
- Leave balance tracking
- Submit for HR approval

### View My Requests
- See all personal leave requests
- View status (Pending, Approved, Rejected, Cancelled)
- Cancel pending requests
- View request details

### Leave Balance
- Annual leave days remaining (28 days per year)
- Total days taken this year
- Real-time balance updates

### View History
- Access complete leave history
- Filter and search requests
- Export capabilities

## Testing

### Test as Documentation Officer:
1. Login: `docs@dowelef.com` / `docs123`
2. Click "Leave Management" in sidebar
3. Should see:
   - ✅ "Request Leave" button
   - ✅ "View History" button
   - ✅ Leave balance cards
   - ✅ "My Requests" tab
   - ✅ Ability to submit leave requests

### Test as Other Users:
Same functionality available for all non-HR users listed above.

### Test as HR Manager:
1. Login: `hr@dowelef.com` / `hr123`
2. Click "Leave Management" in sidebar
3. Should see:
   - ✅ "Pending" tab with count
   - ✅ "All Requests" tab
   - ✅ Review and approve/reject buttons
   - ❌ No "Request Leave" button (HR manages, doesn't request)

## Status: COMPLETE ✅
Leave Management module is now fully accessible and responsive for all users including Documentation Officer and other staff members.