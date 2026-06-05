import { useState, useEffect } from 'react';
import {
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Receipt,
  Upload,
  RefreshCw,
  MessageSquare,
  User,
  Calendar,
  Trash2,
  FileText,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { PettyCashTable } from '@/components/PettyCashTable';
import { PettyCashFilter, type PettyCashFilters } from '@/components/PettyCashFilter';
import { ManagerSection } from './sections/ManagerSection';
import { FinanceManagerSection } from './sections/FinanceManagerSection';
import { CashierSection } from './sections/CashierSection';
import { useAuthStore } from '@/store/authStore';
import { usePettyCashStore } from '@/store/pettyCashStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useFileStore } from '@/store/fileStore';
import type { PettyCashRequest, PettyCashStatus } from '@/types';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { resetPettyCashData } from '@/utils/resetPettyCash';

interface PettyCashPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
  fileId?: string; // Pre-selected file ID from navigation
}

export function PettyCashPage({ navigate, fileId }: PettyCashPageProps) {
  const { user } = useAuthStore();
  const { requests, updateStatus, createRequest, deleteRequest } = usePettyCashStore();
  const { addNotification } = useNotificationStore();
  const { files } = useFileStore();

  const [activeTab, setActiveTab] = useState(
    user && (
      user.role === 'finance_manager' ||
      user.role === 'coo' ||
      user.role === 'managing_director' ||
      user.role === 'commercial_manager'
    ) ? 'all' : 
    user && (
      user.role === 'hr_manager' ||
      user.role === 'operations_manager' ||
      user.role === 'declaration_manager'
    ) ? 'pending' : 'myrequests'
  );
  const [selectedRequest, setSelectedRequest] = useState<PettyCashRequest | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'process'>('approve');
  const [comment, setComment] = useState('');
  const [resubmitComment, setResubmitComment] = useState('');
  
  const [requestForm, setRequestForm] = useState({
    hasFile: !!fileId, // Auto-set if fileId is provided
    fileId: fileId || 'none', // Pre-select the file if provided
    amount: '',
    currency: 'TZS',
    description: '',
    attachment: null as File | null,
  });

  // Auto-open request dialog if fileId is provided
  useEffect(() => {
    if (fileId) {
      setRequestDialogOpen(true);
    }
  }, [fileId]);

  // Filtering state
  const [filters, setFilters] = useState<PettyCashFilters>({
    amountMin: '',
    amountMax: '',
    fileNumber: '',
    dateFrom: '',
    dateTo: '',
    status: 'all',
    requester: '',
  });

  // Debug logging
  console.log('PettyCashPage rendering:', { 
    user, 
    requestsCount: requests?.length,
    requestDialogOpen,
    actionDialogOpen
  });

  // Early return if no user
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to access petty cash requests.</p>
      </div>
    );
  }

  // Safe permission check
  const canCreateRequest = user.role === 'administrator' || 
    ['documentation_officer', 'declaration_manager', 'declarant', 'operations_manager', 
     'operation_clerk', 'permits_clerk', 'shipping_line_clerk', 'delivery_clerk', 'hr_manager', 'finance_manager', 
     'cashier', 'commercial_manager', 'coo'].includes(user.role);

  // Check if user can view all requests (only specific executive roles)
  const canViewAllRequests = user && (
    user.role === 'commercial_manager' ||
    user.role === 'coo' ||
    user.role === 'managing_director' ||
    user.role === 'finance_manager'
  );

  // Filter requests based on user role and permissions
  const getVisibleRequests = () => {
    if (!user) return [];
    
    // Only specific executives can see all requests
    if (canViewAllRequests) {
      return requests || [];
    }
    
    // Cashier and administrator can see all requests but with limited actions
    if (user.role === 'cashier' || user.role === 'administrator') {
      return requests || [];
    }
    
    // Managers can see requests that need their approval + their own requests
    if (user.role === 'hr_manager') {
      const hrRequests = (requests || []).filter((r: PettyCashRequest) => 
        r.requestedBy === user.id || r.status === 'PENDING_HR_APPROVAL'
      );
      console.log('HR Manager Filter:', {
        userId: user.id,
        totalRequests: requests?.length,
        hrRequestsCount: hrRequests.length,
        hrRequests: hrRequests.map(r => ({ 
          requestNumber: r.requestNumber, 
          status: r.status, 
          requestedBy: r.requestedBy 
        }))
      });
      return hrRequests;
    }
    
    if (user.role === 'operations_manager') {
      return (requests || []).filter((r: PettyCashRequest) => 
        r.requestedBy === user.id || r.status === 'PENDING_MANAGER_APPROVAL'
      );
    }
    
    if (user.role === 'declaration_manager') {
      return (requests || []).filter((r: PettyCashRequest) => 
        r.requestedBy === user.id || r.status === 'PENDING_DECLARATION_MANAGER_APPROVAL'
      );
    }
    
    // All other users can only see their own requests
    return (requests || []).filter((r: PettyCashRequest) => r.requestedBy === user.id);
  };

  const visibleRequests = getVisibleRequests();

  // Debug logging
  console.log('Debug Info:', {
    userRole: user?.role,
    userId: user?.id,
    activeTab,
    totalRequests: requests?.length || 0,
    visibleRequestsCount: visibleRequests.length,
    visibleRequests: visibleRequests.map(r => ({ 
      id: r.id, 
      requestNumber: r.requestNumber,
      status: r.status, 
      requestedBy: r.requestedBy,
      requesterName: r.requester?.name 
    })),
    canViewAllRequests,
  });

  // Separate requests for managers into "To Approve" and "My Requests"
  const requestsToApprove = visibleRequests.filter((r: PettyCashRequest) => {
    if (!user) return false;
    
    // HR Manager - requests from their department
    if (user.role === 'hr_manager' && r.status === 'PENDING_HR_APPROVAL' && r.requestedBy !== user.id) {
      return true;
    }
    
    // Operations Manager - requests from operations staff
    if (user.role === 'operations_manager' && r.status === 'PENDING_MANAGER_APPROVAL' && r.requestedBy !== user.id) {
      return true;
    }
    
    // Declaration Manager - requests from declaration staff
    if (user.role === 'declaration_manager' && r.status === 'PENDING_DECLARATION_MANAGER_APPROVAL' && r.requestedBy !== user.id) {
      return true;
    }
    
    // COO - all pending requests (not just COO approval stage)
    if (user.role === 'coo') {
      const isPending = r.status === 'PENDING_HR_APPROVAL' ||
        r.status === 'PENDING_MANAGER_APPROVAL' ||
        r.status === 'PENDING_DECLARATION_MANAGER_APPROVAL' ||
        r.status === 'PENDING_COO_APPROVAL';
      return isPending && r.requestedBy !== user.id;
    }
    
    // Finance Manager - all pending requests (not just finance stage)
    if (user.role === 'finance_manager') {
      const isPending = r.status === 'PENDING_HR_APPROVAL' ||
        r.status === 'PENDING_MANAGER_APPROVAL' ||
        r.status === 'PENDING_DECLARATION_MANAGER_APPROVAL' ||
        r.status === 'PENDING_COO_APPROVAL' ||
        r.status === 'PENDING_FINANCE';
      return isPending && r.requestedBy !== user.id;
    }
    
    return false;
  });

  const myRequests = visibleRequests.filter((r: PettyCashRequest) => 
    user && r.requestedBy === user.id
  );

  // Finance Manager: COO approved requests (for WAITING/APPROVED decision)
  const cooApprovedRequests = user?.role === 'finance_manager' 
    ? visibleRequests.filter((r: PettyCashRequest) => 
        r.status === 'APPROVED_BY_COO' || r.status === 'COO_DIRECT_TO_FINANCE'
      )
    : [];

  // Cashier: Show all requests but can only act on PENDING_PAYMENT
  const financeApprovedRequests = user?.role === 'cashier'
    ? visibleRequests // Show all requests
    : [];

  const filteredRequests = visibleRequests.filter((request: PettyCashRequest) => {
    // Tab filtering
    if (activeTab === 'all') {
      // Continue to apply other filters
    } else if (activeTab === 'pending') {
      // For managers on "pending" tab, show only requests pending THEIR approval
      if (user?.role === 'hr_manager') {
        if (request.status !== 'PENDING_HR_APPROVAL') return false;
      } else if (user?.role === 'operations_manager') {
        if (request.status !== 'PENDING_MANAGER_APPROVAL') return false;
      } else if (user?.role === 'declaration_manager') {
        if (request.status !== 'PENDING_DECLARATION_MANAGER_APPROVAL') return false;
      } else {
        // For executives, show all pending
        const isPending = request.status === 'PENDING_HR_APPROVAL' ||
          request.status === 'PENDING_MANAGER_APPROVAL' ||
          request.status === 'PENDING_DECLARATION_MANAGER_APPROVAL' ||
          request.status === 'PENDING_COO_APPROVAL';
        if (!isPending) return false;
      }
    } else if (activeTab === 'approved') {
      const isApproved = request.status === 'APPROVED_BY_COO' || 
        request.status === 'PENDING_FINANCE' ||
        request.status === 'PENDING_PAYMENT';
      if (!isApproved) return false;
    } else if (activeTab === 'paid') {
      if (request.status !== 'PAID') return false;
    } else if (activeTab === 'rejected') {
      const isRejected = request.status === 'REJECTED_BY_HR' ||
        request.status === 'REJECTED_BY_MANAGER' ||
        request.status === 'REJECTED_BY_DECLARATION_MANAGER' ||
        request.status === 'REJECTED_BY_COO' ||
        request.status === 'REJECTED_BACK_TO_CLERK';
      if (!isRejected) return false;
    } else if (activeTab === 'myrequests') {
      if (request.requestedBy !== user?.id) return false;
    }

    // Apply additional filters
    // Amount filter
    if (filters.amountMin && request.amount < parseFloat(filters.amountMin)) {
      return false;
    }
    if (filters.amountMax && request.amount > parseFloat(filters.amountMax)) {
      return false;
    }

    // File number filter
    if (filters.fileNumber && request.file) {
      if (!request.file.fileNumber.toLowerCase().includes(filters.fileNumber.toLowerCase())) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateFrom) {
      const requestDate = new Date(request.createdAt);
      const filterDate = new Date(filters.dateFrom);
      if (requestDate < filterDate) return false;
    }
    if (filters.dateTo) {
      const requestDate = new Date(request.createdAt);
      const filterDate = new Date(filters.dateTo);
      filterDate.setHours(23, 59, 59, 999); // End of day
      if (requestDate > filterDate) return false;
    }

    // Status filter
    if (filters.status !== 'all' && request.status !== filters.status) {
      return false;
    }

    // Requester filter (for managers)
    if (filters.requester && request.requester) {
      if (!request.requester.name.toLowerCase().includes(filters.requester.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const handleCreateRequest = () => {
    if (!user) return;

    console.log('handleCreateRequest called', requestForm);

    // Enhanced validation
    if (!requestForm.description || requestForm.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters long.');
      return;
    }

    const amount = parseFloat(requestForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount greater than 0.');
      return;
    }

    if (amount > 1000000) {
      toast.error('Amount cannot exceed 1,000,000.');
      return;
    }

    // Validate file selection if "With File" is selected
    if (requestForm.hasFile && requestForm.fileId === 'none') {
      toast.error('Please select a file or choose "No File - General Request".');
      return;
    }

    try {
      // Simulate file upload (in production, you'd upload to a server)
      let attachmentUrl = undefined;
      if (requestForm.attachment) {
        // Create a mock URL for the attachment
        attachmentUrl = `attachments/${requestForm.attachment.name}`;
        console.log('File attached:', requestForm.attachment.name);
      }

      createRequest({
        fileId: requestForm.hasFile && requestForm.fileId !== 'none' ? requestForm.fileId : undefined,
        requestedBy: user.id,
        amount,
        currency: requestForm.currency,
        description: requestForm.description.trim(),
        attachmentUrl,
      });

      toast.success('Petty cash request submitted successfully');
      setRequestDialogOpen(false);
      setRequestForm({ hasFile: false, fileId: 'none', amount: '', currency: 'TZS', description: '', attachment: null });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit request');
    }
  };

  const handleAction = () => {
    if (!selectedRequest || !user) return;

    const newStatus: Record<string, Record<string, PettyCashStatus>> = {
      approve: {
        PENDING_HR_APPROVAL: 'PENDING_COO_APPROVAL',
        PENDING_MANAGER_APPROVAL: 'PENDING_COO_APPROVAL',
        PENDING_DECLARATION_MANAGER_APPROVAL: 'PENDING_COO_APPROVAL',
        PENDING_COO_APPROVAL: 'APPROVED_BY_COO',
      },
      reject: {
        PENDING_HR_APPROVAL: 'REJECTED_BY_HR',
        PENDING_MANAGER_APPROVAL: 'REJECTED_BY_MANAGER',
        PENDING_DECLARATION_MANAGER_APPROVAL: 'REJECTED_BY_DECLARATION_MANAGER',
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
        
        // If request is linked to a SEA file, notify shipping line clerks
        if (selectedRequest.fileId) {
          const file = files.find(f => f.id === selectedRequest.fileId);
          if (file && file.transportMode === 'SEA' && (file.shipmentType === 'IMPORT' || file.shipmentType === 'EXPORT')) {
            // Get all shipping line clerks
            import('@/data/mockData').then(({ mockUsers }) => {
              const shippingLineClerks = mockUsers.filter(u => u.role === 'shipping_line_clerk' && u.isActive);
              shippingLineClerks.forEach(clerk => {
                addNotification({
                  userId: clerk.id,
                  title: '💰 Petty Cash Paid',
                  message: `Petty cash request ${selectedRequest.requestNumber} for SEA file ${file.fileNumber} has been paid`,
                  type: 'success',
                  fileId: file.id,
                  link: '/shipping-line',
                });
              });
            });
          }
        }
      }
    } else {
      const status = newStatus[actionType][selectedRequest.status];
      if (status) {
        const data: any = {};
        if (user.role === 'hr_manager') {
          data.hrManagerId = user.id;
          data.hrComment = comment;
        } else if (user.role === 'operations_manager') {
          data.managerId = user.id;
          data.managerComment = comment;
        } else if (user.role === 'declaration_manager') {
          data.declarationManagerId = user.id;
          data.declarationManagerComment = comment;
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

        // Notify requester
        addNotification({
          userId: selectedRequest.requestedBy,
          title: actionType === 'approve' ? 'Request Approved' : 'Request Rejected',
          message: `Your petty cash request ${selectedRequest.requestNumber} has been ${actionType === 'approve' ? 'approved' : 'rejected'}`,
          type: actionType === 'approve' ? 'success' : 'error',
        });
        
        // If request is linked to a SEA file, notify shipping line clerks
        if (selectedRequest.fileId) {
          const file = files.find(f => f.id === selectedRequest.fileId);
          if (file && file.transportMode === 'SEA' && (file.shipmentType === 'IMPORT' || file.shipmentType === 'EXPORT')) {
            // Get all shipping line clerks
            import('@/data/mockData').then(({ mockUsers }) => {
              const shippingLineClerks = mockUsers.filter(u => u.role === 'shipping_line_clerk' && u.isActive);
              shippingLineClerks.forEach(clerk => {
                addNotification({
                  userId: clerk.id,
                  title: actionType === 'approve' ? '✅ Petty Cash Approved' : '❌ Petty Cash Rejected',
                  message: `Petty cash request ${selectedRequest.requestNumber} for SEA file ${file.fileNumber} has been ${actionType === 'approve' ? 'approved' : 'rejected'}`,
                  type: actionType === 'approve' ? 'success' : 'error',
                  fileId: file.id,
                  link: '/shipping-line',
                });
              });
            });
          }
        }
      }
    }

    toast.success(`Request ${actionType === 'reject' ? 'rejected' : actionType === 'process' ? 'processed' : 'approved'} successfully`);
    setActionDialogOpen(false);
    setComment('');
    setSelectedRequest(null);
  };

  const openActionDialog = (request: PettyCashRequest, type: 'approve' | 'reject' | 'process') => {
    setSelectedRequest(request);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const openViewDialog = (request: PettyCashRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const openResubmitDialog = (request: PettyCashRequest) => {
    setSelectedRequest(request);
    setResubmitDialogOpen(true);
  };

  const openDeleteDialog = (request: PettyCashRequest) => {
    setSelectedRequest(request);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedRequest || !user) return;

    deleteRequest(selectedRequest.id);
    toast.success('Request deleted successfully');
    setDeleteDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleClearFilters = () => {
    setFilters({
      amountMin: '',
      amountMax: '',
      fileNumber: '',
      dateFrom: '',
      dateTo: '',
      status: 'all',
      requester: '',
    });
  };

  const handleFinanceWaiting = (request: PettyCashRequest) => {
    if (!user || user.role !== 'finance_manager') return;
    
    updateStatus(request.id, 'PENDING_FINANCE', {
      financeManagerId: user.id,
      financeComment: 'Waiting for funds availability',
    });
    
    toast.info('Request marked as waiting for funds');
    
    addNotification({
      userId: request.requestedBy,
      title: '⏳ Waiting for Funds',
      message: `Your request ${request.requestNumber} is waiting for funds`,
      type: 'info',
    });
  };

  const handleFinanceApproved = (request: PettyCashRequest) => {
    if (!user || user.role !== 'finance_manager') return;
    
    updateStatus(request.id, 'PENDING_PAYMENT', {
      financeManagerId: user.id,
      financeComment: 'Approved for payment',
    });
    
    toast.success('Request approved for payment');
    
    addNotification({
      userId: '12', // Cashier
      title: '💰 Payment Ready',
      message: `Request ${request.requestNumber} is ready for payment`,
      type: 'warning',
      link: '/petty-cash',
    });
  };

  const handleCashierPaid = (request: PettyCashRequest) => {
    if (!user || user.role !== 'cashier') return;
    
    updateStatus(request.id, 'PAID', {
      cashierId: user.id,
      paymentReference: `PV-${Date.now()}`,
    });
    
    toast.success('Payment completed');
    
    addNotification({
      userId: request.requestedBy,
      title: '✅ Payment Completed',
      message: `Your request ${request.requestNumber} has been paid`,
      type: 'success',
    });
  };

  const handleResubmit = () => {
    if (!selectedRequest || !user) return;

    if (!resubmitComment.trim()) {
      toast.error('Please provide a comment explaining the changes');
      return;
    }

    // Reset status to pending based on original requester's department
    let newStatus: PettyCashStatus = 'PENDING_MANAGER_APPROVAL';
    const resubmitData: any = {};
    
    if (user.role === 'documentation_officer') {
      // Documentation officer requests go to HR first
      newStatus = 'PENDING_HR_APPROVAL';
      resubmitData.hrComment = `RESUBMITTED: ${resubmitComment}`;
    } else if (user.role === 'declarant') {
      // Declarant requests go to Declaration Manager first
      newStatus = 'PENDING_DECLARATION_MANAGER_APPROVAL';
      resubmitData.declarationManagerComment = `RESUBMITTED: ${resubmitComment}`;
    } else {
      // Default to operations manager
      resubmitData.managerComment = `RESUBMITTED: ${resubmitComment}`;
    }

    updateStatus(selectedRequest.id, newStatus, resubmitData);

    // Notify the appropriate manager
    let notifyUserId = '5'; // Operations Manager
    if (user.role === 'documentation_officer') {
      notifyUserId = '13'; // HR Manager
    } else if (user.role === 'declarant') {
      notifyUserId = '2'; // Declaration Manager
    }

    addNotification({
      userId: notifyUserId,
      title: 'Petty Cash Request Resubmitted',
      message: `Request ${selectedRequest.requestNumber} has been resubmitted with changes`,
      type: 'info',
      link: '/petty-cash',
    });

    toast.success('Request resubmitted successfully');
    setResubmitDialogOpen(false);
    setResubmitComment('');
    setSelectedRequest(null);
  };

  const stats = {
    pending: (() => {
      // For managers, show only requests pending THEIR approval
      if (user?.role === 'hr_manager') {
        return visibleRequests.filter((r: PettyCashRequest) => r.status === 'PENDING_HR_APPROVAL').length;
      }
      if (user?.role === 'operations_manager') {
        return visibleRequests.filter((r: PettyCashRequest) => r.status === 'PENDING_MANAGER_APPROVAL').length;
      }
      if (user?.role === 'declaration_manager') {
        return visibleRequests.filter((r: PettyCashRequest) => r.status === 'PENDING_DECLARATION_MANAGER_APPROVAL').length;
      }
      // For executives, show all pending
      return visibleRequests.filter((r: PettyCashRequest) => 
        r.status === 'PENDING_HR_APPROVAL' ||
        r.status === 'PENDING_MANAGER_APPROVAL' ||
        r.status === 'PENDING_DECLARATION_MANAGER_APPROVAL' ||
        r.status === 'PENDING_COO_APPROVAL'
      ).length;
    })(),
    approved: visibleRequests.filter((r: PettyCashRequest) => 
      r.status === 'APPROVED_BY_COO' || 
      r.status === 'COO_DIRECT_TO_FINANCE' ||
      r.status === 'PENDING_FINANCE' ||
      r.status === 'PENDING_PAYMENT'
    ).length,
    paid: visibleRequests.filter((r: PettyCashRequest) => r.status === 'PAID').length,
    rejected: visibleRequests.filter((r: PettyCashRequest) => 
      r.status === 'REJECTED_BY_HR' ||
      r.status === 'REJECTED_BY_MANAGER' ||
      r.status === 'REJECTED_BY_DECLARATION_MANAGER' ||
      r.status === 'REJECTED_BY_COO' ||
      r.status === 'REJECTED_BACK_TO_CLERK'
    ).length,
    myRequests: user ? visibleRequests.filter((r: PettyCashRequest) => r.requestedBy === user.id).length : 0,
  };

  // Debug stats calculation
  console.log('Stats Debug:', {
    visibleRequestsCount: visibleRequests.length,
    visibleRequestStatuses: visibleRequests.map(r => r.status),
    calculatedStats: stats,
    activeTab,
  });

  const statusColors: Record<PettyCashStatus, string> = {
    PENDING_HR_APPROVAL: 'bg-purple-100 text-purple-700',
    PENDING_MANAGER_APPROVAL: 'bg-amber-100 text-amber-700',
    PENDING_DECLARATION_MANAGER_APPROVAL: 'bg-blue-100 text-blue-700',
    PENDING_COO_APPROVAL: 'bg-indigo-100 text-indigo-700',
    APPROVED_BY_COO: 'bg-green-100 text-green-700',
    COO_DIRECT_TO_FINANCE: 'bg-indigo-100 text-indigo-700',
    REJECTED_BY_HR: 'bg-red-100 text-red-700',
    REJECTED_BY_MANAGER: 'bg-red-100 text-red-700',
    REJECTED_BY_DECLARATION_MANAGER: 'bg-red-100 text-red-700',
    REJECTED_BY_COO: 'bg-red-100 text-red-700',
    PENDING_FINANCE: 'bg-purple-100 text-purple-700',
    PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
    PAID: 'bg-green-100 text-green-700',
    REJECTED_BACK_TO_CLERK: 'bg-red-100 text-red-700',
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
        <div className="flex gap-2">
          {canCreateRequest && (
            <Button 
              onClick={() => {
                console.log('Request Petty Cash button clicked');
                setRequestDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Request Petty Cash
            </Button>
          )}
          <Button 
            onClick={() => navigate('petty-cash/history')}
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            View History
          </Button>
          {user?.role === 'administrator' && (
            <Button 
              onClick={() => {
                const currentData = localStorage.getItem('pettyCashStore');
                console.log('Current localStorage data:', currentData);
                if (window.confirm(`Are you sure you want to delete all petty cash requests?\n\nCurrent requests in storage: ${requests?.length || 0}\n\nThis action cannot be undone.`)) {
                  resetPettyCashData();
                }
              }}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset All ({requests?.length || 0})
            </Button>
          )}
        </div>
      </div>

      {/* Debug Panel for Administrators */}
      {user?.role === 'administrator' && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">Debug Info (Admin Only)</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Total Requests: {requests?.length || 0} | 
                  Visible to current user: {visibleRequests.length} | 
                  Filtered by tab: {filteredRequests.length}
                </p>
                <button
                  onClick={() => {
                    console.log('=== FULL DEBUG INFO ===');
                    console.log('All Requests:', requests);
                    console.log('Visible Requests:', visibleRequests);
                    console.log('Filtered Requests:', filteredRequests);
                    console.log('LocalStorage:', localStorage.getItem('pettyCashStore'));
                  }}
                  className="text-xs text-yellow-600 hover:text-yellow-800 underline mt-1"
                >
                  Log full debug info to console
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab('pending')}
        >
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
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab('approved')}
        >
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
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab('paid')}
        >
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
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab('rejected')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-sm text-gray-500">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveTab('myrequests')}
        >
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
      </div>

      {/* Filter Component */}
      <PettyCashFilter
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
        showRequesterFilter={canViewAllRequests}
      />

      {/* Role-based sections */}
      {user.role === 'cashier' ? (
        <CashierSection
          user={user}
          financeApprovedRequests={financeApprovedRequests}
          statusColors={statusColors}
          onView={openViewDialog}
          onPaid={handleCashierPaid}
        />
      ) : user.role === 'finance_manager' ? (
        <FinanceManagerSection
          user={user}
          accountsRequests={requestsToApprove}
          cooApprovedRequests={cooApprovedRequests}
          myRequests={myRequests}
          statusColors={statusColors}
          onView={openViewDialog}
          onApprove={(r) => openActionDialog(r, 'approve')}
          onReject={(r) => openActionDialog(r, 'reject')}
          onWaiting={handleFinanceWaiting}
          onApproved={handleFinanceApproved}
          onResubmit={openResubmitDialog}
          onDelete={openDeleteDialog}
        />
      ) : (user.role === 'hr_manager' || user.role === 'operations_manager' || 
            user.role === 'declaration_manager' || user.role === 'coo') ? (
        <ManagerSection
          user={user}
          requestsToApprove={requestsToApprove}
          myRequests={myRequests}
          statusColors={statusColors}
          onView={openViewDialog}
          onApprove={(r) => openActionDialog(r, 'approve')}
          onReject={(r) => openActionDialog(r, 'reject')}
          onResubmit={openResubmitDialog}
          onDelete={openDeleteDialog}
        />
      ) : canViewAllRequests ? (
        // Keep existing tabs for executives
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="myrequests">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>Petty Cash Requests</CardTitle>
                <CardDescription>View and manage all petty cash requests</CardDescription>
              </CardHeader>
              <CardContent>
                <PettyCashTable
                  requests={filteredRequests}
                  user={user}
                  statusColors={statusColors}
                  onView={openViewDialog}
                  onResubmit={openResubmitDialog}
                  onDelete={openDeleteDialog}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        // Regular users - just show their requests
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>Your petty cash requests</CardDescription>
          </CardHeader>
          <CardContent>
            <PettyCashTable
              requests={myRequests}
              user={user}
              statusColors={statusColors}
              onView={openViewDialog}
              onResubmit={openResubmitDialog}
              onDelete={openDeleteDialog}
            />
          </CardContent>
        </Card>
      )}

      {/* Simple Dialog */}
      {requestDialogOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setRequestDialogOpen(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-2">Request Petty Cash</h2>
              <p className="text-gray-600 mb-6">Create a petty cash request with or without a file reference</p>
              
              <div className="space-y-4">
                {/* File Reference Selection */}
                <div>
                  <Label className="mb-3 block">File Reference</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="no-file"
                        name="fileReference"
                        checked={!requestForm.hasFile}
                        onChange={() => setRequestForm({ ...requestForm, hasFile: false, fileId: 'none' })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="no-file" className="text-sm font-medium cursor-pointer">
                        No File - General Request
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="with-file"
                        name="fileReference"
                        checked={requestForm.hasFile}
                        onChange={() => setRequestForm({ ...requestForm, hasFile: true })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="with-file" className="text-sm font-medium cursor-pointer">
                        With File Reference
                      </label>
                    </div>
                  </div>
                </div>

                {/* File Selection - Only show when "With File" is selected */}
                {requestForm.hasFile && (
                  <div>
                    <Label>Select File *</Label>
                    <Select
                      value={requestForm.fileId}
                      onValueChange={(value: string) => setRequestForm({ ...requestForm, fileId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a file" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Select a file --</SelectItem>
                        {files.map((file) => (
                          <SelectItem key={file.id} value={file.id}>
                            {file.fileNumber} - {file.client?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select the file this request is related to
                    </p>
                  </div>
                )}

                <div>
                  <Label>Amount *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={requestForm.amount}
                      onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                      className="flex-1"
                      min="0"
                      max="1000000"
                      step="0.01"
                    />
                    <Select
                      value={requestForm.currency}
                      onValueChange={(value: string) => setRequestForm({ ...requestForm, currency: value })}
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

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Enter detailed description (minimum 10 characters)"
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                    rows={4}
                    maxLength={500}
                    className={cn(
                      requestForm.description.length > 0 && requestForm.description.length < 10 && "border-red-300"
                    )}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span className={cn(
                      "text-gray-500",
                      requestForm.description.length > 0 && requestForm.description.length < 10 && "text-red-500 font-medium"
                    )}>
                      {requestForm.description.length < 10 
                        ? `${10 - requestForm.description.length} more characters needed`
                        : 'Minimum requirement met ✓'
                      }
                    </span>
                    <span className="text-gray-500">{requestForm.description.length}/500</span>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <Label>Attachment (Optional)</Label>
                  <div className="mt-1">
                    <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {requestForm.attachment ? requestForm.attachment.name : 'Click to upload document or photo'}
                        </span>
                        <span className="text-xs text-gray-500">
                          PDF, DOC, JPG, PNG (Max 5MB)
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('File size must be less than 5MB');
                              return;
                            }
                            setRequestForm({ ...requestForm, attachment: file });
                          }
                        }}
                      />
                    </label>
                    {requestForm.attachment && (
                      <div className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{requestForm.attachment.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setRequestForm({ ...requestForm, attachment: null })}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Validation Messages */}
                {(requestForm.amount || requestForm.description) && (
                  <div className="text-xs space-y-1">
                    {!requestForm.amount && (
                      <p className="text-red-500">• Amount is required</p>
                    )}
                    {requestForm.amount && parseFloat(requestForm.amount) <= 0 && (
                      <p className="text-red-500">• Amount must be greater than 0</p>
                    )}
                    {!requestForm.description && (
                      <p className="text-red-500">• Description is required</p>
                    )}
                    {requestForm.description && requestForm.description.trim().length < 10 && (
                      <p className="text-red-500">• Description must be at least 10 characters</p>
                    )}
                    {requestForm.hasFile && requestForm.fileId === 'none' && (
                      <p className="text-red-500">• Please select a file</p>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setRequestDialogOpen(false);
                      setRequestForm({ hasFile: false, fileId: 'none', amount: '', currency: 'TZS', description: '', attachment: null });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateRequest}
                    disabled={
                      !requestForm.amount || 
                      !requestForm.description || 
                      requestForm.description.trim().length < 10 ||
                      parseFloat(requestForm.amount) <= 0 ||
                      (requestForm.hasFile && requestForm.fileId === 'none')
                    }
                    className={cn(
                      "bg-blue-600 hover:bg-blue-700 text-white",
                      (!requestForm.amount || 
                       !requestForm.description || 
                       requestForm.description.trim().length < 10 ||
                       parseFloat(requestForm.amount) <= 0 ||
                       (requestForm.hasFile && requestForm.fileId === 'none')) && 
                      "opacity-50 cursor-not-allowed hover:bg-blue-600"
                    )}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Submit Request
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Request Dialog */}
      {viewDialogOpen && selectedRequest && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setViewDialogOpen(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-2">Request Details</h2>
              <p className="text-gray-600 mb-6">Request #{selectedRequest.requestNumber}</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Requester</Label>
                    <p className="font-medium">{selectedRequest.requester?.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Amount</Label>
                    <p className="font-semibold text-lg">
                      {selectedRequest.currency} {selectedRequest.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <Badge variant="secondary" className={cn('text-xs mt-1', statusColors[selectedRequest.status])}>
                      {selectedRequest.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-500">Date</Label>
                    <p>{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Description</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded border">{selectedRequest.description}</p>
                </div>

                {selectedRequest.fileId && (
                  <div>
                    <Label className="text-gray-500">File Reference</Label>
                    <p className="mt-1">{selectedRequest.file?.fileNumber}</p>
                  </div>
                )}

                {selectedRequest.attachmentUrl && (
                  <div>
                    <Label className="text-gray-500">Attachment</Label>
                    <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded border">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="flex-1 text-sm">{selectedRequest.attachmentUrl.split('/').pop()}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // In production, this would download from server
                          // For now, we'll open in new tab or trigger download
                          const link = document.createElement('a');
                          link.href = selectedRequest.attachmentUrl || '';
                          link.download = selectedRequest.attachmentUrl?.split('/').pop() || 'attachment';
                          link.click();
                          toast.success('Download started');
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}

                {/* Timeline Section */}
                <div className="border-t pt-6">
                  <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Timeline of Events
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Request Created */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Request Created</p>
                            <p className="text-sm text-gray-600">by {selectedRequest.requester?.name}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(selectedRequest.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                          <p className="text-gray-700">{selectedRequest.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* HR Manager Action - Only for Documentation Officer requests */}
                    {selectedRequest.requester?.role === 'documentation_officer' && 
                     (selectedRequest.hrComment || selectedRequest.hrManagerId || 
                      selectedRequest.status === 'PENDING_MANAGER_APPROVAL' || 
                      selectedRequest.status === 'REJECTED_BY_HR') && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            selectedRequest.status === 'REJECTED_BY_HR' ? 'bg-red-100' : 
                            selectedRequest.status === 'PENDING_HR_APPROVAL' ? 'bg-yellow-100' :
                            'bg-green-100'
                          )}>
                            {selectedRequest.status === 'REJECTED_BY_HR' ? (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ) : selectedRequest.status === 'PENDING_HR_APPROVAL' ? (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          {(selectedRequest.managerComment || selectedRequest.declarationManagerComment || 
                            selectedRequest.cooComment || selectedRequest.financeComment || 
                            selectedRequest.status === 'PENDING_MANAGER_APPROVAL') && (
                            <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {selectedRequest.status === 'REJECTED_BY_HR' ? 'Rejected by HR Manager' : 
                                 selectedRequest.status === 'PENDING_HR_APPROVAL' ? 'Pending HR Manager Approval' :
                                 'Approved by HR Manager'}
                              </p>
                              <p className="text-sm text-gray-600">HR Department</p>
                            </div>
                            {selectedRequest.hrActionAt && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(selectedRequest.hrActionAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                          {selectedRequest.hrComment && (
                            <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                                <p className="text-sm text-gray-700">{selectedRequest.hrComment}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Operations Manager Action - For shipping_line_clerk and after HR/Declaration Manager approval */}
                    {((selectedRequest.requester?.role === 'shipping_line_clerk' || 
                       selectedRequest.requester?.role === 'operation_clerk' ||
                       selectedRequest.requester?.role === 'permits_clerk' ||
                       selectedRequest.requester?.role === 'documentation_officer' && selectedRequest.hrManagerId) &&
                      (selectedRequest.managerComment || selectedRequest.managerId || 
                       selectedRequest.status === 'PENDING_COO_APPROVAL' || 
                       selectedRequest.status === 'REJECTED_BY_MANAGER')) && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            selectedRequest.status === 'REJECTED_BY_MANAGER' ? 'bg-red-100' : 
                            selectedRequest.status === 'PENDING_MANAGER_APPROVAL' ? 'bg-yellow-100' :
                            'bg-green-100'
                          )}>
                            {selectedRequest.status === 'REJECTED_BY_MANAGER' ? (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ) : selectedRequest.status === 'PENDING_MANAGER_APPROVAL' ? (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          {(selectedRequest.declarationManagerComment || selectedRequest.cooComment || 
                            selectedRequest.financeComment || selectedRequest.status === 'PENDING_COO_APPROVAL') && (
                            <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {selectedRequest.status === 'REJECTED_BY_MANAGER' ? 'Rejected by Operations Manager' : 
                                 selectedRequest.status === 'PENDING_MANAGER_APPROVAL' ? 'Pending Operations Manager Approval' :
                                 'Approved by Operations Manager'}
                              </p>
                              <p className="text-sm text-gray-600">{selectedRequest.manager?.name || 'Operations Department'}</p>
                            </div>
                            {selectedRequest.managerActionAt && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(selectedRequest.managerActionAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                          {selectedRequest.managerComment && (
                            <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                                <p className="text-sm text-gray-700">{selectedRequest.managerComment}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Declaration Manager Action - Only for Declarant requests */}
                    {selectedRequest.requester?.role === 'declarant' && 
                     (selectedRequest.declarationManagerComment || selectedRequest.declarationManagerId || 
                      selectedRequest.status === 'PENDING_COO_APPROVAL' || 
                      selectedRequest.status === 'REJECTED_BY_DECLARATION_MANAGER') && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            selectedRequest.status === 'REJECTED_BY_DECLARATION_MANAGER' ? 'bg-red-100' : 
                            selectedRequest.status === 'PENDING_DECLARATION_MANAGER_APPROVAL' ? 'bg-yellow-100' :
                            'bg-green-100'
                          )}>
                            {selectedRequest.status === 'REJECTED_BY_DECLARATION_MANAGER' ? (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ) : selectedRequest.status === 'PENDING_DECLARATION_MANAGER_APPROVAL' ? (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          {(selectedRequest.cooComment || selectedRequest.financeComment || 
                            selectedRequest.status === 'PENDING_COO_APPROVAL') && (
                            <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {selectedRequest.status === 'REJECTED_BY_DECLARATION_MANAGER' ? 'Rejected by Declaration Manager' : 
                                 selectedRequest.status === 'PENDING_DECLARATION_MANAGER_APPROVAL' ? 'Pending Declaration Manager Approval' :
                                 'Approved by Declaration Manager'}
                              </p>
                              <p className="text-sm text-gray-600">{selectedRequest.declarationManager?.name || 'Declaration Department'}</p>
                            </div>
                            {selectedRequest.declarationManagerActionAt && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(selectedRequest.declarationManagerActionAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                          {selectedRequest.declarationManagerComment && (
                            <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                                <p className="text-sm text-gray-700">{selectedRequest.declarationManagerComment}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* COO Action */}
                    {(selectedRequest.cooComment || selectedRequest.cooId || 
                      selectedRequest.status === 'PENDING_FINANCE' || 
                      selectedRequest.status === 'PENDING_PAYMENT' ||
                      selectedRequest.status === 'REJECTED_BY_COO') && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            selectedRequest.status === 'REJECTED_BY_COO' ? 'bg-red-100' : 
                            selectedRequest.status === 'PENDING_COO_APPROVAL' ? 'bg-yellow-100' :
                            'bg-green-100'
                          )}>
                            {selectedRequest.status === 'REJECTED_BY_COO' ? (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ) : selectedRequest.status === 'PENDING_COO_APPROVAL' ? (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          {(selectedRequest.financeComment || selectedRequest.status === 'PENDING_FINANCE' || 
                            selectedRequest.status === 'PENDING_PAYMENT') && (
                            <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {selectedRequest.status === 'REJECTED_BY_COO' ? 'Rejected by COO' : 
                                 selectedRequest.status === 'PENDING_COO_APPROVAL' ? 'Pending COO Approval' :
                                 'Approved by COO'}
                              </p>
                              <p className="text-sm text-gray-600">{selectedRequest.coo?.name || 'Chief Operating Officer'}</p>
                            </div>
                            {selectedRequest.cooActionAt && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(selectedRequest.cooActionAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                          {selectedRequest.cooComment && (
                            <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                                <p className="text-sm text-gray-700">{selectedRequest.cooComment}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Finance Manager Action */}
                    {(selectedRequest.financeComment || selectedRequest.financeManagerId || 
                      selectedRequest.status === 'PENDING_PAYMENT' || 
                      selectedRequest.status === 'PAID') && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            selectedRequest.status === 'PENDING_FINANCE' ? 'bg-yellow-100' : 'bg-purple-100'
                          )}>
                            {selectedRequest.status === 'PENDING_FINANCE' ? (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <DollarSign className="w-5 h-5 text-purple-600" />
                            )}
                          </div>
                          {(selectedRequest.status === 'PENDING_PAYMENT' || selectedRequest.status === 'PAID') && (
                            <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {selectedRequest.status === 'PENDING_FINANCE' ? 'Pending Finance Manager Review' : 'Processed by Finance Manager'}
                              </p>
                              <p className="text-sm text-gray-600">{selectedRequest.financeManager?.name || 'Finance Department'}</p>
                            </div>
                            {selectedRequest.financeActionAt && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(selectedRequest.financeActionAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                          {selectedRequest.financeComment && (
                            <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                                <p className="text-sm text-gray-700">{selectedRequest.financeComment}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cashier Payment */}
                    {(selectedRequest.status === 'PENDING_PAYMENT' || selectedRequest.status === 'PAID') && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            selectedRequest.status === 'PENDING_PAYMENT' ? 'bg-yellow-100' : 'bg-green-100'
                          )}>
                            {selectedRequest.status === 'PENDING_PAYMENT' ? (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {selectedRequest.status === 'PENDING_PAYMENT' ? 'Pending Payment by Cashier' : 'Payment Completed'}
                              </p>
                              <p className="text-sm text-gray-600">by {selectedRequest.cashier?.name || 'Cashier'}</p>
                            </div>
                            {selectedRequest.paidAt && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(selectedRequest.paidAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                          {selectedRequest.paymentReference && (
                            <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Payment Reference:</span> {selectedRequest.paymentReference}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval/Rejection Dialog */}
      {actionDialogOpen && selectedRequest && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setActionDialogOpen(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-2">
                {actionType === 'approve' ? 'Approve Request' : 
                 actionType === 'reject' ? 'Reject Request' : 'Process Payment'}
              </h2>
              <p className="text-gray-600 mb-6">Request #{selectedRequest.requestNumber}</p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="font-semibold">
                      {selectedRequest.currency} {selectedRequest.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Requester</span>
                    <span className="font-medium">{selectedRequest.requester?.name}</span>
                  </div>
                </div>

                <div>
                  <Label>Comment {actionType === 'reject' ? '(Required)' : '(Optional)'}</Label>
                  <Textarea
                    placeholder={actionType === 'reject' ? 'Please provide a reason for rejection...' : 'Add your comment...'}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setActionDialogOpen(false);
                    setComment('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAction}
                  disabled={actionType === 'reject' && !comment.trim()}
                  className={cn(
                    actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700',
                    'text-white',
                    actionType === 'reject' && !comment.trim() && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {actionType === 'approve' && <CheckCircle className="w-4 h-4 mr-2" />}
                  {actionType === 'reject' && <XCircle className="w-4 h-4 mr-2" />}
                  {actionType === 'process' && <DollarSign className="w-4 h-4 mr-2" />}
                  {actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Process'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resubmit Dialog */}
      {resubmitDialogOpen && selectedRequest && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setResubmitDialogOpen(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-2">Resubmit Request</h2>
              <p className="text-gray-600 mb-6">Request #{selectedRequest.requestNumber}</p>
              
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-800 mb-2">Rejection Reason:</p>
                  <p className="text-sm text-red-700">
                    {selectedRequest.hrComment || selectedRequest.managerComment || 
                     selectedRequest.declarationManagerComment || selectedRequest.cooComment || 
                     'No reason provided'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Original Amount</span>
                    <span className="font-semibold">
                      {selectedRequest.currency} {selectedRequest.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Original Description</span>
                    <p className="text-sm mt-1">{selectedRequest.description}</p>
                  </div>
                </div>

                <div>
                  <Label>Response Comment (Required)</Label>
                  <Textarea
                    placeholder="Explain what changes you've made or why this request should be reconsidered..."
                    value={resubmitComment}
                    onChange={(e) => setResubmitComment(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This comment will be sent to the approver along with your resubmission
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setResubmitDialogOpen(false);
                    setResubmitComment('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleResubmit}
                  disabled={!resubmitComment.trim()}
                  className={cn(
                    'bg-orange-600 hover:bg-orange-700 text-white',
                    !resubmitComment.trim() && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resubmit Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && selectedRequest && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setDeleteDialogOpen(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-2 text-red-600">Delete Request</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this request?</p>
              
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 mb-2">
                        Request #{selectedRequest.requestNumber}
                      </p>
                      <div className="space-y-1 text-sm text-red-700">
                        <p><span className="font-medium">Amount:</span> {selectedRequest.currency} {selectedRequest.amount.toLocaleString()}</p>
                        <p><span className="font-medium">Status:</span> {selectedRequest.status.replace(/_/g, ' ')}</p>
                        <p><span className="font-medium">Description:</span> {selectedRequest.description.substring(0, 100)}{selectedRequest.description.length > 100 ? '...' : ''}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Warning:</span> This action cannot be undone. The request will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setSelectedRequest(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}