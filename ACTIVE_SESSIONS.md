# 🎯 Active Development Sessions

## ✅ All 5 Sessions Running!

### 📱 Session URLs

| Session | URL | Status | Suggested User |
|---------|-----|--------|----------------|
| **1** | **http://localhost:5173** | ✅ Running | Documentation Officer (John Smith) |
| **2** | **http://localhost:5174** | ✅ Running | HR Manager (Daniel Clark) |
| **3** | **http://localhost:5175** | ✅ Running | Operations Manager (James Wilson) |
| **4** | **http://localhost:5176** | ✅ Running | COO (Robert Taylor) |
| **5** | **http://localhost:5177** | ✅ Running | Finance Manager (Lisa Anderson) |

---

## 🔐 Quick Login Reference

**All passwords:** `password123`

### Session 1 - Documentation Officer
- **URL:** http://localhost:5173
- **Email:** `documentation_officer@company.com`
- **Name:** John Smith
- **Role:** Create petty cash requests

### Session 2 - HR Manager
- **URL:** http://localhost:5174
- **Email:** `hr_manager@company.com`
- **Name:** Daniel Clark
- **Role:** Approve HR-related requests

### Session 3 - Operations Manager
- **URL:** http://localhost:5175
- **Email:** `operations_manager@company.com`
- **Name:** James Wilson
- **Role:** Approve operations requests

### Session 4 - COO
- **URL:** http://localhost:5176
- **Email:** `coo@company.com`
- **Name:** Robert Taylor
- **Role:** Final approval authority

### Session 5 - Finance Manager
- **URL:** http://localhost:5177
- **Email:** `finance_manager@company.com`
- **Name:** Lisa Anderson
- **Role:** Process payments

---

## 🔄 Test Workflow

### Complete Petty Cash Approval Flow:

1. **Session 1** → Create request (Documentation Officer)
2. **Session 2** → Approve request (HR Manager)
3. **Session 4** → Final approve (COO)
4. **Session 5** → Process payment (Finance Manager)
5. **Session 5** → Switch to Cashier and mark as paid

---

## 💡 Pro Tips

- ✅ Each session has **isolated localStorage**
- ✅ Open each URL in a **different browser window**
- ✅ Use **incognito/private windows** for better isolation
- ✅ Check **notifications** in each session
- ✅ Watch the **console** for debug info (F12)

---

## 🛑 Stop All Sessions

To stop all running servers, run:
```bash
# Kill all node processes (use with caution)
pkill -f "vite --port"
```

Or close each terminal individually.

---

## 🔄 Restart Sessions

If you need to restart:
```bash
cd app
./start-multiple-sessions.sh
```

---

**Last Updated:** $(date)
**System:** DOW ELEF Management System
**Version:** Latest with Smart Notifications & Timeline
