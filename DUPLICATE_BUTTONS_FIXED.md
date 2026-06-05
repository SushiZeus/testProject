# Duplicate Upload Buttons Fixed - March 16, 2026

## Issue Resolved ✅
Duplicate upload buttons were showing in the Actions column for files in payment phases.

## Root Cause
After adding upload buttons to the payment phase section to fix the wharfage button disappearing issue, both sections were showing buttons for `WAITING_FOR_TAX_PAYMENT` and `WAITING_FOR_PAYMENTS` statuses, causing duplicates.

## Solution
Separated the button logic into two distinct phases:

### 1. Assessment Phase (WAITING_FOR_FINAL_ASSESSMENT)
Shows:
- Arrival Status
- Upload Tax
- Upload Wharfage (SEA only)

### 2. Payment Phase (WAITING_FOR_TAX_PAYMENT or WAITING_FOR_PAYMENTS)
Shows:
- Arrival Status
- Upload Tax
- Upload Wharfage (SEA only)
- TAX PAID button (when tax uploaded)
- WHARFAGE PAID button (SEA only, when wharfage uploaded)
- Tax Paid badge (when confirmed)
- Wharfage Paid badge (when confirmed)

## Button Visibility Matrix

| Status | Arrival Status | Upload Tax | Upload Wharfage | TAX PAID | WHARFAGE PAID |
|--------|---------------|------------|-----------------|----------|---------------|
| WAITING_FOR_FINAL_ASSESSMENT | ✅ | ✅ | ✅ (SEA) | ❌ | ❌ |
| WAITING_FOR_TAX_PAYMENT | ✅ | ✅ | ✅ (SEA) | ✅ | ❌ |
| WAITING_FOR_PAYMENTS | ✅ | ✅ | ✅ (SEA) | ✅ | ✅ (SEA) |

## Changes Made
**File**: `app/src/pages/DeclarationPage.tsx`
**Line 826**: Changed condition from `(file.status === 'WAITING_FOR_FINAL_ASSESSMENT' || file.status === 'WAITING_FOR_TAX_PAYMENT' || file.status === 'WAITING_FOR_PAYMENTS')` to `file.status === 'WAITING_FOR_FINAL_ASSESSMENT'`

## Result
✅ No duplicate buttons
✅ Wharfage button never disappears for SEA shipments
✅ All buttons show at the correct phase
✅ Clean, organized button layout

## Status: COMPLETE ✅