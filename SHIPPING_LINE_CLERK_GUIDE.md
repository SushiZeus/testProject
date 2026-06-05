# Shipping Line Clerk - Quick Reference Guide

## Login Credentials
- **Email:** shipping_line_clerk@company.com
- **Password:** shipping_line_clerk123
- **Name:** Marcus Wilson
- **Role:** Shipping Line Clerk
- **Department:** Operations

---

## Role Responsibilities

The Shipping Line Clerk is responsible for managing shipping line documentation and coordination for SEA shipments only.

### Key Tasks:
1. **ETA/ETB Management** - Enter estimated arrival and berthing times
2. **Delivery Order Processing** - Upload invoices and delivery order documents
3. **Shipping Line Coordination** - Coordinate with shipping lines for document processing

---

## Workflow Steps

### 1. ETA/ETB Entry (SEA Shipments Only)
**When:** File is in operations (RECEIVED_BY_CLERK, PERMITS_DONE, etc.)

**Steps:**
1. Click "ETA/ETB" button on the file
2. Enter ETA (Estimated Time of Arrival) - REQUIRED
3. Enter ETB (Estimated Time of Berthing) - REQUIRED for SEA
4. Click "Save ETA/ETB"

**Fields:**
- **ETA:** Date/time when vessel arrives at port
- **ETB:** Date/time when vessel berths at dock

---

### 2. Delivery Order Invoice Upload
**When:** Ready to process delivery order

**Steps:**
1. Click "Upload Invoice" button
2. Select delivery order invoice file
3. Click "Upload Invoice"
4. System notifies Finance Manager for payment

**Result:** Status changes to WAITING_FOR_DO_PAYMENT

---

### 3. Delivery Order Document Upload
**When:** After finance confirms payment (DELIVERY_ORDER_PAYMENTS_DONE)

**Steps:**
1. Click "Upload DO Document" button
2. Select delivery order document file
3. Click "Upload Document"
4. System notifies Operations Manager

**Result:** Status changes to DELIVERY_ORDER_SUBMITTED

---

## Important Notes

### SEA Shipments Only
- Shipping Line Clerk role is ONLY for SEA transport mode
- AIR, ROAD, and RAIL shipments do not require shipping line clerk involvement

### Document Requirements
- Delivery order invoice must be uploaded before payment
- Delivery order document uploaded after payment confirmation
- Both ETA and ETB are required for SEA shipments

### Coordination
- Work closely with Operations Manager
- Coordinate with Finance for payment processing
- Ensure timely document submission to avoid delays

---

## Access Permissions

### Can Access:
- Operations module (view and process SEA shipments)
- File details and timeline
- Upload shipping line documents
- Add comments to files

### Cannot Access:
- Declaration module
- Finance module (except viewing own requests)
- HR module
- Driver management

---

## Common Scenarios

### Scenario 1: New SEA Shipment Arrives
1. File appears in Operations list
2. Enter ETA/ETB information
3. Wait for permits and other operations to complete
4. Upload delivery order invoice when ready
5. Wait for finance payment confirmation
6. Upload delivery order document
7. File moves to next stage

### Scenario 2: Urgent Delivery Order
1. Coordinate with Operations Manager
2. Upload invoice immediately
3. Request expedited payment from Finance
4. Upload document as soon as payment confirmed

### Scenario 3: Document Corrections
1. Add comment to file timeline explaining issue
2. Upload corrected document
3. Notify Operations Manager via comment

---

## Tips for Success

1. **Check Daily:** Review operations list for SEA shipments needing attention
2. **Timely Updates:** Enter ETA/ETB as soon as information is available
3. **Document Quality:** Ensure all uploaded documents are clear and complete
4. **Communication:** Use file comments to communicate with team
5. **Follow Up:** Track files through to delivery order submission

---

## Contact Support

For technical issues or questions:
- Operations Manager: operations_manager@company.com
- System Administrator: administrator@company.com

---

**Last Updated:** March 5, 2026
