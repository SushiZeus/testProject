// Fixed Assets Module Types

export type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE' | 'DISPOSED' | 'LOST' | 'DAMAGED';
export type AssetCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
export type DepreciationMethod = 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'UNITS_OF_PRODUCTION';
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY' | 'ROUTINE';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type DisposalMethod = 'SALE' | 'DONATION' | 'SCRAP' | 'TRADE_IN' | 'WRITE_OFF';

export interface FixedAsset {
  id: string;
  code: string;
  name: string;
  category: string;
  serialNumber?: string;
  description?: string;
  purchaseDate: Date;
  purchaseCost: number;
  supplier?: string;
  warrantyExpiry?: Date;
  location: string;
  department: string;
  assignedTo?: string;
  assignedToName?: string;
  condition: AssetCondition;
  status: AssetStatus;
  bookValue: number;
  accumulatedDepreciation: number;
  depreciationMethod: DepreciationMethod;
  usefulLife: number; // in months
  salvageValue: number;
  lastDepreciationDate?: Date;
  photoUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  employeeId: string;
  employeeName: string;
  department: string;
  assignedDate: Date;
  returnDate?: Date;
  condition: AssetCondition;
  notes?: string;
  assignedBy: string;
  returnedBy?: string;
  status: 'ASSIGNED' | 'RETURNED';
  createdAt: Date;
}

export interface AssetMaintenance {
  id: string;
  maintenanceNumber: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  type: MaintenanceType;
  title: string;
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  cost: number;
  vendor?: string;
  performedBy?: string;
  status: MaintenanceStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetDisposal {
  id: string;
  disposalNumber: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  method: DisposalMethod;
  disposalDate: Date;
  bookValue: number;
  disposalValue: number;
  gainLoss: number;
  reason: string;
  approvedBy?: string;
  approvedDate?: Date;
  buyer?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface DepreciationRun {
  id: string;
  runNumber: string;
  period: string;
  month: number;
  year: number;
  assetsCount: number;
  totalDepreciation: number;
  status: 'DRAFT' | 'COMPLETED';
  runDate: Date;
  runBy: string;
  createdAt: Date;
}

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  depreciationMethod: DepreciationMethod;
  defaultUsefulLife: number;
  defaultSalvageValue: number;
  active: boolean;
}
