import { useState, useEffect } from 'react';
import type { InventoryItem, PurchaseOrder, StockRequest, Supplier, ItemLocation } from '@/types/inventory';

interface InventoryState {
  items: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  stockRequests: StockRequest[];
  suppliers: Supplier[];
  createItem: (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'locations'>) => InventoryItem;
  createPO: (data: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'updatedAt'>) => PurchaseOrder;
  createStockRequest: (data: Omit<StockRequest, 'id' | 'requestNumber' | 'createdAt'>) => StockRequest;
  createSupplier: (data: Omit<Supplier, 'id' | 'code' | 'createdAt'>) => Supplier;
  updateItemStock: (itemId: string, location: string, quantity: number) => void;
  approvePO: (poId: string, approvedBy: string) => void;
  approveStockRequest: (requestId: string, approvedBy: string) => void;
}

const generateCode = (prefix: string, existing: any[]): string => {
  const year = new Date().getFullYear();
  const count = existing.filter(i => i.code?.startsWith(`${prefix}-${year}`) || i.poNumber?.startsWith(`${prefix}-${year}`) || i.requestNumber?.startsWith(`${prefix}-${year}`)).length + 1;
  return `${prefix}-${year}-${count.toString().padStart(4, '0')}`;
};

const loadState = () => {
  if (typeof window === 'undefined') return { items: [], purchaseOrders: [], stockRequests: [], suppliers: [] };
  try {
    const saved = localStorage.getItem('inventoryStore');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        items: parsed.items.map((i: any) => ({ ...i, createdAt: new Date(i.createdAt), updatedAt: new Date(i.updatedAt) })),
        purchaseOrders: parsed.purchaseOrders.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt) })),
        stockRequests: parsed.stockRequests.map((s: any) => ({ ...s, requestDate: new Date(s.requestDate), createdAt: new Date(s.createdAt) })),
        suppliers: parsed.suppliers.map((s: any) => ({ ...s, createdAt: new Date(s.createdAt) })),
      };
    }
  } catch (error) {
    console.error('Error loading inventory state:', error);
  }
  return { items: [], purchaseOrders: [], stockRequests: [], suppliers: [] };
};

const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('inventoryStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving inventory state:', error);
    }
  }
};

let state = loadState();
const listeners = new Set<() => void>();

const notify = () => {
  saveState(state);
  listeners.forEach(fn => fn());
};

export const useInventoryStore = (): InventoryState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return {
    get items() { return state.items; },
    get purchaseOrders() { return state.purchaseOrders; },
    get stockRequests() { return state.stockRequests; },
    get suppliers() { return state.suppliers; },

    createItem: (data) => {
      const newItem: InventoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        code: data.code || generateCode('ITM', state.items),
        locations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state = { ...state, items: [...state.items, newItem] };
      notify();
      return newItem;
    },

    createPO: (data) => {
      const newPO: PurchaseOrder = {
        id: Math.random().toString(36).substr(2, 9),
        poNumber: generateCode('PO', state.purchaseOrders),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state = { ...state, purchaseOrders: [...state.purchaseOrders, newPO] };
      notify();
      return newPO;
    },

    createStockRequest: (data) => {
      const newRequest: StockRequest = {
        id: Math.random().toString(36).substr(2, 9),
        requestNumber: generateCode('SR', state.stockRequests),
        ...data,
        createdAt: new Date(),
      };
      state = { ...state, stockRequests: [...state.stockRequests, newRequest] };
      notify();
      return newRequest;
    },

    createSupplier: (data) => {
      const newSupplier: Supplier = {
        id: Math.random().toString(36).substr(2, 9),
        code: generateCode('SUP', state.suppliers),
        ...data,
        createdAt: new Date(),
      };
      state = { ...state, suppliers: [...state.suppliers, newSupplier] };
      notify();
      return newSupplier;
    },

    updateItemStock: (itemId, location, quantity) => {
      state = {
        ...state,
        items: state.items.map((item: InventoryItem) => {
          if (item.id === itemId) {
            const existingLoc = item.locations.find((l: ItemLocation) => l.location === location);
            if (existingLoc) {
              return {
                ...item,
                locations: item.locations.map((l: ItemLocation) => 
                  l.location === location ? { ...l, quantity: l.quantity + quantity, lastUpdated: new Date() } : l
                ),
                updatedAt: new Date(),
              };
            } else {
              return {
                ...item,
                locations: [...item.locations, { location, quantity, lastUpdated: new Date() }],
                updatedAt: new Date(),
              };
            }
          }
          return item;
        }),
      };
      notify();
    },

    approvePO: (poId, approvedBy) => {
      state = {
        ...state,
        purchaseOrders: state.purchaseOrders.map((po: PurchaseOrder) =>
          po.id === poId ? { ...po, status: 'APPROVED', approvedBy, updatedAt: new Date() } : po
        ),
      };
      notify();
    },

    approveStockRequest: (requestId, approvedBy) => {
      state = {
        ...state,
        stockRequests: state.stockRequests.map((req: StockRequest) =>
          req.id === requestId ? { ...req, status: 'APPROVED', approvedBy, approvedDate: new Date() } : req
        ),
      };
      notify();
    },
  };
};
