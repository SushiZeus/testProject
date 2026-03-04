# Quick Reference - All Implemented Features

## ✅ COMPLETED FEATURES

### 1. Petty Cash Downloads
- **Where**: Petty Cash page, view dialog, and table
- **Who**: All users with access to petty cash
- **What**: Download button for attachments
- **Icon**: Download icon (green)

### 2. File Document Downloads
- **Where**: File detail page, Documents tab
- **Who**: All users with file access
- **What**: Download button for each document
- **Icon**: Download icon

### 3. Document Upload
- **Where**: File detail page, Documents tab
- **Who**: Documentation officers only
- **What**: Upload button to add documents after file creation
- **Features**: Multiple files, document type selection, preview

### 4. Permits Clerk Workflow
- **Where**: Operations page, file actions
- **Who**: Permits clerk (button visible to all)
- **Button**: "PERMITS DONE" (green when active, faded when disabled)
- **Status**: Shows "WAITING FOR PERMITS" badge
- **Action**: Marks permits as complete, updates status to PERMITS_DONE

### 5. Shipping Line Clerk - ETA/ETB
- **Where**: Operations page, file actions
- **Who**: Shipping line clerk
- **Button**: "Set ETA/ETB" (blue, Ship icon)
- **Fields**: ETA (required), ETB (required for SEA)
- **Action**: Saves arrival time estimates

### 6. Shipping Line Clerk - Delivery Order
- **Where**: Operations page, file actions
- **Who**: Shipping line clerk
- **Workflow**:
  1. "Upload DO Invoice" → Status: WAITING_FOR_DO_PAYMENT
  2. After payment → "Submit Delivery Order" (green)
  3. Upload document → Status: DELIVERY_ORDER_SUBMITTED

## 🎯 USER ROLES & PERMISSIONS

| Role | Can Do |
|------|--------|
| Documentation Officer | Upload documents to files |
| Permits Clerk | Mark permits as done |
| Shipping Line Clerk | Set ETA/ETB, upload delivery orders |
| All Users | Download attachments they have access to |

## 📍 BUTTON LOCATIONS

### Operations Page
- **Permits Done**: Visible when file status = RECEIVED_BY_CLERK
- **Set ETA/ETB**: Visible for shipping line clerk on SEA shipments
- **Upload DO Invoice**: After permits done
- **Submit Delivery Order**: After DO payment confirmed

### File Detail Page
- **Upload Documents**: Documents tab header (documentation officer)
- **Download**: Next to each document (all users)

### Petty Cash Page
- **Download**: In view dialog and table row (all users)

## 🔄 STATUS FLOW

### Permits Workflow
```
RECEIVED_BY_CLERK → [Permits Done Button] → PERMITS_DONE
```

### Delivery Order Workflow
```
PERMITS_DONE → [Upload Invoice] → WAITING_FOR_DO_PAYMENT
→ [Payment] → DELIVERY_ORDER_PAYMENTS_DONE
→ [Upload Document + Submit] → DELIVERY_ORDER_SUBMITTED
```

## 🎨 VISUAL INDICATORS

- **Green Button**: Active, can be clicked
- **Faded Button**: Disabled, role restriction
- **Checkmark (✓)**: Action already completed
- **Badge**: Current status display
- **Toast**: Action confirmation

## 🚀 BUILD STATUS

- ✅ All features built successfully
- ✅ No TypeScript errors
- ✅ Bundle size: 1,081.37 kB (gzip: 289.80 kB)
- ✅ Ready for deployment
