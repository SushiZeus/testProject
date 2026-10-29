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
  if (file.requiredPermits?.length && !file.permitsDoneAt) return 'WAITING_FOR_PERMITS';
  if (file.transportMode === 'SEA' && file.portChargesUrl && !file.portChargesPaidAt) {
    return 'WAITING_FOR_PORT_CHARGES_PAYMENT';
  }
  if (file.transportMode === 'AIR' && file.swissportChargesUrl && !file.swissportChargesPaidAt) {
    return 'WAITING_FOR_SWISSPORT_CHARGES_PAYMENT';
  }
  return file.status;
}