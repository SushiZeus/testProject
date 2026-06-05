import { useState, useEffect } from 'react';
import type { OutsourcingContract, Vendor, Deliverable, VendorInvoice } from '@/types/outsourcing';

interface OutsourcingState {
  contracts: OutsourcingContract[];
  vendors: Vendor[];
  deliverables: Deliverable[];
  invoices: VendorInvoice[];
  createContract: (data: Omit<OutsourcingContract, 'id' | 'contractNumber' | 'createdAt' | 'updatedAt'>) => OutsourcingContract;
  createVendor: (data: Omit<Vendor, 'id' | 'vendorNumber' | 'contracts' | 'totalValue' | 'createdAt' | 'updatedAt'>) => Vendor;
  createDeliverable: (data: Omit<Deliverable, 'id' | 'deliverableNumber' | 'createdAt' | 'updatedAt'>) => Deliverable;
  createInvoice: (data: Omit<VendorInvoice, 'id' | 'createdAt'>) => VendorInvoice;
  completeDeliverable: (deliverableId: string, reviewedBy: string, comments: string) => void;
}

const generateNumber = (prefix: string, existing: any[]): string => {
  const year = new Date().getFullYear();
  const count = existing.length + 1;
  return `${prefix}-${year}-${count.toString().padStart(4, '0')}`;
};

const loadState = () => {
  if (typeof window === 'undefined') return { contracts: [], vendors: [], deliverables: [], invoices: [] };
  try {
    const saved = localStorage.getItem('outsourcingStore');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        contracts: parsed.contracts.map((c: any) => ({ ...c, startDate: new Date(c.startDate), endDate: new Date(c.endDate), renewalDate: c.renewalDate ? new Date(c.renewalDate) : undefined, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) })),
        vendors: parsed.vendors.map((v: any) => ({ ...v, createdAt: new Date(v.createdAt), updatedAt: new Date(v.updatedAt) })),
        deliverables: parsed.deliverables.map((d: any) => ({ ...d, dueDate: new Date(d.dueDate), completedDate: d.completedDate ? new Date(d.completedDate) : undefined, createdAt: new Date(d.createdAt), updatedAt: new Date(d.updatedAt) })),
        invoices: parsed.invoices.map((i: any) => ({ ...i, invoiceDate: new Date(i.invoiceDate), dueDate: new Date(i.dueDate), paidDate: i.paidDate ? new Date(i.paidDate) : undefined, createdAt: new Date(i.createdAt) })),
      };
    }
  } catch (error) {
    console.error('Error loading outsourcing state:', error);
  }
  return { contracts: [], vendors: [], deliverables: [], invoices: [] };
};

const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('outsourcingStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving outsourcing state:', error);
    }
  }
};

let state = loadState();
const listeners = new Set<() => void>();

const notify = () => {
  saveState(state);
  listeners.forEach(fn => fn());
};

export const useOutsourcingStore = (): OutsourcingState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return {
    get contracts() { return state.contracts; },
    get vendors() { return state.vendors; },
    get deliverables() { return state.deliverables; },
    get invoices() { return state.invoices; },

    createContract: (data) => {
      const newContract: OutsourcingContract = {
        id: Math.random().toString(36).substr(2, 9),
        contractNumber: generateNumber('CON', state.contracts),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state = { ...state, contracts: [...state.contracts, newContract] };
      notify();
      return newContract;
    },

    createVendor: (data) => {
      const newVendor: Vendor = {
        id: Math.random().toString(36).substr(2, 9),
        vendorNumber: generateNumber('VEN', state.vendors),
        ...data,
        contracts: 0,
        totalValue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state = { ...state, vendors: [...state.vendors, newVendor] };
      notify();
      return newVendor;
    },

    createDeliverable: (data) => {
      const newDeliverable: Deliverable = {
        id: Math.random().toString(36).substr(2, 9),
        deliverableNumber: generateNumber('DEL', state.deliverables),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state = { ...state, deliverables: [...state.deliverables, newDeliverable] };
      notify();
      return newDeliverable;
    },

    createInvoice: (data) => {
      const newInvoice: VendorInvoice = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date(),
      };
      state = { ...state, invoices: [...state.invoices, newInvoice] };
      notify();
      return newInvoice;
    },

    completeDeliverable: (deliverableId, reviewedBy, comments) => {
      state = {
        ...state,
        deliverables: state.deliverables.map((d: any) =>
          d.id === deliverableId ? {
            ...d,
            status: 'COMPLETED',
            completedDate: new Date(),
            reviewedBy,
            reviewComments: comments,
            updatedAt: new Date(),
          } : d
        ),
      };
      notify();
    },
  };
};
