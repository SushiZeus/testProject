# System Deployment - March 27, 2026 ✅

## Updates Completed Today

### 1. Tax Payment Status Fix
- Tax and wharfage payment confirmations now properly update file status
- AIR: Tax paid → READY_FOR_OPERATIONS
- SEA: Both tax and wharfage paid → READY_FOR_OPERATIONS
- SEA: Only tax paid → WAITING_FOR_WHARFAGE_PAYMENT

### 2. Workflow Status Updates
- Changed "WAITING FOR PAYMENTS" to "WAITING FOR WHARFAGE PAYMENT" (clearer)
- Added "WAITING FOR RELEASE ORDER" status after file assignment
- Added "OPERATIONS DONE" status for SEA shipments

### 3. Release Order Workflow Enforcement
- Release order must be uploaded before port/Swissport charges
- Port/Swissport charges buttons disabled until release order uploaded
- OPERATIONS DONE button only shows when release order exists
- Comprehensive validation at both UI and function levels

## Files Modified
- `app/src/types/index.ts` - Added new statuses and fields
- `app/src/utils/statusColors.ts` - Added colors for new statuses
- `app/src/pages/DeclarationPage.tsx` - Fixed tax/wharfage payment status updates
- `app/src/pages/OperationsPage.tsx` - Added release order validations and OPERATIONS DONE button
- `app/src/store/fileStore.ts` - Updated assignOperationClerk to set WAITING_FOR_RELEASE_ORDER

## Starting the Development Server

Due to PowerShell execution policy restrictions, you'll need to start the server manually:

### Option 1: Using Command Prompt (CMD)
```cmd
cd app
npm run dev -- --host
```

### Option 2: Using PowerShell with Bypass
```powershell
cd app
powershell -ExecutionPolicy Bypass -Command "npm run dev -- --host"
```

### Option 3: Change PowerShell Execution Policy (Admin Required)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd app
npm run dev -- --host
```

## Access URLs

Once the server starts, you'll see output like:

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.0.XXX:5173/
```

### Access Points:
- **Local Machine**: http://localhost:5173/
- **Network Access**: http://[YOUR-IP]:5173/
- **Mobile/Other Devices**: Use the Network URL shown in the terminal

## Test Credentials

### Documentation Officer
- Email: doc.officer@dowelef.com
- Password: password123

### Declaration Manager
- Email: dec.manager@dowelef.com
- Password: password123

### Declarant (Michael Brown)
- Email: michael.brown@dowelef.com
- Password: password123

### Operations Manager
- Email: ops.manager@dowelef.com
- Password: password123

### Operation Clerk (Lisa Anderson)
- Email: lisa.anderson@dowelef.com
- Password: password123

### Finance Manager
- Email: finance.manager@dowelef.com
- Password: password123

### Cashier
- Email: cashier@dowelef.com
- Password: password123

## Key Workflow Changes

### Declaration Phase (SEA):
1. Tax paid → Status: WAITING FOR WHARFAGE PAYMENT
2. Wharfage paid → Status: READY FOR OPERATIONS

### Operations Phase (SEA):
1. File assigned → Status: WAITING FOR RELEASE ORDER
2. Release order uploaded → Status: RELEASE ORDER RECEIVED
3. Port charges uploaded (requires release order) → Status: WAITING FOR PORT CHARGES PAYMENT
4. Port charges paid → Status: PORT CHARGES PAID
5. Operations done (requires release order) → Status: OPERATIONS DONE

### Operations Phase (AIR):
1. File assigned → Status: WAITING FOR RELEASE ORDER
2. Release order uploaded → Status: RELEASE ORDER RECEIVED
3. Swissport charges uploaded (requires release order) → Status: WAITING FOR SWISSPORT CHARGES PAYMENT
4. Swissport charges paid → Status: SWISSPORT CHARGES PAID
5. Cargo cleared → Status: CARGO CLEARED

## Browser Cache Clearing

After starting the server, clear your browser cache:

### Chrome/Edge:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Or use: http://localhost:5173/cache-test.html

### Firefox:
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Click "Clear Now"

## Verification Steps

1. Start the server using one of the methods above
2. Clear browser cache
3. Login as Declarant (Michael Brown)
4. Check that tax payment updates status correctly
5. Login as Operation Clerk (Lisa Anderson)
6. Verify release order is required before port/Swissport charges
7. Verify OPERATIONS DONE button only shows with release order

## Support

If you encounter issues:
1. Ensure Node.js and npm are installed
2. Check that port 5173 is not in use
3. Try clearing browser cache completely
4. Check console for any error messages

All changes have been saved and are ready for deployment!
