# Declaration Done Button Fixed - March 16, 2026

## Issue Resolved ✅
Declaration Done button was showing as disabled (grayed out) even when both Tax Paid and Wharfage Paid badges were visible.

## Root Cause
The button's className logic was using a ternary operator that completely replaced the styling:
- When disabled: Applied only `opacity-50 cursor-not-allowed` (no green background)
- When enabled: Applied `bg-green-600 hover:bg-green-700 text-white`

This caused the button to appear gray/disabled even when it should be enabled and green.

## Solution
Changed the className logic to use `cn()` utility with conditional classes:
- Base styling always applied: `bg-green-600 hover:bg-green-700 text-white`
- Disabled state adds: `opacity-50 cursor-not-allowed hover:bg-green-600`

This ensures the button always has the green background, and the disabled state just adds opacity.

## Button Enable Conditions

### For AIR Shipments:
- ✅ Arrival status filled (manifest comparison date)
- ✅ Tax payment confirmed

### For SEA Shipments:
- ✅ Arrival status filled (wharfage date)
- ✅ Tax payment confirmed
- ✅ Wharfage payment confirmed

## Code Changes
**File**: `app/src/pages/DeclarationPage.tsx`
**Line**: ~960

### Before:
```typescript
className={
  (!file.arrivalStatusFilled || !file.taxPaymentConfirmed || (file.transportMode === 'SEA' && !file.wharfagePaymentConfirmed)) 
  ? 'opacity-50 cursor-not-allowed' 
  : 'bg-green-600 hover:bg-green-700 text-white'
}
```

### After:
```typescript
className={cn(
  'bg-green-600 hover:bg-green-700 text-white',
  (!file.arrivalStatusFilled || !file.taxPaymentConfirmed || (file.transportMode === 'SEA' && !file.wharfagePaymentConfirmed)) && 
  'opacity-50 cursor-not-allowed hover:bg-green-600'
)}
```

## Result
✅ Declaration Done button shows green when all conditions are met
✅ Button is clickable when both tax and wharfage are paid (SEA)
✅ Button is clickable when tax is paid (AIR)
✅ Proper visual feedback for enabled/disabled states

## Status: COMPLETE ✅