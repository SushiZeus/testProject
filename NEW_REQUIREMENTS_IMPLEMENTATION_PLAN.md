# New Requirements Implementation Plan

## Requirements Summary

### 1. Timeline Improvements
- Show ALL approvals and rejections with comments in timeline
- Currently partially implemented - needs verification

### 2. Request History/Records
- Users can see requests they:
  - Made
  - Approved
  - Rejected
  - Paid (for cashier)
- Add filtering and search capabilities

### 3. Module Access Control

#### Declaration Module
- **Declaration Manager**: Full control (assign, process, manipulate)
- **Other users**: View-only + comment access

#### Operations Module
- **Operations Manager**: Full control (assign, process, manipulate)
- **Other users**: View-only + comment access

#### Drivers Module
- **HR Manager**: Full control (assign drivers, manage)
- **COO, Managing Director, Commercial Manager**: View-only access
- **Other users**: No access

### 4. Executive Reporting
- Executives and line managers can generate Excel reports
- Reports for different modules:
  - Declaration reports
  - Operations reports
  - Petty cash reports
  - Driver reports

### 5. Request Filtering
- Filter petty cash requests by:
  - Amount (range)
  - File number
  - Date range
  - Status
  - Requester

## Implementation Steps

### Phase 1: Petty Cash Enhancements

#### 1.1 Request History Page
Create new page: `app/src/pages/PettyCashHistoryPage.tsx`
- Show all requests user has interacted with
- Tabs: Made | Approved | Rejected | Paid
- Full timeline for each request

#### 1.2 Request Filtering
Add to `PettyCashPage.tsx`:
- Filter panel with:
  - Amount range (min/max)
  - File number search
  - Date range picker
  - Status multi-select
  - Requester select (for managers)
- Apply filters to table

#### 1.3 Timeline Verification
Verify timeline shows:
- All approval stages with comments
- All rejection stages with reasons
- Payment information
- Resubmission history

### Phase 2: Module Access Control

#### 2.1 Declaration Module
Update `DeclarationPage.tsx`:
- Add access control checks
- Disable buttons for non-Declaration Manager users
- Show "View Only" badge
- Allow comments for all users

#### 2.2 Operations Module
Update `OperationsPage.tsx`:
- Add access control checks
- Disable buttons for non-Operations Manager users
- Show "View Only" badge
- Allow comments for all users

#### 2.3 Drivers Module
Create `DriversPage.tsx`:
- Full access for HR Manager
- View-only for executives (COO, MD, Commercial Manager)
- No access for others
- Driver assignment interface
- Driver workload monitoring

### Phase 3: Executive Reporting

#### 3.1 Reports Enhancement
Update `ReportsPage.tsx`:
- Add module-specific report generation
- Declaration module reports
- Operations module reports
- Petty cash reports
- Driver reports
- Excel export with multiple sheets

#### 3.2 Report Access Control
- Executives: All reports
- Line managers: Department-specific reports
- Declaration Manager: Declaration reports only
- Operations Manager: Operations reports only
- HR Manager: Driver reports only

### Phase 4: Comment System

#### 4.1 File Comments
Add comment functionality to file detail pages:
- Comment input field
- Comment history
- User attribution
- Timestamps
- Available to all users with file access

## Files to Create

1. `app/src/pages/PettyCashHistoryPage.tsx` - Request history
2. `app/src/pages/DriversPage.tsx` - Driver management
3. `app/src/components/FilterPanel.tsx` - Reusable filter component
4. `app/src/components/CommentSection.tsx` - Reusable comment component

## Files to Modify

1. `app/src/pages/PettyCashPage.tsx` - Add filtering
2. `app/src/pages/DeclarationPage.tsx` - Access control
3. `app/src/pages/OperationsPage.tsx` - Access control
4. `app/src/pages/ReportsPage.tsx` - Enhanced reporting
5. `app/src/store/authStore.ts` - Add access control helpers
6. `app/src/types/index.ts` - Add filter types

## Priority Order

1. **HIGH**: Module access control (Declaration, Operations)
2. **HIGH**: Request filtering
3. **MEDIUM**: Request history page
4. **MEDIUM**: Drivers module
5. **MEDIUM**: Executive reporting
6. **LOW**: Comment system enhancements

## Timeline Estimate

- Phase 1: 2-3 hours
- Phase 2: 2-3 hours
- Phase 3: 1-2 hours
- Phase 4: 1-2 hours

Total: 6-10 hours of development

## Testing Requirements

- Test each role's access to modules
- Test filtering with various combinations
- Test report generation for each module
- Test comment system across all modules
- Test request history for different user types

---

**Next Steps**: Start with Phase 2 (Module Access Control) as it's the highest priority and affects system security.
