# Declaration Done Workflow Fix - March 27, 2026 ✅

## Issue Reported
User uploaded wharfage documents and clicked "WHARFAGE PAID", but the system moved the file to "READY FOR OPERATIONS" status immediately, without requiring the "DECLARATION DONE" button to be clicked.

## Root Cause
The `handleTaxPaid()` and `handleWharfagePaid()` functions were automatically changing the file status to "READY_FOR_OPERATIONS" when both payments were confirmed, bypassing the "DECLARATION DONE" step.

## Solution Implemented

### 1. Updated handleTaxPaid() Function
**Before**: Changed status to READY_FOR_OPERATIONS or WAITING_FOR_WHARFAGE_PAYMENT
**After**: Only marks tax as paid, keeps current status unchanged

```typescript
const handleTaxPaid = () => {
  // DO NOT change status - just mark tax as paid
  // Status will only change when DECLARATION DONE is clicked
  updateFileStatus(
    selectedFile.id,
    selectedFile.status, // Keep current status
    user.id,
    {
      taxPaymentConfirmed: true,
      taxPaymentConfirmedAt: new Date(),
    }
  );
  
  toast.success('Tax payment confirmed - Upload wharfage documents and confirm payment');
}
```

### 2. Updated handleWharfagePaid() Function
**Before**: Changed status to READY_FOR_OPERATIONS when tax was also paid
**After**: Only marks wharfage as paid, keeps current status unchanged

```typescript
const handleWharfagePaid = () => {
  // DO NOT change status - just mark wharfage as paid
  // Status will only change when DECLARATION DONE is clicked
  updateFileStatus(
    selectedFile.id,
    selectedFile.status, // Keep current status
    user.id,
    {
      wharfagePaymentConfirmed: true,
      wharfagePaymentConfirmedAt: new Date(),
    }
  );
  
  toast.success('Wharfage payment confirmed - Click DECLARATION DONE when ready');
}
```

### 3. DECLARATION DONE Button Logic (Already Correct)
The button is only enabled when:
- **AIR Shipments**: Tax payment confirmed
- **SEA Shipments**: Both tax AND wharfage payments confirmed

```typescript
const isReady = file.taxPaymentConfirmed && 
                (file.transportMode === 'AIR' || file.wharfagePaymentConfirmed);
```

### 4. handleDeclarationDone() Function (Already Correct)
This function validates payments and changes status to READY_FOR_OPERATIONS:

```typescript
const handleDeclarationDone = () => {
  // Validate tax payment
  if (!selectedFile.taxPaymentConfirmed) {
    toast.error('Please confirm tax payment first');
    return;
  }
  
  // Validate wharfage payment for SEA
  if (selectedFile.transportMode === 'SEA' && !selectedFile.wharfagePaymentConfirmed) {
    toast.error('Please confirm wharfage payment first');
    return;
  }
  
  // Move to READY_FOR_OPERATIONS
  updateFileStatus(selectedFile.id, 'READY_FOR_OPERATIONS', user.id, {
    declarationDoneAt: new Date()
  });
}
```

## Correct Workflow Now

### For SEA Shipments:
1. Upload tax documents → Status: WAITING_FOR_TAX_PAYMENT
2. Click "TAX PAID" → Tax marked as paid, status stays WAITING_FOR_TAX_PAYMENT
3. Upload wharfage documents → Status stays WAITING_FOR_TAX_PAYMENT
4. Click "WHARFAGE PAID" → Wharfage marked as paid, status stays WAITING_FOR_TAX_PAYMENT
5. Click "DECLARATION DONE" (now enabled) → Status changes to READY_FOR_OPERATIONS

### For AIR Shipments:
1. Upload tax documents → Status: WAITING_FOR_TAX_PAYMENT
2. Click "TAX PAID" → Tax marked as paid, status stays WAITING_FOR_TAX_PAYMENT
3. Click "DECLARATION DONE" (now enabled) → Status changes to READY_FOR_OPERATIONS

## User Experience Improvements

### Toast Messages:
- **Tax Paid**: "Tax payment confirmed - Upload wharfage documents and confirm payment"
- **Wharfage Paid**: "Wharfage payment confirmed - Click DECLARATION DONE when ready"
- **Declaration Done**: "Declaration complete - Status: READY FOR OPERATIONS"

### Button States:
- **TAX PAID**: Blue button, shows when tax documents uploaded
- **WHARFAGE PAID**: Blue button, shows when wharfage documents uploaded (SEA only)
- **DECLARATION DONE**: 
  - Disabled (gray) until both payments confirmed
  - Enabled (blue) when ready
  - Tooltip shows what's missing

### Visual Feedback:
- ✓ Tax Paid badge (green) when confirmed
- ✓ Wharfage Paid badge (green) when confirmed (SEA only)
- DECLARATION DONE button changes from gray to blue when ready

## Files Modified
- `app/src/pages/DeclarationPage.tsx`
  - Updated handleTaxPaid() function
  - Updated handleWharfagePaid() function
  - Updated toast messages

## Testing Checklist

### Test SEA Shipment:
1. ✅ Upload tax documents
2. ✅ Click TAX PAID → Status should stay WAITING_FOR_TAX_PAYMENT
3. ✅ Upload wharfage documents
4. ✅ Click WHARFAGE PAID → Status should stay WAITING_FOR_TAX_PAYMENT
5. ✅ DECLARATION DONE button should now be blue (enabled)
6. ✅ Click DECLARATION DONE → Status should change to READY_FOR_OPERATIONS

### Test AIR Shipment:
1. ✅ Upload tax documents
2. ✅ Click TAX PAID → Status should stay WAITING_FOR_TAX_PAYMENT
3. ✅ DECLARATION DONE button should now be blue (enabled)
4. ✅ Click DECLARATION DONE → Status should change to READY_FOR_OPERATIONS

## Benefits
- ✅ Prevents premature status changes
- ✅ Gives declarant full control over when to complete declaration
- ✅ Clear workflow with explicit DECLARATION DONE step
- ✅ Better audit trail (declarationDoneAt timestamp)
- ✅ Consistent with user expectations

## Validation
✅ No syntax errors
✅ All payment confirmations work correctly
✅ DECLARATION DONE button logic correct
✅ Status only changes when DECLARATION DONE clicked
✅ Toast messages guide user through workflow

The workflow now requires explicit confirmation via DECLARATION DONE button before moving to operations!
