import type { ShipmentFile, UserRole } from '@/types';

type PaymentActor = { id: string; role: UserRole };

/** Returns true for the shipment-specific user who owns payer choice and client proof. */
export function isDeclarationPaymentContact(
  user: PaymentActor | null | undefined,
  file: ShipmentFile,
  requestedBy?: string,
): boolean {
  if (!user) return false;

  // Keep support for legacy files that explicitly assign a Contact Person.
  if (user.role === 'contact_person' && (file.contactPersonId === user.id || file.contactPerson?.id === user.id)) return true;

  if (file.transportMode === 'AIR' && user.role === 'documentation_officer') {
    return file.createdBy === user.id || file.contactPersonId === user.id;
  }

  if (file.transportMode === 'SEA' && user.role === 'declarant') {
    return file.assignedDeclarantId === user.id || (!file.assignedDeclarantId && requestedBy === user.id);
  }

  return false;
}

/** Selects who should receive payer-choice/proof notifications for this shipment. */
export function getDeclarationPaymentContactIds(file: ShipmentFile, requestedBy?: string): string[] {
  const ids = new Set<string>();
  if (file.contactPersonId) ids.add(file.contactPersonId);
  if (file.contactPerson?.id) ids.add(file.contactPerson.id);

  if (file.transportMode === 'AIR') {
    if (file.createdBy) ids.add(file.createdBy);
  } else if (file.transportMode === 'SEA') {
    const declarantId = file.assignedDeclarantId || requestedBy;
    if (declarantId) ids.add(declarantId);
  }

  return [...ids];
}
