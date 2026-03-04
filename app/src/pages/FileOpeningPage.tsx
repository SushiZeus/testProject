import { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  X,
  Check,
  Search,
  Plane,
  Ship,
  Truck,
  Train,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { useFileStore } from '@/store/fileStore';
import { useNotificationStore } from '@/store/notificationStore';
import { usePettyCashStore } from '@/store/pettyCashStore';
import type { 
  ShipmentType, TransportMode, DocumentType, Client 
} from '@/types';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'commercial_invoice', label: 'Commercial Invoice' },
  { value: 'packing_list', label: 'Packing List' },
  { value: 'bill_of_lading', label: 'Bill of Lading' },
  { value: 'airway_bill', label: 'Airway Bill' },
  { value: 'road_consignment_note', label: 'Road Consignment Note' },
  { value: 'coc', label: 'Certificate of Conformity (COC)' },
  { value: 'coo', label: 'Certificate of Origin (COO)' },
  { value: 'other', label: 'Other Document' },
];

const transportModes: { value: TransportMode; label: string; icon: React.ElementType }[] = [
  { value: 'AIR', label: 'Air Freight', icon: Plane },
  { value: 'SEA', label: 'Sea Freight', icon: Ship },
  { value: 'ROAD', label: 'Road Transport', icon: Truck },
  { value: 'RAIL', label: 'Rail Transport', icon: Train },
];

interface FileOpeningPageProps {
  navigate: (route: AppRoute) => void;
}

export function FileOpeningPage({ navigate }: FileOpeningPageProps) {
  const { user, hasPermission } = useAuthStore();
  const { createFile, clients, addClient, files } = useFileStore();
  const { addNotification } = useNotificationStore();
  const { createRequest } = usePettyCashStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdFile, setCreatedFile] = useState<{ fileNumber: string } | null>(null);
  const [pettyCashDialogOpen, setPettyCashDialogOpen] = useState(false);
  const [selectedFileForCash, setSelectedFileForCash] = useState<string>('');
  const [pettyCashForm, setPettyCashForm] = useState({
    amount: '',
    currency: 'TZS',
    description: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  // Client state
  const [clientType, setClientType] = useState<'new' | 'existing'>('existing');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [newClient, setNewClient] = useState({
    name: '',
    mobile: '',
    email: '',
    tin: '',
  });

  // Shipment state
  const [shipmentType, setShipmentType] = useState<ShipmentType>('IMPORT');
  const [transportMode, setTransportMode] = useState<TransportMode>('AIR');

  // Documents state
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentType[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<DocumentType, File[]>>({} as Record<DocumentType, File[]>);

  const fileInputRefs = useRef<Record<DocumentType, HTMLInputElement | null>>({} as Record<DocumentType, HTMLInputElement | null>);

  const handleDocumentToggle = (docType: DocumentType) => {
    setSelectedDocuments(prev =>
      prev.includes(docType)
        ? prev.filter(d => d !== docType)
        : [...prev, docType]
    );
  };

  const handleFileUpload = (docType: DocumentType, files: FileList | null) => {
    if (!files) return;
    
    const pdfFiles = Array.from(files).filter(f => f.type === 'application/pdf');
    if (pdfFiles.length !== files.length) {
      toast.error('Only PDF files are allowed');
    }
    
    setUploadedFiles(prev => ({
      ...prev,
      [docType]: [...(prev[docType] || []), ...pdfFiles],
    }));
    
    // Clear validation error for this document type
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[docType];
      return newErrors;
    });
  };

  const removeUploadedFile = (docType: DocumentType, index: number) => {
    setUploadedFiles(prev => ({
      ...prev,
      [docType]: prev[docType]?.filter((_, i) => i !== index) || [],
    }));
  };

  const validateStep = () => {
    const errors: Record<string, boolean> = {};
    
    switch (step) {
      case 1:
        if (clientType === 'existing') {
          if (!selectedClient) {
            errors.selectedClient = true;
            toast.error('Please select a client');
            setValidationErrors(errors);
            return false;
          }
        } else {
          if (!newClient.name) errors.clientName = true;
          if (!newClient.mobile) errors.clientMobile = true;
          if (!newClient.tin) errors.clientTin = true;
          
          if (Object.keys(errors).length > 0) {
            toast.error('Please fill in all required client fields (highlighted in red)');
            setValidationErrors(errors);
            return false;
          }
        }
        setValidationErrors({});
        return true;
      case 2:
        // Documents are now optional - no validation needed
        setValidationErrors({});
        return true;
      case 3:
        // Only validate if documents were selected
        if (selectedDocuments.length > 0) {
          for (const docType of selectedDocuments) {
            if (!uploadedFiles[docType] || uploadedFiles[docType].length === 0) {
              errors[docType] = true;
            }
          }
          
          if (Object.keys(errors).length > 0) {
            toast.error(`Please upload all selected documents (highlighted in red)`);
            setValidationErrors(errors);
            return false;
          }
        }
        setValidationErrors({});
        return true;
      default:
        setValidationErrors({});
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!user) return;

    setIsSubmitting(true);

    try {
      let client: Client | undefined;
      let clientId: string | undefined;

      if (clientType === 'new') {
        const newClientData = addClient({
          name: newClient.name,
          mobile: newClient.mobile,
          email: newClient.email || undefined,
          tin: newClient.tin,
        });
        client = newClientData;
        clientId = newClientData.id;
      } else {
        clientId = selectedClient;
        client = clients.find((c: Client) => c.id === selectedClient);
      }

      const documents = selectedDocuments.flatMap(docType =>
        (uploadedFiles[docType] || []).map(file => ({
          type: docType,
          name: file.name,
          url: URL.createObjectURL(file),
        }))
      );

      const file = createFile({
        clientId,
        client,
        shipmentType,
        transportMode,
        documents,
        createdBy: user.id,
      });

      setCreatedFile(file);

      // Notify declaration manager
      addNotification({
        userId: '2', // Declaration manager ID
        title: 'New File Waiting',
        message: `File ${file.fileNumber} is waiting for declaration assignment`,
        type: 'info',
        fileId: file.id,
        link: '/declaration',
      });

      toast.success('File created successfully!');
      setStep(4);
    } catch (error) {
      toast.error('Failed to create file. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      fileId: selectedFileForCash || undefined,
      requestedBy: user.id,
      amount,
      currency: pettyCashForm.currency,
      description: pettyCashForm.description,
    });

    addNotification({
      userId: '5',
      title: 'New Petty Cash Request',
      message: `Request for ${pettyCashForm.currency} ${amount.toLocaleString()} ${selectedFileForCash ? `on file ${files.find(f => f.id === selectedFileForCash)?.fileNumber}` : '(General Request)'}`,
      type: 'info',
      link: '/petty-cash',
    });

    toast.success('Petty cash request submitted successfully');
    setPettyCashDialogOpen(false);
    setPettyCashForm({ amount: '', currency: 'TZS', description: '' });
    setSelectedFileForCash('');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Client Type Selection */}
      <div>
        <Label className="text-base font-medium">Client Type</Label>
        <RadioGroup
          value={clientType}
          onValueChange={(v) => setClientType(v as 'new' | 'existing')}
          className="flex gap-4 mt-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="existing" id="existing" />
            <Label htmlFor="existing" className="cursor-pointer">Existing Client</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="new" />
            <Label htmlFor="new" className="cursor-pointer">New Client</Label>
          </div>
        </RadioGroup>
      </div>

      {clientType === 'existing' ? (
        <div className="space-y-2">
          <Label htmlFor="client">Select Client *</Label>
          <Select value={selectedClient} onValueChange={(v) => { setSelectedClient(v); setValidationErrors({}); }}>
            <SelectTrigger className={cn("h-12", validationErrors.selectedClient && "border-red-500 border-2")}>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <SelectValue placeholder="Search and select client" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {clients.map((client: Client) => (
                <SelectItem key={client.id} value={client.id}>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-xs text-gray-500">TIN: {client.tin}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.selectedClient && (
            <p className="text-sm text-red-500">Please select a client</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                placeholder="Enter client name"
                value={newClient.name}
                onChange={(e) => { setNewClient({ ...newClient, name: e.target.value }); setValidationErrors({}); }}
                className={cn("h-12", validationErrors.clientName && "border-red-500 border-2")}
              />
              {validationErrors.clientName && (
                <p className="text-sm text-red-500">Client name is required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                placeholder="+255 XXX XXX XXX"
                value={newClient.mobile}
                onChange={(e) => { setNewClient({ ...newClient, mobile: e.target.value }); setValidationErrors({}); }}
                className={cn("h-12", validationErrors.clientMobile && "border-red-500 border-2")}
              />
              {validationErrors.clientMobile && (
                <p className="text-sm text-red-500">Mobile number is required</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tin">TIN Number *</Label>
              <Input
                id="tin"
                placeholder="XXX-XXX-XXX"
                value={newClient.tin}
                onChange={(e) => { setNewClient({ ...newClient, tin: e.target.value }); setValidationErrors({}); }}
                className={cn("h-12", validationErrors.clientTin && "border-red-500 border-2")}
              />
              {validationErrors.clientTin && (
                <p className="text-sm text-red-500">TIN number is required</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Shipment Type */}
      <div>
        <Label className="text-base font-medium">Shipment Type</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {(['IMPORT', 'EXPORT', 'TRANSSHIPMENT', 'TRANSIT'] as ShipmentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setShipmentType(type)}
              className={cn(
                'p-4 rounded-lg border-2 text-center transition-all duration-200',
                shipmentType === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <FileText className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Transport Mode */}
      <div>
        <Label className="text-base font-medium">Mode of Transport</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {transportModes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTransportMode(value)}
              className={cn(
                'p-4 rounded-lg border-2 text-center transition-all duration-200',
                transportMode === value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Select Documents</Label>
        <p className="text-sm text-gray-500 mt-1">
          Choose the shipping documents that need to be uploaded
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {documentTypes.map(({ value, label }) => (
            <div
              key={value}
              onClick={() => handleDocumentToggle(value)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
                selectedDocuments.includes(value)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <input
                type="checkbox"
                checked={selectedDocuments.includes(value)}
                onChange={() => handleDocumentToggle(value)}
                className="w-4 h-4"
              />
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Upload Documents</Label>
        <p className="text-sm text-gray-500 mt-1">
          Upload PDF files for each selected document type
        </p>
        <div className="space-y-4 mt-4">
          {selectedDocuments.map((docType) => {
            const docInfo = documentTypes.find(d => d.value === docType);
            const files = uploadedFiles[docType] || [];
            
            return (
              <Card key={docType} className={cn("border-2", validationErrors[docType] && "border-red-500")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{docInfo?.label}</span>
                      {validationErrors[docType] && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <Badge variant={files.length > 0 ? 'default' : 'secondary'}>
                      {files.length} file(s)
                    </Badge>
                  </div>
                  
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    ref={(el) => { fileInputRefs.current[docType] = el; }}
                    onChange={(e) => handleFileUpload(docType, e.target.files)}
                    className="hidden"
                  />
                  
                  {files.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm truncate max-w-xs">{file.name}</span>
                            <span className="text-xs text-gray-400">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            onClick={() => removeUploadedFile(docType, index)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRefs.current[docType]?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {files.length > 0 ? 'Upload More' : 'Upload Files'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FileCheck className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        File Created Successfully!
      </h2>
      <p className="text-gray-500 mb-6">
        The file has been created and is now waiting for declaration.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-6">
        <p className="text-sm text-gray-500 mb-2">File Number</p>
        <p className="text-3xl font-mono font-bold text-blue-600">
          {createdFile?.fileNumber}
        </p>
        <Badge className="mt-4 bg-amber-100 text-amber-700 hover:bg-amber-100">
          WAITING FOR DECLARATION
        </Badge>
      </div>

      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={() => navigate('dashboard')}>
          Go to Dashboard
        </Button>
        <Button onClick={() => {
          setStep(1);
          setCreatedFile(null);
          setSelectedClient('');
          setNewClient({ name: '', mobile: '', email: '', tin: '' });
          setSelectedDocuments([]);
          setUploadedFiles({} as Record<DocumentType, File[]>);
        }}>
          Create Another File
        </Button>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Client & Shipment', description: 'Enter client and shipment details' },
    { number: 2, title: 'Select Documents', description: 'Choose required documents' },
    { number: 3, title: 'Upload Documents', description: 'Upload PDF files' },
    { number: 4, title: 'Confirmation', description: 'File creation complete' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">File Opening</h1>
          <p className="text-gray-500 mt-1">
            Create a new shipment file and upload required documents
          </p>
        </div>
        {hasPermission('create_petty_cash_request') && (
          <Button onClick={() => setPettyCashDialogOpen(true)}>
            <DollarSign className="w-4 h-4 mr-2" />
            Request Petty Cash
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      {step < 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.slice(0, 3).map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200',
                      step > s.number
                        ? 'bg-green-500 text-white'
                        : step === s.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    )}
                  >
                    {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                  </div>
                  <span className="text-xs mt-2 font-medium hidden md:block">
                    {s.title}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={cn(
                      'w-24 md:w-32 h-1 mx-2 transition-all duration-200',
                      step > s.number ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[step - 1].title}</CardTitle>
          <CardDescription>{steps[step - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      {step < 4 && (
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {step < 3 ? (
            <Button onClick={() => validateStep() && setStep(step + 1)}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Create File
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Petty Cash Dialog */}
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
                value={selectedFileForCash}
                onValueChange={setSelectedFileForCash}
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
                {selectedFileForCash 
                  ? `Request will be linked to file: ${files.find(f => f.id === selectedFileForCash)?.fileNumber}`
                  : 'This will be a general petty cash request (not linked to any file)'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPettyCashDialogOpen(false);
              setPettyCashForm({ amount: '', currency: 'TZS', description: '' });
              setSelectedFileForCash('');
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
