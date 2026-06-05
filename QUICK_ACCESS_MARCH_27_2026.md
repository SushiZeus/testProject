# Quick Access Guide - March 27, 2026

## 🚀 Start Server

Open Command Prompt (CMD) and run:
```cmd
cd C:\Users\user\Desktop\testproject\app
npm run dev -- --host
```

Wait for the server to show the network URLs, then use them below.

---

## 🌐 Access URLs

Replace `[YOUR-IP]` with the IP shown in the terminal (e.g., 192.168.0.114)

### Local Access
- http://localhost:5173/

### Network Access (for mobile/other devices)
- http://[YOUR-IP]:5173/

### Utility Pages
- Cache Test: http://localhost:5173/cache-test.html
- Reset All Data: http://localhost:5173/reset-all-data.html
- Reset Petty Cash: http://localhost:5173/reset-petty-cash.html
- Sessions Manager: http://localhost:5173/sessions.html

---

## 👥 Quick Login Credentials

All passwords: `password123`

| Role | Email |
|------|-------|
| Documentation Officer | doc.officer@dowelef.com |
| Declaration Manager | dec.manager@dowelef.com |
| Declarant | michael.brown@dowelef.com |
| Operations Manager | ops.manager@dowelef.com |
| Operation Clerk | lisa.anderson@dowelef.com |
| Permits Clerk | permits.clerk@dowelef.com |
| Shipping Line Clerk | shipping.clerk@dowelef.com |
| Delivery Clerk | delivery.clerk@dowelef.com |
| Finance Manager | finance.manager@dowelef.com |
| Cashier | cashier@dowelef.com |
| HR Manager | hr.manager@dowelef.com |

---

## ✨ Today's Updates (March 27, 2026)

### Tax Payment Status Fix
✅ Tax and wharfage payments now update file status correctly
✅ Clear status names: "WAITING FOR WHARFAGE PAYMENT"

### Release Order Workflow
✅ Release order required before port/Swissport charges
✅ OPERATIONS DONE button only shows with release order
✅ Disabled buttons with helpful tooltips

### New Statuses
- WAITING FOR RELEASE ORDER
- WAITING FOR WHARFAGE PAYMENT
- OPERATIONS DONE

---

## 🔄 Clear Browser Cache

**Chrome/Edge:** `Ctrl + Shift + Delete` → Clear cached images and files

**Firefox:** `Ctrl + Shift + Delete` → Clear cache

---

## 📋 Test Workflow

1. **Declaration (SEA)**
   - Login as: michael.brown@dowelef.com
   - Upload tax docs → Click TAX PAID
   - Upload wharfage docs → Click WHARFAGE PAID
   - Status should be: READY FOR OPERATIONS

2. **Operations (SEA)**
   - Login as: lisa.anderson@dowelef.com
   - Upload release order first
   - Then upload port charges
   - Click PORT CHARGES PAID
   - Click OPERATIONS DONE (only shows if release order uploaded)

3. **Operations (AIR)**
   - Login as: lisa.anderson@dowelef.com
   - Upload release order first
   - Then upload Swissport charges
   - Click SWISSPORT CHARGES PAID
   - Click CARGO CLEARED

---

## 📁 Documentation Files

- `SYSTEM_DEPLOYMENT_MARCH_27_2026.md` - Full deployment guide
- `TAX_PAYMENT_STATUS_FIX_MARCH_27.md` - Tax payment fix details
- `WORKFLOW_ENHANCEMENTS_MARCH_27.md` - Workflow changes
- `RELEASE_ORDER_WORKFLOW_FIX_MARCH_27.md` - Release order enforcement

---

## 🆘 Troubleshooting

**Server won't start?**
- Check if port 5173 is already in use
- Try: `netstat -ano | findstr :5173`
- Kill the process if needed

**Changes not showing?**
- Clear browser cache completely
- Try incognito/private mode
- Hard refresh: `Ctrl + F5`

**PowerShell errors?**
- Use Command Prompt (CMD) instead
- Or run: `powershell -ExecutionPolicy Bypass -Command "npm run dev -- --host"`

---

All changes saved and ready to use! 🎉
