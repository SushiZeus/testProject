import { useState } from 'react';
import { Ship, FileText, Package, CheckCircle, Upload, Calendar, DollarSign } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useFileStore } from '@/store/fileStore';
import { useNotificationStore } from '@/store/notificationStore';
import { usePettyCashStore } from '@/store/pettyCashStore';
import type { ShipmentFile } from '@/types';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { statusColors } from '@/utils/statusColors';

interface ShippingLinePageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function ShippingLinePage({ navigate }: ShippingLinePageProps) {
  const { user } = useAuthStore();
  const { files, updateFileStatus } = useFileStore();
  const { addNotification } = useNotificationStore();
  const { createRequest } = usePettyCashStore();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedFile, setSelectedFile] = useState<ShipmentFile | null>(null);
  const [etaEtbDialogOpen, setEtaEtbDialogOpen] = useState(false);
  const [deliveryOrderDialogOpen, setDeliveryOrderDialogOpen] = useState(false);
  const [shippingDetailsDialogOpen, setShippingDetailsDialogOpen] = useState(false);
  const [pettyCashDialogOpen, setPettyCashDialogOpen] = useState(false);
  const [doPaymentRequestDialogOpen, setDoPaymentRequestDialogOpen] = useState(false);
  const [selectedFileForCash, setSelectedFileForCash] = useState<string>('none');
  const [selectedFileForDoPayment, setSelectedFileForDoPayment] = useState<ShipmentFile | null>(null);
  const [pettyCashForm, setPettyCashForm] = useState({
    amount: '',
    currency: 'TZS',
    description: '',
  });

  const [doPaymentForm, setDoPaymentForm] = useState({
    amount: '',
    currency: 'TZS',
    description: '',
    invoiceFile: null as File | null,
  });

  // NEW: DO Charges Form (separate from DO payment)
  const [doChargesForm, setDoChargesForm] = useState({
    invoiceFile: null as File | null,
    amount: '',
    currency: 'TZS',
  });
  const [doChargesDialogOpen, setDoChargesDialogOpen] = useState(false);

  const [etaEtbForm, setEtaEtbForm] = useState({ eta: '', etb: '' });
  const [deliveryOrderForm, setDeliveryOrderForm] = useState({
    invoiceFile: null as File | null,
    documentFile: null as File | null,
  });
  const [shippingDetailsForm, setShippingDetailsForm] = useState({
    hblNumber: '',
    mblNumber: '',
    doNumber: '',
    containerNumbers: '',
  });

  // Filter for ALL SEA shipments (Import and Export) - Show from creation
  const seaShipments = files.filter((f: ShipmentFile) => 
    f.transportMode === 'SEA' && 
    (f.shipmentType === 'IMPORT' || f.shipmentType === 'EXPORT')
  );

  const filteredFiles = seaShipments.filter((file: ShipmentFile) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'import') return file.shipmentType === 'IMPORT';
    if (activeTab === 'export') return file.shipmentType === 'EXPORT';
    if (activeTab === 'waiting_do') return (file.status === 'PERMITS_DONE' || file.status === 'WAITING_FOR_DELIVERY_ORDER') && !file.deliveryOrderDocumentUrl;
    if (activeTab === 'processing_do') return file.status === 'WAITING_FOR_DO_PAYMENT' || file.status === 'DELIVERY_ORDER_PAYMENTS_DONE';
    return true;
  });

  const stats = {
    totalSea: seaShipments.length,
    imports: seaShipments.filter(f => f.shipmentType === 'IMPORT').length,
    exports: seaShipments.filter(f => f.shipmentType === 'EXPORT').length,
    waitingDO: seaShipments.filter(f => (f.status === 'PERMITS_DONE' || f.status === 'WAITING_FOR_DELIVERY_ORDER') && !f.deliveryOrderDocumentUrl).length,
    processingDO: seaShipments.filter(f => f.status === 'WAITING_FOR_DO_PAYMENT' || f.status === 'DELIVERY_ORDER_PAYMENTS_DONE').length,
  };

  const handleEtaEtbSubmit = () => {
    if (!selectedFile || !user) return;

    if (!etaEtbForm.eta) {
      toast.error('Please enter ETA (Estimated Time of Arrival)');
      return;
    }

    if (!etaEtbForm.etb) {
      toast.error('Please enter ETB (Estimated Time of Berthing) for SEA shipments');
      return;
    }

    updateFileStatus(
      selectedFile.id,
      selectedFile.status,
      user.id,
      {
        eta: new Date(etaEtbForm.eta),
        etb: new Date(etaEtbForm.etb),
        assignedShippingLineClerkId: user.id,
      }
    );

    toast.success('ETA/ETB information saved successfully');
    setEtaEtbDialogOpen(false);
    setEtaEtbForm({ eta: '', etb: '' });
    setSelectedFile(null);
  };

  const handleDeliveryOrderSubmit = () => {
    if (!selectedFile || !user) return;

    if (!deliveryOrderForm.documentFile) {
      toast.error('Please select the delivery order document to upload');
      return;
    }

    updateFileStatus(
      selectedFile.id,
      'DELIVERY_ORDER_SUBMITTED',
      user.id,
      {
        deliveryOrderDocumentUrl: URL.createObjectURL(deliveryOrderForm.documentFile),
        deliveryOrderSubmittedAt: new Date(),
      }
    );

    // Notify Operations Manager (ID: 5)
    addNotification({
      userId: '5',
      title: 'Delivery Order Submitted',
      message: `Delivery order for file ${selectedFile.fileNumber} has been submitted and is now available in Operations`,
      type: 'success',
      fileId: selectedFile.id,
      link: '/operations',
    });

    // Also notify all Operation Clerks (IDs: 6, 13, 14)
    ['6', '13', '14'].forEach(clerkId => {
      addNotification({
        userId: clerkId,
        title: 'Delivery Order Available',
        message: `Delivery Order for file ${selectedFile.fileNumber} has been uploaded and is now available in Operations.`,
        type: 'info',
        fileId: selectedFile.id,
        link: '/operations',
      });
    });

    toast.success('Delivery order submitted successfully - Now available in Operations');
    setDeliveryOrderDialogOpen(false);
    setDeliveryOrderForm({ invoiceFile: null, documentFile: null });
    setSelectedFile(null);
  };

  const handleShippingDetailsSubmit = () => {
    if (!selectedFile || !user) return;

    if (!shippingDetailsForm.hblNumber && !shippingDetailsForm.mblNumber && 
        !shippingDetailsForm.doNumber && !shippingDetailsForm.containerNumbers) {
      toast.error('Please fill at least one shipping detail field');
      return;
    }

    updateFileStatus(
      selectedFile.id,
      selectedFile.status,
      user.id,
      {
        hblNumber: shippingDetailsForm.hblNumber || selectedFile.hblNumber,
        mblNumber: shippingDetailsForm.mblNumber || selectedFile.mblNumber,
        doNumber: shippingDetailsForm.doNumber || selectedFile.doNumber,
        containerNumbers: shippingDetailsForm.containerNumbers || selectedFile.containerNumbers,
      }
    );

    toast.success('Shipping details saved successfully');
    setShippingDetailsDialogOpen(false);
    setShippingDetailsForm({ hblNumber: '', mblNumber: '', doNumber: '', containerNumbers: '' });
    setSelectedFile(null);
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
      fileId: (selectedFileForCash && selectedFileForCash !== 'none') ? selectedFileForCash : undefined,
      requestedBy: user.id,
      amount,
      currency: pettyCashForm.currency,
      description: pettyCashForm.description,
    });

    // Notify Operations Manager (ID: 5)
    addNotification({
      userId: '5',
      title: 'New Petty Cash Request',
      message: `Request for ${pettyCashForm.currency} ${amount.toLocaleString()} from Shipping Line ${(selectedFileForCash && selectedFileForCash !== 'none') ? `on file ${files.find(f => f.id === selectedFileForCash)?.fileNumber}` : '(General Request)'}`,
      type: 'info',
      link: '/petty-cash',
    });

    toast.success('Petty cash request submitted successfully - Sent to Operations Manager');
    setPettyCashDialogOpen(false);
    setPettyCashForm({ amount: '', currency: 'TZS', description: '' });
    setSelectedFileForCash('none');
  };

  // NEW: Handle DO Payment Request
  const handleDoPaymentRequest = () => {
    if (!selectedFileForDoPayment || !user) return;

    const amount = parseFloat(doPaymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!doPaymentForm.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    if (!doPaymentForm.invoiceFile) {
      toast.error('Please upload an invoice for the DO payment request');
      return;
    }

    // Create DO payment request on the file
    updateFileStatus(
      selectedFileForDoPayment.id,
      selectedFileForDoPayment.status, // Keep current status
      user.id,
      {
        doPaymentRequestAmount: amount,
        doPaymentRequestCurrency: doPaymentForm.currency,
        doPaymentRequestDescription: doPaymentForm.description,
        doPaymentRequestInvoiceUrl: URL.createObjectURL(doPaymentForm.invoiceFile),
        doPaymentRequestStatus: 'PENDING',
        doPaymentRequestRequestedAt: new Date(),
        doPaymentRequestPaidAt: undefined,
      }
    );

    // Notify Operations Manager (ID: 5)
    addNotification({
      userId: '5',
      title: 'DO Payment Request',
      message: `Delivery Order payment request for ${doPaymentForm.currency} ${amount.toLocaleString()} on file ${selectedFileForDoPayment.fileNumber}`,
      type: 'info',
      fileId: selectedFileForDoPayment.id,
      link: '/shipping-line',
    });

    // Also notify Finance Manager (ID: 11)
    addNotification({
      userId: '11',
      title: 'DO Payment Request - Review Required',
      message: `Delivery Order payment request for ${doPaymentForm.currency} ${amount.toLocaleString()} on file ${selectedFileForDoPayment.fileNumber}. Click to review and mark as paid.`,
      type: 'info',
      fileId: selectedFileForDoPayment.id,
      link: '/shipping-line',
    });

    toast.success('DO payment request submitted - Waiting for Finance confirmation');
    setDoPaymentRequestDialogOpen(false);
    setDoPaymentForm({ amount: '', currency: 'TZS', description: '', invoiceFile: null });
    setSelectedFileForDoPayment(null);
  };

  // NEW: Handle DO Charges Upload
  const handleDoChargesUpload = () => {
    if (!selectedFile || !user) return;

    const amount = parseFloat(doChargesForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!doChargesForm.invoiceFile) {
      toast.error('Please upload the DO charges invoice');
      return;
    }

    updateFileStatus(
      selectedFile.id,
      selectedFile.status,
      user.id,
      {
        doChargesInvoiceUrl: URL.createObjectURL(doChargesForm.invoiceFile),
        doChargesAmount: amount,
        doChargesCurrency: doChargesForm.currency,
        doChargesPaid: false,
      }
    );

    // Notify Finance Manager (ID: 11)
    addNotification({
      userId: '11',
      title: 'DO Charges Invoice Uploaded',
      message: `DO charges invoice for ${doChargesForm.currency} ${amount.toLocaleString()} uploaded on file ${selectedFile.fileNumber}. Please confirm payment.`,
      type: 'info',
      fileId: selectedFile.id,
      link: '/shipping-line',
    });

    // Also notify Cashier (ID: 12)
    addNotification({
      userId: '12',
      title: 'DO Charges Invoice Uploaded',
      message: `DO charges invoice for ${doChargesForm.currency} ${amount.toLocaleString()} uploaded on file ${selectedFile.fileNumber}. Please confirm payment.`,
      type: 'info',
      fileId: selectedFile.id,
      link: '/shipping-line',
    });

    toast.success('DO charges invoice uploaded - Waiting for payment confirmation');
    setDoChargesDialogOpen(false);
    setDoChargesForm({ invoiceFile: null, amount: '', currency: 'TZS' });
    setSelectedFile(null);
  };

  // NEW: Handle DO Charges Payment Confirmation
  const handleDoChargesPaid = (file: ShipmentFile) => {
    if (!user) return;

    updateFileStatus(
      file.id,
      file.status,
      user.id,
      {
        doChargesPaid: true,
        doChargesPaidAt: new Date(),
        doChargesPaidBy: user.id,
      }
    );

    // Notify Shipping Line Clerk
    addNotification({
      userId: file.assignedShippingLineClerkId || '0',
      title: 'DO Charges Payment Confirmed',
      message: `DO charges for file ${file.fileNumber} have been paid`,
      type: 'success',
      fileId: file.id,
      link: '/shipping-line',
    });

    toast.success('DO charges payment confirmed ✓');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipping Line Department</h1>
          <p className="text-gray-500 mt-1">
            Manage SEA shipments delivery orders and shipping documentation
          </p>
        </div>
        <Button onClick={() => setPettyCashDialogOpen(true)}>
          <DollarSign className="w-4 h-4 mr-2" />
          Request Petty Cash
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Ship className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSea}</p>
                <p className="text-sm text-gray-500">Total SEA</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.imports}</p>
                <p className="text-sm text-gray-500">Imports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.exports}</p>
                <p className="text-sm text-gray-500">Exports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.waitingDO}</p>
                <p className="text-sm text-gray-500">Waiting D.O</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.processingDO}</p>
                <p className="text-sm text-gray-500">Processing D.O</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Files Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
          <TabsTrigger value="all">All SEA</TabsTrigger>
          <TabsTrigger value="import">Imports</TabsTrigger>
          <TabsTrigger value="export">Exports</TabsTrigger>
          <TabsTrigger value="waiting_do">Waiting D.O</TabsTrigger>
          <TabsTrigger value="processing_do">Processing D.O</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>SEA Shipment Files</CardTitle>
              <CardDescription>Manage delivery orders and shipping documentation for SEA shipments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">File Number</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Client</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Shipping Details</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          <Ship className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No SEA shipment files found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredFiles.map((file: ShipmentFile) => (
                        <tr key={file.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-mono font-medium text-blue-600">{file.fileNumber}</p>
                              <p className="text-sm text-gray-500">SEA</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className={file.shipmentType === 'IMPORT' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}>
                              {file.shipmentType}
                            </Badge>
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
                            <div className="text-xs space-y-1">
                              {/* Container Type */}
                              {file.seaFreightType && (
                                <p className="font-semibold text-blue-600">
                                  {file.seaFreightType === 'LCL' ? 'LCL (Less than Container Load)' : 'FCL (Full Container Load)'}
                                </p>
                              )}
                              
                              {/* BL Information */}
                              {file.blType && file.blNumber && (
                                <p className="text-gray-600">{file.blType}: {file.blNumber}</p>
                              )}
                              
                              {/* Container Quantities for FCL */}
                              {file.seaFreightType === 'FCL' && (
                                <>
                                  {file.fcl20ftQuantity && (
                                    <p className="text-gray-600">📦 20ft: {file.fcl20ftQuantity} container(s)</p>
                                  )}
                                  {file.fcl40ftQuantity && (
                                    <p className="text-gray-600">📦 40ft: {file.fcl40ftQuantity} container(s)</p>
                                  )}
                                  {file.fclContainerOtherDescription && (
                                    <p className="text-gray-600">📦 Other: {file.fclContainerOtherDescription}</p>
                                  )}
                                </>
                              )}
                              
                              {/* D.O Number */}
                              {file.doNumber && <p className="text-gray-600">D.O: {file.doNumber}</p>}
                              
                              {/* Container Numbers */}
                              {file.containerNumbers && <p className="text-gray-600">Containers: {file.containerNumbers}</p>}
                              
                              {/* Cargo Description */}
                              {file.cargoDescription && (
                                <p className="text-gray-500 italic">Cargo: {file.cargoDescription.substring(0, 50)}{file.cargoDescription.length > 50 ? '...' : ''}</p>
                              )}
                              
                              {/* No details message */}
                              {!file.seaFreightType && !file.blType && !file.blNumber && !file.doNumber && !file.containerNumbers && !file.fcl20ftQuantity && !file.fcl40ftQuantity && !file.fclContainerOtherDescription && (
                                <p className="text-gray-400 italic">No shipping details yet</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button variant="ghost" size="sm" onClick={() => navigate('files/:id', { id: file.id })}>
                                View
                              </Button>

                              {/* Shipping Details Button */}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => { 
                                  setSelectedFile(file); 
                                  setShippingDetailsForm({
                                    hblNumber: file.hblNumber || '',
                                    mblNumber: file.mblNumber || '',
                                    doNumber: file.doNumber || '',
                                    containerNumbers: file.containerNumbers || '',
                                  });
                                  setShippingDetailsDialogOpen(true); 
                                }}
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                {file.hblNumber || file.mblNumber ? 'Edit Details' : 'Add Details'}
                              </Button>

                              {/* ETA/ETB Button */}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => { setSelectedFile(file); setEtaEtbDialogOpen(true); }}
                                className={file.eta ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
                              >
                                <Ship className="w-3 h-3 mr-1" />
                                {file.eta ? '✓ ETA/ETB' : 'Set ETA/ETB'}
                              </Button>

                              {/* REQUEST DO PAYMENT Button - NEW */}
                              {file.status === 'PERMITS_DONE' && !file.doPaymentRequestStatus && (
                                <Button 
                                  size="sm" 
                                  onClick={() => { 
                                    setSelectedFileForDoPayment(file);
                                    setDoPaymentRequestDialogOpen(true);
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  <Upload className="w-3 h-3 mr-1" />
                                  REQUEST DO PAYMENT
                                </Button>
                              )}

                              {/* DO Payment Status Badge */}
                              {file.doPaymentRequestStatus === 'PENDING' && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                                  DO Payment Pending
                                </Badge>
                              )}

                              {/* DO PAID Button - Finance Manager Only */}
                              {(user?.role === 'finance_manager' || user?.role === 'cashier') &&
                               file.doPaymentRequestStatus === 'PENDING' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => { 
                                    setSelectedFile(file);
                                    if (!file || !user) return;

                                    updateFileStatus(
                                      file.id,
                                      file.status,
                                      user.id,
                                      {
                                        doPaymentRequestStatus: 'PAID',
                                        doPaymentRequestPaidAt: new Date(),
                                        deliveryOrderPaymentsDoneAt: new Date(),
                                      }
                                    );

                                    addNotification({
                                      userId: file.assignedShippingLineClerkId || '0',
                                      title: 'DO Payment Confirmed',
                                      message: `Delivery Order payment for ${file.doPaymentRequestCurrency} ${file.doPaymentRequestAmount?.toLocaleString()} on file ${file.fileNumber} confirmed. You can now submit the DO document.`,
                                      type: 'success',
                                      fileId: file.id,
                                      link: '/shipping-line',
                                    });

                                    toast.success('DO payment confirmed - Shipping clerk can now submit DO');
                                    setSelectedFile(null);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  title="Confirm DO payment"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  MARK DO PAID
                                </Button>
                              )}

                              {/* SUBMIT DO Button - After payment confirmed */}
                              {file.doPaymentRequestStatus === 'PAID' && 
                               file.deliveryOrderPaymentsDoneAt && 
                               !file.deliveryOrderSubmittedAt && (
                                <Button 
                                  size="sm" 
                                  onClick={() => { setSelectedFile(file); setDeliveryOrderDialogOpen(true); }}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  SUBMIT DO
                                </Button>
                              )}

                              {/* REQUEST DO PAYMENT Button - NEW */}
                              {file.status === 'PERMITS_DONE' && !file.doPaymentRequestStatus && (
                                <Button 
                                  size="sm" 
                                  onClick={() => { 
                                    setSelectedFileForDoPayment(file);
                                    setDoPaymentRequestDialogOpen(true);
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  <Upload className="w-3 h-3 mr-1" />
                                  REQUEST DO PAYMENT
                                </Button>
                              )}

                              {/* DO Payment Status Badge */}
                              {file.doPaymentRequestStatus === 'PENDING' && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                                  DO Payment Pending
                                </Badge>
                              )}

                              {/* DO PAID Button - Finance Manager Only */}
                              {(user?.role === 'finance_manager' || user?.role === 'cashier') &&
                               file.doPaymentRequestStatus === 'PENDING' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => { 
                                    setSelectedFile(file);
                                    if (!file || !user) return;

                                    updateFileStatus(
                                      file.id,
                                      file.status,
                                      user.id,
                                      {
                                        doPaymentRequestStatus: 'PAID',
                                        doPaymentRequestPaidAt: new Date(),
                                        deliveryOrderPaymentsDoneAt: new Date(),
                                      }
                                    );

                                    addNotification({
                                      userId: file.assignedShippingLineClerkId || '0',
                                      title: 'DO Payment Confirmed',
                                      message: `Delivery Order payment for ${file.doPaymentRequestCurrency} ${file.doPaymentRequestAmount?.toLocaleString()} on file ${file.fileNumber} confirmed. You can now submit the DO document.`,
                                      type: 'success',
                                      fileId: file.id,
                                      link: '/shipping-line',
                                    });

                                    toast.success('DO payment confirmed - Shipping clerk can now submit DO');
                                    setSelectedFile(null);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  title="Confirm DO payment"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  MARK DO PAID
                                </Button>
                              )}

                              {/* SUBMIT DO Button - After payment confirmed */}
                              {file.doPaymentRequestStatus === 'PAID' && 
                               file.deliveryOrderPaymentsDoneAt && 
                               !file.deliveryOrderSubmittedAt && (
                                <Button 
                                  size="sm" 
                                  onClick={() => { setSelectedFile(file); setDeliveryOrderDialogOpen(true); }}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  SUBMIT DO
                                </Button>
                              )}

                              {/* DO Submitted Badge */}
                              {file.deliveryOrderSubmittedAt && !file.doChargesInvoiceUrl && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                  ✓ DO Submitted
                                </Badge>
                              )}

                              {/* Upload DO Charges Button - After DO submitted */}
                              {file.deliveryOrderSubmittedAt && !file.doChargesInvoiceUrl && (
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => { setSelectedFile(file); setDoChargesDialogOpen(true); }}
                                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                                >
                                  <Upload className="w-3 h-3 mr-1" />
                                  Upload DO Charges
                                </Button>
                              )}

                              {/* DO Charges Pending Payment Badge */}
                              {file.doChargesInvoiceUrl && !file.doChargesPaid && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                                  DO Charges Pending Payment
                                </Badge>
                              )}

                              {/* DO CHARGES PAID Button - Finance Manager/Cashier Only */}
                              {(user?.role === 'finance_manager' || user?.role === 'cashier') &&
                               file.doChargesInvoiceUrl && !file.doChargesPaid && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleDoChargesPaid(file)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  title="Confirm DO charges payment"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  DO CHARGES PAID
                                </Button>
                              )}

                              {/* DO Charges Paid Badge */}
                              {file.doChargesPaid && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                  ✓ DO Charges Paid
                                </Badge>
                              )}

                              {/* Request Petty Cash for this file */}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => { 
                                  setSelectedFileForCash(file.id);
                                  setPettyCashDialogOpen(true);
                                }}
                                className="border-orange-300 text-orange-600 hover:bg-orange-50"
                              >
                                <DollarSign className="w-3 h-3 mr-1" />
                                Request Cash
                              </Button>
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

      {/* Shipping Details Dialog */}
      <Dialog open={shippingDetailsDialogOpen} onOpenChange={setShippingDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Shipping Documentation Details</DialogTitle>
            <DialogDescription>
              {selectedFile && `Record shipping details for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Ship className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-700">
                  Enter HBL/MBL, D.O numbers and container details. These details are automatically retrieved from documentation officer's input.
                </p>
              </div>
            </div>

            {/* NEW: BL Number Auto-Display from Documentation Officer */}
            {selectedFile && (selectedFile.blType || selectedFile.blNumber) && (
              <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-300">
                <p className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  📋 Bill of Lading (from Documentation Officer)
                </p>
                <div className="space-y-1 text-sm text-indigo-700 ml-6">
                  {selectedFile.blType && (
                    <p><strong>Type:</strong> {selectedFile.blType}</p>
                  )}
                  {selectedFile.blNumber && (
                    <p><strong>Number:</strong> {selectedFile.blNumber}</p>
                  )}
                </div>
                <p className="text-xs text-indigo-600 mt-3 ml-6 p-2 bg-indigo-100 rounded">
                  {selectedFile.blType === 'HBL' 
                    ? '💡 This is HBL (House Bill of Lading) - You can fill MBL details below if available'
                    : selectedFile.blType === 'MBL'
                    ? '✅ MBL (Master Bill of Lading) already filled - No need to enter MBL again'
                    : 'BL information retrieved from documentation'}
                </p>
              </div>
            )}

            {/* Display auto-filled data from Documentation Officer */}
            {selectedFile && (selectedFile.seaFreightType || selectedFile.blType || selectedFile.fcl20ftQuantity || selectedFile.fcl40ftQuantity || selectedFile.cargoDescription) && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-700 mb-2">📋 Auto-filled from Documentation Officer:</p>
                <div className="space-y-1 text-sm text-green-600">
                  {selectedFile.seaFreightType && (
                    <p className="font-semibold">
                      Container Type: {selectedFile.seaFreightType === 'LCL' ? 'LCL (Less than Container Load)' : 'FCL (Full Container Load)'}
                    </p>
                  )}
                  {selectedFile.blType && selectedFile.blNumber && (
                    <p>{selectedFile.blType}: {selectedFile.blNumber}</p>
                  )}
                  {selectedFile.seaFreightType === 'FCL' && (
                    <>
                      {selectedFile.fcl20ftQuantity && (
                        <p>📦 20ft Containers: {selectedFile.fcl20ftQuantity}</p>
                      )}
                      {selectedFile.fcl40ftQuantity && (
                        <p>📦 40ft Containers: {selectedFile.fcl40ftQuantity}</p>
                      )}
                      {selectedFile.fclContainerOtherDescription && (
                        <p>📦 Other: {selectedFile.fclContainerOtherDescription}</p>
                      )}
                    </>
                  )}
                  {selectedFile.cargoDescription && (
                    <p>📦 Cargo: {selectedFile.cargoDescription}</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>HBL Number (House Bill of Lading)</Label>
                <Input
                  placeholder="Enter HBL number"
                  value={shippingDetailsForm.hblNumber}
                  onChange={(e) => setShippingDetailsForm({ ...shippingDetailsForm, hblNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>MBL Number (Master Bill of Lading)</Label>
                <Input
                  placeholder="Enter MBL number"
                  value={shippingDetailsForm.mblNumber}
                  onChange={(e) => setShippingDetailsForm({ ...shippingDetailsForm, mblNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>D.O Number (Delivery Order)</Label>
                <Input
                  placeholder="Enter D.O number"
                  value={shippingDetailsForm.doNumber}
                  onChange={(e) => setShippingDetailsForm({ ...shippingDetailsForm, doNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Container Numbers</Label>
                <Input
                  placeholder="e.g., CONT123, CONT456"
                  value={shippingDetailsForm.containerNumbers}
                  onChange={(e) => setShippingDetailsForm({ ...shippingDetailsForm, containerNumbers: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShippingDetailsDialogOpen(false);
              setShippingDetailsForm({ hblNumber: '', mblNumber: '', doNumber: '', containerNumbers: '' });
            }}>
              Cancel
            </Button>
            <Button onClick={handleShippingDetailsSubmit}>
              <FileText className="w-4 h-4 mr-2" />
              Save Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ETA/ETB Dialog */}
      <Dialog open={etaEtbDialogOpen} onOpenChange={setEtaEtbDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set ETA/ETB Information</DialogTitle>
            <DialogDescription>
              {selectedFile && `Enter estimated arrival times for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
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

      {/* Delivery Order Document Dialog - Only for DO submission after payment confirmed */}
      <Dialog open={deliveryOrderDialogOpen} onOpenChange={setDeliveryOrderDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Delivery Order Document</DialogTitle>
            <DialogDescription>
              {selectedFile && `Upload the Delivery Order document for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeliveryOrderDialogOpen(false);
              setDeliveryOrderForm({ invoiceFile: null, documentFile: null });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeliveryOrderSubmit}
              disabled={!deliveryOrderForm.documentFile}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Delivery Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Petty Cash Request Dialog */}
      <Dialog open={pettyCashDialogOpen} onOpenChange={setPettyCashDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Petty Cash</DialogTitle>
            <DialogDescription>
              Create a petty cash request for shipping line operations
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <DollarSign className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-700">
                  Approval workflow: Operations Manager → COO → Finance Manager → Cashier
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>File (Optional)</Label>
              <Select
                value={selectedFileForCash || 'none'}
                onValueChange={(value) => setSelectedFileForCash(value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a file (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No file - General request</SelectItem>
                  {seaShipments.map((file) => (
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

            <div className="space-y-2">
              <Label>Amount *</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={pettyCashForm.amount}
                  onChange={(e) => setPettyCashForm({ ...pettyCashForm, amount: e.target.value })}
                  className="flex-1"
                />
                <Select
                  value={pettyCashForm.currency}
                  onValueChange={(value) => setPettyCashForm({ ...pettyCashForm, currency: value })}
                >
                  <SelectTrigger className="w-24">
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
                placeholder="Enter description of what the money will be used for..."
                value={pettyCashForm.description}
                onChange={(e) => setPettyCashForm({ ...pettyCashForm, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-700">
                {selectedFileForCash && selectedFileForCash !== 'none'
                  ? `Request will be linked to file: ${seaShipments.find(f => f.id === selectedFileForCash)?.fileNumber}`
                  : 'This will be a general petty cash request (not linked to any file)'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPettyCashDialogOpen(false);
              setPettyCashForm({ amount: '', currency: 'TZS', description: '' });
              setSelectedFileForCash('none');
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

      {/* DO Payment Request Dialog - NEW */}
      <Dialog open={doPaymentRequestDialogOpen} onOpenChange={setDoPaymentRequestDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Delivery Order Payment</DialogTitle>
            <DialogDescription>
              {selectedFileForDoPayment && `Request funds for Delivery Order payment - File ${selectedFileForDoPayment.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <DollarSign className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-purple-700">
                  Request funds for Delivery Order from shipping line. Once approved and paid by Finance, you can submit the DO document.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount *</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter DO payment amount"
                  value={doPaymentForm.amount}
                  onChange={(e) => setDoPaymentForm({ ...doPaymentForm, amount: e.target.value })}
                  className="flex-1"
                />
                <Select
                  value={doPaymentForm.currency}
                  onValueChange={(value) => setDoPaymentForm({ ...doPaymentForm, currency: value })}
                >
                  <SelectTrigger className="w-24">
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
              <Label>Invoice Upload *</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-purple-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setDoPaymentForm({ ...doPaymentForm, invoiceFile: e.target.files[0] });
                    }
                  }}
                  className="hidden"
                  id="do-payment-invoice-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                />
                <label htmlFor="do-payment-invoice-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {doPaymentForm.invoiceFile 
                      ? doPaymentForm.invoiceFile.name 
                      : 'Click to upload DO invoice'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supported: PDF, DOC, Images, Excel
                  </p>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Enter description for the DO payment request..."
                value={doPaymentForm.description}
                onChange={(e) => setDoPaymentForm({ ...doPaymentForm, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-700">
                This request will be sent to Operations Manager and Finance Manager for approval and payment processing.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDoPaymentRequestDialogOpen(false);
              setDoPaymentForm({ amount: '', currency: 'TZS', description: '', invoiceFile: null });
              setSelectedFileForDoPayment(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleDoPaymentRequest}
              disabled={!doPaymentForm.amount || !doPaymentForm.description || !doPaymentForm.invoiceFile}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Submit DO Payment Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DO Charges Upload Dialog - NEW: Phase 2 */}
      <Dialog open={doChargesDialogOpen} onOpenChange={setDoChargesDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload DO Charges Invoice</DialogTitle>
            <DialogDescription>
              {selectedFile && `Upload DO charges invoice for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Upload the invoice for DO charges (separate from DO payment). Finance will confirm payment after upload.
              </p>
            </div>

            <div className="space-y-2">
              <Label>DO Charges Invoice *</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDoChargesForm({ ...doChargesForm, invoiceFile: file });
                    }
                  }}
                  className="hidden"
                  id="do-charges-invoice-upload"
                />
                <label htmlFor="do-charges-invoice-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {doChargesForm.invoiceFile ? doChargesForm.invoiceFile.name : 'Click to upload DO charges invoice'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, JPG, or PNG (max 10MB)
                  </p>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={doChargesForm.amount}
                  onChange={(e) => setDoChargesForm({ ...doChargesForm, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency *</Label>
                <Select 
                  value={doChargesForm.currency} 
                  onValueChange={(v: string) => setDoChargesForm({ ...doChargesForm, currency: v })}
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

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-700">
                After upload, Finance Manager or Cashier will confirm payment by clicking "DO CHARGES PAID" button.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDoChargesDialogOpen(false);
              setDoChargesForm({ invoiceFile: null, amount: '', currency: 'TZS' });
              setSelectedFile(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleDoChargesUpload}
              disabled={!doChargesForm.amount || !doChargesForm.invoiceFile}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload DO Charges Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
