import type { FileStatus, ShipmentFile } from '@/types';

type ShipmentStatusFields = Pick<
  ShipmentFile,
  | 'status'
  | 'requiredPermits'
  | 'permitsDoneAt'
  | 'transportMode'
  | 'taxDocumentUrl'
  | 'taxPaymentConfirmed'
  | 'taxPaymentFlow'
  | 'wharfageDocumentUrl'
  | 'wharfagePaymentConfirmed'
  | 'wharfagePaymentFlow'
  | 'portChargesUrl'
  | 'portChargesPaidAt'
  | 'swissportChargesUrl'
  | 'swissportChargesPaidAt'
  | 'releaseOrderUrl'
  | 'deliveryOrderDocumentUrl'
  | 'doPaymentRequestInvoiceUrl'
  | 'doPaymentRequestStatus'
>;

/** Returns the highest-priority outstanding clearance milestone for display. */
export function getShipmentDisplayStatus(file: ShipmentStatusFields): FileStatus {
  const permitsCompleted = !!file.permitsDoneAt || file.status === 'PERMITS_DONE' || file.status === 'OPERATIONS_DONE';
  if (file.requiredPermits?.length && !permitsCompleted) return 'WAITING_FOR_PERMITS';
  if (file.transportMode === 'SEA' && file.portChargesUrl && !file.portChargesPaidAt && file.status !== 'PORT_CHARGES_PAID' && file.status !== 'OPERATIONS_DONE') {
    return 'WAITING_FOR_PORT_CHARGES_PAYMENT';
  }
  if (file.transportMode === 'AIR' && file.swissportChargesUrl && !file.swissportChargesPaidAt && file.status !== 'SWISSPORT_CHARGES_PAID' && file.status !== 'OPERATIONS_DONE') {
    return 'WAITING_FOR_SWISSPORT_CHARGES_PAYMENT';
  }
  return file.status;
}

/** Returns the current file status plus any parallel milestones still in progress. */
export function getShipmentDisplayStatuses(file: ShipmentStatusFields): string[] {
  const statuses = new Set<string>([file.status]);

  if (file.taxDocumentUrl && !file.taxPaymentConfirmed) {
    statuses.add('WAITING_FOR_TAX_PAYMENT');
    if (file.taxPaymentFlow?.status && file.taxPaymentFlow.status !== 'PAID') {
      statuses.add(`TAX · ${file.taxPaymentFlow.status.replaceAll('_', ' ')}`);
    }
  }

  if (file.transportMode === 'SEA') {
    if (file.taxPaymentConfirmed && !file.wharfageDocumentUrl) {
      statuses.add('WAITING_FOR_WHARFAGE_CHARGES');
    } else if (file.wharfageDocumentUrl && !file.wharfagePaymentConfirmed) {
      statuses.add('WAITING_FOR_WHARFAGE_PAYMENT');
      if (file.wharfagePaymentFlow?.status && file.wharfagePaymentFlow.status !== 'PAID') {
        statuses.add(`WHARFAGE · ${file.wharfagePaymentFlow.status.replaceAll('_', ' ')}`);
      }
    }
  }

  const permitsCompleted = !!file.permitsDoneAt || file.status === 'PERMITS_DONE' || file.status === 'OPERATIONS_DONE';
  if (file.requiredPermits?.length && !permitsCompleted) statuses.add('WAITING_FOR_PERMITS');

  if (file.transportMode === 'SEA' && file.portChargesUrl && !file.portChargesPaidAt && file.status !== 'PORT_CHARGES_PAID' && file.status !== 'OPERATIONS_DONE') {
    statuses.add('WAITING_FOR_PORT_CHARGES_PAYMENT');
  }
  if (file.transportMode === 'AIR' && file.swissportChargesUrl && !file.swissportChargesPaidAt && file.status !== 'SWISSPORT_CHARGES_PAID' && file.status !== 'OPERATIONS_DONE') {
    statuses.add('WAITING_FOR_SWISSPORT_CHARGES_PAYMENT');
  }
  if (file.transportMode === 'SEA' && file.releaseOrderUrl && !file.deliveryOrderDocumentUrl) {
    statuses.add('WAITING_FOR_DELIVERY_ORDER');
  }
  if (file.doPaymentRequestInvoiceUrl && file.doPaymentRequestStatus === 'PENDING') {
    statuses.add('WAITING_FOR_DO_PAYMENT');
  }

  return [...statuses];
}
