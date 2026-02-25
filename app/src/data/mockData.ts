import type { 
  User, Client, ShipmentFile, PettyCashRequest, Permit, 
  DriverAssignment, Notification, ActivityLog
} from '@/types';

// Mock Users with Passwords
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'doc@company.com',
    name: 'John Smith',
    role: 'documentation_officer',
    department: 'Documentation',
    phone: '+255 712 345 001',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'declmanager@company.com',
    name: 'Sarah Johnson',
    role: 'declaration_manager',
    department: 'Declaration',
    phone: '+255 712 345 002',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    email: 'declarant1@company.com',
    name: 'Michael Brown',
    role: 'declarant',
    department: 'Declaration',
    phone: '+255 712 345 003',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    email: 'declarant2@company.com',
    name: 'Emily Davis',
    role: 'declarant',
    department: 'Declaration',
    phone: '+255 712 345 004',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    email: 'opsmanager@company.com',
    name: 'Robert Wilson',
    role: 'operations_manager',
    department: 'Operations',
    phone: '+255 712 345 005',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '6',
    email: 'clerk1@company.com',
    name: 'Lisa Anderson',
    role: 'operation_clerk',
    department: 'Operations',
    phone: '+255 712 345 006',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '7',
    email: 'clerk2@company.com',
    name: 'David Martinez',
    role: 'operation_clerk',
    department: 'Operations',
    phone: '+255 712 345 007',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '8',
    email: 'permits@company.com',
    name: 'Jennifer Taylor',
    role: 'permits_clerk',
    department: 'Operations',
    phone: '+255 712 345 008',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '9',
    email: 'delivery@company.com',
    name: 'James Thomas',
    role: 'delivery_clerk',
    department: 'Operations',
    phone: '+255 712 345 009',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '10',
    email: 'coo@company.com',
    name: 'Patricia White',
    role: 'coo',
    department: 'Management',
    phone: '+255 712 345 010',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '11',
    email: 'finance@company.com',
    name: 'Christopher Lee',
    role: 'finance_manager',
    department: 'Finance',
    phone: '+255 712 345 011',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '12',
    email: 'cashier@company.com',
    name: 'Amanda Hall',
    role: 'cashier',
    department: 'Finance',
    phone: '+255 712 345 012',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '13',
    email: 'hr@company.com',
    name: 'Daniel Clark',
    role: 'hr_manager',
    department: 'HR',
    phone: '+255 712 345 013',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '14',
    email: 'driver1@company.com',
    name: 'Joseph Lewis',
    role: 'driver',
    department: 'HR',
    phone: '+255 712 345 014',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '15',
    email: 'driver2@company.com',
    name: 'Matthew Walker',
    role: 'driver',
    department: 'HR',
    phone: '+255 712 345 015',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '16',
    email: 'driver3@company.com',
    name: 'Andrew Young',
    role: 'driver',
    department: 'HR',
    phone: '+255 712 345 016',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '17',
    email: 'contact@company.com',
    name: 'Michelle King',
    role: 'contact_person',
    department: 'Customer Service',
    phone: '+255 712 345 017',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '18',
    email: 'admin@company.com',
    name: 'Admin User',
    role: 'admin',
    department: 'IT',
    phone: '+255 712 345 018',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// User credentials for login (password is same as role name for simplicity)
export const userCredentials: Record<string, { email: string; password: string; role: string; name: string }> = {
  doc: { email: 'doc@company.com', password: 'doc123', role: 'documentation_officer', name: 'John Smith' },
  declmanager: { email: 'declmanager@company.com', password: 'declmanager123', role: 'declaration_manager', name: 'Sarah Johnson' },
  declarant1: { email: 'declarant1@company.com', password: 'declarant123', role: 'declarant', name: 'Michael Brown' },
  declarant2: { email: 'declarant2@company.com', password: 'declarant123', role: 'declarant', name: 'Emily Davis' },
  opsmanager: { email: 'opsmanager@company.com', password: 'opsmanager123', role: 'operations_manager', name: 'Robert Wilson' },
  clerk1: { email: 'clerk1@company.com', password: 'clerk123', role: 'operation_clerk', name: 'Lisa Anderson' },
  clerk2: { email: 'clerk2@company.com', password: 'clerk123', role: 'operation_clerk', name: 'David Martinez' },
  permits: { email: 'permits@company.com', password: 'permits123', role: 'permits_clerk', name: 'Jennifer Taylor' },
  delivery: { email: 'delivery@company.com', password: 'delivery123', role: 'delivery_clerk', name: 'James Thomas' },
  coo: { email: 'coo@company.com', password: 'coo123', role: 'coo', name: 'Patricia White' },
  finance: { email: 'finance@company.com', password: 'finance123', role: 'finance_manager', name: 'Christopher Lee' },
  cashier: { email: 'cashier@company.com', password: 'cashier123', role: 'cashier', name: 'Amanda Hall' },
  hr: { email: 'hr@company.com', password: 'hr123', role: 'hr_manager', name: 'Daniel Clark' },
  driver1: { email: 'driver1@company.com', password: 'driver123', role: 'driver', name: 'Joseph Lewis' },
  driver2: { email: 'driver2@company.com', password: 'driver123', role: 'driver', name: 'Matthew Walker' },
  driver3: { email: 'driver3@company.com', password: 'driver123', role: 'driver', name: 'Andrew Young' },
  contact: { email: 'contact@company.com', password: 'contact123', role: 'contact_person', name: 'Michelle King' },
  admin: { email: 'admin@company.com', password: 'admin123', role: 'admin', name: 'Admin User' },
};

// Mock Clients
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'ABC Trading Ltd',
    mobile: '+255 713 456 001',
    email: 'info@abctrading.com',
    tin: '101-234-567',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'XYZ Imports Inc',
    mobile: '+255 713 456 002',
    email: 'contact@xyzimports.com',
    tin: '102-345-678',
    isActive: true,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '3',
    name: 'Global Freight Solutions',
    mobile: '+255 713 456 003',
    email: 'operations@globalfreight.com',
    tin: '103-456-789',
    isActive: true,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
  },
  {
    id: '4',
    name: 'East African Logistics',
    mobile: '+255 713 456 004',
    tin: '104-567-890',
    isActive: true,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-20'),
  },
  {
    id: '5',
    name: 'Marine Cargo Services',
    mobile: '+255 713 456 005',
    email: 'cargo@marine.co.tz',
    tin: '105-678-901',
    isActive: true,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01'),
  },
];

// Mock Shipment Files - CLEANED (empty for fresh start)
export const mockShipmentFiles: ShipmentFile[] = [];

// Mock Petty Cash Requests - CLEANED (empty for fresh start)
export const mockPettyCashRequests: PettyCashRequest[] = [];

// Mock Permits - CLEANED (empty for fresh start)
export const mockPermits: Permit[] = [];

// Mock Driver Assignments - CLEANED (empty for fresh start)
export const mockDriverAssignments: DriverAssignment[] = [];

// Mock Notifications - CLEANED (empty for fresh start)
export const mockNotifications: Notification[] = [];

// Mock Activity Logs - CLEANED (empty for fresh start)
export const mockActivityLogs: ActivityLog[] = [];

// Helper functions to get data
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(u => u.id === id);
};

export const getClientById = (id: string): Client | undefined => {
  return mockClients.find(c => c.id === id);
};

export const getFileById = (id: string): ShipmentFile | undefined => {
  return mockShipmentFiles.find(f => f.id === id);
};

export const getFilesByStatus = (status: string): ShipmentFile[] => {
  return mockShipmentFiles.filter(f => f.status === status);
};

export const getDeclarantWorkload = (declarantId: string, files: any[] = mockShipmentFiles) => {
  const assigned = files.filter(f => f.assignedDeclarantId === declarantId);
  return {
    totalAssigned: assigned.length,
    inProgress: assigned.filter(f => 
      f.status === 'ASSIGNED_TO_DECLARANT' || 
      f.status === 'DECLARANT_ACKNOWLEDGED' ||
      f.status === 'WAITING_FOR_FINAL_ASSESSMENT'
    ).length,
    waitingAssessment: assigned.filter(f => f.status === 'WAITING_FOR_FINAL_ASSESSMENT').length,
  };
};

export const getOperationClerkWorkload = (clerkId: string, files: any[] = mockShipmentFiles) => {
  const assigned = files.filter(f => f.assignedOperationClerkId === clerkId);
  return {
    totalAssigned: assigned.length,
    inProgress: assigned.filter(f => 
      f.status === 'RECEIVED_BY_CLERK' || 
      f.status === 'CLERK_WORKING_ON_FILE' ||
      f.status === 'SHIPMENT_UNDER_VERIFICATION' ||
      f.status === 'WAITING_FOR_PERMIT_PAYMENTS' ||
      f.status === 'WAITING_FOR_PAYMENTS' ||
      f.status === 'WAITING_FOR_SWISSPORT_PAYMENTS' ||
      f.status === 'DRIVER_REQUESTED'
    ).length,
    waitingPayments: assigned.filter(f => 
      f.status === 'WAITING_FOR_PERMIT_PAYMENTS' ||
      f.status === 'WAITING_FOR_PAYMENTS' ||
      f.status === 'WAITING_FOR_SWISSPORT_PAYMENTS'
    ).length,
  };
};

export const getDriverWorkload = (driverId: string) => {
  const assigned = mockDriverAssignments.filter(a => a.driverId === driverId);
  return {
    totalAssigned: assigned.length,
    completedToday: assigned.filter(a => 
      a.status === 'COLLECTED' || a.status === 'DELIVERED'
    ).length,
    currentStatus: assigned.some(a => a.status === 'COLLECTING') ? 'ON_JOB' : 'AVAILABLE' as const,
  };
};
