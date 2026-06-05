import type { 
  User, Client, ShipmentFile, PettyCashRequest, Permit, 
  DriverAssignment, Notification, ActivityLog
} from '@/types';

// Mock Users with Hierarchical Access Control
export const mockUsers: User[] = [
  // Department Staff - Limited Access
  {
    id: '1',
    email: 'documentation_officer@company.com',
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
    email: 'declaration_manager@company.com',
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
    email: 'declarant@company.com',
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
    id: '22',
    email: 'declarant3@company.com',
    name: 'Kevin Rodriguez',
    role: 'declarant',
    department: 'Declaration',
    phone: '+255 712 345 022',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    email: 'operations_manager@company.com',
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
    email: 'operation_clerk@company.com',
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
    email: 'operation_clerk2@company.com',
    name: 'David Martinez',
    role: 'operation_clerk',
    department: 'Operations',
    phone: '+255 712 345 007',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '23',
    email: 'operation_clerk3@company.com',
    name: 'Rachel Thompson',
    role: 'operation_clerk',
    department: 'Operations',
    phone: '+255 712 345 023',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '8',
    email: 'permits_clerk@company.com',
    name: 'Jennifer Taylor',
    role: 'permits_clerk',
    department: 'Operations',
    phone: '+255 712 345 008',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '24',
    email: 'shipping_line_clerk@company.com',
    name: 'Marcus Wilson',
    role: 'shipping_line_clerk',
    department: 'Operations',
    phone: '+255 712 345 024',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '9',
    email: 'delivery_clerk@company.com',
    name: 'James Thomas',
    role: 'delivery_clerk',
    department: 'Operations',
    phone: '+255 712 345 009',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '14',
    email: 'transport_manager@company.com',
    name: 'Mark Johnson',
    role: 'transport_manager',
    department: 'Transport',
    phone: '+255 712 345 014',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  
  // Finance Department - Limited to Finance + Full Access Roles
  {
    id: '11',
    email: 'finance_manager@company.com',
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
  
  // HR Department - Limited to HR + Full Access Roles
  {
    id: '13',
    email: 'hr_manager@company.com',
    name: 'Daniel Clark',
    role: 'hr_manager',
    department: 'HR',
    phone: '+255 712 345 013',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  
  // Senior Management - Full System Access
  {
    id: '19',
    email: 'commercial_manager@company.com',
    name: 'Victoria Thompson',
    role: 'commercial_manager',
    department: 'Commercial',
    phone: '+255 712 345 019',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '10',
    email: 'coo@company.com',
    name: 'Patricia White',
    role: 'coo',
    department: 'Executive',
    phone: '+255 712 345 010',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '20',
    email: 'managing_director@company.com',
    name: 'Alexander Rodriguez',
    role: 'managing_director',
    department: 'Executive',
    phone: '+255 712 345 020',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  
  // Transport and Drivers
  {
    id: '15',
    email: 'driver@company.com',
    name: 'Joseph Lewis',
    role: 'driver',
    department: 'Transport',
    phone: '+255 712 345 015',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '16',
    email: 'driver2@company.com',
    name: 'Matthew Walker',
    role: 'driver',
    department: 'Transport',
    phone: '+255 712 345 016',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '17',
    email: 'driver3@company.com',
    name: 'Andrew Young',
    role: 'driver',
    department: 'Transport',
    phone: '+255 712 345 017',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '25',
    email: 'driver4@company.com',
    name: 'Samuel Garcia',
    role: 'driver',
    department: 'Transport',
    phone: '+255 712 345 025',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '26',
    email: 'driver5@company.com',
    name: 'Benjamin Miller',
    role: 'driver',
    department: 'Transport',
    phone: '+255 712 345 026',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '27',
    email: 'driver6@company.com',
    name: 'Nathan Davis',
    role: 'driver',
    department: 'Transport',
    phone: '+255 712 345 027',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  
  // Client Services
  {
    id: '18',
    email: 'contact_person@company.com',
    name: 'Michelle King',
    role: 'contact_person',
    department: 'Client Services',
    phone: '+255 712 345 018',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  
  // System Administration
  {
    id: '21',
    email: 'administrator@company.com',
    name: 'Admin User',
    role: 'administrator',
    department: 'IT',
    phone: '+255 712 345 021',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// User credentials for login with hierarchical access
export const userCredentials: Record<string, { email: string; password: string; role: string; name: string }> = {
  // Department Staff - Limited Access
  documentation_officer: { email: 'documentation_officer@company.com', password: 'documentation_officer123', role: 'documentation_officer', name: 'John Smith' },
  declaration_manager: { email: 'declaration_manager@company.com', password: 'declaration_manager123', role: 'declaration_manager', name: 'Sarah Johnson' },
  declarant: { email: 'declarant@company.com', password: 'declarant123', role: 'declarant', name: 'Michael Brown' },
  declarant2: { email: 'declarant2@company.com', password: 'declarant123', role: 'declarant', name: 'Emily Davis' },
  declarant3: { email: 'declarant3@company.com', password: 'declarant123', role: 'declarant', name: 'Kevin Rodriguez' },
  operations_manager: { email: 'operations_manager@company.com', password: 'operations_manager123', role: 'operations_manager', name: 'Robert Wilson' },
  operation_clerk: { email: 'operation_clerk@company.com', password: 'operation_clerk123', role: 'operation_clerk', name: 'Lisa Anderson' },
  operation_clerk2: { email: 'operation_clerk2@company.com', password: 'operation_clerk123', role: 'operation_clerk', name: 'David Martinez' },
  operation_clerk3: { email: 'operation_clerk3@company.com', password: 'operation_clerk123', role: 'operation_clerk', name: 'Rachel Thompson' },
  permits_clerk: { email: 'permits_clerk@company.com', password: 'permits_clerk123', role: 'permits_clerk', name: 'Jennifer Taylor' },
  shipping_line_clerk: { email: 'shipping_line_clerk@company.com', password: 'shipping_line_clerk123', role: 'shipping_line_clerk', name: 'Marcus Wilson' },
  delivery_clerk: { email: 'delivery_clerk@company.com', password: 'delivery_clerk123', role: 'delivery_clerk', name: 'James Thomas' },
  transport_manager: { email: 'transport_manager@company.com', password: 'transport_manager123', role: 'transport_manager', name: 'Mark Johnson' },
  
  // Finance Department - Limited to Finance + Full Access Roles
  finance_manager: { email: 'finance_manager@company.com', password: 'finance_manager123', role: 'finance_manager', name: 'Christopher Lee' },
  cashier: { email: 'cashier@company.com', password: 'cashier123', role: 'cashier', name: 'Amanda Hall' },
  
  // HR Department - Limited to HR + Full Access Roles  
  hr_manager: { email: 'hr_manager@company.com', password: 'hr_manager123', role: 'hr_manager', name: 'Daniel Clark' },
  
  // Senior Management - Full System Access
  commercial_manager: { email: 'commercial_manager@company.com', password: 'commercial_manager123', role: 'commercial_manager', name: 'Victoria Thompson' },
  coo: { email: 'coo@company.com', password: 'coo123', role: 'coo', name: 'Patricia White' },
  managing_director: { email: 'managing_director@company.com', password: 'managing_director123', role: 'managing_director', name: 'Alexander Rodriguez' },
  
  // Transport and Drivers
  driver: { email: 'driver@company.com', password: 'driver123', role: 'driver', name: 'Joseph Lewis' },
  driver2: { email: 'driver2@company.com', password: 'driver123', role: 'driver', name: 'Matthew Walker' },
  driver3: { email: 'driver3@company.com', password: 'driver123', role: 'driver', name: 'Andrew Young' },
  driver4: { email: 'driver4@company.com', password: 'driver123', role: 'driver', name: 'Samuel Garcia' },
  driver5: { email: 'driver5@company.com', password: 'driver123', role: 'driver', name: 'Benjamin Miller' },
  driver6: { email: 'driver6@company.com', password: 'driver123', role: 'driver', name: 'Nathan Davis' },
  
  // Client Services
  contact_person: { email: 'contact_person@company.com', password: 'contact_person123', role: 'contact_person', name: 'Michelle King' },
  
  // System Administration
  administrator: { email: 'administrator@company.com', password: 'administrator123', role: 'administrator', name: 'Admin User' },
};

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'ABC Trading Ltd',
    mobile: '+255 713 456 001',
    email: 'contact@abctrading.com',
    tin: 'TIN001234567',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'XYZ Imports Inc',
    mobile: '+255 713 456 002',
    email: 'info@xyzimports.com',
    tin: 'TIN002345678',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Global Freight Solutions',
    mobile: '+255 713 456 003',
    email: 'operations@globalfreight.com',
    tin: 'TIN003456789',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'East African Logistics',
    mobile: '+255 713 456 004',
    email: 'logistics@eastafrica.com',
    tin: 'TIN004567890',
    isActive: true,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: '5',
    name: 'Marine Cargo Services',
    mobile: '+255 713 456 005',
    email: 'marine@cargosvc.com',
    tin: 'TIN005678901',
    isActive: true,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
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

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => {
  // Check userManagementStore first (for newly registered users)
  if (typeof window !== 'undefined') {
    try {
      const savedUserState = localStorage.getItem('userManagementStore');
      if (savedUserState) {
        const parsed = JSON.parse(savedUserState);
        const user = parsed.users.find((u: any) => u.id === id);
        if (user) {
          return {
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          };
        }
      }
    } catch (error) {
      console.error('Error loading user from userManagementStore:', error);
    }
  }

  // Fall back to mockUsers
  return mockUsers.find(user => user.id === id);
};

// Helper function to get client by ID
export const getClientById = (id: string): Client | undefined => {
  return mockClients.find(client => client.id === id);
};

// Workload calculation functions
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