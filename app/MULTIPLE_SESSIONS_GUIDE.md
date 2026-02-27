# 🚀 Multiple Sessions Guide

This guide explains how to run multiple instances of the DOW ELEF Management System simultaneously for testing different user roles.

## 📋 Quick Start

### Option 1: Automated Script (Recommended)

**Linux/Mac:**
```bash
cd app
./start-multiple-sessions.sh
```

**Windows:**
```cmd
cd app
start-multiple-sessions.bat
```

### Option 2: Manual Start

Open 5 separate terminal windows and run:

**Terminal 1:**
```bash
cd app
npm run dev:5173
```

**Terminal 2:**
```bash
cd app
npm run dev:5174
```

**Terminal 3:**
```bash
cd app
npm run dev:5175
```

**Terminal 4:**
```bash
cd app
npm run dev:5176
```

**Terminal 5:**
```bash
cd app
npm run dev:5177
```

## 🌐 Access URLs

Once started, you can access the application at:

1. **Session 1:** http://localhost:5173
2. **Session 2:** http://localhost:5174
3. **Session 3:** http://localhost:5175
4. **Session 4:** http://localhost:5176
5. **Session 5:** http://localhost:5177

## 👥 Suggested User Setup

For testing the petty cash workflow, open each URL in a different browser window and log in as:

| Port | URL | Suggested User | Role | Purpose |
|------|-----|----------------|------|---------|
| 5173 | http://localhost:5173 | John Smith | Documentation Officer | Create petty cash requests |
| 5174 | http://localhost:5174 | Daniel Clark | HR Manager | Approve HR requests |
| 5175 | http://localhost:5175 | James Wilson | Operations Manager | Approve operations requests |
| 5176 | http://localhost:5176 | Robert Taylor | COO | Final approval |
| 5177 | http://localhost:5177 | Lisa Anderson | Finance Manager | Process payments |

## 🔐 Login Credentials

All users have the same password: `password123`

**Key Users:**
- `documentation_officer@company.com` - John Smith (Creates requests)
- `hr_manager@company.com` - Daniel Clark (HR Approval)
- `operations_manager@company.com` - James Wilson (Operations Approval)
- `coo@company.com` - Robert Taylor (Final Approval)
- `finance_manager@company.com` - Lisa Anderson (Payment Processing)
- `cashier@company.com` - Patricia Martinez (Payment Execution)

## 💡 Testing Workflow

### Complete Petty Cash Request Flow:

1. **Session 1 (Documentation Officer):**
   - Create a new petty cash request
   - Request goes to HR Manager

2. **Session 2 (HR Manager):**
   - See notification for new request
   - Review and approve the request
   - Request goes to COO

3. **Session 4 (COO):**
   - See notification for approval needed
   - Review and approve the request
   - Request goes to Finance Manager

4. **Session 5 (Finance Manager):**
   - See notification for payment processing
   - Process the request
   - Request goes to Cashier

5. **Session 5 (Switch to Cashier):**
   - Log out and log in as Cashier
   - Mark payment as completed

## 🔄 Isolated Sessions

Each port runs a completely independent instance with:
- ✅ Separate localStorage (different user sessions)
- ✅ Independent state management
- ✅ Isolated notifications
- ✅ Separate browser history

## 🛑 Stopping Servers

**Automated Script:**
- Press `Ctrl+C` in the terminal where you ran the script

**Manual:**
- Press `Ctrl+C` in each terminal window

**Windows Batch:**
- Close each command window that opened

## 🐛 Troubleshooting

### Port Already in Use
If you see "Port already in use" error:
```bash
# Find and kill the process using the port (Linux/Mac)
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Clear All Sessions
To reset all data across all sessions:
1. Open browser console (F12) on each session
2. Run: `localStorage.clear()`
3. Refresh each page

### Different Data in Each Session
This is expected! Each port has its own localStorage. To sync data:
- Use the same browser profile for all sessions
- Or manually recreate requests in each session

## 📝 Notes

- Each session is completely independent
- Changes in one session won't affect others
- Perfect for testing multi-user workflows
- Use different browser windows (not tabs) for best results
- Consider using browser profiles for even better isolation

## 🎯 Best Practices

1. **Use Incognito/Private Windows:** Each incognito window has isolated storage
2. **Label Your Windows:** Add the user role to the window title for easy identification
3. **Test Real Workflows:** Follow the actual approval chain
4. **Check Notifications:** Verify each user gets appropriate notifications
5. **Monitor Console:** Keep developer tools open to see debug info

---

Happy Testing! 🎉
