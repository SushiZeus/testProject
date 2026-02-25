import { useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { mockUsers, userCredentials } from '@/data/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  hasPermission: (action: string) => boolean;
}

const rolePermissions: Record<UserRole, string[]> = {
  documentation_officer: ['create_file', 'view_own_files', 'create_petty_cash_request'],
  declaration_manager: ['assign_declarant', 'view_department_files', 'view_all_declarations', 'create_petty_cash_request'],
  declarant: ['process_declaration', 'view_assigned_files', 'create_petty_cash_request'],
  operations_manager: ['assign_operation_clerk', 'approve_petty_cash_manager', 'view_operations'],
  operation_clerk: ['process_operations', 'upload_verification_photos', 'create_petty_cash_request'],
  permits_clerk: ['process_permits', 'create_permit_request', 'upload_permit_documents'],
  shipping_line_clerk: ['process_delivery_order', 'upload_do_documents', 'create_petty_cash_request'],
  delivery_clerk: ['process_delivery', 'request_driver'],
  transport_manager: ['assign_big_truck_driver', 'manage_big_truck_drivers', 'view_driver_reports'],
  coo: ['approve_petty_cash_coo', 'view_all_files', 'view_reports'],
  finance_manager: ['process_finance', 'view_financial_reports'],
  cashier: ['process_payments', 'view_pending_payments'],
  hr_manager: ['assign_small_truck_driver', 'manage_small_truck_drivers', 'view_driver_reports', 'approve_petty_cash_hr'],
  driver: ['view_assigned_jobs', 'update_job_status'],
  contact_person: ['view_client_files', 'update_payment_status', 'select_payment_option'],
  admin: ['*'],
};

// Load state from localStorage or use defaults
const loadAuthState = () => {
  if (typeof window === 'undefined') {
    return {
      user: null as User | null,
      isAuthenticated: false,
    };
  }

  try {
    const savedState = localStorage.getItem('authStore');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        user: parsed.user ? {
          ...parsed.user,
          createdAt: new Date(parsed.user.createdAt),
          updatedAt: new Date(parsed.user.updatedAt),
        } : null,
        isAuthenticated: parsed.isAuthenticated,
      };
    }
  } catch (error) {
    console.error('Error loading auth state:', error);
  }

  return {
    user: null as User | null,
    isAuthenticated: false,
  };
};

// Save state to localStorage
const saveAuthState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('authStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }
};

let state = loadAuthState();

const listeners = new Set<() => void>();
const notify = () => {
  saveAuthState(state);
  listeners.forEach(fn => fn());
};

export const useAuthStore = (): AuthState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    get user() { return state.user; },
    get isAuthenticated() { return state.isAuthenticated; },

    login: async (email: string, password: string, role: UserRole) => {
      // Find user by email and password
      const credential = Object.values(userCredentials).find(
        c => c.email === email && c.password === password
      );
      
      if (credential) {
        const user = mockUsers.find(u => u.email === email && u.role === role);
        if (user) {
          state = { user, isAuthenticated: true };
          notify();
          return true;
        }
      }
      
      return false;
    },

    logout: () => {
      state = { user: null, isAuthenticated: false };
      notify();
    },

    hasPermission: (action: string) => {
      if (!state.user) return false;
      const permissions = rolePermissions[state.user.role as UserRole] || [];
      return permissions.includes('*') || permissions.includes(action);
    },
  };
};
