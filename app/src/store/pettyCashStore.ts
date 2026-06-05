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
      declarationManagerId?: string;
      declarationManagerComment?: string;
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
  deleteRequest: (requestId: string) => void;
  getRequestById: (id: string) => PettyCashRequest | undefined;
  getRequestsByFile: (fileId: string) => PettyCashRequest[];
  getRequestsByRequester: (requesterId: string) => PettyCashRequest[];
  getPendingApprovalsForManager: (managerId: string) => PettyCashRequest[];
  getPendingApprovalsForDeclarationManager: () => PettyCashRequest[];
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

// Cache for enriched requests to prevent infinite re-renders
let cachedEnrichedRequests: any[] = [];
let requestsCacheInvalidated = true;

const notify = () => {
  savePettyCashState(state);
  requestsCacheInvalidated = true; // Invalidate cache when state changes
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
      // Return cached requests if cache is still valid
      if (!requestsCacheInvalidated && cachedEnrichedRequests.length === state.requests.length) {
        return cachedEnrichedRequests;
      }
      
      cachedEnrichedRequests = state.requests.map((r: PettyCashRequest) => ({
        ...r,
        requester: getUserById(r.requestedBy),
        hrManager: r.hrManagerId ? getUserById(r.hrManagerId) : undefined,
        manager: r.managerId ? getUserById(r.managerId) : undefined,
        declarationManager: r.declarationManagerId ? getUserById(r.declarationManagerId) : undefined,
        coo: r.cooId ? getUserById(r.cooId) : undefined,
        financeManager: r.financeManagerId ? getUserById(r.financeManagerId) : undefined,
        cashier: r.cashierId ? getUserById(r.cashierId) : undefined,
      }));
      requestsCacheInvalidated = false;
      return cachedEnrichedRequests;
    },

    createRequest: (data) => {
      // Validate required fields
      if (!data.description || data.description.trim().length === 0) {
        throw new Error('Description is required');
      }
      if (!data.amount || data.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (!data.currency || data.currency.trim().length === 0) {
        throw new Error('Currency is required');
      }

      // Determine initial status based on requester role and department
      let initialStatus: PettyCashStatus = 'PENDING_MANAGER_APPROVAL';
      
      const requester = getUserById(data.requestedBy);
      
      if (requester?.role === 'coo') {
        // COO requests go directly to finance manager (no approval needed)
        initialStatus = 'COO_DIRECT_TO_FINANCE';
      } else if (requester?.role === 'documentation_officer') {
        // Documentation officer requests go to HR first
        initialStatus = 'PENDING_HR_APPROVAL';
      } else if (requester?.role === 'declarant') {
        // Declarant requests go to Declaration Manager first
        initialStatus = 'PENDING_DECLARATION_MANAGER_APPROVAL';
      } else if (requester?.role === 'shipping_line_clerk') {
        // Shipping line clerk requests go to Operations Manager first
        initialStatus = 'PENDING_MANAGER_APPROVAL';
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
                ...(data.hrManagerId && { hrActionAt: new Date() }),
                ...(data.managerId && { managerActionAt: new Date() }),
                ...(data.declarationManagerId && { declarationManagerActionAt: new Date() }),
                ...(data.cooId && { cooActionAt: new Date() }),
                ...(data.financeManagerId && { financeActionAt: new Date() }),
                ...(data.cashierId && { paidAt: new Date() }),
              }
            : r
        ),
      };
      notify();
    },

    deleteRequest: (requestId) => {
      state = {
        ...state,
        requests: state.requests.filter((r: PettyCashRequest) => r.id !== requestId),
      };
      notify();
    },

    getRequestById: (id) => {
      const request = state.requests.find((r: PettyCashRequest) => r.id === id);
      if (request) {
        return {
          ...request,
          requester: getUserById(request.requestedBy),
          hrManager: request.hrManagerId ? getUserById(request.hrManagerId) : undefined,
          manager: request.managerId ? getUserById(request.managerId) : undefined,
          declarationManager: request.declarationManagerId ? getUserById(request.declarationManagerId) : undefined,
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
          hrManager: r.hrManagerId ? getUserById(r.hrManagerId) : undefined,
          manager: r.managerId ? getUserById(r.managerId) : undefined,
          declarationManager: r.declarationManagerId ? getUserById(r.declarationManagerId) : undefined,
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
          hrManager: r.hrManagerId ? getUserById(r.hrManagerId) : undefined,
          manager: r.managerId ? getUserById(r.managerId) : undefined,
          declarationManager: r.declarationManagerId ? getUserById(r.declarationManagerId) : undefined,
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
          hrManager: r.hrManagerId ? getUserById(r.hrManagerId) : undefined,
          manager: r.managerId ? getUserById(r.managerId) : undefined,
          declarationManager: r.declarationManagerId ? getUserById(r.declarationManagerId) : undefined,
          coo: r.cooId ? getUserById(r.cooId) : undefined,
          financeManager: r.financeManagerId ? getUserById(r.financeManagerId) : undefined,
          cashier: r.cashierId ? getUserById(r.cashierId) : undefined,
        }));
    },

    getPendingApprovalsForDeclarationManager: () => {
      return state.requests
        .filter((r: PettyCashRequest) => r.status === 'PENDING_DECLARATION_MANAGER_APPROVAL')
        .map((r: PettyCashRequest) => ({
          ...r,
          requester: getUserById(r.requestedBy),
          hrManager: r.hrManagerId ? getUserById(r.hrManagerId) : undefined,
          manager: r.managerId ? getUserById(r.managerId) : undefined,
          declarationManager: r.declarationManagerId ? getUserById(r.declarationManagerId) : undefined,
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
          hrManager: r.hrManagerId ? getUserById(r.hrManagerId) : undefined,
          manager: r.managerId ? getUserById(r.managerId) : undefined,
          declarationManager: r.declarationManagerId ? getUserById(r.declarationManagerId) : undefined,
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
          hrManager: r.hrManagerId ? getUserById(r.hrManagerId) : undefined,
          manager: r.managerId ? getUserById(r.managerId) : undefined,
          declarationManager: r.declarationManagerId ? getUserById(r.declarationManagerId) : undefined,
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
          hrManager: r.hrManagerId ? getUserById(r.hrManagerId) : undefined,
          manager: r.managerId ? getUserById(r.managerId) : undefined,
          declarationManager: r.declarationManagerId ? getUserById(r.declarationManagerId) : undefined,
          coo: r.cooId ? getUserById(r.cooId) : undefined,
          financeManager: r.financeManagerId ? getUserById(r.financeManagerId) : undefined,
          cashier: r.cashierId ? getUserById(r.cashierId) : undefined,
        }));
    },
  };
};
