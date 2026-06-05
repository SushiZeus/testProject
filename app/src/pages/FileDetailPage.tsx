import { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Download,
  CheckCircle,
  MessageSquare,
  Paperclip,
  History,
  Printer,
  Share2,
  User as UserIcon,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { useFileStore } from '@/store/fileStore';
import { useAuthStore } from '@/store/authStore';
import type { ShippingDocument } from '@/types';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { statusColors } from '@/utils/statusColors';

interface TimelineItemProps {
  status: string;
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  isLast?: boolean;
  isActive?: boolean;
}

function TimelineItem({ status, title, description, timestamp, user, isLast, isActive }: TimelineItemProps) {
  const statusIcons: Record<string, React.ElementType> = {
    FILE_CREATED: FileText,
    STATUS_CHANGED: CheckCircle,
    COMMENT_ADDED: MessageSquare,
    DECLARANT_ASSIGNED: UserIcon,
    default: CheckCircle,
  };

  const Icon = statusIcons[status] || statusIcons.default;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          isActive ? 'bg-orange-300 text-slate-800' : 'bg-gray-100 text-gray-500'
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {!isLast && <div className="w-0.5 h-full bg-gray-200 my-2" />}
      </div>
      <div className={cn("pb-8", isLast && "pb-0")}>
        <div className="flex items-center gap-2">
          <h4 className={cn("font-semibold", isActive && "text-orange-600")}>{title}</h4>
          {isActive && <Badge className="bg-orange-100 text-orange-700">Current</Badge>}
        </div>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <span>{new Date(timestamp).toLocaleString()}</span>
          {user && <span>by {user}</span>}
        </div>
      </div>
    </div>
  );
}

interface DocumentCardProps {
  document: ShippingDocument;
}

function DocumentCard({ document: doc }: DocumentCardProps) {
  const handleDownload = () => {
    // In production, this would download from server
    // For now, we'll open in new tab or trigger download
    const link = window.document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.documentName;
    link.target = '_blank';
    link.click();
    toast.success(`Downloading ${doc.documentName}`);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="font-medium">{doc.documentName}</p>
          <p className="text-sm text-gray-500 capitalize">
            {doc.documentType.replace(/_/g, ' ')}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={handleDownload}>
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
    </div>
  );
}

interface FileDetailPageProps {
  fileId?: string;
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function FileDetailPage({ fileId, navigate }: FileDetailPageProps) {
  const { user, isExecutive } = useAuthStore();
  const { getFileById, getActivityLogs, addComment, addDocument } = useFileStore();
  
  // Check if user can view client details
  const canViewClientDetails = user && ['documentation_officer', 'commercial_manager', 'managing_director', 'administrator'].includes(user.role);

  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('other');

  const file = fileId ? getFileById(fileId) : null;
  const activityLogs = fileId ? getActivityLogs(fileId) : [];

  const isUserExecutive = isExecutive();

  if (!file) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-500">File not found</h2>
        <Button onClick={() => navigate('dashboard')} className="mt-4">
          Go back to Dashboard
        </Button>
      </div>
    );
  }

  const handleAddComment = () => {
    if (!comment.trim() || !user || !fileId) return;

    addComment(fileId, user.id, comment);
    toast.success('Comment added');
    setComment('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleUploadDocuments = () => {
    if (!file || !user || !fileId) return;

    if (uploadedFiles.length === 0) {
      toast.error('Please select at least one document to upload');
      return;
    }

    // Add uploaded documents to the file
    uploadedFiles.forEach((uploadFile) => {
      const document = {
        id: Math.random().toString(36).substr(2, 9),
        fileId: file.id,
        documentType: selectedDocType as any,
        documentName: uploadFile.name,
        fileUrl: URL.createObjectURL(uploadFile),
        uploadedBy: user.id,
        uploadedAt: new Date(),
      };
      addDocument(file.id, document);
    });

    toast.success(`${uploadedFiles.length} document(s) uploaded successfully`);
    setUploadDialogOpen(false);
    setUploadedFiles([]);
    setSelectedDocType('other');
  };

  const getStatusProgress = () => {
    const statuses = [
      'WAITING_FOR_DECLARATION',
      'ASSIGNED_TO_DECLARANT',
      'DECLARATION_DONE',
      'READY_FOR_OPERATIONS',
      'RECEIVED_BY_CLERK',
      'SWISSPORT_CHARGES_PAID',
      'DRIVER_ASSIGNED',
      'CARGO_COLLECTED_FROM_AIRPORT',
    ];
    const currentIndex = statuses.indexOf(file.status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{file.fileNumber}</h1>
              <Badge className={cn(statusColors[file.status])}>
                {file.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              {file.shipmentType} | {file.transportMode} | Created {new Date(file.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">File Progress</span>
            <span className="font-medium">{Math.round(getStatusProgress())}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${getStatusProgress()}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {isUserExecutive && (
        <Card className="bg-gradient-to-r from-orange-50 to-blue-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-300 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-4 h-4 text-slate-800" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Executive View Mode</h3>
                <p className="text-sm text-slate-600 mt-1">
                  You have read-only access to view file statistics and data from all departments. 
                  You can add comments to the timeline but cannot perform operational actions like 
                  assigning staff, uploading documents, or changing file status.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>File Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {canViewClientDetails && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Client Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Client Name</p>
                            <p className="font-medium">{file.client?.name}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">TIN Number</p>
                            <p className="font-medium">{file.client?.tin}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Mobile</p>
                            <p className="font-medium">{file.client?.mobile}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{file.client?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />
                    </>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Shipment Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Shipment Type</p>
                        <p className="font-medium">{file.shipmentType}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Transport Mode</p>
                        <p className="font-medium">{file.transportMode}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Assignments</h3>
                    <div className="space-y-3">
                      {file.assignedDeclarant && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {file.assignedDeclarant.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{file.assignedDeclarant.name}</p>
                            <p className="text-sm text-gray-500">Declarant</p>
                          </div>
                        </div>
                      )}
                      {file.assignedOperationClerk && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-green-500 text-white text-xs">
                              {file.assignedOperationClerk.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{file.assignedOperationClerk.name}</p>
                            <p className="text-sm text-gray-500">Operation Clerk</p>
                          </div>
                        </div>
                      )}
                      {file.assignedDriver && (
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-amber-500 text-white text-xs">
                              {file.assignedDriver.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{file.assignedDriver.name}</p>
                            <p className="text-sm text-gray-500">Driver</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrival Dates Section */}
                  {(file.eta || file.etb || file.carryInDate || file.manifestComparisonDate || file.wharfageDate) && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">
                          Arrival Dates {file.transportMode === 'SEA' ? '🚢' : '✈️'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {file.eta && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-gray-500">ETA (Estimated Time of Arrival)</p>
                              <p className="font-medium">{new Date(file.eta).toLocaleDateString()}</p>
                            </div>
                          )}
                          {file.etb && file.transportMode === 'SEA' && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-gray-500">ETB (Estimated Time of Berthing)</p>
                              <p className="font-medium">{new Date(file.etb).toLocaleDateString()}</p>
                            </div>
                          )}
                          {file.carryInDate && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-gray-500">Carry In Date</p>
                              <p className="font-medium">{new Date(file.carryInDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {file.manifestComparisonDate && (
                            <div className={cn(
                              "p-4 rounded-lg border",
                              file.transportMode === 'AIR' 
                                ? "bg-green-50 border-green-300" 
                                : "bg-blue-50 border-blue-200"
                            )}>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                Manifest Comparison Date
                                {file.transportMode === 'AIR' && <span className="text-green-600 font-semibold">⚠️ CRITICAL</span>}
                              </p>
                              <p className="font-medium">{new Date(file.manifestComparisonDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {file.wharfageDate && file.transportMode === 'SEA' && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-300">
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                Wharfage Date
                                <span className="text-green-600 font-semibold">⚠️ CRITICAL</span>
                              </p>
                              <p className="font-medium">{new Date(file.wharfageDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        {file.arrivalStatusFilled && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Critical arrival date filled - Declaration can proceed
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Payment Dates Section */}
                  {(file.taxPaymentConfirmedAt || file.wharfagePaymentConfirmedAt) && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">
                          Payment Confirmation Dates 💰
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {file.taxPaymentConfirmedAt && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-300">
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Tax Payment Confirmed
                              </p>
                              <p className="font-medium">{new Date(file.taxPaymentConfirmedAt).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(file.taxPaymentConfirmedAt).toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                          {file.wharfagePaymentConfirmedAt && file.transportMode === 'SEA' && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-300">
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Wharfage Payment Confirmed
                              </p>
                              <p className="font-medium">{new Date(file.wharfagePaymentConfirmedAt).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(file.wharfagePaymentConfirmedAt).toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Verification Photos Section */}
                  {file.verificationPhotos && file.verificationPhotos.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">
                          Verification Photos 📸 ({file.verificationPhotos.length}/7)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {file.verificationPhotos.map((photoUrl: string, index: number) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-blue-400 transition-colors">
                                <img 
                                  src={photoUrl} 
                                  alt={`Verification photo ${index + 1}`}
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => window.open(photoUrl, '_blank')}
                                />
                              </div>
                              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                {index + 1}/{file.verificationPhotos?.length || 0}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => window.open(photoUrl, '_blank')}
                              >
                                <ImageIcon className="w-3 h-3 mr-1" />
                                View Full Size
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {file.verificationPhotos.length} verification photo(s) uploaded by operations team
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Release Order Section */}
                  {file.releaseOrderUrl && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">
                          Release Order 📄
                        </h3>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-green-900">Release Order Uploaded</p>
                                {file.releaseOrderUploadedAt && (
                                  <p className="text-sm text-green-700">
                                    {new Date(file.releaseOrderUploadedAt).toLocaleDateString()} at {new Date(file.releaseOrderUploadedAt).toLocaleTimeString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(file.releaseOrderUrl, '_blank')}
                              className="border-green-300 hover:bg-green-100"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              View/Download
                            </Button>
                          </div>
                        </div>
                        {file.status === 'RELEASE_ORDER_RECEIVED' && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Release order received and ready for processing
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Uploaded Documents</CardTitle>
                      <CardDescription>
                        {file.documents.length} document(s) uploaded
                      </CardDescription>
                    </div>
                    {user?.role === 'documentation_officer' && (
                      <Button onClick={() => setUploadDialogOpen(true)} size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Documents
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {file.documents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No documents uploaded</p>
                        {user?.role === 'documentation_officer' && (
                          <Button onClick={() => setUploadDialogOpen(true)} variant="outline" className="mt-4">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload First Document
                          </Button>
                        )}
                      </div>
                    ) : (
                      file.documents.map((doc: ShippingDocument) => (
                        <DocumentCard key={doc.id} document={doc} />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {activityLogs.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No activity recorded</p>
                      </div>
                    ) : (
                      activityLogs.map((log, index: number) => (
                        <TimelineItem
                          key={log.id}
                          status={log.action}
                          title={log.action.replace(/_/g, ' ')}
                          description={log.description}
                          timestamp={log.createdAt}
                          user={log.user?.name}
                          isLast={index === activityLogs.length - 1}
                          isActive={index === 0}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Textarea
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleAddComment} disabled={!comment.trim()}>
                        Post
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {activityLogs
                        .filter((log) => log.action === 'COMMENT_ADDED')
                        .map((log) => {
                          const userName = log.user?.name || 'Unknown User';
                          return (
                            <div key={log.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-blue-500 text-white text-xs">
                                  {userName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{userName}</span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(log.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-gray-600 mt-1">{log.description}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn(
                'p-4 rounded-lg text-center',
                statusColors[file.status]
              )}>
                <p className="text-lg font-semibold">{file.status.replace(/_/g, ' ')}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">File Number</span>
                  <span className="font-mono">{file.fileNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Updated</span>
                  <span>{new Date(file.updatedAt).toLocaleDateString()}</span>
                </div>
                {file.taxPaymentConfirmedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax Paid</span>
                    <span className="text-green-600 font-medium">
                      {new Date(file.taxPaymentConfirmedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {file.wharfagePaymentConfirmedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Wharfage Paid</span>
                    <span className="text-green-600 font-medium">
                      {new Date(file.wharfagePaymentConfirmedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Next Steps</p>
                {file.status === 'WAITING_FOR_DECLARATION' && (
                  <p className="text-sm">Waiting for declaration manager to assign a declarant.</p>
                )}
                {file.status === 'ASSIGNED_TO_DECLARANT' && (
                  <p className="text-sm">Declarant is processing the declaration.</p>
                )}
                {file.status === 'WAITING_FOR_TAX_PAYMENT' && (
                  <p className="text-sm">Waiting for client to pay taxes.</p>
                )}
                {file.status === 'READY_FOR_OPERATIONS' && (
                  <p className="text-sm">Ready for operations manager to assign a clerk.</p>
                )}
                {file.status === 'SWISSPORT_CHARGES_PAID' && (
                  <p className="text-sm">Ready for delivery arrangements.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Documents Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              Upload additional documents to file {file.fileNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial_invoice">Commercial Invoice</SelectItem>
                  <SelectItem value="packing_list">Packing List</SelectItem>
                  <SelectItem value="bill_of_lading">Bill of Lading</SelectItem>
                  <SelectItem value="airway_bill">Airway Bill</SelectItem>
                  <SelectItem value="road_consignment_note">Road Consignment Note</SelectItem>
                  <SelectItem value="coc">Certificate of Conformity (COC)</SelectItem>
                  <SelectItem value="coo">Certificate of Origin (COO)</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Documents to Upload</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="doc-file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                />
                <label htmlFor="doc-file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Click to upload documents
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supported: PDF, DOC, Images, Excel
                  </p>
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium">Selected Files ({uploadedFiles.length}):</p>
                  {uploadedFiles.map((uploadFile, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="flex-1">{uploadFile.name}</span>
                      <span className="text-xs text-gray-500">
                        {(uploadFile.size / 1024).toFixed(1)} KB
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUploadDialogOpen(false);
              setUploadedFiles([]);
              setSelectedDocType('other');
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
    </div>
  );
}
