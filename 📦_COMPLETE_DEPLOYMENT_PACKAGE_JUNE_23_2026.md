# 📦 COMPLETE DEPLOYMENT PACKAGE - JUNE 23, 2026

## Complete Guide to Deploy and Run in Any Environment

This document contains everything needed to deploy and run the Customs Clearance Management System in a new environment.

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Project Structure](#project-structure)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [User Accounts](#user-accounts)
8. [Features Documentation](#features-documentation)
9. [Troubleshooting](#troubleshooting)
10. [GitHub Repository](#github-repository)

---

## 🎯 SYSTEM OVERVIEW

**Application**: Customs Clearance Management System  
**Version**: 1.3.2  
**Date**: June 23, 2026  
**Technology Stack**:
- Frontend: React + TypeScript + Vite
- State Management: Zustand
- UI Framework: Tailwind CSS + shadcn/ui
- Storage: LocalStorage (client-side)
- Build Tool: Vite
- Package Manager: npm

**Purpose**: Complete customs clearance workflow management from file opening through declaration, operations, delivery, and driver assignment.

---

## ⚙️ PREREQUISITES

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (optional, for cloning)
   - Download: https://git-scm.com/
   - Verify installation: `git --version`

### System Requirements

- **Operating System**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 500MB for project + dependencies
- **Browser**: Chrome, Firefox, Edge, or Safari (latest versions)

---

## 📥 INSTALLATION STEPS

### Option 1: Clone from GitHub

```bash
# Clone the repository
git clone https://github.com/SushiZeus/testProject.git

# Navigate to project directory
cd testProject

# Navigate to app directory
cd app

# Install dependencies
npm install

# Start development server
npm run dev -- --host
```

### Option 2: Download ZIP

1. Go to: https://github.com/SushiZeus/testProject
2. Click "Code" → "Download ZIP"
3. Extract ZIP file to desired location
4. Open terminal/command prompt
5. Navigate to extracted folder:
   ```bash
   cd path/to/testProject/app
   ```
6. Install dependencies:
   ```bash
   npm install
   ```
7. Start server:
   ```bash
   npm run dev -- --host
   ```

### Option 3: Fresh Setup (Manual)

If you need to set up from scratch:

```bash
# Create project directory
mkdir customs-clearance-system
cd customs-clearance-system

# Initialize Vite project
npm create vite@latest app -- --template react-ts

# Navigate to app
cd app

# Install dependencies
npm install

# Install additional packages
npm install zustand lucide-react sonner date-fns
npm install -D tailwindcss postcss autoprefixer
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install class-variance-authority clsx tailwind-merge

# Initialize Tailwind
npx tailwindcss init -p

# Copy source files from GitHub repository
# (Download and place all files from app/src/)

# Start server
npm run dev -- --host
```

---

## 📁 PROJECT STRUCTURE

```
testProject/
├── app/                          # Main application folder
│   ├── src/                      # Source code
│   │   ├── components/          # React components
│   │   │   └── ui/              # UI components (shadcn)
│   │   ├── layouts/             # Layout components
│   │   │   └── DashboardLayout.tsx
│   │   ├── pages/               # Page components
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── FileOpeningPage.tsx
│   │   │   ├── DeclarationPage.tsx
│   │   │   ├── OperationsPage.tsx
│   │   │   ├── DeliveryPage.tsx
│   │   │   ├── ShippingLinePage.tsx
│   │   │   ├── PettyCashPage.tsx
│   │   │   ├── LeaveManagementPage.tsx
│   │   │   ├── DriverManagementPage.tsx
│   │   │   ├── DriversPage.tsx
│   │   │   └── [other pages...]
│   │   ├── store/               # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── fileStore.ts
│   │   │   ├── leaveStore.ts
│   │   │   ├── pettyCashStore.ts
│   │   │   ├── notificationStore.ts
│   │   │   └── [other stores...]
│   │   ├── types/               # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/               # Utility functions
│   │   ├── data/                # Mock data
│   │   │   └── mockData.ts
│   │   ├── lib/                 # Library functions
│   │   ├── App.tsx              # Main app component
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── public/                   # Static assets
│   ├── index.html               # HTML template
│   ├── package.json             # Dependencies
│   ├── package-lock.json        # Dependency lock file
│   ├── vite.config.ts           # Vite configuration
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── postcss.config.js        # PostCSS configuration
│   ├── tsconfig.json            # TypeScript configuration
│   └── components.json          # shadcn configuration
├── Documentation Files          # Multiple .md and .txt files
└── README.md                    # Project readme

```

---

## 🔧 CONFIGURATION

### 1. Environment Variables (Optional)

Create `.env` file in `app/` directory if needed:

```env
# API URLs (if using external APIs)
VITE_API_URL=http://localhost:3000/api

# Other configurations
VITE_APP_NAME=Customs Clearance System
```

### 2. Vite Configuration

File: `app/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true, // Enable network access
  },
})
```

### 3. Tailwind Configuration

File: `app/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 4. Package.json Scripts

File: `app/package.json`

```json
{
  "name": "customs-clearance-system",
  "private": true,
  "version": "1.3.2",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0",
    "lucide-react": "^0.344.0",
    "sonner": "^1.4.0",
    "date-fns": "^3.3.1",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.56",
    "@types/react-dom": "^18.2.19",
    "@typescript-eslint/eslint-plugin": "^7.0.2",
    "@typescript-eslint/parser": "^7.0.2",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.4"
  }
}
```

---

## 🚀 RUNNING THE APPLICATION

### Development Mode

#### Windows (Command Prompt):
```cmd
cd path\to\testProject\app
npm run dev -- --host
```

#### Windows (PowerShell - if allowed):
```powershell
cd path\to\testProject\app
npm run dev -- --host
```

#### macOS/Linux:
```bash
cd path/to/testProject/app
npm run dev -- --host
```

### Access the Application

After starting the server, you'll see:

```
  VITE v5.1.4  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

**Access URLs**:
- **Local**: http://localhost:5173/
- **Network**: http://192.168.x.x:5173/ (replace with your IP)

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The build output will be in `app/dist/` directory.

---

## 👥 USER ACCOUNTS

### Complete User List (28 Accounts)

#### Password Pattern
All passwords follow: `{role}123`

Example: `declarant@company.com` → password: `declarant123`

### Accounts by Department

#### 📋 Documentation (1 user)
```
Email: documentation_officer@company.com
Password: documentation_officer123
Role: File Opening
```

#### 📝 Declaration (4 users)
```
Manager:
  Email: declaration_manager@company.com
  Password: declaration_manager123

Declarants:
  Email: declarant@company.com / Password: declarant123
  Email: declarant2@company.com / Password: declarant123
  Email: declarant3@company.com / Password: declarant123
```

#### 📦 Operations (7 users)
```
Manager:
  Email: operations_manager@company.com
  Password: operations_manager123

Operation Clerks:
  Email: operation_clerk@company.com / Password: operation_clerk123
  Email: operation_clerk2@company.com / Password: operation_clerk123
  Email: operation_clerk3@company.com / Password: operation_clerk123

Permits Clerk:
  Email: permits_clerk@company.com / Password: permits_clerk123

Shipping Line Clerk:
  Email: shipping_line_clerk@company.com / Password: shipping_line_clerk123

Delivery Clerk:
  Email: delivery_clerk@company.com / Password: delivery_clerk123
```

#### 💰 Finance (2 users)
```
Manager:
  Email: finance_manager@company.com
  Password: finance_manager123

Cashier:
  Email: cashier@company.com
  Password: cashier123
```

#### 👥 HR (1 user)
```
Email: hr_manager@company.com
Password: hr_manager123
```

#### 🚚 Transport (7 users)
```
Manager:
  Email: transport_manager@company.com
  Password: transport_manager123

Drivers (6):
  Email: driver@company.com / Password: driver123
  Email: driver2@company.com / Password: driver123
  Email: driver3@company.com / Password: driver123
  Email: driver4@company.com / Password: driver123
  Email: driver5@company.com / Password: driver123
  Email: driver6@company.com / Password: driver123
```

#### 🏢 Management (3 users)
```
Commercial Manager:
  Email: commercial_manager@company.com
  Password: commercial_manager123

COO:
  Email: coo@company.com
  Password: coo123

Managing Director:
  Email: managing_director@company.com
  Password: managing_director123
```

#### 🔧 Administration (2 users)
```
Contact Person:
  Email: contact_person@company.com
  Password: contact_person123

Administrator:
  Email: administrator@company.com
  Password: administrator123
```

---

## 📚 FEATURES DOCUMENTATION

### Core Modules

#### 1. **File Opening**
- Documentation officer creates new files
- Client management
- Document upload
- Service type selection (Clearance, Document Handover, Transportation)
- Transport mode (Air, Sea, Road, Rail)

#### 2. **Declaration Module**
- Manager assigns declarants
- Declarant processes files
- Tax and wharfage document upload
- Payment confirmation (TAX PAID, WHARFAGE PAID buttons)
- Status tracking through declaration process
- **Latest Fix**: Payment buttons now preserve status and set flags

#### 3. **Operations Module**
- Manager assigns operation clerks
- Release order upload
- Port charges/Swissport charges processing
- Payment confirmation buttons
- Cargo verification form (mandatory before delivery)
- **Latest Fix**: Port/Swissport payment buttons preserve status
- **New Feature**: OPERATIONS DONE button after verification routes to delivery

#### 4. **Delivery Module** ✨ NEW
- Delivery clerk views ready files
- REQUEST DRIVER button with truck size selection
- Two options: Small Truck 🚙 or Big Truck 🚛
- Smart routing:
  - Small trucks → HR Manager assigns
  - Big trucks → Transport Manager assigns
- File status tracking through delivery

#### 5. **Driver Management**
- HR Manager handles small truck assignments
- Transport Manager handles big truck assignments
- Driver receives notifications
- Status updates: Assigned → Collecting → Collected → Delivered

#### 6. **Petty Cash Management**
- Request creation with file association
- Multi-level approval workflow
- HR Manager → Department Manager → COO → Finance
- Payment processing by cashier

#### 7. **Leave Management**
- Leave request creation (8 types)
- HR Manager approval/rejection
- **Latest Fix**: ALL leave types deduct from annual 28-day balance
- Leave types: Annual, Sick, Emergency, Unpaid, Maternity, Paternity, Compassionate, Study

#### 8. **Shipping Line Module**
- SEA shipment specific operations
- Delivery order processing
- ETA/ETB tracking
- HBL/MBL number management

#### 9. **User Management**
- HR Manager manages all users
- Role assignment
- Active/inactive status
- Department organization

#### 10. **Notifications System**
- Real-time notifications for all users
- Role-based alerts
- File status updates
- Assignment notifications
- Action required alerts

###Latest Features (June 23, 2026)

#### ✅ Payment Confirmation System
- Tax, wharfage, port charges, swissport payment buttons
- Status preserved during confirmation
- Flags set to enable next workflow steps
- Clear visual feedback with ✓ checkmarks

#### ✅ Complete Delivery Workflow
- Delivery clerk dashboard
- REQUEST DRIVER with truck size selection
- Intelligent routing to appropriate manager
- Driver assignment and tracking

#### ✅ Leave Balance Correction
- ALL leave types now deduct from annual balance
- Simplified tracking (one balance instead of multiple)
- 28-day total allocation regardless of leave type

---

## 🔄 COMPLETE WORKFLOW

### End-to-End Process

**1. File Opening**
```
Documentation Officer
→ Create file with client details
→ Upload documents
→ Status: WAITING_FOR_DECLARATION
```

**2. Declaration Assignment**
```
Declaration Manager
→ Review file
→ Assign to declarant
→ Status: ASSIGNED_TO_DECLARANT
```

**3. Declaration Processing**
```
Declarant
→ Acknowledge file
→ Upload tax documents
→ Click TAX PAID (blue) ✓
→ [SEA] Upload wharfage, click WHARFAGE PAID (blue) ✓
→ Click DECLARATION DONE (green)
→ Status: READY_FOR_OPERATIONS
```

**4. Operations Assignment**
```
Operations Manager
→ Review file
→ Assign to operation clerk
→ Status: RECEIVED_BY_CLERK
```

**5. Operations Processing**
```
Operation Clerk
→ Upload release order
→ Upload port charges (SEA) or swissport (AIR)

Finance Manager/Cashier
→ Click PORT CHARGES PAID or SWISSPORT PAID (blue) ✓

Operation Clerk
→ Click OPERATIONS DONE (green)
→ Fill cargo verification form
→ Click OPERATIONS DONE (blue)
→ Status: DRIVER_REQUESTED
```

**6. Delivery Request**
```
Delivery Clerk
→ See file in delivery module
→ Click REQUEST DRIVER (purple)
→ Select truck size: Small 🚙 or Big 🚛
→ Notification sent to appropriate manager
```

**7. Driver Assignment**
```
HR Manager (small) or Transport Manager (big)
→ Receive notification
→ View available drivers
→ Assign driver to file
→ Driver receives notification
```

**8. Delivery Execution**
```
Driver
→ Accept assignment
→ Collect cargo from ICD/Airport
→ Update status: Collecting → Collected
→ Deliver to client
→ Status: DELIVERED_TO_CLIENT ✓
```

---

## 🐛 TROUBLESHOOTING

### Common Issues and Solutions

#### Issue 1: npm install fails
**Error**: `EACCES` or permission errors

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try install again
npm install

# If still failing, use sudo (Linux/Mac)
sudo npm install
```

#### Issue 2: Port 5173 already in use
**Error**: `Port 5173 is already in use`

**Solution**:
```bash
# Find process using port 5173
# Windows:
netstat -ano | findstr :5173

# Mac/Linux:
lsof -i :5173

# Kill the process and restart
# Or change port in vite.config.ts
```

#### Issue 3: Cannot access from network
**Problem**: Other devices can't access http://192.168.x.x:5173/

**Solution**:
- Ensure server started with `--host` flag
- Check firewall settings
- Verify all devices on same network
- Try accessing with server's IP address

#### Issue 4: Changes not visible after update
**Problem**: Code changes don't appear in browser

**Solution**:
```bash
# Stop server (Ctrl+C)
# Clear browser cache (Ctrl+Shift+Delete)
# Restart server
npm run dev -- --host

# Hard refresh browser (Ctrl+F5 or Ctrl+Shift+R)
```

#### Issue 5: TypeScript errors
**Error**: TypeScript compilation errors

**Solution**:
```bash
# Check tsconfig.json is present
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# If errors persist, check types are installed
npm install --save-dev @types/react @types/react-dom
```

#### Issue 6: Build fails
**Error**: Build process fails

**Solution**:
```bash
# Clear build cache
rm -rf dist

# Try build again
npm run build

# Check for TypeScript errors
npm run lint
```

### Getting Help

1. Check console for errors (F12 in browser)
2. Review server terminal output
3. Verify all dependencies installed
4. Ensure Node.js version is 18+
5. Check GitHub issues: https://github.com/SushiZeus/testProject/issues

---

## 🔗 GITHUB REPOSITORY

**Repository**: https://github.com/SushiZeus/testProject  
**Branch**: main  
**Latest Commit**: 4a0acaa  
**Clone URL**: https://github.com/SushiZeus/testProject.git

### Quick Clone and Run

```bash
# Clone repository
git clone https://github.com/SushiZeus/testProject.git

# Navigate to app
cd testProject/app

# Install dependencies
npm install

# Start server
npm run dev -- --host

# Access application
# Open browser: http://localhost:5173/
```

---

## 📝 ADDITIONAL NOTES

### Data Storage
- All data stored in browser LocalStorage
- No backend/database required
- Data persists across sessions
- Clear browser data to reset

### Network Access
- Server must start with `--host` flag for network access
- Firewall may block access - add exception for Node.js
- All devices must be on same network

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE: Not supported

### Mobile Access
- Responsive design included
- Access via network URL: http://192.168.x.x:5173/
- Touch-friendly interface
- Same functionality as desktop

---

## ✅ DEPLOYMENT CHECKLIST

Before deploying to new environment:

- [ ] Install Node.js (v18+)
- [ ] Install npm
- [ ] Clone or download project
- [ ] Navigate to app directory
- [ ] Run `npm install`
- [ ] Verify no errors in installation
- [ ] Run `npm run dev -- --host`
- [ ] Access http://localhost:5173/
- [ ] Test login with any user account
- [ ] Verify network access works
- [ ] Test on mobile device (if needed)
- [ ] Review documentation files
- [ ] Bookmark access URL

---

## 🎯 QUICK START SUMMARY

```bash
# 1. Get the code
git clone https://github.com/SushiZeus/testProject.git
cd testProject/app

# 2. Install
npm install

# 3. Run
npm run dev -- --host

# 4. Access
http://localhost:5173/

# 5. Login
Email: administrator@company.com
Password: administrator123
```

---

## 📞 SUPPORT

For issues or questions:
1. Check documentation files in project root
2. Review GitHub repository README
3. Check browser console for errors
4. Verify all prerequisites met
5. Review troubleshooting section

---

**Version**: 1.3.2  
**Last Updated**: June 23, 2026  
**Status**: Production Ready ✅

---

This deployment package contains everything needed to run the Customs Clearance Management System in any environment. Follow the steps above for successful deployment.

