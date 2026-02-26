import { useState } from 'react';
import {
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Receipt,
  ArrowRight,
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { usePettyCashStore } from '@/store/pettyCashStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useFileStore } from '@/store/fileStore';
import type { PettyCashRequest, PettyCashStatus } from '@/types';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PettyCashPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function PettyCashPage({ }: PettyCashPageProps) {
  const { user, hasPermission } = useAuthStore();
  const { requests, updateStatus, createRequest } = usePettyCashStore();
  const { addNotification } = useNotificationStore();
  const { files } = useFileStore();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<PettyCashRequest | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'process'>('approve');
  const [comment, setComment] = useState('');
  
  const [requestForm, setRequestForm] = useState({
    fileId: '',
    amount: '',
    currency: 'TZS',
    description: '',
  });

  const filteredRequests = requests.filter((request: PettyCashRequest) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return 
      request.status === 'PENDING_HR_APPROVAL' ||
      request.status === 'PENDING_MANAGER_APPROVAL' || 
      request.status === 'PENDING_COO_APPROVAL';
    if (activeTab === 'approved') return 
      request.status === 'APPROVED_BY_COO' || 
      request.status === 'PENDING_FINANCE' ||
      request.status === 'PENDING_PAYMENT';
    if (activeTab === 'paid') return request.status === 'PAID';
    if (activeTab === 'rejected') return 
      request.status === 'REJECTED_BY_HR' ||
      request.status === 'REJECTED_BY_MANAGER' || 
      request.status === 'REJECTED_BY_COO';
    if (activeTab === 'myrequests') return request.requestedBy === user?.id;
    return true;
  });

  const handleAction = () => {
    if (!selectedRequest || !user) return;

    const newStatus: Record<string, Record<string, PettyCashStatus>> = {
      approve: {
        PENDING_HR_APPROVAL: 'PENDING_COO_APPROVAL', // Skip Operations Manager, go directly to COO
        PENDING_MANAGER_APPROVAL: 'PENDING_COO_APPROVAL',
        PENDING_COO_APPROVAL: 'APPROVED_BY_COO',
      },
      reject: {
        PENDING_HR_APPROVAL: 'REJECTED_BY_HR',
        PENDING_MANAGER_APPROVAL: 'REJECTED_BY_MANAGER',
        PENDING_COO_APPROVAL: 'REJECTED_BY_COO',
      },
    };

    if (actionType === 'process') {
      if (user.role === 'finance_manager') {
        updateStatus(selectedRequest.id, 'PENDING_PAYMENT', {
          financeManagerId: user.id,
          financeComment: comment,
        });
        
        addNotification({
          userId: '12',
          title: 'Payment Ready',
          message: `Petty cash request ${selectedRequest.requestNumber} is ready for payment`,
          type: 'info',
        });
      } else if (user.role === 'cashier') {
        updateStatus(selectedRequest.id, 'PAID', {
          cashierId: user.id,
          paymentReference: `PV-${Date.now()}`,
        });
        
        addNotification({
          userId: selectedRequest.requestedBy,
          title: 'Payment Completed',
          message: `Your petty cash request ${selectedRequest.requestNumber} has been paid`,
          type: 'success',
        });
      }
    } else {
      const status = newStatus[actionType][selectedRequest.status];
      if (status) {
        const data: any = { comment };
        if (user.role === 'hr_manager') {
          data.hrManagerId = user.id;
          data.hrComment = comment;
        } else if (user.role === 'operations_manager') {
          data.managerId = user.id;
          data.managerComment = comment;
        } else if (user.role === 'coo') {
          data.cooId = user.id;
          data.cooComment = comment;
        }
        
        updateStatus(selectedRequest.id, status, data);

        if (actionType === 'approve' && status === 'PENDING_COO_APPROVAL') {
          addNotification({
            userId: '10',
            title: 'Petty Cash Approval Required',
            message: `Request ${selectedRequest.requestNumber} requires your approval`,
            type: 'info',
            link: '/petty-cash',
          });
        }
      }
    }

    toast.success(`Request ${actionType === 'reject' ? 'rejected' : actionType === 'process' ? 'processed' : 'approved'} successfully`);
    setActionDialogOpen(false);
    setComment('');
    setSelectedRequest(null);
  };

  const handleCreateRequest = () => {
    if (!user) return;

    const amount = parseFloat(requestForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!requestForm.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    createRequest({
      fileId: requestForm.fileId || undefined,
      requestedBy: user.id,
      amount,
      currency: requestForm.currency,
      description: requestForm.description,
    });

    // Determine who to notify based on user role
    let notifyUserId = '5'; // Default to Operations Manager
    let notifyMessage = 'New Petty Cash Request';
    
    if (user.role === 'documentation_officer') {
      notifyUserId = '13'; // HR Manager
      notifyMessage = 'New Petty Cash Request (HR Approval Required)';
    }

    addNotification({
      userId: notifyUserId,
      title: notifyMessage,
      message: `Request for ${requestForm.currency} ${amount.toLocaleString()} ${requestForm.fileId ? 'with file reference' : '(General Request)'}`,
      type: 'info',
      link: '/petty-cash',
    });

    toast.success('Petty cash request submitted successfully');
    setRequestDialogOpen(false);
    setRequestForm({ fileId: '', amount: '', currency: 'TZS', description: '' });
  };

  const openActionDialog = (request: PettyCashRequest, type: 'approve' | 'reject' | 'process') => {
    setSelectedRequest(request);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const statusColors: Record<PettyCashStatus, string> = {
    PENDING_HR_APPROVAL: 'bg-purple-100 text-purple-700',
    PENDING_MANAGER_APPROVAL: 'bg-amber-100 text-amber-700',
    PENDING_COO_APPROVAL: 'bg-blue-100 text-blue-700',
    APPROVED_BY_COO: 'bg-green-100 text-green-700',
    REJECTED_BY_HR: 'bg-red-100 text-red-700',
    REJECTED_BY_MANAGER: 'bg-red-100 text-red-700',
    REJECTED_BY_COO: 'bg-red-100 text-red-700',
    PENDING_FINANCE: 'bg-purple-100 text-purple-700',
    PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
    PAID: 'bg-green-100 text-green-700',
    REJECTED_BACK_TO_CLERK: 'bg-red-100 text-red-700',
  };

  const stats = {
    pending: requests.filter((r: PettyCashRequest) => 
      r.status === 'PENDING_HR_APPROVAL' ||
      r.status === 'PENDING_MANAGER_APPROVAL' || 
      r.status === 'PENDING_COO_APPROVAL'
    ).length,
    approved: requests.filter((r: PettyCashRequest) => 
      r.status === 'APPROVED_BY_COO' || 
      r.status === 'PENDING_FINANCE' ||
      r.status === 'PENDING_PAYMENT'
    ).length,
    paid: requests.filter((r: PettyCashRequest) => r.status === 'PAID').length,
    myRequests: user ? requests.filter((r: PettyCashRequest) => r.requestedBy === user.id).length : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Petty Cash Requests</h1>
          <p className="text-gray-500 mt-1">
            Manage and process petty cash requests
          </p>
        </div>
        {hasPermission('create_petty_cash_request') && (
          <Button onClick={() => setRequestDialogOpen(true)}>
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
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-gray-500">Pending</p>
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
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-gray-500">Approved</p>
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
                <p className="text-2xl font-bold">{stats.paid}</p>
                <p className="text-sm text-gray-500">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {user?.role === 'operation_clerk' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.myRequests}</p>
                  <p className="text-sm text-gray-500">My Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Department-Specific Approval Stages */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
        <CardContent className="p-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Approval Stages by Department</h3>
            
            {/* Documentation Department */}
            <div className="border-l-4 border-purple-400 pl-4">
              <p className="text-sm font-medium text-purple-700">Documentation Department</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <span className="text-xs text-gray-600">HR Manager</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                <span className="text-xs text-gray-600">COO</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                <span className="text-xs text-gray-600">Finance → Cashier</span>
              </div>
            </div>

            {/* Operations Department */}
            <div className="border-l-4 border-amber-400 pl-4">
              <p className="text-sm font-medium text-amber-700">Operations Department</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <span className="text-xs text-gray-600">Operations Manager</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                <span className="text-xs text-gray-600">COO</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                <span className="text-xs text-gray-600">Finance → Cashier</span>
              </div>
            </div>

            {/* Declaration Department */}
            <div className="border-l-4 border-blue-400 pl-4">
              <p className="text-sm font-medium text-blue-700">Declaration Department</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <span className="text-xs text-gray-600">Operations Manager</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                <span className="text-xs text-gray-600">COO</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                <span className="text-xs text-gray-600">Finance → Cashier</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          {user?.role === 'operation_clerk' && (
            <TabsTrigger value="myrequests">My Requests</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Petty Cash Requests</CardTitle>
              <CardDescription>View and manage all petty cash requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Request #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Requester</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No requests found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((request: PettyCashRequest) => {
                        const canApprove = 
                          (user?.role === 'hr_manager' && request.status === 'PENDING_HR_APPROVAL') ||
                          (user?.role === 'operations_manager' && request.status === 'PENDING_MANAGER_APPROVAL') ||
                          (user?.role === 'coo' && request.status === 'PENDING_COO_APPROVAL');

                        const canProcess = 
                          (user?.role === 'finance_manager' && request.status === 'APPROVED_BY_COO') ||
                          (user?.role === 'cashier' && request.status === 'PENDING_PAYMENT');

                        return (
                          <tr key={request.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-mono font-medium text-blue-600">{request.requestNumber}</p>
                                <p className="text-sm text-gray-500">{request.file?.fileNumber}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium">{request.requester?.name}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-semibold">
                                {request.currency} {request.amount.toLocaleString()}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="secondary" className={cn('text-xs', statusColors[request.status])}>
                                {request.status.replace(/_/g, ' ')}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-500">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(request)}>
                                  View
                                </Button>
                                {canApprove && (
                                  <>
                                    <Button size="sm" variant="outline" className="text-green-600" onClick={() => openActionDialog(request, 'approve')}>
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => openActionDialog(request, 'reject')}>
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                {canProcess && (
                                  <Button size="sm" onClick={() => openActionDialog(request, 'process')}>
                                    Process
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Request' : 
               actionType === 'reject' ? 'Reject Request' : 'Process Payment'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && `Request: ${selectedRequest.requestNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="font-semibold">
                  {selectedRequest?.currency} {selectedRequest?.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Requester</span>
                <span className="font-medium">{selectedRequest?.requester?.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea
                placeholder={actionType === 'reject' ? 'Reason for rejection...' : 'Optional comment...'}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {actionType === 'approve' && <CheckCircle className="w-4 h-4 mr-2" />}
              {actionType === 'reject' && <XCircle className="w-4 h-4 mr-2" />}
              {actionType === 'process' && <DollarSign className="w-4 h-4 mr-2" />}
              {actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Process'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Petty Cash</DialogTitle>
            <DialogDescription>
              Create a petty cash request with or without a file reference
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>File (Optional)</Label>
              <Select
                value={requestForm.fileId}
                onValueChange={(value) => setRequestForm({ ...requestForm, fileId: value })}
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
                  value={requestForm.amount}
                  onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                  className="flex-1"
                />
                <Select
                  value={requestForm.currency}
                  onValueChange={(value) => setRequestForm({ ...requestForm, currency: value })}
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
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                {requestForm.fileId 
                  ? `Request will be linked to selected file`
                  : 'This will be a general petty cash request (not linked to any file)'}
              </p>
              {user?.role === 'documentation_officer' && (
                <p className="text-sm text-purple-700 mt-1">
                  <strong>Note:</strong> Your request will be sent to HR Manager for approval first.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRequestDialogOpen(false);
              setRequestForm({ fileId: '', amount: '', currency: 'TZS', description: '' });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRequest}
              disabled={!requestForm.amount || !requestForm.description}
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
