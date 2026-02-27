# 🚀 Start Testing - Petty Cash System

## System Status: ✅ READY

All development servers are running and the new petty cash system is fully integrated!

## Quick Start

### 1. Open the Application
Visit: **http://localhost:5173**

### 2. Multi-User Testing Dashboard
Visit: **http://localhost:5173/sessions.html**

This dashboard provides:
- Quick links to all 5 running sessions
- User credentials for each role
- Testing instructions

## Test Accounts (All passwords: "password")

| Role | Email | What to Test |
|------|-------|--------------|
| Documentation Officer | doc@clearance.com | Create requests, view own requests |
| HR Manager | hr@clearance.com | Approve/reject HR requests, manage own requests |
| Operations Manager | ops@clearance.com | Approve/reject operations requests |
| Declaration Manager | decl@clearance.com | Approve/reject declaration requests |
| COO | coo@clearance.com | Approve/reject all COO-level requests |
| Finance Manager | finance@clearance.com | WAITING/APPROVED buttons, three tables |
| Cashier | cashier@clearance.com | Mark as Paid button |
| Administrator | admin@clearance.com | Full system access, reset data |

## 5-Minute Test Flow

### Step 1: Create Request (2 min)
1. Login as **Documentation Officer** (doc@clearance.com)
2. Click "Request Petty Cash"
3. Select "No File - General Request"
4. Amount: 50000 TZS
5. Description: "Office supplies for documentation team"
6. Click "Submit Request"
7. ✅ Should see request in "My Requests" table

### Step 2: HR Approval (1 min)
1. Login as **HR Manager** (hr@clearance.com)
2. Check "Requests to Approve" table
3. ✅ Should see the documentation officer's request
4. Click "Approve"
5. Add comment: "Approved for office supplies"
6. Click "Approve"
7. ✅ Request should move to COO

### Step 3: COO Approval (1 min)
1. Login as **COO** (coo@clearance.com)
2. Check "Requests to Approve" table
3. ✅ Should see the HR-approved request
4. Click "Approve"
5. Add comment: "Approved by COO"
6. Click "Approve"
7. ✅ Request should move to Finance Manager

### Step 4: Finance Approval (1 min)
1. Login as **Finance Manager** (finance@clearance.com)
2. Check "COO Approved Requests" table
3. ✅ Should see the COO-approved request
4. Click "APPROVED" button (green)
5. ✅ Request should move to Cashier
6. ✅ Toast notification should appear

### Step 5: Payment (30 sec)
1. Login as **Cashier** (cashier@clearance.com)
2. Check "Requests for Payment" table
3. ✅ Should see the finance-approved request
4. Click "Mark as Paid"
5. ✅ Payment reference should be generated (PV-timestamp)
6. ✅ Request status changes to PAID

### Step 6: Verify Timeline (30 sec)
1. Login as **Documentation Officer** (doc@clearance.com)
2. Find your request in "My Requests"
3. Click "View"
4. ✅ Should see complete timeline with all approvals
5. ✅ Should see all comments from approvers
6. ✅ Should see payment reference

## What to Look For

### ✅ Correct Views
- Each role sees only their relevant tables
- Managers have separate "Requests to Approve" and "My Requests"
- Finance Manager has 3 tables
- Cashier has 1 table
- Regular users have 1 table

### ✅ Correct Buttons
- Managers: Approve/Reject buttons
- Finance Manager: WAITING/APPROVED buttons
- Cashier: Mark as Paid button
- Request owner: Delete/Resubmit buttons (if rejected)

### ✅ Notifications
- Toast popups appear in top-right corner
- Notifications sent to correct users at each stage
- "View" button in notification works

### ✅ Timeline
- Shows all approval stages
- Shows all comments
- Shows timestamps
- Shows payment reference (when paid)

### ✅ Status Colors
- Purple: Pending HR/Finance
- Amber: Pending Manager/Payment
- Blue: Pending Declaration Manager
- Indigo: Pending COO
- Green: Approved/Paid
- Red: Rejected

## Advanced Testing

### Test WAITING Button
1. Login as Finance Manager
2. Find COO-approved request
3. Click "WAITING" instead of "APPROVED"
4. ✅ Status changes to "PENDING_FINANCE"
5. ✅ Requester gets notification

### Test Rejection Flow
1. Login as HR Manager
2. Find pending request
3. Click "Reject"
4. Add reason: "Insufficient justification"
5. ✅ Request marked as rejected
6. Login as requester
7. ✅ Should see "Resubmit" button
8. Click "Resubmit"
9. Add response comment
10. ✅ Request goes back to HR Manager

### Test Delete Function
1. Login as Documentation Officer
2. Find your request
3. Click "Delete"
4. Confirm deletion
5. ✅ Request removed from system

## Troubleshooting

### Issue: Request not appearing
**Solution**: Make sure you're using the SAME port (e.g., 5173) in multiple browser windows, not different ports. Different ports have isolated localStorage.

### Issue: Buttons not showing
**Solution**: Verify you're logged in with the correct role. Each role has specific buttons.

### Issue: Notifications not appearing
**Solution**: Check browser console for errors. Notifications should appear as toast popups in top-right.

### Issue: Need to reset data
**Solution**: 
- Login as Administrator
- Click "Reset All" button
- Or visit: http://localhost:5173/reset-petty-cash.html

## Documentation Reference

- **QUICK_TEST_GUIDE.md** - Detailed testing scenarios
- **PETTY_CASH_INTEGRATION_COMPLETE.md** - Technical details
- **INTEGRATION_SUCCESS.md** - Summary of changes
- **IMPLEMENTATION_GUIDE.md** - Implementation reference

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify you're using correct credentials
3. Ensure you're on the same port for shared data
4. Try resetting data and starting fresh

---

## 🎯 Ready to Test!

The system is fully functional and ready for comprehensive testing. Start with the 5-minute test flow above, then explore the advanced features.

**Current Status**: All 5 servers running ✅
**Integration Status**: Complete ✅
**Documentation**: Complete ✅

**Let's test!** 🚀
