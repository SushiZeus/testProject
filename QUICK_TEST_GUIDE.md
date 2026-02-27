# Quick Test Guide - New Petty Cash System

## 🚀 System is Live!

All 5 development servers are running:
- Port 5173: http://localhost:5173
- Port 5174: http://localhost:5174
- Port 5175: http://localhost:5175
- Port 5176: http://localhost:5176
- Port 5177: http://localhost:5177

**Sessions Dashboard**: http://localhost:5173/sessions.html

## 🔑 Test User Credentials

### Regular User
- **Email**: doc@clearance.com
- **Password**: password
- **Role**: Documentation Officer
- **Expected View**: Single "My Requests" table

### HR Manager
- **Email**: hr@clearance.com
- **Password**: password
- **Role**: HR Manager
- **Expected View**: Two tables
  1. "Requests to Approve" (from HR staff)
  2. "My Requests"

### Operations Manager
- **Email**: ops@clearance.com
- **Password**: password
- **Role**: Operations Manager
- **Expected View**: Two tables
  1. "Requests to Approve" (from operations staff)
  2. "My Requests"

### Declaration Manager
- **Email**: decl@clearance.com
- **Password**: password
- **Role**: Declaration Manager
- **Expected View**: Two tables
  1. "Requests to Approve" (from declaration staff)
  2. "My Requests"

### COO
- **Email**: coo@clearance.com
- **Password**: password
- **Role**: Chief Operating Officer
- **Expected View**: Two tables
  1. "Requests to Approve" (all COO-level requests)
  2. "My Requests"

### Finance Manager
- **Email**: finance@clearance.com
- **Password**: password
- **Role**: Finance Manager
- **Expected View**: Three tables
  1. "Accounts Department Requests" (Approve/Reject)
  2. "COO Approved Requests" (WAITING/APPROVED buttons)
  3. "My Requests"

### Cashier
- **Email**: cashier@clearance.com
- **Password**: password
- **Role**: Cashier
- **Expected View**: Single table
  - "Requests for Payment" (Mark as Paid button)

### Administrator
- **Email**: admin@clearance.com
- **Password**: password
- **Role**: Administrator
- **Expected View**: Full tabs interface (All, Pending, Approved, Paid, Rejected, My Requests)

## 📝 Quick Test Scenario

### Scenario 1: Complete Workflow Test

1. **Documentation Officer** (doc@clearance.com)
   - Create a petty cash request for TZS 50,000
   - Description: "Office supplies for documentation department"
   - Submit request

2. **HR Manager** (hr@clearance.com)
   - Check "Requests to Approve" table
   - Should see the documentation officer's request
   - Click "Approve" and add comment
   - Request moves to COO

3. **COO** (coo@clearance.com)
   - Check "Requests to Approve" table
   - Should see the HR-approved request
   - Click "Approve" and add comment
   - Request moves to Finance Manager

4. **Finance Manager** (finance@clearance.com)
   - Check "COO Approved Requests" table
   - Should see the COO-approved request
   - Click "APPROVED" button (ready for payment)
   - Request moves to Cashier

5. **Cashier** (cashier@clearance.com)
   - Check "Requests for Payment" table
   - Should see the finance-approved request
   - Click "Mark as Paid" button
   - Payment reference is generated (PV-timestamp)

6. **Documentation Officer** (doc@clearance.com)
   - Check "My Requests" table
   - Request should show status "PAID"
   - Click "View" to see complete timeline

### Scenario 2: Waiting for Funds

1. **Finance Manager** (finance@clearance.com)
   - Find a COO-approved request
   - Click "WAITING" button instead of "APPROVED"
   - Request status changes to "PENDING_FINANCE"
   - Requester gets notification about waiting for funds

### Scenario 3: Rejection and Resubmit

1. **HR Manager** (hr@clearance.com)
   - Find a pending request
   - Click "Reject" button
   - Add rejection reason: "Insufficient justification"
   - Submit

2. **Documentation Officer** (doc@clearance.com)
   - Check "My Requests" table
   - Should see rejected request
   - Click "Resubmit" button
   - Add response comment explaining changes
   - Request goes back to HR Manager

## 🎯 What to Verify

### For Each Role:
- [ ] Correct tables are displayed
- [ ] Correct buttons are available
- [ ] Can view request details
- [ ] Timeline shows all events
- [ ] Notifications appear as toast popups

### For Managers:
- [ ] "Requests to Approve" shows only relevant requests
- [ ] "My Requests" shows only their own requests
- [ ] Approve/Reject buttons work correctly
- [ ] Comments are saved and visible in timeline

### For Finance Manager:
- [ ] Three separate tables are visible
- [ ] WAITING button changes status correctly
- [ ] APPROVED button sends to cashier
- [ ] Notifications sent to correct users

### For Cashier:
- [ ] Only sees finance-approved requests
- [ ] Mark as Paid button works
- [ ] Payment reference is generated
- [ ] Requester gets notification

## 🐛 Known Issues to Check

1. **Data Sharing**: Remember to use ONE port with multiple browser windows for shared data testing
2. **Notifications**: Should appear as toast popups in top-right corner
3. **Timeline**: Should show all approval stages with comments
4. **Status Colors**: Each status should have appropriate color coding

## 📊 Status Colors Reference

- **PENDING_HR_APPROVAL**: Purple
- **PENDING_MANAGER_APPROVAL**: Amber
- **PENDING_DECLARATION_MANAGER_APPROVAL**: Blue
- **PENDING_COO_APPROVAL**: Indigo
- **APPROVED_BY_COO**: Green
- **PENDING_FINANCE**: Purple (waiting for funds)
- **PENDING_PAYMENT**: Amber (ready for payment)
- **PAID**: Green
- **REJECTED_***: Red

## 🔄 Reset Data

If you need to clear all requests and start fresh:

1. Login as Administrator
2. Click "Reset All" button in top-right
3. Confirm deletion

Or visit: http://localhost:5173/reset-petty-cash.html

---

**Happy Testing!** 🎉

The new role-based petty cash system is ready for comprehensive testing.
