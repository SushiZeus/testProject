import type { ShipmentFile } from '@/types';

const processingStatuses = new Set<ShipmentFile['status']>([
  'TAXES_PAID',
  'DECLARATION_DONE',
  'READY_FOR_OPERATIONS',
  'WAITING_FOR_RELEASE_ORDER',
  'RECEIVED_BY_CLERK',
  'CLERK_WORKING_ON_FILE',
  'SHIPMENT_UNDER_VERIFICATION',
  'WAITING_FOR_PERMIT',
  'WAITING_FOR_PERMITS',
  'WAITING_FOR_PERMIT_PAYMENTS',
  'PERMIT_PAYMENTS_DONE',
  'PERMITS_DONE',
  'RELEASE_ORDER_UPLOADED',
  'RELEASE_ORDER_RECEIVED',
  'WAITING_FOR_DELIVERY_ORDER',
  'PROCESSING_DELIVERY_ORDER',
  'WAITING_FOR_DO_PAYMENT',
  'DELIVERY_ORDER_PAYMENTS_DONE',
  'WAITING_FOR_DELIVERY_ORDER_SUBMISSION',
  'DELIVERY_ORDER_SUBMITTED',
  'DELIVERY_ORDER_READY',
  'DELIVERY_ORDER_COLLECTED',
  'WAITING_FOR_PORT_CHARGES',
  'WAITING_FOR_PORT_PAYMENT',
  'PORT_CHARGES_PAID',
  'WAITING_FOR_PORT_CHARGES_PAYMENT',
  'WAITING_FOR_SWISSPORT_CHARGES_PAYMENT',
  'WAITING_FOR_SWISSPORT_PAYMENTS',
  'SWISSPORT_CHARGES_PAID',
  'CARGO_CLEARED',
  'OPERATIONS_DONE',
  'VERIFICATION_FORM_PENDING',
  'VERIFICATION_FORM_COMPLETED',
  'COMMERCIAL_APPROVED',
  'QUOTATION_UPLOADED',
  'QUOTATION_SENT_TO_FINANCE',
  'DRIVER_REQUESTED',
  'DRIVER_ASSIGNED',
  'DRIVER_COLLECTING_CARGO',
  'CARGO_COLLECTED_FROM_ICD',
  'CARGO_COLLECTED_FROM_AIRPORT',
  'DELIVERED_TO_CLIENT',
  'SHIPMENT_AT_WAREHOUSE',
  'COMPLETED',
]);

const operationsCompleteStatuses = new Set<ShipmentFile['status']>([
  'OPERATIONS_DONE',
  'VERIFICATION_FORM_COMPLETED',
  'DRIVER_REQUESTED',
  'DRIVER_ASSIGNED',
  'DRIVER_COLLECTING_CARGO',
  'CARGO_COLLECTED_FROM_ICD',
  'CARGO_COLLECTED_FROM_AIRPORT',
  'DELIVERED_TO_CLIENT',
  'COMPLETED',
]);

const deliveryStartedStatuses = new Set<ShipmentFile['status']>([
  'DRIVER_REQUESTED',
  'DRIVER_ASSIGNED',
  'DRIVER_COLLECTING_CARGO',
  'CARGO_COLLECTED_FROM_ICD',
  'CARGO_COLLECTED_FROM_AIRPORT',
  'DELIVERED_TO_CLIENT',
  'COMPLETED',
]);

export interface FileProgress {
  percent: number;
  completedStages: number;
  totalStages: number;
  nextStage?: string;
}

/** Tracks progress from file opening through delivery and final client invoicing. */
export function getFileProgress(file: ShipmentFile): FileProgress {
  const isDelivered = !!file.deliveredToClientAt || file.status === 'DELIVERED_TO_CLIENT' || file.status === 'COMPLETED';
  const processingLabel = file.serviceType === 'CLEARANCE' ? 'Declaration complete' : 'Commercial processing complete';
  const stages = [
    { label: 'File opened', complete: true },
    {
      label: processingLabel,
      complete: file.serviceType === 'CLEARANCE'
        ? !!file.declarationDoneAt || processingStatuses.has(file.status)
        : file.status !== 'WAITING_FOR_COMMERCIAL' && file.status !== 'COMMERCIAL_PROCESSING',
    },
    {
      label: 'Operations clearance complete',
      complete: !!file.operationsDoneAt || operationsCompleteStatuses.has(file.status),
    },
    { label: 'Delivery started', complete: deliveryStartedStatuses.has(file.status) },
    { label: 'Delivered to client', complete: isDelivered },
    { label: 'Client invoice issued', complete: isDelivered && !!file.clientInvoiceUrl },
  ];

  let completedStages = 0;
  while (completedStages < stages.length && stages[completedStages].complete) completedStages += 1;

  return {
    percent: Math.round((completedStages / stages.length) * 100),
    completedStages,
    totalStages: stages.length,
    nextStage: stages[completedStages]?.label,
  };
}
