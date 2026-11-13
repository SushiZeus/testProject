import { useState } from 'react';
import { CheckCircle, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useDocumentStore } from '@/store/documentStore';
import { useFileStore } from '@/store/fileStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { ShipmentChargePaymentFlow, ShipmentChargeType, ShipmentFile } from '@/types';
import { toast } from 'sonner';

interface Props {
  file: ShipmentFile;
  chargeType: ShipmentChargeType;
  invoiceUrl: string;
  amount?: number;
  currency?: string;
}

const metadata: Record<ShipmentChargeType, { title: string; flowKey: 'portChargesPayment' | 'swissportChargesPayment' | 'deliveryOrderChargesPayment' | 'deliveryOrderApplicationPayment'; paidKey: 'portChargesPaidAt' | 'swissportChargesPaidAt' | 'doChargesPaidAt' | 'doPaymentRequestPaidAt' }> = {
  PORT: { title: 'Port Charges', flowKey: 'portChargesPayment', paidKey: 'portChargesPaidAt' },
  SWISSPORT: { title: 'Swissport Charges', flowKey: 'swissportChargesPayment', paidKey: 'swissportChargesPaidAt' },
  DELIVERY_ORDER: { title: 'Delivery Order Charges', flowKey: 'deliveryOrderChargesPayment', paidKey: 'doChargesPaidAt' },
  DELIVERY_ORDER_APPLICATION: { title: 'Delivery Order Payment', flowKey: 'deliveryOrderApplicationPayment', paidKey: 'doPaymentRequestPaidAt' },
};

export function ShipmentChargePaymentPanel({ file, chargeType, invoiceUrl, amount, currency = 'TZS' }: Props) {
  const { user } = useAuthStore();
  const { updateFileStatus } = useFileStore();
  const { uploadDocument } = useDocumentStore();
  const { addNotification } = useNotificationStore();
  const [operationsComment, setOperationsComment] = useState('');
  const [cooComment, setCooComment] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const config = metadata[chargeType];
  const flow = (file[config.flowKey] || {}) as ShipmentChargePaymentFlow;
  const isContactPerson = !!user && file.contactPersonId === user.id;
  const canOperations = user?.role === 'operations_manager';
  const canCoo = user?.role === 'coo';
  const canFinance = user?.role === 'finance_manager';
  const canCashier = user?.role === 'cashier';
  const label = flow.status === 'PAID' || file[config.paidKey]
    ? 'PAID'
    : flow.status === 'OFFICE_PENDING_COO'
      ? 'WAITING FOR COO APPROVAL'
      : flow.status === 'OFFICE_PENDING_FINANCE'
        ? 'WAITING FOR FINANCE PRIORITY'
        : flow.status === 'OFFICE_ON_QUEUE'
          ? 'ON FINANCE QUEUE'
          : flow.status === 'OFFICE_READY_FOR_CASHIER'
            ? 'READY FOR CASHIER PAYMENT'
        : flow.status === 'OFFICE_PENDING_OPERATIONS'
          ? 'WAITING FOR OPERATIONS MANAGER'
          : flow.status === 'CLIENT_PAYMENT_PENDING'
            ? 'WAITING FOR CLIENT PAYMENT'
            : flow.status === 'REJECTED'
              ? 'REQUEST REJECTED'
              : 'PAYER NOT SELECTED';

  const save = (nextFlow: ShipmentChargePaymentFlow, paid = false) => {
    if (!user) return;
    const paidStatus = chargeType === 'PORT' ? 'PORT_CHARGES_PAID'
      : chargeType === 'SWISSPORT' ? 'SWISSPORT_CHARGES_PAID'
        : chargeType === 'DELIVERY_ORDER_APPLICATION' ? 'DELIVERY_ORDER_PAYMENTS_DONE'
          : file.status;
    updateFileStatus(file.id, paid ? paidStatus as ShipmentFile['status'] : file.status, user.id, {
      [config.flowKey]: nextFlow,
      ...(paid ? { [config.paidKey]: new Date(), ...(chargeType === 'DELIVERY_ORDER' ? { doChargesPaid: true, doChargesPaidBy: user.id } : {}) } : {}),
      ...(paid && chargeType === 'DELIVERY_ORDER_APPLICATION' ? { doPaymentRequestStatus: 'PAID', doPaymentRequestPaidAt: new Date(), deliveryOrderPaymentsDoneAt: new Date() } : {}),
    });
  };

  const confirmClientPayment = async () => {
    if (!user || !isContactPerson) return;
    let proofUrl: string | undefined;
    try {
      if (proofFile) {
        const doc = await uploadDocument({
          file: proofFile,
          category: 'shipment',
          subCategory: `${chargeType.toLowerCase()}_payment_proof`,
          relatedFileId: file.id,
          description: `${config.title} payment proof for ${file.fileNumber}`,
          visibility: 'public',
        }, user.id);
        proofUrl = doc.fileUrl;
      }
      const nextFlow = { ...flow, payer: 'CLIENT' as const, status: 'PAID' as const, clientPaymentProofUrl: proofUrl, clientPaidAt: new Date() };
      save(nextFlow, true);
      setProofFile(null);
      toast.success(`${config.title} marked as paid by client`);
    } catch {
      toast.error('Could not save the payment attachment. Try a smaller file.');
    }
  };

  const managerDecision = (approve: boolean, stage: 'operations' | 'coo') => {
    if (!user) return;
    const comment = stage === 'operations' ? operationsComment.trim() : cooComment.trim();
    if (!comment) {
      toast.error('Add a description before approving or rejecting');
      return;
    }
    if (stage === 'operations') {
      save({ ...flow, operationsComment: comment, operationsReviewedBy: user.id, operationsReviewedAt: new Date(), status: approve ? 'OFFICE_PENDING_COO' : 'REJECTED' });
      if (approve) addNotification({ userId: '10', title: `${config.title} COO Review Required`, message: `Operations approved office payment for ${config.title} on file ${file.fileNumber}.`, type: 'info', fileId: file.id, link: `/files/${file.id}` });
      else if (file.contactPersonId) addNotification({ userId: file.contactPersonId, title: `${config.title} Request Rejected`, message: `Operations Manager rejected the office payment request for file ${file.fileNumber}: ${comment}`, type: 'warning', fileId: file.id, link: `/files/${file.id}` });
      setOperationsComment('');
    } else {
      save({ ...flow, cooComment: comment, cooReviewedBy: user.id, cooReviewedAt: new Date(), status: approve ? 'OFFICE_PENDING_FINANCE' : 'REJECTED' });
      if (approve) addNotification({ userId: '11', title: `${config.title} Payment Required`, message: `COO approved office payment for ${config.title} on file ${file.fileNumber}. Finance should process payment.`, type: 'info', fileId: file.id, link: `/files/${file.id}` });
      else if (file.contactPersonId) addNotification({ userId: file.contactPersonId, title: `${config.title} Request Rejected`, message: `COO rejected the office payment request for file ${file.fileNumber}: ${comment}`, type: 'warning', fileId: file.id, link: `/files/${file.id}` });
      setCooComment('');
    }
    toast.success(approve ? 'Charge request approved' : 'Charge request rejected');
  };

  const financeSetsPriority = (payNow: boolean) => {
    if (!user) return;
    const nextFlow = { ...flow, status: payNow ? 'OFFICE_READY_FOR_CASHIER' as const : 'OFFICE_ON_QUEUE' as const, financePriorityBy: user.id, financePriorityAt: new Date() };
    save(nextFlow);
    if (payNow) {
      addNotification({ userId: '12', title: 'Payment Ready for Cashier', message: `${config.title} for file ${file.fileNumber} is prioritized for payment.`, type: 'warning', fileId: file.id, link: `/files/${file.id}` });
      toast.success(`${config.title} sent to Cashier for payment`);
    } else {
      addNotification({ userId: '10', title: 'Payment Added to Queue', message: `${config.title} for file ${file.fileNumber} is on the Finance Manager payment queue.`, type: 'info', fileId: file.id, link: `/files/${file.id}` });
      addNotification({ userId: '1', title: 'Payment Added to Queue', message: `${config.title} for file ${file.fileNumber} is on the Finance Manager payment queue.`, type: 'info', fileId: file.id, link: `/files/${file.id}` });
      addNotification({ userId: '3', title: 'Payment Added to Queue', message: `${config.title} for file ${file.fileNumber} is on the Finance Manager payment queue.`, type: 'info', fileId: file.id, link: `/files/${file.id}` });
      toast.info(`${config.title} added to payment queue`);
    }
  };

  const cashierPays = () => {
    if (!user || !canCashier || flow.status !== 'OFFICE_READY_FOR_CASHIER') return;
    const now = new Date();
    save({ ...flow, status: 'PAID', cashierPaidBy: user.id, cashierPaidAt: now }, true);
    toast.success(`${config.title} payment confirmed by Cashier`);
  };

  return (
    <div className="mt-3 rounded-md border bg-slate-50 p-3 space-y-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-medium">{config.title}{amount != null ? ` · ${currency} ${amount.toLocaleString()}` : ''}</div>
        <Badge variant="secondary">{label}</Badge>
      </div>
      <a href={invoiceUrl} download className="text-blue-700 underline">Download charge invoice</a>

      {(!flow.payer || flow.status === 'REJECTED') && isContactPerson && (
        <fieldset className="space-y-2">
          <legend className="font-medium">Who will pay this charge?</legend>
          <label className="flex items-center gap-2"><input type="radio" name={`${file.id}-${chargeType}`} checked={flow.payer === 'CLIENT'} onChange={() => save({ ...flow, payer: 'CLIENT', status: 'CLIENT_PAYMENT_PENDING' })} /> Client pays</label>
          <label className="flex items-center gap-2"><input type="radio" name={`${file.id}-${chargeType}`} checked={flow.payer === 'OFFICE'} onChange={() => {
            save({ ...flow, payer: 'OFFICE', status: 'OFFICE_PENDING_OPERATIONS' });
            addNotification({ userId: '5', title: `${config.title} Approval Required`, message: `Office payment requested for ${config.title} on file ${file.fileNumber}. Review the file and record a decision.`, type: 'info', fileId: file.id, link: '/operations' });
          }} /> Office pays</label>
        </fieldset>
      )}
      {!flow.payer && !isContactPerson && <p className="text-slate-600">Waiting for the file contact person to select who pays.</p>}

      {flow.payer === 'CLIENT' && flow.status !== 'PAID' && isContactPerson && (
        <div className="space-y-2">
          <Label>Optional payment proof</Label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setProofFile(event.target.files?.[0] || null)} />
          <Button size="sm" onClick={confirmClientPayment}><CheckCircle className="mr-2 h-4 w-4" />{chargeType === 'PORT' ? 'PORT CHARGES PAID' : chargeType === 'SWISSPORT' ? 'SWISSPORT PAID' : 'DELIVERY ORDER PAID'}</Button>
        </div>
      )}
      {flow.clientPaymentProofUrl && <a href={flow.clientPaymentProofUrl} download className="text-blue-700 underline">Download client payment proof</a>}

      {flow.payer === 'OFFICE' && flow.status === 'OFFICE_PENDING_OPERATIONS' && canOperations && (
        <div className="space-y-2"><Label>Operations Manager description</Label><Textarea value={operationsComment} onChange={(event) => setOperationsComment(event.target.value)} placeholder="Describe the approval or rejection" /><div className="flex gap-2"><Button size="sm" onClick={() => managerDecision(true, 'operations')}>Approve</Button><Button size="sm" variant="destructive" onClick={() => managerDecision(false, 'operations')}>Reject</Button></div></div>
      )}
      {flow.operationsComment && <p className="text-slate-600">Operations Manager: {flow.operationsComment}</p>}
      {flow.payer === 'OFFICE' && flow.status === 'OFFICE_PENDING_COO' && canCoo && (
        <div className="space-y-2"><Label>COO description</Label><Textarea value={cooComment} onChange={(event) => setCooComment(event.target.value)} placeholder="Describe the approval or rejection" /><div className="flex gap-2"><Button size="sm" onClick={() => managerDecision(true, 'coo')}>Approve</Button><Button size="sm" variant="destructive" onClick={() => managerDecision(false, 'coo')}>Reject</Button></div></div>
      )}
      {flow.cooComment && <p className="text-slate-600">COO: {flow.cooComment}</p>}
      {flow.payer === 'OFFICE' && ['OFFICE_PENDING_FINANCE', 'OFFICE_ON_QUEUE'].includes(flow.status || '') && canFinance && <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => financeSetsPriority(true)}><Wallet className="mr-2 h-4 w-4" />Pay</Button><Button size="sm" variant="outline" onClick={() => financeSetsPriority(false)}>On queue</Button></div>}
      {flow.payer === 'OFFICE' && flow.status === 'OFFICE_READY_FOR_CASHIER' && canCashier && <Button size="sm" onClick={cashierPays}><CheckCircle className="mr-2 h-4 w-4" />Mark paid</Button>}
      {flow.status === 'REJECTED' && <p className="text-red-700">Rejected{flow.operationsComment ? ` by Operations Manager: ${flow.operationsComment}` : flow.cooComment ? ` by COO: ${flow.cooComment}` : ''}</p>}
      {flow.status === 'PAID' && <p className="text-green-700">Payment confirmed{flow.clientPaidAt ? ' by client contact' : flow.financePaidAt ? ' by Finance' : ''}.</p>}
      {flow.status === 'OFFICE_PENDING_OPERATIONS' && !canOperations && <p className="text-slate-600">Waiting for Operations Manager review.</p>}
      {flow.status === 'OFFICE_PENDING_COO' && !canCoo && <p className="text-slate-600">Waiting for COO review.</p>}
      {flow.status === 'OFFICE_PENDING_FINANCE' && !canFinance && <p className="text-slate-600">Waiting for Finance Manager to prioritize payment.</p>}
      {flow.status === 'OFFICE_ON_QUEUE' && <p className="text-slate-600">Queued by Finance Manager{flow.financePriorityAt ? ` on ${new Date(flow.financePriorityAt).toLocaleString()}` : ''}. Visible to executive management.</p>}
      {flow.status === 'OFFICE_READY_FOR_CASHIER' && !canCashier && <p className="text-slate-600">Finance Manager prioritized this request. Waiting for Cashier payment confirmation.</p>}
    </div>
  );
}
