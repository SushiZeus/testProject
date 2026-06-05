import { useState, useEffect } from 'react';
import type { ExpenseClaim, ClaimItem, ClaimApproval, ClaimStatus } from '@/types/hr';

interface ClaimsState {
  claims: ExpenseClaim[];
  createClaim: (data: {
    employeeId: string;
    employeeName: string;
    department: string;
  }) => ExpenseClaim;
  addClaimItem: (claimId: string, item: Omit<ClaimItem, 'id'>) => void;
  removeClaimItem: (claimId: string, itemId: string) => void;
  submitClaim: (claimId: string) => void;
  approveClaim: (claimId: string, approverId: string, approverName: string, approverRole: string, approvedAmount?: number, comments?: string) => void;
  rejectClaim: (claimId: string, approverId: string, approverName: string, approverRole: string, comments?: string) => void;
  markAsPaid: (claimId: string) => void;
  getClaimById: (id: string) => ExpenseClaim | undefined;
  getClaimsByEmployee: (employeeId: string) => ExpenseClaim[];
  getClaimsByStatus: (status: ClaimStatus) => ExpenseClaim[];
  getPendingApprovals: (userId: string, userRole: string) => ExpenseClaim[];
}

const generateClaimNumber = (existingClaims: ExpenseClaim[]): string => {
  const year = new Date().getFullYear();
  const count = existingClaims.filter(c => c.claimNumber.startsWith(`CLM-${year}`)).length + 1;
  return `CLM-${year}-${count.toString().padStart(4, '0')}`;
};

const loadState = () => {
  if (typeof window === 'undefined') {
    return { claims: [] };
  }

  try {
    const savedState = localStorage.getItem('claimsStore');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        claims: parsed.claims.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          submittedAt: c.submittedAt ? new Date(c.submittedAt) : undefined,
          paidAt: c.paidAt ? new Date(c.paidAt) : undefined,
          items: c.items.map((i: any) => ({
            ...i,
            receiptDate: new Date(i.receiptDate),
          })),
          approvals: c.approvals.map((a: any) => ({
            ...a,
            approvedAt: new Date(a.approvedAt),
          })),
        })),
      };
    }
  } catch (error) {
    console.error('Error loading claims state:', error);
  }

  return { claims: [] };
};

const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('claimsStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving claims state:', error);
    }
  }
};

let state: { claims: ExpenseClaim[] } = loadState();
const listeners = new Set<() => void>();

const notify = () => {
  saveState(state);
  listeners.forEach(fn => fn());
};

export const useClaimsStore = (): ClaimsState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    get claims() { return state.claims; },

    createClaim: (data) => {
      const newClaim: ExpenseClaim = {
        id: Math.random().toString(36).substr(2, 9),
        claimNumber: generateClaimNumber(state.claims),
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        department: data.department,
        items: [],
        totalAmount: 0,
        approvedAmount: 0,
        status: 'DRAFT',
        approvals: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      state = {
        ...state,
        claims: [...state.claims, newClaim],
      };
      notify();
      return newClaim;
    },

    addClaimItem: (claimId, itemData) => {
      const claim = state.claims.find(c => c.id === claimId);
      if (!claim) return;

      const newItem: ClaimItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...itemData,
      };

      const updatedClaim = {
        ...claim,
        items: [...claim.items, newItem],
        totalAmount: claim.items.reduce((sum, i) => sum + i.amount, 0) + newItem.amount,
        updatedAt: new Date(),
      };

      state = {
        ...state,
        claims: state.claims.map(c => c.id === claimId ? updatedClaim : c),
      };
      notify();
    },

    removeClaimItem: (claimId, itemId) => {
      const claim = state.claims.find(c => c.id === claimId);
      if (!claim) return;

      const updatedItems = claim.items.filter(i => i.id !== itemId);
      const updatedClaim = {
        ...claim,
        items: updatedItems,
        totalAmount: updatedItems.reduce((sum, i) => sum + i.amount, 0),
        updatedAt: new Date(),
      };

      state = {
        ...state,
        claims: state.claims.map(c => c.id === claimId ? updatedClaim : c),
      };
      notify();
    },

    submitClaim: (claimId) => {
      const claim = state.claims.find(c => c.id === claimId);
      if (!claim || claim.items.length === 0) return;

      state = {
        ...state,
        claims: state.claims.map(c => c.id === claimId ? {
          ...c,
          status: 'SUBMITTED',
          submittedAt: new Date(),
          updatedAt: new Date(),
        } : c),
      };
      notify();
    },

    approveClaim: (claimId, approverId, approverName, approverRole, approvedAmount, comments) => {
      const claim = state.claims.find(c => c.id === claimId);
      if (!claim) return;

      const approval: ClaimApproval = {
        id: Math.random().toString(36).substr(2, 9),
        approverId,
        approverName,
        approverRole,
        decision: 'APPROVED',
        approvedAmount,
        comments,
        approvedAt: new Date(),
      };

      let newStatus: ClaimStatus = claim.status;
      if (approverRole.includes('manager') && claim.status === 'SUBMITTED') {
        newStatus = 'MANAGER_APPROVED';
      } else if (approverRole === 'hr_manager' && claim.status === 'MANAGER_APPROVED') {
        newStatus = 'HR_APPROVED';
      } else if (approverRole === 'finance_manager' && claim.status === 'HR_APPROVED') {
        newStatus = 'FINANCE_APPROVED';
      }

      state = {
        ...state,
        claims: state.claims.map(c => c.id === claimId ? {
          ...c,
          status: newStatus,
          approvals: [...c.approvals, approval],
          approvedAmount: approvedAmount || c.totalAmount,
          updatedAt: new Date(),
        } : c),
      };
      notify();
    },

    rejectClaim: (claimId, approverId, approverName, approverRole, comments) => {
      const claim = state.claims.find(c => c.id === claimId);
      if (!claim) return;

      const approval: ClaimApproval = {
        id: Math.random().toString(36).substr(2, 9),
        approverId,
        approverName,
        approverRole,
        decision: 'REJECTED',
        comments,
        approvedAt: new Date(),
      };

      let newStatus: ClaimStatus = claim.status;
      if (approverRole.includes('manager')) {
        newStatus = 'MANAGER_REJECTED';
      } else if (approverRole === 'hr_manager') {
        newStatus = 'HR_REJECTED';
      } else if (approverRole === 'finance_manager') {
        newStatus = 'FINANCE_REJECTED';
      }

      state = {
        ...state,
        claims: state.claims.map(c => c.id === claimId ? {
          ...c,
          status: newStatus,
          approvals: [...c.approvals, approval],
          updatedAt: new Date(),
        } : c),
      };
      notify();
    },

    markAsPaid: (claimId) => {
      state = {
        ...state,
        claims: state.claims.map(c => c.id === claimId ? {
          ...c,
          status: 'PAID',
          paidAt: new Date(),
          updatedAt: new Date(),
        } : c),
      };
      notify();
    },

    getClaimById: (id) => {
      return state.claims.find(c => c.id === id);
    },

    getClaimsByEmployee: (employeeId) => {
      return state.claims.filter(c => c.employeeId === employeeId);
    },

    getClaimsByStatus: (status) => {
      return state.claims.filter(c => c.status === status);
    },

    getPendingApprovals: (_userId: string, userRole: string) => {
      // Manager: needs to approve SUBMITTED claims from their department
      if (userRole.includes('manager') && !userRole.includes('hr') && !userRole.includes('finance')) {
        return state.claims.filter(c => c.status === 'SUBMITTED');
      }
      
      // HR Manager: needs to approve MANAGER_APPROVED claims
      if (userRole === 'hr_manager') {
        return state.claims.filter(c => c.status === 'MANAGER_APPROVED');
      }
      
      // Finance Manager: needs to approve HR_APPROVED claims
      if (userRole === 'finance_manager') {
        return state.claims.filter(c => c.status === 'HR_APPROVED');
      }
      
      return [];
    },
  };
};
