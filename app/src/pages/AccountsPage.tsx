import { useEffect, useMemo, useState } from 'react';
import { FileText, Plus, Save, Wallet, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { useCashbookStore } from '@/store/cashbookStore';
import { useDocumentStore } from '@/store/documentStore';
import { useFileStore } from '@/store/fileStore';
import { usePettyCashStore } from '@/store/pettyCashStore';
import { getUserById } from '@/data/mockData';
import type { DailyCashBalance, FileCostEntry, ShipmentChargePaymentFlow, ShipmentFile } from '@/types';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';

interface Props { navigate: (route: AppRoute, params?: Record<string, string>) => void }
type ChargeRow = { title: string; amount: number; currency: string; status: string; paidAt?: Date; paidBy?: string; isOfficeCost: boolean };

const todayLocal = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const sameDay = (value: Date | string | undefined, date: string) => value ? new Date(value).toLocaleDateString('en-CA') === date : false;
const chargeStatus = (flow?: ShipmentChargePaymentFlow) => flow?.status ? flow.status.replaceAll('_', ' ') : 'PAYER NOT SELECTED';

export function AccountsPage({ navigate }: Props) {
  const { user } = useAuthStore();
  const { files, updateFileStatus } = useFileStore();
  const { requests } = usePettyCashStore();
  const { uploadDocument } = useDocumentStore();
  const cashbook = useCashbookStore();
  const [selectedFileId, setSelectedFileId] = useState('');
  const [pfiValue, setPfiValue] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [pfiFile, setPfiFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [costDescription, setCostDescription] = useState('');
  const [costAmount, setCostAmount] = useState('');
  const [cashDate, setCashDate] = useState(todayLocal());
  const [openingBalance, setOpeningBalance] = useState('');
  const [activeTab, setActiveTab] = useState(user?.role === 'cashier' ? 'cashbook' : 'accounts');

  const isAccountsClerk = user?.role === 'accounts_clerk';
  const isCashier = user?.role === 'cashier';
  const canEditAccounts = isAccountsClerk || user?.role === 'administrator';
  const canManageCash = isCashier;
  const canViewCash = !!user && ['cashier', 'finance_manager', 'commercial_manager', 'coo', 'managing_director'].includes(user.role);
  const canViewProfit = !!user && ['commercial_manager', 'coo', 'managing_director'].includes(user.role);
  const canViewAccountsTab = user?.role !== 'cashier';
  const visibleFiles = files;
  const queuedChargeRequests = files.flatMap((shipment) => ([
    ['Port Charges', shipment.portChargesPayment],
    ['Swissport Charges', shipment.swissportChargesPayment],
    ['Delivery Order Charges', shipment.deliveryOrderChargesPayment],
    ['Delivery Order Payment', shipment.deliveryOrderApplicationPayment],
  ] as const).filter(([, flow]) => flow?.status === 'OFFICE_ON_QUEUE').map(([title, flow]) => ({ shipment, title, flow })));
  const cashierChargeRequests = files.flatMap((shipment) => ([
    ['Port Charges', 'portChargesPayment', shipment.portChargesPayment],
    ['Swissport Charges', 'swissportChargesPayment', shipment.swissportChargesPayment],
    ['Delivery Order Charges', 'deliveryOrderChargesPayment', shipment.deliveryOrderChargesPayment],
    ['Delivery Order Payment', 'deliveryOrderApplicationPayment', shipment.deliveryOrderApplicationPayment],
  ] as const).filter(([, , flow]) => flow?.payer === 'OFFICE' && flow.status === 'OFFICE_READY_FOR_CASHIER').map(([title, flowKey, flow]) => ({ shipment, title, flowKey, flow })));

  const confirmChargePayment = (shipment: ShipmentFile, title: string, flowKey: string, flow: ShipmentChargePaymentFlow) => {
    if (!user || user.role !== 'cashier' || flow.status !== 'OFFICE_READY_FOR_CASHIER') return;
    const now = new Date();
    const paidFlow = { ...flow, status: 'PAID' as const, cashierPaidBy: user.id, cashierPaidAt: now };
    const status = flowKey === 'portChargesPayment' ? 'PORT_CHARGES_PAID'
      : flowKey === 'swissportChargesPayment' ? 'SWISSPORT_CHARGES_PAID'
        : flowKey === 'deliveryOrderApplicationPayment' ? 'DELIVERY_ORDER_PAYMENTS_DONE' : shipment.status;
    const paymentFields: Partial<ShipmentFile> = {
      [flowKey]: paidFlow,
      ...(flowKey === 'portChargesPayment' ? { portChargesPaidAt: now } : {}),
      ...(flowKey === 'swissportChargesPayment' ? { swissportChargesPaidAt: now } : {}),
      ...(flowKey === 'deliveryOrderChargesPayment' ? { doChargesPaid: true, doChargesPaidAt: now, doChargesPaidBy: user.id } : {}),
      ...(flowKey === 'deliveryOrderApplicationPayment' ? { doPaymentRequestStatus: 'PAID', doPaymentRequestPaidAt: now, deliveryOrderPaymentsDoneAt: now } : {}),
    };
    updateFileStatus(shipment.id, status as ShipmentFile['status'], user.id, paymentFields);
    toast.success(`${title} payment confirmed`);
  };

  useEffect(() => {
    if (!selectedFileId && visibleFiles.length) setSelectedFileId(visibleFiles[0].id);
  }, [selectedFileId, visibleFiles]);

  const file = visibleFiles.find((item) => item.id === selectedFileId);
  const fileRequests = requests.filter((request) => request.fileId === file?.id);
  const filePettyCashPaid = fileRequests.filter((request) => request.status === 'PAID');
  void navigate;
  const chargeRows = useMemo(() => {
    if (!file) return [] as ChargeRow[];
    const rows: ChargeRow[] = [];
    const add = (title: string, amount: number | undefined, currency: string | undefined, flow: ShipmentChargePaymentFlow | undefined, paidAt?: Date, paidBy?: string) => {
      if (amount == null && !flow?.status) return;
      const paid = flow?.status === 'PAID' || !!paidAt;
      rows.push({ title, amount: amount || 0, currency: currency || 'TZS', status: chargeStatus(flow), paidAt: paidAt || flow?.cashierPaidAt || flow?.financePaidAt || flow?.clientPaidAt, paidBy: paidBy || flow?.cashierPaidBy || flow?.financePaidBy, isOfficeCost: paid && flow?.payer === 'OFFICE' });
    };
    add('Port Charges', file.portChargesAmount, file.portChargesCurrency, file.portChargesPayment, file.portChargesPayment?.financePaidAt || file.portChargesPayment?.clientPaidAt);
    add('Swissport Charges', file.swissportChargesAmount, file.swissportChargesCurrency, file.swissportChargesPayment, file.swissportChargesPayment?.financePaidAt || file.swissportChargesPayment?.clientPaidAt);
    add('Delivery Order Charges', file.doChargesAmount, file.doChargesCurrency, file.deliveryOrderChargesPayment, file.doChargesPaidAt, file.doChargesPaidBy);
    add('Delivery Order Payment', file.doPaymentRequestAmount, file.doPaymentRequestCurrency, file.deliveryOrderApplicationPayment, file.doPaymentRequestPaidAt);
    return rows;
  }, [file]);

  const paidPermits = (file?.requiredPermits || []).filter((permit) => permit.paidAt && permit.permitApprovedAt);
  const paidChargeCosts = chargeRows.filter((charge) => charge.isOfficeCost && charge.currency === 'TZS').reduce((sum, charge) => sum + charge.amount, 0);
  const paidPettyCashCosts = filePettyCashPaid.filter((request) => request.currency === 'TZS').reduce((sum, request) => sum + request.amount, 0);
  const manualCosts = file?.fileCostEntries?.filter((entry) => entry.currency === 'TZS').reduce((sum, entry) => sum + entry.amount, 0) || 0;
  const totalCosts = paidChargeCosts + paidPettyCashCosts + manualCosts;

  useEffect(() => {
    setPfiValue(file?.proformaInvoiceValue != null ? String(file.proformaInvoiceValue) : '');
    setInvoiceAmount(file?.clientInvoiceAmount != null ? String(file.clientInvoiceAmount) : '');
  }, [file?.id, file?.proformaInvoiceValue, file?.clientInvoiceAmount]);

  const saveFile = (updates: Partial<ShipmentFile>) => {
    if (!file || !user) return;
    updateFileStatus(file.id, file.status, user.id, updates);
  };

  const uploadPfi = async () => {
    if (!file || !user || !pfiFile) return;
    const value = Number(pfiValue);
    if (!Number.isFinite(value) || value < 0) { toast.error('Enter the PFI value'); return; }
    try {
      const doc = await uploadDocument({ file: pfiFile, category: 'shipment', subCategory: 'proforma_invoice', relatedFileId: file.id, description: `PFI for ${file.fileNumber}`, visibility: 'public' }, user.id);
      saveFile({ proformaInvoiceUrl: doc.fileUrl, proformaInvoiceName: pfiFile.name, proformaInvoiceValue: value, proformaInvoiceUploadedAt: new Date(), proformaInvoiceUploadedBy: user.id });
      setPfiFile(null);
      toast.success('PFI saved to the shipment');
    } catch { toast.error('Could not save the PFI. Try a smaller file.'); }
  };

  const addCost = () => {
    if (!file || !user || !costDescription.trim()) { toast.error('Enter a cost description'); return; }
    const amount = Number(costAmount);
    if (!Number.isFinite(amount) || amount <= 0) { toast.error('Enter a valid cost amount'); return; }
    const entry: FileCostEntry = { id: crypto.randomUUID(), description: costDescription.trim(), amount, currency: 'TZS', enteredBy: user.id, enteredAt: new Date() };
    saveFile({ fileCostEntries: [...(file.fileCostEntries || []), entry] });
    setCostDescription(''); setCostAmount('');
  };

  const removeCost = (entryId: string) => {
    if (!file) return;
    saveFile({ fileCostEntries: (file.fileCostEntries || []).filter((entry) => entry.id !== entryId) });
  };

  const uploadInvoice = async () => {
    if (!file || !user || !invoiceFile) return;
    const amount = Number(invoiceAmount);
    if (!Number.isFinite(amount) || amount <= 0) { toast.error('Enter the client invoice value'); return; }
    try {
      const doc = await uploadDocument({ file: invoiceFile, category: 'shipment', subCategory: 'client_invoice', relatedFileId: file.id, description: `Client invoice for ${file.fileNumber}`, visibility: 'public' }, user.id);
      saveFile({ clientInvoiceUrl: doc.fileUrl, clientInvoiceName: invoiceFile.name, clientInvoiceAmount: amount, clientInvoiceUploadedAt: new Date(), clientInvoiceUploadedBy: user.id });
      setInvoiceFile(null);
      toast.success('Client invoice uploaded');
    } catch { toast.error('Could not save the invoice. Try a smaller file.'); }
  };

  const dayRecord = cashbook.getByDate(cashDate);
  useEffect(() => { setOpeningBalance(dayRecord ? String(dayRecord.openingBalance) : ''); }, [cashDate, dayRecord?.openingBalance]);

  const dailyExpenseItems = useMemo((): DailyCashBalance['expenseItems'] => {
    const items: DailyCashBalance['expenseItems'] = [];
    requests.filter((request) => request.status === 'PAID' && sameDay(request.paidAt, cashDate)).forEach((request) => {
      items.push({ description: `Petty Cash ${request.requestNumber}: ${request.description}`, amount: request.amount, currency: request.currency, fileId: request.fileId });
    });
    files.forEach((shipment) => {
      const addChargeExpense = (label: string, amount: number | undefined, currency: string | undefined, flow?: ShipmentChargePaymentFlow) => {
        if (flow?.payer === 'OFFICE' && flow.status === 'PAID' && sameDay(flow.cashierPaidAt || flow.financePaidAt, cashDate) && amount) {
          items.push({ description: `${label} · ${shipment.fileNumber}`, amount, currency: currency || 'TZS', fileId: shipment.id });
        }
      };
      addChargeExpense('Port Charges', shipment.portChargesAmount, shipment.portChargesCurrency, shipment.portChargesPayment);
      addChargeExpense('Swissport Charges', shipment.swissportChargesAmount, shipment.swissportChargesCurrency, shipment.swissportChargesPayment);
      addChargeExpense('Delivery Order Charges', shipment.doChargesAmount, shipment.doChargesCurrency, shipment.deliveryOrderChargesPayment);
      addChargeExpense('Delivery Order Payment', shipment.doPaymentRequestAmount, shipment.doPaymentRequestCurrency, shipment.deliveryOrderApplicationPayment);
      shipment.requiredPermits?.forEach((permit) => {
        const payer = permit.paidBy ? getUserById(permit.paidBy) : undefined;
        if (permit.paidAt && sameDay(permit.paidAt, cashDate) && ['cashier', 'finance_manager'].includes(payer?.role || '')) {
          items.push({ description: `${permit.name} Permit · ${shipment.fileNumber}`, amount: 0, currency: 'TZS', fileId: shipment.id });
        }
      });
    });
    return items;
  }, [requests, files, cashDate]);

  const saveCashOpening = () => {
    if (!user || !canManageCash) return;
    const amount = Number(openingBalance);
    if (!Number.isFinite(amount) || amount < 0) { toast.error('Enter a valid opening balance'); return; }
    cashbook.saveOpening(cashDate, amount, user.id);
    toast.success('Opening balance saved');
  };
  const closeCashDay = () => {
    if (!user || !canManageCash) return;
    const closed = cashbook.closeDay(cashDate, dailyExpenseItems, user.id);
    if (!closed) { toast.error('Save the opening balance before closing the day'); return; }
    toast.success(`Balance closed. Closing balance: TZS ${closed.closingBalance.toLocaleString()}`);
  };

  if (!user) return null;
  if (!['accounts_clerk', 'cashier', 'finance_manager', 'commercial_manager', 'coo', 'managing_director', 'administrator'].includes(user.role)) {
    return <Card><CardContent className="p-8 text-center">You do not have access to Accounts &amp; Invoicing.</CardContent></Card>;
  }
  const availableTabs = [
    { value: 'accounts', label: 'File Accounts', show: canViewAccountsTab },
    { value: 'cashbook', label: 'Daily Cash Balance', show: canViewCash },
    { value: 'profit', label: 'Profit & Loss', show: canViewProfit },
  ].filter((tab) => tab.show);

  const paidForSelectedFile = [
    ...filePettyCashPaid.map((request) => ({ label: `Petty Cash: ${request.description}`, amount: request.amount, currency: request.currency, date: request.paidAt, by: request.cashier?.name || request.financeManager?.name || getUserById(request.cashierId || request.financeManagerId || '')?.name || 'Finance' })),
    ...chargeRows.filter((charge) => charge.status === 'PAID' && charge.isOfficeCost).map((charge) => ({ label: charge.title, amount: charge.amount, currency: charge.currency, date: charge.paidAt, by: charge.paidBy ? getUserById(charge.paidBy)?.name : 'Finance' })),
    ...paidPermits.filter((permit) => ['cashier', 'finance_manager'].includes(getUserById(permit.paidBy || '')?.role || '')).map((permit) => ({ label: `${permit.name} Permit`, amount: 0, currency: 'TZS', date: permit.paidAt, by: permit.paidBy ? getUserById(permit.paidBy)?.name : 'Finance' })),
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-gray-900">Accounts &amp; Invoicing</h1><p className="mt-1 text-gray-500">Review file approvals and payments, manage PFIs and client invoices, and close the daily cash balance.</p></div>
      {isCashier && <Card><CardHeader><CardTitle>File Payments Ready</CardTitle><CardDescription>Finance Manager prioritized these office payments. Confirm each only after payment is made.</CardDescription></CardHeader><CardContent className="space-y-2">{cashierChargeRequests.length ? cashierChargeRequests.map(({ shipment, title, flowKey, flow }) => <div key={`${shipment.id}-${title}`} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"><div><p className="font-medium">{title} · {shipment.fileNumber}</p><p className="text-sm text-slate-500">{flow?.payer} payment · {flow?.financePriorityAt ? new Date(flow.financePriorityAt).toLocaleString() : 'Prioritized'}</p></div><Button onClick={() => confirmChargePayment(shipment, title, flowKey, flow!)}>Mark Paid</Button></div>) : <p className="text-sm text-slate-500">No file payments are prioritized for the Cashier.</p>}</CardContent></Card>}
      {user && ['coo', 'managing_director', 'commercial_manager'].includes(user.role) && <Card><CardHeader><CardTitle>Office Payment Queue</CardTitle><CardDescription>Requests held in queue by the Finance Manager.</CardDescription></CardHeader><CardContent className="space-y-2">{queuedChargeRequests.length ? queuedChargeRequests.map(({ shipment, title, flow }) => <div key={`${shipment.id}-${title}`} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"><div><p className="font-medium">{title} · {shipment.fileNumber}</p><p className="text-sm text-slate-500">{flow?.status?.replaceAll('_', ' ')} · {flow?.financePriorityAt ? new Date(flow.financePriorityAt).toLocaleString() : 'Queued'}</p></div><Button variant="outline" size="sm" onClick={() => navigate('files/:id', { id: shipment.id })}>View file</Button></div>) : <p className="text-sm text-slate-500">No office charge requests are on queue.</p>}</CardContent></Card>}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>{availableTabs.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}</TabsList>
        {canViewAccountsTab && <TabsContent value="accounts" className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="xl:col-span-1"><CardHeader><CardTitle>Shipment files</CardTitle><CardDescription>{visibleFiles.length} clearance files</CardDescription></CardHeader><CardContent className="max-h-[70vh] overflow-y-auto space-y-2">
              {visibleFiles.map((shipment) => <button key={shipment.id} onClick={() => setSelectedFileId(shipment.id)} className={`w-full rounded-md border p-3 text-left ${shipment.id === selectedFileId ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}><span className="font-mono font-semibold">{shipment.fileNumber}</span><span className="mt-1 block text-xs text-slate-500">{shipment.client?.name || shipment.clientId} · {shipment.transportMode}</span><span className="mt-2 flex gap-2 text-xs"><Badge variant="secondary">{shipment.status.replaceAll('_', ' ')}</Badge>{shipment.clientInvoiceAmount != null && <Badge variant="secondary">Invoiced</Badge>}</span></button>)}
            </CardContent></Card>

            <div className="xl:col-span-2 space-y-4">
              {file ? <>
                <Card><CardHeader><CardTitle>File {file.fileNumber}</CardTitle><CardDescription>Requests, approved charges, and payments recorded for this file.</CardDescription></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div><p className="text-slate-500">PFI value</p><p className="text-xl font-semibold">TZS {(file.proformaInvoiceValue || 0).toLocaleString()}</p></div>
                  <div><p className="text-slate-500">Costs recorded</p><p className="text-xl font-semibold">TZS {totalCosts.toLocaleString()}</p></div>
                  <div><p className="text-slate-500">Client invoice value</p><p className="text-xl font-semibold">{file.clientInvoiceAmount != null ? `TZS ${file.clientInvoiceAmount.toLocaleString()}` : 'Not invoiced'}</p></div>
                </CardContent></Card>

                {canEditAccounts && <Card><CardHeader><CardTitle>PFI and costs</CardTitle><CardDescription>Upload the Proforma Invoice, enter its value, and record file costs in TZS.</CardDescription></CardHeader><CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>PFI value (TZS)</Label><Input type="number" min="0" value={pfiValue} onChange={(event) => setPfiValue(event.target.value)} /></div><div className="space-y-2"><Label>PFI attachment (Word, Excel, photo, or PDF)</Label><Input type="file" accept=".doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => setPfiFile(event.target.files?.[0] || null)} /></div></div>
                  <Button onClick={uploadPfi} disabled={!pfiFile || !pfiValue}><Save className="mr-2 h-4 w-4" />Save PFI</Button>{file.proformaInvoiceUrl && <a className="ml-3 text-blue-700 underline" href={file.proformaInvoiceUrl} download={file.proformaInvoiceName || 'PFI'}>Download {file.proformaInvoiceName || 'PFI'}</a>}
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2 items-end"><div className="space-y-2"><Label>Cost description</Label><Input value={costDescription} onChange={(event) => setCostDescription(event.target.value)} placeholder="e.g. Clearance, transport, handling" /></div><div className="space-y-2"><Label>Amount (TZS)</Label><Input type="number" min="0" value={costAmount} onChange={(event) => setCostAmount(event.target.value)} /></div><Button onClick={addCost}><Plus className="mr-2 h-4 w-4" />Add cost</Button></div>
                  {(file.fileCostEntries || []).map((entry) => <div key={entry.id} className="flex items-center justify-between rounded border p-2 text-sm"><span>{entry.description}</span><span className="flex items-center gap-3"><b>TZS {entry.amount.toLocaleString()}</b><button aria-label="Remove cost" onClick={() => removeCost(entry.id)}><X className="h-4 w-4" /></button></span></div>)}
                </CardContent></Card>}

                <Card><CardHeader><CardTitle>File requests and charges</CardTitle><CardDescription>All requests, their approval status, and payment status linked to {file.fileNumber}.</CardDescription></CardHeader><CardContent className="space-y-3">
                  {fileRequests.map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm"><div><p className="font-medium">Petty Cash · {request.description}</p><p className="text-xs text-slate-500">{request.requestNumber}</p></div><div className="flex items-center gap-2"><Badge variant="secondary">{request.status.replaceAll('_', ' ')}</Badge><b>{request.currency} {request.amount.toLocaleString()}</b></div></div>)}
                  {chargeRows.map((charge, index) => <div key={`${charge.title}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm"><div><p className="font-medium">{charge.title}</p>{charge.paidAt && <p className="text-xs text-slate-500">Paid {new Date(charge.paidAt).toLocaleString()} · {charge.paidBy ? getUserById(charge.paidBy)?.name || charge.paidBy : charge.isOfficeCost ? 'Finance' : 'Client'}</p>}</div><div className="flex items-center gap-2"><Badge variant="secondary">{charge.status}</Badge><b>{charge.currency} {charge.amount.toLocaleString()}</b></div></div>)}
                  {(file.requiredPermits || []).map((permit) => <div key={permit.id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm"><span>{permit.name} Permit</span><Badge variant="secondary">{permit.permitApprovedAt ? 'APPROVED' : permit.paidAt ? 'PAID · AWAITING APPROVAL' : permit.invoiceUrl ? 'INVOICE UPLOADED' : 'REQUESTED'}</Badge></div>)}
                  {!fileRequests.length && !chargeRows.length && !file.requiredPermits?.length && <p className="py-5 text-center text-sm text-slate-500">No file requests or charges yet.</p>}
                </CardContent></Card>

                <Card><CardHeader><CardTitle>Payments completed</CardTitle><CardDescription>Cashier or Finance payments recorded against this file.</CardDescription></CardHeader><CardContent className="space-y-2">
                  {paidForSelectedFile.map((payment, index) => <div key={`${payment.label}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm"><span>{payment.label}<small className="ml-2 text-slate-500">{payment.date ? new Date(payment.date).toLocaleDateString() : ''} · {payment.by}</small></span><b>{payment.currency} {payment.amount.toLocaleString()}</b></div>)}
                  {!paidForSelectedFile.length && <p className="py-4 text-center text-sm text-slate-500">No payments recorded for this file.</p>}
                </CardContent></Card>

                {canEditAccounts && <Card><CardHeader><CardTitle>Client invoice</CardTitle><CardDescription>Enter the invoice amount and attach the client invoice file.</CardDescription></CardHeader><CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Invoice amount (TZS)</Label><Input type="number" min="0" value={invoiceAmount} onChange={(event) => setInvoiceAmount(event.target.value)} /></div><div className="space-y-2"><Label>Invoice attachment</Label><Input type="file" accept=".doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => setInvoiceFile(event.target.files?.[0] || null)} /></div></div>
                  <p className="text-sm text-slate-600">Invoice amount should cover recorded costs, approved file charges, and the company margin.</p><Button onClick={uploadInvoice} disabled={!invoiceFile || !invoiceAmount}><FileText className="mr-2 h-4 w-4" />Upload client invoice</Button>{file.clientInvoiceUrl && <a className="ml-3 text-blue-700 underline" href={file.clientInvoiceUrl} download={file.clientInvoiceName || 'Client Invoice'}>Download {file.clientInvoiceName || 'client invoice'}</a>}
                </CardContent></Card>}
              </> : <Card><CardContent className="p-10 text-center text-slate-500">Select a file to review its accounts.</CardContent></Card>}
            </div>
          </div>
        </TabsContent>}

        {canViewCash && <TabsContent value="cashbook" className="space-y-4">
          <Card><CardHeader><CardTitle>Daily Cash Balance</CardTitle><CardDescription>Closing balance is calculated from TZS payments made today and locked when acknowledged.</CardDescription></CardHeader><CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 items-end"><div className="space-y-2"><Label>Cash date</Label><Input type="date" value={cashDate} onChange={(event) => setCashDate(event.target.value)} /></div>{canManageCash && <div className="space-y-2"><Label>Opening balance (TZS)</Label><Input type="number" min="0" value={openingBalance} disabled={!!dayRecord?.closedAt} onChange={(event) => setOpeningBalance(event.target.value)} /></div>}{canManageCash && !dayRecord?.closedAt && <Button onClick={saveCashOpening}><Save className="mr-2 h-4 w-4" />Save opening balance</Button>}</div>
            {dayRecord && <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Card><CardContent className="p-4"><p className="text-sm text-slate-500">Opening balance</p><p className="text-2xl font-semibold">TZS {dayRecord.openingBalance.toLocaleString()}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-sm text-slate-500">Expenses {dayRecord.closedAt ? '(closed snapshot)' : '(live)'}</p><p className="text-2xl font-semibold text-red-700">TZS {(dayRecord.closedAt ? dayRecord.expenses : dailyExpenseItems.filter((item) => item.currency === 'TZS').reduce((sum, item) => sum + item.amount, 0)).toLocaleString()}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-sm text-slate-500">Closing balance</p><p className="text-2xl font-semibold">TZS {(dayRecord.closedAt ? dayRecord.closingBalance : dayRecord.openingBalance - dailyExpenseItems.filter((item) => item.currency === 'TZS').reduce((sum, item) => sum + item.amount, 0)).toLocaleString()}</p></CardContent></Card></div>}
            <div className="space-y-2"><h3 className="font-semibold">Payments included</h3>{(dayRecord?.closedAt ? dayRecord.expenseItems : dailyExpenseItems).map((item, index) => <div key={`${item.description}-${index}`} className="flex justify-between gap-3 rounded border p-3 text-sm"><span>{item.fileId ? `${files.find((entry) => entry.id === item.fileId)?.fileNumber || ''} · ` : ''}{item.description}</span><b>{item.currency} {item.amount.toLocaleString()}</b></div>)}{!(dayRecord?.closedAt ? dayRecord.expenseItems : dailyExpenseItems).length && <p className="text-sm text-slate-500">No payments found for this date.</p>}</div>
            {dayRecord?.closedAt ? <Badge>Balance closed {new Date(dayRecord.closedAt).toLocaleString()} by {getUserById(dayRecord.closedBy || '')?.name || dayRecord.closedBy}</Badge> : canManageCash && <Button onClick={closeCashDay} disabled={!dayRecord}><Wallet className="mr-2 h-4 w-4" />Close balance</Button>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Previous daily balances</CardTitle></CardHeader><CardContent className="space-y-2">{cashbook.records.map((record) => <button key={record.date} onClick={() => setCashDate(record.date)} className="flex w-full justify-between rounded border p-3 text-left text-sm hover:bg-slate-50"><span>{record.date} {record.closedAt ? '· Closed' : '· Open'}</span><span>Opening TZS {record.openingBalance.toLocaleString()} · Closing TZS {record.closingBalance.toLocaleString()}</span></button>)}{!cashbook.records.length && <p className="text-sm text-slate-500">No daily balances have been recorded.</p>}</CardContent></Card>
        </TabsContent>}

        {canViewProfit && <TabsContent value="profit"><Card><CardHeader><CardTitle>File Profit &amp; Loss</CardTitle><CardDescription>Visible only to Managing Director, COO, and Commercial Manager.</CardDescription></CardHeader><CardContent className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead><tr className="border-b text-left"><th className="p-2">File</th><th className="p-2">PFI value</th><th className="p-2">Costs</th><th className="p-2">Invoiced</th><th className="p-2">Profit / Loss</th><th className="p-2">PFI variance</th></tr></thead><tbody>{visibleFiles.map((shipment) => {
            const costs = (shipment.fileCostEntries || []).filter((entry) => entry.currency === 'TZS').reduce((sum, entry) => sum + entry.amount, 0)
              + requests.filter((request) => request.fileId === shipment.id && request.status === 'PAID' && request.currency === 'TZS').reduce((sum, request) => sum + request.amount, 0)
              + [shipment.portChargesPayment?.payer === 'OFFICE' && shipment.portChargesPayment.status === 'PAID' ? shipment.portChargesAmount || 0 : 0, shipment.swissportChargesPayment?.payer === 'OFFICE' && shipment.swissportChargesPayment.status === 'PAID' ? shipment.swissportChargesAmount || 0 : 0, shipment.deliveryOrderChargesPayment?.payer === 'OFFICE' && shipment.deliveryOrderChargesPayment.status === 'PAID' ? shipment.doChargesAmount || 0 : 0, shipment.deliveryOrderApplicationPayment?.payer === 'OFFICE' && shipment.deliveryOrderApplicationPayment.status === 'PAID' ? shipment.doPaymentRequestAmount || 0 : 0].reduce((sum, amount) => sum + amount, 0);
            const invoice = shipment.clientInvoiceAmount || 0;
            const profit = invoice - costs;
            return <tr key={shipment.id} className="border-b"><td className="p-2 font-mono">{shipment.fileNumber}</td><td className="p-2">TZS {(shipment.proformaInvoiceValue || 0).toLocaleString()}</td><td className="p-2">TZS {costs.toLocaleString()}</td><td className="p-2">TZS {invoice.toLocaleString()}</td><td className={`p-2 font-semibold ${profit < 0 ? 'text-red-700' : 'text-green-700'}`}>{profit < 0 ? 'Loss' : 'Profit'} TZS {Math.abs(profit).toLocaleString()}</td><td className="p-2">TZS {(invoice - (shipment.proformaInvoiceValue || 0)).toLocaleString()}</td></tr>;
          })}</tbody></table></CardContent></Card></TabsContent>}
      </Tabs>
    </div>
  );
}
