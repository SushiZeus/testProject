import { useState } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Search,
  Filter,
  UserCheck,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { useFileStore } from '@/store/fileStore';
import { useNotificationStore } from '@/store/notificationStore';
import { usePettyCashStore } from '@/store/pettyCashStore';
import type { ShipmentFile, FileStatus, User } from '@/types';
import type { AppRoute } from '@/App';
import { mockUsers, getDeclarantWorkload } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WorkloadCardProps {
  declarant: User;
  workload: {
    totalAssigned: number;
    inProgress: number;
    waitingAssessment: number;
  };
  onAssign: () => void;
}

function WorkloadCard({ declarant, workload, onAssign }: WorkloadCardProps) {
  const { canManipulateDeclarationModule } = useAuthStore();
  const capacity = 10;
  const utilization = (workload.totalAssigned / capacity) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">
                {declarant.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-semibold">{declarant.name}</p>
              <p className="text-sm text-gray-500">{declarant.email}</p>
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
              <p className="text-lg font-bold text-amber-600">{workload.waitingAssessment}</p>
              <p className="text-xs text-gray-500">Waiting</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={onAssign} 
          variant="outline" 
          className="w-full mt-4"
          disabled={!canManipulateDeclarationModule()}
        >
          {canManipulateDeclarationModule() ? 'Assign File' : 'View Only'}
        </Button>
      </CardContent>
    </Card>
  );
}

interface DeclarationPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function DeclarationPage({ navigate }: DeclarationPageProps) {
  const { user, hasPermission, isExecutive, canManipulateDeclarationModule } = useAuthStore();
  const { files, assignDeclarant, updateFileStatus, addDocument } = useFileStore();
  const { addNotification } = useNotificationStore();
  const { createRequest } = usePettyCashStore();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<ShipmentFile | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [acknowledgeDialogOpen, setAcknowledgeDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [declarationDoneDialogOpen, setDeclarationDoneDialogOpen] = useState(false);
  const [pettyCashDialogOpen, setPettyCashDialogOpen] = useState(false);
  const [selectedDeclarant, setSelectedDeclarant] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [pettyCashForm, setPettyCashForm] = useState({
    amount: '',
    currency: 'TZS',
    description: '',
  });

  const declarants = mockUsers.filter((u: User) => u.role === 'declarant');
  const isUserExecutive = isExecutive();
  const canManipulate = canManipulateDeclarationModule();

  const filteredFiles = files.filter((file: ShipmentFile) => {
    const matchesSearch = 
      file.fileNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.client?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'waiting') return matchesSearch && file.status === 'WAITING_FOR_DECLARATION';
    if (activeTab === 'assigned') return matchesSearch && (file.status === 'ASSIGNED_TO_DECLARANT' || file.status === 'DECLARANT_ACKNOWLEDGED');
    if (activeTab === 'assessment') return matchesSearch && file.status === 'WAITING_FOR_FINAL_ASSESSMENT';
    if (activeTab === 'myfiles') return matchesSearch && file.assignedDeclarantId === user?.id;
    return matchesSearch;
  });

  const handleAssign = () => {
    if (!selectedDeclarant || !user) return;

    // If no file is selected, show error
    if (!selectedFile) {
      toast.error('Please select a file to assign');
      return;
    }

    assignDeclarant(selectedFile.id, selectedDeclarant, user.id);
    
    addNotification({
      userId: selectedDeclarant,
      title: 'File Assigned',
      message: `File ${selectedFile.fileNumber} has been assigned to you`,
      type: 'info',
      fileId: selectedFile.id,
      link: '/declaration',
    });

    toast.success('Declarant assigned successfully');
    setAssignDialogOpen(false);
    setSelectedFile(null);
    setSelectedDeclarant('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleAcknowledge = () => {
    if (!selectedFile || !user) return;

    updateFileStatus(
      selectedFile.id,
      'DECLARANT_ACKNOWLEDGED',
      user.id
    );

    toast.success('File acknowledged - You can now work on this file');
    setAcknowledgeDialogOpen(false);
    setSelectedFile(null);
  };

  const handleUploadDocuments = () => {
    if (!selectedFile || !user) return;

    if (uploadedFiles.length === 0) {
      toast.error('Please select at least one document to upload');
      return;
    }

    // Add uploaded documents to the file
    uploadedFiles.forEach((file) => {
      const document = {
        id: Math.random().toString(36).substr(2, 9),
        fileId: selectedFile.id,
        documentType: 'other' as const,
        documentName: file.name,
        fileUrl: URL.createObjectURL(file),
        uploadedBy: user.id,
        uploadedAt: new Date(),
      };
      addDocument(selectedFile.id, document);
    });

    toast.success(`${uploadedFiles.length} document(s) uploaded successfully - Available to all users`);
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadedFiles([]);
  };

  const handleDeclarationDone = () => {
    if (!selectedFile || !user) return;

    // Move to READY_FOR_OPERATIONS
    updateFileStatus(
      selectedFile.id,
      'READY_FOR_OPERATIONS',
      user.id,
      { declarationDoneAt: new Date() }
    );

    addNotification({
      userId: '5',
      title: 'Declaration Complete - Ready for Operations',
      message: `File ${selectedFile.fileNumber} declaration is complete and ready for operations assignment`,
      type: 'success',
      fileId: selectedFile.id,
      link: '/operations',
    });

    toast.success('Declaration marked as complete - File moved to Operations Department');
    setDeclarationDoneDialogOpen(false);
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
    DELIVERY_ORDER_COLLECTED: 'bg-blue-100 text-blue-700',
    WAITING_FOR_PORT_CHARGES: 'bg-amber-100 text-amber-700',
    WAITING_FOR_PORT_PAYMENT: 'bg-amber-100 text-amber-700',
    PORT_CHARGES_PAID: 'bg-green-100 text-green-700',
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
    waiting: files.filter((f: ShipmentFile) => f.status === 'WAITING_FOR_DECLARATION').length,
    assigned: files.filter((f: ShipmentFile) => f.status === 'ASSIGNED_TO_DECLARANT' || f.status === 'DECLARANT_ACKNOWLEDGED').length,
    assessment: files.filter((f: ShipmentFile) => f.status === 'WAITING_FOR_FINAL_ASSESSMENT').length,
    myFiles: user?.role === 'declarant' 
      ? files.filter((f: ShipmentFile) => f.assignedDeclarantId === user.id).length 
      : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Declaration Department</h1>
          <p className="text-gray-500 mt-1">
            Manage file assignments and process declarations
          </p>
        </div>
        {hasPermission('create_petty_cash_request') && (
          <Button onClick={() => setPettyCashDialogOpen(true)}>
            <DollarSign className="w-4 h-4 mr-2" />
            Request Petty Cash
          </Button>
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
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.assigned}</p>
                <p className="text-sm text-gray-500">Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.assessment}</p>
                <p className="text-sm text-gray-500">Assessment</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {user?.role === 'declarant' && (
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
                <UserCheck className="w-4 h-4 text-slate-800" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  {isUserExecutive ? 'Executive View' : 'View-Only Access'} - Declaration Department
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  You have read-only access to view declaration statistics and file data. 
                  Only the Declaration Manager can assign declarants, process declarations, and perform operational tasks. 
                  You can view all files and add comments to file timelines.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user?.role === 'declaration_manager' && canManipulate && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Declarant Workload</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {declarants.map((declarant: User) => (
              <WorkloadCard
                key={declarant.id}
                declarant={declarant}
                workload={getDeclarantWorkload(declarant.id, files)}
                onAssign={() => {
                  // Check if there are files waiting for declaration
                  const waitingFiles = files.filter(f => f.status === 'WAITING_FOR_DECLARATION');
                  if (waitingFiles.length === 0) {
                    toast.error('No files waiting for declaration assignment');
                    return;
                  }
                  // If there's only one file, auto-select it
                  if (waitingFiles.length === 1) {
                    setSelectedFile(waitingFiles[0]);
                  }
                  setSelectedDeclarant(declarant.id);
                  setAssignDialogOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Shipment Files</CardTitle>
              <CardDescription>Manage and process declaration files</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="waiting">Waiting</TabsTrigger>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              {user?.role === 'declarant' && (
                <TabsTrigger value="myfiles">My Files</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">File Number</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Client</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Assigned To</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No files found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredFiles.map((file: ShipmentFile) => (
                        <tr key={file.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-mono font-medium text-blue-600">{file.fileNumber}</p>
                              <p className="text-sm text-gray-500">{file.shipmentType}</p>
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
                            {file.assignedDeclarant ? (
                              <span className="text-sm">{file.assignedDeclarant.name}</span>
                            ) : (
                              <span className="text-sm text-gray-400">Not assigned</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => navigate('files/:id', { id: file.id })}>
                                View
                              </Button>
                              {canManipulate && user?.role === 'declaration_manager' && file.status === 'WAITING_FOR_DECLARATION' && (
                                <Button size="sm" onClick={() => { setSelectedFile(file); setAssignDialogOpen(true); }}>
                                  Assign
                                </Button>
                              )}
                              {canManipulate && user?.role === 'declarant' && file.status === 'ASSIGNED_TO_DECLARANT' && (
                                <Button size="sm" onClick={() => { setSelectedFile(file); setAcknowledgeDialogOpen(true); }}>
                                  Acknowledge
                                </Button>
                              )}
                              {canManipulate && user?.role === 'declarant' && file.status === 'DECLARANT_ACKNOWLEDGED' && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedFile(file); setUploadDialogOpen(true); }}>
                                    Upload Docs
                                  </Button>
                                  <Button size="sm" onClick={() => { setSelectedFile(file); setDeclarationDoneDialogOpen(true); }}>
                                    Declaration Done
                                  </Button>
                                </>
                              )}
                              {hasPermission('create_petty_cash_request') && (
                                <Button size="sm" variant="outline" onClick={() => { setSelectedFile(file); setPettyCashDialogOpen(true); }}>
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Petty Cash
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Declarant</DialogTitle>
            <DialogDescription>
              {selectedFile && `Assign a declarant to file ${selectedFile.fileNumber}`}
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
                      .filter(f => f.status === 'WAITING_FOR_DECLARATION')
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
              <Label>Select Declarant</Label>
              <Select value={selectedDeclarant} onValueChange={setSelectedDeclarant}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a declarant" />
                </SelectTrigger>
                <SelectContent>
                  {declarants.map((declarant: User) => {
                    const workload = getDeclarantWorkload(declarant.id, files);
                    return (
                      <SelectItem key={declarant.id} value={declarant.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{declarant.name}</span>
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
            <Button onClick={handleAssign} disabled={!selectedDeclarant || !selectedFile}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={acknowledgeDialogOpen} onOpenChange={setAcknowledgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge File Receipt</DialogTitle>
            <DialogDescription>
              {selectedFile && `Acknowledge receipt of file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Confirm Receipt</p>
                <p className="text-sm text-blue-700 mt-1">
                  By acknowledging, you confirm that you have received this file and will begin working on the declaration process.
                </p>
              </div>
            </div>

            {selectedFile && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
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
                    <span className="text-gray-500">Shipment Type:</span>
                    <p>{selectedFile.shipmentType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Transport Mode:</span>
                    <p>{selectedFile.transportMode}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAcknowledgeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcknowledge}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Acknowledge Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Tax Documents</DialogTitle>
            <DialogDescription>
              {selectedFile && `Upload tax and customs documents for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Documents to Upload</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="tax-file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                />
                <label htmlFor="tax-file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Click to upload tax documents
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tax assessment, customs declaration, invoices, etc.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supported: PDF, DOC, Images, Excel
                  </p>
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium">Selected Files ({uploadedFiles.length}):</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="flex-1">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                All uploaded documents will be accessible to all users in their respective modules for download.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUploadDialogOpen(false);
              setUploadedFiles([]);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUploadDocuments}
              disabled={uploadedFiles.length === 0}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={declarationDoneDialogOpen} onOpenChange={setDeclarationDoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Declaration as Done</DialogTitle>
            <DialogDescription>
              {selectedFile && `Complete declaration for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Declaration Complete</p>
                <p className="text-sm text-green-700 mt-1">
                  By clicking "Declaration Done", you confirm that all declaration work is complete and the file is ready to move to the Operations Department.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Make sure you have uploaded all necessary tax documents before marking as done.
              </p>
            </div>

            {selectedFile && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">File Summary:</p>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-500">File:</span> <span className="font-mono">{selectedFile.fileNumber}</span></p>
                  <p><span className="text-gray-500">Client:</span> {selectedFile.client?.name}</p>
                  <p><span className="text-gray-500">Documents:</span> {selectedFile.documents.length} uploaded</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclarationDoneDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeclarationDone}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Declaration Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pettyCashDialogOpen} onOpenChange={setPettyCashDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Petty Cash</DialogTitle>
            <DialogDescription>
              Create a petty cash request with or without a file
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>File (Optional)</Label>
              <Select
                value={selectedFile ? selectedFile.id : ''}
                onValueChange={(value) => {
                  const file = files.find(f => f.id === value);
                  setSelectedFile(file || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a file (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No file - General request</SelectItem>
                  {files.map((file) => (
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
    </div>
  );
}
