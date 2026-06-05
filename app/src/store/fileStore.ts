import { useState, useEffect } from 'react';
import type { 
  ShipmentFile, FileStatus, Client, ShippingDocument, 
  DocumentType, ShipmentType, ServiceType, TransportMode, ActivityLog 
} from '@/types';
import { 
  mockShipmentFiles, mockClients, mockActivityLogs, 
  getUserById, 
} from '@/data/mockData';

interface FileState {
  files: ShipmentFile[];
  clients: Client[];
  activityLogs: ActivityLog[];
  createFile: (data: {
    clientId?: string;
    client?: Client;
    shipmentType: ShipmentType;
    serviceType: ServiceType;
    transportMode: TransportMode;
    documents: { type: DocumentType; name: string; url: string }[];
    createdBy: string;
    contactPersonId?: string;
    // Document numbers
    commercialInvoiceNumber?: string;
    blType?: 'HBL' | 'MBL';
    blNumber?: string;
    awbType?: 'HAWB' | 'MAWB';
    awbNumber?: string;
    roadConsignmentNumber?: string;
    // SEA freight details
    seaFreightType?: 'LCL' | 'FCL';
    fcl20ftQuantity?: number;
    fcl40ftQuantity?: number;
    fclContainerOtherDescription?: string;
    // Cargo description
    cargoDescription?: string;
  }) => ShipmentFile;
  updateFileStatus: (
    fileId: string, 
    newStatus: FileStatus, 
    userId: string,
    additionalData?: Partial<ShipmentFile>
  ) => void;
  assignDeclarant: (fileId: string, declarantId: string, userId: string) => void;
  assignOperationClerk: (fileId: string, clerkId: string, userId: string) => void;
  assignDriver: (fileId: string, driverId: string, userId: string) => void;
  addDocument: (fileId: string, document: ShippingDocument) => void;
  addComment: (fileId: string, userId: string, comment: string) => void;
  getFileById: (id: string) => ShipmentFile | undefined;
  getFilesByStatus: (status: FileStatus) => ShipmentFile[];
  getFilesByClient: (clientId: string) => ShipmentFile[];
  getFilesByDeclarant: (declarantId: string) => ShipmentFile[];
  getFilesByOperationClerk: (clerkId: string) => ShipmentFile[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => Client;
  getClientById: (id: string) => Client | undefined;
  getActivityLogs: (fileId: string) => ActivityLog[];
}

const generateFileNumber = (shipmentType: ShipmentType, transportMode: TransportMode, existingFiles: ShipmentFile[]): string => {
  // Get abbreviations
  const shipmentAbbr = shipmentType.substring(0, 3).toUpperCase(); // IMP, EXP, TRA, TRA
  const transportAbbr = transportMode.substring(0, 3).toUpperCase(); // AIR, SEA, ROA, RAI
  const year = new Date().getFullYear();
  
  // Calculate sequential number based on existing files
  const currentYearFiles = existingFiles.filter(f => {
    const fileYear = f.fileNumber.split('-')[2];
    return fileYear === year.toString();
  });
  const sequential = (currentYearFiles.length + 1).toString().padStart(4, '0');
  
  return `${shipmentAbbr}-${transportAbbr}-${year}-${sequential}`;
};

// Load state from localStorage or use defaults
const loadState = () => {
  if (typeof window === 'undefined') {
    return {
      files: mockShipmentFiles,
      clients: mockClients,
      activityLogs: mockActivityLogs,
    };
  }

  try {
    const savedState = localStorage.getItem('fileStore');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      // Convert date strings back to Date objects
      return {
        files: parsed.files.map((f: any) => ({
          ...f,
          createdAt: new Date(f.createdAt),
          updatedAt: new Date(f.updatedAt),
          declarationDoneAt: f.declarationDoneAt ? new Date(f.declarationDoneAt) : undefined,
          taxesPaidAt: f.taxesPaidAt ? new Date(f.taxesPaidAt) : undefined,
          swissportPaidAt: f.swissportPaidAt ? new Date(f.swissportPaidAt) : undefined,
          driverAcceptedAt: f.driverAcceptedAt ? new Date(f.driverAcceptedAt) : undefined,
          cargoCollectedAt: f.cargoCollectedAt ? new Date(f.cargoCollectedAt) : undefined,
          documents: f.documents.map((d: any) => ({
            ...d,
            uploadedAt: new Date(d.uploadedAt),
          })),
        })),
        clients: parsed.clients.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        })),
        activityLogs: parsed.activityLogs.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
        })),
      };
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }

  return {
    files: mockShipmentFiles,
    clients: mockClients,
    activityLogs: mockActivityLogs,
  };
};

// Save state to localStorage
const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('fileStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }
};

let state: {
  files: ShipmentFile[];
  clients: Client[];
  activityLogs: ActivityLog[];
} = loadState();

const listeners = new Set<() => void>();

// Cache for enriched files to prevent infinite re-renders
let cachedEnrichedFiles: any[] = [];
let cacheInvalidated = true;

const notify = () => {
  saveState(state);
  cacheInvalidated = true; // Invalidate cache when state changes
  listeners.forEach(fn => fn());
};

export const useFileStore = (): FileState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    get files() { 
      // Return cached files if cache is still valid
      if (!cacheInvalidated && cachedEnrichedFiles.length === state.files.length) {
        return cachedEnrichedFiles;
      }
      
      // Return files with enriched data (client, assigned users)
      cachedEnrichedFiles = state.files.map(f => ({
        ...f,
        client: state.clients.find(c => c.id === f.clientId), // Use store's clients instead of mockData
        assignedDeclarant: f.assignedDeclarantId ? getUserById(f.assignedDeclarantId) : undefined,
        assignedOperationClerk: f.assignedOperationClerkId ? getUserById(f.assignedOperationClerkId) : undefined,
        assignedDriver: f.assignedDriverId ? getUserById(f.assignedDriverId) : undefined,
      }));
      cacheInvalidated = false;
      return cachedEnrichedFiles;
    },
    get clients() { return state.clients; },
    get activityLogs() { return state.activityLogs; },

    createFile: (data) => {
      // Determine initial status based on service type
      const initialStatus = data.serviceType === 'CLEARANCE' 
        ? 'WAITING_FOR_DECLARATION' 
        : 'WAITING_FOR_COMMERCIAL';

      const newFile: ShipmentFile = {
        id: Math.random().toString(36).substr(2, 9),
        fileNumber: generateFileNumber(data.shipmentType, data.transportMode, state.files),
        clientId: data.clientId || data.client?.id || '',
        client: data.client,
        shipmentType: data.shipmentType,
        serviceType: data.serviceType, // NEW: Service type
        transportMode: data.transportMode,
        documents: data.documents.map((d) => ({
          id: Math.random().toString(36).substr(2, 9),
          fileId: '',
          documentType: d.type,
          documentName: d.name,
          fileUrl: d.url,
          uploadedBy: data.createdBy,
          uploadedAt: new Date(),
        })),
        status: initialStatus, // Set based on service type
        contactPersonId: data.contactPersonId,
        // Document numbers
        commercialInvoiceNumber: data.commercialInvoiceNumber,
        blType: data.blType,
        blNumber: data.blNumber,
        awbType: data.awbType,
        awbNumber: data.awbNumber,
        roadConsignmentNumber: data.roadConsignmentNumber,
        // SEA freight details
        seaFreightType: data.seaFreightType,
        fcl20ftQuantity: data.fcl20ftQuantity,
        fcl40ftQuantity: data.fcl40ftQuantity,
        fclContainerOtherDescription: data.fclContainerOtherDescription,
        // Cargo description
        cargoDescription: data.cargoDescription,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: data.createdBy,
      };

      newFile.documents = newFile.documents.map(d => ({ ...d, fileId: newFile.id }));

      state = {
        ...state,
        files: [...state.files, newFile],
      };

      const statusDescription = data.serviceType === 'CLEARANCE'
        ? 'File created - Waiting for declaration assignment'
        : `File created (${data.serviceType.replace('_', ' ')}) - Routed to Commercial Department`;

      const log: ActivityLog = {
        id: Math.random().toString(36).substr(2, 9),
        fileId: newFile.id,
        userId: data.createdBy,
        action: 'FILE_CREATED',
        description: statusDescription,
        newStatus: initialStatus,
        createdAt: new Date(),
      };

      state = {
        ...state,
        activityLogs: [...state.activityLogs, log],
      };

      // Notify all relevant users about new file creation
      if (typeof window !== 'undefined') {
        import('./notificationStore').then(({ useNotificationStore }) => {
          const notifStore = useNotificationStore.getState?.();
          if (notifStore?.notifyFileCreated) {
            notifStore.notifyFileCreated(newFile);
          }
        });
      }

      notify();
      return newFile;
    },

    updateFileStatus: (fileId, newStatus, userId, additionalData = {}) => {
      const file = state.files.find(f => f.id === fileId);
      if (!file) return;

      const oldStatus = file.status;

      state = {
        ...state,
        files: state.files.map(f =>
          f.id === fileId
            ? { ...f, ...additionalData, status: newStatus, updatedAt: new Date() }
            : f
        ),
      };

      const log: ActivityLog = {
        id: Math.random().toString(36).substr(2, 9),
        fileId,
        userId,
        action: 'STATUS_CHANGED',
        description: `Status changed from ${oldStatus} to ${newStatus} - All channels notified`,
        oldStatus,
        newStatus,
        createdAt: new Date(),
      };

      state = {
        ...state,
        activityLogs: [...state.activityLogs, log],
      };

      // Notify all channels about status change
      if (typeof window !== 'undefined') {
        import('./notificationStore').then(({ useNotificationStore }) => {
          const notifStore = useNotificationStore.getState?.();
          if (notifStore?.notifyFileStatusChange) {
            const updatedFile = state.files.find(f => f.id === fileId);
            if (updatedFile) {
              notifStore.notifyFileStatusChange(updatedFile, oldStatus, newStatus);
            }
          }
        });
      }

      notify();
    },

    assignDeclarant: (fileId, declarantId, userId) => {
      const file = state.files.find(f => f.id === fileId);
      if (!file) return;
      const oldStatus = file.status;

      state = {
        ...state,
        files: state.files.map(f =>
          f.id === fileId
            ? { ...f, assignedDeclarantId: declarantId, status: 'ASSIGNED_TO_DECLARANT', updatedAt: new Date() }
            : f
        ),
      };

      const log: ActivityLog = {
        id: Math.random().toString(36).substr(2, 9),
        fileId,
        userId,
        action: 'DECLARANT_ASSIGNED',
        description: `Declarant assigned to file - All channels notified`,
        oldStatus,
        newStatus: 'ASSIGNED_TO_DECLARANT',
        createdAt: new Date(),
      };

      state = {
        ...state,
        activityLogs: [...state.activityLogs, log],
      };

      // Notify all channels
      if (typeof window !== 'undefined') {
        import('./notificationStore').then(({ useNotificationStore }) => {
          const notifStore = useNotificationStore.getState?.();
          if (notifStore?.notifyFileStatusChange) {
            const updatedFile = state.files.find(f => f.id === fileId);
            if (updatedFile) {
              notifStore.notifyFileStatusChange(updatedFile, oldStatus, 'ASSIGNED_TO_DECLARANT');
            }
          }
        });
      }

      notify();
    },

    assignOperationClerk: (fileId, clerkId, userId) => {
      const file = state.files.find(f => f.id === fileId);
      if (!file) return;
      const oldStatus = file.status;

      state = {
        ...state,
        files: state.files.map(f =>
          f.id === fileId
            ? { ...f, assignedOperationClerkId: clerkId, status: 'WAITING_FOR_RELEASE_ORDER', updatedAt: new Date() }
            : f
        ),
      };

      const log: ActivityLog = {
        id: Math.random().toString(36).substr(2, 9),
        fileId,
        userId,
        action: 'CLERK_ASSIGNED',
        description: `Operation clerk assigned to file - Status: WAITING FOR RELEASE ORDER`,
        oldStatus,
        newStatus: 'WAITING_FOR_RELEASE_ORDER',
        createdAt: new Date(),
      };

      state = {
        ...state,
        activityLogs: [...state.activityLogs, log],
      };

      // Notify all channels
      if (typeof window !== 'undefined') {
        import('./notificationStore').then(({ useNotificationStore }) => {
          const notifStore = useNotificationStore.getState?.();
          if (notifStore?.notifyFileStatusChange) {
            const updatedFile = state.files.find(f => f.id === fileId);
            if (updatedFile) {
              notifStore.notifyFileStatusChange(updatedFile, oldStatus, 'WAITING_FOR_RELEASE_ORDER');
            }
          }
        });
      }

      notify();
    },

    assignDriver: (fileId, driverId, userId) => {
      const file = state.files.find(f => f.id === fileId);
      if (!file) return;
      const oldStatus = file.status;

      state = {
        ...state,
        files: state.files.map(f =>
          f.id === fileId
            ? { ...f, assignedDriverId: driverId, driverAcceptedAt: new Date(), status: 'DRIVER_ASSIGNED', updatedAt: new Date() }
            : f
        ),
      };

      const log: ActivityLog = {
        id: Math.random().toString(36).substr(2, 9),
        fileId,
        userId,
        action: 'DRIVER_ASSIGNED',
        description: `Driver assigned to file - All channels notified`,
        oldStatus,
        newStatus: 'DRIVER_ASSIGNED',
        createdAt: new Date(),
      };

      state = {
        ...state,
        activityLogs: [...state.activityLogs, log],
      };

      // Notify all channels
      if (typeof window !== 'undefined') {
        import('./notificationStore').then(({ useNotificationStore }) => {
          const notifStore = useNotificationStore.getState?.();
          if (notifStore?.notifyFileStatusChange) {
            const updatedFile = state.files.find(f => f.id === fileId);
            if (updatedFile) {
              notifStore.notifyFileStatusChange(updatedFile, oldStatus, 'DRIVER_ASSIGNED');
            }
          }
        });
      }

      notify();
    },

    addDocument: (fileId, document) => {
      state = {
        ...state,
        files: state.files.map(f =>
          f.id === fileId
            ? { ...f, documents: [...f.documents, document], updatedAt: new Date() }
            : f
        ),
      };
      notify();
    },

    addComment: (fileId, userId, commentText) => {
      const log: ActivityLog = {
        id: Math.random().toString(36).substr(2, 9),
        fileId,
        userId,
        action: 'COMMENT_ADDED',
        description: commentText,
        createdAt: new Date(),
      };

      state = {
        ...state,
        activityLogs: [...state.activityLogs, log],
      };
      
      // Notify shipping line clerks for SEA shipments
      const file = state.files.find(f => f.id === fileId);
      if (file && file.transportMode === 'SEA' && (file.shipmentType === 'IMPORT' || file.shipmentType === 'EXPORT')) {
        if (typeof window !== 'undefined') {
          import('./notificationStore').then(({ useNotificationStore }) => {
            import('../data/mockData').then(({ mockUsers }) => {
              const shippingLineClerks = mockUsers.filter(u => u.role === 'shipping_line_clerk' && u.isActive);
              const notifStore = useNotificationStore.getState?.();
              if (notifStore) {
                shippingLineClerks.forEach(clerk => {
                  // Don't notify the person who made the comment
                  if (clerk.id !== userId) {
                    const { addNotification } = useNotificationStore();
                    addNotification({
                      userId: clerk.id,
                      title: '💬 New Comment on SEA File',
                      message: `New comment added to SEA file ${file.fileNumber}`,
                      type: 'info',
                      fileId: file.id,
                      link: '/shipping-line',
                    });
                  }
                });
              }
            });
          });
        }
      }
      
      notify();
    },

    getFileById: (id) => {
      const file = state.files.find(f => f.id === id);
      if (file) {
        // Use the store's own getClientById method instead of the imported one
        const client = state.clients.find(c => c.id === file.clientId);
        return {
          ...file,
          client: client,
          assignedDeclarant: file.assignedDeclarantId ? getUserById(file.assignedDeclarantId) : undefined,
          assignedOperationClerk: file.assignedOperationClerkId ? getUserById(file.assignedOperationClerkId) : undefined,
          assignedDriver: file.assignedDriverId ? getUserById(file.assignedDriverId) : undefined,
        };
      }
      return undefined;
    },

    getFilesByStatus: (status) => {
      return state.files
        .filter(f => f.status === status)
        .map(f => ({
          ...f,
          client: state.clients.find(c => c.id === f.clientId), // Use store's clients
          assignedDeclarant: f.assignedDeclarantId ? getUserById(f.assignedDeclarantId) : undefined,
          assignedOperationClerk: f.assignedOperationClerkId ? getUserById(f.assignedOperationClerkId) : undefined,
          assignedDriver: f.assignedDriverId ? getUserById(f.assignedDriverId) : undefined,
        }));
    },

    getFilesByClient: (clientId) => {
      return state.files
        .filter(f => f.clientId === clientId)
        .map(f => ({
          ...f,
          client: state.clients.find(c => c.id === f.clientId), // Use store's clients
          assignedDeclarant: f.assignedDeclarantId ? getUserById(f.assignedDeclarantId) : undefined,
          assignedOperationClerk: f.assignedOperationClerkId ? getUserById(f.assignedOperationClerkId) : undefined,
          assignedDriver: f.assignedDriverId ? getUserById(f.assignedDriverId) : undefined,
        }));
    },

    getFilesByDeclarant: (declarantId) => {
      return state.files
        .filter(f => f.assignedDeclarantId === declarantId)
        .map(f => ({
          ...f,
          client: state.clients.find(c => c.id === f.clientId), // Use store's clients
          assignedDeclarant: f.assignedDeclarantId ? getUserById(f.assignedDeclarantId) : undefined,
          assignedOperationClerk: f.assignedOperationClerkId ? getUserById(f.assignedOperationClerkId) : undefined,
          assignedDriver: f.assignedDriverId ? getUserById(f.assignedDriverId) : undefined,
        }));
    },

    getFilesByOperationClerk: (clerkId) => {
      return state.files
        .filter(f => f.assignedOperationClerkId === clerkId)
        .map(f => ({
          ...f,
          client: state.clients.find(c => c.id === f.clientId), // Use store's clients
          assignedDeclarant: f.assignedDeclarantId ? getUserById(f.assignedDeclarantId) : undefined,
          assignedOperationClerk: f.assignedOperationClerkId ? getUserById(f.assignedOperationClerkId) : undefined,
          assignedDriver: f.assignedDriverId ? getUserById(f.assignedDriverId) : undefined,
        }));
    },

    addClient: (clientData) => {
      const newClient: Client = {
        id: Math.random().toString(36).substr(2, 9),
        ...clientData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      state = {
        ...state,
        clients: [...state.clients, newClient],
      };
      notify();
      return newClient;
    },

    getClientById: (id) => {
      return state.clients.find(c => c.id === id);
    },

    getActivityLogs: (fileId) => {
      return state.activityLogs
        .filter(log => log.fileId === fileId)
        .map(log => ({
          ...log,
          user: getUserById(log.userId),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
  };
};
