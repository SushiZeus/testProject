# 📋 Additional Requirements - Final Specifications

## 📅 Date: March 7, 2026

---

## 🎯 NEW REQUIREMENTS SUMMARY

### 1. Bill of Lading Number Field with Type Selection ✅

**For SEA Shipments:**
- User must select BL type: HBL or MBL (radio buttons)
- Then enter the corresponding number
- Only one type needs to be selected and filled

**For AIR Shipments:**
- User must select AWB type: HAWB or MAWB (radio buttons)
- Then enter the corresponding number
- Only one type needs to be selected and filled

**UI Design:**
```
Bill of Lading (SEA) / Airway Bill (AIR)
○ HBL (House Bill of Lading)  ○ MBL (Master Bill of Lading)
[Enter number: _______________]

OR

○ HAWB (House Air Waybill)  ○ MAWB (Master Air Waybill)
[Enter number: _______________]
```

---

### 2. Multiple Container Quantities ✅

**Requirement:**
- User can fill BOTH 20ft AND 40ft quantities simultaneously
- Not mutually exclusive
- Example: 2x 20ft + 3x 40ft containers

**UI Design:**
```
Container Size: *
☑ 20ft  Quantity: [__2__]
☑ 40ft  Quantity: [__3__]
☐ Other Description: [_____________________]
```

**Data Structure:**
```typescript
{
  fcl20ftQuantity?: number;
  fcl40ftQuantity?: number;
  fclOtherDescription?: string;
}
```

---

### 3. Contact Person Selection ✅

**Requirement:**
- Add "Contact Person" field in File Opening (Step 1)
- Dropdown list of contact persons
- List populated from users with role 'contact_person'
- Only HR Manager and Administrator can add contact persons

**UI Design:**
```
Client & Shipment
├─ Client Type: ○ Existing  ○ New
├─ Client Name: [_______________]
├─ Contact Person: * [Select contact person ▼]
│   └─ List: Michelle King, John Doe, etc.
├─ Shipment Type: [IMPORT ▼]
└─ Transport Mode: [SEA ▼]
```

**Implementation:**
- Filter users where role === 'contact_person'
- Store contactPersonId in ShipmentFile
- Display contact person name in file details

---

### 4. Automatic Data Transfer to Shipping Line Module ✅

**Requirement:**
When Documentation Officer creates a SEA shipment file, the Shipping Line module should automatically show:
- Bill of Lading number (HBL or MBL)
- Container quantities (20ft, 40ft)
- LCL details from description
- Cargo description

**Data Flow:**
```
Documentation Officer (File Opening)
    ↓ Creates SEA shipment
    ↓ Enters: BL number, containers, cargo description
    ↓ Saves file
    ↓
Shipping Line Module
    ↓ Automatically displays all details
    ↓ Can edit/update shipping details
    ↓ Can add D.O number
```

**Implementation:**
- ShippingLinePage reads from file.hblNumber, file.mblNumber
- Shows file.fcl20ftQuantity, file.fcl40ftQuantity
- Shows file.cargoDescription
- Allows editing via "Edit Details" button

---

### 5. User Management - Contact Person Registration ✅

**Requirement:**
- Only HR Manager and Administrator can add users
- Contact persons must be registered in the system
- Contact person role: 'contact_person'

**User Management Flow:**
```
HR Manager / Administrator
    ↓ Access User Management
    ↓ Add New User
    ↓ Select Role: Contact Person
    ↓ Enter: Name, Email, Phone
    ↓ Save
    ↓
Contact Person appears in dropdown
    ↓ Available in File Opening
    ↓ Can be assigned to files
```

---

## 📊 UPDATED TYPE DEFINITIONS

### ShipmentFile Interface Updates:

```typescript
export interface ShipmentFile {
  // ... existing fields ...
  
  // Bill of Lading / Airway Bill with type
  blType?: 'HBL' | 'MBL'; // For SEA
  blNumber?: string; // The actual BL number
  awbType?: 'HAWB' | 'MAWB'; // For AIR
  awbNumber?: string; // The actual AWB number
  
  // Multiple container quantities
  fcl20ftQuantity?: number;
  fcl40ftQuantity?: number;
  fclOtherDescription?: string;
  
  // Contact person
  contactPersonId?: string;
  contactPerson?: User;
  
  // ... rest of fields ...
}
```

---

## 🎨 UPDATED UI FLOWS

### File Opening - Step 1: Client & Shipment

```
┌─────────────────────────────────────────────────────────┐
│ Client & Shipment                                        │
│ Enter client and shipment details                       │
├─────────────────────────────────────────────────────────┤
│ Client Type:                                            │
│ ○ Existing Client  ● New Client                        │
│                                                          │
│ Client Name: * [ABC Trading Ltd____________]           │
│ Mobile Number: * [+255 713 456 001_______]             │
│ Email: [contact@abctrading.com___________]             │
│ TIN Number: * [TIN001234567______________]             │
│                                                          │
│ Contact Person: * [Select contact person ▼]            │
│   └─ Michelle King                                      │
│   └─ John Doe                                           │
│   └─ Sarah Johnson                                      │
│                                                          │
│ Shipment Type: * [IMPORT ▼]                            │
│ Mode of Transport: * [SEA ▼]                           │
└─────────────────────────────────────────────────────────┘
```

### File Opening - Step 2: Documents & Numbers

```
┌─────────────────────────────────────────────────────────┐
│ Documents & Numbers                                      │
│ Select documents and enter numbers                       │
├─────────────────────────────────────────────────────────┤
│ ☑ Commercial Invoice                                    │
│   └─ Invoice Number: * [INV-2026-001_____]            │
│                                                          │
│ ☑ Bill of Lading (SEA only)                           │
│   └─ Select Type: *                                     │
│       ● HBL (House Bill of Lading)                     │
│       ○ MBL (Master Bill of Lading)                    │
│   └─ BL Number: * [HBL-2026-001_______]               │
│                                                          │
│ ☑ Airway Bill (AIR only)                              │
│   └─ Select Type: *                                     │
│       ● HAWB (House Air Waybill)                       │
│       ○ MAWB (Master Air Waybill)                      │
│   └─ AWB Number: * [HAWB-2026-001_____]               │
└─────────────────────────────────────────────────────────┘
```

### File Opening - Step 3: SEA Freight Details

```
┌─────────────────────────────────────────────────────────┐
│ SEA Freight Details                                      │
│ Container type and specifications                        │
├─────────────────────────────────────────────────────────┤
│ Container Type: *                                        │
│ ○ LCL (Less than Container Load)                        │
│ ● FCL (Full Container Load)                             │
│                                                          │
│ Container Sizes: * (Select one or more)                 │
│ ☑ 20ft Container  Quantity: [__2__] *                  │
│ ☑ 40ft Container  Quantity: [__3__] *                  │
│ ☐ Other Container                                       │
│   Description: [_____________________________]          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 DATA SYNCHRONIZATION

### Documentation Officer → Shipping Line Module

**When file is created:**
```javascript
// Documentation Officer saves:
{
  blType: 'HBL',
  blNumber: 'HBL-2026-001',
  fcl20ftQuantity: 2,
  fcl40ftQuantity: 3,
  cargoDescription: 'Electronics - Mobile phones',
  contactPersonId: '18'
}

// Shipping Line Module automatically shows:
- BL Number: HBL-2026-001 (HBL)
- Containers: 2x 20ft, 3x 40ft
- Cargo: Electronics - Mobile phones
- Contact: Michelle King
```

**Shipping Line can then add:**
- D.O Number
- Additional container details
- ETA/ETB dates
- Delivery order documents

---

## ✅ VALIDATION RULES

### Bill of Lading / Airway Bill:
- Type selection: Required
- Number: Required if type selected
- Format: Alphanumeric, max 50 characters

### Container Quantities:
- At least one container type must have quantity > 0
- 20ft quantity: Optional, min 0, max 999
- 40ft quantity: Optional, min 0, max 999
- Other description: Required if "Other" selected

### Contact Person:
- Required field
- Must select from registered contact persons
- If no contact persons available, show message: "No contact persons registered. Please contact HR."

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Type Definitions
- [ ] Update ShipmentFile interface
- [ ] Add blType, blNumber fields
- [ ] Add awbType, awbNumber fields
- [ ] Update container quantity fields (20ft, 40ft separate)
- [ ] Add contactPersonId field

### Phase 2: File Opening Page
- [ ] Add contact person dropdown (Step 1)
- [ ] Add BL/AWB type selection (Step 2)
- [ ] Update container quantity inputs (Step 3)
- [ ] Add validation for new fields
- [ ] Update file creation to include new data

### Phase 3: Shipping Line Module
- [ ] Display BL type and number
- [ ] Display both 20ft and 40ft quantities
- [ ] Display contact person
- [ ] Auto-populate from file data
- [ ] Allow editing shipping details

### Phase 4: User Management
- [ ] Verify HR/Admin can add users
- [ ] Verify contact_person role exists
- [ ] Test contact person dropdown population

### Phase 5: Testing
- [ ] Test SEA shipment with HBL
- [ ] Test SEA shipment with MBL
- [ ] Test AIR shipment with HAWB
- [ ] Test AIR shipment with MAWB
- [ ] Test multiple container quantities
- [ ] Test contact person selection
- [ ] Test data sync to Shipping Line module

---

## 🎯 SUCCESS CRITERIA

✅ **Functionality:**
- BL/AWB type selection works correctly
- Can enter both 20ft and 40ft quantities
- Contact person dropdown populated
- Data syncs to Shipping Line module automatically
- Validation prevents incomplete data

✅ **User Experience:**
- Clear type selection (HBL/MBL, HAWB/MAWB)
- Intuitive container quantity inputs
- Easy contact person selection
- Immediate data availability in Shipping Line

✅ **Data Integrity:**
- All fields save correctly
- Data displays accurately in all modules
- No data loss during transfer
- Proper validation at each step

---

## 📊 SUMMARY OF CHANGES

### New Fields:
1. ✅ blType ('HBL' | 'MBL')
2. ✅ blNumber (string)
3. ✅ awbType ('HAWB' | 'MAWB')
4. ✅ awbNumber (string)
5. ✅ fcl20ftQuantity (number)
6. ✅ fcl40ftQuantity (number)
7. ✅ contactPersonId (string)

### Updated UI:
1. ✅ Contact person dropdown in Step 1
2. ✅ BL/AWB type selection in Step 2
3. ✅ Multiple container checkboxes in Step 3
4. ✅ Shipping Line auto-population

### Data Flow:
1. ✅ Documentation Officer → File Store
2. ✅ File Store → Shipping Line Module
3. ✅ Shipping Line Module → Display & Edit

---

**Status**: Requirements Documented ✅
**Ready for**: Implementation
**Estimated Time**: 3-4 hours

---

## 📞 IMPLEMENTATION NOTES

### Priority Order:
1. **High**: BL/AWB type selection (critical for SEA/AIR)
2. **High**: Multiple container quantities (business requirement)
3. **Medium**: Contact person selection (user management)
4. **Medium**: Data sync to Shipping Line (automation)

### Dependencies:
- Contact person dropdown requires user management
- Shipping Line sync requires file creation completion
- Container quantities require FCL selection

### Testing Focus:
- Type selection validation
- Multiple quantity inputs
- Data synchronization
- User role permissions

**All requirements documented and ready for implementation!** 🚀
