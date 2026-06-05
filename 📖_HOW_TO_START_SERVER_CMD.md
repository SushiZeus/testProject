# 🚀 HOW TO START SERVER USING CMD
## Simple Step-by-Step Guide

---

## METHOD 1: EASIEST WAY (RECOMMENDED) ⭐

### Just Double-Click This File:
```
🚀_DOUBLE_CLICK_TO_START.bat
```

**That's it!** Server starts automatically!

---

## METHOD 2: USING COMMAND PROMPT (CMD)

### Step 1: Open Command Prompt
- Press `Windows Key + R`
- Type: `cmd`
- Press `Enter`

### Step 2: Navigate to Your Project
```cmd
cd C:\Users\user\Desktop\testproject
```
*(Replace with your actual project path)*

### Step 3: Go to App Folder
```cmd
cd app
```

### Step 4: Start the Server
```cmd
npm run dev
```

### Step 5: Wait for Server to Start
You'll see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 6: Open Browser
Open your browser and go to:
```
http://localhost:5173
```

---

## METHOD 3: ONE COMMAND (FASTEST)

Open CMD and paste this single command:

```cmd
cd C:\Users\user\Desktop\testproject\app && npm run dev
```

*(Replace path with your actual project location)*

---

## 🎯 QUICK REFERENCE

### Full Command Sequence:
```cmd
1. cd C:\Users\user\Desktop\testproject
2. cd app
3. npm run dev
```

### Or Single Line:
```cmd
cd C:\Users\user\Desktop\testproject\app && npm run dev
```

---

## 📍 AFTER SERVER STARTS

### Your System Will Be At:
```
http://localhost:5173
```

### Login Credentials:
```
Username: admin
Password: administrator123
```

---

## 🔧 TROUBLESHOOTING

### If "npm is not recognized":
1. Install Node.js from: https://nodejs.org
2. Restart CMD
3. Try again

### If "Cannot find module":
Run this first:
```cmd
cd C:\Users\user\Desktop\testproject\app
npm install
```
Then start server:
```cmd
npm run dev
```

### If Port 5173 is Busy:
Server will automatically use next available port (5174, 5175, etc.)
Check CMD output for actual port number.

### To Stop Server:
Press `Ctrl + C` in CMD window

---

## 🌐 ACCESS FROM OTHER DEVICES

### Step 1: Find Your IP Address
In CMD, type:
```cmd
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

### Step 2: Start Server with Host Flag
```cmd
cd C:\Users\user\Desktop\testproject\app
npm run dev -- --host
```

### Step 3: Access from Other Devices
On other devices, open browser and go to:
```
http://YOUR_IP:5173
```
Example: `http://192.168.1.100:5173`

---

## 📱 KEEP SERVER RUNNING

### Option 1: Keep CMD Window Open
Don't close the CMD window - server stays running

### Option 2: Run in Background
Use the batch file:
```
🚀_DOUBLE_CLICK_TO_START.bat
```

---

## ⚡ QUICK START COMMANDS

### Start Server:
```cmd
cd C:\Users\user\Desktop\testproject\app && npm run dev
```

### Start with Network Access:
```cmd
cd C:\Users\user\Desktop\testproject\app && npm run dev -- --host
```

### Install Dependencies (if needed):
```cmd
cd C:\Users\user\Desktop\testproject\app && npm install
```

---

## 🎯 COMPLETE EXAMPLE

Here's a complete session:

```cmd
C:\Users\user> cd Desktop\testproject

C:\Users\user\Desktop\testproject> cd app

C:\Users\user\Desktop\testproject\app> npm run dev

> app@0.0.0 dev
> vite

  VITE v5.0.8  ready in 523 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Now open browser: `http://localhost:5173`

---

## 🎊 THAT'S IT!

Your server is now running and your complete ERP system is accessible!

---

## 📞 NEED HELP?

### Common Issues:

**"Cannot find path"**
- Check your project location
- Use correct path in cd command

**"npm not found"**
- Install Node.js
- Restart CMD

**"Port in use"**
- Server will use next available port
- Check CMD output for actual port

**"Module not found"**
- Run: `npm install`
- Then: `npm run dev`

---

## ✅ VERIFICATION

### Server is Running When You See:
```
✓ ready in xxx ms
Local: http://localhost:5173/
```

### System is Working When:
- Browser opens to login page
- You can login with admin credentials
- Dashboard loads successfully

---

**Your complete ERP system with 21 modules is ready to use!** 🎉

