// Outsourcing Module Types

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWED';
export type DeliverableStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'REJECTED';
export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';

export interface OutsourcingContract {
  id: string;
  contractNumber: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description: string;
  serviceType: string;
  startDate: Date;
  endDate: Date;
  value: number;
  paymentTerms: string;
  deliverables: string[];
  sla: SLA;
  status: ContractStatus;
  renewalDate?: Date;
  terminationReason?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SLA {
  responseTime: number; // hours
  resolutionTime: number; // hours
  availability: number; // percentage
  penalties: string;
}

export interface Vendor {
  id: string;
  vendorNumber: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  rating: number; // 1-5
  status: VendorStatus;
  contracts: number;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deliverable {
  id: string;
  deliverableNumber: string;
  contractId: string;
  contractNumber: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  status: DeliverableStatus;
  attachments: string[];
  reviewedBy?: string;
  reviewComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  contractId: string;
  contractNumber: string;
  deliverableId?: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  invoiceDate: Date;
  dueDate: Date;
  paidDate?: Date;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  approvedBy?: string;
  createdAt: Date;
}

export interface VendorPerformance {
  vendorId: string;
  vendorName: string;
  period: string;
  onTimeDelivery: number; // percentage
  qualityRating: number; // 1-5
  slaCompliance: number; // percentage
  totalContracts: number;
  completedDeliverables: number;
  delayedDeliverables: number;
  overallRating: number; // 1-5
}
