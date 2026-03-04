import { useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { mockUsers, userCredentials } from '@/data/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  hasPermission: (action: string) => boolean;
  isExecutive: () => boolean;
  canPerformOperationalActions: () => boolean;
  canManipulateDeclarationModule: () => boolean;
  canManipulateOperationsModule: () => boolean;
  canManipulateDriversModule: () => boolean;
  canViewDriversModule: () => boolean;
}

const rolePermissions: Record<UserRole, string[]> = {
  // Department Staff - Limited Access
  documentation_officer: ['create_file', 'view_own_files', 'create_petty_cash_request'],
  declaration_manager: ['assign_declarant', 'view_department_files', 'view_all_declarations', 'create_petty_cash_request', 'view_petty_cash_history'],
  declarant: ['process_declaration', 'view_assigned_files', 'create_petty_cash_request'],
  operations_manager: ['assign_operation_clerk', 'approve_petty_cash_manager', 'view_operations', 'create_petty_cash_request'],
  operation_clerk: ['process_operations', 'upload_verification_photos', 'create_petty_cash_request'],
  permits_clerk: ['process_permits', 'create_permit_request', 'upload_permit_documents', 'create_petty_cash_request'],
  shipping_line_clerk: ['process_delivery_order', 'upload_do_documents', 'create_petty_cash_request'],
  delivery_clerk: ['process_delivery', 'request_driver', 'create_petty_cash_request'],
  transport_manager: ['assign_big_truck_driver', 'manage_big_truck_drivers', 'view_driver_reports', 'create_petty_cash_request'],
  driver: ['view_assigned_jobs', 'update_job_status', 'create_petty_cash_request'],
  contact_person: ['view_client_files', 'update_payment_status', 'select_payment_option', 'create_petty_cash_request'],
  
  // Finance Department - Limited to Finance + Full Access Roles
  finance_manager: [
    'process_finance', 'view_financial_reports', 'view_accounts_department', 
    'approve_petty_cash_finance', 'executive_view_all_departments', 'view_all_statistics',
    'add_file_comments', 'view_all_files_readonly', 'create_petty_cash_request'
  ],
  cashier: ['process_payments', 'view_pending_payments', 'create_petty_cash_request'],
  
  // HR Department - Limited to HR + Full Access Roles  
  hr_manager: ['assign_small_truck_driver', 'manage_small_truck_drivers', 'view_driver_reports', 'approve_petty_cash_hr', 'view_hr_department', 'create_petty_cash_request'],
  
  // Senior Management - Executive Access (View Only + Comments)
  commercial_manager: [
    'executive_view_all_departments', 'view_all_statistics', 'view_all_files_readonly',
    'add_file_comments', 'view_reports', 'view_accounts_department', 'view_hr_department', 'create_petty_cash_request'
  ],
  coo: [
    'executive_view_all_departments', 'view_all_statistics', 'view_all_files_readonly',
    'add_file_comments', 'approve_petty_cash_coo', 'view_reports', 'view_accounts_department', 
    'view_hr_department', 'manage_all_departments_readonly', 'create_petty_cash_request', 'coo_direct_finance_access'
  ],
  managing_director: [
    'executive_view_all_departments', 'view_all_statistics', 'view_all_files_readonly',
    'add_file_comments', 'view_reports', 'view_accounts_department', 'view_hr_department', 
    'manage_all_departments_readonly', 'executive_access'
    // NOTE: Managing Director does NOT have 'create_petty_cash_request' permission
  ],
  
  // System Administration
  administrator: ['*'],
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
      try {
        if (!state.user) {
          console.log('hasPermission: No user found');
          return false;
        }
        
        const userRole = state.user.role;
        console.log('hasPermission: User role:', userRole, 'checking action:', action);
        
        // Handle administrator role specifically
        if (userRole === 'administrator') {
          console.log('hasPermission: Administrator has all permissions');
          return true;
        }
        
        const permissions = rolePermissions[userRole as UserRole];
        console.log('hasPermission: Permissions array:', permissions);
        
        if (!permissions || !Array.isArray(permissions)) {
          console.log('hasPermission: No valid permissions array found for role:', userRole);
          return false;
        }
        
        const hasAccess = permissions.includes('*') || permissions.includes(action);
        console.log('hasPermission: Result:', hasAccess);
        return hasAccess;
      } catch (error) {
        console.error('hasPermission error:', error);
        return false;
      }
    },

    isExecutive: () => {
      if (!state.user) return false;
      return ['managing_director', 'coo', 'finance_manager', 'commercial_manager'].includes(state.user.role);
    },

    canPerformOperationalActions: () => {
      if (!state.user) return false;
      // Executives cannot perform operational actions like assigning, uploading, etc.
      return !['managing_director', 'coo', 'commercial_manager'].includes(state.user.role);
    },

    // Module-specific access control
    canManipulateDeclarationModule: () => {
      if (!state.user) return false;
      // Only Declaration Manager and Administrator can manipulate declaration module
      return state.user.role === 'declaration_manager' || state.user.role === 'administrator';
    },

    canManipulateOperationsModule: () => {
      if (!state.user) return false;
      // Operations Manager, Permits Clerk, Shipping Line Clerk, and Administrator can manipulate operations module
      return state.user.role === 'operations_manager' || 
             state.user.role === 'permits_clerk' ||
             state.user.role === 'shipping_line_clerk' ||
             state.user.role === 'administrator';
    },

    canManipulateDriversModule: () => {
      if (!state.user) return false;
      // Only HR Manager and Administrator can manipulate drivers module
      return state.user.role === 'hr_manager' || state.user.role === 'administrator';
    },

    canViewDriversModule: () => {
      if (!state.user) return false;
      // HR Manager, Administrator, and Executives can view drivers module
      return state.user.role === 'hr_manager' || 
             state.user.role === 'administrator' ||
             state.user.role === 'coo' ||
             state.user.role === 'managing_director' ||
             state.user.role === 'commercial_manager';
    },
  };
};
