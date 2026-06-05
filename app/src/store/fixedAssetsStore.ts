import { useState, useEffect } from 'react';
import type { 
  FixedAsset, 
  AssetAssignment, 
  AssetMaintenance, 
  AssetDisposal,
  DepreciationRun,
  AssetStatus,
  AssetCondition,
  MaintenanceStatus
} from '@/types/fixedAssets';

interface FixedAssetsState {
  assets: FixedAsset[];
  assignments: AssetAssignment[];
  maintenances: AssetMaintenance[];
  disposals: AssetDisposal[];
  depreciationRuns: DepreciationRun[];
  
  // Assets
  createAsset: (data: Omit<FixedAsset, 'id' | 'createdAt' | 'updatedAt'>) => FixedAsset;
  updateAsset: (id: string, data: Partial<FixedAsset>) => void;
  deleteAsset: (id: string) => void;
  getAssetById: (id: string) => FixedAsset | undefined;
  getAssetsByStatus: (status: AssetStatus) => FixedAsset[];
  getAssetsByDepartment: (department: string) => FixedAsset[];
  
  // Assignments
  assignAsset: (data: Omit<AssetAssignment, 'id' | 'createdAt' | 'status'>) => void;
  returnAsset: (assignmentId: string, returnedBy: string, condition: AssetCondition, notes?: string) => void;
  getAssetAssignments: (assetId: string) => AssetAssignment[];
  getEmployeeAssignments: (employeeId: string) => AssetAssignment[];
  
  // Maintenance
  createMaintenance: (data: Omit<AssetMaintenance, 'id' | 'maintenanceNumber' | 'createdAt' | 'updatedAt'>) => AssetMaintenance;
  updateMaintenance: (id: string, data: Partial<AssetMaintenance>) => void;
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus, completedDate?: Date) => void;
  getAssetMaintenances: (assetId: string) => AssetMaintenance[];
  getUpcomingMaintenances: () => AssetMaintenance[];
  
  // Disposal
  disposeAsset: (data: Omit<AssetDisposal, 'id' | 'disposalNumber' | 'createdAt'>) => void;
  approveDisposal: (id: string, approvedBy: string) => void;
  
  // Depreciation
  runDepreciation: (month: number, year: number, runBy: string) => DepreciationRun;
  calculateDepreciation: (asset: FixedAsset, months: number) => number;
}

const generateAssetCode = (category: string, existingAssets: FixedAsset[]): string => {
  const prefix = category.substring(0, 3).toUpperCase();
  const count = existingAssets.filter(a => a.code.startsWith(prefix)).length + 1;
  return `${prefix}-${count.toString().padStart(4, '0')}`;
};

const generateMaintenanceNumber = (existingMaintenances: AssetMaintenance[]): string => {
  const year = new Date().getFullYear();
  const count = existingMaintenances.filter(m => m.maintenanceNumber.startsWith(`MNT-${year}`)).length + 1;
  return `MNT-${year}-${count.toString().padStart(4, '0')}`;
};

const generateDisposalNumber = (existingDisposals: AssetDisposal[]): string => {
  const year = new Date().getFullYear();
  const count = existingDisposals.filter(d => d.disposalNumber.startsWith(`DSP-${year}`)).length + 1;
  return `DSP-${year}-${count.toString().padStart(4, '0')}`;
};

const calculateStraightLineDepreciation = (cost: number, salvageValue: number, usefulLife: number, months: number): number => {
  const depreciableAmount = cost - salvageValue;
  const monthlyDepreciation = depreciableAmount / usefulLife;
  return monthlyDepreciation * months;
};

const loadState = () => {
  if (typeof window === 'undefined') {
    return { assets: [], assignments: [], maintenances: [], disposals: [], depreciationRuns: [] };
  }

  try {
    const savedState = localStorage.getItem('fixedAssetsStore');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        assets: parsed.assets.map((a: any) => ({
          ...a,
          purchaseDate: new Date(a.purchaseDate),
          warrantyExpiry: a.warrantyExpiry ? new Date(a.warrantyExpiry) : undefined,
          lastDepreciationDate: a.lastDepreciationDate ? new Date(a.lastDepreciationDate) : undefined,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
        })),
        assignments: parsed.assignments.map((a: any) => ({
          ...a,
          assignedDate: new Date(a.assignedDate),
          returnDate: a.returnDate ? new Date(a.returnDate) : undefined,
          createdAt: new Date(a.createdAt),
        })),
        maintenances: parsed.maintenances.map((m: any) => ({
          ...m,
          scheduledDate: new Date(m.scheduledDate),
          completedDate: m.completedDate ? new Date(m.completedDate) : undefined,
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
        })),
        disposals: parsed.disposals.map((d: any) => ({
          ...d,
          disposalDate: new Date(d.disposalDate),
          approvedDate: d.approvedDate ? new Date(d.approvedDate) : undefined,
          createdAt: new Date(d.createdAt),
        })),
        depreciationRuns: parsed.depreciationRuns.map((r: any) => ({
          ...r,
          runDate: new Date(r.runDate),
          createdAt: new Date(r.createdAt),
        })),
      };
    }
  } catch (error) {
    console.error('Error loading fixed assets state:', error);
  }

  return { assets: [], assignments: [], maintenances: [], disposals: [], depreciationRuns: [] };
};

const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('fixedAssetsStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving fixed assets state:', error);
    }
  }
};

let state: {
  assets: FixedAsset[];
  assignments: AssetAssignment[];
  maintenances: AssetMaintenance[];
  disposals: AssetDisposal[];
  depreciationRuns: DepreciationRun[];
} = loadState();

const listeners = new Set<() => void>();

const notify = () => {
  saveState(state);
  listeners.forEach(fn => fn());
};

export const useFixedAssetsStore = (): FixedAssetsState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    get assets() { return state.assets; },
    get assignments() { return state.assignments; },
    get maintenances() { return state.maintenances; },
    get disposals() { return state.disposals; },
    get depreciationRuns() { return state.depreciationRuns; },

    createAsset: (data) => {
      const newAsset: FixedAsset = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        code: data.code || generateAssetCode(data.category, state.assets),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      state = {
        ...state,
        assets: [...state.assets, newAsset],
      };
      notify();
      return newAsset;
    },

    updateAsset: (id, data) => {
      state = {
        ...state,
        assets: state.assets.map(a => a.id === id ? {
          ...a,
          ...data,
          updatedAt: new Date(),
        } : a),
      };
      notify();
    },

    deleteAsset: (id) => {
      state = {
        ...state,
        assets: state.assets.filter(a => a.id !== id),
      };
      notify();
    },

    getAssetById: (id) => {
      return state.assets.find(a => a.id === id);
    },

    getAssetsByStatus: (status) => {
      return state.assets.filter(a => a.status === status);
    },

    getAssetsByDepartment: (department) => {
      return state.assets.filter(a => a.department === department);
    },

    assignAsset: (data) => {
      const newAssignment: AssetAssignment = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        status: 'ASSIGNED',
        createdAt: new Date(),
      };

      // Update asset status
      state = {
        ...state,
        assignments: [...state.assignments, newAssignment],
        assets: state.assets.map(a => a.id === data.assetId ? {
          ...a,
          assignedTo: data.employeeId,
          assignedToName: data.employeeName,
          status: 'ACTIVE',
          updatedAt: new Date(),
        } : a),
      };
      notify();
    },

    returnAsset: (assignmentId, returnedBy, condition, notes) => {
      const assignment = state.assignments.find(a => a.id === assignmentId);
      if (!assignment) return;

      state = {
        ...state,
        assignments: state.assignments.map(a => a.id === assignmentId ? {
          ...a,
          status: 'RETURNED',
          returnDate: new Date(),
          returnedBy,
          condition,
          notes: notes || a.notes,
        } : a),
        assets: state.assets.map(a => a.id === assignment.assetId ? {
          ...a,
          assignedTo: undefined,
          assignedToName: undefined,
          condition,
          updatedAt: new Date(),
        } : a),
      };
      notify();
    },

    getAssetAssignments: (assetId) => {
      return state.assignments.filter(a => a.assetId === assetId);
    },

    getEmployeeAssignments: (employeeId) => {
      return state.assignments.filter(a => a.employeeId === employeeId && a.status === 'ASSIGNED');
    },

    createMaintenance: (data) => {
      const newMaintenance: AssetMaintenance = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        maintenanceNumber: generateMaintenanceNumber(state.maintenances),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      state = {
        ...state,
        maintenances: [...state.maintenances, newMaintenance],
      };
      notify();
      return newMaintenance;
    },

    updateMaintenance: (id, data) => {
      state = {
        ...state,
        maintenances: state.maintenances.map(m => m.id === id ? {
          ...m,
          ...data,
          updatedAt: new Date(),
        } : m),
      };
      notify();
    },

    updateMaintenanceStatus: (id, status, completedDate) => {
      state = {
        ...state,
        maintenances: state.maintenances.map(m => m.id === id ? {
          ...m,
          status,
          completedDate: completedDate || m.completedDate,
          updatedAt: new Date(),
        } : m),
      };
      notify();
    },

    getAssetMaintenances: (assetId) => {
      return state.maintenances.filter(m => m.assetId === assetId);
    },

    getUpcomingMaintenances: () => {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      return state.maintenances.filter(m => 
        m.status === 'SCHEDULED' && 
        m.scheduledDate >= today && 
        m.scheduledDate <= nextMonth
      );
    },

    disposeAsset: (data) => {
      const newDisposal: AssetDisposal = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        disposalNumber: generateDisposalNumber(state.disposals),
        createdAt: new Date(),
      };

      state = {
        ...state,
        disposals: [...state.disposals, newDisposal],
        assets: state.assets.map(a => a.id === data.assetId ? {
          ...a,
          status: 'DISPOSED',
          updatedAt: new Date(),
        } : a),
      };
      notify();
    },

    approveDisposal: (id, approvedBy) => {
      state = {
        ...state,
        disposals: state.disposals.map(d => d.id === id ? {
          ...d,
          approvedBy,
          approvedDate: new Date(),
        } : d),
      };
      notify();
    },

    runDepreciation: (month, year, runBy) => {
      const period = `${['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'][month - 1]} ${year}`;
      
      let totalDepreciation = 0;
      const activeAssets = state.assets.filter(a => a.status === 'ACTIVE');

      const updatedAssets = activeAssets.map(asset => {
        const depreciation = calculateStraightLineDepreciation(
          asset.purchaseCost,
          asset.salvageValue,
          asset.usefulLife,
          1 // One month
        );

        totalDepreciation += depreciation;

        return {
          ...asset,
          accumulatedDepreciation: asset.accumulatedDepreciation + depreciation,
          bookValue: asset.purchaseCost - (asset.accumulatedDepreciation + depreciation),
          lastDepreciationDate: new Date(year, month - 1, 1),
          updatedAt: new Date(),
        };
      });

      const newRun: DepreciationRun = {
        id: Math.random().toString(36).substr(2, 9),
        runNumber: `DEP-${year}-${month.toString().padStart(2, '0')}`,
        period,
        month,
        year,
        assetsCount: activeAssets.length,
        totalDepreciation,
        status: 'COMPLETED',
        runDate: new Date(),
        runBy,
        createdAt: new Date(),
      };

      state = {
        ...state,
        assets: state.assets.map(a => {
          const updated = updatedAssets.find(ua => ua.id === a.id);
          return updated || a;
        }),
        depreciationRuns: [...state.depreciationRuns, newRun],
      };
      notify();
      return newRun;
    },

    calculateDepreciation: (asset, months) => {
      return calculateStraightLineDepreciation(
        asset.purchaseCost,
        asset.salvageValue,
        asset.usefulLife,
        months
      );
    },
  };
};
