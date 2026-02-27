# Petty Cash Page - Implementation Guide

## ✅ Completed Components

1. **PettyCashTable.tsx** - Reusable table component with all button types
2. **ManagerSection.tsx** - Two-table layout for managers
3. **FinanceManagerSection.tsx** - Three-table layout for finance manager
4. **CashierSection.tsx** - Single table for cashier

## 📋 Integration Steps

### Step 1: Add Imports to PettyCashPage.tsx

Add these imports after the existing ones:

```typescript
import { ManagerSection } from './sections/ManagerSection';
import { FinanceManagerSection } from './sections/FinanceManagerSection';
import { CashierSection } from './sections/CashierSection';
```

### Step 2: Add Handler Functions

Add these handlers after the existing `handleDelete` function:

```typescript
const handleFinanceWaiting = (request: PettyCashRequest) => {
  if (!user || user.role !== 'finance_manager') return;
  
  updateStatus(request.id, 'PENDING_FINANCE', {
    financeManagerId: user.id,
    financeComment: 'Waiting for funds availability',
  });
  
  toast.info('Request marked as waiting for funds');
  
  addNotification({
    userId: request.requestedBy,
    title: '⏳ Waiting for Funds',
    message: `Your request ${request.requestNumber} is waiting for funds`,
    type: 'info',
  });
};

const handleFinanceApproved = (request: PettyCashRequest) => {
  if (!user || user.role !== 'finance_manager') return;
  
  updateStatus(request.id, 'PENDING_PAYMENT', {
    financeManagerId: user.id,
    financeComment: 'Approved for payment',
  });
  
  toast.success('Request approved for payment');
  
  addNotification({
    userId: '12', // Cashier
    title: '💰 Payment Ready',
    message: `Request ${request.requestNumber} is ready for payment`,
    type: 'warning',
    link: '/petty-cash',
  });
};

const handleCashierPaid = (request: PettyCashRequest) => {
  if (!user || user.role !== 'cashier') return;
  
  updateStatus(request.id, 'PAID', {
    cashierId: user.id,
    paymentReference: `PV-${Date.now()}`,
  });
  
  toast.success('Payment completed');
  
  addNotification({
    userId: request.requestedBy,
    title: '✅ Payment Completed',
    message: `Your request ${request.requestNumber} has been paid`,
    type: 'success',
  });
};
```

### Step 3: Replace the Tabs Section

Find the section that starts with `<Tabs value={activeTab}>` and replace it with:

```typescript
{/* Role-based sections */}
{user.role === 'cashier' ? (
  <CashierSection
    user={user}
    financeApprovedRequests={financeApprovedRequests}
    statusColors={statusColors}
    onView={openViewDialog}
    onPaid={handleCashierPaid}
  />
) : user.role === 'finance_manager' ? (
  <FinanceManagerSection
    user={user}
    accountsRequests={requestsToApprove}
    cooApprovedRequests={cooApprovedRequests}
    myRequests={myRequests}
    statusColors={statusColors}
    onView={openViewDialog}
    onApprove={(r) => openActionDialog(r, 'approve')}
    onReject={(r) => openActionDialog(r, 'reject')}
    onWaiting={handleFinanceWaiting}
    onApproved={handleFinanceApproved}
    onResubmit={openResubmitDialog}
    onDelete={openDeleteDialog}
  />
) : (user.role === 'hr_manager' || user.role === 'operations_manager' || 
      user.role === 'declaration_manager' || user.role === 'coo') ? (
  <ManagerSection
    user={user}
    requestsToApprove={requestsToApprove}
    myRequests={myRequests}
    statusColors={statusColors}
    onView={openViewDialog}
    onApprove={(r) => openActionDialog(r, 'approve')}
    onReject={(r) => openActionDialog(r, 'reject')}
    onResubmit={openResubmitDialog}
    onDelete={openDeleteDialog}
  />
) : canViewAllRequests ? (
  // Keep existing tabs for executives
  <Tabs value={activeTab} onValueChange={setActiveTab}>
    {/* Existing tabs code */}
  </Tabs>
) : (
  // Regular users - just show their requests
  <Card>
    <CardHeader>
      <CardTitle>My Requests</CardTitle>
      <CardDescription>Your petty cash requests</CardDescription>
    </CardHeader>
    <CardContent>
      <PettyCashTable
        requests={myRequests}
        user={user}
        statusColors={statusColors}
        onView={openViewDialog}
        onResubmit={openResubmitDialog}
        onDelete={openDeleteDialog}
      />
    </CardContent>
  </Card>
)}
```

## 🧪 Testing Checklist

### Regular User (Documentation Officer)
- [ ] Can create requests
- [ ] Sees only "My Requests" table
- [ ] Can view, delete, resubmit own requests

### HR Manager
- [ ] Sees "Requests to Approve" table with HR pending requests
- [ ] Sees "My Requests" table
- [ ] Can approve/reject team requests
- [ ] Can manage own requests

### Operations Manager
- [ ] Sees "Requests to Approve" table with operations pending requests
- [ ] Sees "My Requests" table
- [ ] Can approve/reject team requests

### Declaration Manager
- [ ] Sees "Requests to Approve" table with declaration pending requests
- [ ] Sees "My Requests" table
- [ ] Can approve/reject team requests

### COO
- [ ] Sees "Requests to Approve" table with COO pending requests
- [ ] Sees "My Requests" table
- [ ] Can approve/reject all requests

### Finance Manager
- [ ] Sees "Accounts Department Requests" table
- [ ] Sees "COO Approved Requests" table with WAITING/APPROVED buttons
- [ ] Sees "My Requests" table
- [ ] Can mark as waiting or approve for payment

### Cashier
- [ ] Sees only "Requests for Payment" table
- [ ] Can mark requests as PAID
- [ ] Generates payment reference

## 📝 Notes

- All dialogs (View, Approve/Reject, Resubmit, Delete) remain unchanged
- Status colors remain the same
- Notifications work as before
- Timeline feature works in View dialog

## 🚀 Deployment

After making changes:
1. Save the file
2. Check for TypeScript errors
3. Test with different user roles
4. Verify notifications
5. Check timeline in View dialog

## 📂 Files Modified

- ✅ `app/src/components/PettyCashTable.tsx` (Created)
- ✅ `app/src/pages/sections/ManagerSection.tsx` (Created)
- ✅ `app/src/pages/sections/FinanceManagerSection.tsx` (Created)
- ✅ `app/src/pages/sections/CashierSection.tsx` (Created)
- ⏳ `app/src/pages/PettyCashPage.tsx` (To be modified)

## 🔄 Backup

Backup created at: `app/src/pages/PettyCashPage_BACKUP.tsx`

To restore: `cp src/pages/PettyCashPage_BACKUP.tsx src/pages/PettyCashPage.tsx`
