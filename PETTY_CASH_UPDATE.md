# ✅ Petty Cash System - Complete Update

## 🎉 What's Been Implemented

### 1. ✅ Documentation Officer Has Access
**Login:** `doc@company.com` / `doc123`

**Where to Request:**
- File Opening page - "Request Petty Cash" button (top right)
- Can request with or without a file

### 2. ✅ Petty Cash Requests - With or Without File

**All users can now:**
- Request petty cash WITHOUT selecting a file (general request)
- Request petty cash WITH a file (linked to specific shipment)
- Choose from dropdown: "No file - General request" or select a file

### 3. ✅ Who Can Request Petty Cash

**These 3 roles ONLY:**
- ✅ Documentation Officer (`doc@company.com` / `doc123`)
- ✅ Declaration Manager (`declmanager@company.com` / `declmanager123`)
- ✅ Declarant (`declarant1@company.com` / `declarant123`)

**All other roles CANNOT request petty cash**

---

## 🔄 How to Request Petty Cash

### Method 1: From File Opening Page (Documentation Officer)
```
1. Login: doc@company.com / doc123
2. Go to "Open New File" page
3. Click "Request Petty Cash" button (top right)
4. Select a file (optional) or leave as "No file - General request"
5. Enter amount and currency
6. Enter description
7. Submit
```

### Method 2: From Declaration Page (All 3 Roles)
```
1. Login as doc/declmanager/declarant
2. Go to "Declaration" page
3. Click "Request Petty Cash" button (top right)
4. Select a file (optional) or leave as "No file - General request"
5. Enter amount and currency
6. Enter description
7. Submit
```

### Method 3: From File Actions (Declaration Page)
```
1. Login as doc/declmanager/declarant
2. Go to "Declaration" page
3. Find a file in the table
4. Click "Petty Cash" button next to the file
5. File will be pre-selected
6. Enter amount and description
7. Submit
```

---

## 📋 Request Types

### General Request (No File)
- Select "No file - General request" from dropdown
- Used for general expenses not tied to a specific shipment
- Examples: Office supplies, utilities, general transportation

### File-Linked Request
- Select a specific file from dropdown
- Used for expenses related to a specific shipment
- Examples: Customs fees, port charges, document fees for that file

---

## 🎯 Testing Guide

### Test Documentation Officer Access:
```
1. Clear localStorage: localStorage.clear()
2. Login: doc@company.com / doc123
3. Go to "Open New File" page
4. Click "Request Petty Cash" button
5. Try both:
   - General request (no file)
   - File-linked request (select a file)
```

### Test Declaration Manager Access:
```
1. Login: declmanager@company.com / declmanager123
2. Go to "Declaration" page
3. Click "Request Petty Cash" button
4. Create request with or without file
```

### Test Declarant Access:
```
1. Login: declarant1@company.com / declarant123
2. Go to "Declaration" page
3. Two ways to request:
   a) Click "Request Petty Cash" button (top)
   b) Click "Petty Cash" button next to a file
```

### Test Other Roles (Should NOT Have Access):
```
❌ opsmanager@company.com - No button visible
❌ clerk1@company.com - No button visible
❌ All other roles - No access
```

---

## 🚀 App Running

**URL:** http://localhost:4173/

**Remember:**
- Clear localStorage before testing: `localStorage.clear()`
- Only 3 roles can request petty cash
- Requests can be made with or without files
- All requests go through same approval chain

---

## ✨ Key Features

1. **Flexible Requests**
   - With file: Linked to specific shipment
   - Without file: General expense request
   - Clear indication of request type

2. **Role-Based Access**
   - Only documentation/declaration department
   - Prevents unauthorized requests
   - Maintains proper workflow

3. **Easy Selection**
   - Dropdown shows all files
   - Option for "No file - General request"
   - File details shown when selected

4. **Clear Feedback**
   - Shows which file is selected
   - Indicates if general request
   - Success message after submission

---

**Happy Testing! 🎉**
