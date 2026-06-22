import { useState } from 'react';
import {
  CheckCircle,
  DollarSign,
  Package,
  Ship,
  FileCheck,
  Upload,
  Calendar,
  FileText,
  Clock,
  TrendingUp,
  User as UserIcon,
  ClipboardList,
  Printer,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { useFileStore } from '@/store/fileStore';
import { usePettyCashStore } from '@/store/pettyCashStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { ShipmentFile, User, CargoVerificationForm, VerificationAnswer } from '@/types';
import type { AppRoute } from '@/App';
import { mockUsers, getOperationClerkWorkload } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { statusColors } from '@/utils/statusColors';

interface WorkloadCardProps {
  clerk: User;
  workload: {
    totalAssigned: number;
    inProgress: number;
    waitingPayments: number;
  };
  onAssign: () => void;
}

function WorkloadCard({ clerk, workload, onAssign }: WorkloadCardProps) {
  const { canManipulateOperationsModule } = useAuthStore();
  const capacity = 15; // Operation clerks can handle more files than declarants
  const utilization = (workload.totalAssigned / capacity) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">
                {clerk.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-semibold">{clerk.name}</p>
              <p className="text-sm text-gray-500">{clerk.email}</p>
            </div>
          </div>
          <Badge
            className={cn(
              utilization > 80 ? 'bg-red-100 text-red-700' :
              utilization > 50 ? 'bg-amber-100 text-amber-700' :
              'bg-green-100 text-green-700'
            )}
          >
            {utilization > 80 ? 'Busy' : utilization > 50 ? 'Moderate' : 'Available'}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Workload</span>
              <span className="font-medium">{workload.totalAssigned}/{capacity}</span>
            </div>
            <Progress value={utilization} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-lg font-bold">{workload.totalAssigned}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="text-lg font-bold text-blue-600">{workload.inProgress}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <p className="text-lg font-bold text-amber-600">{workload.waitingPayments}</p>
              <p className="text-xs text-gray-500">Payments</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={onAssign} 
          variant="outline" 
          className="w-full mt-4"
          disabled={!canManipulateOperationsModule()}
        >
          {canManipulateOperationsModule() ? 'Assign File' : 'View Only'}
        </Button>
      </CardContent>
    </Card>
  );
}

interface OperationsPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function OperationsPage({ navigate }: OperationsPageProps) {
  const { user, hasPermission, isExecutive, canManipulateOperationsModule } = useAuthStore();
  const { files, assignOperationClerk, updateFileStatus } = useFileStore();
  const { createRequest } = usePettyCashStore();
  const { addNotification } = useNotificationStore();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedFile, setSelectedFile] = useState<ShipmentFile | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [pettyCashDialogOpen, setPettyCashDialogOpen] = useState(false);
  const [permitsDoneDialogOpen, setPermitsDoneDialogOpen] = useState(false);
  const [etaEtbDialogOpen, setEtaEtbDialogOpen] = useState(false);
  const [deliveryOrderDialogOpen, setDeliveryOrderDialogOpen] = useState(false);
  const [selectedClerk, setSelectedClerk] = useState('');

  const [pettyCashForm, setPettyCashForm] = useState({
    amount: '',
    currency: 'TZS',
    description: '',
  });

  const [etaEtbForm, setEtaEtbForm] = useState({
    eta: '',
    etb: '',
  });

  const [deliveryOrderForm, setDeliveryOrderForm] = useState({
    invoiceFile: null as File | null,
    documentFile: null as File | null,
  });

  const [permitForm, setPermitForm] = useState({
    invoiceFile: null as File | null,
    documentFile: null as File | null,
  });

  const [permitInvoiceDialogOpen, setPermitInvoiceDialogOpen] = useState(false);
  const [permitDocumentDialogOpen, setPermitDocumentDialogOpen] = useState(false);

  // New state for operations uploads
  const [verificationPhotosDialogOpen, setVerificationPhotosDialogOpen] = useState(false);
  const [releaseOrderDialogOpen, setReleaseOrderDialogOpen] = useState(false);
  const [portChargesDialogOpen, setPortChargesDialogOpen] = useState(false);
  const [swissportChargesDialogOpen, setSwissportChargesDialogOpen] = useState(false);
  const [verificationPhotos, setVerificationPhotos] = useState<File[]>([]);
  const [releaseOrderFile, setReleaseOrderFile] = useState<File | null>(null);
  const [portChargesFile, setPortChargesFile] = useState<File | null>(null);
  const [swissportChargesFile, setSwissportChargesFile] = useState<File | null>(null);

  // Cargo Verification Form state
  const [verificationFormDialogOpen, setVerificationFormDialogOpen] = useState(false);
  const emptyVerificationForm = (): CargoVerificationForm => ({
    station: '', verificationDate: new Date().toISOString().split('T')[0],
    verificationOfficer: user?.name || '', tansadNo: '',
    q1_physicalDamage: '', q1_remarks: '',
    q2_sealsIntact: '', q2_remarks: '',
    q3_discrepancyQuantity: '', q3_remarks: '',
    q4_sameItemsDeclared: '', q4_remarks: '',
    q5_allPartsSeen: '', q5_remarks: '',
    q6_internalDamage: '', q6_remarks: '',
    q7_specialAttention: '', q7_remarks: '',
    q8_containerLocked: '', q8_remarks: '',
    q9_sealFixed: '', q9_sealNumber: '', q9_remarks: '',
    q10_samplesTaken: '', q10_quantity: '', q10_remarks: '',
    generalRemarks: '', officerName: user?.name || '',
  });
  const [verificationForm, setVerificationForm] = useState<CargoVerificationForm>(emptyVerificationForm());

  const operationClerks = mockUsers.filter((u: User) => u.role === 'operation_clerk');
  const isUserExecutive = isExecutive();
  const canManipulate = canManipulateOperationsModule();

  const operationFiles = files.filter((f: ShipmentFile) => 
    f.status === 'READY_FOR_OPERATIONS' ||
    f.status === 'WAITING_FOR_RELEASE_ORDER' ||
    f.status === 'RELEASE_ORDER_RECEIVED' ||
    f.status === 'RECEIVED_BY_CLERK' ||
    f.status === 'WAITING_FOR_WHARFAGE_PAYMENT' ||
    f.status === 'WAITING_FOR_PERMIT_PAYMENTS' ||
    f.status === 'PERMIT_PAYMENTS_DONE' ||
    f.status === 'PERMITS_DONE' ||
    f.status === 'WAITING_FOR_PORT_CHARGES_PAYMENT' ||
    f.status === 'PORT_CHARGES_PAID' ||
    f.status === 'WAITING_FOR_SWISSPORT_PAYMENTS' ||
    f.status === 'WAITING_FOR_SWISSPORT_CHARGES_PAYMENT' ||
    f.status === 'SWISSPORT_CHARGES_PAID' ||
    f.status === 'CARGO_CLEARED' ||
    f.status === 'OPERATIONS_DONE' ||
    f.status === 'VERIFICATION_FORM_PENDING' ||
    f.status === 'VERIFICATION_FORM_COMPLETED' ||
    f.status === 'DRIVER_REQUESTED' ||
    f.status === 'DRIVER_ASSIGNED' ||
    f.status === 'DRIVER_COLLECTING_CARGO' ||
    f.status === 'CARGO_COLLECTED_FROM_AIRPORT'
  );

  const filteredFiles = operationFiles.filter((file: ShipmentFile) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'ready') return file.status === 'READY_FOR_OPERATIONS';
    if (activeTab === 'permits') return file.status === 'WAITING_FOR_WHARFAGE_PAYMENT';
    if (activeTab === 'swissport') return file.status === 'WAITING_FOR_SWISSPORT_PAYMENTS';
    if (activeTab === 'delivery') return file.status === 'SWISSPORT_CHARGES_PAID' || file.status === 'CARGO_CLEARED' || file.status === 'OPERATIONS_DONE' || file.status === 'VERIFICATION_FORM_PENDING' || file.status === 'VERIFICATION_FORM_COMPLETED';
    if (activeTab === 'myfiles') return file.assignedOperationClerkId === user?.id;
    return true;
  });

  const handleAcceptFile = () => {
    if (!selectedFile || !user) return;

    assignOperationClerk(selectedFile.id, user.id, user.id);
    toast.success('File accepted successfully');
    setProcessDialogOpen(false);
    setSelectedFile(null);
  };

  const handleAssignClerk = () => {
    if (!selectedClerk || !user) return;

    // If no file is selected, show error
    if (!selectedFile) {
      toast.error('Please select a file to assign');
      return;
    }

    assignOperationClerk(selectedFile.id, selectedClerk, user.id);
    
    addNotification({
      userId: selectedClerk,
      title: 'File Assigned',
      message: `File ${selectedFile.fileNumber} has been assigned to you`,
      type: 'info',
      fileId: selectedFile.id,
      link: '/operations',
    });

    toast.success('Operation clerk assigned successfully');
    setAssignDialogOpen(false);
    setSelectedFile(null);
    setSelectedClerk('');
  };

  const handlePettyCashRequest = () => {
    if (!user) return;

    const amount = parseFloat(pettyCashForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!pettyCashForm.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    createRequest({
      fileId: selectedFile?.id || undefined,
      requestedBy: user.id,
      amount,
      currency: pettyCashForm.currency,
      description: pettyCashForm.description,
    });

    addNotification({
      userId: '5',
      title: 'New Petty Cash Request',
      message: `Request for ${pettyCashForm.currency} ${amount.toLocaleString()} ${selectedFile ? `on file ${selectedFile.fileNumber}` : '(General Request)'}`,
      type: 'info',
      link: '/petty-cash',
    });

    toast.success('Petty cash request submitted successfully');
    setPettyCashDialogOpen(false);
    setPettyCashForm({ amount: '', currency: 'TZS', description: '' });
    setSelectedFile(null);
  };

  const handlePermitsDone = () => {
    if (!selectedFile || !user) return;

    // Check if permit document is uploaded
    if (!selectedFile.permitDocumentUrl) {
      toast.error('Please upload permit document before marking as done');
      return;
    }

    // Update file status to PERMITS_DONE
    updateFileStatus(
      selectedFile.id,
      'PERMITS_DONE',
      user.id,
      { 
        permitsDoneAt: new Date(),
        assignedPermitsClerkId: user.id,
      }
    );

    // Notify operations manager
    addNotification({
      userId: '5', // Operations Manager
      title: 'Permits Completed',
      message: `Permits for file ${selectedFile.fileNumber} have been completed`,
      type: 'success',
      fileId: selectedFile.id,
      link: '/operations',
    });

    toast.success('Permits marked as done - File ready for next stage');
    setPermitsDoneDialogOpen(false);
    setSelectedFile(null);
  };

  const handlePermitInvoiceUpload = () => {
    if (!selectedFile || !user) return;

    if (!permitForm.invoiceFile) {
      toast.error('Please select a permit invoice file to upload');
      return;
    }

    // Update file status to WAITING_FOR_PERMIT_PAYMENTS
    updateFileStatus(
      selectedFile.id,
      'WAITING_FOR_PERMIT_PAYMENTS',
      user.id,
      {
        permitInvoiceUrl: URL.createObjectURL(permitForm.invoiceFile),
        assignedPermitsClerkId: user.id,
      }
    );

    // Notify finance
    addNotification({
      userId: '11', // Finance Manager
      title: 'Permit Payment Required',
      message: `Permit invoice uploaded for file ${selectedFile.fileNumber}`,
      type: 'info',
      fileId: selectedFile.id,
      link: '/operations',
    });

    toast.success('Permit invoice uploaded - Waiting for payment');
    setPermitInvoiceDialogOpen(false);
    setPermitForm({ invoiceFile: null, documentFile: null });
    setSelectedFile(null);
  };

  const handlePermitDocumentUpload = () => {
    if (!selectedFile || !user) return;

    if (!permitForm.documentFile) {
      toast.error('Please select the permit document to upload');
      return;
    }

    // Update file with permit document
    updateFileStatus(
      selectedFile.id,
      'PERMIT_PAYMENTS_DONE',
      user.id,
      {
        permitDocumentUrl: URL.createObjectURL(permitForm.documentFile),
      }
    );

    toast.success('Permit document uploaded - Ready to mark permits as done');
    setPermitDocumentDialogOpen(false);
    setPermitForm({ invoiceFile: null, documentFile: null });
    setSelectedFile(null);
  };

  const handleEtaEtbSubmit = () => {
    if (!selectedFile || !user) return;

    if (!etaEtbForm.eta) {
      toast.error('Please enter ETA (Estimated Time of Arrival)');
      return;
    }

    // For SEA shipments, ETB is required
    if (selectedFile.transportMode === 'SEA' && !etaEtbForm.etb) {
      toast.error('Please enter ETB (Estimated Time of Berthing) for SEA shipments');
      return;
    }

    // Update file with ETA/ETB
    updateFileStatus(
      selectedFile.id,
      selectedFile.status, // Keep current status
      user.id,
      {
        eta: new Date(etaEtbForm.eta),
        etb: etaEtbForm.etb ? new Date(etaEtbForm.etb) : undefined,
        assignedShippingLineClerkId: user.id,
      }
    );

    toast.success('ETA/ETB information saved successfully');
    setEtaEtbDialogOpen(false);
    setEtaEtbForm({ eta: '', etb: '' });
    setSelectedFile(null);
  };

  const handleDeliveryOrderInvoiceUpload = () => {
    if (!selectedFile || !user) return;

    if (!deliveryOrderForm.invoiceFile) {
      toast.error('Please select an invoice file to upload');
      return;
    }

    // Update file status to WAITING_FOR_DO_PAYMENT
    updateFileStatus(
      selectedFile.id,
      'WAITING_FOR_DO_PAYMENT',
      user.id,
      {
        deliveryOrderInvoiceUrl: URL.createObjectURL(deliveryOrderForm.invoiceFile),
        assignedShippingLineClerkId: user.id,
      }
    );

    // Notify finance
    addNotification({
      userId: '11', // Finance Manager
      title: 'Delivery Order Payment Required',
      message: `Delivery order invoice uploaded for file ${selectedFile.fileNumber}`,
      type: 'info',
      fileId: selectedFile.id,
      link: '/operations',
    });

    toast.success('Delivery order invoice uploaded - Waiting for payment');
    setDeliveryOrderDialogOpen(false);
    setDeliveryOrderForm({ invoiceFile: null, documentFile: null });
    setSelectedFile(null);
  };

  const handleDeliveryOrderSubmit = () => {
    if (!selectedFile || !user) return;

    if (!deliveryOrderForm.documentFile) {
      toast.error('Please select the delivery order document to upload');
      return;
    }

    // Update file status to DELIVERY_ORDER_SUBMITTED
    updateFileStatus(
      selectedFile.id,
      'DELIVERY_ORDER_SUBMITTED',
      user.id,
      {
        deliveryOrderDocumentUrl: URL.createObjectURL(deliveryOrderForm.documentFile),
        deliveryOrderSubmittedAt: new Date(),
      }
    );

    // Notify operations manager
    addNotification({
      userId: '5', // Operations Manager
      title: 'Delivery Order Submitted',
      message: `Delivery order for file ${selectedFile.fileNumber} has been submitted`,
      type: 'success',
      fileId: selectedFile.id,
      link: '/operations',
    });

    toast.success('Delivery order submitted successfully');
    setDeliveryOrderDialogOpen(false);
    setDeliveryOrderForm({ invoiceFile: null, documentFile: null });
    setSelectedFile(null);
  };

  const handleUploadVerificationPhotos = () => {
    if (!selectedFile || !user) return;

    if (verificationPhotos.length === 0 || verificationPhotos.length > 7) {
      toast.error('Please upload 1-7 verification photos');
      return;
    }

    const photoUrls = verificationPhotos.map(f => URL.createObjectURL(f));
    updateFileStatus(
      selectedFile.id,
      selectedFile.status,
      user.id,
      {
        verificationPhotos: photoUrls,
      }
    );

    toast.success(`${verificationPhotos.length} verification photo(s) uploaded successfully`);
    setVerificationPhotosDialogOpen(false);
    setVerificationPhotos([]);
    setSelectedFile(null);
  };

  const handleUploadReleaseOrder = () => {
    if (!selectedFile || !user) return;

    if (!releaseOrderFile) {
      toast.error('Please select a release order file to upload');
      return;
    }

    updateFileStatus(
      selectedFile.id,
      'RELEASE_ORDER_RECEIVED', // Change status to RELEASE_ORDER_RECEIVED
      user.id,
      {
        releaseOrderUrl: URL.createObjectURL(releaseOrderFile),
        releaseOrderUploadedAt: new Date(),
      }
    );

    toast.success('Release order uploaded - Status: RELEASE ORDER RECEIVED');
    setReleaseOrderDialogOpen(false);
    setReleaseOrderFile(null);
    setSelectedFile(null);
  };

  const handleUploadPortCharges = () => {
    if (!selectedFile || !user) return;

    if (!portChargesFile) {
      toast.error('Please select a port charges file to upload');
      return;
    }

    // Validate that release order is uploaded first
    if (!selectedFile.releaseOrderUrl) {
      toast.error('Please upload release order before uploading port charges');
      return;
    }

    updateFileStatus(
      selectedFile.id,
      'WAITING_FOR_PORT_CHARGES_PAYMENT',
      user.id,
      {
        portChargesUrl: URL.createObjectURL(portChargesFile),
      }
    );

    // Notify finance
    addNotification({
      userId: '11', // Finance Manager
      title: 'Port Charges Payment Required',
      message: `Port charges uploaded for file ${selectedFile.fileNumber}`,
      type: 'info',
      fileId: selectedFile.id,
      link: '/operations',
    });

    toast.success('Port charges uploaded - Waiting for payment');
    setPortChargesDialogOpen(false);
    setPortChargesFile(null);
    setSelectedFile(null);
  };

  const handleUploadSwissportCharges = () => {
    if (!selectedFile || !user) return;

    if (!swissportChargesFile) {
      toast.error('Please select a Swissport charges file to upload');
      return;
    }

    // Validate that release order is uploaded first
    if (!selectedFile.releaseOrderUrl) {
      toast.error('Please upload release order before uploading Swissport charges');
      return;
    }

    updateFileStatus(
      selectedFile.id,
      'WAITING_FOR_SWISSPORT_CHARGES_PAYMENT',
      user.id,
      {
        swissportChargesUrl: URL.createObjectURL(swissportChargesFile),
      }
    );

    // Notify finance
    addNotification({
      userId: '11', // Finance Manager
      title: 'Swissport Charges Payment Required',
      message: `Swissport charges uploaded for file ${selectedFile.fileNumber}`,
      type: 'info',
      fileId: selectedFile.id,
      link: '/operations',
    });

    toast.success('Swissport charges uploaded - Waiting for payment');
    setSwissportChargesDialogOpen(false);
    setSwissportChargesFile(null);
    setSelectedFile(null);
  };

  const handlePortChargesPaid = () => {
    if (!selectedFile || !user) return;

    // Mark port charges as paid - keep current status, set payment confirmation flag
    updateFileStatus(
      selectedFile.id,
      selectedFile.status, // Keep current status
      user.id,
      {
        portChargesPaidAt: new Date(),
      }
    );

    // Notify operations manager
    addNotification({
      userId: '5', // Operations Manager
      title: 'Port Charges Paid',
      message: `Port charges for file ${selectedFile.fileNumber} have been paid - Click OPERATIONS DONE to complete`,
      type: 'success',
      fileId: selectedFile.id,
      link: '/operations',
    });

    toast.success('Port charges payment confirmed ✓ - OPERATIONS DONE button is now available (GREEN)');
    setSelectedFile(null);
  };

  const handleSwissportChargesPaid = () => {
    if (!selectedFile || !user) return;

    // Mark swissport charges as paid - keep current status, set payment confirmation flag
    updateFileStatus(
      selectedFile.id,
      selectedFile.status, // Keep current status
      user.id,
      {
        swissportChargesPaidAt: new Date(),
      }
    );

    // Notify operations manager
    addNotification({
      userId: '5', // Operations Manager
      title: 'Swissport Charges Paid',
      message: `Swissport charges for file ${selectedFile.fileNumber} have been paid - Click OPERATIONS DONE to complete`,
      type: 'success',
      fileId: selectedFile.id,
      link: '/operations',
    });

    toast.success('Swissport charges payment confirmed ✓ - OPERATIONS DONE button is now available (GREEN)');
    setSelectedFile(null);
  };

  const handleCargoCleared = () => {
    if (!selectedFile || !user) return;

    // This function is no longer needed - we go straight to OPERATIONS_DONE after Swissport payment
    // Keeping for backwards compatibility but not used in new workflow
    updateFileStatus(
      selectedFile.id,
      'CARGO_CLEARED',
      user.id,
      {
        cargoClearedAt: new Date(),
      }
    );

    toast.success('Cargo cleared');
    setSelectedFile(null);
  };

  const handleOperationsDone = () => {
    if (!selectedFile || !user) return;

    // Validate that release order is uploaded
    if (!selectedFile.releaseOrderUrl) {
      toast.error('Release order must be uploaded before marking operations as done');
      return;
    }

    // Validate that appropriate charges are paid based on transport mode (check payment flags, not status)
    if (selectedFile.transportMode === 'SEA' && !selectedFile.portChargesPaidAt) {
      toast.error('Port charges must be paid before marking operations as done');
      return;
    }

    if (selectedFile.transportMode === 'AIR' && !selectedFile.swissportChargesPaidAt) {
      toast.error('Swissport charges must be paid before marking operations as done');
      return;
    }

    updateFileStatus(
      selectedFile.id,
      'VERIFICATION_FORM_PENDING',
      user.id,
      {
        operationsDoneAt: new Date(),
      } as Partial<ShipmentFile>
    );

    // Notify operations manager and delivery team
    addNotification({
      userId: '5', // Operations Manager
      title: 'Operations Complete - Verification Required',
      message: `Operations for file ${selectedFile.fileNumber} are complete. Cargo verification form must be filled before delivery`,
      type: 'success',
      fileId: selectedFile.id,
      link: '/operations',
    });

    toast.success('Operations complete - Please fill the Cargo Verification Form before delivery');
    setSelectedFile(null);
  };

  const handleMoveToDelivery = () => {
    if (!selectedFile || !user) return;

    // Validate that verification form is completed
    if (!selectedFile.cargoVerificationForm) {
      toast.error('Cargo verification form must be completed before moving to delivery');
      return;
    }

    // Move file to DRIVER_REQUESTED status for delivery clerk assignment
    updateFileStatus(
      selectedFile.id,
      'DRIVER_REQUESTED',
      user.id,
      {
        operationsFinalizedAt: new Date(),
      } as Partial<ShipmentFile>
    );

    // Notify delivery clerk
    addNotification({
      userId: '7', // Delivery Clerk (User ID based on credentials)
      title: 'File Ready for Driver Request',
      message: `File ${selectedFile.fileNumber} is ready for delivery. Please request an appropriate truck and driver.`,
      type: 'success',
      fileId: selectedFile.id,
      link: '/delivery',
    });

    // Also notify transport manager
    addNotification({
      userId: '8', // Transport Manager
      title: 'File Ready for Delivery',
      message: `File ${selectedFile.fileNumber} verification complete and ready for transport.`,
      type: 'info',
      fileId: selectedFile.id,
      link: '/drivers',
    });

    toast.success('File moved to delivery - Delivery Clerk can now request drivers');
    setSelectedFile(null);
  };

  // ── Cargo Verification Form ──────────────────────────────────────────────
  const handleOpenVerificationForm = (file: ShipmentFile) => {
    setSelectedFile(file);
    // Pre-fill from existing data if already partially filled
    if (file.cargoVerificationForm) {
      setVerificationForm(file.cargoVerificationForm);
    } else {
      setVerificationForm({
        station: '', verificationDate: new Date().toISOString().split('T')[0],
        verificationOfficer: user?.name || '', tansadNo: '',
        q1_physicalDamage: '', q1_remarks: '',
        q2_sealsIntact: '', q2_remarks: '',
        q3_discrepancyQuantity: '', q3_remarks: '',
        q4_sameItemsDeclared: '', q4_remarks: '',
        q5_allPartsSeen: '', q5_remarks: '',
        q6_internalDamage: '', q6_remarks: '',
        q7_specialAttention: '', q7_remarks: '',
        q8_containerLocked: '', q8_remarks: '',
        q9_sealFixed: '', q9_sealNumber: '', q9_remarks: '',
        q10_samplesTaken: '', q10_quantity: '', q10_remarks: '',
        generalRemarks: '', officerName: user?.name || '',
      });
    }
    setVerificationFormDialogOpen(true);
  };

  const handleSubmitVerificationForm = () => {
    if (!selectedFile || !user) return;

    // Validate all YES/NO questions are answered
    const questions: (keyof CargoVerificationForm)[] = [
      'q1_physicalDamage','q2_sealsIntact','q3_discrepancyQuantity',
      'q4_sameItemsDeclared','q5_allPartsSeen','q6_internalDamage',
      'q7_specialAttention','q8_containerLocked','q9_sealFixed','q10_samplesTaken',
    ];
    for (const q of questions) {
      if (!verificationForm[q]) {
        toast.error('Please answer all inspection questions (YES or NO)');
        return;
      }
    }
    if (!verificationForm.station.trim()) { toast.error('Please enter the station (ICD)'); return; }
    if (!verificationForm.verificationOfficer.trim()) { toast.error('Please enter the verification officer name'); return; }
    if (!verificationForm.officerName.trim()) { toast.error('Please enter your name in the signature section'); return; }

    const completedForm: CargoVerificationForm = {
      ...verificationForm,
      completedAt: new Date(),
      completedBy: user.id,
    };

    updateFileStatus(
      selectedFile.id,
      'VERIFICATION_FORM_COMPLETED',
      user.id,
      {
        cargoVerificationForm: completedForm,
        cargoVerificationCompletedAt: new Date(),
        cargoVerificationCompletedBy: user.id,
      } as Partial<ShipmentFile>
    );

    addNotification({
      userId: '5', // Operations Manager
      title: 'Cargo Verification Complete',
      message: `Cargo verification form completed for file ${selectedFile.fileNumber} - Ready for driver assignment`,
      type: 'success',
      fileId: selectedFile.id,
      link: '/operations',
    });

    toast.success('Cargo verification form submitted - File ready for driver assignment');
    setVerificationFormDialogOpen(false);
    setSelectedFile(null);
  };

  const handlePrintVerificationForm = (file: ShipmentFile) => {
    const form = file.cargoVerificationForm;
    const yn = (v: VerificationAnswer) => v === 'YES' ? '☑ YES  ☐ NO' : v === 'NO' ? '☐ YES  ☑ NO' : '☐ YES  ☐ NO';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Cargo Verification Form - ${file.fileNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #000; }
    .header { text-align: center; margin-bottom: 16px; }
    .header h2 { font-size: 14px; font-weight: bold; text-decoration: underline; margin: 4px 0; }
    .file-no { float: right; font-weight: bold; }
    .row { display: flex; gap: 20px; margin-bottom: 6px; }
    .field { flex: 1; border-bottom: 1px solid #000; padding-bottom: 2px; }
    .field label { font-weight: bold; font-size: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #000; padding: 5px 7px; vertical-align: top; }
    th { background: #f0f0f0; font-size: 10px; }
    td { font-size: 10px; }
    .sn { width: 30px; text-align: center; }
    .area { width: 35%; }
    .acceptable { width: 20%; }
    .remarks-col { width: 35%; }
    .footer { margin-top: 14px; }
    .footer .line { border-bottom: 1px solid #000; margin-bottom: 8px; min-height: 18px; padding: 2px 0; font-size: 10px; }
    .sig-row { display: flex; gap: 40px; margin-top: 10px; }
    .sig-box { flex: 1; border-bottom: 1px solid #000; padding-bottom: 2px; }
    .note { font-style: italic; font-size: 9px; margin-top: 8px; }
    .assigned { margin-top: 14px; display: flex; gap: 40px; }
    @media print { body { margin: 10px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="file-no">FILE NO: ${file.fileNumber}</div>
    <h2>CARGO VERIFICATION FORM</h2>
  </div>
  <div class="row">
    <div class="field"><label>STATION (ICD):</label> ${form?.station || ''}</div>
    <div class="field"><label>DATE:</label> ${form?.verificationDate || ''}</div>
  </div>
  <div class="row">
    <div class="field"><label>VERIFICATION OFFICER / TRA OFFICER:</label> ${form?.verificationOfficer || ''}</div>
  </div>
  <div class="row">
    <div class="field"><label>B/L, AWB NO:</label> ${file.blNumber || file.awbNumber || ''}</div>
    <div class="field"><label>CONTAINER/CHS NO:</label> ${file.containerNumbers || ''}</div>
  </div>
  <div class="row">
    <div class="field"><label>CARGO DESCRIPTION:</label> ${file.cargoDescription || ''}</div>
  </div>
  <div class="row">
    <div class="field"><label>CONSIGNEE:</label> ${file.client?.name || ''}</div>
    <div class="field"><label>TANSAD NO:</label> ${form?.tansadNo || ''}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="sn">S/N</th>
        <th class="area">AREAS OF INSPECTION</th>
        <th class="acceptable">ACCEPTABLE</th>
        <th class="remarks-col">REMARKS<br><small>If any unacceptable condition is found, notify the office with immediate effect for a quick action to be taken.</small></th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="sn">1</td><td>Physical damage to the external part</td><td>${yn(form?.q1_physicalDamage||'')}</td><td>${form?.q1_remarks||''}</td></tr>
      <tr><td class="sn">2</td><td>Are seals still intact</td><td>${yn(form?.q2_sealsIntact||'')}</td><td>${form?.q2_remarks||''}</td></tr>
      <tr><td class="sn">3</td><td>Discrepancy in cargo quantity / CHS no:</td><td>${yn(form?.q3_discrepancyQuantity||'')}</td><td>${form?.q3_remarks||''}</td></tr>
      <tr><td class="sn">4</td><td>Same items as declared in the customs entry</td><td>${yn(form?.q4_sameItemsDeclared||'')}</td><td>${form?.q4_remarks||''}</td></tr>
      <tr><td class="sn">5</td><td>All parts seen (spare parts, logo)</td><td>${yn(form?.q5_allPartsSeen||'')}</td><td>${form?.q5_remarks||''}</td></tr>
      <tr><td class="sn">6</td><td>Internal damage to the goods</td><td>${yn(form?.q6_internalDamage||'')}</td><td>${form?.q6_remarks||''}</td></tr>
      <tr><td class="sn">7</td><td>Do goods need any special attention e.g packaging?</td><td>${yn(form?.q7_specialAttention||'')}</td><td>${form?.q7_remarks||''}</td></tr>
      <tr><td class="sn">8</td><td>Was the container locked after verification</td><td>${yn(form?.q8_containerLocked||'')}</td><td>${form?.q8_remarks||''}</td></tr>
      <tr><td class="sn">9</td><td>Was seal fixed to the container?<br><small>(State the seal number)</small></td><td>${yn(form?.q9_sealFixed||'')}<br><small>Seal No: ${form?.q9_sealNumber||''}</small></td><td>${form?.q9_remarks||''}</td></tr>
      <tr><td class="sn">10</td><td>Samples taken by the officer?<br><small>(state the quantity)</small></td><td>${yn(form?.q10_samplesTaken||'')}<br><small>Qty: ${form?.q10_quantity||''}</small></td><td>${form?.q10_remarks||''}</td></tr>
    </tbody>
  </table>

  <div class="footer">
    <div class="line"><b>REMARKS:</b> ${form?.generalRemarks||''}</div>
    <div class="line">&nbsp;</div>
    <div class="line">&nbsp;</div>
    <div class="sig-row">
      <div class="sig-box"><b>NAME:</b> ${form?.officerName||''}</div>
      <div class="sig-box"><b>SIGN:</b> ___________________________</div>
    </div>
    <div class="note">
      N/B: A copy of Bill of lading/ AWB, packing list, Customs entry should accompany verification process.<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Photos should be taken before, during and after the verification process<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Cargo should be repacked and arranged properly after verification to avoid any damage.
    </div>
    <div class="assigned">
      <div class="sig-box"><b>ASSIGNED BY:</b> ___________________________&nbsp;&nbsp;&nbsp;<b>SIGN:</b> ___________________________</div>
    </div>
    <div style="margin-top:8px;"><b>DATE:</b> ${form?.verificationDate||''}</div>
  </div>
  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`);
    printWindow.document.close();
  };

  const stats = {
    waiting: files.filter((f: ShipmentFile) => f.status === 'READY_FOR_OPERATIONS').length,
    inProgress: files.filter((f: ShipmentFile) => 
      f.assignedOperationClerkId && 
      (f.status === 'WAITING_FOR_RELEASE_ORDER' ||
       f.status === 'RELEASE_ORDER_RECEIVED' ||
       f.status === 'RECEIVED_BY_CLERK' || 
       f.status === 'WAITING_FOR_WHARFAGE_PAYMENT' ||
       f.status === 'WAITING_FOR_PERMIT_PAYMENTS' ||
       f.status === 'PERMIT_PAYMENTS_DONE' ||
       f.status === 'PERMITS_DONE' ||
       f.status === 'WAITING_FOR_PORT_CHARGES_PAYMENT' ||
       f.status === 'PORT_CHARGES_PAID' ||
       f.status === 'WAITING_FOR_SWISSPORT_PAYMENTS' ||
       f.status === 'WAITING_FOR_SWISSPORT_CHARGES_PAYMENT' ||
       f.status === 'SWISSPORT_CHARGES_PAID' ||
       f.status === 'CARGO_CLEARED' ||
       f.status === 'OPERATIONS_DONE' ||
       f.status === 'VERIFICATION_FORM_PENDING')
    ).length,
    completed: files.filter((f: ShipmentFile) => 
      f.status === 'VERIFICATION_FORM_COMPLETED' ||
      f.status === 'DRIVER_REQUESTED' ||
      f.status === 'DRIVER_ASSIGNED' ||
      f.status === 'CARGO_COLLECTED_FROM_AIRPORT'
    ).length,
    myFiles: user?.role === 'operation_clerk'
      ? files.filter((f: ShipmentFile) => f.assignedOperationClerkId === user.id).length
      : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operations Department</h1>
          <p className="text-gray-500 mt-1">
            Manage permits, shipping, and delivery operations
          </p>
        </div>
        {(hasPermission('create_petty_cash_request') || user?.role === 'operations_manager') && (
          <div className="flex gap-2">
            {hasPermission('create_petty_cash_request') && (
              <Button onClick={() => navigate('petty-cash')}>
                <DollarSign className="w-4 h-4 mr-2" />
                Request Petty Cash
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.waiting}</p>
                <p className="text-sm text-gray-500">Waiting</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-gray-500">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {user?.role === 'operation_clerk' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.myFiles}</p>
                  <p className="text-sm text-gray-500">My Files</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!canManipulate && user && user.role !== 'operation_clerk' && (
        <Card className="bg-gradient-to-r from-orange-50 to-blue-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-300 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-slate-800" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  {isUserExecutive ? 'Executive View' : 'View-Only Access'} - Operations Department
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  You have read-only access to view operations statistics and file data. 
                  Only the Operations Manager can assign operation clerks, process operations, and perform operational tasks. 
                  You can view all files and add comments to file timelines.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user?.role === 'operations_manager' && canManipulate && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Operation Clerk Workload</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operationClerks.map((clerk: User) => (
              <WorkloadCard
                key={clerk.id}
                clerk={clerk}
                workload={getOperationClerkWorkload(clerk.id, files)}
                onAssign={() => {
                  // Check if there are files ready for operations
                  const readyFiles = files.filter(f => f.status === 'READY_FOR_OPERATIONS');
                  if (readyFiles.length === 0) {
                    toast.error('No files ready for operations assignment');
                    return;
                  }
                  // If there's only one file, auto-select it
                  if (readyFiles.length === 1) {
                    setSelectedFile(readyFiles[0]);
                  }
                  setSelectedClerk(clerk.id);
                  setAssignDialogOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ready">Ready</TabsTrigger>
          <TabsTrigger value="permits">Permits</TabsTrigger>
          <TabsTrigger value="swissport">Swissport</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          {user?.role === 'operation_clerk' && (
            <TabsTrigger value="myfiles">My Files</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Operation Files</CardTitle>
              <CardDescription>Manage files in operations pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">File Number</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Client</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Assigned Clerk</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No files found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredFiles.map((file: ShipmentFile) => (
                        <tr key={file.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-mono font-medium text-blue-600">{file.fileNumber}</p>
                              <p className="text-sm text-gray-500">{file.shipmentType} | {file.transportMode}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium">{file.client?.name}</p>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className={cn('text-xs', statusColors[file.status])}>
                              {file.status.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            {file.assignedOperationClerk ? (
                              <span className="text-sm">{file.assignedOperationClerk.name}</span>
                            ) : (
                              <span className="text-sm text-gray-400">Not assigned</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button variant="ghost" size="sm" onClick={() => navigate('files/:id', { id: file.id })}>
                                View
                              </Button>
                              {canManipulate && user?.role === 'operations_manager' && file.status === 'READY_FOR_OPERATIONS' && (
                                <Button size="sm" onClick={() => { setSelectedFile(file); setAssignDialogOpen(true); }}>
                                  Assign
                                </Button>
                              )}
                              {canManipulate && (user?.role === 'operations_manager' || user?.role === 'operation_clerk') && 
                               file.status === 'READY_FOR_OPERATIONS' && (
                                <Button size="sm" onClick={() => { setSelectedFile(file); setProcessDialogOpen(true); }}>
                                  Accept
                                </Button>
                              )}
                              
                              {/* OPERATION CLERK UPLOADS - Only for assigned user */}
                              {(user?.role === 'operation_clerk' || user?.role === 'operations_manager') && 
                               file.assignedOperationClerkId === user?.id &&
                               (file.status === 'WAITING_FOR_RELEASE_ORDER' || 
                                file.status === 'RELEASE_ORDER_RECEIVED' || 
                                file.status === 'WAITING_FOR_PORT_CHARGES_PAYMENT' || 
                                file.status === 'WAITING_FOR_SWISSPORT_CHARGES_PAYMENT') && (
                                <>
                                  {/* Upload Verification Photos */}
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => { setSelectedFile(file); setVerificationPhotosDialogOpen(true); }}
                                    className={file.verificationPhotos?.length ? 'bg-green-50 border-green-300' : ''}
                                  >
                                    <Upload className="w-3 h-3 mr-1" />
                                    {file.verificationPhotos?.length ? `✓ Photos (${file.verificationPhotos.length})` : 'Upload Photos'}
                                  </Button>

                                  {/* Upload Release Order */}
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => { setSelectedFile(file); setReleaseOrderDialogOpen(true); }}
                                    className={file.releaseOrderUrl ? 'bg-green-50 border-green-300' : ''}
                                  >
                                    <Upload className="w-3 h-3 mr-1" />
                                    {file.releaseOrderUrl ? '✓ Release Order' : 'Release Order'}
                                  </Button>

                                  {/* Upload Port Charges (SEA only) - Requires release order first */}
                                  {file.transportMode === 'SEA' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => { 
                                        if (!file.releaseOrderUrl) {
                                          toast.error('Please upload release order first');
                                          return;
                                        }
                                        setSelectedFile(file); 
                                        setPortChargesDialogOpen(true); 
                                      }}
                                      className={file.portChargesUrl ? 'bg-green-50 border-green-300' : ''}
                                      disabled={!file.releaseOrderUrl}
                                      title={!file.releaseOrderUrl ? 'Upload release order first' : 'Upload port charges'}
                                    >
                                      <Upload className="w-3 h-3 mr-1" />
                                      {file.portChargesUrl ? '✓ Port Charges' : 'Port Charges'}
                                    </Button>
                                  )}

                                  {/* Upload Swissport Charges (AIR only) - Requires release order first */}
                                  {file.transportMode === 'AIR' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => { 
                                        if (!file.releaseOrderUrl) {
                                          toast.error('Please upload release order first');
                                          return;
                                        }
                                        setSelectedFile(file); 
                                        setSwissportChargesDialogOpen(true); 
                                      }}
                                      className={file.swissportChargesUrl ? 'bg-green-50 border-green-300' : ''}
                                      disabled={!file.releaseOrderUrl}
                                      title={!file.releaseOrderUrl ? 'Upload release order first' : 'Upload swissport charges'}
                                    >
                                      <Upload className="w-3 h-3 mr-1" />
                                      {file.swissportChargesUrl ? '✓ Swissport' : 'Swissport Charges'}
                                    </Button>
                                  )}
                                </>
                              )}

                              {/* PORT CHARGES PAID Button - For SEA shipments - Only Finance Manager and Cashier can confirm payment */}
                              {(user?.role === 'finance_manager' || user?.role === 'cashier') && 
                               file.transportMode === 'SEA' && 
                               file.status === 'WAITING_FOR_PORT_CHARGES_PAYMENT' && file.portChargesUrl && (
                                <Button 
                                  size="sm" 
                                  onClick={() => { setSelectedFile(file); handlePortChargesPaid(); }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  title="Confirm port charges payment"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  PORT CHARGES PAID
                                </Button>
                              )}

                              {/* SWISSPORT CHARGES PAID Button - For AIR shipments - Only Finance Manager and Cashier can confirm payment */}
                              {(user?.role === 'finance_manager' || user?.role === 'cashier') && 
                               file.transportMode === 'AIR' && 
                               file.status === 'WAITING_FOR_SWISSPORT_CHARGES_PAYMENT' && file.swissportChargesUrl && (
                                <Button 
                                  size="sm" 
                                  onClick={() => { setSelectedFile(file); handleSwissportChargesPaid(); }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  title="Confirm Swissport charges payment"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  SWISSPORT PAID
                                </Button>
                              )}

                              {/* OPERATIONS DONE Button - After payment confirmation (both SEA and AIR) - Only for assigned user */}
                              {user?.role === 'operation_clerk' && 
                               file.assignedOperationClerkId === user?.id &&
                               ((file.transportMode === 'SEA' && file.portChargesPaidAt) ||
                                (file.transportMode === 'AIR' && file.swissportChargesPaidAt)) &&
                               file.releaseOrderUrl && 
                               file.status !== 'VERIFICATION_FORM_PENDING' &&
                               file.status !== 'VERIFICATION_FORM_COMPLETED' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => { setSelectedFile(file); handleOperationsDone(); }}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  title="Mark operations as complete and proceed to verification"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  OPERATIONS DONE
                                </Button>
                              )}

                              {/* CARGO VERIFICATION FORM - Available for all shipments that have operation clerk assigned */}
                              {user?.role === 'operation_clerk' && 
                               file.assignedOperationClerkId === user?.id &&
                               !file.cargoVerificationForm && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleOpenVerificationForm(file)}
                                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                                  title="Fill cargo verification form (can be done at any time)"
                                >
                                  <ClipboardList className="w-3 h-3 mr-1" />
                                  Fill Verification Form
                                </Button>
                              )}

                              {/* CARGO VERIFICATION FORM - REQUIRED BEFORE DELIVERY (Purple for pending) */}
                              {user?.role === 'operation_clerk' && 
                               file.assignedOperationClerkId === user?.id &&
                               file.status === 'VERIFICATION_FORM_PENDING' &&
                               !file.cargoVerificationForm && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleOpenVerificationForm(file)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white animate-pulse"
                                  title="REQUIRED: Fill verification form before driver assignment"
                                >
                                  <ClipboardList className="w-3 h-3 mr-1" />
                                  Fill Verification Form (Required)
                                </Button>
                              )}

                              {/* VIEW/PRINT VERIFICATION FORM - After form is completed */}
                              {file.cargoVerificationForm && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handlePrintVerificationForm(file)}
                                  className="bg-green-50 border-green-300 text-green-700"
                                  title="View and print completed verification form"
                                >
                                  <Printer className="w-3 h-3 mr-1" />
                                  View/Print Form
                                </Button>
                              )}

                              {/* OPERATIONS DONE - Move to Delivery (After Verification Form Completed) */}
                              {user?.role === 'operation_clerk' && 
                               file.assignedOperationClerkId === user?.id &&
                               file.status === 'VERIFICATION_FORM_COMPLETED' &&
                               file.cargoVerificationForm && (
                                <Button 
                                  size="sm" 
                                  onClick={() => { setSelectedFile(file); handleMoveToDelivery(); }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  title="Move file to delivery for driver assignment"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  OPERATIONS DONE
                                </Button>
                              )}
                              
                              {/* PERMITS CLERK WORKFLOW */}
                              {user?.role === 'permits_clerk' && (
                                <>
                                  {/* Upload Permit Invoice Button */}
                                  {file.status === 'RECEIVED_BY_CLERK' && !file.permitInvoiceUrl && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => { setSelectedFile(file); setPermitInvoiceDialogOpen(true); }}
                                    >
                                      <Upload className="w-4 h-4 mr-1" />
                                      Upload Permit Invoice
                                    </Button>
                                  )}

                                  {/* Waiting for Permit Payment Status */}
                                  {file.status === 'WAITING_FOR_PERMIT_PAYMENTS' && (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                                      Waiting for Finance to Confirm Payment
                                    </Badge>
                                  )}

                                  {/* Upload Permit Document (after payment) */}
                                  {file.status === 'PERMIT_PAYMENTS_DONE' && !file.permitDocumentUrl && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => { setSelectedFile(file); setPermitDocumentDialogOpen(true); }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Upload className="w-4 h-4 mr-1" />
                                      Upload Permit Document
                                    </Button>
                                  )}

                                  {/* Permits Done Button (after document uploaded) */}
                                  {file.status === 'PERMIT_PAYMENTS_DONE' && file.permitDocumentUrl && !file.permitsDoneAt && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => { setSelectedFile(file); setPermitsDoneDialogOpen(true); }}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <FileCheck className="w-4 h-4 mr-1" />
                                      Permits Done
                                    </Button>
                                  )}
                                </>
                              )}

                              {/* PERMITS PAID Button - Only Finance Manager and Cashier can confirm */}
                              {(user?.role === 'finance_manager' || user?.role === 'cashier') && 
                               file.status === 'WAITING_FOR_PERMIT_PAYMENTS' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    if (!user) return;
                                    updateFileStatus(file.id, 'PERMIT_PAYMENTS_DONE', user.id, {
                                      permitPaymentsDoneAt: new Date()
                                    });
                                    toast.success('Permit payment confirmed - Ready to upload permits');
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  CONFIRM PAYMENT
                                </Button>
                              )}

                              {/* PERMITS DONE Button - Visible to all for status tracking */}
                              {file.permitsDoneAt && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                  ✓ Permits Done
                                </Badge>
                              )}

                              {/* Show WAITING FOR PERMITS status to all users */}
                              {file.status === 'RECEIVED_BY_CLERK' && !file.permitInvoiceUrl && user?.role !== 'permits_clerk' && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                                  Waiting for Permits
                                </Badge>
                              )}

                              {/* ETA/ETB Button - For shipping line clerk (SEA shipments) */}
                              {user?.role === 'shipping_line_clerk' && file.transportMode === 'SEA' && 
                               (file.status === 'RECEIVED_BY_CLERK' || file.status === 'PERMITS_DONE' || 
                                file.status === 'WAITING_FOR_PERMIT_PAYMENTS' || file.status === 'PERMIT_PAYMENTS_DONE') && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => { setSelectedFile(file); setEtaEtbDialogOpen(true); }}
                                  className={file.eta ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
                                >
                                  <Ship className="w-4 h-4 mr-1" />
                                  {file.eta ? '✓ ETA/ETB' : 'Set ETA/ETB'}
                                </Button>
                              )}

                              {/* Delivery Order Workflow - For shipping line clerk (SEA shipments) */}
                              {user?.role === 'shipping_line_clerk' && file.transportMode === 'SEA' && (
                                <>
                                  {/* Upload Invoice Button */}
                                  {file.status === 'PERMITS_DONE' && !file.deliveryOrderInvoiceUrl && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => { setSelectedFile(file); setDeliveryOrderDialogOpen(true); }}
                                    >
                                      <Upload className="w-4 h-4 mr-1" />
                                      Upload DO Invoice
                                    </Button>
                                  )}

                                  {/* Waiting for Payment Status */}
                                  {file.status === 'WAITING_FOR_DO_PAYMENT' && (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                                      Waiting for DO Payment
                                    </Badge>
                                  )}

                                  {/* Submit Delivery Order Button (after payment) */}
                                  {file.status === 'DELIVERY_ORDER_PAYMENTS_DONE' && !file.deliveryOrderSubmittedAt && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => { setSelectedFile(file); setDeliveryOrderDialogOpen(true); }}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Submit Delivery Order
                                    </Button>
                                  )}
                                </>
                              )}

                              {/* Petty Cash button for operations manager and operation clerk - Navigate with file pre-selected */}
                              {(user?.role === 'operations_manager' || user?.role === 'operation_clerk') && hasPermission('create_petty_cash_request') && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => navigate('petty-cash', { fileId: file.id })}
                                >
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Petty Cash
                                </Button>
                              )}
                              {!canManipulate && user?.role !== 'operation_clerk' && (
                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                  View Only
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept File</DialogTitle>
            <DialogDescription>
              {selectedFile && `Accept file ${selectedFile.fileNumber} for processing`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600">
              By accepting this file, you acknowledge that you will be responsible for:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
              <li>Processing permits and required documentation</li>
              <li>Coordinating with shipping lines</li>
              <li>Arranging cargo collection and delivery</li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcceptFile}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pettyCashDialogOpen} onOpenChange={setPettyCashDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Petty Cash</DialogTitle>
            <DialogDescription>
              Submit a petty cash request for operational expenses
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>File (Optional)</Label>
              <Select 
                value={selectedFile ? selectedFile.id : ''} 
                onValueChange={(id: string) => {
                  if (id) {
                    setSelectedFile(files.find((f: ShipmentFile) => f.id === id) || null);
                  } else {
                    setSelectedFile(null);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a file (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No file - General request</SelectItem>
                  {files
                    .filter((f: ShipmentFile) => f.assignedOperationClerkId === user?.id)
                    .map((file: ShipmentFile) => (
                      <SelectItem key={file.id} value={file.id}>
                        {file.fileNumber} - {file.client?.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                You can request petty cash without selecting a file
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={pettyCashForm.amount}
                  onChange={(e) => setPettyCashForm({ ...pettyCashForm, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={pettyCashForm.currency} 
                  onValueChange={(v: string) => setPettyCashForm({ ...pettyCashForm, currency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TZS">TZS</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe what the funds are for..."
                value={pettyCashForm.description}
                onChange={(e) => setPettyCashForm({ ...pettyCashForm, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                {selectedFile 
                  ? `Request will be linked to file: ${selectedFile.fileNumber}`
                  : 'This will be a general petty cash request (not linked to any file)'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPettyCashDialogOpen(false);
              setPettyCashForm({ amount: '', currency: 'TZS', description: '' });
              setSelectedFile(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handlePettyCashRequest}
              disabled={!pettyCashForm.amount || !pettyCashForm.description}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Operation Clerk</DialogTitle>
            <DialogDescription>
              {selectedFile && `Assign an operation clerk to file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!selectedFile && (
              <div className="space-y-2">
                <Label>Select File</Label>
                <Select 
                  value="" 
                  onValueChange={(fileId: string) => {
                    const file = files.find(f => f.id === fileId);
                    setSelectedFile(file || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a file to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {files
                      .filter(f => f.status === 'READY_FOR_OPERATIONS')
                      .map((file) => (
                        <SelectItem key={file.id} value={file.id}>
                          {file.fileNumber} - {file.client?.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Select Operation Clerk</Label>
              <Select value={selectedClerk} onValueChange={setSelectedClerk}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an operation clerk" />
                </SelectTrigger>
                <SelectContent>
                  {operationClerks.map((clerk: User) => {
                    const workload = getOperationClerkWorkload(clerk.id, files);
                    return (
                      <SelectItem key={clerk.id} value={clerk.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{clerk.name}</span>
                          <span className="text-xs text-gray-500 ml-4">
                            ({workload.totalAssigned} files)
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignClerk} disabled={!selectedClerk || !selectedFile}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permit Invoice Upload Dialog */}
      <Dialog open={permitInvoiceDialogOpen} onOpenChange={setPermitInvoiceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Permit Invoice</DialogTitle>
            <DialogDescription>
              {selectedFile && `Upload permit invoice for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Upload className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-700">
                  Upload the permit invoice. After payment is confirmed, you can upload the permit documents.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Permit Invoice *</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPermitForm({ ...permitForm, invoiceFile: e.target.files[0] });
                    }
                  }}
                  className="hidden"
                  id="permit-invoice-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                />
                <label htmlFor="permit-invoice-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {permitForm.invoiceFile 
                      ? permitForm.invoiceFile.name 
                      : 'Click to upload permit invoice'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supported: PDF, DOC, Images, Excel
                  </p>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPermitInvoiceDialogOpen(false);
              setPermitForm({ invoiceFile: null, documentFile: null });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handlePermitInvoiceUpload}
              disabled={!permitForm.invoiceFile}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permit Document Upload Dialog */}
      <Dialog open={permitDocumentDialogOpen} onOpenChange={setPermitDocumentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Permit Document</DialogTitle>
            <DialogDescription>
              {selectedFile && `Upload permit document for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-700">
                  Payment confirmed! Upload the permit document to proceed.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Permit Document *</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPermitForm({ ...permitForm, documentFile: e.target.files[0] });
                    }
                  }}
                  className="hidden"
                  id="permit-document-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="permit-document-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {permitForm.documentFile 
                      ? permitForm.documentFile.name 
                      : 'Click to upload permit document'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supported: PDF, DOC, Images
                  </p>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPermitDocumentDialogOpen(false);
              setPermitForm({ invoiceFile: null, documentFile: null });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handlePermitDocumentUpload}
              disabled={!permitForm.documentFile}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permits Done Dialog */}
      <Dialog open={permitsDoneDialogOpen} onOpenChange={setPermitsDoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Permits as Done</DialogTitle>
            <DialogDescription>
              {selectedFile && `Confirm that all permits for file ${selectedFile.fileNumber} have been completed`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <FileCheck className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Permits Completion</p>
                <p className="text-sm text-green-700 mt-1">
                  By marking permits as done, you confirm that all required permits have been obtained and processed for this shipment.
                </p>
              </div>
            </div>

            {selectedFile && (
              <div className="mt-4 space-y-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">File Details:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">File Number:</span>
                    <p className="font-mono font-medium">{selectedFile.fileNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Client:</span>
                    <p className="font-medium">{selectedFile.client?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Transport Mode:</span>
                    <p>{selectedFile.transportMode}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Shipment Type:</span>
                    <p>{selectedFile.shipmentType}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPermitsDoneDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePermitsDone} className="bg-green-600 hover:bg-green-700 text-white">
              <FileCheck className="w-4 h-4 mr-2" />
              Confirm Permits Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ETA/ETB Dialog - For Shipping Line Clerk */}
      <Dialog open={etaEtbDialogOpen} onOpenChange={setEtaEtbDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set ETA/ETB Information</DialogTitle>
            <DialogDescription>
              {selectedFile && `Enter estimated arrival times for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Ship className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-700">
                  {selectedFile?.transportMode === 'SEA' 
                    ? 'For SEA shipments, both ETA and ETB are required'
                    : 'Enter the estimated time of arrival for this shipment'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>ETA (Estimated Time of Arrival) *</Label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={etaEtbForm.eta}
                  onChange={(e) => setEtaEtbForm({ ...etaEtbForm, eta: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            {selectedFile?.transportMode === 'SEA' && (
              <div className="space-y-2">
                <Label>ETB (Estimated Time of Berthing) *</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <Input
                    type="date"
                    value={etaEtbForm.etb}
                    onChange={(e) => setEtaEtbForm({ ...etaEtbForm, etb: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {selectedFile && (selectedFile.eta || selectedFile.etb) && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium mb-2">Current Values:</p>
                {selectedFile.eta && (
                  <p className="text-sm text-green-600">
                    ETA: {new Date(selectedFile.eta).toLocaleDateString()}
                  </p>
                )}
                {selectedFile.etb && (
                  <p className="text-sm text-green-600">
                    ETB: {new Date(selectedFile.etb).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEtaEtbDialogOpen(false);
              setEtaEtbForm({ eta: '', etb: '' });
            }}>
              Cancel
            </Button>
            <Button onClick={handleEtaEtbSubmit}>
              <Ship className="w-4 h-4 mr-2" />
              Save ETA/ETB
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Order Dialog - For Shipping Line Clerk */}
      <Dialog open={deliveryOrderDialogOpen} onOpenChange={setDeliveryOrderDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedFile?.status === 'PERMITS_DONE' 
                ? 'Upload Delivery Order Invoice' 
                : 'Submit Delivery Order'}
            </DialogTitle>
            <DialogDescription>
              {selectedFile && `Delivery order workflow for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedFile?.status === 'PERMITS_DONE' && (
              <>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Upload className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-700">
                      Upload the delivery order invoice. After payment is confirmed, you can submit the delivery order document.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Delivery Order Invoice *</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setDeliveryOrderForm({ ...deliveryOrderForm, invoiceFile: e.target.files[0] });
                        }
                      }}
                      className="hidden"
                      id="do-invoice-upload"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                    />
                    <label htmlFor="do-invoice-upload" className="cursor-pointer">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        {deliveryOrderForm.invoiceFile 
                          ? deliveryOrderForm.invoiceFile.name 
                          : 'Click to upload invoice'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Supported: PDF, DOC, Images, Excel
                      </p>
                    </label>
                  </div>
                </div>
              </>
            )}

            {selectedFile?.status === 'DELIVERY_ORDER_PAYMENTS_DONE' && (
              <>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-700">
                      Payment confirmed! Upload the delivery order document to complete the submission.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Delivery Order Document *</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setDeliveryOrderForm({ ...deliveryOrderForm, documentFile: e.target.files[0] });
                        }
                      }}
                      className="hidden"
                      id="do-document-upload"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="do-document-upload" className="cursor-pointer">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        {deliveryOrderForm.documentFile 
                          ? deliveryOrderForm.documentFile.name 
                          : 'Click to upload delivery order'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Supported: PDF, DOC, Images
                      </p>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeliveryOrderDialogOpen(false);
              setDeliveryOrderForm({ invoiceFile: null, documentFile: null });
            }}>
              Cancel
            </Button>
            {selectedFile?.status === 'PERMITS_DONE' && (
              <Button 
                onClick={handleDeliveryOrderInvoiceUpload}
                disabled={!deliveryOrderForm.invoiceFile}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Invoice
              </Button>
            )}
            {selectedFile?.status === 'DELIVERY_ORDER_PAYMENTS_DONE' && (
              <Button 
                onClick={handleDeliveryOrderSubmit}
                disabled={!deliveryOrderForm.documentFile}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Delivery Order
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Verification Photos Dialog */}
      <Dialog open={verificationPhotosDialogOpen} onOpenChange={setVerificationPhotosDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Verification Photos</DialogTitle>
            <DialogDescription>
              {selectedFile && `Upload verification photos for file ${selectedFile.fileNumber} (Max 7 photos)`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Photos (1-7)</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files).slice(0, 7);
                      setVerificationPhotos(files);
                    }
                  }}
                  className="hidden"
                  id="verification-photos-upload"
                />
                <label htmlFor="verification-photos-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload photos</p>
                  <p className="text-xs text-gray-400 mt-1">Maximum 7 photos (JPG, PNG)</p>
                </label>
              </div>
              
              {verificationPhotos.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium">Selected Photos ({verificationPhotos.length}/7):</p>
                  {verificationPhotos.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="flex-1">{file.name}</span>
                      <Button size="sm" variant="ghost" onClick={() => setVerificationPhotos(verificationPhotos.filter((_, i) => i !== index))}>×</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Note:</span> Upload clear photos of the cargo for verification purposes. Maximum 7 photos allowed.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setVerificationPhotosDialogOpen(false); setVerificationPhotos([]); }}>Cancel</Button>
            <Button onClick={handleUploadVerificationPhotos} disabled={verificationPhotos.length === 0 || verificationPhotos.length > 7}>
              <Upload className="w-4 h-4 mr-2" />
              Upload {verificationPhotos.length} Photo{verificationPhotos.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Release Order Dialog */}
      <Dialog open={releaseOrderDialogOpen} onOpenChange={setReleaseOrderDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Release Order</DialogTitle>
            <DialogDescription>
              {selectedFile && `Upload release order for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Release Order Document</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReleaseOrderFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="release-order-upload"
                />
                <label htmlFor="release-order-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload release order</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG</p>
                </label>
              </div>
              
              {releaseOrderFile && (
                <div className="mt-3 p-2 bg-green-50 rounded text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="flex-1">{releaseOrderFile.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => setReleaseOrderFile(null)}>×</Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setReleaseOrderDialogOpen(false); setReleaseOrderFile(null); }}>Cancel</Button>
            <Button onClick={handleUploadReleaseOrder} disabled={!releaseOrderFile}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Release Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Port Charges Dialog */}
      <Dialog open={portChargesDialogOpen} onOpenChange={setPortChargesDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Port Charges</DialogTitle>
            <DialogDescription>
              {selectedFile && `Upload port charges for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Port Charges Document</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPortChargesFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="port-charges-upload"
                />
                <label htmlFor="port-charges-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload port charges</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG</p>
                </label>
              </div>
              
              {portChargesFile && (
                <div className="mt-3 p-2 bg-green-50 rounded text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="flex-1">{portChargesFile.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => setPortChargesFile(null)}>×</Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setPortChargesDialogOpen(false); setPortChargesFile(null); }}>Cancel</Button>
            <Button onClick={handleUploadPortCharges} disabled={!portChargesFile}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Port Charges
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Swissport Charges Dialog */}
      <Dialog open={swissportChargesDialogOpen} onOpenChange={setSwissportChargesDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Swissport Charges</DialogTitle>
            <DialogDescription>
              {selectedFile && `Upload Swissport charges for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Swissport Charges Document</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSwissportChargesFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="swissport-charges-upload"
                />
                <label htmlFor="swissport-charges-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload Swissport charges</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG</p>
                </label>
              </div>
              
              {swissportChargesFile && (
                <div className="mt-3 p-2 bg-green-50 rounded text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="flex-1">{swissportChargesFile.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => setSwissportChargesFile(null)}>×</Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setSwissportChargesDialogOpen(false); setSwissportChargesFile(null); }}>Cancel</Button>
            <Button onClick={handleUploadSwissportCharges} disabled={!swissportChargesFile}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Swissport Charges
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cargo Verification Form Dialog */}
      <Dialog open={verificationFormDialogOpen} onOpenChange={setVerificationFormDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Cargo Verification Form
            </DialogTitle>
            <DialogDescription>
              {selectedFile && `Complete cargo verification for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Header Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="station">Station (ICD) *</Label>
                <Input
                  id="station"
                  value={verificationForm.station}
                  onChange={(e) => setVerificationForm({ ...verificationForm, station: e.target.value })}
                  placeholder="Enter station name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verificationDate">Verification Date *</Label>
                <Input
                  id="verificationDate"
                  type="date"
                  value={verificationForm.verificationDate}
                  onChange={(e) => setVerificationForm({ ...verificationForm, verificationDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verificationOfficer">Verification Officer / TRA Officer *</Label>
                <Input
                  id="verificationOfficer"
                  value={verificationForm.verificationOfficer}
                  onChange={(e) => setVerificationForm({ ...verificationForm, verificationOfficer: e.target.value })}
                  placeholder="Enter officer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tansadNo">TANSAD No *</Label>
                <Input
                  id="tansadNo"
                  value={verificationForm.tansadNo}
                  onChange={(e) => setVerificationForm({ ...verificationForm, tansadNo: e.target.value })}
                  placeholder="Enter TANSAD number"
                />
              </div>
            </div>

            {/* Inspection Checklist */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-sm">Inspection Checklist</h3>
              
              {/* Question 1 */}
              <div className="space-y-2 border-b pb-3">
                <Label>1. Physical damage to external part? *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q1" value="YES" checked={verificationForm.q1_physicalDamage === 'YES'} onChange={(e) => setVerificationForm({ ...verificationForm, q1_physicalDamage: e.target.value as VerificationAnswer })} />
                    <span>YES</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q1" value="NO" checked={verificationForm.q1_physicalDamage === 'NO'} onChange={(e) => setVerificationForm({ ...verificationForm, q1_physicalDamage: e.target.value as VerificationAnswer })} />
                    <span>NO</span>
                  </label>
                </div>
                <Input placeholder="Remarks" value={verificationForm.q1_remarks} onChange={(e) => setVerificationForm({ ...verificationForm, q1_remarks: e.target.value })} />
              </div>

              {/* Question 2 */}
              <div className="space-y-2 border-b pb-3">
                <Label>2. Are seals still intact? *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q2" value="YES" checked={verificationForm.q2_sealsIntact === 'YES'} onChange={(e) => setVerificationForm({ ...verificationForm, q2_sealsIntact: e.target.value as VerificationAnswer })} />
                    <span>YES</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q2" value="NO" checked={verificationForm.q2_sealsIntact === 'NO'} onChange={(e) => setVerificationForm({ ...verificationForm, q2_sealsIntact: e.target.value as VerificationAnswer })} />
                    <span>NO</span>
                  </label>
                </div>
                <Input placeholder="Remarks" value={verificationForm.q2_remarks} onChange={(e) => setVerificationForm({ ...verificationForm, q2_remarks: e.target.value })} />
              </div>

              {/* Question 3 */}
              <div className="space-y-2 border-b pb-3">
                <Label>3. Discrepancy in cargo quantity/CHS no? *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q3" value="YES" checked={verificationForm.q3_discrepancyQuantity === 'YES'} onChange={(e) => setVerificationForm({ ...verificationForm, q3_discrepancyQuantity: e.target.value as VerificationAnswer })} />
                    <span>YES</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q3" value="NO" checked={verificationForm.q3_discrepancyQuantity === 'NO'} onChange={(e) => setVerificationForm({ ...verificationForm, q3_discrepancyQuantity: e.target.value as VerificationAnswer })} />
                    <span>NO</span>
                  </label>
                </div>
                <Input placeholder="Remarks" value={verificationForm.q3_remarks} onChange={(e) => setVerificationForm({ ...verificationForm, q3_remarks: e.target.value })} />
              </div>

              {/* Question 4 */}
              <div className="space-y-2 border-b pb-3">
                <Label>4. Same items as declared in customs entry? *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q4" value="YES" checked={verificationForm.q4_sameItemsDeclared === 'YES'} onChange={(e) => setVerificationForm({ ...verificationForm, q4_sameItemsDeclared: e.target.value as VerificationAnswer })} />
                    <span>YES</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q4" value="NO" checked={verificationForm.q4_sameItemsDeclared === 'NO'} onChange={(e) => setVerificationForm({ ...verificationForm, q4_sameItemsDeclared: e.target.value as VerificationAnswer })} />
                    <span>NO</span>
                  </label>
                </div>
                <Input placeholder="Remarks" value={verificationForm.q4_remarks} onChange={(e) => setVerificationForm({ ...verificationForm, q4_remarks: e.target.value })} />
              </div>

              {/* Question 5 */}
              <div className="space-y-2 border-b pb-3">
                <Label>5. All parts seen (spare parts, logo)? *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q5" value="YES" checked={verificationForm.q5_allPartsSeen === 'YES'} onChange={(e) => setVerificationForm({ ...verificationForm, q5_allPartsSeen: e.target.value as VerificationAnswer })} />
                    <span>YES</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q5" value="NO" checked={verificationForm.q5_allPartsSeen === 'NO'} onChange={(e) => setVerificationForm({ ...verificationForm, q5_allPartsSeen: e.target.value as VerificationAnswer })} />
                    <span>NO</span>
                  </label>
                </div>
                <Input placeholder="Remarks" value={verificationForm.q5_remarks} onChange={(e) => setVerificationForm({ ...verificationForm, q5_remarks: e.target.value })} />
              </div>

              {/* Question 6 */}
              <div className="space-y-2 border-b pb-3">
                <Label>6. Internal damage to goods? *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q6" value="YES" checked={verificationForm.q6_internalDamage === 'YES'} onChange={(e) => setVerificationForm({ ...verificationForm, q6_internalDamage: e.target.value as VerificationAnswer })} />
                    <span>YES</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q6" value="NO" checked={verificationForm.q6_internalDamage === 'NO'} onChange={(e) => setVerificationForm({ ...verificationForm, q6_internalDamage: e.target.value as VerificationAnswer })} />
                    <span>NO</span>
                  </label>
                </div>
                <Input placeholder="Remarks" value={verificationForm.q6_remarks} onChange={(e) => setVerificationForm({ ...verificationForm, q6_remarks: e.target.value })} />
              </div>

              {/* Question 7 */}
              <div className="space-y-2 border-b pb-3">
                <Label>7. Do goods need special attention (packaging)? *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q7" value="YES" checked={verificationForm.q7_specialAttention === 'YES'} onChange={(e) => setVerificationForm({ ...verificationForm, q7_specialAttention: e.target.value as VerificationAnswer })} />
                    <span>YES</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q7" value="NO" checked={verificationForm.q7_specialAttention === 'NO'} onChange={(e) => setVerificationForm({ ...verificationForm, q7_specialAttention: e.target.value as VerificationAnswer })} />
                    <span>NO</span>
                  </label>
                </div>
                <Input placeholder="Remarks" value={verificationForm.q7_remarks} onChange={(e) => setVerificationForm({ ...verificationForm, q7_remarks: e.target.value })} />
              </div>

              {/* Question 8 */}
              <div className="space-y-2 border-b pb-3">
                <Label>8. Was container locked after verification? *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q8" value="YES" checked={verificationForm.q8_containerLocked === 'YES'} onChange={(e) => setVerificationForm({ ...verificationForm, q8_containerLocked: e.target.value as VerificationAnswer })} />
                    <span>YES</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q8" value="NO" checked={verificationForm.q8_containerLocked === 'NO'} onChange={(e) => setVerificationForm({ ...verificationForm, q8_containerLocked: e.target.value as VerificationAnswer })} />
                    <span>NO</span>
                  </label>
                </div>
                <Input placeholder="Remarks" value={verificationForm.q8_remarks} onChange={(e) => setVerificationForm({ ...verificationForm, q8_remarks: e.target.value })} />
              </div>

              {/* Question 9 */}
              <div className="space-y-2 border-b pb-3">
                <Label>9. Was seal fixed to container? *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q9" value="YES" checked={verificationForm.q9_sealFixed === 'YES'} onChange={(e) => setVerificationForm({ ...verificationForm, q9_sealFixed: e.target.value as VerificationAnswer })} />
                    <span>YES</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q9" value="NO" checked={verificationForm.q9_sealFixed === 'NO'} onChange={(e) => setVerificationForm({ ...verificationForm, q9_sealFixed: e.target.value as VerificationAnswer })} />
                    <span>NO</span>
                  </label>
                </div>
                <Input placeholder="Seal Number" value={verificationForm.q9_sealNumber} onChange={(e) => setVerificationForm({ ...verificationForm, q9_sealNumber: e.target.value })} />
                <Input placeholder="Remarks" value={verificationForm.q9_remarks} onChange={(e) => setVerificationForm({ ...verificationForm, q9_remarks: e.target.value })} />
              </div>

              {/* Question 10 */}
              <div className="space-y-2">
                <Label>10. Samples taken by officer? *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q10" value="YES" checked={verificationForm.q10_samplesTaken === 'YES'} onChange={(e) => setVerificationForm({ ...verificationForm, q10_samplesTaken: e.target.value as VerificationAnswer })} />
                    <span>YES</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="q10" value="NO" checked={verificationForm.q10_samplesTaken === 'NO'} onChange={(e) => setVerificationForm({ ...verificationForm, q10_samplesTaken: e.target.value as VerificationAnswer })} />
                    <span>NO</span>
                  </label>
                </div>
                <Input placeholder="Quantity" value={verificationForm.q10_quantity} onChange={(e) => setVerificationForm({ ...verificationForm, q10_quantity: e.target.value })} />
                <Input placeholder="Remarks" value={verificationForm.q10_remarks} onChange={(e) => setVerificationForm({ ...verificationForm, q10_remarks: e.target.value })} />
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="generalRemarks">General Remarks</Label>
                <Textarea
                  id="generalRemarks"
                  value={verificationForm.generalRemarks}
                  onChange={(e) => setVerificationForm({ ...verificationForm, generalRemarks: e.target.value })}
                  placeholder="Enter any additional remarks"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="officerName">Officer Name (Signature) *</Label>
                <Input
                  id="officerName"
                  value={verificationForm.officerName}
                  onChange={(e) => setVerificationForm({ ...verificationForm, officerName: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setVerificationFormDialogOpen(false); setSelectedFile(null); }}>Cancel</Button>
            <Button onClick={handleSubmitVerificationForm}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Verification Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
