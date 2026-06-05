import { useState, useEffect } from 'react';
import type { Notification, ShipmentFile, FileStatus } from '@/types';
import { mockNotifications, mockUsers } from '@/data/mockData';
import { toast } from 'sonner';

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
}

// Get all active users by role
const getUsersByRole = (role: string) => {
  return mockUsers.filter(u => u.role === role && u.isActive);
};

// Helper to show toast notification
const showToastNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
  const toastOptions = {
    duration: 5000,
    action: notification.link ? {
      label: 'View',
      onClick: () => {
        if (notification.link) {
          window.location.href = notification.link;
        }
      },
    } : undefined,
  };

  switch (notification.type) {
    case 'success':
      toast.success(notification.title, {
        description: notification.message,
        ...toastOptions,
      });
      break;
    case 'error':
      toast.error(notification.title, {
        description: notification.message,
        ...toastOptions,
      });
      break;
    case 'warning':
      toast.warning(notification.title, {
        description: notification.message,
        ...toastOptions,
      });
      break;
    default:
      toast.info(notification.title, {
        description: notification.message,
        ...toastOptions,
      });
  }
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
      // Documentation officers do not receive file notifications
      const targetUser = mockUsers.find(u => u.id === notification.userId);
      if (targetUser?.role === 'documentation_officer') return;

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
      
      // Show toast popup for the notification
      showToastNotification(notification);
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
      const notifications: Notification[] = [];

      // Only notify the file creator (skip if documentation officer)
      if (file.createdBy) {
        const creator = mockUsers.find(u => u.id === file.createdBy);
        if (creator && creator.role !== 'documentation_officer') {
          const creatorNotification = {
            id: Math.random().toString(36).substr(2, 9),
            userId: file.createdBy,
            title: '✅ File Created Successfully',
            message: `File ${file.fileNumber} has been created and is ready for processing`,
            type: 'success' as const,
            isRead: false,
            fileId: file.id,
            link: `/files/${file.id}`,
            createdAt: new Date(),
          };
          notifications.push(creatorNotification);
          showToastNotification(creatorNotification);
        }
      }

      // Notify declaration managers who need to assign a declarant
      const declarationManagers = getUsersByRole('declaration_manager');
      declarationManagers.forEach(manager => {
        const managerNotification = {
          id: Math.random().toString(36).substr(2, 9),
          userId: manager.id,
          title: '📋 Action Required: Assign Declarant',
          message: `File ${file.fileNumber} is waiting for declarant assignment`,
          type: 'warning' as const,
          isRead: false,
          fileId: file.id,
          link: '/declaration',
          createdAt: new Date(),
        };
        notifications.push(managerNotification);
        showToastNotification(managerNotification);
      });

      // Notify shipping line clerks for SEA shipments
      if (file.transportMode === 'SEA' && (file.shipmentType === 'IMPORT' || file.shipmentType === 'EXPORT')) {
        const shippingLineClerks = getUsersByRole('shipping_line_clerk');
        shippingLineClerks.forEach(clerk => {
          const clerkNotification = {
            id: Math.random().toString(36).substr(2, 9),
            userId: clerk.id,
            title: '🚢 New SEA Shipment File',
            message: `SEA ${file.shipmentType} file ${file.fileNumber} has been opened for ${file.client?.name || 'client'}`,
            type: 'info' as const,
            isRead: false,
            fileId: file.id,
            link: '/shipping-line',
            createdAt: new Date(),
          };
          notifications.push(clerkNotification);
          showToastNotification(clerkNotification);
        });
      }

      state = {
        ...state,
        notifications: [...notifications, ...state.notifications],
      };
      notify();
    },

    notifyFileStatusChange: (file, _oldStatus, newStatus) => {
      const notifications: Notification[] = [];

      // Helper to add notification and show toast
      const addNotificationWithToast = (notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
        // Documentation officers do not receive file notifications
        const targetUser = mockUsers.find(u => u.id === notif.userId);
        if (targetUser?.role === 'documentation_officer') return;

        const fullNotif = {
          id: Math.random().toString(36).substr(2, 9),
          ...notif,
          isRead: false,
          createdAt: new Date(),
        };
        notifications.push(fullNotif);
        showToastNotification(notif);
      };

      // Helper to notify shipping line clerks for SEA shipments
      const notifyShippingLineClerks = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        if (file.transportMode === 'SEA' && (file.shipmentType === 'IMPORT' || file.shipmentType === 'EXPORT')) {
          getUsersByRole('shipping_line_clerk').forEach(clerk => {
            addNotificationWithToast({
              userId: clerk.id,
              title,
              message,
              type,
              fileId: file.id,
              link: '/shipping-line',
            });
          });
        }
      };

      // Role-specific notifications based on status - only notify users involved at this stage
      switch (newStatus) {
        case 'ASSIGNED_TO_DECLARANT':
          // Notify the assigned declarant
          if (file.assignedDeclarantId) {
            addNotificationWithToast({
              userId: file.assignedDeclarantId,
              title: '📝 File Assigned to You',
              message: `File ${file.fileNumber} has been assigned to you for declaration processing`,
              type: 'warning',
              fileId: file.id,
              link: '/declaration',
            });
          }
          // Notify the file creator that declarant was assigned
          if (file.createdBy) {
            addNotificationWithToast({
              userId: file.createdBy,
              title: '✅ Declarant Assigned',
              message: `File ${file.fileNumber} has been assigned to a declarant for processing`,
              type: 'info',
              fileId: file.id,
              link: `/files/${file.id}`,
            });
          }
          // Notify shipping line clerks for SEA shipments
          notifyShippingLineClerks(
            '📝 Declarant Assigned',
            `SEA file ${file.fileNumber} has been assigned to a declarant`,
            'info'
          );
          break;

        case 'DECLARANT_ACKNOWLEDGED':
          // Notify declaration manager that declarant acknowledged
          getUsersByRole('declaration_manager').forEach(manager => {
            addNotificationWithToast({
              userId: manager.id,
              title: '✅ Declarant Acknowledged',
              message: `File ${file.fileNumber} has been acknowledged by the declarant`,
              type: 'success',
              fileId: file.id,
              link: '/declaration',
            });
          });
          break;

        case 'WAITING_FOR_FINAL_ASSESSMENT':
          // Notify declarant that assessment is needed
          if (file.assignedDeclarantId) {
            addNotificationWithToast({
              userId: file.assignedDeclarantId,
              title: '⏳ Waiting for Assessment',
              message: `File ${file.fileNumber} is waiting for final tax assessment`,
              type: 'warning',
              fileId: file.id,
              link: '/declaration',
            });
          }
          break;

        case 'DECLARATION_DONE':
          // Notify operations managers
          getUsersByRole('operations_manager').forEach(manager => {
            addNotificationWithToast({
              userId: manager.id,
              title: '✅ Declaration Complete',
              message: `File ${file.fileNumber} declaration is complete. Ready for operations assignment`,
              type: 'success',
              fileId: file.id,
              link: '/operations',
            });
          });
          // Notify the declarant their work is done
          if (file.assignedDeclarantId) {
            addNotificationWithToast({
              userId: file.assignedDeclarantId,
              title: '✅ Declaration Completed',
              message: `Your declaration work on file ${file.fileNumber} is complete`,
              type: 'success',
              fileId: file.id,
              link: '/declaration',
            });
          }
          // Notify shipping line clerks for SEA shipments
          notifyShippingLineClerks(
            '✅ Declaration Complete',
            `SEA file ${file.fileNumber} declaration is complete`,
            'success'
          );
          break;

        case 'PERMITS_DONE':
          // Notify shipping line clerks for SEA shipments - they need to upload D.O invoice
          notifyShippingLineClerks(
            '📋 Permits Complete - Action Required',
            `SEA file ${file.fileNumber} permits are done. Please upload delivery order invoice`,
            'warning'
          );
          break;

        case 'DELIVERY_ORDER_SUBMITTED':
          // Notify operations managers
          getUsersByRole('operations_manager').forEach(manager => {
            addNotificationWithToast({
              userId: manager.id,
              title: '✅ Delivery Order Submitted',
              message: `File ${file.fileNumber} delivery order has been submitted`,
              type: 'success',
              fileId: file.id,
              link: '/operations',
            });
          });
          // Notify shipping line clerks
          notifyShippingLineClerks(
            '✅ Delivery Order Submitted',
            `SEA file ${file.fileNumber} delivery order submitted successfully`,
            'success'
          );
          break;

        case 'WAITING_FOR_TAX_PAYMENT':
          // Notify finance manager
          getUsersByRole('finance_manager').forEach(manager => {
            addNotificationWithToast({
              userId: manager.id,
              title: '💰 Tax Payment Required',
              message: `File ${file.fileNumber} is waiting for tax payment`,
              type: 'warning',
              fileId: file.id,
              link: '/petty-cash',
            });
          });
          break;

        case 'TAXES_PAID':
          // Notify operations manager that file is ready
          getUsersByRole('operations_manager').forEach(manager => {
            addNotificationWithToast({
              userId: manager.id,
              title: '✅ Taxes Paid',
              message: `File ${file.fileNumber} taxes have been paid. Ready for operations`,
              type: 'success',
              fileId: file.id,
              link: '/operations',
            });
          });
          break;

        case 'READY_FOR_OPERATIONS':
          // Notify operations managers
          getUsersByRole('operations_manager').forEach(manager => {
            addNotificationWithToast({
              userId: manager.id,
              title: '🚀 Ready for Operations',
              message: `File ${file.fileNumber} is ready for operations clerk assignment`,
              type: 'warning',
              fileId: file.id,
              link: '/operations',
            });
          });
          break;

        case 'RECEIVED_BY_CLERK':
          // Notify the assigned clerk
          if (file.assignedOperationClerkId) {
            addNotificationWithToast({
              userId: file.assignedOperationClerkId,
              title: '📦 File Assigned to You',
              message: `File ${file.fileNumber} has been assigned to you for operations processing`,
              type: 'warning',
              fileId: file.id,
              link: '/operations',
            });
          }
          break;

        case 'CLERK_WORKING_ON_FILE':
          // Notify operations manager
          getUsersByRole('operations_manager').forEach(manager => {
            addNotificationWithToast({
              userId: manager.id,
              title: '🔄 Clerk Processing File',
              message: `File ${file.fileNumber} is being processed by operations clerk`,
              type: 'info',
              fileId: file.id,
              link: '/operations',
            });
          });
          break;

        case 'WAITING_FOR_PERMIT_PAYMENTS':
        case 'WAITING_FOR_DO_PAYMENT':
        case 'WAITING_FOR_PORT_PAYMENT':
        case 'WAITING_FOR_SWISSPORT_PAYMENTS':
          // Notify finance manager
          getUsersByRole('finance_manager').forEach(manager => {
            addNotificationWithToast({
              userId: manager.id,
              title: '💰 Payment Required',
              message: `File ${file.fileNumber} is waiting for payment processing`,
              type: 'warning',
              fileId: file.id,
              link: '/petty-cash',
            });
          });
          // Notify shipping line clerks for SEA shipments
          if (newStatus === 'WAITING_FOR_DO_PAYMENT') {
            notifyShippingLineClerks(
              '⏳ Waiting for D.O Payment',
              `SEA file ${file.fileNumber} delivery order invoice uploaded - waiting for payment`,
              'info'
            );
          } else {
            notifyShippingLineClerks(
              '💰 Payment Required',
              `SEA file ${file.fileNumber} is waiting for payment`,
              'info'
            );
          }
          break;

        case 'PERMIT_PAYMENTS_DONE':
        case 'DELIVERY_ORDER_PAYMENTS_DONE':
        case 'PORT_CHARGES_PAID':
        case 'SWISSPORT_CHARGES_PAID':
          // Notify the assigned clerk that payment is done
          if (file.assignedOperationClerkId) {
            addNotificationWithToast({
              userId: file.assignedOperationClerkId,
              title: '✅ Payment Completed',
              message: `Payment for file ${file.fileNumber} has been completed. Continue processing`,
              type: 'success',
              fileId: file.id,
              link: '/operations',
            });
          }
          // Notify shipping line clerks for SEA shipments
          if (newStatus === 'DELIVERY_ORDER_PAYMENTS_DONE') {
            notifyShippingLineClerks(
              '✅ D.O Payment Complete - Action Required',
              `SEA file ${file.fileNumber} payment done. Please submit delivery order document`,
              'warning'
            );
          } else {
            notifyShippingLineClerks(
              '✅ Payment Completed',
              `SEA file ${file.fileNumber} payment has been completed`,
              'success'
            );
          }
          break;

        case 'DRIVER_REQUESTED':
          // Notify HR managers
          getUsersByRole('hr_manager').forEach(manager => {
            addNotificationWithToast({
              userId: manager.id,
              title: '🚗 Driver Requested',
              message: `File ${file.fileNumber} requires driver assignment`,
              type: 'warning',
              fileId: file.id,
              link: '/drivers',
            });
          });
          break;

        case 'DRIVER_ASSIGNED':
          // Notify the assigned driver
          if (file.assignedDriverId) {
            addNotificationWithToast({
              userId: file.assignedDriverId,
              title: '🚗 Job Assigned to You',
              message: `File ${file.fileNumber} has been assigned to you for cargo collection`,
              type: 'warning',
              fileId: file.id,
              link: '/drivers',
            });
          }
          // Notify operations clerk
          if (file.assignedOperationClerkId) {
            addNotificationWithToast({
              userId: file.assignedOperationClerkId,
              title: '✅ Driver Assigned',
              message: `Driver has been assigned to file ${file.fileNumber}`,
              type: 'success',
              fileId: file.id,
              link: '/operations',
            });
          }
          break;

        case 'DRIVER_COLLECTING_CARGO':
        case 'CARGO_COLLECTED_FROM_ICD':
        case 'CARGO_COLLECTED_FROM_AIRPORT':
          // Notify operations clerk about progress
          if (file.assignedOperationClerkId) {
            addNotificationWithToast({
              userId: file.assignedOperationClerkId,
              title: '🚚 Cargo Collection Update',
              message: `File ${file.fileNumber}: ${newStatus.replace(/_/g, ' ')}`,
              type: 'info',
              fileId: file.id,
              link: '/operations',
            });
          }
          break;

        case 'DELIVERED_TO_CLIENT':
          // Notify operations clerk
          if (file.assignedOperationClerkId) {
            addNotificationWithToast({
              userId: file.assignedOperationClerkId,
              title: '✅ Delivered to Client',
              message: `File ${file.fileNumber} has been delivered to the client`,
              type: 'success',
              fileId: file.id,
              link: '/operations',
            });
          }
          // Notify driver their job is done
          if (file.assignedDriverId) {
            addNotificationWithToast({
              userId: file.assignedDriverId,
              title: '✅ Delivery Complete',
              message: `Your delivery for file ${file.fileNumber} is complete`,
              type: 'success',
              fileId: file.id,
              link: '/drivers',
            });
          }
          // Notify file creator
          if (file.createdBy) {
            addNotificationWithToast({
              userId: file.createdBy,
              title: '✅ Delivered to Client',
              message: `File ${file.fileNumber} has been successfully delivered`,
              type: 'success',
              fileId: file.id,
              link: `/files/${file.id}`,
            });
          }
          break;

        case 'COMPLETED':
          // Notify only users who were directly involved
          const involvedUsers = new Set<string>();
          
          if (file.createdBy) involvedUsers.add(file.createdBy);
          if (file.assignedDeclarantId) involvedUsers.add(file.assignedDeclarantId);
          if (file.assignedOperationClerkId) involvedUsers.add(file.assignedOperationClerkId);
          if (file.assignedDriverId) involvedUsers.add(file.assignedDriverId);
          
          involvedUsers.forEach(userId => {
            addNotificationWithToast({
              userId,
              title: '🎉 File Completed',
              message: `File ${file.fileNumber} has been successfully completed and cleared`,
              type: 'success',
              fileId: file.id,
              link: `/files/${file.id}`,
            });
          });
          
          // Notify managers
          [...getUsersByRole('operations_manager'), ...getUsersByRole('declaration_manager')].forEach(manager => {
            addNotificationWithToast({
              userId: manager.id,
              title: '✅ File Completed',
              message: `File ${file.fileNumber} has been completed`,
              type: 'success',
              fileId: file.id,
              link: `/files/${file.id}`,
            });
          });
          
          // Notify shipping line clerks for SEA shipments
          notifyShippingLineClerks(
            '🎉 File Completed',
            `SEA file ${file.fileNumber} has been successfully completed and cleared`,
            'success'
          );
          break;

        case 'CANCELLED':
          // Notify only involved users
          const cancelledUsers = new Set<string>();
          
          if (file.createdBy) cancelledUsers.add(file.createdBy);
          if (file.assignedDeclarantId) cancelledUsers.add(file.assignedDeclarantId);
          if (file.assignedOperationClerkId) cancelledUsers.add(file.assignedOperationClerkId);
          if (file.assignedDriverId) cancelledUsers.add(file.assignedDriverId);
          
          cancelledUsers.forEach(userId => {
            addNotificationWithToast({
              userId,
              title: '❌ File Cancelled',
              message: `File ${file.fileNumber} has been cancelled`,
              type: 'error',
              fileId: file.id,
              link: `/files/${file.id}`,
            });
          });
          break;
      }

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
      const notifications: Notification[] = [];

      // Only notify the file creator (skip if documentation officer)
      if (file.createdBy) {
        const creator = mockUsers.find(u => u.id === file.createdBy);
        if (creator && creator.role !== 'documentation_officer') {
          const creatorNotification = {
            id: Math.random().toString(36).substr(2, 9),
            userId: file.createdBy,
            title: '✅ File Created Successfully',
            message: `File ${file.fileNumber} has been created and is ready for processing`,
            type: 'info' as const,
            isRead: false,
            fileId: file.id,
            link: `/files/${file.id}`,
            createdAt: new Date(),
          };
          notifications.push(creatorNotification);
        }
      }

      // Notify declaration managers
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
    notifyFileStatusChange: (_file: ShipmentFile, _oldStatus: FileStatus, _newStatus: FileStatus) => {
      // Use the same logic as the hook version
      const notifications: Notification[] = [];
      
      // Add notifications based on status (simplified version for getState)
      state = {
        ...state,
        notifications: [...notifications, ...state.notifications],
      };
      notify();
    },
  };
};
