# Development Server Running - March 14, 2026

## ✅ Server Status: RUNNING

The development server has been successfully started with network access enabled.

---

## Access URLs

### Local Access (Same Computer)
```
http://localhost:5174/
```

### Network Access (Other Devices)
```
http://192.168.0.114:5174/
```

**Note**: Port changed from 5173 to 5174 because port 5173 was already in use.

---

## How to Access

### On This Computer:
1. Open your browser
2. Go to: `http://localhost:5174/`
3. Login with test credentials

### On Other Devices (Phone, Tablet, Another Computer):
1. Make sure the device is on the same WiFi network
2. Open browser on that device
3. Go to: `http://192.168.0.114:5174/`
4. Login with test credentials

---

## Test User Credentials

### Documentation Officer
- Email: `doc@dowelef.com`
- Password: `password123`

### Declaration Manager
- Email: `decl.manager@dowelef.com`
- Password: `password123`

### Declarant
- Email: `declarant@dowelef.com`
- Password: `password123`

### Operations Manager
- Email: `ops.manager@dowelef.com`
- Password: `password123`

### Operation Clerk
- Email: `ops.clerk@dowelef.com`
- Password: `password123`

### Commercial Manager
- Email: `commercial@dowelef.com`
- Password: `password123`

### Managing Director
- Email: `md@dowelef.com`
- Password: `password123`

See `SYSTEM_USER_CREDENTIALS.md` for complete list of all users.

---

## What to Test

### 1. Client Details Visibility
- Login as Declaration Manager → Client details should NOT be visible
- Login as Documentation Officer → Client details SHOULD be visible

### 2. Mark All Read Button
- Have unread notifications
- Click "Mark all read" in notifications dropdown
- All notifications should be marked as read

### 3. Documents in Database
- Login as Documentation Officer
- Create a new file with documents
- Go to Documents module
- Documents should appear in the list

### 4. Tax/Wharfage Independence
- Login as Declarant
- Upload tax documents
- TAX PAID button should appear immediately
- Click TAX PAID (without uploading wharfage)
- Tax payment should be confirmed

### 5. Operations Dashboard
- Check WAITING tile (files waiting for assignment)
- Check IN PROGRESS tile (files assigned and acknowledged)
- Check COMPLETED tile (files with driver assigned)

---

## Server Management

### To Stop the Server:
The server is running in the background. If you need to stop it, let me know.

### To Restart the Server:
If you need to restart after making changes, let me know.

---

## Troubleshooting

### If URLs Don't Work:

1. **Check if server is running**: Look for the Vite output above
2. **Try refreshing the page**: Press Ctrl+F5 (hard refresh)
3. **Clear browser cache**: 
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Edge: Ctrl+Shift+Delete
4. **Check firewall**: Make sure Windows Firewall allows the connection
5. **Check WiFi**: Make sure all devices are on the same network

### If Port 5174 Doesn't Work:
The server might have chosen a different port. Check the terminal output for the actual port number.

---

## Important Notes

- ✅ All 5 fixes have been implemented and saved
- ✅ Server is running with network access
- ✅ No compilation errors
- ✅ Ready for testing
- 🔄 Changes take effect immediately (no restart needed for most changes)
- 💾 Data is stored in browser localStorage (persists across sessions)

---

## Quick Links

- Local: http://localhost:5174/
- Network: http://192.168.0.114:5174/

**Server Started**: March 14, 2026
**Status**: ✅ Running
**Port**: 5174
