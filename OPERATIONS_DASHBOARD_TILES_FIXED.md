# Operations Dashboard Tiles Fixed

## Issue Resolved
Operations dashboard tiles now correctly show WAITING and IN PROGRESS based on file assignment and acknowledgment status.

## Changes Made

### Dashboard Tiles Updated

**Before**:
- Ready for Ops
- Permits Pending
- Swissport Pending
- My Files

**After**:
- **WAITING** - Files waiting to be assigned to operation clerks
- **IN PROGRESS** - Files assigned AND acknowledged by operation clerks
- **COMPLETED** - Files with driver assigned or cargo collected
- **MY FILES** - Operation clerk's assigned files

## Implementation Details

### Stats Calculation

```typescript
const stats = {
  // WAITING: Files with status READY_FOR_OPERATIONS (not yet assigned)
  waiting: files.filter((f: ShipmentFile) => 
    f.status === 'READY_FOR_OPERATIONS'
  ).length,
  
  // IN PROGRESS: Files assigned to operation clerk AND acknowledged
  inProgress: files.filter((f: ShipmentFile) => 
    f.assignedOperationClerkId && 
    (f.status === 'RECEIVED_BY_CLERK' || 
     f.status === 'WAITING_FOR_PAYMENTS' ||
     f.status === 'WAITING_FOR_PERMIT_PAYMENTS' ||
     f.status === 'PERMIT_PAYMENTS_DONE' ||
     f.status === 'PERMITS_DONE' ||
     f.status === 'WAITING_FOR_PORT_CHARGES_PAYMENT' ||
     f.status === 'PORT_CHARGES_PAID' ||
     f.status === 'WAITING_FOR_SWISSPORT_PAYMENTS' ||
     f.status === 'WAITING_FOR_SWISSPORT_CHARGES_PAYMENT' ||
     f.status === 'SWISSPORT_CHARGES_PAID')
  ).length,
  
  // COMPLETED: Files with driver assigned or cargo collected
  completed: files.filter((f: ShipmentFile) => 
    f.status === 'DRIVER_REQUESTED' ||
    f.status === 'DRIVER_ASSIGNED' ||
    f.status === 'CARGO_COLLECTED_FROM_AIRPORT'
  ).length,
  
  // MY FILES: Operation clerk's assigned files
  myFiles: user?.role === 'operation_clerk'
    ? files.filter((f: ShipmentFile) => 
        f.assignedOperationClerkId === user.id
      ).length
    : 0,
};
```

### Tile Icons

- **WAITING**: Clock icon (amber)
- **IN PROGRESS**: TrendingUp icon (blue)
- **COMPLETED**: CheckCircle icon (green)
- **MY FILES**: UserIcon (purple) - only for operation clerks

## Status Flow

1. **READY_FOR_OPERATIONS** → Shows in WAITING tile
2. Operations Manager assigns to Operation Clerk
3. Operation Clerk acknowledges → Status changes to RECEIVED_BY_CLERK
4. File now shows in IN PROGRESS tile
5. Operation Clerk processes permits, payments, etc.
6. Driver assigned → File moves to COMPLETED tile

## Key Points

✅ WAITING = Not yet assigned (READY_FOR_OPERATIONS)
✅ IN PROGRESS = Assigned AND acknowledged (RECEIVED_BY_CLERK onwards)
✅ COMPLETED = Driver stage (DRIVER_REQUESTED onwards)
✅ Clear distinction between waiting and active work

## Files Modified

- `app/src/pages/OperationsPage.tsx`
  - Updated stats calculation
  - Changed dashboard tiles
  - Added Clock, TrendingUp, UserIcon imports

## Testing

1. Create a file and complete declaration
2. File should show in WAITING tile (count increases)
3. Operations Manager assigns to Operation Clerk
4. Operation Clerk acknowledges
5. File should move from WAITING to IN PROGRESS
6. Process through permits and payments
7. File stays in IN PROGRESS until driver assigned
8. Once driver assigned, file moves to COMPLETED
