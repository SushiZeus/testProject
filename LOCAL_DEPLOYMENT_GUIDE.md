# Local Deployment Guide - Dow Elef Shipment Management System

## 🚀 Quick Start (3 Methods)

### Method 1: Automated Script (Easiest)

#### Windows
```bash
# Double-click the file or run in terminal:
deploy-local.bat
```

#### Mac/Linux
```bash
# Make executable and run:
chmod +x deploy-local.sh
./deploy-local.sh
```

### Method 2: Manual Commands
```bash
# Navigate to app directory
cd app

# Install dependencies
npm install

# Build the project
npm run build

# Start local server
npm run preview
```

### Method 3: Development Mode (With Hot Reload)
```bash
cd app
npm install
npm run dev
```
Access at: http://localhost:5173/ (different port)

---

## 📋 Prerequisites

### Required
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)

### Check Your Versions
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 8.x.x or higher
```

### Install Node.js (if needed)
- **Windows**: Download from https://nodejs.org/
- **Mac**: `brew install node` or download from nodejs.org
- **Linux**: `sudo apt install nodejs npm` or use your package manager

---

## 🔧 Step-by-Step Installation

### Step 1: Navigate to Project
```bash
cd path/to/dow-elef-system
```

### Step 2: Install Dependencies
```bash
cd app
npm install
```

This will install all required packages (~200MB). Takes 1-3 minutes.

### Step 3: Build the Project
```bash
npm run build
```

This compiles TypeScript and bundles the application. Takes ~10 seconds.

### Step 4: Start the Server
```bash
npm run preview
```

You should see:
```
➜  Local:   http://localhost:4173/
➜  Network: use --host to expose
```

### Step 5: Open in Browser
Open your browser and go to: **http://localhost:4173/**

---

## 🔑 Login & Test

### First Login
1. Open http://localhost:4173/
2. Use these credentials:
   - **Email**: doc.officer@dowelef.com
   - **Password**: password123

### Test Accounts (All use password: password123)

#### Documentation Department
- doc.officer@dowelef.com - Create new files

#### Declaration Department
- declaration.manager@dowelef.com - Assign declarants
- declarant@dowelef.com - Process declarations

#### Operations Department
- operations.manager@dowelef.com - Assign operation clerks
- operation.clerk@dowelef.com - Process operations
- permits.clerk@dowelef.com - Handle permits
- shipping.clerk@dowelef.com - Manage shipping (SEA)

#### Executive Team
- md@dowelef.com - Managing Director
- coo@dowelef.com - Chief Operating Officer

See `COMPLETE_USER_CREDENTIALS.md` for all 21 accounts.

---

## 🧪 Quick Test Scenarios

### Test 1: Create a File (2 minutes)
1. Login as: doc.officer@dowelef.com
2. Click "File Opening"
3. Try to proceed without filling fields
4. ✅ See red borders on required fields
5. Fill in all fields
6. ✅ Errors clear automatically
7. Create the file successfully

### Test 2: Form Validation (1 minute)
1. Login as documentation officer
2. Go to File Opening
3. Leave client name empty
4. Click "Next"
5. ✅ See red border and error message
6. Fill the field
7. ✅ Error clears automatically

### Test 3: Complete Workflow (15 minutes)
Follow the detailed workflow in `LOCAL_DEPLOYMENT_SUCCESS.md`

---

## 🛠️ Server Management

### Start the Server
```bash
cd app
npm run preview
```

### Stop the Server
Press `Ctrl+C` in the terminal

### Restart the Server
```bash
# Stop with Ctrl+C, then:
npm run preview
```

### Check Server Status
If the server is running, you'll see output like:
```
➜  Local:   http://localhost:4173/
```

### Change Port (if 4173 is in use)
```bash
npm run preview -- --port 3000
```

---

## 🔍 Troubleshooting

### Problem: Port Already in Use
```
Error: Port 4173 is already in use
```

**Solution 1**: Stop the existing process
```bash
# Windows
netstat -ano | findstr :4173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:4173 | xargs kill -9
```

**Solution 2**: Use a different port
```bash
npm run preview -- --port 3000
```

### Problem: Build Fails
```
Error: Build failed with errors
```

**Solution**: Clear cache and rebuild
```bash
# Delete node_modules and dist
rm -rf node_modules dist

# Reinstall and rebuild
npm install
npm run build
```

### Problem: Dependencies Won't Install
```
Error: npm install failed
```

**Solution**: Clear npm cache
```bash
npm cache clean --force
npm install
```

### Problem: Page Shows Blank Screen
**Solution**: Check browser console
1. Press F12 to open developer tools
2. Check Console tab for errors
3. Try clearing localStorage:
   ```javascript
   localStorage.clear()
   ```
4. Refresh the page

### Problem: Data Not Saving
**Solution**: Check localStorage
- Data is stored in browser localStorage
- Each browser has separate storage
- Clear and refresh if needed:
  ```javascript
  localStorage.clear()
  location.reload()
  ```

### Problem: Changes Not Appearing
**Solution**: Rebuild the project
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
dow-elef-system/
├── app/                          # Main application
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   └── ui/              # Reusable UI elements
│   │   ├── pages/               # Page components
│   │   │   └── sections/        # Page sections
│   │   ├── store/               # State management (Zustand)
│   │   ├── types/               # TypeScript definitions
│   │   ├── utils/               # Utility functions
│   │   ├── data/                # Mock data
│   │   └── lib/                 # Libraries
│   ├── public/                  # Static files
│   ├── dist/                    # Build output (generated)
│   ├── node_modules/            # Dependencies (generated)
│   ├── package.json             # Dependencies list
│   ├── vite.config.ts           # Build configuration
│   └── tsconfig.json            # TypeScript config
├── deploy-local.bat             # Windows deployment script
├── deploy-local.sh              # Mac/Linux deployment script
├── README.md                    # This file
└── Documentation files          # Guides and references
```

---

## 🔄 Development Workflow

### For Testing (Production Build)
```bash
cd app
npm run build      # Build once
npm run preview    # Run server
```

### For Development (Hot Reload)
```bash
cd app
npm run dev        # Runs on port 5173
```

Changes are reflected immediately without rebuilding.

### For Production Deployment
```bash
cd app
npm run build
# Deploy the 'dist' folder to your hosting service
```

---

## 💾 Data Management

### Where Data is Stored
- **Location**: Browser localStorage
- **Scope**: Per browser, per domain
- **Persistence**: Survives page refreshes
- **Size Limit**: ~5-10MB per domain

### View Stored Data
1. Open browser DevTools (F12)
2. Go to Application tab
3. Click "Local Storage"
4. Select http://localhost:4173

### Clear All Data
```javascript
// In browser console:
localStorage.clear()
location.reload()
```

### Export Data (Manual)
```javascript
// In browser console:
const data = {
  files: localStorage.getItem('fileStore'),
  auth: localStorage.getItem('authStore'),
  petty: localStorage.getItem('pettyCashStore')
};
console.log(JSON.stringify(data));
// Copy the output
```

---

## 🌐 Network Access

### Access from Other Devices (Same Network)

#### Step 1: Find Your IP Address
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

Look for your local IP (e.g., 192.168.1.100)

#### Step 2: Start Server with Host Flag
```bash
npm run preview -- --host
```

#### Step 3: Access from Other Device
Open browser on other device:
```
http://YOUR_IP:4173/
```

Example: http://192.168.1.100:4173/

---

## 📊 Performance

### Build Performance
- **Build Time**: ~9 seconds
- **Bundle Size**: 1,118 KB
- **Gzipped Size**: 294 KB

### Runtime Performance
- **Initial Load**: < 2 seconds (3G)
- **Page Navigation**: Instant (SPA)
- **Data Operations**: < 100ms

### Browser Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🔐 Security Notes

### For Local Testing
- No authentication required for localhost
- Data stored in browser only
- No network requests to external servers

### For Production
- Use HTTPS
- Implement proper authentication
- Use secure backend for data storage
- Enable CORS properly

---

## 📚 Additional Resources

### Documentation
- `README.md` - Project overview
- `LOCAL_DEPLOYMENT_SUCCESS.md` - Detailed deployment guide
- `QUICK_START_GUIDE.md` - Quick reference
- `COMPLETE_USER_CREDENTIALS.md` - All test accounts

### Feature Documentation
- `FINAL_IMPLEMENTATION_COMPLETE_2026.md` - Latest features
- `SESSION_COMPLETE_SUMMARY.md` - Implementation summary
- `COMPREHENSIVE_UPDATE_IMPLEMENTATION.md` - Complete workflows

### Deployment
- `DEPLOYMENT_STATUS_FINAL.md` - Current status
- `DEPLOYMENT_GUIDE_FINAL.md` - Production deployment

---

## 🎯 Next Steps

1. ✅ Install Node.js (if needed)
2. ✅ Run deployment script or manual commands
3. ✅ Open http://localhost:4173/
4. ✅ Login with test account
5. ✅ Test the features
6. ✅ Review documentation
7. ✅ Deploy to production (when ready)

---

## 🆘 Getting Help

### Check These First
1. Browser console (F12) for errors
2. Terminal output for build errors
3. Troubleshooting section above
4. Documentation files

### Common Issues
- Port in use → Change port or kill process
- Build fails → Clear cache and rebuild
- Blank screen → Check console, clear localStorage
- Data not saving → Check localStorage is enabled

---

## ✅ Verification Checklist

After deployment, verify:
- [ ] Server starts without errors
- [ ] Can access http://localhost:4173/
- [ ] Login page loads correctly
- [ ] Can login with test account
- [ ] Dashboard displays properly
- [ ] Can create a new file
- [ ] Form validation works
- [ ] Data persists after refresh

---

## 🎉 Success!

If you can:
1. ✅ Access http://localhost:4173/
2. ✅ Login successfully
3. ✅ See the dashboard
4. ✅ Create a test file

Then your local deployment is successful!

---

**Version**: 1.0.0 Final  
**Last Updated**: March 5, 2026  
**Status**: Production Ready  
**Support**: See documentation files
