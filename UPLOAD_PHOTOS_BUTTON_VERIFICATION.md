# Upload Photos Button - Verification Guide

## Button Status: ✅ INTEGRATED

The "Upload Photos" button is already integrated in the Operations page. Here's how to verify it's working:

## Where to Find the Button

### Location
**Page**: Operations
**Section**: Operation Files table
**Column**: Actions (last column)

### When It Appears
The button shows when ALL these conditions are met:
1. ✅ User is logged in as **Operation Clerk**
2. ✅ File status is **RECEIVED_BY_CLERK**
3. ✅ File is assigned to the logged-in clerk

## How to Test

### Step 1: Login as Operation Clerk
```
Email: sarah.wilson@dowelef.com
Password: operations123
```

### Step 2: Navigate to Operations
- Click "Operations" in the sidebar
- You'll see the Operations page

### Step 3: Find Files with Correct Status
Look for files with status badge showing:
- **RECEIVED BY CLERK** (blue badge)

### Step 4: Check Actions Column
In the Actions column, you should see:
- ✅ "Upload Photos" button (if no photos uploaded yet)
- ✅ "✓ Photos (X)" button (if photos already uploaded, showing count)

### Step 5: Click Upload Photos
1. Click the "Upload Photos" button
2. Dialog opens: "Upload Verification Photos"
3. Click to select 1-7 photos
4. Review selected photos
5. Click "Upload X Photo(s)"
6. Success message appears
7. Button changes to "✓ Photos (X)"

## Button Appearance

### Before Upload
```
[Upload Photos]
```
- White background
- Upload icon
- Text: "Upload Photos"

### After Upload
```
[✓ Photos (3)]
```
- Green background
- Checkmark icon
- Text shows photo count

## If Button Not Showing

### Possible Reasons:

#### 1. Wrong User Role
**Problem**: Not logged in as Operation Clerk
**Solution**: Login with operation clerk credentials

#### 2. Wrong File Status
**Problem**: File status is not "RECEIVED_BY_CLERK"
**Solution**: 
- Operations Manager must assign file to clerk
- Clerk must acknowledge/accept the file first
- Status will change to "RECEIVED_BY_CLERK"

#### 3. File Not Assigned
**Problem**: File not assigned to logged-in clerk
**Solution**: Operations Manager needs to assign file

#### 4. Browser Cache
**Problem**: Old version cached
**Solution**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)

## Complete Workflow

### For Operations Manager:
1. Login as Operations Manager
2. Go to Operations page
3. Find file with status "READY_FOR_OPERATIONS"
4. Click "Assign" button
5. Select operation clerk (Sarah Wilson)
6. Click "Assign Clerk"

### For Operation Clerk:
1. Login as Operation Clerk (Sarah Wilson)
2. Go to Operations page
3. Find assigned file with "READY_FOR_OPERATIONS"
4. Click "Accept" button
5. Status changes to "RECEIVED_BY_CLERK"
6. **Now "Upload Photos" button appears**
7. Click "Upload Photos"
8. Upload 1-7 verification photos
9. Continue with other uploads (Release Order, Port/Swissport Charges)

## Other Buttons in Same Section

When status is "RECEIVED_BY_CLERK", clerk sees:
1. ✅ **Upload Photos** (1-7 photos)
2. ✅ **Release Order** (document upload)
3. ✅ **Port Charges** (SEA only)
4. ✅ **Swissport Charges** (AIR only)

All these buttons appear together in the Actions column.

## Button Code Location

**File**: `app/src/pages/OperationsPage.tsx`
**Lines**: 893-903

```typescript
<Button 
  size="sm" 
  variant="outline"
  onClick={() => { setSelectedFile(file); setVerificationPhotosDialogOpen(true); }}
  className={file.verificationPhotos?.length ? 'bg-green-50 border-green-300' : ''}
>
  <Upload className="w-3 h-3 mr-1" />
  {file.verificationPhotos?.length ? `✓ Photos (${file.verificationPhotos.length})` : 'Upload Photos'}
</Button>
```

## Quick Test Checklist

- [ ] Login as Operation Clerk
- [ ] Navigate to Operations page
- [ ] Check if any files have "RECEIVED BY CLERK" status
- [ ] If no files, ask Operations Manager to assign one
- [ ] Look in Actions column for "Upload Photos" button
- [ ] Click button to open dialog
- [ ] Select 1-7 photos
- [ ] Upload photos
- [ ] Verify button shows "✓ Photos (X)"

## Status: ✅ WORKING

The Upload Photos button is fully integrated and functional. If you don't see it, follow the workflow above to get a file to the correct status.

---

**Need Help?**
1. Ensure you're logged in as Operation Clerk
2. Ensure file status is "RECEIVED_BY_CLERK"
3. Hard refresh browser (Ctrl+F5)
4. Check that file is assigned to you

**Last Updated**: March 16, 2026
**Feature**: Upload Photos (1-7 per file)
**Status**: Integrated and Active