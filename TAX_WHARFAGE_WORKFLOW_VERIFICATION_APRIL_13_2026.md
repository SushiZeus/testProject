# Tax and Wharfage Workflow Verification - April 13, 2026

## Current Implementation Review

### Tax and Wharfage Payment Workflow (DeclarationPage.tsx)

#### 1. Document Upload
**Who**: Declarant or Declaration Manager
**When**: Status is `WAITING_FOR_FINAL_ASSESSMENT`, `WAITING_FOR_TAX_PAYMENT`, or `WAITING_FOR_WHARFAGE_PAYMENT`

**Tax Documents Upload (Lines 280-313):**
- Declarant uploads tax documents
- If SEA + wharfage already uploaded → Status: `WAITING_FOR_PAYMENTS`
- If AIR or SEA without wharfage → Status: `WAITING_FOR_TAX_PAYMENT`

**Wharfage Documents Upload (Lines 315-348) - SEA ONLY:**
- Declarant uploads wharfage documents
- If tax already uploaded → Status: `WAITING_FOR_PAYMENTS`
- If tax not uploaded → Status stays same

#### 2. Payment Confirmation
**Who**: Declarant or Declaration Manager ONLY (Lines 856-930)
**Access Control**: ✅ Correctly restricted to declarants

**TAX PAID Button (Lines 350-368):**
- Appears when: `taxDocumentUrl` exists AND `!taxPaymentConfirmed`
- Action: Sets `taxPaymentConfirmed = true`
- Status: **DOES NOT CHANGE** - stays in current status
- Message: "Tax payment confirmed - Upload wharfage documents and confirm payment"

**WHARFAGE PAID Button (Lines 369-387) - SEA ONLY:**
- Appears when: `wharfageDocumentUrl` exists AND `!wharfagePaymentConfirmed`
- Action: Sets `wharfagePaymentConfirmed = true`
- Status: **DOES NOT CHANGE** - stays in current status
- Message: "Wharfage payment confirmed - Click DECLARATION DONE when ready"

#### 3. Declaration Done
**Who**: Declarant or Declaration Manager (Lines 934-963)
**When**: Status is `WAITING_FOR_TAX_PAYMENT` or `WAITING_FOR_WHARFAGE_PAYMENT`

**Requirements (Lines 477-510):**
- ✅ Tax payment MUST be confirmed (`taxPaymentConfirmed = true`)
- ✅ For SEA: Wharfage payment MUST be confirmed (`wharfagePaymentConfirmed = true`)
- ✅ For AIR: Only tax payment required

**Button State:**
- **Enabled** (blue, clickable): When all payments confirmed
- **Disabled** (gray, not clickable): When payments not confirmed
- Tooltip shows what's missing

**Action:**
- Changes status to `READY_FOR_OPERATIONS`
- Sets `declarationDoneAt` timestamp
- Notifies Operations Manager (ID: 5)

## Workflow Summary

### AIR Shipments
1. Upload tax documents → Status: `WAITING_FOR_TAX_PAYMENT`
2. Click "TAX PAID" → `taxPaymentConfirmed = true` (status unchanged)
3. Click "DECLARATION DONE" → Status: `READY_FOR_OPERATIONS`

### SEA Shipments
1. Upload tax documents → Status: `WAITING_FOR_TAX_PAYMENT`
2. Upload wharfage documents → Status: `WAITING_FOR_PAYMENTS`
3. Click "TAX PAID" → `taxPaymentConfirmed = true` (status unchanged)
4. Click "WHARFAGE PAID" → `wharfagePaymentConfirmed = true` (status unchanged)
5. Click "DECLARATION DONE" → Status: `READY_FOR_OPERATIONS`

## Key Points

### ✅ CORRECT Implementation
1. **Only declarants can confirm payments** - No Finance/Cashier interference
2. **Payments are not requested through petty cash** - Direct external payments
3. **Status waits for DECLARATION DONE** - Prevents premature progression
4. **Button is disabled until payments confirmed** - Clear visual feedback
5. **Separate tracking for tax and wharfage** - Independent confirmation

### Payment Types Distinction
**Direct Payments (Declarant Confirms):**
- Tax payments → Paid to government/TRA
- Wharfage payments → Paid to port authority
- Not tracked in petty cash system
- Declarant confirms when payment is made externally

**Petty Cash Payments (Finance/Cashier Confirms):**
- Permit payments → Through petty cash request
- Port charges → Through petty cash request
- Swissport charges → Through petty cash request
- Tracked in petty cash system
- Finance/Cashier confirms after internal approval

## No Changes Needed

The current tax and wharfage workflow is **WORKING CORRECTLY** as per requirements:
- Declarants have full control over tax/wharfage confirmation
- No Finance/Cashier interference
- Status properly waits for DECLARATION DONE button
- Clear separation between direct payments and petty cash payments

---
**Status**: ✅ VERIFIED CORRECT
**Date**: April 13, 2026
**Conclusion**: Tax and wharfage workflow is properly implemented and requires no changes
