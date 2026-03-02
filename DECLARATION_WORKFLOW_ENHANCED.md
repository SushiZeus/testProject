# Enhanced Declaration Workflow

## Date: February 28, 2026
## Status: ✅ IMPLEMENTED

---

## Overview

The Declaration module workflow has been enhanced to provide more flexibility for both Declaration Managers and Declarants.

---

## New Features

### 1. Declaration Manager Can Work on Files ✅

**Previous Behavior:**
- Declaration Manager could only assign files to declarants
- Could not work on files directly

**New Behavior:**
- Declaration Manager can now work on files directly
- Can acknowledge and process files without assigning
- Has "Work on File" button for waiting files
- Can upload documents and mark declaration done

**Use Case:**
- When workload is high, Declaration Manager can help process files
- For urgent files that need immediate attention
- When declarants are unavailable

---

### 2. Declarants Can Self-Acknowledge Files ✅

**Previous Behavior:**
- Declarants had to wait for Declaration Manager to assign files
- Could only work on files explicitly assigned to them

**New Behavior:**
- Declarants can see all files waiting for declaration
- Can click "Acknowledge & Work" button on unassigned files
- Self-acknowledgment automatically assigns the file to them
- Declaration Manager receives notification about self-acknowledgment
- Workload updates automatically

**Benefits:**
- Faster file processing
- Better workload distribution
- Declarants can take initiative
- Reduces bottleneck at assignment stage

---

### 3. Enhanced Petty Cash Access ✅

**Previous Behavior:**
- Only certain roles could request petty cash

**New Behavior:**
- Both Declaration Manager and Declarants can request petty cash
- Can request for specific files they're working on
- Petty cash button visible for both roles

---

## Workflow Scenarios

### Scenario 1: Declaration Manager Assigns File (Traditional)

1. File arrives with status `WAITING_FOR_DECLARATION`
2. Declaration Manager views file in Declaration page
3. Declaration Manager clicks "Assign" button
4. Selects a declarant from list
5. Declarant receives notification
6. File status changes to `ASSIGNED_TO_DECLARANT`
7. Declarant clicks "Acknowledge" button
8. File status changes to `DECLARANT_ACKNOWLEDGED`
9. Declarant works on file

### Scenario 2: Declarant Self-Acknowledges (NEW)

1. File arrives with status `WAITING_FOR_DECLARATION`
2. Declarant views file in Declaration page
3. Declarant sees "Acknowledge & Work" button
4. Declarant clicks button
5. System automatically:
   - Assigns file to declarant
   - Changes status to `ASSIGNED_TO_DECLARANT` then `DECLARANT_ACKNOWLEDGED`
   - Sends notification to Declaration Manager
   - Updates declarant's workload
6. Declarant can immediately start working

### Scenario 3: Declaration Manager Works on File (NEW)

1. File arrives with status `WAITING_FOR_DECLARATION`
2. Declaration Manager views file in Declaration page
3. Declaration Manager clicks "Work on File" button
4. Acknowledges file
5. File status changes to `DECLARANT_ACKNOWLEDGED`
6. Declaration Manager can:
   - Upload documents
   - Mark declaration done
   - Request petty cash

---

## Button Visibility Matrix

| User Role | File Status | Buttons Available |
|-----------|-------------|-------------------|
| **Declaration Manager** | WAITING_FOR_DECLARATION | "Assign", "Work on File", "Petty Cash" |
| **Declaration Manager** | DECLARANT_ACKNOWLEDGED | "Upload Docs", "Declaration Done", "Petty Cash" |
| **Declarant** | WAITING_FOR_DECLARATION (unassigned) | "Acknowledge & Work", "Petty Cash" |
| **Declarant** | ASSIGNED_TO_DECLARANT (assigned to them) | "Acknowledge", "Petty Cash" |
| **Declarant** | DECLARANT_ACKNOWLEDGED (assigned to them) | "Upload Docs", "Declaration Done", "Petty Cash" |
| **Other Users** | Any | "View", "View Only" badge |

---

## Notifications

### Self-Acknowledgment Notification

**Sent To:** Declaration Manager  
**Trigger:** When declarant self-acknowledges a file  
**Title:** "Declarant Self-Acknowledged File"  
**Message:** "[Declarant Name] has acknowledged and started working on file [File Number]"  
**Type:** Info  
**Link:** /declaration

**Purpose:**
- Keep Declaration Manager informed
- Allow monitoring of workload distribution
- Track which declarants are taking initiative

---

## Workload Management

### Automatic Workload Updates

When a declarant self-acknowledges:
1. File is assigned to declarant
2. Declarant's workload count increases
3. Workload card updates in real-time
4. Declaration Manager can see updated workload

### Workload Card Display

Shows for each declarant:
- Total assigned files
- Files in progress
- Files waiting for assessment
- Availability status (Available/Moderate/Busy)

---

## Access Control

### Declaration Manager
- ✅ Can assign files to declarants
- ✅ Can work on files directly
- ✅ Can upload documents
- ✅ Can mark declaration done
- ✅ Can request petty cash for files
- ✅ Full control of declaration module

### Declarants
- ✅ Can view all waiting files
- ✅ Can self-acknowledge unassigned files
- ✅ Can acknowledge assigned files
- ✅ Can upload documents
- ✅ Can mark declaration done
- ✅ Can request petty cash for files
- ✅ Can work on files assigned to them

### Other Users
- ✅ Can view files (read-only)
- ✅ Can add comments
- ❌ Cannot manipulate files
- ❌ Cannot assign or acknowledge

---

## Technical Implementation

### Files Modified
- `app/src/pages/DeclarationPage.tsx`

### Key Changes

1. **Enhanced handleAcknowledge Function**
   ```typescript
   - Detects if it's a self-acknowledgment
   - Assigns file to declarant if self-acknowledging
   - Sends notification to Declaration Manager
   - Updates file status appropriately
   ```

2. **Updated Button Logic**
   ```typescript
   - Declaration Manager: "Assign" + "Work on File" buttons
   - Declarant (unassigned file): "Acknowledge & Work" button
   - Declarant (assigned file): "Acknowledge" button
   - Both roles: "Upload Docs", "Declaration Done", "Petty Cash"
   ```

3. **Enhanced Dialog**
   ```typescript
   - Dynamic title based on scenario
   - Different messages for self-acknowledgment
   - Clear explanation of what will happen
   ```

---

## Testing Guide

### Test 1: Declarant Self-Acknowledgment

1. Login as Documentation Officer
   - Create a new file
   - File status: WAITING_FOR_DECLARATION

2. Login as Declarant
   - Email: declarant@dowelef.com
   - Password: decl123
   - Go to Declaration page
   - See file in "Waiting" tab
   - Click "Acknowledge & Work" button
   - Confirm acknowledgment
   - ✅ File should be assigned to you
   - ✅ Status changes to DECLARANT_ACKNOWLEDGED

3. Login as Declaration Manager
   - Email: declaration.manager@dowelef.com
   - Password: decl123
   - Check notifications
   - ✅ Should see notification about self-acknowledgment
   - Go to Declaration page
   - ✅ Declarant's workload should be updated

### Test 2: Declaration Manager Works on File

1. Login as Documentation Officer
   - Create a new file

2. Login as Declaration Manager
   - Go to Declaration page
   - Find file in "Waiting" tab
   - Click "Work on File" button
   - Confirm acknowledgment
   - ✅ Should see "Upload Docs" and "Declaration Done" buttons
   - Upload documents
   - Mark declaration done
   - ✅ File moves to Operations

### Test 3: Petty Cash Request

1. Login as Declarant
   - Go to Declaration page
   - Find a file you're working on
   - Click "Petty Cash" button
   - Fill form with file selected
   - Submit request
   - ✅ Request created successfully

2. Login as Declaration Manager
   - Go to Declaration page
   - Find any file
   - Click "Petty Cash" button
   - Create request
   - ✅ Request created successfully

---

## Benefits

### For Declaration Manager
- ✅ Can help with workload during busy periods
- ✅ Can handle urgent files immediately
- ✅ Better visibility of declarant activities
- ✅ Reduced micromanagement

### For Declarants
- ✅ Can take initiative on files
- ✅ Faster file processing
- ✅ Better workload distribution
- ✅ More autonomy

### For Organization
- ✅ Faster turnaround times
- ✅ Better resource utilization
- ✅ Reduced bottlenecks
- ✅ Improved efficiency

---

## Future Enhancements

Potential improvements:
- Auto-assignment based on workload
- Priority-based file distribution
- Skill-based assignment
- Performance metrics per declarant

---

## Summary

The enhanced Declaration workflow provides:
1. ✅ Declaration Manager can work on files
2. ✅ Declarants can self-acknowledge files
3. ✅ Automatic notifications and workload updates
4. ✅ Both roles can request petty cash
5. ✅ Improved efficiency and flexibility

**Status:** Fully implemented and ready for testing!

---

**Implemented:** February 28, 2026  
**Version:** 1.1.0  
**Module:** Declaration
