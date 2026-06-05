# DOW ELEF Management System - Access Links

## Server Status: ✅ RUNNING

The development server is now running with network access enabled.

## Access Links

### Local Access (This Computer)
```
http://localhost:5173/
```
Use this link when accessing from the same computer where the server is running.

### Network Access (Other Devices on Same Network)
```
http://192.168.0.114:5173/
```
Use this link when accessing from other computers, tablets, or phones on the same local network.

## System Information

- **Server**: Vite v7.3.1
- **Status**: Ready and running
- **Local Port**: 5173
- **Network IP**: 192.168.0.114
- **Network Port**: 5173

## Recent Updates ✅

### 1. Transport Mode Icons
- ✈️ AIR shipments now display airplane icon
- 🚂 RAIL shipments now display train icon

### 2. Performance Optimization
- Fixed infinite re-render loops in 3 stores
- Implemented caching mechanism
- Optimized for all 16 user roles
- System-wide stability improvements

### 3. Store Optimizations
- fileStore.ts - Cached file arrays
- pettyCashStore.ts - Cached request arrays
- leaveStore.ts - Cached leave request arrays

## User Credentials

### Documentation Officer
- **Username**: john.smith
- **Password**: password123
- **Role**: Documentation Officer

### Declaration Manager
- **Username**: sarah.johnson
- **Password**: password123
- **Role**: Declaration Manager

### HR Manager
- **Username**: michael.brown
- **Password**: password123
- **Role**: HR Manager

### Operations Manager
- **Username**: emily.davis
- **Password**: password123
- **Role**: Operations Manager

### Finance Manager
- **Username**: david.wilson
- **Password**: password123
- **Role**: Finance Manager

### COO
- **Username**: jennifer.martinez
- **Password**: password123
- **Role**: COO

### Managing Director
- **Username**: robert.anderson
- **Password**: password123
- **Role**: Managing Director

### Administrator
- **Username**: admin
- **Password**: admin123
- **Role**: Administrator

### Other Roles
All other users follow the pattern:
- **Username**: firstname.lastname
- **Password**: password123

## Network Access Setup

### For Other Devices on the Same Network:

1. **Ensure devices are on the same network**
   - Connect to the same WiFi network
   - Or connect via Ethernet to the same router

2. **Check Windows Firewall** (if needed)
   - Allow Node.js through Windows Firewall
   - Allow port 5173 for inbound connections

3. **Access the application**
   - Open browser on the device
   - Navigate to: `http://192.168.0.114:5173/`
   - Login with any user credentials above

### Firewall Configuration (If Needed)

If you can't access from other devices:

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find "Node.js" or add a new rule
4. Allow both Private and Public networks
5. Or create a rule for port 5173

## Testing Multiple Users

### Scenario 1: Different Browsers on Same Computer
- Chrome: `http://localhost:5173/`
- Firefox: `http://localhost:5173/`
- Edge: `http://localhost:5173/`
- Each browser maintains separate session

### Scenario 2: Different Devices on Network
- Computer 1: `http://192.168.0.114:5173/`
- Computer 2: `http://192.168.0.114:5173/`
- Tablet: `http://192.168.0.114:5173/`
- Phone: `http://192.168.0.114:5173/`

### Scenario 3: Incognito/Private Windows
- Open multiple incognito windows
- Each window maintains separate session
- Login with different users in each window

## Features Available

### All Users
- ✅ Dashboard with role-specific statistics
- ✅ File management and tracking
- ✅ Document upload and management
- ✅ Notifications system
- ✅ Personal history (petty cash & leave)

### Role-Specific Features

**Documentation Officer**:
- File opening and management
- Transport mode tracking (SEA, AIR, ROAD, RAIL)
- Document attachment

**Declaration Manager**:
- File assignment to declarants
- Petty cash approvals
- Declaration oversight

**HR Manager**:
- User registration and management
- Leave request approvals
- Driver management

**Operations Manager**:
- Operations oversight
- Petty cash approvals
- File tracking

**Finance Manager**:
- Petty cash approvals
- Financial oversight

**Cashier**:
- Payment processing
- Petty cash disbursement

**And more for all 16 roles...**

## System Performance

### Optimizations Applied
- ✅ Eliminated infinite re-render loops
- ✅ Implemented store caching
- ✅ Optimized React component rendering
- ✅ Stable array references
- ✅ Efficient state management

### Expected Performance
- Fast page loads (< 1 second)
- Smooth navigation
- No console errors
- Responsive interface
- Stable operation

## Troubleshooting

### Can't Access Locally
1. Check if server is running (see terminal output)
2. Try `http://127.0.0.1:5173/` instead
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh (Ctrl+F5)

### Can't Access from Network
1. Verify both devices on same network
2. Check Windows Firewall settings
3. Ping the server IP: `ping 192.168.0.114`
4. Try accessing from server computer first
5. Ensure no VPN is blocking local network

### Page Loads Slowly
1. Clear browser cache
2. Check network connection
3. Restart the development server
4. Check for console errors

### Login Issues
1. Verify credentials are correct
2. Check caps lock is off
3. Try a different user account
4. Clear browser cookies

## Support

### For Technical Issues
- Check browser console for errors (F12)
- Verify server is running in terminal
- Check network connectivity
- Review firewall settings

### For Feature Questions
- Refer to user role documentation
- Check the comprehensive guides
- Review the implementation status documents

## Next Steps

1. **Access the system** using the links above
2. **Login** with appropriate credentials
3. **Test features** for your role
4. **Report any issues** if encountered
5. **Enjoy** the optimized, stable system!

---

**Last Updated**: March 14, 2026
**Server Status**: ✅ Running and Stable
**Version**: Latest with all optimizations applied