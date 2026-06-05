# System Reset Tool - Ready to Use

## ✅ Reset Tool Created Successfully

A comprehensive data reset tool has been created and deployed. This tool allows you to wipe all data from the system and start fresh for testing.

## 🔗 Access the Reset Tool

**URL**: http://192.168.0.114:4173/reset-all-data.html

Or locally: http://localhost:4173/reset-all-data.html

## 📋 What the Reset Tool Does

### Data That Will Be DELETED:
- ❌ All shipment files
- ❌ All petty cash requests
- ❌ All leave requests
- ❌ All notifications
- ❌ All activity logs
- ❌ All driver assignments
- ❌ All permits

### Data That Will Be PRESERVED:
- ✅ User accounts and credentials
- ✅ Client information
- ✅ Leave balances (annual leave days)
- ✅ System configuration

## 🚀 How to Use

1. **Open the reset page** in your browser:
   - http://192.168.0.114:4173/reset-all-data.html

2. **Review current data counts**:
   - The page shows how many files, requests, and notifications exist
   - This helps you verify what will be deleted

3. **Click "Reset All Data" button**:
   - You'll get TWO confirmation prompts (safety measure)
   - Confirm both to proceed

4. **System resets automatically**:
   - All data is cleared from localStorage
   - Success message appears
   - Automatically redirects to login page after 3 seconds

5. **Start fresh testing**:
   - Login with any user account
   - Create new files, requests, and test all modules

## 🧪 Testing Workflow After Reset

### 1. Test File Management (Documentation Officer)
- Login: `documentation_officer@company.com` / `password123`
- Go to "Open New File"
- Create files with different transport modes:
  - SEA shipment (IMPORT or EXPORT)
  - AIR shipment (IMPORT or EXPORT)
  - ROAD shipment
  - RAIL shipment
- Test the transport mode tiles on dashboard
- Verify files appear in the dialog

### 2. Test Declaration Module (Declaration Manager)
- Login: `declaration_manager@company.com` / `password123`
- Go to "Declaration Management"
- Assign declarants to files
- Test approval workflow

### 3. Test Petty Cash (Operations Manager/Clerk)
- Login: `operations_manager@company.com` / `password123`
- Go to "Petty Cash"
- Create new petty cash requests
- Test approval workflow through different roles:
  - Operations Manager → Declaration Manager → HR Manager → COO → Finance Manager → Cashier

### 4. Test Leave Management (Any User)
- Login with any user (except Managing Director)
- Go to "Leave Management"
- Submit leave requests
- Test HR Manager approval (login as `hr_manager@company.com`)

### 5. Test Shipping Line Module (Shipping Line Clerk)
- Login: `shipping_line_clerk@company.com` / `password123`
- Go to "Shipping Line"
- View SEA shipments
- Add comments and test notifications

## 🔄 When to Use the Reset Tool

Use this tool when you want to:
- Start fresh testing from scratch
- Clear test data before a demo
- Reset the system after making code changes
- Verify that new features work with clean data
- Test the complete workflow from file creation to completion

## ⚠️ Important Notes

1. **Cannot be undone**: Once you reset, all data is permanently deleted
2. **Two confirmations required**: Safety measure to prevent accidental resets
3. **Preserves users**: You don't need to re-register users
4. **Preserves clients**: Client information remains intact
5. **Network accessible**: Other users on your network can also access this tool

## 🌐 Server Status

- **Status**: ✅ Running
- **Local URL**: http://localhost:4173/
- **Network URL**: http://192.168.0.114:4173/
- **Reset Tool**: http://192.168.0.114:4173/reset-all-data.html

## 📱 Quick Access Links

After reset, you can access:
- **Main App**: http://192.168.0.114:4173/
- **Reset Tool**: http://192.168.0.114:4173/reset-all-data.html
- **Cache Test**: http://192.168.0.114:4173/cache-test.html
- **Sessions Page**: http://192.168.0.114:4173/sessions.html

## 🎯 Next Steps

1. Open http://192.168.0.114:4173/reset-all-data.html
2. Review the data counts
3. Click "Reset All Data" and confirm
4. Wait for automatic redirect to login
5. Start testing with fresh data!

The system is now ready for comprehensive testing with a clean slate.
