# SHIPPING LINE CLERK DO WORKFLOW ENHANCEMENTS - JUNE 26, 2026

## 🎯 NEW REQUIREMENTS

### 1. Container Numbers Special Field
- **Requirement**: Container numbers must be filled in a special field in the Shipping Line module
- **Visibility**: Container numbers must be visible to ALL users in the system
- **Implementation**: Use existing `containerNumbers` field in ShipmentFile interface

### 2. REQUEST DO PAYMENT Button
- **Requirement**: Shipping Line Clerk can request funds for Delivery Order
- **Dialog Fields**:
  - Amount (number input)
  - Currency selector (TZS, USD, EUR)
  - Invoice upload (file)
  - Description (textarea)
- **Status Change**: After request → `WAITING_FOR_DO_PAYMENT`
- **Workflow**: Similar to Petty Cash but specific to DO for the shipment

### 3. DO PAID Checkbox
- **Requirement**: Finance Manager can mark DO as paid
- **Action**: After marking paid, Shipping Line Clerk can upload the DO document
- **Status Flow**: WAITING_FOR_DO_PAYMENT → DO_PAID → Can upload DO document

### 4. DO Document Upload After Payment
- **Requirement**: After DO marked as paid, clerk uploads actual DO document
- **Visibility**: DO document appears in:
  - Operations Manager module
  - Operation Clerk module
  - All users can see/download
- **Effect**: Enables Release Order upload

### 5. Release Order + DO Requirement
- **Requirement**: Operation Clerk must have BOTH:
  - Release Order uploaded
  - DO document (from Shipping Line) visible
- **Then**: PORT CHARGES button becomes available

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: Update Types ✅ DONE
```typescript
// Added to ShipmentFile interface in types/index.ts:
deliveryOrderPaidAt?: Date;
deliveryOrderPaidBy?: string;
doPaymentRequestAmount?: number;
doPaymentRequestCurrency?: string;
doPaymentRequestDescription?: string;
doPaymentRequestInvoiceUrl?: string;
doPaymentRequestStatus?: 'PENDING' | 'PAID' | 'REJECTED';
doPaymentRequestRequestedAt?: Date;
doPaymentRequestPaidAt?: Date;
```

### Phase 2: Update ShippingLinePage.tsx ✅ IN PROGRESS

#### A. Add State Variables ✅ DONE
```typescript
const [doPaymentRequestDialogOpen, setDoPaymentRequestDialogOpen] = useState(false);
const [selectedFileForDoPayment, setSelectedFileForDoPayment] = useState<ShipmentFile | null>(null);
const [doPaymentForm, setDoPaymentForm] = useState({
  amount: '',
  currency: 'TZS',
  description: '',
  invoiceFile: null as File | null,
});
```

#### B. Add Handler Functions ✅ DONE
```typescript
// Handle DO Payment Request
const handleDoPaymentRequest = () => {
  // Validate form
  // Upload invoice
  // Update file with DO payment request
  // Notify Operations Manager and Finance Manager
  // Status: Keep current, add doPaymentRequest fields
};

// Handle DO Payment Confirmation (Finance only)
const handleDoPaymentConfirmation = () => {
  // Mark DO payment as paid
  // Update file status to enable DO submission
  // Notify Shipping Line Clerk
};
```

#### C. Update UI - Add Buttons ⚠️ TODO
1. **REQUEST DO PAYMENT Button** (purple/orange)
   - Visible when: File has shipping details
   - Opens dialog with: Amount, Currency, Invoice, Description
   - Action: Create DO payment request

2. **Container Numbers Display** (prominent)
   - Show container numbers in special highlighted field
   - Visible to all users
   - Editable by Shipping Line Clerk

3. **DO PAID Checkbox/Button** (Finance Manager only)
   - Visible when: DO payment request exists and status is PENDING
   - Action: Mark as PAID, enable DO document upload

4. **Upload DO Document** (green)
   - Visible when: DO payment is marked as PAID
   - Action: Upload DO, notify Operations

#### D. Add Dialog Components ⚠️ TODO
```typescript
// DO Payment Request Dialog
<Dialog open={doPaymentRequestDialogOpen}>
  - Amount input
  - Currency selector
  - Invoice file upload
  - Description textarea
  - Submit button
</Dialog>

// Container Numbers Section (in Shipping Details)
<div className="container-numbers-section">
  - Large prominent display
  - Edit button for Shipping Line Clerk
  - Visible to all users
</div>
```

### Phase 3: Update OperationsPage.tsx ⚠️ TODO

#### A. Display DO Document
```typescript
// Show DO document from Shipping Line
{file.deliveryOrderDocumentUrl && (
  <div className="do-document-section">
    <Badge>DO Received</Badge>
    <Button onClick={() => downloadDO(file)}>
      Download Delivery Order
    </Button>
  </div>
)}
```

#### B. Enable Port Charges Button Logic
```typescript
// Port Charges button only available when:
// 1. Release Order uploaded
// 2. DO document received from Shipping Line
{file.releaseOrderUrl && 
 file.deliveryOrderDocumentUrl && 
 !file.portChargesUrl && (
  <Button onClick={handleUploadPortCharges}>
    Upload Port Charges
  </Button>
)}
```

---

## 🔄 WORKFLOW SUMMARY

### Complete DO Workflow

```
1. SHIPPING LINE CLERK
   → Fills container numbers (visible to all)
   → Clicks REQUEST DO PAYMENT
   → Uploads invoice
   → Enters amount, currency, description
   → Status: doPaymentRequestStatus = 'PENDING'
   → Notifications sent to Ops Manager & Finance

2. FINANCE MANAGER
   → Reviews DO payment request
   → Clicks DO PAID checkbox/button
   → Status: doPaymentRequestStatus = 'PAID'
   → Status: deliveryOrderPaymentsDoneAt = new Date()
   → Notification sent to Shipping Line Clerk

3. SHIPPING LINE CLERK
   → Sees DO payment confirmed
   → Clicks SUBMIT DO button
   → Uploads DO document
   → Status: deliveryOrderDocumentUrl = URL
   → Status: deliveryOrderSubmittedAt = new Date()
   → Notifications sent to Ops Manager & Operation Clerks

4. OPERATIONS CLERK
   → Sees DO document (can download)
   → Uploads Release Order
   → Status: releaseOrderUrl = URL
   → NOW: Port Charges button becomes available
   → (Previously: Port Charges available after Release Order only)
```

---

## 🎨 UI CHANGES SUMMARY

### Shipping Line Module
1. **Container Numbers** - Prominent display box
2. **REQUEST DO PAYMENT** - Orange/purple button
3. **DO Payment Status Badge** - Shows PENDING/PAID
4. **DO PAID Button** - Finance Manager only (blue checkbox style)
5. **SUBMIT DO** - Green button (after payment confirmed)

### Operations Module
1. **DO Document Section** - Shows received DO
2. **Download DO** - Button to download DO
3. **Port Charges Logic** - Requires both Release Order AND DO

---

## 📊 STATUS FLOW

```
File Status Flow (unchanged):
PERMITS_DONE
  ↓
[Shipping Line Clerk - REQUEST DO PAYMENT]
  ↓
Status stays same, but adds:
  doPaymentRequestStatus: 'PENDING'
  ↓
[Finance Manager - Mark DO PAID]
  ↓
deliveryOrderPaymentsDoneAt: new Date()
doPaymentRequestStatus: 'PAID'
  ↓
[Shipping Line Clerk - SUBMIT DO]
  ↓
DELIVERY_ORDER_SUBMITTED
deliveryOrderDocumentUrl: URL
  ↓
[Operations Clerk sees DO, uploads Release Order]
  ↓
RELEASE_ORDER_RECEIVED
  ↓
[NOW Port Charges button available]
  ↓
WAITING_FOR_PORT_CHARGES_PAYMENT
```

---

## 🔑 KEY FEATURES

### 1. Container Numbers Visibility
- **Where**: Shipping Line module, Operations module, File detail view
- **Who Can Edit**: Shipping Line Clerk only
- **Who Can View**: ALL users in the system
- **Display**: Prominent box with clear labeling

### 2. DO Payment Request System
- **Purpose**: Request funds for Delivery Order from shipping line
- **Similar To**: Petty Cash but specific to DO
- **Approval**: Finance Manager confirms payment
- **Tracking**: doPaymentRequestStatus field

### 3. Sequential DO Workflow
- **Step 1**: Request payment → PENDING
- **Step 2**: Finance confirms → PAID
- **Step 3**: Upload DO document → SUBMITTED
- **Step 4**: Operations sees DO → Can proceed

### 4. Operations Gate
- **Rule**: Port Charges upload requires:
  - ✅ Release Order uploaded by Operation Clerk
  - ✅ DO document received from Shipping Line
- **Before**: Only Release Order was required
- **After**: Both Release Order AND DO required

---

## 🧪 TESTING CHECKLIST

### Shipping Line Clerk Tests
- [ ] Fill container numbers
- [ ] Container numbers visible to all users
- [ ] Click REQUEST DO PAYMENT
- [ ] Upload invoice
- [ ] Enter amount and description
- [ ] Verify notification sent to Finance
- [ ] After Finance confirms, see SUBMIT DO button
- [ ] Upload DO document
- [ ] Verify DO appears in Operations module

### Finance Manager Tests
- [ ] Receive notification for DO payment request
- [ ] See DO payment request details
- [ ] Click DO PAID button
- [ ] Verify Shipping Line Clerk notified
- [ ] Verify status changed to PAID

### Operations Clerk Tests
- [ ] See DO document from Shipping Line
- [ ] Download DO document
- [ ] Upload Release Order
- [ ] Verify Port Charges button now available
- [ ] Verify Port Charges button NOT available without DO

### All Users Tests
- [ ] View container numbers in file details
- [ ] View DO document (if submitted)
- [ ] Container numbers visible in reports/dashboards

---

## 📝 IMPLEMENTATION NOTES

### Priority Changes
1. **HIGH**: Add REQUEST DO PAYMENT button and dialog
2. **HIGH**: Add DO PAID confirmation for Finance
3. **HIGH**: Update Port Charges logic in Operations
4. **MEDIUM**: Enhance container numbers display
5. **LOW**: Add download DO functionality

### Code Files to Modify
1. ✅ `app/src/types/index.ts` - Add DO payment fields
2. ⚠️ `app/src/pages/ShippingLinePage.tsx` - Add DO payment UI
3. ⚠️ `app/src/pages/OperationsPage.tsx` - Show DO, update Port Charges logic
4. ⚠️ `app/src/pages/FileDetailPage.tsx` - Show container numbers prominently

### Notifications Required
- Shipping Line Clerk → Operations Manager (DO payment requested)
- Shipping Line Clerk → Finance Manager (DO payment requested)
- Finance Manager → Shipping Line Clerk (DO payment confirmed)
- Shipping Line Clerk → Operations Manager (DO submitted)
- Shipping Line Clerk → Operation Clerks (DO submitted)

---

## ✅ CURRENT STATUS

**Date**: June 26, 2026
**Status**: Types updated, handlers added, UI changes in progress

**Completed**:
- ✅ Updated ShipmentFile interface with DO payment fields
- ✅ Added state variables for DO payment workflow
- ✅ Created handleDoPaymentRequest function
- ✅ Created handleDoPaymentConfirmation function

**TODO**:
- ⚠️ Add REQUEST DO PAYMENT button to UI
- ⚠️ Add DO Payment Request dialog component
- ⚠️ Add DO PAID button for Finance Manager
- ⚠️ Add container numbers prominent display
- ⚠️ Update OperationsPage to show DO document
- ⚠️ Update Port Charges button logic
- ⚠️ Add download DO functionality
- ⚠️ Test complete workflow

---

## 🚀 NEXT STEPS

1. Complete UI components in ShippingLinePage.tsx
2. Add DO document display in OperationsPage.tsx
3. Update Port Charges logic
4. Test end-to-end workflow
5. Create user documentation
6. Commit changes to Git

---

**Implementation By**: Kiro AI Assistant
**Date**: June 26, 2026
**Version**: 1.3.3 (pending)
**Feature**: Shipping Line DO Payment Workflow

