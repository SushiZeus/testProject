# Tax & Wharfage Button Visibility Fix - March 16, 2026

## Issue Fixed
**Problem**: When tax documents were uploaded for SEA shipments, the wharfage upload button would disappear, making it impossible to upload wharfage documents.

## Root Cause
The button visibility logic had two separate sections:
1. **Assessment Phase Section** (lines 830-865): Showed upload buttons during `WAITING_FOR_FINAL_ASSESSMENT`, `WAITING_FOR_TAX_PAYMENT`, and `WAITING_FOR_PAYMENTS`
2. **Payment Phase Section** (lines 867-920): Showed payment buttons during `WAITING_FOR_TAX_PAYMENT` and `WAITING_FOR_PAYMENTS`

The wharfage upload button was only in the first section. When tax documents were uploaded, the status changed to `WAITING_FOR_TAX_PAYMENT`, but the wharfage button was missing from the payment phase section.

## Solution Implemented
Added upload buttons (both tax and wharfage) to the payment phase section, ensuring they remain available throughout the entire declaration process.

### Changes Made
- **File**: `app/src/pages/D.tsx`
t phase section)
- **Added**: Tax and wharfage upload buttons with same styling and functionality as assessment phase

### Button Availability Matrix
| Status | Tax Upload | Wharfage Upload (SEA) | Tax Paid | Wharfage Paid |
|--------|------------|----------------------|----------|---------------|
| `WAITING_FOR_FINAL_ASSESSMENT` | ✅ | ✅ | ❌ | ❌ |
| `WAITING_FOR_TAX_PAYMENT` | ✅ | ✅ | ✅ | ❌ |
| `WAITING_FOR_PAYMENTS` | ✅ | ✅ | ✅ | ✅ |

## Testing Scenarios
1. **SEA Shipment - Tax First**: Upload tax → StatuG_FOR_TAX_PAYMENT` → Wharfage button still visible ✅
2. **SEA Shipment - Wharfage First**: Upload wharfage → Status: `WAITING_FOR_FINAL_ASSESSMENT` → Tax button visible ✅
3. **SEA Shipment - Both Together**: Upload both → Status: `WAITING_FOR_PAYMENTS` → Both payment buttons visible ✅
4. **AIR Shipment**: Upload tax → Status: `WAITING_FOR_TAX_PAYMENT` → No wharfage button (correct) ✅

## Key Features Maintained
- ✅ Independent tax and wharfage uploads
- ✅ Separate delete and reupload functionality
- ✅ Status changes based on document uploads
- ✅ Transport mode-specific logic (SEA vs AIR)
- ✅ Declaration Done requires both payments for SEA, only tax for AIR

## Status: COMPLETE ✅
The wharfage upload button now remains visible throughout the entire declaration process for SEA shipments, ensuring users can upload wharfage documents at any time during the payment phases.