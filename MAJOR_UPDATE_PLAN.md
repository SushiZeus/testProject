# Major System Update - Implementation Plan
## Date: March 4, 2026

---

## 📋 REQUIREMENTS SUMMARY

### 1. Documentation Officer Dashboard
- ✅ Show transport mode statistics (SEA, AIR, ROAD, RAIL)
- ✅ Show number of files opened for each mode
- ❌ Remove: Waiting, In Progress, Completed stats
- ✅ Show files without attachments/documents

### 2. Declaration Manager Access
- ❌ Remove financial reports access
- ✅ Keep petty cash requests (own + approved) in history

### 3. Declaration Workflow Changes
- ✅ Two separate upload buttons:
  1. Tax Documents
  2. Wharfage Documents
- ✅ Both must be uploaded before "Declaration Done" enabled
- ✅ After uploads → Status: WAITING FOR PAYMENTS
- ✅ After payment → "Declaration Done" button active
- ✅ Declaration Done → Status: READY_FOR_OPERATIONS (not TAXES_PAID)

### 4. Operations Clerk Uploads
- ✅ Upload Verification Photos (per file)
- ✅ Upload Release Order (PDF/JPG)
- ✅ Upload Port Charges (SEA - PDF/JPG) → WAITING_FOR_PORT_CHARGES_PAYMENT
- ✅ Upload Swissport Charges (AIR - PDF/JPG) → WAITING_FOR_SWISSPORT_CHARGES_PAYMENT

### 5. Permits Clerk Workflow (REVISED)
- ✅ Upload Permits Invoice → WAITING_FOR_PERMIT_PAYMENTS
- ✅ After payment → "PERMITS PAID" button
- ✅ Upload Permits Document → Shows PERMITS_DONE status

### 6. Shipping Line Clerk Role
- ✅ Full manipulation access (already done)
- ✅ All functionalities as instructed

---

## 🔧 IMPLEMENTATION STEPS

### Phase 1: Dashboard Updates
- [ ] Update DashboardPage for documentation officer
- [ ] Add transport mode statistics
- [ ] Add files without documents count
- [ ] Remove waiting/progress/completed stats

### Phase 2: Declaration Manager
- [ ] Update permissions to remove financial reports
- [ ] Ensure petty cash history access

### Phase 3: Declaration Workflow
- [ ] Add taxDocumentUrl field to ShipmentFile type
- [ ] Add wharfageDocumentUrl field to ShipmentFile type
- [ ] Update DeclarationPage with two upload buttons
- [ ] Add validation for both documents
- [ ] Update status flow: WAITING_FOR_PAYMENTS → READY_FOR_OPERATIONS

### Phase 4: Operations Clerk Features
- [ ] Add verificationPhotos field (array)
- [ ] Add releaseOrderUrl field
- [ ] Add portChargesUrl field
- [ ] Add swissportChargesUrl field
- [ ] Create upload dialogs for each
- [ ] Add buttons in OperationsPage

### Phase 5: Permits Clerk Revision
- [ ] Update workflow to match new requirements
- [ ] Add "PERMITS PAID" button
- [ ] Adjust status transitions

### Phase 6: Testing
- [ ] Test all new uploads
- [ ] Test status transitions
- [ ] Test role permissions
- [ ] Test dashboard statistics

---

## 📊 NEW FIELDS NEEDED

### ShipmentFile Type Updates
```typescript
{
  // Declaration
  taxDocumentUrl?: string;
  wharfageDocumentUrl?: string;
  taxDocumentUploadedAt?: Date;
  wharfageDocumentUploadedAt?: Date;
  
  // Operations
  verificationPhotos?: string[]; // Array of photo URLs
  releaseOrderUrl?: string;
  portChargesUrl?: string; // SEA
  swissportChargesUrl?: string; // AIR
  portChargesPaidAt?: Date;
  swissportChargesPaidAt?: Date;
}
```

---

## 🎯 STATUS FLOW CHANGES

### OLD Declaration Flow:
```
WAITING_FOR_TAX_PAYMENT → TAXES_PAID → READY_FOR_OPERATIONS
```

### NEW Declaration Flow:
```
WAITING_FOR_FINAL_ASSESSMENT
  ↓ [Upload Tax Docs + Wharfage Docs]
WAITING_FOR_PAYMENTS
  ↓ [Payment Done]
READY_FOR_OPERATIONS (Declaration Done button)
```

### Operations Flow (SEA):
```
RECEIVED_BY_CLERK
  ↓ [Upload Verification Photos]
  ↓ [Upload Release Order]
  ↓ [Upload Port Charges]
WAITING_FOR_PORT_CHARGES_PAYMENT
  ↓ [Payment]
PORT_CHARGES_PAID
```

### Operations Flow (AIR):
```
RECEIVED_BY_CLERK
  ↓ [Upload Verification Photos]
  ↓ [Upload Release Order]
  ↓ [Upload Swissport Charges]
WAITING_FOR_SWISSPORT_CHARGES_PAYMENT
  ↓ [Payment]
SWISSPORT_CHARGES_PAID
```

---

## ⚠️ BREAKING CHANGES

1. **Declaration Status Flow** - Major change
2. **New Required Fields** - Database schema update needed
3. **Dashboard Stats** - Complete redesign for doc officer
4. **Permits Workflow** - Revised process

---

## 📝 NOTES

- This is a MAJOR update affecting core workflows
- Requires careful testing of all status transitions
- May need data migration for existing files
- All users should be notified of workflow changes

---

**Status**: Ready to implement
**Estimated Time**: 2-3 hours for full implementation
**Priority**: HIGH - Core workflow changes
