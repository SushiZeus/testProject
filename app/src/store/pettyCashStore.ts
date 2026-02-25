import { useState, useEffect } from 'react';
import type { PettyCashRequest, PettyCashStatus } from '@/types';
import { mockPettyCashRequests, getUserById } from '@/data/mockData';

interface PettyCashState {
  requests: PettyCashRequest[];
  createRequest: (data: {
    fileId?: string;
    requestedBy: string;
    amount: number;
    currency: string;
    description: string;
    attachmentUrl?: string;
  }) => PettyCashRequest;
  updateStatus: (
    requestId: string,
    newStatus: PettyCashStatus,
    data?: {
      managerId?: string;
      managerComment?: string;
      cooId?: string;
      cooComment?: string;
      financeManagerId?: string;
      financeComment?: string;
      cashierId?: string;
      paymentReference?: string;
      hrManagerId?: string;
      hrComment?: string;
    }
  ) => void;
  getRequestById: (id: string) => PettyCashRequest | undefined;
  getRequestsByFile: (fileId: string) => PettyCashRequest[];
  getRequestsByRequester: (requesterId: string) => PettyCashRequest[];
  getPendingApprovalsForManager: (managerId: string) => PettyCashRequest[];
  getPendingApprovalsForHR: () => PettyCashRequest[];
  getPendingApprovalsForCOO: () => PettyCashRequest[];
  getPendingPayments: () => PettyCashRequest[];
}

const generateRequestNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `PCR-${year}-${random}`;
};

// Load state from localStorage or use defaults
const loadPettyCashState = () => {
  if (typeof window === 'undefined') {
    return {
      requests: mockPettyCashRequests,
    };
  }

  try {
    const savedState = localStorage.getItem('pettyCashStore');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        requests: parsed.requests.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
          managerActionAt: r.managerActionAt ? new Date(r.managerActionAt) : undefined,
          cooActionAt: r.cooActionAt ? new Date(r.cooActionAt) : undefined,
          financeActionAt: r.financeActionAt ? new Date(r.financeActionAt) : undefined,
          paidAt: r.paidAt ? new Date(r.paidAt) : undefined,
        })),
      };
    }
  } catch (error) {
    console.error('Error loading petty cash state:', error);
  }

  return {
    requests: mockPettyCashRequests,
  };
};

// Save state to localStorage
const savePettyCashState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('pettyCashStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving petty cash state:', error);
    }
  }
};

let state = loadPettyCashState();

const listeners = new Set<() => void>();
const notify = () => {
  savePettyCashState(state);
  listeners.forEach(fn => fn());
};

export const usePettyCashStore = (): PettyCashState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    get requests() { 
      return state.requests.map((r: PettyCashRequest) => ({
        ...r,
        requester: getUserById(r.requestedBy),
        manager: r.managerId ? getUserById(r.managerId) : undefined,
        coo: r.cooId ? getUserById(r.cooId) : undefined,
        financeManager: r.financeManagerId ? getUserById(r.financeManagerId) : undefined,
        cashier: r.cashierId ? getUserById(r.cashierId) : undefined,
      }));
    },

    createRequest: (data) => {
      // Determine initial status based on requester role
      let initialStatus: PettyCashStatus = 'PENDING_MANAGER_APPROVAL';
      
      // Documentation officer requests go to HR first
      const requester = getUserById(data.requestedBy);
      if (requester?.role === 'documentation_officer') {
        initialStatus = 'PENDING_HR_APPROVAL';
      }

      const newRequest: PettyCashRequest = {
        id: Math.random().toString(36).substr(2, 9),
        requestNumber: generateRequestNumber(),
        ...data,
        status: initialStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      state = {
        ...state,
        requests: [...state.requests, newRequest],
      };
      notify();
      return newRequest;
    },

    updateStatus: (requestId, newStatus, data = {}) => {
      state = {
        ...state,
        requests: state.requests.map((r: PettyCashRequest) =>
          r.id === requestId
            ? {
                ...r,
                ...data,
                status: newStatus,
                updatedAt: new Date(),
                ...(data.managerId && { managerActionAt: new Date() }),
                ...(data.cooId && { cooActionAt: new Date() }),
                ...(data.financeManagerId && { financeActionAt: new Date() }),
                ...(data.cashierId && { paidAt: new Date() }),
              }
            : r
        ),
      };
      notify();
    },

    getRequestById: (id) => {
      const request = state.requests.find((r: PettyCashRequest) => r.id === id);
      if (request) {
        return {
          ...request,
          requester: getUserById(request.requestedBy),
          manager: request.managerId ? getUserById(request.managerId) : undefined,
          coo: request.cooId ? getUserById(request.cooId) : undefined,
          financeManager: request.financeManagerId ? getUserById(request.financeManagerId) : undefined,
          cashier: request.cashierId ? getUserById(request.cashierId) : undefined,
        };
      }
      return undefined;
    },

    getRequestsByFile: (fileId) => {
      return state.requests
        .filter((r: PettyCashRequest) => r.fileId === fileId)
        .map((r: PettyCashRequest) => ({
          ...r,
          requester: getUserById(r.requestedBy),
          manager: r.managerId ? getUserById(r.managerId) : undefined,
          coo: r.cooId ? getUserById(r.cooId) : undefined,
          financeManager: r.financeManagerId ? getUserById(r.financeManagerId) : undefined,
          cashier: r.cashierId ? getUserById(r.cashierId) : undefined,
        }));
    },

    getRequestsByRequester: (requesterId) => {
      return state.requests
        .filter((r: PettyCashRequest) => r.requestedBy === requesterId)
        .map((r: PettyCashRequest) => ({
          ...r,
          requester: getUserById(r.requestedBy),
          manager: r.managerId ? getUserById(r.managerId) : undefined,
          coo: r.cooId ? getUserById(r.cooId) : undefined,
          financeManager: r.financeManagerId ? getUserById(r.financeManagerId) : undefined,
          cashier: r.cashierId ? getUserById(r.cashierId) : undefined,
        }));
    },

    getPendingApprovalsForManager: () => {
      return state.requests
        .filter((r: PettyCashRequest) => r.status === 'PENDING_MANAGER_APPROVAL')
        .map((r: PettyCashRequest) => ({
          ...r,
          requester: getUserById(r.requestedBy),
          manager: r.managerId ? getUserById(r.managerId) : undefined,
          coo: r.cooId ? getUserById(r.cooId) : undefined,
          financeManager: r.financeManagerId ? getUserById(r.financeManagerId) : undefined,
          cashier: r.cashierId ? getUserById(r.cashierId) : undefined,
        }));
    },

    getPendingApprovalsForHR: () => {
      return state.requests
        .filter((r: PettyCashRequest) => r.status === 'PENDING_HR_APPROVAL')
        .map((r: PettyCashRequest) => ({
          ...r,
          requester: getUserById(r.requestedBy),
          manager: r.managerId ? getUserById(r.managerId) : undefined,
          coo: r.cooId ? getUserById(r.cooId) : undefined,
          financeManager: r.financeManagerId ? getUserById(r.financeManagerId) : undefined,
          cashier: r.cashierId ? getUserById(r.cashierId) : undefined,
        }));
    },

    getPendingApprovalsForCOO: () => {
      return state.requests
        .filter((r: PettyCashRequest) => r.status === 'PENDING_COO_APPROVAL')
        .map((r: PettyCashRequest) => ({
          ...r,
          requester: getUserById(r.requestedBy),
          manager: r.managerId ? getUserById(r.managerId) : undefined,
          coo: r.cooId ? getUserById(r.cooId) : undefined,
          financeManager: r.financeManagerId ? getUserById(r.financeManagerId) : undefined,
          cashier: r.cashierId ? getUserById(r.cashierId) : undefined,
        }));
    },

    getPendingPayments: () => {
      return state.requests
        .filter((r: PettyCashRequest) => r.status === 'PENDING_PAYMENT')
        .map((r: PettyCashRequest) => ({
          ...r,
          requester: getUserById(r.requestedBy),
          manager: r.managerId ? getUserById(r.managerId) : undefined,
          coo: r.cooId ? getUserById(r.cooId) : undefined,
          financeManager: r.financeManagerId ? getUserById(r.financeManagerId) : undefined,
          cashier: r.cashierId ? getUserById(r.cashierId) : undefined,
        }));
    },
  };
};
