# 🚀 START THE SERVER - FOLLOW THESE STEPS

## The server is NOT running. You need to start it manually.

### Step 1: Open Command Prompt
1. Press `Windows Key + R`
2. Type: `cmd`
3. Press Enter

### Step 2: Navigate to the app folder
Copy and paste this command:
```
cd C:\Users\user\Desktop\testproject\app
```

### Step 3: Start the server
Copy and paste this command:
```
npm run dev -- --host
```

### Step 4: Wait for the server to start
You'll see output like:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.0.XXX:5173/
```

### Step 5: Open your browser
Go to: **http://localhost:5173/**

---

## ⚠️ IMPORTANT: Keep the Command Prompt window open!
Don't close the CMD window - the server runs there.

---

## 🔑 Quick Login After Server Starts

**Declarant (to test tax payments):**
- Email: michael.brown@dowelef.com
- Password: password123

**Operation Clerk (to test release order workflow):**
- Email: lisa.anderson@dowelef.com
- Password: password123

---

## 🆘 If you see errors:

**"Port 5173 is already in use":**
1. Close any other terminals running the server
2. Or change the port: `npm run dev -- --host --port 5174`

**"npm is not recognized":**
1. Make sure Node.js is installed
2. Restart your computer
3. Try again

---

## ✅ What to Test After Starting:

1. **Tax Payment Status** (as Declarant)
   - Upload tax documents
   - Click "TAX PAID"
   - Status should update to "WAITING FOR WHARFAGE PAYMENT" (SEA) or "READY FOR OPERATIONS" (AIR)

2. **Release Order Workflow** (as Operation Clerk)
   - Try to upload port charges WITHOUT release order → Should be disabled
   - Upload release order first
   - Then upload port charges → Should work
   - OPERATIONS DONE button should only show after release order uploaded

---

**All changes are saved and ready - just start the server!** 🎉
