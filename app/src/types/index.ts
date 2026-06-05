// User Roles
export type UserRole = 
  | 'documentation_officer'
  | 'declaration_manager'
  | 'declarant'
  | 'operations_manager'
  | 'operation_clerk'
  | 'permits_clerk'
  | 'shipping_line_clerk'
  | 'delivery_clerk'
  | 'transport_manager'
  | 'finance_manager'
  | 'cashier'
  | 'commercial_manager'
  | 'coo'
  | 'managing_director'
  | 'hr_manager'
  | 'driver'
  | 'contact_person'
  | 'administrator';

// Shipment Types
export type ShipmentType = 'IMPORT' | 'EXPORT' | 'TRANSSHIPMENT' | 'TRANSIT';

// Service Types
export type ServiceType = 'CLEARANCE' | 'DOCUMENT_HANDOVER' | 'TRANSPORTATION';

// Transport Modes
export type TransportMode = 'AIR' | 'SEA' | 'ROAD' | 'RAIL';

// Document Types
export type DocumentType = 
  | 'commercial_invoice'
  | 'packing_list'
  | 'bill_of_lading'
  | 'airway_bill'
  | 'road_consignment_note'
  | 'coc'
  | 'coo'
  | 'other';

// File Status
export type FileStatus =
  | 'WAITING_FOR_DECLARATION'
  | 'ASSIGNED_TO_DECLARANT'
  | 'DECLARANT_ACKNOWLEDGED'
  | 'WAITING_FOR_FINAL_ASSESSMENT'
  | 'DECLARATION_DONE'
  | 'WAITING_FOR_TAX_PAYMENT'
  | 'WAITING_FOR_WHARFAGE_PAYMENT' // NEW: When tax is paid but wharfage is pending (SEA only)
  | 'TAXES_PAID'
  | 'READY_FOR_OPERATIONS'
  | 'WAITING_FOR_RELEASE_ORDER' // NEW: After file assigned to operations, waiting for release order
  | 'RECEIVED_BY_CLERK'
  | 'CLERK_WORKING_ON_FILE'
  | 'SHIPMENT_UNDER_VERIFICATION'
  | 'WAITING_FOR_PERMITS'
  | 'WAITING_FOR_PERMIT_PAYMENTS'
  | 'PERMIT_PAYMENTS_DONE'
  | 'PERMITS_DONE'
  | 'RELEASE_ORDER_UPLOADED'
  | 'RELEASE_ORDER_RECEIVED' // NEW: When release order is uploaded
  | 'PROCESSING_DELIVERY_ORDER'
  | 'WAITING_FOR_DO_PAYMENT'
  | 'DELIVERY_ORDER_PAYMENTS_DONE'
  | 'WAITING_FOR_DELIVERY_ORDER_SUBMISSION'
  | 'DELIVERY_ORDER_SUBMITTED'
  | 'DELIVERY_ORDER_READY'
  | 'DELIVERY_ORDER_COLLECTED'
  | 'WAITING_FOR_PORT_CHARGES'
  | 'WAITING_FOR_PORT_PAYMENT'
  | 'PORT_CHARGES_PAID'
  | 'WAITING_FOR_PORT_CHARGES_PAYMENT'
  | 'WAITING_FOR_SWISSPORT_CHARGES_PAYMENT'
  | 'WAITING_FOR_SWISSPORT_PAYMENTS'
  | 'SWISSPORT_CHARGES_PAID'
  | 'CARGO_CLEARED' // NEW: After swissport charges paid, ready for delivery
  | 'OPERATIONS_DONE' // NEW: After port charges paid, operations complete, ready for delivery
  | 'VERIFICATION_FORM_PENDING' // Cargo verification form must be completed before delivery
  | 'VERIFICATION_FORM_COMPLETED' // Cargo verification form completed, ready for driver assignment
  | 'WAITING_FOR_COMMERCIAL' // NEW: For DOCUMENT_HANDOVER and TRANSPORTATION services
  | 'COMMERCIAL_PROCESSING' // NEW: Commercial department processing
  | 'COMMERCIAL_APPROVED' // NEW: Approved by commercial, ready for delivery/handover
  | 'QUOTATION_UPLOADED' // Quotation uploaded by commercial manager
  | 'QUOTATION_SENT_TO_FINANCE' // Quotation sent to finance for Proforma Invoice
  | 'DRIVER_REQUESTED'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_COLLECTING_CARGO'
  | 'CARGO_COLLECTED_FROM_ICD'
  | 'CARGO_COLLECTED_FROM_AIRPORT'
  | 'DELIVERED_TO_CLIENT'
  | 'SHIPMENT_AT_WAREHOUSE'
  | 'COMPLETED'
  | 'CANCELLED';

// Petty Cash Request Status
export type PettyCashStatus =
  | 'PENDING_HR_APPROVAL'
  | 'PENDING_MANAGER_APPROVAL'
  | 'PENDING_DECLARATION_MANAGER_APPROVAL'
  | 'PENDING_COO_APPROVAL'
  | 'APPROVED_BY_COO'
  | 'COO_DIRECT_TO_FINANCE'
  | 'REJECTED_BY_HR'
  | 'REJECTED_BY_MANAGER'
  | 'REJECTED_BY_DECLARATION_MANAGER'
  | 'REJECTED_BY_COO'
  | 'PENDING_FINANCE'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'REJECTED_BACK_TO_CLERK';

// Driver Status
export type DriverStatus = 'AVAILABLE' | 'ON_JOB' | 'OFF_DUTY';

// Job Status for Drivers
export type DriverJobStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'COLLECTING'
  | 'COLLECTED'
  | 'DELIVERING'
  | 'DELIVERED';

// Payment Option
export type PaymentOption = 'CLIENT_TO_PAY' | 'PROCEED_TO_REQUEST';

// User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Client Interface
export interface Client {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  tin: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Shipping Document Interface
export interface ShippingDocument {
  id: string;
  fileId: string;
  documentType: DocumentType;
  documentName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Shipment File Interface
export interface ShipmentFile {
  id: string;
  fileNumber: string;
  clientId: string;
  client?: Client;
  shipmentType: ShipmentType;
  serviceType: ServiceType; // NEW: CLEARANCE, DOCUMENT_HANDOVER, or TRANSPORTATION
  transportMode: TransportMode;
  documents: ShippingDocument[];
  status: FileStatus;
  
  // Document numbering fields
  commercialInvoiceNumber?: string;
  blType?: 'HBL' | 'MBL'; // Bill of Lading type for SEA
  blNumber?: string; // Bill of Lading number
  awbType?: 'HAWB' | 'MAWB'; // Airway Bill type for AIR
  awbNumber?: string; // Airway Bill number
  roadConsignmentNumber?: string;
  
  // Contact person
  contactPersonId?: string;
  contactPerson?: User;
  
  // SEA freight specific fields
  seaFreightType?: 'LCL' | 'FCL'; // Less than Container Load or Full Container Load
  fcl20ftQuantity?: number; // 20ft container quantity
  fcl40ftQuantity?: number; // 40ft container quantity
  fclContainerOtherDescription?: string;
  
  // Cargo information
  cargoDescription?: string;
  
  // Declaration fields
  assignedDeclarantId?: string;
  assignedDeclarant?: User;
  taxAssessmentUrl?: string;
  taxDocumentUrl?: string; // NEW: Separate tax document upload
  wharfageDocumentUrl?: string; // NEW: Separate wharfage document upload (SEA only)
  taxDocumentUploadedAt?: Date; // NEW: Tax document upload timestamp
  wharfageDocumentUploadedAt?: Date; // NEW: Wharfage document upload timestamp
  taxPaymentConfirmed?: boolean; // NEW: Tax payment confirmed
  wharfagePaymentConfirmed?: boolean; // NEW: Wharfage payment confirmed (SEA only)
  taxPaymentConfirmedAt?: Date; // NEW: Tax payment confirmation timestamp
  wharfagePaymentConfirmedAt?: Date; // NEW: Wharfage payment confirmation timestamp
  declarationDoneAt?: Date;
  taxesPaidAt?: Date;
  
  // Arrival Status fields
  arrivalStatusFilled?: boolean;
  // SEA shipment arrival dates
  eta?: Date; // Estimated Time of Arrival
  etb?: Date; // Estimated Time of Berthing
  carryInDate?: Date;
  manifestComparisonDate?: Date;
  wharfageDate?: Date;
  // AIR shipment arrival dates (eta, carryInDate, manifestComparisonDate reused)
  
  // Operations fields
  assignedOperationClerkId?: string;
  assignedOperationClerk?: User;
  clerkAcknowledgedAt?: Date;
  verificationCheckedAt?: Date;
  verificationPhotos?: string[]; // URLs of verification photos (max 7)
  releaseOrderUrl?: string;
  releaseOrderUploadedAt?: Date; // When release order is uploaded
  swissportPaidAt?: Date;
  cargoClearedAt?: Date; // When cargo is cleared after swissport charges paid
  
  // Permits fields
  assignedPermitsClerkId?: string;
  assignedPermitsClerk?: User;
  permitPaymentOption?: PaymentOption;
  permitInvoiceUrl?: string;
  permitDocumentUrl?: string;
  permitPaymentsDoneAt?: Date;
  permitsDoneAt?: Date; // When permits clerk marks permits as done
  
  // Shipping line fields (SEA only)
  assignedShippingLineClerkId?: string;
  assignedShippingLineClerk?: User;
  deliveryOrderApplicationAt?: Date;
  deliveryOrderInvoiceUrl?: string;
  deliveryOrderDocumentUrl?: string;
  deliveryOrderPaymentsDoneAt?: Date;
  deliveryOrderSubmittedAt?: Date; // When shipping line clerk submits DO
  
  // Shipping documentation fields (SEA only)
  hblNumber?: string; // House Bill of Lading
  mblNumber?: string; // Master Bill of Lading
  doNumber?: string; // Delivery Order Number
  containerNumbers?: string; // Container numbers (comma-separated)
  
  // Port charges fields
  portChargesInvoiceUrl?: string;
  portChargesUrl?: string; // NEW: Port charges document (SEA)
  portChargesPaidAt?: Date;
  swissportChargesUrl?: string; // NEW: Swissport charges document (AIR)
  swissportChargesPaidAt?: Date; // NEW: Swissport charges paid timestamp
  operationsDoneAt?: Date; // NEW: When operations are complete (after port charges paid for SEA)
  
  // Commercial / Quotation fields
  quotationUrl?: string;           // Uploaded quotation document URL
  quotationFileName?: string;      // Original filename of the quotation
  quotationUploadedAt?: Date;      // When quotation was uploaded
  quotationUploadedBy?: string;    // User ID who uploaded
  quotationSentToFinanceAt?: Date; // When sent to finance for Proforma Invoice
  quotationNotes?: string;         // Notes from commercial manager

  // Cargo Verification Form
  cargoVerificationForm?: CargoVerificationForm;
  cargoVerificationCompletedAt?: Date;
  cargoVerificationCompletedBy?: string;

  // Delivery fields
  assignedDeliveryClerkId?: string;
  assignedDriverId?: string;
  assignedDriver?: User;
  driverAcceptedAt?: Date;
  cargoCollectedAt?: Date;
  deliveredToClientAt?: Date;
  arrivedAtWarehouseAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Comments/History
  comments?: FileComment[];
}

// Cargo Verification Form Interface
export type VerificationAnswer = 'YES' | 'NO' | '';

export interface CargoVerificationForm {
  // Header fields
  station: string;
  verificationDate: string;
  verificationOfficer: string;
  tansadNo: string;
  // Inspection checklist (YES/NO + remarks)
  q1_physicalDamage: VerificationAnswer;
  q1_remarks: string;
  q2_sealsIntact: VerificationAnswer;
  q2_remarks: string;
  q3_discrepancyQuantity: VerificationAnswer;
  q3_remarks: string;
  q4_sameItemsDeclared: VerificationAnswer;
  q4_remarks: string;
  q5_allPartsSeen: VerificationAnswer;
  q5_remarks: string;
  q6_internalDamage: VerificationAnswer;
  q6_remarks: string;
  q7_specialAttention: VerificationAnswer;
  q7_remarks: string;
  q8_containerLocked: VerificationAnswer;
  q8_remarks: string;
  q9_sealFixed: VerificationAnswer;
  q9_sealNumber: string;
  q9_remarks: string;
  q10_samplesTaken: VerificationAnswer;
  q10_quantity: string;
  q10_remarks: string;
  // Footer
  generalRemarks: string;
  officerName: string;
  completedAt?: Date;
  completedBy?: string;
}
export interface FileComment {
  id: string;
  fileId: string;
  userId: string;
  user?: User;
  comment: string;
  createdAt: Date;
}

// Petty Cash Request Interface
export interface PettyCashRequest {
  id: string;
  requestNumber: string;
  fileId?: string;
  file?: ShipmentFile;
  requestedBy: string;
  requester?: User;
  amount: number;
  currency: string;
  description: string;
  attachmentUrl?: string;
  status: PettyCashStatus;
  
  // Approval chain
  hrManagerId?: string;
  hrManager?: User;
  hrComment?: string;
  hrActionAt?: Date;
  
  managerId?: string;
  manager?: User;
  managerComment?: string;
  managerActionAt?: Date;
  
  declarationManagerId?: string;
  declarationManager?: User;
  declarationManagerComment?: string;
  declarationManagerActionAt?: Date;
  
  cooId?: string;
  coo?: User;
  cooComment?: string;
  cooActionAt?: Date;
  
  financeManagerId?: string;
  financeManager?: User;
  financeComment?: string;
  financeActionAt?: Date;
  
  cashierId?: string;
  cashier?: User;
  paidAt?: Date;
  paymentReference?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Permit Interface
export interface Permit {
  id: string;
  fileId: string;
  file?: ShipmentFile;
  permitType: string;
  invoiceUrl?: string;
  permitUrl?: string;
  paymentOption?: PaymentOption;
  isPaid: boolean;
  paidAt?: Date;
  paidBy?: string;
  requestedBy: string;
  requester?: User;
  createdAt: Date;
  updatedAt: Date;
}

// Driver Assignment Interface
export interface DriverAssignment {
  id: string;
  fileId: string;
  file?: ShipmentFile;
  driverId: string;
  driver?: User;
  requestedBy: string;
  requester?: User;
  assignedBy?: string;
  assignedByUser?: User;
  status: DriverJobStatus;
  acceptedAt?: Date;
  collectedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  fileId?: string;
  createdAt: Date;
}

// Activity Log Interface
export interface ActivityLog {
  id: string;
  fileId: string;
  userId: string;
  user?: User;
  action: string;
  description: string;
  oldStatus?: FileStatus;
  newStatus?: FileStatus;
  createdAt: Date;
}

// Dashboard Stats Interface
export interface DashboardStats {
  totalFiles: number;
  waitingFiles: number;
  inProgressFiles: number;
  completedFiles: number;
  myAssignedFiles: number;
  pendingApprovals: number;
  pendingPayments: number;
}

// Workload Interface
export interface DeclarantWorkload {
  declarant: User;
  totalAssigned: number;
  inProgress: number;
  waitingAssessment: number;
}

export interface DriverWorkload {
  driver: User;
  totalAssigned: number;
  completedToday: number;
  currentStatus: DriverStatus;
}

// Form Data Types
export interface FileOpeningFormData {
  clientType: 'new' | 'existing';
  client?: Client;
  clientId?: string;
  shipmentType: ShipmentType;
  transportMode: TransportMode;
  documents: { type: DocumentType; file: File }[];
}

export interface PettyCashFormData {
  fileId: string;
  amount: number;
  currency: string;
  description: string;
  attachment?: File;
}

export interface PermitFormData {
  fileId: string;
  permitType: string;
  invoice?: File;
  paymentOption: PaymentOption;
}

// Role-based permissions
export interface Permission {
  action: string;
  roles: UserRole[];
}

export const PERMISSIONS: Permission[] = [
  { action: 'create_file', roles: ['documentation_officer', 'administrator'] },
  { action: 'assign_declarant', roles: ['declaration_manager', 'administrator'] },
  { action: 'process_declaration', roles: ['declarant', 'administrator'] },
  { action: 'assign_operation_clerk', roles: ['operations_manager', 'administrator'] },
  { action: 'process_operations', roles: ['operation_clerk', 'permits_clerk', 'delivery_clerk', 'administrator'] },
  { action: 'approve_petty_cash_manager', roles: ['operations_manager', 'administrator'] },
  { action: 'approve_petty_cash_coo', roles: ['coo', 'administrator'] },
  { action: 'process_finance', roles: ['finance_manager', 'cashier', 'administrator'] },
  { action: 'assign_driver', roles: ['hr_manager', 'administrator'] },
  { action: 'view_all_files', roles: ['administrator', 'coo'] },
  { action: 'view_department_files', roles: ['declaration_manager', 'operations_manager', 'finance_manager', 'hr_manager'] },
];


// Leave Management Types

// Leave Type
export type LeaveType = 
  | 'ANNUAL'
  | 'SICK'
  | 'EMERGENCY'
  | 'UNPAID'
  | 'MATERNITY'
  | 'PATERNITY'
  | 'COMPASSIONATE'
  | 'STUDY';

// Leave Status
export type LeaveStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

// Leave Request Interface
export interface LeaveRequest {
  id: string;
  requestNumber: string; // LR-2026-XXXX
  userId: string;
  user?: User;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  description: string;
  status: LeaveStatus;
  
  // HR Manager review
  hrManagerId?: string;
  hrManager?: User;
  hrComment?: string;
  reviewedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// User with Leave Balance
export interface UserWithLeaveBalance extends User {
  annualLeaveBalance: number; // Days remaining
  sickLeaveBalance: number;
  totalLeaveTaken: number;
  leaveRequests?: LeaveRequest[];
}
// Export document types
export * from './document';