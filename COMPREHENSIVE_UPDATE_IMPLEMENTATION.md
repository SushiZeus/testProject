# Comprehensive System Update - Implementation Complete

## Date: March 4, 2026
## Status: IN PROGRESS

---

## COMPLETED CHANGES

### 1. Dashboard Updates for Documentation Officer ✓
- Added transport mode statistics (SEA, AIR, ROAD, RAIL counts)
- Added "Files Without Documents" count
- Removed waiting/progress/completed stats for documentation officer
- Updated imports to include Ship and AlertCircle icons

### 2. Permission Updates ✓
- Declaration manager now has 'view_petty_cash_history' permission
- Declaration manager can see petty cash requests they requested and approved
- Declaration manager does NOT have financial reports access

---

## REMAINING CHANGES TO IMPLEMENT

### 3. Declaration Workflow Updates (DeclarationPage.tsx)
**Current Status:** OLD workflow with single upload
**Required Changes:**
- Add two separate upload dialogs:
  - "Upload Tax Documents" button and dialog
  - "Upload Wharfage Documents" button and dialog
- Both documents must be uploaded before "Declaration Done" is enabled
- After both uploads → Status: WAITING_FOR_PAYMENTS
- After payment confirmed → Enable "Declaration Done" button
- Declaration Done → Status: READY_FOR_OPERATIONS (skip TAXES_PAID)
- Update state management for separate tax and wharfage uploads
- Add visual indicators showing which documents are uploaded

### 4. Operations Uploads (OperationsPage.tsx)
**Current Status:** Missing new upload buttons
**Required Changes:**
- Add "Upload Verification Photos" button (array of photos, max 4)
- Add "Upload Release Order" button (PDF/JPG)
- Add "Upload Port Charges" button (SEA only) → WAITING_FOR_PORT_CHARGES_PAYMENT
- Add "Upload Swissport Charges" button (AIR only) → WAITING_FOR_SWISSPORT_CHARGES_PAYMENT
- Add dialogs for each upload type
- Add state management for verification photos array
- Add conditional rendering based on transport mode

### 5. Permits Clerk Workflow Revision (OperationsPage.tsx)
**Current Status:** OLD workflow
**Required Changes:**
- Change workflow to: Upload Invoice → Payment → "PERMITS PAID" button → Upload Permits → PERMITS_DONE
- Add "PERMITS PAID" button that appears after payment
- Update status flow: WAITING_FOR_PERMIT_PAYMENTS → PERMIT_PAYMENTS_DONE → (after button click) → PERMITS_DONE
- Ensure permits document upload happens AFTER "PERMITS PAID" button is clicked

---

## IMPLEMENTATION NOTES

### Types Already Updated ✓
- taxDocumentUrl, wharfageDocumentUrl fields added
- taxDocumentUploadedAt, wharfageDocumentUploadedAt fields added
- portChargesUrl, swissportChargesUrl fields added
- swissportChargesPaidAt field added
- verificationPhotos array field added
- WAITING_FOR_PAYMENTS status added
- Status colors updated in statusColors utility

### File Store Methods Available ✓
- updateFileStatus() - can accept additionalData parameter
- addDocument() - for adding documents to file
- All necessary methods are in place

---

## NEXT STEPS

1. Update DeclarationPage.tsx with two separate upload workflows
2. Update OperationsPage.tsx with new upload buttons
3. Revise Permits Clerk workflow in OperationsPage.tsx
4. Test all workflows end-to-end
5. Verify status transitions are correct
6. Ensure all uploads are downloadable

---

## TESTING CHECKLIST

- [ ] Documentation officer sees transport mode stats on dashboard
- [ ] Declaration manager can view petty cash history (own + approved)
- [ ] Declaration manager cannot access financial reports
- [ ] Tax documents upload works separately
- [ ] Wharfage documents upload works separately
- [ ] Declaration Done only enabled after both uploads + payment
- [ ] Verification photos upload works (max 4)
- [ ] Release order upload works
- [ ] Port charges upload works (SEA only)
- [ ] Swissport charges upload works (AIR only)
- [ ] Permits workflow: Invoice → Payment → PERMITS PAID → Upload → PERMITS DONE
- [ ] All uploads are downloadable by authorized users
