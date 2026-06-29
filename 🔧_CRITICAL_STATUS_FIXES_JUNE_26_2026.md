# 🔧 CRITICAL STATUS AND WORKFLOW FIXES - JUNE 26, 2026

## 🚨 ISSUES IDENTIFIED FROM SCREENSHOTS

### Issue 1: Status Not Updating After Payment Confirmations
**Problem**: File shows "WAITING FOR TAX PAYMENT" even after TAX PAID button clicked
**Screenshot**: Shows "WAITING FOR TAX PAYMENT" status but "✓ Tax Paid" button visible

### Issue 2: Status Stuck on "WAITING FINAL ASSESSMENT"  
**Problem**: After tax documents uploaded, status doesn't change
**Screenshot**: Shows "WAITING FOR FINAL ASSESSMENT" when should show next stage

### Issue 3: Missing DO Review/Approval in Operations
**Problem**: Operations clerk needs to review/approve DO before Port Charges
**Required**: Button to view DO details and approve/check correctness

### Issue 4: BL Numbers Not Auto-Retrieving
**Problem**: Shipping Line clerk should see BL numbers filled by Documentation Officer
**Required**: Auto-display HBL/MBL from file opening

### Issue 5: Missing DO Charges Upload and Payment
**Problem**: Need button to upload DO charges invoice and confirm payment
**Required**: Upload DO charges + DO CHARGES PAID button with color change

### Issue 6: Declaration Done Button Issues
**Problem**: DECLARATION DONE button not responding or not moving file forward
**Required**: Must change status to DECLARATION_DONE after all payments confirmed

### Issue 7: Operations Done Logic Issues
**Problem**: OPERATIONS DONE should only work after:
  - Port charges uploaded AND paid
  - Verification form filled
**Required**: Proper validation before allowing Operations Done

---

## ✅ REQUIRED FIXES

### FIX 1: Declaration Status Flow
**File**: `app/src/pages/DeclarationPage.tsx`

**Current Problem**:
```typescript
// Blue buttons set flags but don't change status
taxPaymentConfirmed: true  // Flag set
status: 'WAITING_FOR_TAX_PAYMENT'  // Status unchanged ❌
```

**Required Fix**:
```typescript
// After TAX PAID clicked:
if (file.transportMode === 'SEA') {
  // SEA: Wait for wharfage too
  status: 'WAITING_FOR_WHARFAGE_PAYMENT'
} else {
  // AIR/ROAD/RAIL: Tax is only payment
  status: 'TAXES_PAID'  // Change status immediately
}

// After WHARFAGE PAID clicked (SEA only):
status: 'TAXES_PAID'  // Now both paid, change status

// After DECLARATION DONE clicked:
// Only allow if taxPaymentConfirmed AND (wharfagePaymentConfirmed if SEA)
status: 'DECLARATION_DONE'
```

**Implementation**:

### CRITICAL FIX 1: Tax Payment Status Update

**Current Code** (`handleTaxPaid` in DeclarationPage.tsx):
```typescript
const handleTaxPaid = () => {
  if (!selectedFile || !user) return;
  
  updateFileStatus(
    selectedFile.id,
    selectedFile.status,  // ❌ KEEPS SAME STATUS
    user.id,
    {
      taxPaymentConfirmed: true,
      taxPaymentConfirmedAt: new Date(),
    }
  );
  
  toast.success('Tax payment confirmed ✓');
}
```

**FIXED Code**:
```typescript
const handleTaxPaid = () => {
  if (!selectedFile || !user) return;
  
  // Determine new status based on transport mode
  let newStatus = selectedFile.status;
  
  if (selectedFile.transportMode === 'SEA') {
    // SEA: Move to waiting for wharfage
    newStatus = 'WAITING_FOR_WHARFAGE_PAYMENT';
  } else {
    // AIR/ROAD/RAIL: Tax is only payment, mark as paid
    newStatus = 'TAXES_PAID';
  }
  
  updateFileStatus(
    selectedFile.id,
    newStatus,  // ✅ UPDATE STATUS
    user.id,
    {
      taxPaymentConfirmed: true,
      taxPaymentConfirmedAt: new Date(),
    }
  );
  
  const message = selectedFile.transportMode === 'SEA'
    ? 'Tax payment confirmed ✓ - Now upload and confirm wharfage payment'
    : 'Tax payment confirmed ✓ - Click DECLARATION DONE to proceed';
    
  toast.success(message);
  setSelectedFile(null);
}
```

---

### CRITICAL FIX 2: Wharfage Payment Status Update

**Current Code** (`handleWharfagePaid` in DeclarationPage.tsx):
```typescript
const handleWharfagePaid = () => {
  if (!selectedFile || !user) return;
  
  updateFileStatus(
    selectedFile.id,
    selectedFile.status,  // ❌ KEEPS SAME STATUS
    user.id,
    {
      wharfagePaymentConfirmed: true,
      wharfagePaymentConfirmedAt: new Date(),
    }
  );
  
  toast.success('Wharfage payment confirmed ✓');
}
```

**FIXED Code**:
```typescript
const handleWharfagePaid = () => {
  if (!selectedFile || !user) return;
  
  updateFileStatus(
    selectedFile.id,
    'TAXES_PAID',  // ✅ UPDATE STATUS - Both tax and wharfage confirmed
    user.id,
    {
      wharfagePaymentConfirmed: true,
      wharfagePaymentConfirmedAt: new Date(),
    }
  );
  
  toast.success('Wharfage payment confirmed ✓ - Click DECLARATION DONE to proceed');
  setSelectedFile(null);
}
```

---

### CRITICAL FIX 3: Declaration Done Status Update

**Current Code** (`handleDeclarationDone` in DeclarationPage.tsx):
```typescript
const handleDeclarationDone = () => {
  if (!selectedFile || !user) return;
  
  // Validation checks...
  
  updateFileStatus(
    selectedFile.id,
    'DECLARATION_DONE',  // ✅ This is correct
    user.id,
    {
      declarationDoneAt: new Date(),
    }
  );
  
  // Send notifications...
}
```

**Status**: This one is already correct, but needs status check update

---

## 🔄 NEW REQUIREMENTS TO IMPLEMENT

### REQUIREMENT 1: Operations DO Review/Approval

**Location**: `app/src/pages/OperationsPage.tsx`

**Add New Button**:
```typescript
{/* REVIEW DO Button - Before Port Charges */}
{file.deliveryOrderDocumentUrl && !file.doReviewedByOperations && (
  <Button 
    size="sm"
    onClick={() => { setSelectedFile(file); setDoReviewDialogOpen(true); }}
    className="bg-purple-600 hover:bg-purple-700 text-white"
  >
    <FileCheck className="w-3 h-3 mr-1" />
    REVIEW DO
  </Button>
)}

{/* Badge showing DO is approved */}
{file.doReviewedByOperations && (
  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
    ✓ DO Approved
  </Badge>
)}
```

**Add Dialog**:
```typescript
<Dialog open={doReviewDialogOpen} onOpenChange={setDoReviewDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Review Delivery Order</DialogTitle>
      <DialogDescription>
        Verify DO details from Shipping Line before proceeding
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      {/* Show DO document */}
      <Button 
        variant="outline"
        onClick={() => window.open(selectedFile?.deliveryOrderDocumentUrl, '_blank')}
      >
        <FileText className="w-4 h-4 mr-2" />
        View DO Document
      </Button>
      
      {/* Show shipping details */}
      <div className="bg-gray-50 p-4 rounded">
        <p><strong>Container Numbers:</strong> {selectedFile?.containerNumbers}</p>
        <p><strong>HBL/MBL:</strong> {selectedFile?.blNumber}</p>
        <p><strong>DO Number:</strong> {selectedFile?.doNumber}</p>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setDoReviewDialogOpen(false)}>
        Cancel
      </Button>
      <Button 
        onClick={handleApproveDeliveryOrder}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        Approve DO - Enable Port Charges
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Add Handler**:
```typescript
const handleApproveDeliveryOrder = () => {
  if (!selectedFile || !user) return;
  
  updateFileStatus(
    selectedFile.id,
    selectedFile.status,
    user.id,
    {
      doReviewedByOperations: true,
      doReviewedByOperationsAt: new Date(),
      doReviewedByOperationsUser: user.id,
    }
  );
  
  toast.success('Delivery Order approved ✓ - Port Charges button now enabled');
  setDoReviewDialogOpen(false);
  setSelectedFile(null);
};
```

**Update Port Charges Logic**:
```typescript
// OLD:
disabled={!file.releaseOrderUrl || !file.deliveryOrderDocumentUrl}

// NEW:
disabled={!file.releaseOrderUrl || !file.deliveryOrderDocumentUrl || !file.doReviewedByOperations}

// Tooltip:
title={
  !file.releaseOrderUrl ? 'Upload release order first' :
  !file.deliveryOrderDocumentUrl ? 'Wait for DO from Shipping Line' :
  !file.doReviewedByOperations ? 'Review and approve DO first' :
  'Upload port charges'
}
```

---

### REQUIREMENT 2: BL Numbers Auto-Display in Shipping Line

**Location**: `app/src/pages/ShippingLinePage.tsx`

**Add Info Display**:
```typescript
{/* Auto-filled BL Information */}
{selectedFile && (selectedFile.blNumber || selectedFile.blType) && (
  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
    <p className="text-sm font-medium text-blue-700 mb-2">
      📋 Bill of Lading (from Documentation Officer):
    </p>
    <div className="text-sm text-blue-600">
      {selectedFile.blType && (
        <p><strong>Type:</strong> {selectedFile.blType}</p>
      )}
      {selectedFile.blNumber && (
        <p><strong>Number:</strong> {selectedFile.blNumber}</p>
      )}
    </div>
    <p className="text-xs text-blue-500 mt-2">
      {selectedFile.blType === 'HBL' 
        ? 'This is HBL - You can fill MBL details below if available'
        : 'MBL already filled - No need to enter again'}
    </p>
  </div>
)}
```

---

### REQUIREMENT 3: DO Charges Upload and Payment

**Location**: `app/src/pages/ShippingLinePage.tsx`

**Add New Fields to Form State**:
```typescript
const [doChargesForm, setDoChargesForm] = useState({
  invoiceFile: null as File | null,
  amount: '',
  currency: 'TZS',
});
```

**Add Upload Button**:
```typescript
{/* Upload DO Charges Invoice */}
{file.deliveryOrderSubmittedAt && !file.doChargesInvoiceUrl && (
  <Button 
    size="sm"
    variant="outline"
    onClick={() => { setSelectedFile(file); setDoChargesDialogOpen(true); }}
  >
    <Upload className="w-3 h-3 mr-1" />
    Upload DO Charges
  </Button>
)}

{/* DO Charges Payment Status */}
{file.doChargesInvoiceUrl && !file.doChargesPaid && (
  <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
    DO Charges Pending Payment
  </Badge>
)}

{/* DO CHARGES PAID Button - Finance */}
{(user?.role === 'finance_manager' || user?.role === 'cashier') &&
 file.doChargesInvoiceUrl && !file.doChargesPaid && (
  <Button 
    size="sm"
    onClick={() => handleDoChargesPaid(file)}
    className="bg-blue-600 hover:bg-blue-700 text-white"
  >
    <CheckCircle className="w-3 h-3 mr-1" />
    DO CHARGES PAID
  </Button>
)}

{/* Badge showing DO charges paid */}
{file.doChargesPaid && (
  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
    ✓ DO Charges Paid
  </Badge>
)}
```

**Add Handler**:
```typescript
const handleDoChargesPaid = (file: ShipmentFile) => {
  if (!user) return;
  
  updateFileStatus(
    file.id,
    file.status,
    user.id,
    {
      doChargesPaid: true,
      doChargesPaidAt: new Date(),
      doChargesPaidBy: user.id,
    }
  );
  
  // Notify Shipping Line Clerk
  addNotification({
    userId: file.assignedShippingLineClerkId || '0',
    title: 'DO Charges Payment Confirmed',
    message: `DO charges for file ${file.fileNumber} have been paid`,
    type: 'success',
    fileId: file.id,
    link: '/shipping-line',
  });
  
  toast.success('DO charges payment confirmed ✓');
};
```

---

### REQUIREMENT 4: Operations Done Validation

**Location**: `app/src/pages/OperationsPage.tsx`

**Update handleOperationsDone**:
```typescript
const handleOperationsDone = () => {
  if (!selectedFile || !user) return;
  
  // 1. Check release order
  if (!selectedFile.releaseOrderUrl) {
    toast.error('Release order must be uploaded before marking operations as done');
    return;
  }
  
  // 2. Check port charges payment (SEA) OR swissport payment (AIR)
  if (selectedFile.transportMode === 'SEA') {
    if (!selectedFile.portChargesUrl) {
      toast.error('Port charges must be uploaded before marking operations as done');
      return;
    }
    if (!selectedFile.portChargesPaidAt) {
      toast.error('Port charges must be PAID before marking operations as done');
      return;
    }
  }
  
  if (selectedFile.transportMode === 'AIR') {
    if (!selectedFile.swissportChargesUrl) {
      toast.error('Swissport charges must be uploaded before marking operations as done');
      return;
    }
    if (!selectedFile.swissportChargesPaidAt) {
      toast.error('Swissport charges must be PAID before marking operations as done');
      return;
    }
  }
  
  // 3. Check verification form
  if (!selectedFile.cargoVerificationCompletedAt) {
    toast.error('Cargo verification form must be completed before marking operations as done');
    return;
  }
  
  // All checks passed, proceed
  updateFileStatus(
    selectedFile.id,
    'OPERATIONS_DONE',
    user.id,
    {
      operationsDoneAt: new Date(),
    }
  );
  
  // Send notifications to delivery clerk
  addNotification({
    userId: '7', // Delivery Clerk
    title: 'Operations Complete',
    message: `File ${selectedFile.fileNumber} operations complete - Ready for delivery`,
    type: 'success',
    fileId: selectedFile.id,
    link: '/delivery',
  });
  
  toast.success('Operations marked as done - File moved to delivery');
  setSelectedFile(null);
};
```

---

## 📋 TYPES TO ADD

**File**: `app/src/types/index.ts`

Add these new fields to `ShipmentFile` interface:
```typescript
// DO Review by Operations
doReviewedByOperations?: boolean;
doReviewedByOperationsAt?: Date;
doReviewedByOperationsUser?: string;

// DO Charges
doChargesInvoiceUrl?: string;
doChargesAmount?: number;
doChargesCurrency?: string;
doChargesPaid?: boolean;
doChargesPaidAt?: Date;
doChargesPaidBy?: string;
```

---

## 🎯 PRIORITY ORDER FOR IMPLEMENTATION

1. **HIGHEST PRIORITY**: Fix Declaration status updates (Tax/Wharfage Paid)
2. **HIGH**: Add DO review/approval in Operations
3. **HIGH**: Fix Operations Done validation
4. **MEDIUM**: Add DO charges upload and payment
5. **MEDIUM**: Add BL auto-display in Shipping Line
6. **LOW**: UI polish and additional feedback

---

## 📝 FILES TO MODIFY

1. ✅ `app/src/types/index.ts` - Add new fields
2. ✅ `app/src/pages/DeclarationPage.tsx` - Fix status updates
3. ✅ `app/src/pages/OperationsPage.tsx` - Add DO review, fix validation
4. ✅ `app/src/pages/ShippingLinePage.tsx` - Add DO charges, BL display

---

END OF DOCUMENT
