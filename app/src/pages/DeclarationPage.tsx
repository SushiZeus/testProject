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
  X,
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
import type { ShipmentFile, User } from '@/types';
import type { AppRoute } from '@/App';
import { mockUsers, getDeclarantWorkload } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { statusColors } from '@/utils/statusColors';

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
  const { files, assignDeclarant, updateFileStatus } = useFileStore();
  const { addNotification } = useNotificationStore();
  const { createRequest } = usePettyCashStore();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<ShipmentFile | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [acknowledgeDialogOpen, setAcknowledgeDialogOpen] = useState(false);
  const [taxUploadDialogOpen, setTaxUploadDialogOpen] = useState(false);
  const [wharfageUploadDialogOpen, setWharfageUploadDialogOpen] = useState(false);
  const [declarationDoneDialogOpen, setDeclarationDoneDialogOpen] = useState(false);
  const [pettyCashDialogOpen, setPettyCashDialogOpen] = useState(false);
  const [arrivalStatusDialogOpen, setArrivalStatusDialogOpen] = useState(false);
  const [selectedDeclarant, setSelectedDeclarant] = useState('');
  const [taxDocumentFiles, setTaxDocumentFiles] = useState<File[]>([]);
  const [wharfageDocumentFiles, setWharfageDocumentFiles] = useState<File[]>([]);
  const [arrivalDates, setArrivalDates] = useState({
    eta: '',
    etb: '',
    carryInDate: '',
    manifestComparisonDate: '',
    wharfageDate: '',
  });
  const [pettyCashForm, setPettyCashForm] = useState({
    amount: '',
    currency: 'TZS',
    description: '',
  });

  const declarants = mockUsers.filter((u: User) => u.role === 'declarant');
  const isUserExecutive = isExecutive();
  const canManipulate = canManipulateDeclarationModule();

  // Only show CLEARANCE files in declaration module
  const clearanceFiles = files.filter((file: ShipmentFile) => file.serviceType === 'CLEARANCE');

  const filteredFiles = clearanceFiles.filter((file: ShipmentFile) => {
    const matchesSearch = 
      file.fileNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.client?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'waiting') return matchesSearch && file.status === 'WAITING_FOR_DECLARATION';
    if (activeTab === 'assigned') return matchesSearch && (
      file.status === 'ASSIGNED_TO_DECLARANT' || 
      file.status === 'DECLARANT_ACKNOWLEDGED' ||
      file.status === 'WAITING_FOR_FINAL_ASSESSMENT' ||
      file.status === 'WAITING_FOR_TAX_PAYMENT'
    );
    if (activeTab === 'assessment') return matchesSearch && file.status === 'WAITING_FOR_FINAL_ASSESSMENT';
    if (activeTab === 'myfiles') {
      // Declarants can see their own files
      if (user?.role === 'declarant') {
        return matchesSearch && file.assignedDeclarantId === user?.id;
      }
      return matchesSearch && file.assignedDeclarantId === user?.id;
    }
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

  const handleTaxFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setTaxDocumentFiles([...taxDocumentFiles, ...newFiles]);
    }
  };

  const handleWharfageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setWharfageDocumentFiles([...wharfageDocumentFiles, ...newFiles]);
    }
  };

  const handleAcknowledge = () => {
    if (!selectedFile || !user) return;

    // If declarant is self-acknowledging (not assigned yet)
    const isSelfAcknowledge = !selectedFile.assignedDeclarantId && user.role === 'declarant';

    if (isSelfAcknowledge) {
      // Self-acknowledge: assign to self and notify declaration manager
      assignDeclarant(selectedFile.id, user.id, user.id);
      
      // Update status to WAITING_FOR_FINAL_ASSESSMENT (ASSESSMENT)
      updateFileStatus(
        selectedFile.id,
        'WAITING_FOR_FINAL_ASSESSMENT',
        user.id
      );
      
      // Notify declaration manager
      const declarationManager = mockUsers.find(u => u.role === 'declaration_manager');
      if (declarationManager) {
        addNotification({
          userId: declarationManager.id,
          title: 'Declarant Self-Acknowledged File',
          message: `${user.name} has acknowledged and started working on file ${selectedFile.fileNumber}`,
          type: 'info',
          fileId: selectedFile.id,
          link: '/declaration',
        });
      }

      toast.success('File acknowledged - Status updated to ASSESSMENT');
    } else {
      // Regular acknowledge (already assigned) - Update to ASSESSMENT
      updateFileStatus(
        selectedFile.id,
        'WAITING_FOR_FINAL_ASSESSMENT',
        user.id
      );

      toast.success('File acknowledged - Status updated to ASSESSMENT');
    }

    setAcknowledgeDialogOpen(false);
    setSelectedFile(null);
  };

  const handleUploadTaxDocuments = () => {
    if (!selectedFile || !user) return;

    if (taxDocumentFiles.length === 0) {
      toast.error('Please select at least one tax document to upload');
      return;
    }

    // For SEA shipments: If wharfage already uploaded, stay in WAITING_FOR_TAX_PAYMENT (both need to be paid)
    // For AIR shipments or SEA without wharfage: go to WAITING_FOR_TAX_PAYMENT
    const newStatus: any = 'WAITING_FOR_TAX_PAYMENT';

    updateFileStatus(
      selectedFile.id,
      newStatus,
      user.id,
      {
        taxDocumentUrl: URL.createObjectURL(taxDocumentFiles[0]),
        taxDocumentUploadedAt: new Date(),
      }
    );

    const statusMessage = selectedFile.transportMode === 'SEA' && selectedFile.wharfageDocumentUrl
      ? 'Tax documents uploaded - Click TAX PAID and WHARFAGE PAID to confirm payments' 
      : 'Tax documents uploaded - Click TAX PAID to confirm payment';
    
    toast.success(statusMessage);
    setTaxUploadDialogOpen(false);
    // Don't clear selectedFile - keep it selected so user can see payment buttons
    setTaxDocumentFiles([]);
  };

  const handleUploadWharfageDocuments = () => {
    if (!selectedFile || !user) return;

    if (wharfageDocumentFiles.length === 0) {
      toast.error('Please select at least one wharfage document to upload');
      return;
    }

    // For SEA shipments: If tax already uploaded, go to WAITING_FOR_WHARFAGE_PAYMENT
    // If tax not uploaded yet, stay in current status (WAITING_FOR_FINAL_ASSESSMENT)
    let newStatus: any = selectedFile.status;
    if (selectedFile.taxDocumentUrl) {
      newStatus = 'WAITING_FOR_WHARFAGE_PAYMENT';
    }

    updateFileStatus(
      selectedFile.id,
      newStatus,
      user.id,
      {
        wharfageDocumentUrl: URL.createObjectURL(wharfageDocumentFiles[0]),
        wharfageDocumentUploadedAt: new Date(),
      }
    );

    const statusMessage = newStatus === 'WAITING_FOR_WHARFAGE_PAYMENT' 
      ? 'Wharfage documents uploaded - Click WHARFAGE PAID to confirm payment'
      : 'Wharfage documents uploaded successfully';

    toast.success(statusMessage);
    setWharfageUploadDialogOpen(false);
    // Don't clear selectedFile - keep it selected so user can see payment buttons
    setWharfageDocumentFiles([]);
  };

  const handleTaxPaid = () => {
    if (!selectedFile || !user) return;

    // Mark tax as paid - status stays in WAITING_FOR_TAX_PAYMENT but with confirmation flag set
    // The Declaration Done button checks the confirmation flags, not just the status
    updateFileStatus(
      selectedFile.id,
      selectedFile.status, // Keep current status
      user.id,
      {
        taxPaymentConfirmed: true,
        taxPaymentConfirmedAt: new Date(),
      }
    );

    if (selectedFile.transportMode === 'SEA') {
      toast.success('Tax payment confirmed ✓ - Upload and confirm wharfage payment to enable Declaration Done');
    } else {
      toast.success('Tax payment confirmed ✓ - Declaration Done button is now available (GREEN)');
    }
    setSelectedFile(null);
  };

  const handleWharfagePaid = () => {
    if (!selectedFile || !user) return;

    // Mark wharfage as paid - status stays in WAITING_FOR_WHARFAGE_PAYMENT but with confirmation flag set
    updateFileStatus(
      selectedFile.id,
      selectedFile.status, // Keep current status
      user.id,
      {
        wharfagePaymentConfirmed: true,
        wharfagePaymentConfirmedAt: new Date(),
      }
    );

    toast.success('Wharfage payment confirmed ✓ - Declaration Done button is now available (GREEN)');
    setSelectedFile(null);
  };

  const handleDeleteTaxDocuments = () => {
    if (!selectedFile || !user) return;

    updateFileStatus(
      selectedFile.id,
      selectedFile.status,
      user.id,
      {
        taxDocumentUrl: undefined,
        taxDocumentUploadedAt: undefined,
        taxPaymentConfirmed: false,
        taxPaymentConfirmedAt: undefined,
      }
    );

    toast.success('Tax documents deleted - You can now reupload');
    setSelectedFile(null);
  };

  const handleDeleteWharfageDocuments = () => {
    if (!selectedFile || !user) return;

    updateFileStatus(
      selectedFile.id,
      selectedFile.status,
      user.id,
      {
        wharfageDocumentUrl: undefined,
        wharfageDocumentUploadedAt: undefined,
        wharfagePaymentConfirmed: false,
        wharfagePaymentConfirmedAt: undefined,
      }
    );

    toast.success('Wharfage documents deleted - You can now reupload');
    setSelectedFile(null);
  };

  const handleArrivalStatus = () => {
    if (!selectedFile || !user) return;

    // For SEA shipments: Allow saving other dates, but wharfage is critical
    // For AIR shipments: Allow saving other dates, but manifest comparison is critical
    
    // Update file with arrival dates (allow partial saves) - Declarant only fills carry-in, manifest, wharfage
    const updateData: any = {
      carryInDate: arrivalDates.carryInDate ? new Date(arrivalDates.carryInDate) : selectedFile.carryInDate,
      manifestComparisonDate: arrivalDates.manifestComparisonDate ? new Date(arrivalDates.manifestComparisonDate) : selectedFile.manifestComparisonDate,
    };

    if (selectedFile.transportMode === 'SEA') {
      updateData.wharfageDate = arrivalDates.wharfageDate ? new Date(arrivalDates.wharfageDate) : selectedFile.wharfageDate;
      
      // Set arrivalStatusFilled only if wharfage date is filled (critical for SEA)
      updateData.arrivalStatusFilled = !!arrivalDates.wharfageDate || !!selectedFile.wharfageDate;
    } else if (selectedFile.transportMode === 'AIR') {
      // Set arrivalStatusFilled only if manifest comparison date is filled (critical for AIR)
      updateData.arrivalStatusFilled = !!arrivalDates.manifestComparisonDate || !!selectedFile.manifestComparisonDate;
    }

    updateFileStatus(
      selectedFile.id,
      selectedFile.status, // Keep current status
      user.id,
      updateData
    );

    const criticalDateFilled = selectedFile.transportMode === 'SEA' 
      ? (arrivalDates.wharfageDate || selectedFile.wharfageDate)
      : (arrivalDates.manifestComparisonDate || selectedFile.manifestComparisonDate);

    if (criticalDateFilled) {
      toast.success('Arrival status completed - Declaration Done is now available');
    } else {
      const criticalField = selectedFile.transportMode === 'SEA' ? 'Wharfage Date' : 'Manifest Comparison Date';
      toast.info(`Arrival dates saved. Fill ${criticalField} to enable Declaration Done`);
    }

    setArrivalStatusDialogOpen(false);
    setSelectedFile(null);
    setArrivalDates({
      eta: '',
      etb: '',
      carryInDate: '',
      manifestComparisonDate: '',
      wharfageDate: '',
    });
  };

  const handleDeclarationDone = () => {
    if (!selectedFile || !user) return;

    // Check if tax payment is confirmed
    if (!selectedFile.taxPaymentConfirmed) {
      toast.error('Please confirm tax payment before marking declaration as done');
      return;
    }

    // For SEA shipments, check wharfage payment
    if (selectedFile.transportMode === 'SEA') {
      if (!selectedFile.wharfagePaymentConfirmed) {
        toast.error('Please confirm wharfage payment before marking declaration as done');
        return;
      }
    }

    // Move to READY_FOR_OPERATIONS when both tax and wharfage (if SEA) are paid
    updateFileStatus(
      selectedFile.id,
      'READY_FOR_OPERATIONS',
      user.id,
      { declarationDoneAt: new Date() }
    );

    addNotification({
      userId: '5',
      title: 'Declaration Complete - Ready for Operations',
      message: `File ${selectedFile.fileNumber} declaration complete and ready for operations assignment`,
      type: 'success',
      fileId: selectedFile.id,
      link: '/operations',
    });

    toast.success('Declaration complete - Status: READY FOR OPERATIONS');
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

  const stats = {
    // Declaration Dashboard Stats - Only count CLEARANCE files
    pendingAssignment: clearanceFiles.filter((f: ShipmentFile) => f.status === 'WAITING_FOR_DECLARATION').length,
    assigned: clearanceFiles.filter((f: ShipmentFile) => 
      f.status === 'ASSIGNED_TO_DECLARANT' || 
      f.status === 'DECLARANT_ACKNOWLEDGED' ||
      f.status === 'WAITING_FOR_FINAL_ASSESSMENT' ||
      f.status === 'WAITING_FOR_TAX_PAYMENT'
    ).length,
    assessment: clearanceFiles.filter((f: ShipmentFile) => f.status === 'WAITING_FOR_FINAL_ASSESSMENT').length,
    myFiles: user?.role === 'declarant' 
      ? clearanceFiles.filter((f: ShipmentFile) => f.assignedDeclarantId === user.id).length 
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingAssignment}</p>
                <p className="text-sm text-gray-500">Pending Assignment</p>
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

      {!canManipulate && user && user.role !== 'declarant' && (
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
                workload={getDeclarantWorkload(declarant.id, clearanceFiles)}
                onAssign={() => {
                  // Check if there are CLEARANCE files waiting for declaration
                  const waitingFiles = clearanceFiles.filter(f => f.status === 'WAITING_FOR_DECLARATION');
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
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button variant="ghost" size="sm" onClick={() => navigate('files/:id', { id: file.id })}>
                                View
                              </Button>
                              
                              {/* Declaration Manager Actions */}
                              {canManipulate && user?.role === 'declaration_manager' && file.status === 'WAITING_FOR_DECLARATION' && (
                                <>
                                  <Button size="sm" onClick={() => { setSelectedFile(file); setAssignDialogOpen(true); }}>
                                    Assign
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedFile(file); setAcknowledgeDialogOpen(true); }}>
                                    Work on File
                                  </Button>
                                </>
                              )}
                              
                              {/* Declaration Manager: Reassign if declarant hasn't acknowledged or worked on file */}
                              {canManipulate && user?.role === 'declaration_manager' && (
                                file.status === 'ASSIGNED_TO_DECLARANT' || 
                                file.status === 'DECLARANT_ACKNOWLEDGED' ||
                                file.status === 'WAITING_FOR_FINAL_ASSESSMENT'
                              ) && (
                                <Button size="sm" variant="outline" onClick={() => { setSelectedFile(file); setAssignDialogOpen(true); }}>
                                  Reassign
                                </Button>
                              )}
                              
                              {/* Declarant: Self-acknowledge unassigned files */}
                              {user?.role === 'declarant' && file.status === 'WAITING_FOR_DECLARATION' && !file.assignedDeclarantId && (
                                <Button size="sm" onClick={() => { setSelectedFile(file); setAcknowledgeDialogOpen(true); }}>
                                  Acknowledge & Work
                                </Button>
                              )}
                              
                              {/* Declarant: Acknowledge assigned files */}
                              {user?.role === 'declarant' && file.status === 'ASSIGNED_TO_DECLARANT' && file.assignedDeclarantId === user.id && (
                                <Button size="sm" onClick={() => { setSelectedFile(file); setAcknowledgeDialogOpen(true); }}>
                                  Acknowledge
                                </Button>
                              )}
                              
                              {/* Declarant & Declaration Manager: Work on acknowledged files - Assessment phase only */}
                              {(user?.role === 'declarant' || user?.role === 'declaration_manager') && 
                               file.status === 'WAITING_FOR_FINAL_ASSESSMENT' && (
                                <>
                                  {/* Only show Arrival Status button if user is the assigned declarant or declaration manager */}
                                  {(file.assignedDeclarantId === user.id || user.role === 'declaration_manager') && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className={file.arrivalStatusFilled ? 'bg-green-50 border-green-300' : ''}
                                      onClick={() => { 
                                        setSelectedFile(file); 
                                        setArrivalStatusDialogOpen(true); 
                                      }}
                                    >
                                      {file.arrivalStatusFilled ? '✓ Arrival Status' : 'Arrival Status'}
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className={file.taxDocumentUrl ? 'bg-green-50 border-green-300' : ''}
                                    onClick={() => { setSelectedFile(file); setTaxUploadDialogOpen(true); }}
                                  >
                                    <Upload className="w-3 h-3 mr-1" />
                                    {file.taxDocumentUrl ? '✓ Tax Docs' : 'Upload Tax'}
                                  </Button>
                                  {/* Wharfage upload only for SEA shipments */}
                                  {file.transportMode === 'SEA' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className={file.wharfageDocumentUrl ? 'bg-green-50 border-green-300' : ''}
                                      onClick={() => { setSelectedFile(file); setWharfageUploadDialogOpen(true); }}
                                    >
                                      <Upload className="w-3 h-3 mr-1" />
                                      {file.wharfageDocumentUrl ? '✓ Wharfage' : 'Upload Wharfage'}
                                    </Button>
                                  )}
                                </>
                              )}
                              
                              {/* Show payment buttons and status for tax and wharfage */}
                              {(user?.role === 'declarant' || user?.role === 'declaration_manager') && 
                               (file.status === 'WAITING_FOR_TAX_PAYMENT' || file.status === 'WAITING_FOR_WHARFAGE_PAYMENT') && (
                                <>
                                  {/* Only show Arrival Status button if user is the assigned declarant or declaration manager */}
                                  {(file.assignedDeclarantId === user.id || user.role === 'declaration_manager') && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className={file.arrivalStatusFilled ? 'bg-green-50 border-green-300' : ''}
                                      onClick={() => { 
                                        setSelectedFile(file); 
                                        setArrivalStatusDialogOpen(true); 
                                      }}
                                    >
                                      {file.arrivalStatusFilled ? '✓ Arrival Status' : 'Arrival Status'}
                                    </Button>
                                  )}
                                  
                                  {/* Upload buttons - Available during payment phases */}
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className={file.taxDocumentUrl ? 'bg-green-50 border-green-300' : ''}
                                    onClick={() => { setSelectedFile(file); setTaxUploadDialogOpen(true); }}
                                  >
                                    <Upload className="w-3 h-3 mr-1" />
                                    {file.taxDocumentUrl ? '✓ Tax Docs' : 'Upload Tax'}
                                  </Button>
                                  {/* Wharfage upload for SEA shipments - Always available during payment phases */}
                                  {file.transportMode === 'SEA' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className={file.wharfageDocumentUrl ? 'bg-green-50 border-green-300' : ''}
                                      onClick={() => { setSelectedFile(file); setWharfageUploadDialogOpen(true); }}
                                    >
                                      <Upload className="w-3 h-3 mr-1" />
                                      {file.wharfageDocumentUrl ? '✓ Wharfage' : 'Upload Wharfage'}
                                    </Button>
                                  )}
                                  
                                  {/* TAX PAID Button - Available when tax documents uploaded */}
                                  {file.taxDocumentUrl && !file.taxPaymentConfirmed && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => { setSelectedFile(file); handleTaxPaid(); }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <DollarSign className="w-3 h-3 mr-1" />
                                      TAX PAID
                                    </Button>
                                  )}
                                  {file.taxPaymentConfirmed && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                      ✓ Tax Paid
                                    </Badge>
                                  )}
                                  
                                  {/* WHARFAGE PAID Button (SEA only) - Available when wharfage documents uploaded */}
                                  {file.transportMode === 'SEA' && file.wharfageDocumentUrl && !file.wharfagePaymentConfirmed && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => { setSelectedFile(file); handleWharfagePaid(); }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <DollarSign className="w-3 h-3 mr-1" />
                                      WHARFAGE PAID
                                    </Button>
                                  )}
                                  {file.transportMode === 'SEA' && file.wharfagePaymentConfirmed && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                      ✓ Wharfage Paid
                                    </Badge>
                                  )}
                                </>
                              )}
                              
                              {/* Declaration Done button - Both tax and wharfage (SEA) must be paid */}
                              {(user?.role === 'declarant' || user?.role === 'declaration_manager') && 
                               (file.status === 'WAITING_FOR_TAX_PAYMENT' || file.status === 'WAITING_FOR_WHARFAGE_PAYMENT') && (
                                (() => {
                                  // For SEA: Both tax and wharfage must be paid
                                  // For AIR: Only tax must be paid
                                  const isReady = file.taxPaymentConfirmed && 
                                                  (file.transportMode === 'AIR' || file.wharfagePaymentConfirmed);
                                  return (
                                    <Button 
                                      size="sm" 
                                      onClick={() => { 
                                        if (isReady) {
                                          setSelectedFile(file); 
                                          setDeclarationDoneDialogOpen(true);
                                        }
                                      }}
                                      disabled={!isReady}
                                      title={
                                        !file.taxPaymentConfirmed ? 'Please confirm tax payment first' :
                                        (file.transportMode === 'SEA' && !file.wharfagePaymentConfirmed) ? 'Please confirm wharfage payment (SEA only)' :
                                        'Mark declaration as done'
                                      }
                                      className={cn(
                                        isReady 
                                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                                          : ''
                                      )}
                                    >
                                      Declaration Done
                                    </Button>
                                  );
                                })()
                              )}
                              
                              {/* Petty Cash button for declarants and declaration manager - Navigate with file pre-selected */}
                              {(user?.role === 'declarant' || user?.role === 'declaration_manager') && hasPermission('create_petty_cash_request') && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => navigate('petty-cash', { fileId: file.id })}
                                >
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Petty Cash
                                </Button>
                              )}
                              
                              {/* View Only badge for executives */}
                              {!canManipulate && user?.role !== 'declarant' && (
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
                    const workload = getDeclarantWorkload(declarant.id, clearanceFiles);
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
            <DialogTitle>
              {selectedFile && !selectedFile.assignedDeclarantId && user?.role === 'declarant' 
                ? 'Acknowledge & Start Working' 
                : 'Acknowledge File Receipt'}
            </DialogTitle>
            <DialogDescription>
              {selectedFile && `Acknowledge receipt of file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">
                  {selectedFile && !selectedFile.assignedDeclarantId && user?.role === 'declarant'
                    ? 'Self-Acknowledge File'
                    : 'Confirm Receipt'}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {selectedFile && !selectedFile.assignedDeclarantId && user?.role === 'declarant'
                    ? 'By acknowledging, you will be assigned to this file and the Declaration Manager will be notified. You can then begin working on the declaration process.'
                    : 'By acknowledging, you confirm that you have received this file and will begin working on the declaration process.'}
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
              {selectedFile && !selectedFile.assignedDeclarantId && user?.role === 'declarant'
                ? 'Acknowledge & Start'
                : 'Acknowledge Receipt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Tax Documents Dialog */}
      <Dialog open={taxUploadDialogOpen} onOpenChange={setTaxUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tax Documents</DialogTitle>
            <DialogDescription>
              {selectedFile && `Manage tax documents for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Show existing tax documents if uploaded */}
            {selectedFile?.taxDocumentUrl && (
              <div className="space-y-2">
                <Label>Current Tax Documents</Label>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-700">Tax documents uploaded</p>
                        <p className="text-xs text-green-600">
                          {selectedFile.taxDocumentUploadedAt && new Date(selectedFile.taxDocumentUploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDeleteTaxDocuments}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Delete & Reupload
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload section - only show if no documents uploaded */}
            {!selectedFile?.taxDocumentUrl && (
              <div className="space-y-2">
                <Label>Select Tax Documents to Upload</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleTaxFileUpload}
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
                
                {taxDocumentFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium">Selected Files ({taxDocumentFiles.length}):</p>
                    {taxDocumentFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="flex-1">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setTaxDocumentFiles(taxDocumentFiles.filter((_, i) => i !== index))}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Tax documents are required before marking TAX PAID. You can delete and reupload if needed.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setTaxUploadDialogOpen(false);
              setTaxDocumentFiles([]);
            }}>
              {selectedFile?.taxDocumentUrl ? 'Close' : 'Cancel'}
            </Button>
            {!selectedFile?.taxDocumentUrl && (
              <Button onClick={handleUploadTaxDocuments} disabled={taxDocumentFiles.length === 0}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Tax Documents
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Wharfage Documents Dialog */}
      <Dialog open={wharfageUploadDialogOpen} onOpenChange={setWharfageUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Wharfage Documents</DialogTitle>
            <DialogDescription>
              {selectedFile && `Manage wharfage documents for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Show existing wharfage documents if uploaded */}
            {selectedFile?.wharfageDocumentUrl && (
              <div className="space-y-2">
                <Label>Current Wharfage Documents</Label>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-700">Wharfage documents uploaded</p>
                        <p className="text-xs text-green-600">
                          {selectedFile.wharfageDocumentUploadedAt && new Date(selectedFile.wharfageDocumentUploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDeleteWharfageDocuments}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Delete & Reupload
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload section - only show if no documents uploaded */}
            {!selectedFile?.wharfageDocumentUrl && (
              <div className="space-y-2">
                <Label>Select Wharfage Documents to Upload</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleWharfageFileUpload}
                    className="hidden"
                    id="wharfage-file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                  />
                  <label htmlFor="wharfage-file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Click to upload wharfage documents
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Wharfage receipts, port charges, etc.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supported: PDF, DOC, Images, Excel
                    </p>
                  </label>
                </div>
                
                {wharfageDocumentFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium">Selected Files ({wharfageDocumentFiles.length}):</p>
                    {wharfageDocumentFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="flex-1">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setWharfageDocumentFiles(wharfageDocumentFiles.filter((_, i) => i !== index))}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Wharfage documents are required for SEA shipments before marking WHARFAGE PAID. You can delete and reupload if needed.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setWharfageUploadDialogOpen(false);
              setWharfageDocumentFiles([]);
            }}>
              {selectedFile?.wharfageDocumentUrl ? 'Close' : 'Cancel'}
            </Button>
            {!selectedFile?.wharfageDocumentUrl && (
              <Button onClick={handleUploadWharfageDocuments} disabled={wharfageDocumentFiles.length === 0}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Wharfage Documents
              </Button>
            )}
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

      <Dialog open={arrivalStatusDialogOpen} onOpenChange={setArrivalStatusDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Arrival Status - Declarant Fields</DialogTitle>
            <DialogDescription>
              {selectedFile && `Fill arrival dates for file ${selectedFile.fileNumber} (${selectedFile.transportMode} shipment)`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedFile && (
              <>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">
                    {selectedFile.transportMode === 'SEA' 
                      ? '🚢 SEA Shipment - Wharfage Date is CRITICAL' 
                      : '✈️ AIR Shipment - Manifest Comparison Date is CRITICAL'}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {selectedFile.transportMode === 'SEA'
                      ? 'You can save other dates, but Declaration Done requires Wharfage Date. ETA/ETB are filled by Shipping Line Clerk.'
                      : 'You can save other dates, but Declaration Done requires Manifest Comparison Date. ETA is filled by Shipping Line Clerk.'}
                  </p>
                </div>

                {/* Declarant-specific fields only */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Carry In Date</Label>
                    <Input
                      type="date"
                      value={arrivalDates.carryInDate}
                      onChange={(e) => setArrivalDates({ ...arrivalDates, carryInDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={selectedFile.transportMode === 'AIR' ? 'text-red-600 font-semibold' : ''}>
                      Manifest Comparison Date {selectedFile.transportMode === 'AIR' && '⚠️ CRITICAL'}
                    </Label>
                    <Input
                      type="date"
                      value={arrivalDates.manifestComparisonDate}
                      onChange={(e) => setArrivalDates({ ...arrivalDates, manifestComparisonDate: e.target.value })}
                      className={selectedFile.transportMode === 'AIR' ? 'border-red-300 focus:border-red-500' : ''}
                    />
                  </div>

                  {selectedFile.transportMode === 'SEA' && (
                    <div className="space-y-2">
                      <Label className="text-red-600 font-semibold">
                        Wharfage Date ⚠️ CRITICAL
                      </Label>
                      <Input
                        type="date"
                        value={arrivalDates.wharfageDate}
                        onChange={(e) => setArrivalDates({ ...arrivalDates, wharfageDate: e.target.value })}
                        className="border-red-300 focus:border-red-500"
                      />
                    </div>
                  )}
                </div>

                {/* Show ETA/ETB as read-only if already filled by shipping line clerk */}
                {(selectedFile.eta || selectedFile.etb) && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Shipping Line Information (Read-only):</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedFile.eta && (
                        <div>
                          <span className="text-gray-500">ETA:</span>
                          <p className="font-medium">{new Date(selectedFile.eta).toLocaleDateString()}</p>
                        </div>
                      )}
                      {selectedFile.etb && selectedFile.transportMode === 'SEA' && (
                        <div>
                          <span className="text-gray-500">ETB:</span>
                          <p className="font-medium">{new Date(selectedFile.etb).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedFile.arrivalStatusFilled && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">
                      ✓ Critical date filled - Declaration Done is available
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setArrivalStatusDialogOpen(false);
              setArrivalDates({
                eta: '',
                etb: '',
                carryInDate: '',
                manifestComparisonDate: '',
                wharfageDate: '',
              });
            }}>
              Cancel
            </Button>
            <Button onClick={handleArrivalStatus}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Arrival Dates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
