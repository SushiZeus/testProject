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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useFileStore } from '@/store/fileStore';
import { useAuthStore } from '@/store/authStore';
import type { FileStatus, ShippingDocument } from '@/types';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

function DocumentCard({ document }: DocumentCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="font-medium">{document.documentName}</p>
          <p className="text-sm text-gray-500 capitalize">
            {document.documentType.replace(/_/g, ' ')}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={() => window.open(document.fileUrl, '_blank')}>
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
  const { getFileById, getActivityLogs, addComment } = useFileStore();

  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

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

  const handleAddComment = () => {
    if (!comment.trim() || !user || !fileId) return;

    addComment(fileId, user.id, comment);
    toast.success('Comment added');
    setComment('');
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Documents</CardTitle>
                  <CardDescription>
                    {file.documents.length} document(s) uploaded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {file.documents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No documents uploaded</p>
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
    </div>
  );
}
