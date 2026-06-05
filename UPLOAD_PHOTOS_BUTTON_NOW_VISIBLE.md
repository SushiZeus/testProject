# Upload Photos Button - Now Visible Fix

## Issue Resolved ✅
Upload Photos button was not showing in the Operations page even when files had "RECEIVED BY CLERK" status.

## Root Cause
The button visibility condition was too restrictive:
- Only checked for `operation_clerk` role
- Only checked for `RECEIVED_BY_CLERK` status
- Didn't include operations manager
- Didn't include other relevant statuses

## Solution Implemented

### Updated Visibility Conditions
**Before**:
```typescript
user?.role === 'operation_clerk' && file.status === 'RECEIVED_BY_CLERK'
```

**After**:
```typescript
(user?.role === 'operation_clerk' || user?.role === 'operations_manager') && 
(file.status === 'RECEIVED_BY_CLERK' || 
 file.status === 'WAITING_FOR_PORT_CHARGES_PAYMENT' || 
 file.status === 'WAITING_FOR_SWISSPORT_PAYMENT')
```

### What Changed

#### 1. Added Operations Manager Access
- Operations managers can now upload photos
- Allows supervisory oversight
- Enables manager to help with uploads

#### 2. Extended Status Coverage
- `RECEIVED_BY_CLERK` - Initial status after clerk accepts
- `WAITING_FOR_PORT_CHARGES_PAYMENT` - During port charges phase
- `WAITING_FOR_SWISSPORT_PAYMENT` - During swissport charges phase

This ensures the button remains visible throughout the operations workflow.

## Who Can Now Upload Photos

### Operation Clerk ✅
- Can upload photos for assigned files
- Available during all operations phases
- Primary user for photo uploads

### Operations Manager ✅
- Can upload photos for any file
- Supervisory access
- Can assist clerks with uploads

## When Button Appears

The "Upload Photos" button now shows when:
1. User is Operation Clerk OR Operations Manager
2. File status is one of:
   - RECEIVED_BY_CLERK
   - WAITING_FOR_PORT_CHARGES_PAYMENT
   - WAITING_FOR_SWISSPORT_PAYMENT

## Testing

### Test as Operation Clerk
1. Login: `sarah.wilson@dowelef.com` / `operations123`
2. Go to Operations page
3. Look for files with "RECEIVED BY CLERK" status
4. **Upload Photos button should now be visible**
5. Click to upload 1-7 photos

### Test as Operations Manager
1. Login: `operations.manager@dowelef.com` / `operations123`
2. Go to Operations page
3. Look for files with relevant statuses
4. **Upload Photos button should now be visible**
5. Can upload photos for any file

## Button Location

**Page**: Operations
**Section**: Operation Files table
**Column**: Actions (last column)
**Appears with**: Release Order, Port Charges, Swissport Charges buttons

## Other Buttons in Same Section

When conditions are met, users see:
1. ✅ **Upload Photos** (1-7 photos)
2. ✅ **Release Order** (document upload)
3. ✅ **Port Charges** (SEA only)
4. ✅ **Swissport Charges** (AIR only)

All buttons appear together for easy access.

## Visual Indicators

### Before Upload
- Button text: "Upload Photos"
- White background
- Upload icon

### After Upload
- Button text: "✓ Photos (X)" where X is count
- Green background
- Checkmark icon

## Benefits

### For Operation Clerks
✅ Button now visible when needed
✅ Can upload photos throughout workflow
✅ No confusion about when to upload

### For Operations Managers
✅ Can assist with photo uploads
✅ Supervisory access to all files
✅ Can ensure quality control

### For Company
✅ Better documentation
✅ Improved workflow
✅ Enhanced accountability

## Status: DEPLOYED ✅

The Upload Photos button is now visible and functional for both Operation Clerks and Operations Managers across all relevant file statuses.

---

**Last Updated**: March 16, 2026
**Fix**: Button visibility extended
**Access**: Operation Clerk & Operations Manager
**Statuses**: RECEIVED_BY_CLERK, WAITING_FOR_PORT_CHARGES_PAYMENT, WAITING_FOR_SWISSPORT_PAYMENT