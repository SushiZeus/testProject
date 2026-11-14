import { useState, useEffect } from 'react';
import type { Permit, PaymentOption } from '@/types';
import { mockPermits, getUserById } from '@/data/mockData';

interface PermitState {
  permits: Permit[];
  createPermit: (data: {
    fileId: string;
    permitType: string;
    requestedBy: string;
    invoiceUrl?: string;
    paymentOption?: PaymentOption;
  }) => Permit;
  updatePermit: (
    permitId: string,
    data: {
      permitUrl?: string;
      isPaid?: boolean;
      paidBy?: string;
      paidAt?: Date;
      paymentOption?: PaymentOption;
    }
  ) => void;
  getPermitById: (id: string) => Permit | undefined;
  getPermitsByFile: (fileId: string) => Permit[];
  getPendingPermits: () => Permit[];
  getPendingPaymentPermits: () => Permit[];
}

const loadState = (): { permits: Permit[] } => {
  if (typeof window === 'undefined') return { permits: mockPermits };

  try {
    const savedState = localStorage.getItem('permitStore');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        permits: (parsed.permits || []).map((permit: any) => ({
          ...permit,
          createdAt: new Date(permit.createdAt),
          updatedAt: new Date(permit.updatedAt),
          paidAt: permit.paidAt ? new Date(permit.paidAt) : undefined,
        })),
      };
    }
  } catch (error) {
    console.error('Error loading permit state:', error);
  }

  return { permits: mockPermits };
};

let state = loadState();

const listeners = new Set<() => void>();
const notify = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('permitStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving permit state:', error);
    }
  }
  listeners.forEach(fn => fn());
};

const enrichPermit = (permit: Permit): Permit => ({
  ...permit,
  requester: getUserById(permit.requestedBy),
});

export const usePermitStore = (): PermitState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    get permits() { return state.permits; },

    createPermit: (data) => {
      const newPermit: Permit = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      state = {
        ...state,
        permits: [...state.permits, newPermit],
      };
      notify();
      return newPermit;
    },

    updatePermit: (permitId, data) => {
      state = {
        ...state,
        permits: state.permits.map(p =>
          p.id === permitId
            ? { ...p, ...data, updatedAt: new Date() }
            : p
        ),
      };
      notify();
    },

    getPermitById: (id) => {
      const permit = state.permits.find(p => p.id === id);
      if (permit) {
        return {
          ...permit,
          requester: getUserById(permit.requestedBy),
        };
      }
      return undefined;
    },

    getPermitsByFile: (fileId) => {
      return state.permits
        .filter(p => p.fileId === fileId)
        .map(p => {
          const enriched = enrichPermit(p);
          return enriched!;
        });
    },

    getPendingPermits: () => {
      return state.permits
        .filter(p => !p.permitUrl)
        .map(p => {
          const enriched = enrichPermit(p);
          return enriched!;
        });
    },

    getPendingPaymentPermits: () => {
      return state.permits
        .filter(p => p.invoiceUrl && !p.isPaid)
        .map(p => {
          const enriched = enrichPermit(p);
          return enriched!;
        });
    },
  };
};
