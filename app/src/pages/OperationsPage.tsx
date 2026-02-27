import { useState } from 'react';
import {
  CheckCircle,
  DollarSign,
  Package,
  ClipboardCheck,
  CreditCard,
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
import type { ShipmentFile, FileStatus, User } from '@/types';
import type { AppRoute } from '@/App';
import { mockUsers, getOperationClerkWorkload } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const { files, assignOperationClerk } = useFileStore();
  const { createRequest } = usePettyCashStore();
  const { addNotification } = useNotificationStore();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedFile, setSelectedFile] = useState<ShipmentFile | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [pettyCashDialogOpen, setPettyCashDialogOpen] = useState(false);
  const [selectedClerk, setSelectedClerk] = useState('');

  const [pettyCashForm, setPettyCashForm] = useState({
    amount: '',
    currency: 'TZS',
    description: '',
  });

  const operationClerks = mockUsers.filter((u: User) => u.role === 'operation_clerk');
  const isUserExecutive = isExecutive();
  const canManipulate = canManipulateOperationsModule();

  const operationFiles = files.filter((f: ShipmentFile) => 
    f.status === 'READY_FOR_OPERATIONS' ||
    f.status === 'RECEIVED_BY_CLERK' ||
    f.status === 'WAITING_FOR_PAYMENTS' ||
    f.status === 'WAITING_FOR_SWISSPORT_PAYMENTS' ||
    f.status === 'SWISSPORT_CHARGES_PAID' ||
    f.status === 'DRIVER_REQUESTED' ||
    f.status === 'DRIVER_ASSIGNED' ||
    f.status === 'DRIVER_COLLECTING_CARGO' ||
    f.status === 'CARGO_COLLECTED_FROM_AIRPORT'
  );

  const filteredFiles = operationFiles.filter((file: ShipmentFile) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'ready') return file.status === 'READY_FOR_OPERATIONS';
    if (activeTab === 'permits') return file.status === 'WAITING_FOR_PAYMENTS';
    if (activeTab === 'swissport') return file.status === 'WAITING_FOR_SWISSPORT_PAYMENTS';
    if (activeTab === 'delivery') return file.status === 'SWISSPORT_CHARGES_PAID';
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

  const statusColors: Record<FileStatus, string> = {
    WAITING_FOR_DECLARATION: 'bg-amber-100 text-amber-700',
    ASSIGNED_TO_DECLARANT: 'bg-blue-100 text-blue-700',
    DECLARANT_ACKNOWLEDGED: 'bg-green-100 text-green-700',
    WAITING_FOR_FINAL_ASSESSMENT: 'bg-purple-100 text-purple-700',
    DECLARATION_DONE: 'bg-green-100 text-green-700',
    WAITING_FOR_TAX_PAYMENT: 'bg-amber-100 text-amber-700',
    TAXES_PAID: 'bg-green-100 text-green-700',
    READY_FOR_OPERATIONS: 'bg-blue-100 text-blue-700',
    RECEIVED_BY_CLERK: 'bg-blue-100 text-blue-700',
    CLERK_WORKING_ON_FILE: 'bg-blue-100 text-blue-700',
    SHIPMENT_UNDER_VERIFICATION: 'bg-purple-100 text-purple-700',
    WAITING_FOR_PERMIT_PAYMENTS: 'bg-amber-100 text-amber-700',
    PERMIT_PAYMENTS_DONE: 'bg-green-100 text-green-700',
    RELEASE_ORDER_UPLOADED: 'bg-green-100 text-green-700',
    PROCESSING_DELIVERY_ORDER: 'bg-blue-100 text-blue-700',
    WAITING_FOR_DO_PAYMENT: 'bg-amber-100 text-amber-700',
    DELIVERY_ORDER_PAYMENTS_DONE: 'bg-green-100 text-green-700',
    DELIVERY_ORDER_READY: 'bg-green-100 text-green-700',
    WAITING_FOR_PORT_CHARGES: 'bg-amber-100 text-amber-700',
    WAITING_FOR_PORT_PAYMENT: 'bg-amber-100 text-amber-700',
    PORT_CHARGES_PAID: 'bg-green-100 text-green-700',
    DELIVERY_ORDER_COLLECTED: 'bg-blue-100 text-blue-700',
    WAITING_FOR_PAYMENTS: 'bg-amber-100 text-amber-700',
    WAITING_FOR_SWISSPORT_PAYMENTS: 'bg-amber-100 text-amber-700',
    SWISSPORT_CHARGES_PAID: 'bg-green-100 text-green-700',
    DRIVER_REQUESTED: 'bg-blue-100 text-blue-700',
    DRIVER_ASSIGNED: 'bg-blue-100 text-blue-700',
    DRIVER_COLLECTING_CARGO: 'bg-purple-100 text-purple-700',
    CARGO_COLLECTED_FROM_ICD: 'bg-green-100 text-green-700',
    CARGO_COLLECTED_FROM_AIRPORT: 'bg-green-100 text-green-700',
    DELIVERED_TO_CLIENT: 'bg-green-100 text-green-700',
    SHIPMENT_AT_WAREHOUSE: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const stats = {
    ready: files.filter((f: ShipmentFile) => f.status === 'READY_FOR_OPERATIONS').length,
    permits: files.filter((f: ShipmentFile) => f.status === 'WAITING_FOR_PAYMENTS').length,
    swissport: files.filter((f: ShipmentFile) => f.status === 'WAITING_FOR_SWISSPORT_PAYMENTS').length,
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
              <Button onClick={() => setPettyCashDialogOpen(true)}>
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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ready}</p>
                <p className="text-sm text-gray-500">Ready for Ops</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.permits}</p>
                <p className="text-sm text-gray-500">Permits Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.swissport}</p>
                <p className="text-sm text-gray-500">Swissport Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {user?.role === 'operation_clerk' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
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

      {!canManipulate && user && (
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
                            <div className="flex items-center gap-2">
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
                              {!canManipulate && (
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
                onValueChange={(id) => {
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
                  onValueChange={(v) => setPettyCashForm({ ...pettyCashForm, currency: v })}
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
                  onValueChange={(fileId) => {
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
    </div>
  );
}
