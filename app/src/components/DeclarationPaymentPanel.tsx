import { useState } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useDocumentStore } from '@/store/documentStore';
import { useFileStore } from '@/store/fileStore';
import { useNotificationStore } from '@/store/notificationStore';
import { mockUsers } from '@/data/mockData';
import type { DeclarationPaymentFlow, ShipmentFile, UserRole } from '@/types';
import { toast } from 'sonner';

interface Props {
  file: ShipmentFile;
  kind: 'TAX' | 'WHARFAGE';
}

export function DeclarationPaymentPanel({ file, kind }: Props) {
  const { user } = useAuthStore();
  const { updateFileStatus } = useFileStore();
  const { uploadDocument } = useDocumentStore();
  const { addNotification } = useNotificationStore();
  const [comment, setComment] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [payerChoice, setPayerChoice] = useState<'CLIENT' | 'OFFICE' | ''>('');
  const isTax = kind === 'TAX';
  const title = isTax ? 'Tax' : 'Wharfage';
  const flowKey = isTax ? 'taxPaymentFlow' : 'wharfagePaymentFlow';
  const paidKey = isTax ? 'taxPaymentConfirmed' : 'wharfagePaymentConfirmed';
  const paidAtKey = isTax ? 'taxPaymentConfirmedAt' : 'wharfagePaymentConfirmedAt';
  const flow = (file[flowKey] || {}) as DeclarationPaymentFlow;
  const isRequester = user?.role === 'declarant' && (!file.assignedDeclarantId || file.assignedDeclarantId === user.id);
  // Some older/imported files have the contact stored only as an embedded user,
  // while newly assigned files use contactPersonId. If no contact is assigned,
  // match the notification fallback and allow a signed-in contact to respond.
  const assignedContactIds = [file.contactPersonId, file.contactPerson?.id].filter(Boolean);
  const isContact = user?.role === 'contact_person' && (!assignedContactIds.length || assignedContactIds.includes(user.id));
  const status = flow.status;

  const notifyRole = (role: UserRole, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const users = mockUsers.filter((candidate) => candidate.role === role && candidate.isActive);
    users.forEach((candidate) => addNotification({
      userId: candidate.id,
      title: `${title} payment ${type === 'warning' ? 'needs action' : 'update'}`,
      message,
      type,
      fileId: file.id,
      link: `/files/${file.id}`,
    }));
  };

  const notifyContact = (message: string, type: 'info' | 'warning' = 'info') => {
    if (file.contactPersonId) {
      addNotification({
        userId: file.contactPersonId,
        title: `${title} payment update`,
        message,
        type,
        fileId: file.id,
        link: `/files/${file.id}`,
      });
    } else {
      notifyRole('contact_person', message, type);
    }
  };

  const saveFlow = (
    nextFlow: DeclarationPaymentFlow,
    nextStatus: ShipmentFile['status'] = file.status,
    extra: Partial<ShipmentFile> = {},
  ) => {
    if (!user) return;
    updateFileStatus(file.id, nextStatus, user.id, { [flowKey]: nextFlow, ...extra });
  };

  const submitRequest = () => {
    if (!user || !isRequester) return;
    const nextFlow: DeclarationPaymentFlow = { requestedBy: user.id, requestedAt: new Date(), status: 'PENDING_DECLARATION_MANAGER' };
    saveFlow(nextFlow, isTax ? 'WAITING_FOR_TAX_PAYMENT' : 'WAITING_FOR_WHARFAGE_PAYMENT');
    notifyRole('declaration_manager', `${title} payment approval is requested for file ${file.fileNumber}. Review the attached assessment and approve or reject it.`, 'warning');
    toast.success(`${title} payment request sent to the Declaration Manager`);
  };

  const managerDecision = (approve: boolean) => {
    if (!user || user.role !== 'declaration_manager') return;
    const note = comment.trim();
    if (!note) return toast.error('Add a comment before deciding');
    const nextFlow: DeclarationPaymentFlow = {
      ...flow,
      status: approve ? 'PENDING_CONTACT_PERSON' : 'REJECTED',
      declarationManagerComment: note,
      declarationManagerReviewedBy: user.id,
      declarationManagerReviewedAt: new Date(),
      rejectedByRole: approve ? undefined : user.role,
    };
    saveFlow(nextFlow);
    if (approve) notifyContact(`Declaration Manager approved the ${title.toLowerCase()} payment request for file ${file.fileNumber}. Select whether the client or office will pay.`, 'info');
    else if (flow.requestedBy) addNotification({ userId: flow.requestedBy, title: `${title} payment request rejected`, message: `Declaration Manager rejected file ${file.fileNumber}: ${note}`, type: 'warning', fileId: file.id, link: `/files/${file.id}` });
    setComment('');
    toast.success(approve ? 'Approved; sent to the contact person' : 'Payment request rejected');
  };

  const selectPayer = () => {
    if (!user || !isContact || !payerChoice) return;
    const nextFlow: DeclarationPaymentFlow = {
      ...flow,
      payer: payerChoice,
      status: payerChoice === 'CLIENT' ? 'CLIENT_PAYMENT_PENDING' : 'OFFICE_PENDING_COO',
    };
    saveFlow(nextFlow);
    if (payerChoice === 'OFFICE') notifyRole('coo', `Office payment for ${title.toLowerCase()} on file ${file.fileNumber} needs your approval.`, 'warning');
    toast.success(payerChoice === 'CLIENT' ? 'Client payment selected; upload its proof when paid' : 'Office payment sent to the COO');
  };

  const submitClientProof = async () => {
    if (!user || !isContact || !proofFile) return;
    try {
      const document = await uploadDocument({
        file: proofFile,
        category: 'shipment',
        subCategory: `${kind.toLowerCase()}_payment_proof`,
        relatedFileId: file.id,
        description: `${title} payment proof for ${file.fileNumber}`,
        visibility: 'public',
      }, user.id);
      saveFlow({ ...flow, status: 'CLIENT_PROOF_SUBMITTED', clientPaymentProofUrl: document.fileUrl, clientPaidAt: new Date() });
      if (flow.requestedBy) addNotification({ userId: flow.requestedBy, title: `${title} proof received`, message: `The contact person uploaded payment proof for ${file.fileNumber}. Verify it and acknowledge ${title.toUpperCase()} PAID.`, type: 'warning', fileId: file.id, link: '/declaration' });
      notifyRole('declaration_manager', `Client payment proof for ${title.toLowerCase()} on ${file.fileNumber} is awaiting declaration clerk acknowledgement.`, 'info');
      setProofFile(null);
      toast.success('Payment proof shared with the declaration team');
    } catch {
      toast.error('Could not save the payment proof. Try a smaller file.');
    }
  };

  const decision = (approve: boolean, stage: 'coo' | 'finance') => {
    if (!user) return;
    const note = comment.trim();
    if (!note) return toast.error('Add a comment before deciding');
    const nextStatus = stage === 'coo' ? 'OFFICE_PENDING_FINANCE' : 'OFFICE_READY_FOR_CASHIER';
    const nextFlow: DeclarationPaymentFlow = stage === 'coo'
      ? { ...flow, status: approve ? nextStatus : 'REJECTED', cooComment: note, cooReviewedBy: user.id, cooReviewedAt: new Date(), rejectedByRole: approve ? undefined : user.role }
      : { ...flow, status: approve ? nextStatus : 'REJECTED', financeComment: note, financeReviewedBy: user.id, financeReviewedAt: new Date(), rejectedByRole: approve ? undefined : user.role };
    saveFlow(nextFlow);
    if (approve && stage === 'coo') notifyRole('finance_manager', `COO approved office payment for ${title.toLowerCase()} on file ${file.fileNumber}. Review and send it to Cashier.`, 'warning');
    else if (approve) notifyRole('cashier', `Finance Manager approved ${title.toLowerCase()} payment for file ${file.fileNumber}. Confirm payment.`, 'warning');
    else if (flow.requestedBy) addNotification({ userId: flow.requestedBy, title: `${title} payment request rejected`, message: `${stage === 'coo' ? 'COO' : 'Finance Manager'} rejected file ${file.fileNumber}: ${note}`, type: 'warning', fileId: file.id, link: `/files/${file.id}` });
    setComment('');
    toast.success(approve ? (stage === 'coo' ? 'Approved; sent to Finance Manager' : 'Approved; sent to Cashier') : 'Payment request rejected');
  };

  const markPaid = (method: 'client' | 'cashier') => {
    if (!user) return;
    const at = new Date();
    const nextFlow: DeclarationPaymentFlow = {
      ...flow,
      status: 'PAID',
      ...(method === 'client' ? {} : { cashierPaidBy: user.id, cashierPaidAt: at }),
    };
    const taxPaid = isTax || !!file.taxPaymentConfirmed;
    const wharfagePaid = file.transportMode !== 'SEA' || !isTax || !!file.wharfagePaymentConfirmed;
    const nextStatus = taxPaid && wharfagePaid
      ? 'TAXES_PAID'
      : isTax && file.transportMode === 'SEA' && !file.wharfageDocumentUrl
        ? 'WAITING_FOR_WHARFAGE_CHARGES'
        : isTax
          ? 'WAITING_FOR_WHARFAGE_PAYMENT'
          : 'WAITING_FOR_TAX_PAYMENT';
    saveFlow(nextFlow, nextStatus, {
      [paidKey]: true,
      [paidAtKey]: at,
      ...(isTax && taxPaid && wharfagePaid ? { taxesPaidAt: at } : {}),
    });
    notifyContact(`${title} payment for file ${file.fileNumber} has been acknowledged.`, 'info');
    toast.success(`${title} payment confirmed`);
  };

  if (!file.taxDocumentUrl && isTax) return null;
  if (!file.wharfageDocumentUrl && !isTax) return null;

  const statusLabel: Record<string, string> = {
    PENDING_DECLARATION_MANAGER: 'Waiting for Declaration Manager',
    PENDING_CONTACT_PERSON: 'Waiting for Contact Person',
    CLIENT_PAYMENT_PENDING: 'Waiting for Client Payment',
    CLIENT_PROOF_SUBMITTED: 'Proof Submitted · Awaiting Clerk Acknowledgement',
    OFFICE_PENDING_COO: 'Waiting for COO',
    OFFICE_PENDING_FINANCE: 'Waiting for Finance Manager',
    OFFICE_READY_FOR_CASHIER: 'Ready for Cashier',
    PAID: 'Paid',
    REJECTED: 'Rejected · Clerk May Resubmit',
  };

  return (
    <section className="w-full rounded-md border bg-white p-3 space-y-3 text-sm" aria-label={`${title} payment approval`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-medium">{title} payment approval · {file.fileNumber}</div>
        {status && <Badge variant="secondary">{statusLabel[status] || status}</Badge>}
      </div>
      <a href={isTax ? file.taxDocumentUrl : file.wharfageDocumentUrl} download className="text-blue-700 underline">View {title.toLowerCase()} assessment</a>

      {(!status || status === 'REJECTED') && isRequester && (
        <Button size="sm" onClick={submitRequest}><Send className="mr-2 h-4 w-4" />Submit for approval</Button>
      )}
      {status === 'PENDING_DECLARATION_MANAGER' && user?.role === 'declaration_manager' && (
        <div className="space-y-2"><Label>Declaration Manager review</Label><Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a review comment" /><div className="flex gap-2"><Button size="sm" onClick={() => managerDecision(true)}>Proceed</Button><Button size="sm" variant="destructive" onClick={() => managerDecision(false)}>Reject</Button></div></div>
      )}
      {status === 'PENDING_CONTACT_PERSON' && isContact && (
        <div className="space-y-2"><p className="font-medium">Who will pay this charge?</p><label className="flex items-center gap-2"><input type="radio" name={`${file.id}-${kind}-payer`} checked={payerChoice === 'CLIENT'} onChange={() => setPayerChoice('CLIENT')} />Client pays</label><label className="flex items-center gap-2"><input type="radio" name={`${file.id}-${kind}-payer`} checked={payerChoice === 'OFFICE'} onChange={() => setPayerChoice('OFFICE')} />Office pays</label><Button size="sm" disabled={!payerChoice} onClick={selectPayer}>Continue</Button></div>
      )}
      {status === 'CLIENT_PAYMENT_PENDING' && isContact && (
        <div className="space-y-2"><Label>Upload client payment proof</Label><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setProofFile(event.target.files?.[0] || null)} /><Button size="sm" disabled={!proofFile} onClick={submitClientProof}><Send className="mr-2 h-4 w-4" />Share proof</Button></div>
      )}
      {flow.clientPaymentProofUrl && <a href={flow.clientPaymentProofUrl} download className="text-blue-700 underline">View client payment proof</a>}
      {status === 'CLIENT_PROOF_SUBMITTED' && isRequester && <Button size="sm" onClick={() => markPaid('client')}><CheckCircle className="mr-2 h-4 w-4" />{kind === 'TAX' ? 'TAX PAID' : 'WHARFAGE PAID'}</Button>}
      {status === 'OFFICE_PENDING_COO' && user?.role === 'coo' && (
        <div className="space-y-2"><Label>COO review</Label><Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a review comment" /><div className="flex gap-2"><Button size="sm" onClick={() => decision(true, 'coo')}>Proceed</Button><Button size="sm" variant="destructive" onClick={() => decision(false, 'coo')}>Reject</Button></div></div>
      )}
      {status === 'OFFICE_PENDING_FINANCE' && user?.role === 'finance_manager' && (
        <div className="space-y-2"><Label>Finance Manager review</Label><Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a review comment" /><div className="flex gap-2"><Button size="sm" onClick={() => decision(true, 'finance')}>Proceed</Button><Button size="sm" variant="destructive" onClick={() => decision(false, 'finance')}>Reject</Button></div></div>
      )}
      {status === 'OFFICE_READY_FOR_CASHIER' && user?.role === 'cashier' && <Button size="sm" onClick={() => markPaid('cashier')}><CheckCircle className="mr-2 h-4 w-4" />Confirm payment</Button>}
      {status === 'PAID' && <p className="text-green-700">{kind === 'TAX' ? 'TAX PAID' : 'WHARFAGE PAID'} confirmed.</p>}
      {status && status !== 'PAID' && status !== 'REJECTED' && !(
        status === 'PENDING_DECLARATION_MANAGER' && user?.role === 'declaration_manager' ||
        status === 'PENDING_CONTACT_PERSON' && isContact ||
        status === 'CLIENT_PAYMENT_PENDING' && isContact ||
        status === 'CLIENT_PROOF_SUBMITTED' && isRequester ||
        status === 'OFFICE_PENDING_COO' && user?.role === 'coo' ||
        status === 'OFFICE_PENDING_FINANCE' && user?.role === 'finance_manager' ||
        status === 'OFFICE_READY_FOR_CASHIER' && user?.role === 'cashier'
      ) && <p className="text-slate-600">Action is pending with the next approver.</p>}
    </section>
  );
}
