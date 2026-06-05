# HR Modules Implementation Plan - April 1, 2026

## Modules to Implement (Option B - Full Implementation)

### 1. Claims & Expenses Module ✅
**Features**:
- Submit expense claims with multiple items
- Upload receipts for each item
- Approval workflow (Manager → HR → Finance)
- Claim status tracking
- Claim history
- Approval/rejection with comments
- Amount approval (can approve partial amounts)

**User Roles**:
- Employees: Submit claims
- Managers: First approval
- HR Manager: Second approval
- Finance Manager: Final approval & payment
- Cashier: Process payments

### 2. Payroll & Finance Module ✅
**Features**:
- Monthly payroll runs
- Gross pay, deductions, net pay calculations
- Payroll status (Draft, Locked, Approved)
- Statutory reports (PAYE, NSSF, etc.)
- P9 certificates generation
- Loans management (application, approval, deductions)
- Imprests (cash advances)
- Accounting export

**User Roles**:
- HR Manager: Create payroll runs, manage loans
- Finance Manager: Approve payroll, process payments
- Employees: View payslips, apply for loans

### 3. HR Dashboard Module ✅
**Features**:
- Employees by department (bar chart)
- Employees by gender (donut chart)
- Payroll trends (line chart - last 12 months)
- Total employees count
- Department statistics
- Gender distribution
- Monthly payroll summary

**User Roles**:
- HR Manager: Full access
- Executives: View-only access
- Managers: Department-specific data

## Technical Implementation

### New Types (app/src/types/hr.ts)
```typescript
// Claims & Expenses
- ExpenseClaim
- ClaimItem
- ClaimStatus
- ClaimApproval

// Payroll
- PayrollRun
- PayrollEmployee
- Loan
- LoanStatus
- Imprest

// Dashboard
- DepartmentStats
- PayrollTrend
```

### New Stores
```typescript
- app/src/store/claimsStore.ts
- app/src/store/payrollStore.ts
- app/src/store/hrDashboardStore.ts
```

### New Pages
```typescript
- app/src/pages/ClaimsExpensesPage.tsx
- app/src/pages/ClaimDetailPage.tsx
- app/src/pages/PayrollPage.tsx
- app/src/pages/PayrollRunDetailPage.tsx
- app/src/pages/LoansPage.tsx
- app/src/pages/HRDashboardPage.tsx
```

### Navigation Updates
- Add HR section in sidebar
- Add Claims & Expenses menu item
- Add Payroll & Finance menu item
- Update HR Dashboard

## Implementation Order

1. **Types & Interfaces** (hr.ts)
2. **Claims Store** (claimsStore.ts)
3. **Claims Pages** (ClaimsExpensesPage, ClaimDetailPage)
4. **Payroll Store** (payrollStore.ts)
5. **Payroll Pages** (PayrollPage, LoansPage)
6. **HR Dashboard Store** (hrDashboardStore.ts)
7. **HR Dashboard Page** (HRDashboardPage.tsx)
8. **Navigation & Routes** (App.tsx updates)

## Workflow Examples

### Claims Workflow
1. Employee submits claim with items & receipts
2. Manager reviews & approves/rejects
3. HR Manager reviews & approves/rejects
4. Finance Manager approves amount & processes payment
5. Cashier marks as paid

### Payroll Workflow
1. HR creates monthly payroll run
2. System calculates gross, deductions, net pay
3. HR locks payroll (no more changes)
4. Finance Manager approves
5. Payments processed
6. Payslips available to employees

### Loan Workflow
1. Employee applies for loan
2. Manager approves
3. HR Manager approves
4. Finance Manager approves & disburses
5. Monthly deductions from payroll

## Estimated Complexity
- **Claims & Expenses**: Medium (approval workflow, file uploads)
- **Payroll & Finance**: High (calculations, statutory reports)
- **HR Dashboard**: Medium (charts, analytics)

**Total Implementation Time**: This is a large project!

---

**Status**: Ready to implement
**Date**: April 1, 2026
