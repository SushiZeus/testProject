import { useState, useEffect } from 'react';
import type { LeaveRequest, LeaveStatus, LeaveType } from '@/types';
import { getUserById } from '@/data/mockData';

interface LeaveState {
  requests: LeaveRequest[];
  createRequest: (data: {
    userId: string;
    leaveType: LeaveType;
    startDate: Date;
    endDate: Date;
    numberOfDays: number;
    description: string;
  }) => LeaveRequest;
  updateStatus: (
    requestId: string,
    newStatus: LeaveStatus,
    hrManagerId: string,
    hrComment?: string
  ) => void;
  cancelRequest: (requestId: string) => void;
  getRequestById: (id: string) => LeaveRequest | undefined;
  getRequestsByUser: (userId: string) => LeaveRequest[];
  getAllRequests: () => LeaveRequest[];
  getPendingRequests: () => LeaveRequest[];
  getUserLeaveBalance: (userId: string) => {
    annualLeaveBalance: number;
    sickLeaveBalance: number;
    totalLeaveTaken: number;
  };
}

const generateRequestNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `LR-${year}-${random}`;
};

// Calculate number of working days between two dates (excluding weekends)
const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

// Mock initial leave requests
const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'lr_001',
    requestNumber: 'LR-2026-0001',
    userId: '1',
    leaveType: 'ANNUAL',
    startDate: new Date('2026-02-10'),
    endDate: new Date('2026-02-14'),
    numberOfDays: 5,
    description: 'Family vacation',
    status: 'APPROVED',
    hrManagerId: '15',
    hrComment: 'Approved. Enjoy your vacation!',
    reviewedAt: new Date('2026-02-05'),
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-05'),
  },
  {
    id: 'lr_002',
    requestNumber: 'LR-2026-0002',
    userId: '3',
    leaveType: 'SICK',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-03-03'),
    numberOfDays: 3,
    description: 'Flu and fever',
    status: 'APPROVED',
    hrManagerId: '15',
    hrComment: 'Approved. Get well soon!',
    reviewedAt: new Date('2026-03-01'),
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-01'),
  },
];

// Load state from localStorage or use defaults
const loadState = () => {
  if (typeof window === 'undefined') {
    return { requests: mockLeaveRequests };
  }

  try {
    const savedState = localStorage.getItem('leaveStore');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        requests: parsed.requests.map((r: any) => ({
          ...r,
          startDate: new Date(r.startDate),
          endDate: new Date(r.endDate),
          reviewedAt: r.reviewedAt ? new Date(r.reviewedAt) : undefined,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        })),
      };
    }
  } catch (error) {
    console.error('Error loading leave state:', error);
  }

  return { requests: mockLeaveRequests };
};

// Save state to localStorage
const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('leaveStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving leave state:', error);
    }
  }
};

let state: {
  requests: LeaveRequest[];
} = loadState();

const listeners = new Set<() => void>();

// Cache for enriched requests to prevent infinite re-renders
let cachedEnrichedLeaveRequests: any[] = [];
let leaveRequestsCacheInvalidated = true;

const notify = () => {
  saveState(state);
  leaveRequestsCacheInvalidated = true; // Invalidate cache when state changes
  listeners.forEach(fn => fn());
};

export const useLeaveStore = (): LeaveState => {
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
      if (!leaveRequestsCacheInvalidated && cachedEnrichedLeaveRequests.length === state.requests.length) {
        return cachedEnrichedLeaveRequests;
      }
      
      cachedEnrichedLeaveRequests = state.requests.map((r: LeaveRequest) => ({
        ...r,
        user: getUserById(r.userId),
        hrManager: r.hrManagerId ? getUserById(r.hrManagerId) : undefined,
      }));
      leaveRequestsCacheInvalidated = false;
      return cachedEnrichedLeaveRequests;
    },

    createRequest: (data) => {
      const newRequest: LeaveRequest = {
        id: Math.random().toString(36).substr(2, 9),
        requestNumber: generateRequestNumber(),
        ...data,
        status: 'PENDING',
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

    updateStatus: (requestId, newStatus, hrManagerId, hrComment) => {
      state = {
        ...state,
        requests: state.requests.map((r: LeaveRequest) =>
          r.id === requestId
            ? {
                ...r,
                status: newStatus,
                hrManagerId,
                hrComment,
                reviewedAt: new Date(),
                updatedAt: new Date(),
              }
            : r
        ),
      };
      notify();
    },

    cancelRequest: (requestId) => {
      state = {
        ...state,
        requests: state.requests.map((r: LeaveRequest) =>
          r.id === requestId && r.status === 'PENDING'
            ? { ...r, status: 'CANCELLED', updatedAt: new Date() }
            : r
        ),
      };
      notify();
    },

    getRequestById: (id) => {
      const request = state.requests.find((r: LeaveRequest) => r.id === id);
      if (request) {
        return {
          ...request,
          user: getUserById(request.userId),
          hrManager: request.hrManagerId ? getUserById(request.hrManagerId) : undefined,
        };
      }
      return undefined;
    },

    getRequestsByUser: (userId) => {
      return state.requests
        .filter((r: LeaveRequest) => r.userId === userId)
        .map((r: LeaveRequest) => ({
          ...r,
          user: getUserById(r.userId),
          hrManager: r.hrManagerId ? getUserById(r.hrManagerId) : undefined,
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    getAllRequests: () => {
      return state.requests
        .map((r: LeaveRequest) => ({
          ...r,
          user: getUserById(r.userId),
          hrManager: r.hrManagerId ? getUserById(r.hrManagerId) : undefined,
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    getPendingRequests: () => {
      return state.requests
        .filter((r: LeaveRequest) => r.status === 'PENDING')
        .map((r: LeaveRequest) => ({
          ...r,
          user: getUserById(r.userId),
          hrManager: r.hrManagerId ? getUserById(r.hrManagerId) : undefined,
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    getUserLeaveBalance: (userId) => {
      const currentYear = new Date().getFullYear();
      
      // Get all approved leave requests for current year
      const approvedRequests = state.requests.filter(
        (r: LeaveRequest) =>
          r.userId === userId &&
          r.status === 'APPROVED' &&
          r.startDate.getFullYear() === currentYear
      );

      // Calculate total leave taken from annual leave balance
      // ALL LEAVE TYPES deduct from annual leave days (regardless of type)
      const totalLeaveTaken = approvedRequests.reduce((sum, r) => sum + r.numberOfDays, 0);

      // Standard annual leave allocation per year
      const annualLeaveAllocation = 28;

      return {
        annualLeaveBalance: Math.max(0, annualLeaveAllocation - totalLeaveTaken),
        sickLeaveBalance: 0, // Not tracked separately - deducts from annual
        totalLeaveTaken: totalLeaveTaken,
      };
    },
  };
};

// Export helper function for calculating working days
export { calculateWorkingDays };
