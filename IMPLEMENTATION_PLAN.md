# Implementation Plan - Additional Features

## Status: In Progress

This document outlines the implementation of the requested features.

## Features to Implement

### 1. ✅ Documentation Officer Can Open Files Without Documents
**Status**: COMPLETED
- Modified `FileOpeningPage.tsx` to make documents optional
- Removed validation that required at least one document
- Documents can be uploaded later to the file

### 2. ⏳ Document/Photo Downloads in Petty Cash
**Status**: IN PROGRESS
- Need to add download functionality for attachments in petty cash requests
- All users with access should be able to download attachments
- Files: `PettyCashPage.tsx`, `PettyCashTable.tsx`

### 3. ⏳ Permits Clerk Workflow
**Status**: IN PROGRESS
- Add "PERMITS DONE" button visible to all but only activatable by permits clerk
- Show "WAITING FOR PERMITS" status when permits are not done
- Button should be faint/disabled for non-permits clerk users
- Add to file timeline
- Files: `OperationsPage.tsx`, `FileDetailPage.tsx`

### 4. ⏳ Shipping Line Clerk Workflow
**Status**: IN PROGRESS
- Add "DELIVERY ORDER SUBMITTED" button
- Shipping line clerk uploads delivery order invoice
- System shows "WAITING FOR PAYMENTS FOR DELIVERY ORDER"
- After payment, clerk uploads delivery order document
- Then clerk activates "DELIVERY ORDER SUBMITTED" button
- Files: `OperationsPage.tsx`, `FileDetailPage.tsx`

### 5. ⏳ All Uploads/Attachments Downloadable
**Status**: IN PROGRESS
- Ensure all document uploads have download functionality
- Add download buttons/links for:
  - File documents
  - Petty cash attachments
  - Permit documents
  - Delivery order documents
  - Invoice documents
- Files: Multiple pages

### 6. ⏳ Shipping Line Clerk Fills ETA/ETB
**Status**: IN PROGRESS
- Create separate dialog/form for shipping line clerk
- Shipping line clerk fills ETA and ETB for each shipment
- Separate from declarant's arrival status form
- Files: `OperationsPage.tsx`, new component

### 7. ✅ Declarant Fills Carry-In, Manifest, Wharfage
**Status**: COMPLETED
- Updated `DeclarationPage.tsx` arrival status dialog
- Removed ETA/ETB fields from declarant form
- Declarant only fills: Carry In Date, Manifest Comparison Date, Wharfage Date
- Shows ETA/ETB as read-only if already filled by shipping line clerk

## Technical Changes Made

### Type Updates
- Added new file statuses:
  - `WAITING_FOR_PERMITS`
  - `PERMITS_DONE`
  - `WAITING_FOR_DELIVERY_ORDER_SUBMISSION`
  - `DELIVERY_ORDER_SUBMITTED`

- Added new fields to `ShipmentFile`:
  - `assignedPermitsClerk?: User`
  - `permitsDoneAt?: Date`
  - `assignedShippingLineClerk?: User`
  - `deliveryOrderSubmittedAt?: Date`

### New Utilities
- Created `app/src/utils/statusColors.ts` for shared status color definitions
- Prevents duplication across multiple files

## Next Steps

1. Update all pages to import statusColors from utility
2. Implement permits clerk workflow in OperationsPage
3. Implement shipping line clerk workflow in OperationsPage
4. Add download functionality for all attachments
5. Create ETA/ETB form for shipping line clerk
6. Test all workflows end-to-end
7. Update documentation

## Files Modified So Far

1. `app/src/types/index.ts` - Added new statuses and fields
2. `app/src/pages/FileOpeningPage.tsx` - Made documents optional
3. `app/src/pages/DeclarationPage.tsx` - Updated arrival status for declarant only
4. `app/src/utils/statusColors.ts` - Created shared status colors

## Files To Modify

1. `app/src/pages/DashboardPage.tsx` - Import statusColors
2. `app/src/pages/DeclarationPage.tsx` - Import statusColors
3. `app/src/pages/OperationsPage.tsx` - Import statusColors, add permits/shipping workflows
4. `app/src/pages/FileDetailPage.tsx` - Import statusColors, add download buttons
5. `app/src/pages/PettyCashPage.tsx` - Add download functionality
6. `app/src/components/PettyCashTable.tsx` - Add download buttons

## Testing Checklist

- [ ] Documentation officer can create file without documents
- [ ] Documentation officer can upload documents to existing file
- [ ] Petty cash attachments can be downloaded by all users
- [ ] Permits clerk can activate "PERMITS DONE" button
- [ ] Other users see "WAITING FOR PERMITS" (faint button)
- [ ] Shipping line clerk can fill ETA/ETB
- [ ] Shipping line clerk can upload delivery order invoice
- [ ] Shipping line clerk can upload delivery order document
- [ ] Shipping line clerk can activate "DELIVERY ORDER SUBMITTED"
- [ ] Declarant can only fill carry-in, manifest, wharfage dates
- [ ] All document uploads are downloadable
- [ ] Timeline shows all status changes correctly

## Notes

- Need to ensure proper role-based access control for all new features
- All status changes should be logged in activity timeline
- Notifications should be sent to relevant users for status changes
- Download functionality should work for all file types (PDF, images, etc.)
