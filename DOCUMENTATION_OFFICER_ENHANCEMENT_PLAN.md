# Documentation Officer Module Enhancement Plan

## 📋 Requirements Summary

### 1. Document Number Fields
For each document type, add input fields to capture document numbers:

**Commercial Invoice:**
- Commercial Invoice Number (text input)

**Airway Bill (AIR transport):**
- HAWB Number (House Air Waybill) - optional
- MAWB Number (Master Air Waybill) - optional
- Note: Either HAWB or MAWB (or both)

**Road Consignment Note (ROAD transport):**
- Road Consignment Note Number (text input)

**Bill of Lading (SEA transport):**
- HBL Number (House Bill of Lading) - optional
- MBL Number (Master Bill of Lading) - optional
- Note: Either HBL or MBL (or both)

### 2. SEA Freight Specific Fields
When transport mode is SEA:

**Container Type Selection:**
- LCL (Less than Container Load)
- FCL (Full Container Load)

**If FCL is selected:**
- Container Size Options:
  - 20ft (with quantity input)
  - 40ft (with quantity input)
  - Other (with description text area)

### 3. Cargo Description
- Text area for short cargo description
- Available for all transport modes
- Required field

## 🎯 Implementation Strategy

### Phase 1: Update Types ✅
- Add document number fields to ShipmentFile interface
- Add SEA freight fields (seaFreightType, fclContainerType, etc.)
- Add cargoDescription field

### Phase 2: Enhance FileOpeningPage
**Step 2.1: Add State Variables**
```typescript
const [documentNumbers, setDocumentNumbers] = useState({
  commercialInvoiceNumber: '',
  hawbNumber: '',
  mawbNumber: '',
  roadConsignmentNumber: '',
  hblNumber: '',
  mblNumber: '',
});

const [seaFreightDetails, setSeaFreightDetails] = useState({
  seaFreightType: '' as 'LCL' | 'FCL' | '',
  fclContainerType: '' as '20ft' | '40ft' | 'Other' | '',
  fclContainerQuantity: '',
  fclContainerOtherDescription: '',
});

const [cargoDescription, setCargoDescription] = useState('');
```

**Step 2.2: Modify Step 2 (Select Documents)**
- Keep existing document selection
- Add document number inputs below each selected document
- Show relevant fields based on transport mode:
  - AIR: Show HAWB/MAWB for airway_bill
  - SEA: Show HBL/MBL for bill_of_lading
  - ROAD: Show consignment number for road_consignment_note

**Step 2.3: Add Step 2.5 (SEA Freight Details)**
- Only show if transportMode === 'SEA'
- LCL/FCL radio buttons
- If FCL: Show container type selection
- If 20ft or 40ft: Show quantity input
- If Other: Show description textarea

**Step 2.4: Add Step 2.6 (Cargo Description)**
- Show for all transport modes
- Text area for cargo description
- Character limit (e.g., 500 characters)

**Step 2.5: Update Step Numbers**
- Step 1: Client & Shipment
- Step 2: Select Documents & Numbers
- Step 3: SEA Freight Details (conditional)
- Step 4: Cargo Description
- Step 5: Upload Documents
- Step 6: Confirmation

**Step 2.6: Update File Creation**
- Include all new fields in createFile call
- Validate required fields
- Pass data to fileStore

### Phase 3: Update FileStore
- Modify createFile function to accept new fields
- Store document numbers
- Store SEA freight details
- Store cargo description

### Phase 4: Display in Other Modules
- Show document numbers in FileDetailPage
- Show SEA freight details in ShippingLinePage
- Show cargo description in relevant views

## 📐 UI Layout Design

### Step 2: Select Documents & Numbers
```
┌─────────────────────────────────────────────────────────┐
│ Select Documents                                         │
│ Choose the shipping documents that need to be uploaded   │
├─────────────────────────────────────────────────────────┤
│ ☑ Commercial Invoice                                     │
│   └─ Invoice Number: [_______________]                   │
│                                                          │
│ ☑ Bill of Lading (SEA only)                            │
│   └─ HBL Number: [_______________] (optional)           │
│   └─ MBL Number: [_______________] (optional)           │
│                                                          │
│ ☑ Airway Bill (AIR only)                               │
│   └─ HAWB Number: [_______________] (optional)          │
│   └─ MAWB Number: [_______________] (optional)          │
│                                                          │
│ ☑ Road Consignment Note (ROAD only)                    │
│   └─ Consignment Number: [_______________]              │
└─────────────────────────────────────────────────────────┘
```

### Step 3: SEA Freight Details (SEA only)
```
┌─────────────────────────────────────────────────────────┐
│ SEA Freight Details                                      │
│ Specify container type and cargo information            │
├─────────────────────────────────────────────────────────┤
│ Container Type: *                                        │
│ ○ LCL (Less than Container Load)                        │
│ ● FCL (Full Container Load)                             │
│                                                          │
│ Container Size: *                                        │
│ ● 20ft  Quantity: [__2__]                              │
│ ○ 40ft  Quantity: [_____]                              │
│ ○ Other Description: [_____________________]            │
└─────────────────────────────────────────────────────────┘
```

### Step 4: Cargo Description
```
┌─────────────────────────────────────────────────────────┐
│ Cargo Description                                        │
│ Provide a brief description of the cargo                │
├─────────────────────────────────────────────────────────┤
│ Description: *                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Electronics - Mobile phones and accessories         │ │
│ │                                                      │ │
│ │                                                      │ │
│ └─────────────────────────────────────────────────────┘ │
│ 45 / 500 characters                                     │
└─────────────────────────────────────────────────────────┘
```

## ✅ Validation Rules

### Document Numbers:
- Commercial Invoice Number: Required if commercial_invoice selected
- HAWB/MAWB: At least one required if airway_bill selected
- HBL/MBL: At least one required if bill_of_lading selected
- Road Consignment Number: Required if road_consignment_note selected

### SEA Freight (if SEA transport):
- Container Type: Required
- If FCL:
  - Container Size: Required
  - If 20ft or 40ft: Quantity required (min: 1)
  - If Other: Description required

### Cargo Description:
- Required for all shipments
- Min length: 10 characters
- Max length: 500 characters

## 🔄 Data Flow

### File Creation:
```typescript
createFile({
  // Existing fields
  clientId,
  shipmentType,
  transportMode,
  documents,
  
  // New document number fields
  commercialInvoiceNumber,
  hawbNumber,
  mawbNumber,
  roadConsignmentNumber,
  hblNumber,
  mblNumber,
  
  // New SEA freight fields
  seaFreightType,
  fclContainerType,
  fclContainerQuantity,
  fclContainerOtherDescription,
  
  // New cargo field
  cargoDescription,
});
```

### Display in ShippingLinePage:
- Show HBL/MBL numbers (already implemented)
- Show container type and quantity
- Show cargo description

### Display in FileDetailPage:
- Document numbers section
- SEA freight details section
- Cargo description

## 📝 Implementation Notes

### Conditional Rendering:
- Show HAWB/MAWB only for AIR transport
- Show HBL/MBL only for SEA transport
- Show Road Consignment only for ROAD transport
- Show SEA Freight Details step only for SEA transport

### User Experience:
- Clear labels and placeholders
- Helpful tooltips
- Validation messages
- Auto-save draft (optional)
- Progress indicator

### Data Persistence:
- Store in fileStore
- Include in file export
- Show in file details
- Available for shipping line clerk

## 🎯 Success Criteria

- ✅ Documentation officer can enter document numbers
- ✅ SEA freight details captured for SEA shipments
- ✅ Cargo description required and validated
- ✅ Data persists and displays correctly
- ✅ Shipping line clerk can retrieve document numbers
- ✅ Validation prevents incomplete submissions
- ✅ UI is intuitive and user-friendly

## 📅 Implementation Timeline

1. **Phase 1**: Types update (5 minutes) ✅
2. **Phase 2**: FileOpeningPage enhancement (30 minutes)
3. **Phase 3**: FileStore update (10 minutes)
4. **Phase 4**: Display updates (15 minutes)
5. **Phase 5**: Testing and validation (10 minutes)

**Total Estimated Time**: 70 minutes

## 🚀 Next Steps

1. Complete FileOpeningPage enhancement
2. Update fileStore.ts
3. Update FileDetailPage display
4. Update ShippingLinePage to show new fields
5. Test complete workflow
6. Build and deploy

---

**Status**: Phase 1 Complete ✅
**Next**: Phase 2 - FileOpeningPage Enhancement
