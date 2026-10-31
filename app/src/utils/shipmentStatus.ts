import type { FileStatus, ShipmentFile } from '@/types';

type ShipmentStatusFields = Pick<
  ShipmentFile,
  | 'status'
  | 'requiredPermits'
  | 'permitsDoneAt'
  | 'transportMode'
  | 'portChargesUrl'
  | 'portChargesPaidAt'
  | 'swissportChargesUrl'
  | 'swissportChargesPaidAt'
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
