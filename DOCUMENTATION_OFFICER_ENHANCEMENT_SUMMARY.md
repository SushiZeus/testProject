# 📋 Documentation Officer Enhancement - Implementation Summary

## ✅ COMPLETED

### 1. Type Definitions Updated
**File**: `app/src/types/index.ts`

**New Fields Added to ShipmentFile Interface:**
```typescript
// Document numbering fields
commercialInvoiceNumber?: string;
hawbNumber?: string; // House Air Waybill
mawbNumber?: string; // Master Air Waybill  
roadConsignmentNumber?: string;
hblNumber?: string; // House Bill of Lading (already existed)
mblNumber?: string; // Master Bill of Lading (already existed)

// SEA freight specific fields
seaFreightType?: 'LCL' | 'FCL';
fclContainerType?: '20ft' | '40ft' | 'Other';
fclContainerQuantity?: number;
fclContainerOtherDescription?: string;

// Cargo information
cargoDescription?: string;
```

## 🔄 REQUIRED IMPLEMENTATION

### 2. FileOpeningPage Enhancement
**File**: `app/src/pages/FileOpeningPage.tsx`

**Required Changes:**

#### A. Add State Variables (after line ~105)
```typescript
// Document numbers state
const [documentNumbers, setDocumentNumbers] = useState({
  commercialInvoiceNumber: '',
  hawbNumber: '',
  mawbNumber: '',
  roadConsignmentNumber: '',
});

// SEA freight details state
const [seaFreightDetails, setSeaFreightDetails] = useState({
  seaFreightType: '' as 'LCL' | 'FCL' | '',
  fclContainerType: '' as '20ft' | '40ft' | 'Other' | '',
  fclContainerQuantity: 0,
  fclContainerOtherDescription: '',
});

// Cargo description state
const [cargoDescription, setCargoDescription] = useState('');
```

#### B. Modify Step 2 - Add Document Number Inputs
After each document checkbox, add corresponding number input fields:

**For Commercial Invoice:**
```tsx
{selectedDocuments.includes('commercial_invoice') && (
  <div className="ml-8 mt-2">
    <Label>Invoice Number</Label>
    <Input
      placeholder="Enter invoice number"
      value={documentNumbers.commercialInvoiceNumber}
      onChange={(e) => setDocumentNumbers({
        ...documentNumbers,
        commercialInvoiceNumber: e.target.value
      })}
    />
  </div>
)}
```

**For Airway Bill (AIR only):**
```tsx
{transportMode === 'AIR' && selectedDocuments.includes('airway_bill') && (
  <div className="ml-8 mt-2 space-y-2">
    <div>
      <Label>HAWB Number (House Air Waybill)</Label>
      <Input
        placeholder="Optional"
        value={documentNumbers.hawbNumber}
        onChange={(e) => setDocumentNumbers({
          ...documentNumbers,
          hawbNumber: e.target.value
        })}
      />
    </div>
    <div>
      <Label>MAWB Number (Master Air Waybill)</Label>
      <Input
        placeholder="Optional"
        value={documentNumbers.mawbNumber}
        onChange={(e) => setDocumentNumbers({
          ...documentNumbers,
          mawbNumber: e.target.value
        })}
      />
    </div>
    <p className="text-xs text-gray-500">At least one number required</p>
  </div>
)}
```

**For Bill of Lading (SEA only):**
```tsx
{transportMode === 'SEA' && selectedDocuments.includes('bill_of_lading') && (
  <div className="ml-8 mt-2 space-y-2">
    <div>
      <Label>HBL Number (House Bill of Lading)</Label>
      <Input
        placeholder="Optional"
        value={documentNumbers.hblNumber}
        onChange={(e) => setDocumentNumbers({
          ...documentNumbers,
          hblNumber: e.target.value
        })}
      />
    </div>
    <div>
      <Label>MBL Number (Master Bill of Lading)</Label>
      <Input
        placeholder="Optional"
        value={documentNumbers.mblNumber}
        onChange={(e) => setDocumentNumbers({
          ...documentNumbers,
          mblNumber: e.target.value
        })}
      />
    </div>
    <p className="text-xs text-gray-500">At least one number required</p>
  </div>
)}
```

**For Road Consignment Note (ROAD only):**
```tsx
{transportMode === 'ROAD' && selectedDocuments.includes('road_consignment_note') && (
  <div className="ml-8 mt-2">
    <Label>Consignment Note Number</Label>
    <Input
      placeholder="Enter consignment number"
      value={documentNumbers.roadConsignmentNumber}
      onChange={(e) => setDocumentNumbers({
        ...documentNumbers,
        roadConsignmentNumber: e.target.value
      })}
    />
  </div>
)}
```

#### C. Add New Step 2.5 - SEA Freight Details (SEA only)
Insert between Step 2 and Step 3:

```tsx
{currentStep === 2.5 && transportMode === 'SEA' && (
  <div className="space-y-6">
    <div>
      <Label className="text-base font-medium">SEA Freight Details</Label>
      <p className="text-sm text-gray-500 mt-1">
        Specify container type and quantity
      </p>
      
      {/* Container Type Selection */}
      <div className="mt-4 space-y-3">
        <Label>Container Type *</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="lcl"
              checked={seaFreightDetails.seaFreightType === 'LCL'}
              onChange={() => setSeaFreightDetails({
                ...seaFreightDetails,
                seaFreightType: 'LCL',
                fclContainerType: '',
                fclContainerQuantity: 0,
              })}
            />
            <Label htmlFor="lcl">LCL (Less than Container Load)</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="fcl"
              checked={seaFreightDetails.seaFreightType === 'FCL'}
              onChange={() => setSeaFreightDetails({
                ...seaFreightDetails,
                seaFreightType: 'FCL'
              })}
            />
            <Label htmlFor="fcl">FCL (Full Container Load)</Label>
          </div>
        </div>
      </div>

      {/* FCL Container Size Selection */}
      {seaFreightDetails.seaFreightType === 'FCL' && (
        <div className="mt-4 space-y-3">
          <Label>Container Size *</Label>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <input
                type="radio"
                id="20ft"
                checked={seaFreightDetails.fclContainerType === '20ft'}
                onChange={() => setSeaFreightDetails({
                  ...seaFreightDetails,
                  fclContainerType: '20ft',
                  fclContainerOtherDescription: ''
                })}
              />
              <Label htmlFor="20ft">20ft</Label>
              {seaFreightDetails.fclContainerType === '20ft' && (
                <Input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  className="w-32"
                  value={seaFreightDetails.fclContainerQuantity || ''}
                  onChange={(e) => setSeaFreightDetails({
                    ...seaFreightDetails,
                    fclContainerQuantity: parseInt(e.target.value) || 0
                  })}
                />
              )}
            </div>

            <div className="flex items-center gap-4">
              <input
                type="radio"
                id="40ft"
                checked={seaFreightDetails.fclContainerType === '40ft'}
                onChange={() => setSeaFreightDetails({
                  ...seaFreightDetails,
                  fclContainerType: '40ft',
                  fclContainerOtherDescription: ''
                })}
              />
              <Label htmlFor="40ft">40ft</Label>
              {seaFreightDetails.fclContainerType === '40ft' && (
                <Input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  className="w-32"
                  value={seaFreightDetails.fclContainerQuantity || ''}
                  onChange={(e) => setSeaFreightDetails({
                    ...seaFreightDetails,
                    fclContainerQuantity: parseInt(e.target.value) || 0
                  })}
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  id="other"
                  checked={seaFreightDetails.fclContainerType === 'Other'}
                  onChange={() => setSeaFreightDetails({
                    ...seaFreightDetails,
                    fclContainerType: 'Other',
                    fclContainerQuantity: 0
                  })}
                />
                <Label htmlFor="other">Other</Label>
              </div>
              {seaFreightDetails.fclContainerType === 'Other' && (
                <Textarea
                  placeholder="Describe container type and quantity"
                  value={seaFreightDetails.fclContainerOtherDescription}
                  onChange={(e) => setSeaFreightDetails({
                    ...seaFreightDetails,
                    fclContainerOtherDescription: e.target.value
                  })}
                  rows={3}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)}
```

#### D. Add New Step 2.6 - Cargo Description
Insert after SEA Freight Details:

```tsx
{currentStep === 2.6 && (
  <div className="space-y-6">
    <div>
      <Label className="text-base font-medium">Cargo Description</Label>
      <p className="text-sm text-gray-500 mt-1">
        Provide a brief description of the cargo being shipped
      </p>
      
      <div className="mt-4">
        <Label>Description *</Label>
        <Textarea
          placeholder="Enter cargo description (e.g., Electronics - Mobile phones and accessories)"
          value={cargoDescription}
          onChange={(e) => setCargoDescription(e.target.value)}
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {cargoDescription.length} / 500 characters
        </p>
      </div>
    </div>
  </div>
)}
```

#### E. Update Step Navigation Logic
Modify the step progression to include conditional steps:

```typescript
const handleNext = () => {
  // Validation for each step
  if (currentStep === 1) {
    // Validate client and shipment
    if (!validateStep1()) return;
    setCurrentStep(2);
  } else if (currentStep === 2) {
    // Validate documents and numbers
    if (!validateStep2()) return;
    // If SEA, go to SEA freight details, else go to cargo description
    setCurrentStep(transportMode === 'SEA' ? 2.5 : 2.6);
  } else if (currentStep === 2.5) {
    // Validate SEA freight details
    if (!validateSeaFreightDetails()) return;
    setCurrentStep(2.6);
  } else if (currentStep === 2.6) {
    // Validate cargo description
    if (!validateCargoDescription()) return;
    setCurrentStep(3);
  } else if (currentStep === 3) {
    // Upload documents
    handleSubmit();
  }
};
```

#### F. Add Validation Functions
```typescript
const validateStep2 = () => {
  // Validate document numbers
  if (selectedDocuments.includes('commercial_invoice') && !documentNumbers.commercialInvoiceNumber) {
    toast.error('Please enter commercial invoice number');
    return false;
  }
  
  if (transportMode === 'AIR' && selectedDocuments.includes('airway_bill')) {
    if (!documentNumbers.hawbNumber && !documentNumbers.mawbNumber) {
      toast.error('Please enter at least HAWB or MAWB number');
      return false;
    }
  }
  
  if (transportMode === 'SEA' && selectedDocuments.includes('bill_of_lading')) {
    if (!documentNumbers.hblNumber && !documentNumbers.mblNumber) {
      toast.error('Please enter at least HBL or MBL number');
      return false;
    }
  }
  
  if (transportMode === 'ROAD' && selectedDocuments.includes('road_consignment_note') && !documentNumbers.roadConsignmentNumber) {
    toast.error('Please enter road consignment note number');
    return false;
  }
  
  return true;
};

const validateSeaFreightDetails = () => {
  if (!seaFreightDetails.seaFreightType) {
    toast.error('Please select container type (LCL or FCL)');
    return false;
  }
  
  if (seaFreightDetails.seaFreightType === 'FCL') {
    if (!seaFreightDetails.fclContainerType) {
      toast.error('Please select FCL container size');
      return false;
    }
    
    if (seaFreightDetails.fclContainerType === '20ft' || seaFreightDetails.fclContainerType === '40ft') {
      if (!seaFreightDetails.fclContainerQuantity || seaFreightDetails.fclContainerQuantity < 1) {
        toast.error('Please enter container quantity');
        return false;
      }
    }
    
    if (seaFreightDetails.fclContainerType === 'Other' && !seaFreightDetails.fclContainerOtherDescription) {
      toast.error('Please describe the container type');
      return false;
    }
  }
  
  return true;
};

const validateCargoDescription = () => {
  if (!cargoDescription || cargoDescription.trim().length < 10) {
    toast.error('Please enter cargo description (minimum 10 characters)');
    return false;
  }
  return true;
};
```

#### G. Update File Creation
Modify the `handleSubmit` function to include new fields:

```typescript
const newFile = createFile({
  clientId: selectedClient?.id || newClientId,
  shipmentType,
  transportMode,
  documents: uploadedDocuments,
  createdBy: user.id,
  
  // Document numbers
  commercialInvoiceNumber: documentNumbers.commercialInvoiceNumber,
  hawbNumber: documentNumbers.hawbNumber,
  mawbNumber: documentNumbers.mawbNumber,
  roadConsignmentNumber: documentNumbers.roadConsignmentNumber,
  hblNumber: documentNumbers.hblNumber,
  mblNumber: documentNumbers.mblNumber,
  
  // SEA freight details
  ...(transportMode === 'SEA' && {
    seaFreightType: seaFreightDetails.seaFreightType,
    fclContainerType: seaFreightDetails.fclContainerType,
    fclContainerQuantity: seaFreightDetails.fclContainerQuantity,
    fclContainerOtherDescription: seaFreightDetails.fclContainerOtherDescription,
  }),
  
  // Cargo description
  cargoDescription,
});
```

### 3. FileStore Update
**File**: `app/src/store/fileStore.ts`

Update the `createFile` function signature to accept new parameters and store them in the file object.

### 4. Display Updates

#### A. FileDetailPage
Add sections to display:
- Document numbers
- SEA freight details (if applicable)
- Cargo description

#### B. ShippingLinePage
Already shows HBL/MBL. Add:
- Container type and quantity
- Cargo description

## 📊 Updated Step Flow

### For SEA Shipments:
1. Client & Shipment
2. Select Documents & Numbers
3. SEA Freight Details
4. Cargo Description
5. Upload Documents
6. Confirmation

### For AIR/ROAD/RAIL Shipments:
1. Client & Shipment
2. Select Documents & Numbers
3. Cargo Description
4. Upload Documents
5. Confirmation

## ✅ Success Criteria

- [ ] Document numbers captured for each document type
- [ ] SEA freight details (LCL/FCL, container type, quantity) captured
- [ ] Cargo description required and validated
- [ ] Conditional steps based on transport mode
- [ ] Validation prevents incomplete submissions
- [ ] Data persists in file store
- [ ] Data displays in file details
- [ ] Shipping line clerk can retrieve all information

## 🚀 Deployment Steps

1. Complete FileOpeningPage modifications
2. Update fileStore.ts
3. Update FileDetailPage display
4. Update ShippingLinePage display
5. Test all transport modes
6. Test validation
7. Build and deploy

---

**Status**: Types Updated ✅
**Next**: FileOpeningPage Implementation Required
**Estimated Effort**: 2-3 hours for complete implementation
