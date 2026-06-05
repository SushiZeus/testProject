# Tax/Wharfage Independence - Final Fix

## Issue Resolved
TAX PAID button now works independently of Wharfage documents.

## What Changed

### Before (Incorrect Behavior):
- Uploading tax documents kept status as `WAITING_FOR_FINAL_ASSESSMENT`
- TAX PAID button only appeared after BOTH tax and wharfage uploaded
- Declarant had to upload wharfage before marking tax as paid

### After (Correct Behavior):
- Uploading tax documents changes status to `WAITING_FOR_PAYMENTS`
- TAX PAID button appears immediately after tax documents uploaded
- Declarant can mark TAX PAID without uploading wharfage
- Wharfage upload is completely independent

## Implementation Details

### handleUploadTaxDocuments()
```typescript
// Changes status to WAITING_FOR_PAYMENTS when tax documents uploaded
updateFileStatus(
  selectedFile.id,
  'WAITING_FOR_PAYMENTS', // ← Changed from keeping current status
  user.id,
  {
    taxDocumentUrl: URL.createObjectURL(taxDocumentFiles[0]),
    taxDocumentUploadedAt: new Date(),
  }
);
```

### handleUploadWharfageDocuments()
```typescript
// Keeps current status - independent of tax
updateFileStatus(
  selectedFile.id,
  selectedFile.status, // ← Keeps WAITING_FOR_PAYMENTS
  user.id,
  {
    wharfageDocumentUrl: URL.createObjectURL(wharfageDocumentFiles[0]),
    wharfageDocumentUploadedAt: new Date(),
  }
);
```

## Workflow Now

### For AIR/ROAD/RAIL Shipments:
1. Declarant uploads tax documents → Status: WAITING_FOR_PAYMENTS
2. TAX PAID button appears
3. Declarant clicks TAX PAID
4. Declaration Done button becomes available (no wharfage needed)

### For SEA Shipments:
1. Declarant uploads tax documents → Status: WAITING_FOR_PAYMENTS
2. TAX PAID button appears
3. Declarant clicks TAX PAID (can do this before wharfage)
4. Declarant uploads wharfage documents (independent action)
5. WHARFAGE PAID button appears
6. Declarant clicks WHARFAGE PAID
7. Declaration Done button becomes available (both required)

## Key Points

✅ Tax and Wharfage are completely independent
✅ TAX PAID works without wharfage documents
✅ Status changes to WAITING_FOR_PAYMENTS on tax upload
✅ Wharfage upload doesn't change status
✅ Declaration Done requires both only for SEA shipments

## Testing

1. Create a file and assign to declarant
2. Declarant acknowledges file
3. Upload tax documents
4. Verify status changes to WAITING_FOR_PAYMENTS
5. Verify TAX PAID button appears
6. Click TAX PAID (without uploading wharfage)
7. Verify tax payment is confirmed
8. For SEA: Upload wharfage separately
9. For AIR/ROAD/RAIL: Declaration Done should be available after tax paid

## Files Modified
- `app/src/pages/DeclarationPage.tsx`
  - `handleUploadTaxDocuments()` - Now changes status to WAITING_FOR_PAYMENTS
  - `handleUploadWharfageDocuments()` - Keeps current status (independent)
