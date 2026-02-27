# Requirements Summary - System Enhancements

## Current Status
✅ Petty cash system with role-based views - COMPLETE
✅ Timeline showing events - COMPLETE (needs verification)
✅ Separate tables for managers - COMPLETE
✅ WAITING/APPROVED/PAID buttons - COMPLETE

## New Requirements to Implement

### 1. ✅ Timeline Enhancements (VERIFY)
**Status**: Likely already complete, needs verification
- Timeline should show ALL approvals and rejections
- All comments from each approver should be visible
- Currently implemented in View Request Dialog

**Action**: Test and verify timeline shows all events

### 2. 🔄 Request History & Records (TO IMPLEMENT)
**Requirement**: Users need access to see records of requests they:
- Made (requester)
- Approved (managers)
- Rejected (managers)
- Paid (cashier)

**Implementation**:
- Add "History" or "My Activity" page
- Show tabs: Made | Approved | Rejected | Paid
- Each tab shows relevant requests with full details

### 3. 🔄 Request Filtering (TO IMPLEMENT)
**Requirement**: Filter petty cash requests by:
- Amount (min/max range)
- File number
- Date range (from/to)
- Status
- Requester name

**Implementation**:
- ✅ Created `PettyCashFilter.tsx` component
- ⏳ Integrate into `PettyCashPage.tsx`
- ⏳ Add filter logic to request list

### 4. 🔄 Module Access Control (CRITICAL - TO IMPLEMENT)

#### Declaration Module
- **Declaration Manager ONLY**: Can assign declarants, process declarations, manipulate data
- **All other users**: View-only + can add comments

#### Operations Module  
- **Operations Manager ONLY**: Can assign clerks, process operations, manipulate data
- **All other users**: View-only + can add comments

#### Drivers Module
- **HR Manager ONLY**: Can assign drivers, manage driver data
- **Executives (COO, MD, Commercial Manager)**: View-only access
- **All other users**: No access

**Implementation**:
- Update `DeclarationPage.tsx` with strict access control
- Update `OperationsPage.tsx` with strict access control
- Create `DriversPage.tsx` with HR Manager control
- Add comment functionality to all modules

### 5. 🔄 Executive Reporting (TO IMPLEMENT)
**Requirement**: Executives and line managers can generate Excel reports for:
- Declaration module
- Operations module
- Petty cash module
- Drivers module

**Implementation**:
- Enhance `ReportsPage.tsx`
- Add module-specific report generation
- Excel export with multiple sheets
- Role-based report access

## Implementation Priority

### HIGH PRIORITY (Security & Core Functionality)
1. **Module Access Control** - Prevents unauthorized actions
   - Declaration Manager exclusive control
   - Operations Manager exclusive control
   - HR Manager exclusive control over drivers

### MEDIUM PRIORITY (User Experience)
2. **Request Filtering** - Helps users find requests quickly
3. **Request History** - Helps users track their activity

### LOW PRIORITY (Nice to Have)
4. **Executive Reporting** - Enhanced reporting capabilities

## Files to Create

1. ⏳ `app/src/pages/PettyCashHistoryPage.tsx` - Request history
2. ⏳ `app/src/pages/DriversPage.tsx` - Driver management (HR Manager only)
3. ✅ `app/src/components/PettyCashFilter.tsx` - Filter component (CREATED)
4. ⏳ `app/src/components/CommentSection.tsx` - Comment component for files

## Files to Modify

1. ⏳ `app/src/pages/PettyCashPage.tsx` - Add filtering integration
2. ⏳ `app/src/pages/DeclarationPage.tsx` - Strict access control
3. ⏳ `app/src/pages/OperationsPage.tsx` - Strict access control
4. ⏳ `app/src/pages/ReportsPage.tsx` - Enhanced reporting
5. ⏳ `app/src/store/authStore.ts` - Add access control helpers
6. ⏳ `app/src/App.tsx` - Add DriversPage route

## Next Steps

### Immediate Actions:
1. Verify timeline shows all approvals/rejections with comments
2. Implement module access control (Declaration, Operations, Drivers)
3. Integrate filtering into petty cash page
4. Create request history page
5. Enhance reporting system

### Testing Required:
- Test Declaration Manager has exclusive control
- Test Operations Manager has exclusive control
- Test HR Manager has exclusive control over drivers
- Test executives have view-only access
- Test filtering works with all combinations
- Test request history shows correct data for each user
- Test reports generate correctly for each module

## User Roles & Access Matrix

| Module | Declaration Manager | Operations Manager | HR Manager | Executives | Other Users |
|--------|-------------------|-------------------|------------|------------|-------------|
| Declaration | Full Control | View + Comment | View + Comment | View + Comment | View + Comment |
| Operations | View + Comment | Full Control | View + Comment | View + Comment | View + Comment |
| Drivers | No Access | No Access | Full Control | View Only | No Access |
| Petty Cash | Approve (own dept) | Approve (own dept) | Approve (own dept) | View All | View Own |
| Reports | Declaration Reports | Operations Reports | Driver Reports | All Reports | No Access |

## Success Criteria

✅ Declaration Manager is the ONLY user who can manipulate declaration module
✅ Operations Manager is the ONLY user who can manipulate operations module
✅ HR Manager is the ONLY user who can manipulate drivers module
✅ All users can view and comment on files they have access to
✅ Filtering works correctly for petty cash requests
✅ Users can see history of requests they interacted with
✅ Executives can generate reports for all modules
✅ Line managers can generate reports for their departments

---

**Current Focus**: Implement module access control as it's critical for system security and proper workflow management.
