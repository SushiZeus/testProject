# 📋 IMPORT BY SEA - Complete Workflow Specification

## Overview
This document outlines the complete workflow for IMPORT BY SEA shipments from tax payment through final delivery.

---

## 🔄 Complete Workflow

### Phase 1: Tax Payment & Operations Assignment
**Trigger:** Declaration complete, taxes paid
**Status:** `TAXES_PAID` → `READY_FOR_OPERATIONS`

1. Operations Manager assigns Operation Clerk
2. Operation Clerk receives notification
3. Clerk must acknowledge receiving file
4. Status: `CLERK_WORKING_ON_FILE`

---

### Phase 2: Verification Process
**Responsible:** Operation Clerk

#### Actions:
1. **Acknowledge File**
   - Clerk checks "Accept File" box
   - System records acceptance date/time
   
2. **Request Funds**
   - Can request petty cash for specific file
   - Follows standard approval process:
     - Operations Manager → COO → Finance Manager → Cashier

3. **Upload Verification Photos**
   - Maximum 4 photos per file
   - Photos compressed automatically
   - Stored with file

4. **Check Verification Box**
   - Clerk checks "VERIFICATION" box
   - System records date/time of verification
   - Status: `SHIPMENT_UNDER_VERIFICATION`

---

### Phase 3: Permits Processing
**Responsible:** Permits Clerk

#### Process:
1. **Process Permits**
   - Work on required permits separately
   - Upload permit invoice (if payment needed)
   - Status: `WAITING_FOR_PAYMENTS`

2. **Contact Person Notified**
   - Receives notification about payment
   - Two options:
     - **CLIENT TO PAY**
     - **PROCEED TO REQUEST**

#### Option A: CLIENT TO PAY
1. Contact person selects "CLIENT TO PAY"
2. Permits clerk waits for payment
3. Contact person comments when client pays
4. Permits clerk checks "PAYMENTS DONE"
5. Permits clerk uploads permit document
6. Status: `PERMIT_PAYMENTS_DONE`

#### Option B: PROCEED TO REQUEST
1. Contact person selects "PROCEED TO REQUEST"
2. Permits clerk creates fund request
3. Approval chain: Ops Manager → COO → Finance → Cashier
4. Cashier comments "Payments done"
5. Permits clerk checks "PAYMENTS DONE"
6. Permits clerk uploads permit document
7. Status: `PERMIT_PAYMENTS_DONE`

#### Notification:
- Operation clerk notified when permits done
- Can proceed with clearance

---

### Phase 4: Release Order
**Responsible:** Operation Clerk

1. Upon getting release order
2. Upload release order in system
3. Status: `RELEASE_ORDER_UPLOADED`

---

### Phase 5: Delivery Order (SEA SHIPMENTS ONLY)
**Responsible:** Shipping Line Clerk
**Trigger:** System recognizes IMPORT BY SEA

#### Process:
1. **Acknowledge File**
   - Shipping line clerk notified
   - Can comment on clearance process
   - Can request funds (same approval process)

2. **Check "APPLYING DELIVERY ORDER"**
   - System records date/time
   - Status: `PROCESSING_DELIVERY_ORDER`

3. **Apply for Delivery Order**
   - Process separately
   - Upload delivery order invoice
   - Status: `WAITING_FOR_DO_PAYMENT`

4. **Payment Options:**
   - **Client pays:** Contact person notifies
   - **Company pays:** Fund request → approvals

5. **Check "PAYMENTS DONE"**
   - Status: `DELIVERY_ORDER_PAYMENTS_DONE`

6. **Upload Delivery Order**
   - Upload DO document
   - Operation clerk can download
   - Status: `DELIVERY_ORDER_READY`

---

### Phase 6: Port Charges
**Responsible:** Operation Clerk

#### Process:
1. **Check "WAITING FOR PORT CHARGES"**
   - Status: `WAITING_FOR_PORT_CHARGES`

2. **Upload Port Charges Invoice**
   - Status: `WAITING_FOR_PORT_PAYMENT`

3. **Payment Options:**
   - **Client pays:** Contact person notifies
   - **Company pays:** Fund request → approvals

4. **Payment Confirmation**
   - Payer comments on file
   - Status: `PORT_CHARGES_PAID`

5. **Notification**
   - Delivery clerk notified
   - Make transport arrangements

---

### Phase 7: Transport Arrangements
**Responsible:** Delivery Clerk
**Trigger:** Port charges paid

#### Shipment Types:

### A. LOOSE CARGO (Small Truck)
**Managed by:** HR Manager

1. **Request Driver**
   - Delivery clerk checks "REQUEST FOR SMALL TRUCK DRIVER"
   - HR receives notification

2. **HR Assigns Driver**
   - Check driver workload in HR module
   - Select available driver
   - All drivers notified of assignment
   - Selected driver gets specific notification

3. **Driver Response**
   - Selected driver checks "ACCEPTED JOB"
   - If no response, HR can assign another driver
   - Status: `DRIVER_COLLECTING_CARGO`

4. **Cargo Collection**
   - Driver checks "COLLECTED CARGO"
   - Status: `CARGO_COLLECTED_FROM_ICD`

5. **Delivery**
   - **To Client:** Check "DELIVERED TO CLIENT"
   - **To Warehouse:** Check "SHIPMENT AT WAREHOUSE"

### B. CONTAINER (Big Truck)
**Managed by:** Transport Manager

1. **Request Driver**
   - Delivery clerk checks "REQUEST FOR BIG TRUCK DRIVER"
   - Transport Manager receives notification

2. **Transport Manager Assigns Driver**
   - Check driver workload in Transport module
   - Select available driver
   - All drivers notified of assignment
   - Selected driver gets specific notification

3. **Driver Response**
   - Selected driver checks "ACCEPTED JOB"
   - If no response, manager can assign another driver
   - Status: `DRIVER_COLLECTING_CARGO`

4. **Cargo Collection**
   - Driver checks "COLLECTED CARGO"
   - Status: `CARGO_COLLECTED_FROM_ICD`

5. **Delivery**
   - **To Client:** Check "DELIVERED TO CLIENT"
   - **To Warehouse:** Check "SHIPMENT AT WAREHOUSE"

---

## 👥 User Roles & Registration

### User Registration Process
**Responsible:** HR or System Admin

#### Registration Fields:
1. Name
2. Email
3. Phone
4. Department
5. **Position** (defines role)
6. **Driver Type** (for drivers only):
   - Small truck driver → Managed by HR
   - Big truck driver → Managed by Transport Manager
7. Vehicle details (for drivers)

#### Role Assignment:
- Position field determines system permissions
- Driver allocation based on vehicle type
- Automatic routing to correct manager

---

## 📊 Status Flow Summary

```
TAXES_PAID
  ↓
READY_FOR_OPERATIONS
  ↓
CLERK_WORKING_ON_FILE
  ↓
SHIPMENT_UNDER_VERIFICATION
  ↓
WAITING_FOR_PAYMENTS (Permits)
  ↓
PERMIT_PAYMENTS_DONE
  ↓
RELEASE_ORDER_UPLOADED
  ↓
PROCESSING_DELIVERY_ORDER (SEA only)
  ↓
WAITING_FOR_DO_PAYMENT
  ↓
DELIVERY_ORDER_PAYMENTS_DONE
  ↓
DELIVERY_ORDER_READY
  ↓
WAITING_FOR_PORT_CHARGES
  ↓
WAITING_FOR_PORT_PAYMENT
  ↓
PORT_CHARGES_PAID
  ↓
DRIVER_COLLECTING_CARGO
  ↓
CARGO_COLLECTED_FROM_ICD
  ↓
DELIVERED_TO_CLIENT / SHIPMENT_AT_WAREHOUSE
```

---

## 🔧 Technical Requirements

### 1. Photo Upload System
- Maximum 4 photos per file
- Automatic compression
- Supported formats: JPG, PNG
- Storage optimization
- Thumbnail generation

### 2. Document Management
- Invoice uploads
- Permit uploads
- Release order uploads
- Delivery order uploads
- Port charges invoices
- All documents downloadable

### 3. Notification System
- Real-time notifications
- Role-based alerts
- Driver pool notifications
- Payment notifications
- Status change alerts

### 4. Workload Management
- HR module: Small truck driver workload
- Transport module: Big truck driver workload
- Job status tracking
- Assignment history
- Availability status

### 5. Comment System
- File-specific comments
- User attribution
- Timestamp tracking
- Payment confirmations
- Status updates

### 6. Approval Workflows
- Operation clerk funds
- Permits clerk funds
- Shipping line clerk funds
- All follow same chain:
  - Operations Manager
  - COO
  - Finance Manager
  - Cashier

---

## 📝 Checkboxes & Actions

### Operation Clerk:
- [ ] Accept File
- [ ] VERIFICATION
- [ ] WAITING FOR PORT CHARGES
- [ ] PORT CHARGES PAID

### Permits Clerk:
- [ ] PAYMENTS DONE (Permits)

### Shipping Line Clerk:
- [ ] APPLYING DELIVERY ORDER
- [ ] PAYMENTS DONE (DO)

### Delivery Clerk:
- [ ] REQUEST FOR SMALL TRUCK DRIVER
- [ ] REQUEST FOR BIG TRUCK DRIVER

### Drivers:
- [ ] ACCEPTED JOB
- [ ] COLLECTED CARGO
- [ ] DELIVERED TO CLIENT
- [ ] SHIPMENT AT WAREHOUSE

### Contact Person:
- ( ) CLIENT TO PAY
- ( ) PROCEED TO REQUEST

---

## 🎯 Key Features

1. **Automatic Routing**
   - SEA shipments trigger shipping line clerk
   - Loose cargo → HR
   - Container → Transport Manager

2. **Flexible Payments**
   - Client pays (via contact person)
   - Company pays (via fund requests)
   - Clear payment tracking

3. **Driver Management**
   - Workload-based assignment
   - Pool notification system
   - Backup driver assignment

4. **Document Trail**
   - All documents uploaded
   - All actions timestamped
   - Complete audit trail

5. **Photo Verification**
   - Visual proof of verification
   - Compressed storage
   - Maximum 4 photos

---

## 🚀 Implementation Priority

### Phase 1 (Critical):
1. Operation clerk acknowledgment
2. Verification checkbox & photos
3. Permits processing workflow
4. Contact person payment options

### Phase 2 (Important):
1. Shipping line clerk module
2. Delivery order workflow
3. Port charges process
4. Driver request system

### Phase 3 (Enhancement):
1. HR driver management
2. Transport manager module
3. Workload tracking
4. Photo compression

---

## 📌 Notes

- All photo uploads compressed automatically
- All fund requests follow same approval chain
- All drivers notified of assignments
- All payments tracked with comments
- All actions timestamped
- All documents stored with file
- SEA-specific workflows only for IMPORT BY SEA

---

**This specification provides the complete blueprint for IMPORT BY SEA workflow implementation.**
