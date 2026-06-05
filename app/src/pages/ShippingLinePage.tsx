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
  const [selectedFileForCash, setSelectedFileForCash] = useState<string>('none');
  const [pettyCashForm, setPettyCashForm] = useState({
    amount: '',
    currency: 'TZS',
    description: '',
  });

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
    if (activeTab === 'waiting_do') return file.status === 'PERMITS_DONE' && !file.deliveryOrderInvoiceUrl;
    if (activeTab === 'processing_do') return file.status === 'WAITING_FOR_DO_PAYMENT' || file.status === 'DELIVERY_ORDER_PAYMENTS_DONE';
    return true;
  });

  const stats = {
    totalSea: seaShipments.length,
    imports: seaShipments.filter(f => f.shipmentType === 'IMPORT').length,
    exports: seaShipments.filter(f => f.shipmentType === 'EXPORT').length,
    waitingDO: seaShipments.filter(f => f.status === 'PERMITS_DONE' && !f.deliveryOrderInvoiceUrl).length,
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

  const handleDeliveryOrderInvoiceUpload = () => {
    if (!selectedFile || !user) return;

    if (!deliveryOrderForm.invoiceFile) {
      toast.error('Please select an invoice file to upload');
      return;
    }

    updateFileStatus(
      selectedFile.id,
      'WAITING_FOR_DO_PAYMENT',
      user.id,
      {
        deliveryOrderInvoiceUrl: URL.createObjectURL(deliveryOrderForm.invoiceFile),
        assignedShippingLineClerkId: user.id,
      }
    );

    addNotification({
      userId: '11',
      title: 'Delivery Order Payment Required',
      message: `Delivery order invoice uploaded for file ${selectedFile.fileNumber}`,
      type: 'info',
      fileId: selectedFile.id,
      link: '/shipping-line',
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

    updateFileStatus(
      selectedFile.id,
      'DELIVERY_ORDER_SUBMITTED',
      user.id,
      {
        deliveryOrderDocumentUrl: URL.createObjectURL(deliveryOrderForm.documentFile),
        deliveryOrderSubmittedAt: new Date(),
      }
    );

    addNotification({
      userId: '5',
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
        <TabsList className="grid grid-cols-5">
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

                              {/* Upload DO Invoice */}
                              {file.status === 'PERMITS_DONE' && !file.deliveryOrderInvoiceUrl && (
                                <Button 
                                  size="sm" 
                                  onClick={() => { setSelectedFile(file); setDeliveryOrderDialogOpen(true); }}
                                >
                                  <Upload className="w-3 h-3 mr-1" />
                                  Upload D.O Invoice
                                </Button>
                              )}

                              {/* Waiting for Payment Badge */}
                              {file.status === 'WAITING_FOR_DO_PAYMENT' && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                                  Waiting Payment
                                </Badge>
                              )}

                              {/* Submit Delivery Order */}
                              {file.status === 'DELIVERY_ORDER_PAYMENTS_DONE' && !file.deliveryOrderSubmittedAt && (
                                <Button 
                                  size="sm" 
                                  onClick={() => { setSelectedFile(file); setDeliveryOrderDialogOpen(true); }}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Submit D.O
                                </Button>
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

            <div className="grid grid-cols-2 gap-4">
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

      {/* Delivery Order Dialog */}
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
    </div>
  );
}
