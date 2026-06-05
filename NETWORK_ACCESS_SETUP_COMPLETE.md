# Network Access Setup Complete

## Date: March 9, 2026

## Status: ✅ SERVER RUNNING ON NETWORK

### Server Information

#### Your Computer (Server)
- **Local Access**: http://localhost:4173/
- **Network Access**: http://192.168.0.114:4173/
- **Status**: Running and accessible to network users

#### Network Configuration
- **Server IP**: 192.168.0.114
- **Port**: 4173
- **Protocol**: HTTP
- **Access**: Local Network Only

### How Other Users Can Access

#### Step 1: Ensure Same Network
All users must be connected to the same WiFi network or LAN as your computer.

#### Step 2: Access the Application
Other users should open their web browser and navigate to:
```
http://192.168.0.114:4173/
```

#### Step 3: Login with Test Credentials
Users can login with any of the test accounts below to test different roles.

### Test User Accounts

#### Management Level

**Managing Director**
- Email: managing_director@company.com
- Password: managing_director123
- Access: View-only access to all modules, no petty cash requests

**COO (Chief Operating Officer)**
- Email: coo@company.com
- Password: coo123
- Access: View all modules, approve petty cash, leave requests

**Commercial Manager**
- Email: commercial_manager@company.com
- Password: commercial_manager123
- Access: View all modules, request leave

**Finance Manager**
- Email: finance_manager@company.com
- Password: finance_manager123
- Access: Finance operations, approve petty cash, view all files

#### Department Managers

**Declaration Manager**
- Email: declaration_manager@company.com
- Password: declaration_manager123
- Access: Assign declarants, view declarations, approve petty cash

**Operations Manager**
- Email: operations_manager@company.com
- Password: operations_manager123
- Access: Assign operation clerks, approve petty cash, view operations

**HR Manager**
- Email: hr_manager@company.com
- Password: hr_manager123
- Access: Manage drivers, approve leave requests, register users, approve petty cash

**Transport Manager**
- Email: transport_manager@company.com
- Password: transport_manager123
- Access: Assign big truck drivers, manage drivers

#### Department Staff

**Documentation Officer**
- Email: documentation_officer@company.com
- Password: documentation_officer123
- Access: Create files, request petty cash, request leave

**Declarant**
- Email: declarant@company.com
- Password: declarant123
- Access: Process declarations, request petty cash, request leave

**Operations Clerk**
- Email: operation_clerk@company.com
- Password: operation_clerk123
- Access: Process operations, request petty cash, request leave

**Permits Clerk**
- Email: permits_clerk@company.com
- Password: permits_clerk123
- Access: Process permits, request petty cash, request leave

**Shipping Line Clerk**
- Email: shipping_line_clerk@company.com
- Password: shipping_line_clerk123
- Access: Process SEA shipments, request petty cash, request leave

**Delivery Clerk**
- Email: delivery_clerk@company.com
- Password: delivery_clerk123
- Access: Request drivers, process delivery, request petty cash

**Cashier**
- Email: cashier@company.com
- Password: cashier123
- Access: Process payments, approve petty cash final stage

**Driver**
- Email: driver@company.com
- Password: driver123
- Access: View assigned jobs, update delivery status

**Contact Person (Client)**
- Email: contact_person@company.com
- Password: contact_person123
- Access: View client files, update payment status

**Administrator**
- Email: administrator@company.com
- Password: administrator123
- Access: Full system access, register users

### Testing Scenarios

#### Scenario 1: Multi-User File Processing
1. **User 1** (Documentation Officer): Create a new file
2. **User 2** (Declaration Manager): Assign declarant
3. **User 3** (Declarant): Process declaration
4. **User 4** (Operations Manager): Assign operation clerk
5. **User 5** (Operations Clerk): Process operations
6. All users see real-time notifications

#### Scenario 2: Petty Cash Approval Workflow
1. **User 1** (Any staff): Request petty cash
2. **User 2** (Department Manager): Approve at manager level
3. **User 3** (COO): Approve at COO level
4. **User 4** (Finance Manager): Approve at finance level
5. **User 5** (Cashier): Final approval and payment
6. All users see status updates in real-time

#### Scenario 3: Leave Management
1. **User 1** (Any staff): Submit leave request
2. **User 2** (HR Manager): View pending requests
3. **User 2** (HR Manager): Approve or reject
4. **User 1** (Staff): See approval notification
5. Both users see sidebar notification badges

#### Scenario 4: User Registration
1. **User 1** (HR Manager): Register new user
2. **User 2** (New user): Login with new credentials
3. **User 2**: Access modules based on assigned role

### Firewall Configuration

If other users cannot access the server, you may need to allow the port through Windows Firewall:

#### Option 1: Allow Port 4173 (Recommended)
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Vite Preview Server" -Direction Inbound -LocalPort 4173 -Protocol TCP -Action Allow
```

#### Option 2: Temporarily Disable Firewall (Not Recommended)
Only for testing purposes in a trusted network.

### Troubleshooting

#### Problem: Users can't connect
**Solutions:**
1. Verify all devices are on the same network
2. Check Windows Firewall settings
3. Verify the server is still running (check terminal)
4. Try accessing from your computer first: http://localhost:4173/
5. Ensure antivirus isn't blocking the connection

#### Problem: Server stopped
**Solution:**
Restart the server:
```bash
cd app
npm run preview -- --host
```

#### Problem: IP address changed
**Solution:**
1. Check new IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Share new URL with users: `http://[NEW_IP]:4173/`

#### Problem: Slow performance
**Solutions:**
1. Limit number of concurrent users (recommended: 5-10)
2. Close unnecessary applications on server computer
3. Ensure good network connection

### Important Notes

#### Data Persistence
- All data is stored in browser localStorage
- Each user has their own data storage
- Data is NOT shared between users in real-time
- For true multi-user experience, a backend database would be needed

#### Current Limitations
- No real-time synchronization between users
- Each user's browser stores data independently
- Notifications are local to each user's session
- File changes by one user won't appear for others until page refresh

#### Recommended Usage
This setup is perfect for:
- Testing different user roles
- Demonstrating workflows
- Training sessions
- User acceptance testing (UAT)
- Showcasing features to stakeholders

### Server Management

#### To Stop the Server
Press `Ctrl + C` in the terminal running the preview server

#### To Restart the Server
```bash
cd C:\Users\user\Desktop\testproject\app
npm run preview -- --host
```

#### To Check Server Status
Look for this output in terminal:
```
➜  Local:   http://localhost:4173/
➜  Network: http://192.168.0.114:4173/
```

### Network Information

#### Your Network Details
- **Server IP**: 192.168.0.114
- **Port**: 4173
- **Network Type**: Local Area Network (LAN)
- **Access URL**: http://192.168.0.114:4173/

#### Sharing Instructions for Users
Send this message to other users:

---
**DOW ELEF Management System - Test Access**

You can now access the system for testing:

**URL**: http://192.168.0.114:4173/

**Requirements**:
- Must be on the same WiFi/network
- Use any modern web browser (Chrome, Firefox, Edge, Safari)

**Test Credentials**: See the credentials list in the documentation

**Note**: This is a test environment. Each user's data is stored locally in their browser.

---

### Security Considerations

#### For Testing Environment
- ✅ Local network only (not accessible from internet)
- ✅ Test credentials only (no real data)
- ✅ Temporary setup (can be stopped anytime)

#### Not Recommended For
- ❌ Production use
- ❌ Storing real sensitive data
- ❌ Long-term deployment
- ❌ Public internet access

### Next Steps for Production

If you want to deploy this for real use, consider:

1. **Backend Database**
   - PostgreSQL, MySQL, or MongoDB
   - Real-time data synchronization
   - Proper user authentication

2. **Cloud Hosting**
   - AWS, Azure, or Google Cloud
   - Proper SSL certificates (HTTPS)
   - Scalable infrastructure

3. **Security Enhancements**
   - JWT authentication
   - Role-based access control (RBAC)
   - Encrypted data storage
   - Audit logs

4. **Real-time Features**
   - WebSocket connections
   - Live notifications
   - Collaborative editing

### Support

#### Current Setup
- **Server Computer**: Your PC (192.168.0.114)
- **Server Status**: Running
- **Access Method**: HTTP over local network
- **Port**: 4173

#### To Share Screen/Demo
You can also share your screen via:
- Microsoft Teams
- Zoom
- Google Meet
- Any screen sharing tool

This allows remote users to see the system even if they're not on your network.

## Setup Complete! 🎉

Your system is now accessible to other users on your local network at:
**http://192.168.0.114:4173/**

Users can test different roles by logging in with the credentials provided above.
