# Critical Fixes Required

## Issues Identified

### 1. Client Details Visibility ❌
**Problem**: Client details (name, TIN, mobile, email) are visible to all users including Declaration Manager
**Expected**: Client details should only be visible to authorized users (Documentation Officer, Commercial Manager, Managing Director, Administrator)
**Fix Required**: Add role-based visibility checks in FileDetailPage

### 2. Mark All Read Button Not Working ❌
**Problem**: "Mark all read" button in notifications doesn't change notifications to read status
**Current**: Function exists in store but may not be properly connected to UI
**Fix Required**: Verify button click handler and ensure it calls the correct function

### 3. Documents Not Showing in Documents Module ❌
**Problem**: Documents uploaded during file creation don't appear in the Documents module
**Current**: Documents are attached to files but not added to document database
**Fix Required**: When documents are uploaded in FileOpeningPage, they should also be added to documentStore

### 4. TAX PAID Dependency on Wharfage ❌
**Problem**: TAX PAID button is disabled until Wharfage documents are uploaded
**Expected**: 
- TAX PAID should work independently
- Separate delete/reupload buttons for Tax and Wharfage documents
- DECLARATION DONE should require both Tax and Wharfage
**Fix Required**: Update DeclarationPage logic to separate Tax and Wharfage workflows

## Implementation Plan

### Fix 1: Client Details Visibility
**File**: `app/src/pages/FileDetailPage.tsx`
**Changes**:
```typescript
// Add role check for client details visibility
const canViewClientDetails = user?.role === 'documentation_officer' || 
                             user?.role === 'commercial_manager' ||
                             user?.role === 'managing_director' ||
                             user?.role === 'administrator';

// Conditionally render client details
{canViewClientDetails && (
  <div className="client-details">
    {/* Client information */}
  </div>
)}
```

### Fix 2: Mark All Read Button
**File**: `app/src/layouts/DashboardLayout.tsx`
**Changes**:
- Verify button onClick handler
- Ensure it calls `markAllAsRead(user.id)`
- Add loading state during operation
- Show success feedback

### Fix 3: Documents in Database
**File**: `app/src/pages/FileOpeningPage.tsx`
**Changes**:
```typescript
// When uploading documents, also add to document store
const { uploadDocument } = useDocumentStore();

// For each document uploaded
await uploadDocument({
  name: file.name,
  type: documentType,
  category: 'file_documents',
  fileId: newFile.id,
  file: file
}, user.id);
```

### Fix 4: Tax/Wharfage Independence
**File**: `app/src/pages/DeclarationPage.tsx`
**Changes**:
1. Separate tax and wharfage document states
2. Add individual delete buttons for each
3. TAX PAID enabled when tax documents uploaded
4. DECLARATION DONE enabled when both uploaded
5. Add reupload functionality

## Priority
1. **HIGH**: Fix 4 (Tax/Wharfage) - Blocks declarant workflow
2. **HIGH**: Fix 3 (Documents) - Data integrity issue
3. **MEDIUM**: Fix 1 (Client visibility) - Security/privacy concern
4. **MEDIUM**: Fix 2 (Mark all read) - UX issue

## Testing Required
- Test with Documentation Officer role
- Test with Declaration Manager role
- Test with Declarant role
- Verify document uploads appear in Documents module
- Verify Tax PAID works without Wharfage
- Verify client details hidden from unauthorized users