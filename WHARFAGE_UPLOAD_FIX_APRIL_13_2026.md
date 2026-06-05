# Wharfage Upload Fix - April 13, 2026

## Issue
When wharfage documents were uploaded, the file dialog closed immediately and the file "disappeared" from view, preventing the declarant from seeing and clicking the "WHARFAGE PAID" button.

## Root Causes

### 1. Selected File Cleared
**Problem**: `setSelectedFile(null)` was called after upload, clearing the selected file
**Impact**: File row collapsed/disappeared, payment buttons not visible

### 2. Wrong Status Used
**Problem**: Code used `WAITING_FOR_PAYMENTS` status which doesn't exist in types
**Correct Status**: `WAITING_FOR_WHARFAGE_PAYMENT`
**Impact**: Status transitions were incorrect

## Changes Made

### 1. Tax Document Upload Handler (Lines 280-307)
**File**: `app/src/pages/DeclarationPage.tsx`

**Before**:
```typescript
setSelectedFile(null); // Cleared selected file
newStatus = 'WAITING_FOR_PAYMENTS'; // Wrong status
```

**After**:
```typescript
// Don't clear selectedFile - keep it selected so user can see payment buttons
newStatus = 'WAITING_FOR_TAX_PAYMENT'; // Correct status
```

**Improvements**:
- File stays selected after upload
- User can immediately see "TAX PAID" button
- Correct status used
- Better toast message with action guidance

---

### 2. Wharfage Document Upload Handler (Lines 315-348)
**File**: `app/src/pages/DeclarationPage.tsx`

**Before**:
```typescript
setSelectedFile(null); // Cleared selected file
newStatus = 'WAITING_FOR_PAYMENTS'; // Wrong status
```

**After**:
```typescript
// Don't clear selectedFile - keep it selected so user can see payment buttons
newStatus = 'WAITING_FOR_WHARFAGE_PAYMENT'; // Correct status
```

**Improvements**:
- File stays selected after upload
- User can immediately see "WHARFAGE PAID" button
- Correct status used
- Better toast message with action guidance

---

## Workflow Now

### AIR Shipments
1. Upload tax documents → Status: `WAITING_FOR_TAX_PAYMENT`
2. **File stays visible** with "TAX PAID" button
3. Click "TAX PAID" → Payment confirmed
4. Click "DECLARATION DONE" → Status: `READY_FOR_OPERATIONS`

### SEA Shipments (Tax First)
1. Upload tax documents → Status: `WAITING_FOR_TAX_PAYMENT`
2. **File stays visible** with "TAX PAID" button
3. Upload wharfage documents → Status: `WAITING_FOR_WHARFAGE_PAYMENT`
4. **File stays visible** with both "TAX PAID" and "WHARFAGE PAID" buttons
5. Click "TAX PAID" → Tax payment confirmed
6. Click "WHARFAGE PAID" → Wharfage payment confirmed
7. Click "DECLARATION DONE" → Status: `READY_FOR_OPERATIONS`

### SEA Shipments (Wharfage First)
1. Upload wharfage documents → Status stays `WAITING_FOR_FINAL_ASSESSMENT`
2. **File stays visible**
3. Upload tax documents → Status: `WAITING_FOR_TAX_PAYMENT`
4. **File stays visible** with both "TAX PAID" and "WHARFAGE PAID" buttons
5. Click "TAX PAID" → Tax payment confirmed
6. Click "WHARFAGE PAID" → Wharfage payment confirmed
7. Click "DECLARATION DONE" → Status: `READY_FOR_OPERATIONS`

---

## Status Corrections

### Removed (Non-existent)
- ❌ `WAITING_FOR_PAYMENTS` (doesn't exist in types)

### Using (Correct)
- ✅ `WAITING_FOR_TAX_PAYMENT` (after tax upload)
- ✅ `WAITING_FOR_WHARFAGE_PAYMENT` (after wharfage upload when tax exists)

---

## User Experience Improvements

### Before
1. Upload wharfage → Dialog closes → File disappears
2. User confused: "Where did my file go?"
3. User has to search for file again
4. Payment buttons not visible

### After
1. Upload wharfage → Dialog closes → **File stays visible**
2. Payment buttons immediately visible
3. Clear toast message: "Click WHARFAGE PAID to confirm payment"
4. Smooth workflow without interruption

---

## Testing Instructions

### Test 1: SEA Shipment - Tax Then Wharfage
1. Login as declarant
2. Select a SEA file in `WAITING_FOR_FINAL_ASSESSMENT`
3. Upload tax documents
4. ✅ Verify file stays visible
5. ✅ Verify "TAX PAID" button appears
6. Upload wharfage documents
7. ✅ Verify file stays visible
8. ✅ Verify both "TAX PAID" and "WHARFAGE PAID" buttons appear
9. ✅ Verify status: `WAITING_FOR_WHARFAGE_PAYMENT`

### Test 2: SEA Shipment - Wharfage Then Tax
1. Login as declarant
2. Select a SEA file in `WAITING_FOR_FINAL_ASSESSMENT`
3. Upload wharfage documents
4. ✅ Verify file stays visible
5. ✅ Verify status stays `WAITING_FOR_FINAL_ASSESSMENT`
6. Upload tax documents
7. ✅ Verify file stays visible
8. ✅ Verify both "TAX PAID" and "WHARFAGE PAID" buttons appear
9. ✅ Verify status: `WAITING_FOR_TAX_PAYMENT`

### Test 3: AIR Shipment
1. Login as declarant
2. Select an AIR file in `WAITING_FOR_FINAL_ASSESSMENT`
3. Upload tax documents
4. ✅ Verify file stays visible
5. ✅ Verify "TAX PAID" button appears
6. ✅ Verify status: `WAITING_FOR_TAX_PAYMENT`

---

## Files Modified
- `app/src/pages/DeclarationPage.tsx`

---

**Status**: ✅ FIXED
**Date**: April 13, 2026
**Issue**: File disappeared after wharfage upload
**Solution**: Keep file selected after upload, use correct status
