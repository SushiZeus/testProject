# IMPORT BY SEA - Implementation Status

## ✅ COMPLETED

### 1. Type System Updates
- ✅ Added new user roles: `shipping_line_clerk`, `transport_manager`
- ✅ Added all 20+ new file statuses to FileStatus type
- ✅ Extended ShipmentFile interface with new fields:
  - Clerk acknowledgment timestamps
  - Verification photos array
  - Permit fields (payment option, invoices, documents)
  - Shipping line fields (DO application, invoices, documents)
  - Port charges fields
  - Delivery fields

### 2. Status Colors Updated
- ✅ OperationsPage - All statuses mapped
- ✅ DeclarationPage - All statuses mapped
- ✅ DashboardPage - All statuses mapped
- ✅ FileDetailPage - All statuses mapped

### 3. Permissions Updated
- ✅ Added permissions for shipping_line_clerk
- ✅ Added permissions for transport_manager
- ✅ Updated operation_clerk permissions (verification photos, petty cash)
- ✅ Updated permits_clerk permissions
- ✅ Updated contact_person permissions (payment options)

---

## 🚧 IN PROGRESS / TODO

### Phase 1: Operation Clerk Workflow (CRITICAL)
**Status:** Not Started

#### Required Implementation:
1. **Clerk Acknowledgment**
   - [ ] Add "Accept File" button in OperationsPage for READY_FOR_OPERATIONS files
   - [ ] Update status to CLERK_WORKING_ON_FILE
   - [ ] Record clerkAcknowledgedAt timestamp
   - [ ] Notify all channels

2. **Verification Checkbox**
   - [ ] Add "VERIFICATION" checkbox in file detail view
   - [ ] Record verificationCheckedAt timestamp
   - [ ] Update status to SHIPMENT_UNDER_VERIFICATION
   - [ ] Show verification status in file list

3. **Photo Upload with Compression**
   - [ ] Create photo upload component
   - [ ] Implement automatic compression (browser-image-compression library)
   - [ ] Limit to 4 photos maximum
   - [ ] Store compressed photos in verificationPhotos array
   - [ ] Display photos in file detail view

4. **Petty Cash for Clerk**
   - [ ] Already implemented - just needs testing

---

### Phase 2: Permits Workflow (CRITICAL)
**Status:** Not Started

#### Required Implementation:
1. **Permits Clerk Module**
   - [ ] Create PermitsPage component
   - [ ] List files needing permits processing
   - [ ] Upload permit invoice functionality
   - [ ] Status: WAITING_FOR_PERMIT_PAYMENTS

2. **Contact Person Payment Options**
   - [ ] Add payment option dialog (CLIENT_TO_PAY / PROCEED_TO_REQUEST)
   - [ ] Notify contact person when invoice uploaded
   - [ ] Record payment option selection
   - [ ] Different workflows based on selection

3. **Permit Payments Done**
   - [ ] Checkbox for permits clerk
   - [ ] Upload permit document
   - [ ] Status: PERMIT_PAYMENTS_DONE
   - [ ] Notify operation clerk

---

### Phase 3: Shipping Line Clerk (SEA ONLY)
**Status:** Not Started

#### Required Implementation:
1. **Shipping Line Clerk Module**
   - [ ] Create ShippingLineClerkPage component
   - [ ] Auto-trigger for IMPORT BY SEA files
   - [ ] Acknowledge file assignment
   - [ ] Can comment on clearance process
   - [ ] Can request petty cash

2. **Delivery Order Application**
   - [ ] "APPLYING DELIVERY ORDER" checkbox
   - [ ] Record deliveryOrderApplicationAt timestamp
   - [ ] Status: PROCESSING_DELIVERY_ORDER

3. **DO Invoice & Payment**
   - [ ] Upload DO invoice
   - [ ] Status: WAITING_FOR_DO_PAYMENT
   - [ ] Payment options (CLIENT_TO_PAY / PROCEED_TO_REQUEST)
   - [ ] "PAYMENTS DONE" checkbox
   - [ ] Status: DELIVERY_ORDER_PAYMENTS_DONE

4. **Upload Delivery Order**
   - [ ] Upload DO document
   - [ ] Status: DELIVERY_ORDER_READY
   - [ ] Operation clerk can download

---

### Phase 4: Port Charges Workflow
**Status:** Not Started

#### Required Implementation:
1. **Port Charges Initiation**
   - [ ] "WAITING FOR PORT CHARGES" checkbox (operation clerk)
   - [ ] Status: WAITING_FOR_PORT_CHARGES

2. **Port Charges Invoice**
   - [ ] Upload port charges invoice
   - [ ] Status: WAITING_FOR_PORT_PAYMENT
   - [ ] Payment options (CLIENT_TO_PAY / PROCEED_TO_REQUEST)

3. **Port Charges Paid**
   - [ ] Payment confirmation
   - [ ] Status: PORT_CHARGES_PAID
   - [ ] Notify delivery clerk

---

### Phase 5: Driver Management - HR (Small Trucks)
**Status:** Not Started

#### Required Implementation:
1. **HR Driver Management Module**
   - [ ] Create HRDriverManagementPage
   - [ ] List all small truck drivers
   - [ ] Show workload for each driver
   - [ ] Job status tracking

2. **Driver Request**
   - [ ] "REQUEST FOR SMALL TRUCK DRIVER" checkbox (delivery clerk)
   - [ ] Notify HR manager

3. **Driver Assignment**
   - [ ] HR selects driver based on workload
   - [ ] Notify selected driver
   - [ ] Notify all drivers (pool notification)
   - [ ] Backup assignment if no response

4. **Driver Acceptance**
   - [ ] Driver "ACCEPTED JOB" checkbox
   - [ ] Status: DRIVER_COLLECTING_CARGO

5. **Cargo Collection**
   - [ ] Driver "COLLECTED CARGO" checkbox
   - [ ] Status: CARGO_COLLECTED_FROM_ICD

6. **Delivery**
   - [ ] "DELIVERED TO CLIENT" checkbox
   - [ ] "SHIPMENT AT WAREHOUSE" checkbox

---

### Phase 6: Driver Management - Transport Manager (Big Trucks)
**Status:** Not Started

#### Required Implementation:
1. **Transport Manager Module**
   - [ ] Create TransportManagerPage
   - [ ] List all big truck drivers
   - [ ] Show workload for each driver
   - [ ] Job status tracking

2. **Driver Request**
   - [ ] "REQUEST FOR BIG TRUCK DRIVER" checkbox (delivery clerk)
   - [ ] Notify transport manager

3. **Driver Assignment**
   - [ ] Transport manager selects driver based on workload
   - [ ] Notify selected driver
   - [ ] Notify all drivers (pool notification)
   - [ ] Backup assignment if no response

4. **Driver Acceptance & Delivery**
   - [ ] Same as HR driver workflow
   - [ ] Status: DRIVER_COLLECTING_CARGO
   - [ ] Status: CARGO_COLLECTED_FROM_ICD
   - [ ] Final delivery options

---

### Phase 7: Release Order
**Status:** Not Started

#### Required Implementation:
1. **Release Order Upload**
   - [ ] Operation clerk uploads release order
   - [ ] Status: RELEASE_ORDER_UPLOADED
   - [ ] Available for download

---

## 📋 ADDITIONAL REQUIREMENTS

### 1. Photo Compression Library
```bash
npm install browser-image-compression
```

### 2. New Mock Users Needed
- [ ] Add shipping_line_clerk user(s)
- [ ] Add transport_manager user(s)
- [ ] Update driver users with truck type (small/big)

### 3. FileStore Methods to Add
- [ ] `acknowledgeClerk(fileId, clerkId, userId)`
- [ ] `checkVerification(fileId, userId)`
- [ ] `uploadVerificationPhotos(fileId, photos)`
- [ ] `uploadPermitInvoice(fileId, invoiceUrl)`
- [ ] `selectPaymentOption(fileId, option, userId)`
- [ ] `markPermitPaymentsDone(fileId, userId)`
- [ ] `uploadPermitDocument(fileId, documentUrl)`
- [ ] `uploadReleaseOrder(fileId, documentUrl)`
- [ ] `acknowledgeShippingLineClerk(fileId, clerkId, userId)`
- [ ] `applyDeliveryOrder(fileId, userId)`
- [ ] `uploadDOInvoice(fileId, invoiceUrl)`
- [ ] `markDOPaymentsDone(fileId, userId)`
- [ ] `uploadDeliveryOrder(fileId, documentUrl)`
- [ ] `initiatePortCharges(fileId, userId)`
- [ ] `uploadPortChargesInvoice(fileId, invoiceUrl)`
- [ ] `markPortChargesPaid(fileId, userId)`
- [ ] `requestSmallTruckDriver(fileId, userId)`
- [ ] `requestBigTruckDriver(fileId, userId)`
- [ ] `assignDriver(fileId, driverId, assignedBy)`
- [ ] `driverAcceptJob(fileId, driverId)`
- [ ] `driverCollectCargo(fileId, driverId)`
- [ ] `driverDeliverToClient(fileId, driverId)`
- [ ] `driverDeliverToWarehouse(fileId, driverId)`

### 4. New Pages to Create
- [ ] `PermitsPage.tsx` - Permits clerk module
- [ ] `ShippingLineClerkPage.tsx` - Shipping line clerk module
- [ ] `HRDriverManagementPage.tsx` - HR driver management
- [ ] `TransportManagerPage.tsx` - Transport manager module
- [ ] `DriverPortalPage.tsx` - Driver job view and actions

### 5. Comment System Enhancement
- [ ] Show user name with each comment
- [ ] Timestamp for each comment
- [ ] Payment confirmation comments
- [ ] Clearance process comments

---

## 🎯 IMPLEMENTATION PRIORITY

### Immediate (Week 1):
1. Operation clerk acknowledgment & verification
2. Photo upload with compression
3. Permits workflow with payment options

### Short-term (Week 2):
1. Shipping line clerk module (SEA only)
2. Port charges workflow
3. Release order upload

### Medium-term (Week 3-4):
1. HR driver management (small trucks)
2. Transport manager module (big trucks)
3. Driver portal and job acceptance

---

## 🔧 TECHNICAL NOTES

### Photo Compression Implementation:
```typescript
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1024,
    useWebWorker: true
  };
  return await imageCompression(file, options);
};
```

### Payment Option Flow:
```
Invoice Uploaded → Contact Person Notified
  ↓
Contact Person Selects:
  → CLIENT_TO_PAY: Wait for client payment → Contact person comments → Clerk marks PAYMENTS DONE
  → PROCEED_TO_REQUEST: Clerk creates fund request → Approval chain → Cashier pays → Clerk marks PAYMENTS DONE
```

### Driver Assignment Flow:
```
Delivery Clerk Requests Driver
  ↓
Manager (HR/Transport) Checks Workload
  ↓
Manager Assigns Driver
  ↓
All Drivers Notified (Pool)
Selected Driver Gets Specific Notification
  ↓
Driver Accepts OR Manager Reassigns
  ↓
Driver Collects Cargo
  ↓
Driver Delivers (Client/Warehouse)
```

---

## 📊 TESTING CHECKLIST

### Once Implementation Complete:
- [ ] Test full IMPORT BY SEA workflow end-to-end
- [ ] Test IMPORT BY AIR workflow (should skip shipping line clerk)
- [ ] Test photo upload and compression
- [ ] Test payment options (both CLIENT_TO_PAY and PROCEED_TO_REQUEST)
- [ ] Test driver assignment and workload tracking
- [ ] Test all notifications
- [ ] Test all status transitions
- [ ] Test permissions for each role
- [ ] Test localStorage persistence
- [ ] Test comment system with user attribution

---

## 🚀 DEPLOYMENT NOTES

### Before Deployment:
1. Install browser-image-compression package
2. Add new mock users (shipping line clerk, transport manager)
3. Update driver users with truck type
4. Test all workflows thoroughly
5. Update user credentials document
6. Create user training materials

### After Deployment:
1. Monitor for any status transition issues
2. Check photo upload and compression performance
3. Verify notification delivery
4. Validate workload calculations
5. Test on mobile devices

---

**CURRENT STATUS:** Types and permissions updated. Ready to begin Phase 1 implementation.

**ESTIMATED COMPLETION:** 3-4 weeks for full implementation and testing.
