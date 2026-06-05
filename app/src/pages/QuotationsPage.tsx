import { useState, useRef } from 'react';
import {
  FileText, Eye, CheckCircle, Clock, Truck, Package,
  Upload, Send, Download, X, AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { useFileStore } from '@/store/fileStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { AppRoute } from '@/App';
import type { ShipmentFile } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { mockUsers } from '@/data/mockData';

interface QuotationsPageProps {
  navigate: (route: AppRoute) => void;
}

const statusColors: Record<string, string> = {
  WAITING_FOR_COMMERCIAL: 'bg-amber-100 text-amber-700',
  COMMERCIAL_PROCESSING: 'bg-blue-100 text-blue-700',
  QUOTATION_UPLOADED: 'bg-purple-100 text-purple-700',
  QUOTATION_SENT_TO_FINANCE: 'bg-indigo-100 text-indigo-700',
  COMMERCIAL_APPROVED: 'bg-green-100 text-green-700',
};

const statusLabels: Record<string, string> = {
  WAITING_FOR_COMMERCIAL: 'Waiting for Review',
  COMMERCIAL_PROCESSING: 'Processing',
  QUOTATION_UPLOADED: 'Quotation Uploaded',
  QUOTATION_SENT_TO_FINANCE: 'Sent to Finance',
  COMMERCIAL_APPROVED: 'Approved',
};

const COMMERCIAL_STATUSES = [
  'WAITING_FOR_COMMERCIAL',
  'COMMERCIAL_PROCESSING',
  'QUOTATION_UPLOADED',
  'QUOTATION_SENT_TO_FINANCE',
  'COMMERCIAL_APPROVED',
];

export function QuotationsPage({ navigate }: QuotationsPageProps) {
  const { user } = useAuthStore();
  const { files, updateFileStatus } = useFileStore();
  const { addNotification } = useNotificationStore();

  const [selectedFile, setSelectedFile] = useState<ShipmentFile | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const quotationFiles = files.filter(f =>
    (f.serviceType === 'DOCUMENT_HANDOVER' || f.serviceType === 'TRANSPORTATION') &&
    COMMERCIAL_STATUSES.includes(f.status)
  );

  const waiting = quotationFiles.filter(f => f.status === 'WAITING_FOR_COMMERCIAL');
  const processing = quotationFiles.filter(f => f.status === 'COMMERCIAL_PROCESSING');
  const uploaded = quotationFiles.filter(f => f.status === 'QUOTATION_UPLOADED');
  const sentToFinance = quotationFiles.filter(f => f.status === 'QUOTATION_SENT_TO_FINANCE');
  const approved = quotationFiles.filter(f => f.status === 'COMMERCIAL_APPROVED');

  const handleStartProcessing = (file: ShipmentFile) => {
    if (!user) return;
    updateFileStatus(file.id, 'COMMERCIAL_PROCESSING', user.id);
    addNotification({
      userId: file.createdBy,
      title: '📋 File Under Review',
      message: `File ${file.fileNumber} is now being reviewed by Commercial Department`,
      type: 'info',
      fileId: file.id,
      link: '/dashboard',
    });
    toast.success(`File ${file.fileNumber} moved to processing`);
    setViewDialogOpen(false);
  };

  const openUploadDialog = (file: ShipmentFile) => {
    setSelectedFile(file);
    setUploadFile(null);
    setUploadNotes('');
    setUploadDialogOpen(true);
  };

  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error('Only PDF, Word (.doc/.docx) or Excel (.xls/.xlsx) files are allowed');
      return;
    }
    setUploadFile(f);
  };

  const handleUploadQuotation = async () => {
    if (!user || !selectedFile || !uploadFile) return;
    setIsUploading(true);
    try {
      // Simulate file URL (in production this would upload to storage)
      const fakeUrl = URL.createObjectURL(uploadFile);

      updateFileStatus(selectedFile.id, 'QUOTATION_UPLOADED', user.id, {
        quotationUrl: fakeUrl,
        quotationFileName: uploadFile.name,
        quotationUploadedAt: new Date(),
        quotationUploadedBy: user.id,
        quotationNotes: uploadNotes || undefined,
      } as Partial<ShipmentFile>);

      addNotification({
        userId: selectedFile.createdBy,
        title: '📄 Quotation Uploaded',
        message: `Quotation uploaded for file ${selectedFile.fileNumber}`,
        type: 'info',
        fileId: selectedFile.id,
        link: '/dashboard',
      });

      toast.success('Quotation uploaded successfully');
      setUploadDialogOpen(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendToFinance = (file: ShipmentFile) => {
    if (!user) return;

    // Notify all finance managers
    const financeManagers = mockUsers.filter(u => u.role === 'finance_manager' && u.isActive);
    financeManagers.forEach(fm => {
      addNotification({
        userId: fm.id,
        title: '💼 New Quotation for Proforma Invoice',
        message: `Quotation for file ${file.fileNumber} (${file.serviceType === 'DOCUMENT_HANDOVER' ? 'Document Handover' : 'Transportation'}) has been sent for Proforma Invoice preparation`,
        type: 'info',
        fileId: file.id,
        link: '/dashboard',
      });
    });

    updateFileStatus(file.id, 'QUOTATION_SENT_TO_FINANCE', user.id, {
      quotationSentToFinanceAt: new Date(),
    } as Partial<ShipmentFile>);

    addNotification({
      userId: file.createdBy,
      title: '✅ Quotation Sent to Finance',
      message: `Quotation for file ${file.fileNumber} has been sent to Finance for Proforma Invoice`,
      type: 'success',
      fileId: file.id,
      link: '/dashboard',
    });

    toast.success('Quotation sent to Finance Department for Proforma Invoice');
    setViewDialogOpen(false);
  };

  const openView = (file: ShipmentFile) => {
    setSelectedFile(file);
    setViewDialogOpen(true);
  };

  const renderFileCard = (file: ShipmentFile) => (
    <Card key={file.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              file.serviceType === 'DOCUMENT_HANDOVER' ? 'bg-blue-100' : 'bg-orange-100'
            )}>
              {file.serviceType === 'DOCUMENT_HANDOVER'
                ? <FileText className="w-5 h-5 text-blue-600" />
                : <Truck className="w-5 h-5 text-orange-600" />
              }
            </div>
            <div>
              <p className="font-semibold text-sm">{file.fileNumber}</p>
              <p className="text-xs text-gray-500">{file.client?.name || 'Unknown Client'}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {file.serviceType === 'DOCUMENT_HANDOVER' ? 'Doc Handover' : 'Transportation'} •{' '}
                {file.shipmentType === 'IMPORT' ? 'LOCAL' : file.shipmentType}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge className={cn('text-xs', statusColors[file.status] || 'bg-gray-100 text-gray-700')}>
              {statusLabels[file.status] || file.status}
            </Badge>
            <p className="text-xs text-gray-400">
              {new Date(file.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Quotation indicator */}
        {(file as any).quotationFileName && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 rounded px-2 py-1">
            <FileText className="w-3 h-3" />
            <span className="truncate">{(file as any).quotationFileName}</span>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={() => openView(file)}>
            <Eye className="w-3 h-3 mr-1" /> View
          </Button>
          {file.status === 'WAITING_FOR_COMMERCIAL' && (
            <Button size="sm" className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => handleStartProcessing(file)}>
              <Clock className="w-3 h-3 mr-1" /> Start Review
            </Button>
          )}
          {file.status === 'COMMERCIAL_PROCESSING' && (
            <Button size="sm" className="flex-1 h-8 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => openUploadDialog(file)}>
              <Upload className="w-3 h-3 mr-1" /> Upload Quotation
            </Button>
          )}
          {file.status === 'QUOTATION_UPLOADED' && (
            <Button size="sm" className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSendToFinance(file)}>
              <Send className="w-3 h-3 mr-1" /> Send to Finance
            </Button>
          )}
          {file.status === 'QUOTATION_SENT_TO_FINANCE' && (
            <div className="flex-1 flex items-center justify-center gap-1 text-xs text-indigo-600 bg-indigo-50 rounded h-8 px-2">
              <CheckCircle className="w-3 h-3" />
              <span>Sent to Finance</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSection = (title: string, items: ShipmentFile[]) => {
    if (items.length === 0) return null;
    return (
      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          {title} ({items.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(renderFileCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage Document Handover and Transportation quotations — upload and send to Finance for Proforma Invoice
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Waiting', count: waiting.length, color: 'bg-amber-100', textColor: 'text-amber-700', icon: Clock },
          { label: 'Processing', count: processing.length, color: 'bg-blue-100', textColor: 'text-blue-700', icon: Package },
          { label: 'Quotation Uploaded', count: uploaded.length, color: 'bg-purple-100', textColor: 'text-purple-700', icon: Upload },
          { label: 'Sent to Finance', count: sentToFinance.length, color: 'bg-indigo-100', textColor: 'text-indigo-700', icon: Send },
          { label: 'Approved', count: approved.length, color: 'bg-green-100', textColor: 'text-green-700', icon: CheckCircle },
        ].map(({ label, count, color, textColor, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-3 flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
                <Icon className={cn('w-4 h-4', textColor)} />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Files */}
      {quotationFiles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No quotation files yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Document Handover and Transportation files will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {renderSection('Waiting for Review', waiting)}
          {renderSection('Processing', processing)}
          {renderSection('Quotation Uploaded', uploaded)}
          {renderSection('Sent to Finance', sentToFinance)}
          {renderSection('Approved', approved)}
        </div>
      )}

      {/* View Details Dialog */}
      {selectedFile && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>File Details — {selectedFile.fileNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Client</p>
                  <p className="font-medium">{selectedFile.client?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Service Type</p>
                  <p className="font-medium">
                    {selectedFile.serviceType === 'DOCUMENT_HANDOVER' ? 'Document Handover' : 'Transportation'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Shipment Type</p>
                  <p className="font-medium">
                    {selectedFile.shipmentType === 'IMPORT' ? 'LOCAL' : selectedFile.shipmentType}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Transport Mode</p>
                  <p className="font-medium">{selectedFile.transportMode}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Status</p>
                  <Badge className={cn('text-xs', statusColors[selectedFile.status] || 'bg-gray-100 text-gray-700')}>
                    {statusLabels[selectedFile.status] || selectedFile.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Created</p>
                  <p className="font-medium">{new Date(selectedFile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedFile.cargoDescription && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Cargo Description</p>
                  <p className="text-sm bg-gray-50 rounded p-2">{selectedFile.cargoDescription}</p>
                </div>
              )}

              {selectedFile.documents && selectedFile.documents.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Documents ({selectedFile.documents.length})</p>
                  <div className="space-y-1">
                    {selectedFile.documents.map(doc => (
                      <div key={doc.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded p-2">
                        <FileText className="w-3 h-3 text-gray-400" />
                        <span>{doc.documentName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotation section */}
              {(selectedFile as any).quotationFileName && (
                <>
                  <Separator />
                  <div>
                    <p className="text-gray-500 text-xs mb-2">Quotation Document</p>
                    <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded p-3">
                      <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-purple-800 truncate">
                          {(selectedFile as any).quotationFileName}
                        </p>
                        {(selectedFile as any).quotationUploadedAt && (
                          <p className="text-xs text-purple-600">
                            Uploaded {new Date((selectedFile as any).quotationUploadedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <a
                        href={(selectedFile as any).quotationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Download className="w-3 h-3 mr-1" /> View
                        </Button>
                      </a>
                    </div>
                    {(selectedFile as any).quotationNotes && (
                      <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded p-2">
                        {(selectedFile as any).quotationNotes}
                      </p>
                    )}
                  </div>
                  {(selectedFile as any).quotationSentToFinanceAt && (
                    <div className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 rounded p-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Sent to Finance on {new Date((selectedFile as any).quotationSentToFinanceAt).toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter className="gap-2 flex-wrap">
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
              {selectedFile.status === 'WAITING_FOR_COMMERCIAL' && (
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStartProcessing(selectedFile)}>
                  Start Review
                </Button>
              )}
              {selectedFile.status === 'COMMERCIAL_PROCESSING' && (
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                  setViewDialogOpen(false);
                  openUploadDialog(selectedFile);
                }}>
                  <Upload className="w-4 h-4 mr-1" /> Upload Quotation
                </Button>
              )}
              {selectedFile.status === 'QUOTATION_UPLOADED' && (
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSendToFinance(selectedFile)}>
                  <Send className="w-4 h-4 mr-1" /> Send to Finance
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Quotation Dialog */}
      {selectedFile && (
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Quotation</DialogTitle>
              <DialogDescription>
                Upload the quotation for file <strong>{selectedFile.fileNumber}</strong>.
                Once uploaded, you can send it to Finance for Proforma Invoice preparation.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* File upload area */}
              <div>
                <Label className="text-sm font-medium">Quotation Document (PDF / Word / Excel) *</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                    uploadFile
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  )}
                >
                  {uploadFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-purple-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-purple-800">{uploadFile.name}</p>
                        <p className="text-xs text-purple-600">
                          {(uploadFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                        className="ml-auto text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to select file</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, Word (.doc/.docx) or Excel (.xls/.xlsx)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Notes */}
              <div>
                <Label className="text-sm font-medium">Notes (optional)</Label>
                <Textarea
                  className="mt-2 resize-none"
                  rows={3}
                  placeholder="Add any notes about this quotation..."
                  value={uploadNotes}
                  onChange={e => setUploadNotes(e.target.value)}
                />
              </div>

              {/* Info box */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  After uploading, you'll be able to send this quotation to the Finance Department
                  for Proforma Invoice preparation.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!uploadFile || isUploading}
                onClick={handleUploadQuotation}
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload Quotation
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
