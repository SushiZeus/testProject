import { useState, useEffect } from 'react';
import type { Loan, LoanStatus } from '@/types/hr';

interface LoansState {
  loans: Loan[];
  createLoan: (data: {
    employeeId: string;
    employeeName: string;
    department: string;
    amount: number;
    purpose: string;
    repaymentMonths: number;
  }) => Loan;
  approveLoan: (loanId: string, approverRole: string) => void;
  rejectLoan: (loanId: string, approverRole: string) => void;
  disburseLoan: (loanId: string) => void;
  recordPayment: (loanId: string, amount: number) => void;
  getLoanById: (id: string) => Loan | undefined;
  getLoansByEmployee: (employeeId: string) => Loan[];
  getLoansByStatus: (status: LoanStatus) => Loan[];
  getPendingApprovals: (userRole: string) => Loan[];
  getActiveLoans: (employeeId: string) => Loan[];
}

const generateLoanNumber = (existingLoans: Loan[]): string => {
  const year = new Date().getFullYear();
  const count = existingLoans.filter(l => l.loanNumber.startsWith(`LOAN-${year}`)).length + 1;
  return `LOAN-${year}-${count.toString().padStart(4, '0')}`;
};

const loadState = () => {
  if (typeof window === 'undefined') {
    return { loans: [] };
  }

  try {
    const savedState = localStorage.getItem('loansStore');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        loans: parsed.loans.map((l: any) => ({
          ...l,
          appliedAt: new Date(l.appliedAt),
          approvedAt: l.approvedAt ? new Date(l.approvedAt) : undefined,
          disbursedAt: l.disbursedAt ? new Date(l.disbursedAt) : undefined,
          completedAt: l.completedAt ? new Date(l.completedAt) : undefined,
          createdAt: new Date(l.createdAt),
          updatedAt: new Date(l.updatedAt),
        })),
      };
    }
  } catch (error) {
    console.error('Error loading loans state:', error);
  }

  return { loans: [] };
};

const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('loansStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving loans state:', error);
    }
  }
};

let state: { loans: Loan[] } = loadState();
const listeners = new Set<() => void>();

const notify = () => {
  saveState(state);
  listeners.forEach(fn => fn());
};

export const useLoansStore = (): LoansState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    get loans() { return state.loans; },

    createLoan: (data) => {
      const monthlyDeduction = Math.round(data.amount / data.repaymentMonths);
      
      const newLoan: Loan = {
        id: Math.random().toString(36).substr(2, 9),
        loanNumber: generateLoanNumber(state.loans),
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        department: data.department,
        amount: data.amount,
        purpose: data.purpose,
        repaymentMonths: data.repaymentMonths,
        monthlyDeduction,
        amountPaid: 0,
        balance: data.amount,
        status: 'PENDING',
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      state = {
        ...state,
        loans: [...state.loans, newLoan],
      };
      notify();
      return newLoan;
    },

    approveLoan: (loanId, approverRole) => {
      const loan = state.loans.find(l => l.id === loanId);
      if (!loan) return;

      let newStatus: LoanStatus = loan.status;
      
      if (approverRole.includes('manager') && !approverRole.includes('hr') && !approverRole.includes('finance')) {
        if (loan.status === 'PENDING') newStatus = 'MANAGER_APPROVED';
      } else if (approverRole === 'hr_manager') {
        if (loan.status === 'MANAGER_APPROVED') newStatus = 'HR_APPROVED';
      } else if (approverRole === 'finance_manager') {
        if (loan.status === 'HR_APPROVED') newStatus = 'FINANCE_APPROVED';
      }

      state = {
        ...state,
        loans: state.loans.map(l => l.id === loanId ? {
          ...l,
          status: newStatus,
          approvedAt: newStatus === 'FINANCE_APPROVED' ? new Date() : l.approvedAt,
          updatedAt: new Date(),
        } : l),
      };
      notify();
    },

    rejectLoan: (loanId, approverRole) => {
      const loan = state.loans.find(l => l.id === loanId);
      if (!loan) return;

      let newStatus: LoanStatus = loan.status;
      
      if (approverRole.includes('manager') && !approverRole.includes('hr') && !approverRole.includes('finance')) {
        newStatus = 'MANAGER_REJECTED';
      } else if (approverRole === 'hr_manager') {
        newStatus = 'HR_REJECTED';
      } else if (approverRole === 'finance_manager') {
        newStatus = 'FINANCE_REJECTED';
      }

      state = {
        ...state,
        loans: state.loans.map(l => l.id === loanId ? {
          ...l,
          status: newStatus,
          updatedAt: new Date(),
        } : l),
      };
      notify();
    },

    disburseLoan: (loanId) => {
      const loan = state.loans.find(l => l.id === loanId);
      if (!loan || loan.status !== 'FINANCE_APPROVED') return;

      state = {
        ...state,
        loans: state.loans.map(l => l.id === loanId ? {
          ...l,
          status: 'DISBURSED',
          disbursedAt: new Date(),
          updatedAt: new Date(),
        } : l),
      };
      notify();
    },

    recordPayment: (loanId, amount) => {
      const loan = state.loans.find(l => l.id === loanId);
      if (!loan || (loan.status !== 'DISBURSED' && loan.status !== 'REPAYING')) return;

      const newAmountPaid = loan.amountPaid + amount;
      const newBalance = loan.amount - newAmountPaid;
      const isCompleted = newBalance <= 0;

      state = {
        ...state,
        loans: state.loans.map(l => l.id === loanId ? {
          ...l,
          amountPaid: newAmountPaid,
          balance: Math.max(0, newBalance),
          status: isCompleted ? 'COMPLETED' : 'REPAYING',
          completedAt: isCompleted ? new Date() : l.completedAt,
          updatedAt: new Date(),
        } : l),
      };
      notify();
    },

    getLoanById: (id) => {
      return state.loans.find(l => l.id === id);
    },

    getLoansByEmployee: (employeeId) => {
      return state.loans.filter(l => l.employeeId === employeeId);
    },

    getLoansByStatus: (status) => {
      return state.loans.filter(l => l.status === status);
    },

    getPendingApprovals: (userRole) => {
      if (userRole.includes('manager') && !userRole.includes('hr') && !userRole.includes('finance')) {
        return state.loans.filter(l => l.status === 'PENDING');
      }
      
      if (userRole === 'hr_manager') {
        return state.loans.filter(l => l.status === 'MANAGER_APPROVED');
      }
      
      if (userRole === 'finance_manager') {
        return state.loans.filter(l => l.status === 'HR_APPROVED');
      }
      
      return [];
    },

    getActiveLoans: (employeeId) => {
      return state.loans.filter(l => 
        l.employeeId === employeeId && 
        (l.status === 'DISBURSED' || l.status === 'REPAYING')
      );
    },
  };
};
