# ⚠️ RESTART SERVER TO SEE CHANGES

## The changes ARE saved, but the server needs to be restarted!

Your browser is still running the OLD code. Follow these steps:

---

## Step 1: Stop the Current Server

In the Command Prompt window where the server is running:
1. Press `Ctrl + C` (this stops the server)
2. Wait for it to stop completely

---

## Step 2: Clear Browser Cache

Before restarting, clear your browser cache:

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"

**Or just use Incognito/Private mode** (easier!)

---

## Step 3: Restart the Server

In the same Command Prompt window, run:
```cmd
npm run dev -- --host
```

Wait for it to show:
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.0.XXX:5173/
```

---

## Step 4: Refresh Your Browser

1. Go to: http://localhost:5173/
2. Press `Ctrl + F5` (hard refresh)
3. Or close and reopen the browser tab

---

## ✅ Test the Fix

Login as: michael.brown@dowelef.com (password: password123)

### For SEA Shipment:
1. Upload tax documents
2. Click "TAX PAID" 
   - ✅ Status should STAY at "WAITING FOR TAX PAYMENT"
   - ✅ Toast: "Tax payment confirmed - Upload wharfage documents and confirm payment"
3. Upload wharfage documents
4. Click "WHARFAGE PAID"
   - ✅ Status should STAY at "WAITING FOR TAX PAYMENT"
   - ✅ Toast: "Wharfage payment confirmed - Click DECLARATION DONE when ready"
5. Click "DECLARATION DONE" (should now be blue/enabled)
   - ✅ NOW status changes to "READY FOR OPERATIONS"
   - ✅ Toast: "Declaration complete - Status: READY FOR OPERATIONS"

---

## 🔍 If Changes Still Don't Show:

1. **Make sure you stopped the old server** (Ctrl + C)
2. **Clear browser cache completely** or use Incognito mode
3. **Hard refresh** the page (Ctrl + F5)
4. **Check the Command Prompt** - make sure the new server started successfully

---

## 📝 What Was Changed:

The code in `app/src/pages/DeclarationPage.tsx` was updated:

- `handleTaxPaid()` - Now keeps status unchanged, only marks tax as paid
- `handleWharfagePaid()` - Now keeps status unchanged, only marks wharfage as paid
- Status only changes when "DECLARATION DONE" button is clicked

---

**The changes ARE in the code - you just need to restart the server!** 🔄
