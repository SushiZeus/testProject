# 🔄 Multi-User Testing Guide

## ⚠️ Important: localStorage Isolation

**Each port (5173, 5174, etc.) has completely separate localStorage due to browser security (different origins).**

This means:
- ❌ Data created on port 5173 won't appear on port 5174
- ❌ Each port is completely isolated
- ✅ This is perfect for testing independent sessions
- ❌ This is NOT suitable for testing shared workflows

---

## ✅ Solution: Use Single Port with Multiple Windows

To test multi-user workflows with shared data, use **ONE port** with **multiple browser windows/tabs**:

### Method 1: Multiple Browser Windows (Recommended)

1. **Open the main session:**
   - Go to: http://localhost:5173

2. **Open 4 more windows of the SAME URL:**
   - Press `Ctrl+N` (Windows/Linux) or `Cmd+N` (Mac) 4 times
   - Each window goes to: http://localhost:5173

3. **Log in as different users in each window:**
   - Window 1: Documentation Officer
   - Window 2: HR Manager  
   - Window 3: Operations Manager
   - Window 4: COO
   - Window 5: Finance Manager

4. **Test the workflow:**
   - Window 1: Create request → appears in all windows!
   - Window 2: Approve request → all windows see the update!
   - Window 4: Final approval → everyone sees it!

---

### Method 2: Incognito/Private Windows

For even better isolation while sharing data:

1. **Regular Window:**
   - http://localhost:5173
   - Log in as Documentation Officer

2. **Incognito Window 1:**
   - http://localhost:5173
   - Log in as HR Manager

3. **Incognito Window 2:**
   - http://localhost:5173
   - Log in as Operations Manager

4. **Incognito Window 3:**
   - http://localhost:5173
   - Log in as COO

5. **Incognito Window 4:**
   - http://localhost:5173
   - Log in as Finance Manager

**Note:** Incognito windows share localStorage with each other but not with regular windows.

---

### Method 3: Different Browser Profiles

Create separate browser profiles for each user:

**Chrome:**
1. Click profile icon → Add profile
2. Create 5 profiles (Doc Officer, HR Manager, etc.)
3. Open http://localhost:5173 in each profile
4. Log in as the respective user

**Firefox:**
1. Type `about:profiles` in address bar
2. Create new profiles
3. Launch each profile
4. Open http://localhost:5173

---

## 🎯 Recommended Setup for Testing

### Single Port, Multiple Windows

**Use ONLY port 5173 for all users:**

```
Window 1: http://localhost:5173 → Documentation Officer
Window 2: http://localhost:5173 → HR Manager
Window 3: http://localhost:5173 → Operations Manager
Window 4: http://localhost:5173 → COO
Window 5: http://localhost:5173 → Finance Manager
```

**Benefits:**
- ✅ Shared localStorage (all see same data)
- ✅ Real-time updates across windows
- ✅ Test actual multi-user workflows
- ✅ Notifications work correctly
- ✅ Timeline shows all actions

---

## 🔧 Stop Other Ports

Since we only need one port, stop the others:

```bash
# Stop all servers
pkill -f "vite --port"

# Start only port 5173
cd app
npm run dev:5173
```

Or just use the default:
```bash
cd app
npm run dev
```

---

## 📋 Testing Workflow (Single Port)

### Step-by-Step:

1. **Start server:**
   ```bash
   cd app
   npm run dev
   ```

2. **Open 5 browser windows:**
   - All pointing to: http://localhost:5173

3. **Log in to each window:**
   - Window 1: `documentation_officer@company.com`
   - Window 2: `hr_manager@company.com`
   - Window 3: `operations_manager@company.com`
   - Window 4: `coo@company.com`
   - Window 5: `finance_manager@company.com`

4. **Test the flow:**
   - Window 1: Create petty cash request
   - Window 2: See notification → Approve
   - Window 4: See notification → Final approve
   - Window 5: See notification → Process payment

5. **Watch real-time updates:**
   - All windows update automatically
   - Notifications appear in real-time
   - Timeline shows complete history

---

## 💡 Why This Works

**Same Origin = Shared Storage:**
- All windows on http://localhost:5173 share the same localStorage
- Changes in one window are immediately visible in others
- The `storage` event fires when localStorage changes
- Our store automatically syncs across windows

**Different Ports = Isolated Storage:**
- http://localhost:5173 and http://localhost:5174 are different origins
- They have completely separate localStorage
- No data sharing between them
- Perfect for testing independent sessions, not shared workflows

---

## 🎨 Visual Organization Tips

1. **Arrange windows side-by-side:**
   - Use window snapping (Windows: Win+Arrow keys)
   - Arrange in a grid pattern
   - Label each window with user role

2. **Use browser extensions:**
   - Tab groups to organize
   - Window managers for layout
   - Session managers to save setup

3. **Color code windows:**
   - Use different themes per window
   - Add browser extensions for visual distinction

---

## 🐛 Troubleshooting

### Data not syncing between windows?
- Make sure all windows are on the SAME port
- Check that you're not using incognito + regular mixed
- Refresh all windows

### Old data showing?
```javascript
// In browser console (F12)
localStorage.clear()
location.reload()
```

### Want to start fresh?
- Close all windows
- Clear localStorage
- Restart server
- Open new windows

---

## 📊 Summary

| Approach | Data Sharing | Use Case |
|----------|--------------|----------|
| **Multiple Ports** | ❌ No | Independent testing |
| **Single Port, Multiple Windows** | ✅ Yes | Shared workflow testing |
| **Incognito Windows** | ⚠️ Partial | Semi-isolated testing |
| **Browser Profiles** | ✅ Yes | Persistent user sessions |

**For testing petty cash workflows: Use Single Port with Multiple Windows!**

---

**Updated:** $(date)
**Recommended:** Use http://localhost:5173 for all users
