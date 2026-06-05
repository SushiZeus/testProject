# 🔧 Payment Workflow Fix Required - April 11, 2026

## Issue Identified

Files in "WAITING FOR PAYMENTS" status are being confirmed by **Declarants** themselves, but should require **Finance Manager/Cashier** approval before progressing.

## Current (Incorrect) Workflow

1. Declarant uploads tax document → Status: `WAITING_FOR_TAX_PAYMENT`
2. **Declarant clicks "Confirm Tax Payment"** → Tax marked as paid
3. Declarant uploads wharfage document (SEA) → Status: `WAITING_FOR_WHARFAGE_PAYMENT`
4. **Declarant clicks "Confirm Wharfage Payment"** → Wharfage marked as paid
5. Declarant clicks "Declaration Done" → Moves to operations

**Problem:** Declarants are confirming their own payments without Finance approval.

## Required (Correct) Workflow

1. Declarant uploads tax document → Status: `WAITING_FOR_TAX_PAYMENT`
2. **Finance Manager/Cashier reviews and clicks "Mark Tax as Paid"** → Tax marked as paid
3. Declarant uploads wharfage document (SEA) → Status: `WAITING_FOR_WHARFAGE_PAYMENT`
4. **Finance Manager/Cashier reviews and clicks "Mark Wharfage as Paid"** → Wharfage marked as paid
5. Declarant clicks "Declaration Done" (only enabled after Finance confirms payments) → Moves to operations

## Files to Modify

### 1. DeclarationPage.tsx
- **Remove** `handleConfirmTaxPayment` and `handleConfirmWharfagePayment` functions
- **Remove** "Confirm Tax Payment" and "Confirm Wharfage Payment" buttons from declarant view
- **Add** read-only payment status indicators for declarants
- Declarants should only see: "Waiting for Finance to confirm payment"

### 2. Create FinancePaymentsPage.tsx (NEW)
- New page for Finance Manager/Cashier
- Shows all files with status:
  - `WAITING_FOR_TAX_PAYMENT`
  - `WAITING_FOR_WHARFAGE_PAYMENT`
  - `WAITING_FOR_PERMIT_PAYMENTS`
  - `WAITING_FOR_DO_PAYMENT`
  - `WAITING_FOR_PORT_CHARGES_PAYMENT`
  - `WAITING_FOR_SWISSPORT_CHARGES_PAYMENT`
- Buttons:
  - "Mark Tax as Paid" → Sets `taxPaymentConfirmed = true`
  - "Mark Wharfage as Paid" → Sets `wharfagePaymentConfirmed = true`
  - Similar for other payment types

### 3. Update Navigation
- Add "Payments" or "Finance Payments" to sidebar for Finance Manager/Cashier roles
- Route to the new FinancePaymentsPage

### 4. Update Permissions
- Only `finance_manager` and `cashier` can confirm payments
- Declarants can only upload documents and mark declaration done (after payments confirmed)

## Payment Types to Handle

1. **Tax Payment** (`WAITING_FOR_TAX_PAYMENT`)
2. **Wharfage Payment** (`WAITING_FOR_WHARFAGE_PAYMENT`) - SEA only
3. **Permit Payments** (`WAITING_FOR_PERMIT_PAYMENTS`)
4. **Delivery Order Payment** (`WAITING_FOR_DO_PAYMENT`) - SEA only
5. **Port Charges Payment** (`WAITING_FOR_PORT_CHARGES_PAYMENT`) - SEA only
6. **Swissport Charges Payment** (`WAITING_FOR_SWISSPORT_CHARGES_PAYMENT`) - AIR only

## Implementation Priority

**HIGH PRIORITY** - This is a critical business logic flaw where declarants can self-approve payments.

---

**Status:** Identified, awaiting implementation
**Date:** April 11, 2026
**Reported By:** User
