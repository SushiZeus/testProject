// HR Module Types

// Claims & Expenses
export type ClaimStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'MANAGER_APPROVED'
  | 'MANAGER_REJECTED'
  | 'HR_APPROVED'
  | 'HR_REJECTED'
  | 'FINANCE_APPROVED'
  | 'FINANCE_REJECTED'
  | 'PAID'
  | 'CANCELLED';

export interface ClaimItem {
  id: string;
  description: string;
  receiptDate: Date;
  amount: number;
  receiptUrl?: string;
  category: string;
}

export interface ClaimApproval {
  id: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  decision: 'APPROVED' | 'REJECTED';
  approvedAmount?: number;
  comments?: string;
  approvedAt: Date;
}

export interface ExpenseClaim {
  id: string;
  claimNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  items: ClaimItem[];
  totalAmount: number;
  approvedAmount: number;
  status: ClaimStatus;
  approvals: ClaimApproval[];
  submittedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Payroll & Finance
export type PayrollStatus = 'DRAFT' | 'LOCKED' | 'APPROVED' | 'PAID';

export interface PayrollEmployee {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  allowances: number;
  grossPay: number;
  paye: number;
  nssf: number;
  otherDeductions: number;
  loanDeduction: number;
  totalDeductions: number;
  netPay: number;
}

export interface PayrollRun {
  id: string;
  runNumber: string;
  period: string; // "April 2026"
  month: number;
  year: number;
  employees: PayrollEmployee[];
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  status: PayrollStatus;
  createdBy: string;
  createdAt: Date;
  lockedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  paidAt?: Date;
}

export type LoanStatus = 
  | 'PENDING'
  | 'MANAGER_APPROVED'
  | 'MANAGER_REJECTED'
  | 'HR_APPROVED'
  | 'HR_REJECTED'
  | 'FINANCE_APPROVED'
  | 'FINANCE_REJECTED'
  | 'DISBURSED'
  | 'REPAYING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Loan {
  id: string;
  loanNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  amount: number;
  purpose: string;
  repaymentMonths: number;
  monthlyDeduction: number;
  amountPaid: number;
  balance: number;
  status: LoanStatus;
  appliedAt: Date;
  approvedAt?: Date;
  disbursedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Imprest {
  id: string;
  imprestNumber: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'RETIRED';
  appliedAt: Date;
  approvedAt?: Date;
  disbursedAt?: Date;
  retiredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// HR Dashboard
export interface DepartmentStats {
  department: string;
  employeeCount: number;
}

export interface GenderStats {
  male: number;
  female: number;
}

export interface PayrollTrend {
  month: string;
  grossPay: number;
  netPay: number;
}

export interface HRDashboardData {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  departmentStats: DepartmentStats[];
  genderStats: GenderStats;
  payrollTrends: PayrollTrend[];
  currentMonthPayroll: {
    grossPay: number;
    deductions: number;
    netPay: number;
  };
}
