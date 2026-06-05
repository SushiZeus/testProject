# 📋 Documentation Officer Module - Enhancement Requirements

## 🎯 Overview

The Documentation Officer module needs to be enhanced to capture detailed document information, SEA freight specifications, and cargo descriptions during file creation.

---

## ✅ COMPLETED

### Type Definitions Updated
**File**: `app/src/types/index.ts`

New fields added to `ShipmentFile` interface:
- ✅ `commercialInvoiceNumber`
- ✅ `hawbNumber` (House Air Waybill)
- ✅ `mawbNumber` (Master Air Waybill)
- ✅ `roadConsignmentNumber`
- ✅ `hblNumber` (House Bill of Lading)
- ✅ `mblNumber` (Master Bill of Lading)
- ✅ `seaFreightType` ('LCL' | 'FCL')
- ✅ `fclContainerType` ('20ft' | '40ft' | 'Other')
- ✅ `fclContainerQuantity`
- ✅ `fclContainerOtherDescription`
- ✅ `cargoDescription`

---

## 📋 REQUIRED IMPLEMENTATION

### 1. Document Number Fields

**For Each Document Type:**

| Document Type | Transport Mode | Fields Required |
|--------------|----------------|-----------------|
| Commercial Invoice | All | Invoice Number (required) |
| Airway Bill | AIR | HAWB or MAWB (at least one) |
| Bill of Lading | SEA | HBL or MBL (at least one) |
| Road Consignment Note | ROAD | Consignment Number (required) |

**Implementation Location**: FileOpeningPage.tsx, Step 2

**UI Design**:
```
☑ Commercial Invoice
  └─ Invoice Number: [_______________] *

☑ Airway Bill (AIR only)
  └─ HAWB Number: [_______________] (optional)
  └─ MAWB Number: [_______________] (optional)
  └─ Note: At least one required

☑ Bill of Lading (SEA only)
  └─ HBL Number: [_______________] (optional)
  └─ MBL Number: [_______________] (optional)
  └─ Note: At least one required

☑ Road Consignment Note (ROAD only)
  └─ Consignment Number: [_______________] *
```

---

### 2. SEA Freight Details (SEA Transport Only)

**New Step**: Insert between "Select Documents" and "Upload Documents"

**Fields**:

#### A. Container Type Selection (Required)
- ○ LCL (Less than Container Load)
- ○ FCL (Full Container Load)

#### B. If FCL Selected - Container Size (Required)
- ○ 20ft → Show quantity input (min: 1)
- ○ 40ft → Show quantity input (min: 1)
- ○ Other → Show description textarea

**UI Design**:
```
┌─────────────────────────────────────────────┐
│ SEA Freight Details                          │
│ Specify container type and quantity          │
├─────────────────────────────────────────────┤
│ Container Type: *                            │
│ ○ LCL (Less than Container Load)            │
│ ● FCL (Full Container Load)                 │
│                                              │
│ Container Size: *                            │
│ ● 20ft  Quantity: [__2__] *                │
│ ○ 40ft  Quantity: [_____]                  │
│ ○ Other                                     │
│   Description: [_____________________]      │
│                [_____________________]      │
└─────────────────────────────────────────────┘
```

**Validation Rules**:
- Container Type: Required
- If FCL + 20ft/40ft: Quantity required (min: 1)
- If FCL + Other: Description required (min: 10 chars)

---

### 3. Cargo Description (All Transport Modes)

**New Step**: Insert after SEA Freight Details (or after Select Documents for non-SEA)

**Fields**:
- Cargo Description (textarea, required)
- Character limit: 500 characters
- Minimum length: 10 characters

**UI Design**:
```
┌─────────────────────────────────────────────┐
│ Cargo Description                            │
│ Provide a brief description of the cargo     │
├─────────────────────────────────────────────┤
│ Description: *                               │
│ ┌─────────────────────────────────────────┐ │
│ │ Electronics - Mobile phones and         │ │
│ │ accessories for retail distribution     │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│ 78 / 500 characters                         │
└─────────────────────────────────────────────┘
```

**Validation Rules**:
- Required field
- Minimum: 10 characters
- Maximum: 500 characters

---

## 🔄 Updated Workflow

### SEA Shipments:
1. **Client & Shipment** - Select client, shipment type, SEA transport
2. **Select Documents & Numbers** - Choose documents, enter document numbers
3. **SEA Freight Details** - LCL/FCL, container type, quantity
4. **Cargo Description** - Enter cargo description
5. **Upload Documents** - Upload PDF files
6. **Confirmation** - Review and confirm

### AIR/ROAD/RAIL Shipments:
1. **Client & Shipment** - Select client, shipment type, transport mode
2. **Select Documents & Numbers** - Choose documents, enter document numbers
3. **Cargo Description** - Enter cargo description
4. **Upload Documents** - Upload PDF files
5. **Confirmation** - Review and confirm

---

## 📊 Data Integration

### Shipping Line Clerk Access:
The shipping line clerk can retrieve all document numbers from the file:
- HBL/MBL numbers (already implemented in ShippingLinePage)
- Container type and quantity
- Cargo description

### Display Locations:
1. **FileDetailPage**: Show all document numbers, SEA freight details, cargo description
2. **ShippingLinePage**: Show HBL/MBL, container info, cargo description
3. **OperationsPage**: Show relevant details in file view

---

## ✅ Validation Summary

### Step 2 - Documents & Numbers:
- ✅ Commercial Invoice Number: Required if selected
- ✅ HAWB or MAWB: At least one if Airway Bill selected
- ✅ HBL or MBL: At least one if Bill of Lading selected
- ✅ Road Consignment Number: Required if selected

### Step 3 - SEA Freight (SEA only):
- ✅ Container Type: Required (LCL or FCL)
- ✅ If FCL: Container Size required
- ✅ If 20ft/40ft: Quantity required (min: 1)
- ✅ If Other: Description required (min: 10 chars)

### Step 4 - Cargo Description:
- ✅ Description: Required (10-500 characters)

---

## 🎨 UI/UX Guidelines

### Input Fields:
- Clear labels with asterisk (*) for required fields
- Helpful placeholders
- Character counters for text areas
- Validation messages below fields
- Conditional rendering based on transport mode

### Navigation:
- "Next" button validates current step
- "Previous" button allows going back
- Progress indicator shows current step
- Step numbers adjust based on transport mode

### Error Handling:
- Toast notifications for validation errors
- Red border on invalid fields
- Clear error messages
- Focus on first invalid field

---

## 📝 Implementation Files

### Files to Modify:
1. ✅ `app/src/types/index.ts` - Type definitions (DONE)
2. ⏳ `app/src/pages/FileOpeningPage.tsx` - Main implementation
3. ⏳ `app/src/store/fileStore.ts` - Store updates
4. ⏳ `app/src/pages/FileDetailPage.tsx` - Display updates
5. ⏳ `app/src/pages/ShippingLinePage.tsx` - Display updates

### New Components (Optional):
- `DocumentNumberInput.tsx` - Reusable document number input
- `SeaFreightDetails.tsx` - SEA freight form component
- `CargoDescriptionInput.tsx` - Cargo description component

---

## 🚀 Testing Checklist

### Document Numbers:
- [ ] Commercial invoice number saves correctly
- [ ] HAWB/MAWB validation works (at least one required)
- [ ] HBL/MBL validation works (at least one required)
- [ ] Road consignment number saves correctly
- [ ] Numbers display in file details
- [ ] Shipping line clerk can see numbers

### SEA Freight Details:
- [ ] LCL selection works
- [ ] FCL selection shows container options
- [ ] 20ft with quantity saves correctly
- [ ] 40ft with quantity saves correctly
- [ ] Other with description saves correctly
- [ ] Validation prevents empty fields
- [ ] Only shows for SEA transport

### Cargo Description:
- [ ] Text area accepts input
- [ ] Character counter works
- [ ] Minimum length validation works
- [ ] Maximum length enforced
- [ ] Description saves correctly
- [ ] Shows for all transport modes

### Integration:
- [ ] All data persists in file store
- [ ] File detail page shows all information
- [ ] Shipping line page shows relevant data
- [ ] Export/import works with new fields

---

## 📚 Documentation

### User Guides:
- **DOCUMENTATION_OFFICER_ENHANCEMENT_PLAN.md** - Detailed implementation plan
- **DOCUMENTATION_OFFICER_ENHANCEMENT_SUMMARY.md** - Code examples and implementation guide
- **DOCUMENTATION_OFFICER_REQUIREMENTS.md** - This file

### Technical Documentation:
- Type definitions in `types/index.ts`
- Component structure in FileOpeningPage
- Data flow through fileStore
- Display logic in detail pages

---

## 🎯 Success Criteria

✅ **Functionality**:
- All document numbers captured
- SEA freight details captured for SEA shipments
- Cargo description required for all shipments
- Validation prevents incomplete data
- Data persists correctly

✅ **User Experience**:
- Intuitive step-by-step process
- Clear validation messages
- Conditional fields based on transport mode
- Easy navigation between steps

✅ **Integration**:
- Shipping line clerk can retrieve all data
- Data displays correctly in all views
- No data loss during file creation
- Backward compatible with existing files

---

**Status**: Requirements Documented ✅
**Types Updated**: ✅
**Implementation**: Ready to Begin
**Estimated Time**: 2-3 hours

---

## 📞 Support

For implementation questions or clarifications:
- Review: DOCUMENTATION_OFFICER_ENHANCEMENT_SUMMARY.md
- Check: Type definitions in types/index.ts
- Reference: Existing FileOpeningPage.tsx structure

**All requirements are now documented and ready for implementation!**
