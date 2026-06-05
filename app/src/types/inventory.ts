// Inventory Management Types

export type ItemStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
export type POStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
export type GRNStatus = 'DRAFT' | 'COMPLETED';
export type StockRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED' | 'CANCELLED';

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  reorderLevel: number;
  reorderQuantity: number;
  unitCost: number;
  status: ItemStatus;
  locations: ItemLocation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemLocation {
  location: string;
  quantity: number;
  lastUpdated: Date;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: POItem[];
  totalAmount: number;
  status: POStatus;
  requestedBy: string;
  approvedBy?: string;
  orderedDate?: Date;
  expectedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface POItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface GoodsReceivedNote {
  id: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: GRNItem[];
  receivedBy: string;
  receivedDate: Date;
  status: GRNStatus;
  notes?: string;
  createdAt: Date;
}

export interface GRNItem {
  id: string;
  itemId: string;
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  location: string;
}

export interface StockRequest {
  id: string;
  requestNumber: string;
  requestedBy: string;
  requestedByName: string;
  department: string;
  items: StockRequestItem[];
  status: StockRequestStatus;
  approvedBy?: string;
  issuedBy?: string;
  requestDate: Date;
  approvedDate?: Date;
  issuedDate?: Date;
  createdAt: Date;
}

export interface StockRequestItem {
  id: string;
  itemId: string;
  itemName: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  issuedQuantity?: number;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
}
