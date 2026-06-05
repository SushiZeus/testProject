# Module Access Restrictions - April 10, 2026

## ✅ Updated Access Control

### Declaration Module
**Visible to:**
- Declaration Manager
- Declarants (3 users)
- Administrator

**Hidden from:** All other roles including Commercial Manager, COO, Managing Director

---

### Operations Module
**Visible to:**
- Operations Manager
- Operation Clerks (3 users)
- Permits Clerk
- Administrator

**Hidden from:** All other roles including Commercial Manager, COO, Managing Director, Transport Manager, Delivery Clerk

---

### Shipping Line Module
**Visible to:**
- Shipping Line Clerk
- Operations Manager
- Administrator

**Hidden from:** All other roles including Commercial Manager, COO, Managing Director

---

## 📋 Complete Role Access Matrix

| Module | Declaration Manager | Declarant | Operations Manager | Operation Clerk | Permits Clerk | Shipping Line Clerk | Administrator |
|--------|---------------------|-----------|-------------------|-----------------|---------------|---------------------|---------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| File Opening | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Declaration** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Operations** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Shipping Line** | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Petty Cash | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Leave Management | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 👥 User Credentials

### Declaration Team
**Declaration Manager:**
- Email: `declaration_manager@company.com`
- Password: `declaration_manager123`
- Access: Declaration module

**Declarants (3):**
- Email: `declarant@company.com` / Password: `declarant123`
- Email: `declarant2@company.com` / Password: `declarant123`
- Email: `declarant3@company.com` / Password: `declarant123`
- Access: Declaration module

---

### Operations Team
**Operations Manager:**
- Email: `operations_manager@company.com`
- Password: `operations_manager123`
- Access: Operations + Shipping Line modules

**Operation Clerks (3):**
- Email: `operation_clerk@company.com` / Password: `operation_clerk123`
- Email: `operation_clerk2@company.com` / Password: `operation_clerk123`
- Email: `operation_clerk3@company.com` / Password: `operation_clerk123`
- Access: Operations module only

**Permits Clerk:**
- Email: `permits_clerk@company.com`
- Password: `permits_clerk123`
- Access: Operations module (for permits processing)

---

### Shipping Line Team
**Shipping Line Clerk:**
- Email: `shipping_line_clerk@company.com`
- Password: `shipping_line_clerk123`
- Access: Shipping Line module only

---

## 🎯 Key Changes

### 1. Declaration Module - Restricted ✅
- **Before:** Accessible to Commercial Manager, COO, Managing Director
- **Now:** Only Declaration Manager, Declarants, and Administrator
- **Reason:** Declaration is a specialized function for customs clearance team only

### 2. Operations Module - Restricted ✅
- **Before:** Accessible to Permits Clerk, Delivery Clerk, Transport Manager, Commercial Manager, COO, Managing Director
- **Now:** Only Operations Manager, Operation Clerks, Permits Clerk, and Administrator
- **Reason:** Operations is for operational staff only; permits clerk needs it for permit processing

### 3. Shipping Line Module - Restricted ✅
- **Before:** Accessible to Commercial Manager, COO, Managing Director
- **Now:** Only Shipping Line Clerk, Operations Manager, and Administrator
- **Reason:** Shipping line coordination is handled by dedicated clerk and operations manager

---

## 🧪 Testing Instructions

### Test Declaration Access:
1. Login as **Declarant** (`declarant@company.com` / `declarant123`)
2. Verify "Declaration" appears in sidebar
3. Logout and login as **Commercial Manager**
4. Verify "Declaration" does NOT appear

### Test Operations Access:
1. Login as **Operation Clerk** (`operation_clerk@company.com` / `operation_clerk123`)
2. Verify "Operations" appears in sidebar
3. Verify "Shipping Line" does NOT appear
4. Logout and login as **Permits Clerk** (`permits_clerk@company.com` / `permits_clerk123`)
5. Verify "Operations" appears (for permits processing)

### Test Shipping Line Access:
1. Login as **Shipping Line Clerk** (`shipping_line_clerk@company.com` / `shipping_line_clerk123`)
2. Verify "Shipping Line" appears in sidebar
3. Verify "Operations" does NOT appear
4. Logout and login as **Operations Manager**
5. Verify both "Operations" AND "Shipping Line" appear

---

## 📊 Summary of Restrictions

| Role | Can See Declaration | Can See Operations | Can See Shipping Line |
|------|---------------------|-------------------|----------------------|
| Declaration Manager | ✅ Yes | ❌ No | ❌ No |
| Declarant | ✅ Yes | ❌ No | ❌ No |
| Operations Manager | ❌ No | ✅ Yes | ✅ Yes |
| Operation Clerk | ❌ No | ✅ Yes | ❌ No |
| Permits Clerk | ❌ No | ✅ Yes | ❌ No |
| Shipping Line Clerk | ❌ No | ❌ No | ✅ Yes |
| Commercial Manager | ❌ No | ❌ No | ❌ No |
| COO | ❌ No | ❌ No | ❌ No |
| Managing Director | ❌ No | ❌ No | ❌ No |
| Administrator | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🔄 How to See Changes

1. **Hard Refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Logout/Login:** Log out and log back in with different roles
3. **Clear Cache:** DevTools (F12) → Application → Clear Storage
4. **Test Multiple Roles:** Try different user accounts to verify access

---

**Status:** ✅ Complete
**Updated:** April 10, 2026
**Server:** http://localhost:5173/
