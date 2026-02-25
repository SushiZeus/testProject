import { useState, useEffect } from 'react';
import type { Notification, ShipmentFile, FileStatus } from '@/types';
import { mockNotifications, mockUsers } from '@/data/mockData';

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string) => void;
  clearNotification: (id: string) => void;
  getNotificationsForUser: (userId: string) => Notification[];
  getUnreadCount: (userId: string) => number;
  notifyFileCreated: (file: ShipmentFile) => void;
  notifyFileStatusChange: (file: ShipmentFile, oldStatus: FileStatus, newStatus: FileStatus) => void;
  notifyAllChannels: (file: ShipmentFile, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

// Get all active users by role
const getUsersByRole = (role: string) => {
  return mockUsers.filter(u => u.role === role && u.isActive);
};

const getAllActiveUsers = () => {
  return mockUsers.filter(u => u.isActive);
};

// Load state from localStorage or use defaults
const loadState = () => {
  if (typeof window === 'undefined') {
    return { notifications: mockNotifications };
  }

  try {
    const savedState = localStorage.getItem('notificationStore');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        notifications: parsed.notifications.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        })),
      };
    }
  } catch (error) {
    console.error('Error loading notification state:', error);
  }

  return { notifications: mockNotifications };
};

// Save state to localStorage
const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('notificationStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving notification state:', error);
    }
  }
};

let state: {
  notifications: Notification[];
} = loadState();

const listeners = new Set<() => void>();
const notify = () => {
  saveState(state);
  listeners.forEach(fn => fn());
};

export const useNotificationStore = (): NotificationState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    get notifications() { return state.notifications; },

    addNotification: (notification) => {
      const newNotification: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        ...notification,
        isRead: false,
        createdAt: new Date(),
      };

      state = {
        ...state,
        notifications: [newNotification, ...state.notifications],
      };
      notify();
    },

    markAsRead: (id) => {
      state = {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        ),
      };
      notify();
    },

    markAllAsRead: (userId) => {
      state = {
        ...state,
        notifications: state.notifications.map(n =>
          n.userId === userId ? { ...n, isRead: true } : n
        ),
      };
      notify();
    },

    clearNotification: (id) => {
      state = {
        ...state,
        notifications: state.notifications.filter(n => n.id !== id),
      };
      notify();
    },

    getNotificationsForUser: (userId) => {
      return state.notifications
        .filter(n => n.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    getUnreadCount: (userId) => {
      return state.notifications.filter(n => n.userId === userId && !n.isRead).length;
    },

    notifyFileCreated: (file) => {
      // Notify all active users about new file creation
      const allUsers = getAllActiveUsers();
      const notifications: Notification[] = allUsers.map(user => ({
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        title: '🆕 New File Created',
        message: `File ${file.fileNumber} has been created and is now being tracked through all channels until clearance completion`,
        type: 'info' as const,
        isRead: false,
        fileId: file.id,
        link: `/files/${file.id}`,
        createdAt: new Date(),
      }));

      // Specific notification for declaration managers
      const declarationManagers = getUsersByRole('declaration_manager');
      declarationManagers.forEach(manager => {
        notifications.push({
          id: Math.random().toString(36).substr(2, 9),
          userId: manager.id,
          title: '📋 Action Required: Assign Declarant',
          message: `File ${file.fileNumber} is waiting for declarant assignment`,
          type: 'warning' as const,
          isRead: false,
          fileId: file.id,
          link: '/declaration',
          createdAt: new Date(),
        });
      });

      state = {
        ...state,
        notifications: [...notifications, ...state.notifications],
      };
      notify();
    },

    notifyFileStatusChange: (file, oldStatus, newStatus) => {
      const allUsers = getAllActiveUsers();
      
      // Notify all users about status change
      const generalNotifications: Notification[] = allUsers.map(user => ({
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        title: '🔄 File Status Updated',
        message: `File ${file.fileNumber} moved from ${oldStatus.replace(/_/g, ' ')} to ${newStatus.replace(/_/g, ' ')}`,
        type: 'info' as const,
        isRead: false,
        fileId: file.id,
        link: `/files/${file.id}`,
        createdAt: new Date(),
      }));

      // Role-specific notifications based on status
      const roleNotifications: Notification[] = [];

      switch (newStatus) {
        case 'ASSIGNED_TO_DECLARANT':
          if (file.assignedDeclarantId) {
            roleNotifications.push({
              id: Math.random().toString(36).substr(2, 9),
              userId: file.assignedDeclarantId,
              title: '📝 File Assigned to You',
              message: `File ${file.fileNumber} has been assigned to you for declaration processing`,
              type: 'warning' as const,
              isRead: false,
              fileId: file.id,
              link: '/declaration',
              createdAt: new Date(),
            });
          }
          break;

        case 'DECLARATION_DONE':
          getUsersByRole('operations_manager').forEach(manager => {
            roleNotifications.push({
              id: Math.random().toString(36).substr(2, 9),
              userId: manager.id,
              title: '✅ Declaration Complete',
              message: `File ${file.fileNumber} declaration is complete. Ready for operations assignment`,
              type: 'success' as const,
              isRead: false,
              fileId: file.id,
              link: '/operations',
              createdAt: new Date(),
            });
          });
          break;

        case 'READY_FOR_OPERATIONS':
          getUsersByRole('operations_manager').forEach(manager => {
            roleNotifications.push({
              id: Math.random().toString(36).substr(2, 9),
              userId: manager.id,
              title: '🚀 Ready for Operations',
              message: `File ${file.fileNumber} is ready for operations clerk assignment`,
              type: 'warning' as const,
              isRead: false,
              fileId: file.id,
              link: '/operations',
              createdAt: new Date(),
            });
          });
          break;

        case 'RECEIVED_BY_CLERK':
          if (file.assignedOperationClerkId) {
            roleNotifications.push({
              id: Math.random().toString(36).substr(2, 9),
              userId: file.assignedOperationClerkId,
              title: '📦 File Received',
              message: `File ${file.fileNumber} has been assigned to you for operations processing`,
              type: 'warning' as const,
              isRead: false,
              fileId: file.id,
              link: '/operations',
              createdAt: new Date(),
            });
          }
          break;

        case 'WAITING_FOR_PAYMENTS':
          getUsersByRole('finance_manager').forEach(manager => {
            roleNotifications.push({
              id: Math.random().toString(36).substr(2, 9),
              userId: manager.id,
              title: '💰 Payment Required',
              message: `File ${file.fileNumber} is waiting for payment processing`,
              type: 'warning' as const,
              isRead: false,
              fileId: file.id,
              link: '/petty-cash',
              createdAt: new Date(),
            });
          });
          break;

        case 'DRIVER_ASSIGNED':
          if (file.assignedDriverId) {
            roleNotifications.push({
              id: Math.random().toString(36).substr(2, 9),
              userId: file.assignedDriverId,
              title: '🚗 Job Assigned',
              message: `File ${file.fileNumber} has been assigned to you for cargo collection`,
              type: 'warning' as const,
              isRead: false,
              fileId: file.id,
              link: '/drivers',
              createdAt: new Date(),
            });
          }
          break;

        case 'COMPLETED':
          // Notify everyone that file is complete
          allUsers.forEach(user => {
            roleNotifications.push({
              id: Math.random().toString(36).substr(2, 9),
              userId: user.id,
              title: '✅ File Completed',
              message: `File ${file.fileNumber} has been successfully completed and cleared`,
              type: 'success' as const,
              isRead: false,
              fileId: file.id,
              link: `/files/${file.id}`,
              createdAt: new Date(),
            });
          });
          break;
      }

      state = {
        ...state,
        notifications: [...generalNotifications, ...roleNotifications, ...state.notifications],
      };
      notify();
    },

    notifyAllChannels: (file, message, type = 'info') => {
      const allUsers = getAllActiveUsers();
      const notifications: Notification[] = allUsers.map(user => ({
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        title: `📢 File ${file.fileNumber}`,
        message,
        type,
        isRead: false,
        fileId: file.id,
        link: `/files/${file.id}`,
        createdAt: new Date(),
      }));

      state = {
        ...state,
        notifications: [...notifications, ...state.notifications],
      };
      notify();
    },
  };
};

// Export a way to get the store state without hooks (for use in other stores)
useNotificationStore.getState = () => {
  return {
    notifyFileCreated: (file: ShipmentFile) => {
      const allUsers = getAllActiveUsers();
      const notifications: Notification[] = allUsers.map(user => ({
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        title: '🆕 New File Created',
        message: `File ${file.fileNumber} has been created and is now being tracked through all channels until clearance completion`,
        type: 'info' as const,
        isRead: false,
        fileId: file.id,
        link: `/files/${file.id}`,
        createdAt: new Date(),
      }));

      state = {
        ...state,
        notifications: [...notifications, ...state.notifications],
      };
      notify();
    },
    notifyFileStatusChange: (file: ShipmentFile, oldStatus: FileStatus, newStatus: FileStatus) => {
      const allUsers = getAllActiveUsers();
      
      // Notify all users about status change
      const generalNotifications: Notification[] = allUsers.map(user => ({
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        title: '🔄 File Status Updated',
        message: `File ${file.fileNumber} moved from ${oldStatus.replace(/_/g, ' ')} to ${newStatus.replace(/_/g, ' ')}`,
        type: 'info' as const,
        isRead: false,
        fileId: file.id,
        link: `/files/${file.id}`,
        createdAt: new Date(),
      }));

      state = {
        ...state,
        notifications: [...generalNotifications, ...state.notifications],
      };
      notify();
    },
  };
};
