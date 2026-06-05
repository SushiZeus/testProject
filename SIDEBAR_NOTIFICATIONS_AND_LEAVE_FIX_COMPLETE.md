# Sidebar Notifications & Leave Management Fix Complete

## Date: March 9, 2026

## Implementation Status: ✅ COMPLETE

### Issues Fixed

#### 1. Leave Management Page Empty Space Fixed ✅
- Fixed default tab for HR Manager to show "Pending" tab instead of "My Requests"
- HR Manager now sees pending leave requests immediately upon opening the page
- Regular users see their own requests by default
- Removed duplicate `isHRManager` variable declaration

#### 2. Sidebar Notification Badges Added ✅
- All sidebar menu items now show notification counts
- Red badge appears when there are unread notifications for that module
- Badge shows number of unread notifications
- Works for both expanded and collapsed sidebar states
- Mobile sidebar also shows notification badges

### Features Implemented

#### Sidebar Notification System
- **Module-Based Notification Counting**
  - Each menu item tracks its own notifications
  - Notifications are counted based on their link patterns
  - Only unread notifications are counted
  - Real-time updates when notifications change

- **Visual Indicators**
  - Red badge with white text for high visibility
  - Badge shows exact count of unread notifications
  - Compact design for collapsed sidebar (small badge on icon)
  - Full badge with count for expanded sidebar

- **Module Mapping**
  - Dashboard: `/dashboard` notifications
  - File Opening: `/files` notifications
  - Declaration: `/declaration` notifications
  - Operations: `/operations` notifications
  - Shipping Line: `/shipping-line` notifications
  - Petty Cash: `/petty-cash` notifications
  - Leave Management: `/leave-management` notifications
  - User Management: `/user-management` notifications
  - Reports: `/reports` notifications
  - Drivers: `/drivers` notifications
  - Driver Management: `/drivers-management` notifications

#### Leave Management Improvements
- **HR Manager View**
  - Default tab: "Pending" (shows pending requests immediately)
  - Can switch to "All Requests" tab
  - No "My Requests" tab (HR Manager doesn't request leave)

- **Regular User View**
  - Default tab: "My Requests" (shows their own requests)
  - Can view request history
  - Can cancel pending requests

- **Notification Integration**
  - HR Manager receives notification when user submits leave request
  - Notification appears in bell icon and sidebar badge
  - User receives notification when request is approved/rejected
  - All notifications link to `/leave-management`

### Technical Implementation

#### Files Modified

1. **app/src/layouts/DashboardLayout.tsx**
   - Added `getModuleNotificationCount()` function
   - Maps routes to notification link patterns
   - Counts unread notifications per module
   - Updated desktop sidebar navigation to show badges
   - Updated mobile sidebar navigation to show badges
   - Different badge styles for expanded/collapsed states

2. **app/src/pages/LeaveManagementPage.tsx**
   - Fixed default tab based on user role
   - HR Manager: `'pending'`
   - Regular users: `'my-requests'`
   - Removed duplicate `isHRManager` declaration
   - Fixed HR Manager ID in notification (changed from '15' to '13')

### Build & Deployment

#### Build Status: ✅ SUCCESS
```bash
npm run build
✓ 1849 modules transformed
✓ built in 9.53s
```

#### Deployment Status: ✅ RUNNING
```bash
npm run preview
➜  Local:   http://localhost:4173/
```

### How It Works

#### Notification Badge System

1. **Notification Creation**
   - When an action occurs (file status change, leave request, etc.)
   - Notification is created with a `link` property
   - Link points to the relevant module (e.g., `/leave-management`)

2. **Badge Counting**
   - `getModuleNotificationCount()` filters user's unread notifications
   - Checks if notification link matches module route pattern
   - Returns count of matching notifications

3. **Visual Display**
   - Badge appears next to menu item label (expanded sidebar)
   - Badge appears on top-right of icon (collapsed sidebar)
   - Red background with white text for visibility
   - Updates in real-time as notifications change

#### Example Flow: Leave Request

1. User submits leave request
2. Notification created for HR Manager with link `/leave-management`
3. HR Manager's sidebar shows badge "1" on "Leave Management" menu
4. HR Manager clicks menu item
5. Sees pending request immediately (default tab)
6. Approves/rejects request
7. Notification created for user with link `/leave-management`
8. User's sidebar shows badge "1" on "Leave Management" menu
9. User clicks menu item
10. Sees updated request status

### Testing Instructions

#### Test 1: Leave Management Default Tab
1. Login as HR Manager (hr_manager@company.com / hr_manager123)
2. Click "Leave Management" in sidebar
3. Should see "Pending" tab active by default
4. Should see list of pending requests (if any)

#### Test 2: Sidebar Notification Badges
1. Login as any user
2. Perform an action that creates a notification (e.g., submit leave request)
3. Check sidebar menu items
4. Should see red badge with count on relevant menu item
5. Click menu item to view notifications
6. Badge should update/disappear when notifications are read

#### Test 3: Leave Request Notification Flow
1. Login as regular user (e.g., documentation_officer@company.com / documentation_officer123)
2. Go to Leave Management
3. Click "Request Leave"
4. Submit a leave request
5. Logout
6. Login as HR Manager (hr_manager@company.com / hr_manager123)
7. Should see badge "1" on "Leave Management" menu
8. Click "Leave Management"
9. Should see pending request
10. Approve or reject request
11. Logout
12. Login as original user
13. Should see badge "1" on "Leave Management" menu
14. Click to view updated status

#### Test 4: Multiple Module Notifications
1. Login as user with multiple roles/permissions
2. Perform actions in different modules
3. Check sidebar
4. Each module should show its own notification count
5. Badges should be independent per module

### User Credentials

#### HR Manager (Can approve leave & see all notifications)
- Email: hr_manager@company.com
- Password: hr_manager123

#### Test Users (Can request leave)
- Documentation Officer: documentation_officer@company.com / documentation_officer123
- Declarant: declarant@company.com / declarant123
- Operations Manager: operations_manager@company.com / operations_manager123

### Visual Design

#### Expanded Sidebar Badge
```
[Icon] Menu Label [Badge: 3]
```
- Badge appears at the end of the row
- Red background (#ef4444)
- White text
- Rounded corners
- Minimum width to accommodate numbers

#### Collapsed Sidebar Badge
```
[Icon with small badge on top-right corner]
```
- Small badge (16x16px)
- Positioned absolutely on top-right of icon
- Red background
- White text
- Smaller font size (10px)

### Notes

- Notification badges update in real-time
- Only unread notifications are counted
- Badges disappear when all notifications are read
- Each module tracks its own notifications independently
- System supports unlimited notification types
- Notifications are persistent across sessions (localStorage)
- Badge counts are calculated on every render for accuracy

## Implementation Complete! 🎉

The sidebar now shows notification badges for all menu items, and the leave management page displays correctly for all user types.
