import { useState, useEffect } from 'react';
import type { PayrollRun, PayrollEmployee } from '@/types/hr';

interface PayrollState {
  payrollRuns: PayrollRun[];
  createPayrollRun: (data: { period: string; month: number; year: number; createdBy: string }) => PayrollRun;
  addEmployee: (runId: string, employee: Omit<PayrollEmployee, 'id'>) => void;
  removeEmployee: (runId: string, employeeId: string) => void;
  lockPayroll: (runId: string) => void;
  approvePayroll: (runId: string, approvedBy: string) => void;
  markAsPaid: (runId: string) => void;
  getPayrollById: (id: string) => PayrollRun | undefined;
  getPayrollByPeriod: (month: number, year: number) => PayrollRun | undefined;
  calculatePAYE: (grossPay: number) => number;
  calculateNSSF: (grossPay: number) => number;
}

const generateRunNumber = (_existingRuns: PayrollRun[], month: number, year: number): string => {
  const monthStr = month.toString().padStart(2, '0');
  return `PAY-${year}-${monthStr}`;
};

// Tanzania PAYE calculation (2026 rates)
const calculatePAYE = (grossPay: number): number => {
  const annualGross = grossPay * 12;
  let tax = 0;
  
  if (annualGross <= 5400000) {
    tax = 0; // No tax for first bracket
  } else if (annualGross <= 8640000) {
    tax = (annualGross - 5400000) * 0.08;
  } else if (annualGross <= 14400000) {
    tax = 259200 + (annualGross - 8640000) * 0.20;
  } else if (annualGross <= 21600000) {
    tax = 1411200 + (annualGross - 14400000) * 0.25;
  } else {
    tax = 3211200 + (annualGross - 21600000) * 0.30;
  }
  
  return Math.round(tax / 12); // Monthly PAYE
};

// Tanzania NSSF calculation (2026 rates)
const calculateNSSF = (grossPay: number): number => {
  const employeeContribution = grossPay * 0.10; // 10% employee contribution
  const maxContribution = 200000; // Maximum monthly contribution
  return Math.min(employeeContribution, maxContribution);
};

const loadState = () => {
  if (typeof window === 'undefined') {
    return { payrollRuns: [] };
  }

  try {
    const savedState = localStorage.getItem('payrollStore');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        payrollRuns: parsed.payrollRuns.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          lockedAt: r.lockedAt ? new Date(r.lockedAt) : undefined,
          approvedAt: r.approvedAt ? new Date(r.approvedAt) : undefined,
          paidAt: r.paidAt ? new Date(r.paidAt) : undefined,
        })),
      };
    }
  } catch (error) {
    console.error('Error loading payroll state:', error);
  }

  return { payrollRuns: [] };
};

const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('payrollStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving payroll state:', error);
    }
  }
};

let state: { payrollRuns: PayrollRun[] } = loadState();
const listeners = new Set<() => void>();

const notify = () => {
  saveState(state);
  listeners.forEach(fn => fn());
};

export const usePayrollStore = (): PayrollState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    get payrollRuns() { return state.payrollRuns; },

    createPayrollRun: (data) => {
      const newRun: PayrollRun = {
        id: Math.random().toString(36).substr(2, 9),
        runNumber: generateRunNumber(state.payrollRuns, data.month, data.year),
        period: data.period,
        month: data.month,
        year: data.year,
        employees: [],
        totalEmployees: 0,
        totalGrossPay: 0,
        totalDeductions: 0,
        totalNetPay: 0,
        status: 'DRAFT',
        createdBy: data.createdBy,
        createdAt: new Date(),
      };

      state = {
        ...state,
        payrollRuns: [...state.payrollRuns, newRun],
      };
      notify();
      return newRun;
    },

    addEmployee: (runId, employeeData) => {
      const run = state.payrollRuns.find(r => r.id === runId);
      if (!run || run.status !== 'DRAFT') return;

      const newEmployee: PayrollEmployee = {
        id: Math.random().toString(36).substr(2, 9),
        ...employeeData,
      };

      const updatedEmployees = [...run.employees, newEmployee];
      const updatedRun = {
        ...run,
        employees: updatedEmployees,
        totalEmployees: updatedEmployees.length,
        totalGrossPay: updatedEmployees.reduce((sum, e) => sum + e.grossPay, 0),
        totalDeductions: updatedEmployees.reduce((sum, e) => sum + e.totalDeductions, 0),
        totalNetPay: updatedEmployees.reduce((sum, e) => sum + e.netPay, 0),
      };

      state = {
        ...state,
        payrollRuns: state.payrollRuns.map(r => r.id === runId ? updatedRun : r),
      };
      notify();
    },

    removeEmployee: (runId, employeeId) => {
      const run = state.payrollRuns.find(r => r.id === runId);
      if (!run || run.status !== 'DRAFT') return;

      const updatedEmployees = run.employees.filter(e => e.id !== employeeId);
      const updatedRun = {
        ...run,
        employees: updatedEmployees,
        totalEmployees: updatedEmployees.length,
        totalGrossPay: updatedEmployees.reduce((sum, e) => sum + e.grossPay, 0),
        totalDeductions: updatedEmployees.reduce((sum, e) => sum + e.totalDeductions, 0),
        totalNetPay: updatedEmployees.reduce((sum, e) => sum + e.netPay, 0),
      };

      state = {
        ...state,
        payrollRuns: state.payrollRuns.map(r => r.id === runId ? updatedRun : r),
      };
      notify();
    },

    lockPayroll: (runId) => {
      const run = state.payrollRuns.find(r => r.id === runId);
      if (!run || run.status !== 'DRAFT') return;

      state = {
        ...state,
        payrollRuns: state.payrollRuns.map(r => r.id === runId ? {
          ...r,
          status: 'LOCKED',
          lockedAt: new Date(),
        } : r),
      };
      notify();
    },

    approvePayroll: (runId, approvedBy) => {
      const run = state.payrollRuns.find(r => r.id === runId);
      if (!run || run.status !== 'LOCKED') return;

      state = {
        ...state,
        payrollRuns: state.payrollRuns.map(r => r.id === runId ? {
          ...r,
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy,
        } : r),
      };
      notify();
    },

    markAsPaid: (runId) => {
      const run = state.payrollRuns.find(r => r.id === runId);
      if (!run || run.status !== 'APPROVED') return;

      state = {
        ...state,
        payrollRuns: state.payrollRuns.map(r => r.id === runId ? {
          ...r,
          status: 'PAID',
          paidAt: new Date(),
        } : r),
      };
      notify();
    },

    getPayrollById: (id) => {
      return state.payrollRuns.find(r => r.id === id);
    },

    getPayrollByPeriod: (month, year) => {
      return state.payrollRuns.find(r => r.month === month && r.year === year);
    },

    calculatePAYE,
    calculateNSSF,
  };
};
