# Shipment Type & Transport Mode Logic - April 10, 2026

## ✅ Conditional Logic Implemented

### 1. TRANSSHIPMENT → SEA FREIGHT ONLY ✅
**When:** User selects "TRANSSHIPMENT" as shipment type
**Then:** Mode of Transport automatically set to "SEA FREIGHT"
**Result:** Only Sea Freight option is available and selectable

---

### 2. TRANSIT → ROAD TRANSPORT ONLY ✅
**When:** User selects "TRANSIT" as shipment type
**Then:** Mode of Transport automatically set to "ROAD TRANSPORT"
**Result:** Only Road Transport option is available and selectable

---

### 3. TRANSPORTATION Service → Special Rules ✅

#### Shipment Type Options:
**When:** User selects "TRANSPORTATION" as service type
**Then:** Shipment Type shows only:
- **LOCAL** (internally uses IMPORT)
- **TRANSIT**

**Hidden:** IMPORT, EXPORT, TRANSSHIPMENT options

#### Transport Mode:
**When:** TRANSPORTATION service is selected
**Then:** Mode of Transport automatically set to "ROAD TRANSPORT"
**Result:** Only Road Transport option is available
**Reason:** Transportation service is for road-based delivery only

---

## 📋 Complete Logic Matrix

| Service Type | Shipment Type | Available Transport Modes | Auto-Selected Mode |
|--------------|---------------|---------------------------|-------------------|
| CLEARANCE | IMPORT | All (Air, Sea, Road, Rail) | User Choice |
| CLEARANCE | EXPORT | All (Air, Sea, Road, Rail) | User Choice |
| CLEARANCE | TRANSSHIPMENT | **SEA ONLY** | ✅ SEA |
| CLEARANCE | TRANSIT | **ROAD ONLY** | ✅ ROAD |
| DOCUMENT_HANDOVER | IMPORT | All (Air, Sea, Road, Rail) | User Choice |
| DOCUMENT_HANDOVER | EXPORT | All (Air, Sea, Road, Rail) | User Choice |
| DOCUMENT_HANDOVER | TRANSSHIPMENT | **SEA ONLY** | ✅ SEA |
| DOCUMENT_HANDOVER | TRANSIT | **ROAD ONLY** | ✅ ROAD |
| **TRANSPORTATION** | **LOCAL** | **ROAD ONLY** | ✅ ROAD |
| **TRANSPORTATION** | **TRANSIT** | **ROAD ONLY** | ✅ ROAD |

---

## 🎯 Business Rules

### Rule 1: TRANSSHIPMENT = SEA FREIGHT
- **Reason:** Transshipment involves cargo transfer between vessels
- **Implementation:** When TRANSSHIPMENT selected, only SEA mode available
- **Auto-selection:** Transport mode automatically set to SEA

### Rule 2: TRANSIT = ROAD TRANSPORT
- **Reason:** Transit shipments move through territory by road
- **Implementation:** When TRANSIT selected, only ROAD mode available
- **Auto-selection:** Transport mode automatically set to ROAD

### Rule 3: TRANSPORTATION Service = ROAD ONLY
- **Reason:** Transportation service is for local/transit road delivery
- **Shipment Types:** Only LOCAL and TRANSIT options shown
- **Transport Mode:** Always ROAD, no other options available
- **Auto-selection:** Transport mode automatically set to ROAD

---

## 🧪 Testing Scenarios

### Test 1: TRANSSHIPMENT Selection
1. Select Service Type: **CLEARANCE**
2. Select Shipment Type: **TRANSSHIPMENT**
3. **Expected:** Transport Mode auto-selects SEA FREIGHT
4. **Expected:** Only SEA FREIGHT button is enabled
5. **Expected:** Air, Road, Rail buttons are disabled/hidden

### Test 2: TRANSIT Selection
1. Select Service Type: **CLEARANCE**
2. Select Shipment Type: **TRANSIT**
3. **Expected:** Transport Mode auto-selects ROAD TRANSPORT
4. **Expected:** Only ROAD TRANSPORT button is enabled
5. **Expected:** Air, Sea, Rail buttons are disabled/hidden

### Test 3: TRANSPORTATION Service
1. Select Service Type: **TRANSPORTATION**
2. **Expected:** Shipment Type shows only LOCAL and TRANSIT
3. **Expected:** IMPORT, EXPORT, TRANSSHIPMENT are hidden
4. **Expected:** Transport Mode auto-selects ROAD TRANSPORT
5. **Expected:** Only ROAD TRANSPORT button is enabled
6. Select Shipment Type: **LOCAL**
7. **Expected:** Transport Mode remains ROAD TRANSPORT
8. Select Shipment Type: **TRANSIT**
9. **Expected:** Transport Mode remains ROAD TRANSPORT

### Test 4: Normal CLEARANCE Flow
1. Select Service Type: **CLEARANCE**
2. Select Shipment Type: **IMPORT**
3. **Expected:** All transport modes available (Air, Sea, Road, Rail)
4. **Expected:** User can select any transport mode
5. Select Shipment Type: **EXPORT**
6. **Expected:** All transport modes still available

---

## 💡 User Experience

### Visual Feedback:
- **Enabled Options:** Blue border, blue background when selected
- **Disabled Options:** Grayed out, cursor shows "not-allowed"
- **Auto-Selection:** Automatically highlights the correct transport mode
- **Smooth Transitions:** All changes happen instantly with visual feedback

### Automatic Behavior:
- Selecting TRANSSHIPMENT → Instantly shows only SEA option
- Selecting TRANSIT → Instantly shows only ROAD option
- Selecting TRANSPORTATION service → Instantly shows only LOCAL/TRANSIT and ROAD

---

## 🔄 How to Test

1. **Open File Opening Page**
   - Login as Documentation Officer
   - Navigate to File Opening

2. **Test TRANSSHIPMENT:**
   - Select CLEARANCE service
   - Click TRANSSHIPMENT shipment type
   - Verify only SEA FREIGHT is available

3. **Test TRANSIT:**
   - Select CLEARANCE service
   - Click TRANSIT shipment type
   - Verify only ROAD TRANSPORT is available

4. **Test TRANSPORTATION:**
   - Click TRANSPORTATION service type
   - Verify only LOCAL and TRANSIT shipment types appear
   - Verify only ROAD TRANSPORT is available
   - Try switching between LOCAL and TRANSIT
   - Verify ROAD remains selected

5. **Test Normal Flow:**
   - Select CLEARANCE service
   - Select IMPORT shipment type
   - Verify all 4 transport modes are available
   - Select each mode to confirm they work

---

## 📊 Summary

| Feature | Status | Description |
|---------|--------|-------------|
| TRANSSHIPMENT → SEA | ✅ Complete | Auto-selects and restricts to SEA only |
| TRANSIT → ROAD | ✅ Complete | Auto-selects and restricts to ROAD only |
| TRANSPORTATION Service | ✅ Complete | Shows LOCAL/TRANSIT, ROAD only |
| Auto-Selection | ✅ Complete | Transport mode auto-sets based on rules |
| Visual Feedback | ✅ Complete | Disabled options are grayed out |
| useEffect Hook | ✅ Complete | Monitors changes and applies rules |

---

**Status:** ✅ Complete
**Updated:** April 10, 2026
**Server:** http://localhost:5173/
**Changes:** Live and ready to test!
