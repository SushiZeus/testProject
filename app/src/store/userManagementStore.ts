import { useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { mockUsers } from '@/data/mockData';

interface UserManagementState {
  users: User[];
  registerUser: (data: {
    email: string;
    name: string;
    role: UserRole;
    department: string;
    phone: string;
    password: string;
    createdBy: string;
  }) => User;
  updateUser: (userId: string, data: Partial<User>) => void;
  deactivateUser: (userId: string) => void;
  activateUser: (userId: string) => void;
  getUserById: (id: string) => User | undefined;
  getAllUsers: () => User[];
  getActiveUsers: () => User[];
  getUsersByRole: (role: UserRole) => User[];
  getUsersByDepartment: (department: string) => User[];
}

// Load state from localStorage or use defaults
const loadState = () => {
  if (typeof window === 'undefined') {
    return { users: mockUsers };
  }

  try {
    const savedState = localStorage.getItem('userManagementStore');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        users: parsed.users.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        })),
      };
    }
  } catch (error) {
    console.error('Error loading user management state:', error);
  }

  return { users: mockUsers };
};

// Save state to localStorage
const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('userManagementStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving user management state:', error);
    }
  }
};

let state: {
  users: User[];
} = loadState();

const listeners = new Set<() => void>();
const notify = () => {
  saveState(state);
  listeners.forEach(fn => fn());
};

export const useUserManagementStore = (): UserManagementState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    get users() {
      return state.users;
    },

    registerUser: (data) => {
      // Check if email already exists
      const existingUser = state.users.find(u => u.email === data.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        name: data.name,
        role: data.role,
        department: data.department,
        phone: data.phone,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      state = {
        ...state,
        users: [...state.users, newUser],
      };

      // Also update mockData credentials for login
      if (typeof window !== 'undefined') {
        try {
          const credentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
          credentials[data.email] = {
            email: data.email,
            password: data.password,
            role: data.role,
            name: data.name,
          };
          localStorage.setItem('userCredentials', JSON.stringify(credentials));
        } catch (error) {
          console.error('Error saving credentials:', error);
        }
      }

      notify();
      return newUser;
    },

    updateUser: (userId, data) => {
      state = {
        ...state,
        users: state.users.map((u: User) =>
          u.id === userId
            ? { ...u, ...data, updatedAt: new Date() }
            : u
        ),
      };
      notify();
    },

    deactivateUser: (userId) => {
      state = {
        ...state,
        users: state.users.map((u: User) =>
          u.id === userId
            ? { ...u, isActive: false, updatedAt: new Date() }
            : u
        ),
      };
      notify();
    },

    activateUser: (userId) => {
      state = {
        ...state,
        users: state.users.map((u: User) =>
          u.id === userId
            ? { ...u, isActive: true, updatedAt: new Date() }
            : u
        ),
      };
      notify();
    },

    getUserById: (id) => {
      return state.users.find((u: User) => u.id === id);
    },

    getAllUsers: () => {
      return state.users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    getActiveUsers: () => {
      return state.users
        .filter((u: User) => u.isActive)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    getUsersByRole: (role) => {
      return state.users
        .filter((u: User) => u.role === role)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    getUsersByDepartment: (department) => {
      return state.users
        .filter((u: User) => u.department === department)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
  };
};
