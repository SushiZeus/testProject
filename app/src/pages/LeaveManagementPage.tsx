import { useState } from 'react';
import { Calendar, Clock, Plus, CheckCircle, XCircle } from 'lucide-react';
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
import { useLeaveStore, calculateWorkingDays } from '@/store/leaveStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { LeaveRequest, LeaveType } from '@/types';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LeaveManagementPageProps {
  navigate?: (route: AppRoute, params?: Record<string, string>) => void;
}

export function LeaveManagementPage({ navigate }: LeaveManagementPageProps = {}) {
  const { user } = useAuthStore();
  const {
    createRequest,
    updateStatus,
    cancelRequest,
    getRequestsByUser,
    getAllRequests,
    getPendingRequests,
    getUserLeaveBalance,
  } = useLeaveStore();
  const { addNotification } = useNotificationStore();

  // HR Manager has special view, all other users can request leave
  const isHRManager = user?.role === 'hr_manager';
  const canRequestLeave = user && user.role !== 'hr_manager'; // All users except HR can request leave
  
  const [activeTab, setActiveTab] = useState(isHRManager ? 'pending' : 'my-requests');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  const [requestForm, setRequestForm] = useState({
    leaveType: 'ANNUAL' as LeaveType,
    startDate: '',
    endDate: '',
    description: '',
  });

  const myRequests = user ? getRequestsByUser(user.id) : [];
  const allRequests = getAllRequests();
  const pendingRequests = getPendingRequests();
  const leaveBalance = user ? getUserLeaveBalance(user.id) : { annualLeaveBalance: 0, sickLeaveBalance: 0, totalLeaveTaken: 0 };

  // Calculate number of days when dates change
  const calculateDays = () => {
    if (requestForm.startDate && requestForm.endDate) {
      const start = new Date(requestForm.startDate);
      const end = new Date(requestForm.endDate);
      if (end >= start) {
        return calculateWorkingDays(start, end);
      }
    }
    return 0;
  };

  const numberOfDays = calculateDays();

  const handleSubmitRequest = () => {
    if (!user) return;

    if (!requestForm.startDate || !requestForm.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    if (!requestForm.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    const start = new Date(requestForm.startDate);
    const end = new Date(requestForm.endDate);

    if (end < start) {
      toast.error('End date must be after start date');
      return;
    }

    if (numberOfDays === 0) {
      toast.error('Leave request must include at least one working day');
      return;
    }

    // Check leave balance for annual leave only
    if (requestForm.leaveType === 'ANNUAL' && numberOfDays > leaveBalance.annualLeaveBalance) {
      toast.error(`Insufficient annual leave balance. You have ${leaveBalance.annualLeaveBalance} days remaining.`);
      return;
    }

    const newRequest = createRequest({
      userId: user.id,
      leaveType: requestForm.leaveType,
      startDate: start,
      endDate: end,
      numberOfDays,
      description: requestForm.description,
    });

    // Notify HR Manager
    addNotification({
      userId: '13', // HR Manager ID from mockData
      title: 'New Leave Request',
      message: `${user.name} has requested ${numberOfDays} days of ${requestForm.leaveType.toLowerCase()} leave`,
      type: 'info',
      link: '/leave-management',
    });

    toast.success(`Leave request ${newRequest.requestNumber} submitted successfully`);
    setRequestDialogOpen(false);
    setRequestForm({
      leaveType: 'ANNUAL',
      startDate: '',
      endDate: '',
      description: '',
    });
  };

  const handleApprove = () => {
    if (!selectedRequest || !user) return;

    updateStatus(selectedRequest.id, 'APPROVED', user.id, reviewComment);

    // Notify the requester
    addNotification({
      userId: selectedRequest.userId,
      title: 'Leave Request Approved',
      message: `Your ${selectedRequest.leaveType.toLowerCase()} leave request (${selectedRequest.requestNumber}) has been approved`,
      type: 'success',
      link: '/leave-management',
    });

    toast.success('Leave request approved');
    setReviewDialogOpen(false);
    setSelectedRequest(null);
    setReviewComment('');
  };

  const handleReject = () => {
    if (!selectedRequest || !user) return;

    if (!reviewComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    updateStatus(selectedRequest.id, 'REJECTED', user.id, reviewComment);

    // Notify the requester
    addNotification({
      userId: selectedRequest.userId,
      title: 'Leave Request Rejected',
      message: `Your ${selectedRequest.leaveType.toLowerCase()} leave request (${selectedRequest.requestNumber}) has been rejected`,
      type: 'error',
      link: '/leave-management',
    });

    toast.success('Leave request rejected');
    setReviewDialogOpen(false);
    setSelectedRequest(null);
    setReviewComment('');
  };

  const handleCancelRequest = (request: LeaveRequest) => {
    if (request.status !== 'PENDING') {
      toast.error('Only pending requests can be cancelled');
      return;
    }

    cancelRequest(request.id);
    toast.success('Leave request cancelled');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLeaveTypeColor = (type: LeaveType) => {
    switch (type) {
      case 'ANNUAL':
        return 'bg-blue-100 text-blue-700';
      case 'SICK':
        return 'bg-orange-100 text-orange-700';
      case 'EMERGENCY':
        return 'bg-red-100 text-red-700';
      case 'UNPAID':
        return 'bg-gray-100 text-gray-700';
      case 'MATERNITY':
        return 'bg-pink-100 text-pink-700';
      case 'PATERNITY':
        return 'bg-purple-100 text-purple-700';
      case 'COMPASSIONATE':
        return 'bg-indigo-100 text-indigo-700';
      case 'STUDY':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500 mt-1">
            {isHRManager ? 'Manage employee leave requests' : 'Request and track your leave'}
          </p>
        </div>
        {canRequestLeave && (
          <div className="flex gap-2">
            <Button onClick={() => setRequestDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Request Leave
            </Button>
            {navigate && (
              <Button 
                onClick={() => navigate('leave-management/history')}
                variant="outline"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View History
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Leave Balance Cards - Only for non-HR users */}
      {canRequestLeave && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{leaveBalance.annualLeaveBalance}</p>
                  <p className="text-sm text-gray-500">Annual Leave Days Remaining</p>
                  <p className="text-xs text-gray-400 mt-1">28 days per year</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{leaveBalance.totalLeaveTaken}</p>
                  <p className="text-sm text-gray-500">Total Days Taken This Year</p>
                  <p className="text-xs text-gray-400 mt-1">All leave types</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {canRequestLeave && <TabsTrigger value="my-requests">My Requests</TabsTrigger>}
          {isHRManager && (
            <>
              <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
              <TabsTrigger value="all">All Requests</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* My Requests Tab */}
        {canRequestLeave && (
          <TabsContent value="my-requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Leave Requests</CardTitle>
                <CardDescription>View and manage your leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Request #</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Leave Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Dates</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Days</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No leave requests yet</p>
                          </td>
                        </tr>
                      ) : (
                        myRequests.map((request) => (
                          <tr key={request.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <p className="font-mono text-sm">{request.requestNumber}</p>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="secondary" className={getLeaveTypeColor(request.leaveType)}>
                                {request.leaveType}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm">
                                {new Date(request.startDate).toLocaleDateString('en-GB')} - {new Date(request.endDate).toLocaleDateString('en-GB')}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium">{request.numberOfDays} days</p>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="secondary" className={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setReviewDialogOpen(true);
                                  }}
                                >
                                  View
                                </Button>
                                {request.status === 'PENDING' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelRequest(request)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Cancel
                                  </Button>
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
        )}

        {/* Pending Requests Tab - HR Only */}
        {isHRManager && (
          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Leave Requests</CardTitle>
                <CardDescription>Review and approve employee leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Request #</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Employee</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Leave Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Dates</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Days</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No pending requests</p>
                          </td>
                        </tr>
                      ) : (
                        pendingRequests.map((request) => (
                          <tr key={request.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <p className="font-mono text-sm">{request.requestNumber}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium">{request.user?.name}</p>
                              <p className="text-sm text-gray-500">{request.user?.role.replace(/_/g, ' ')}</p>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="secondary" className={getLeaveTypeColor(request.leaveType)}>
                                {request.leaveType}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm">
                                {new Date(request.startDate).toLocaleDateString('en-GB')} - {new Date(request.endDate).toLocaleDateString('en-GB')}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium">{request.numberOfDays} days</p>
                            </td>
                            <td className="py-4 px-4">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setReviewDialogOpen(true);
                                }}
                              >
                                Review
                              </Button>
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
        )}

        {/* All Requests Tab - HR Only */}
        {isHRManager && (
          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Leave Requests</CardTitle>
                <CardDescription>Complete history of all employee leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Request #</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Employee</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Leave Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Dates</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Days</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allRequests.map((request) => (
                        <tr key={request.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <p className="font-mono text-sm">{request.requestNumber}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium">{request.user?.name}</p>
                            <p className="text-sm text-gray-500">{request.user?.role.replace(/_/g, ' ')}</p>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className={getLeaveTypeColor(request.leaveType)}>
                              {request.leaveType}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm">
                              {new Date(request.startDate).toLocaleDateString('en-GB')} - {new Date(request.endDate).toLocaleDateString('en-GB')}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium">{request.numberOfDays} days</p>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setReviewDialogOpen(true);
                              }}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Request Leave Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
            <DialogDescription>
              Submit a new leave request for approval
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Leave Type *</Label>
              <Select
                value={requestForm.leaveType}
                onValueChange={(value) => setRequestForm({ ...requestForm, leaveType: value as LeaveType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                  <SelectItem value="SICK">Sick Leave</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency Leave</SelectItem>
                  <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                  <SelectItem value="MATERNITY">Maternity Leave</SelectItem>
                  <SelectItem value="PATERNITY">Paternity Leave</SelectItem>
                  <SelectItem value="COMPASSIONATE">Compassionate Leave</SelectItem>
                  <SelectItem value="STUDY">Study Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={requestForm.startDate}
                  onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={requestForm.endDate}
                  onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })}
                  min={requestForm.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {numberOfDays > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Working Days:</span> {numberOfDays} days (excluding weekends)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Description/Reason *</Label>
              <Textarea
                placeholder="Please provide a reason for your leave request..."
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                rows={4}
              />
            </div>

            {requestForm.leaveType === 'ANNUAL' && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700">
                  <span className="font-medium">Available Balance:</span> {leaveBalance.annualLeaveBalance} of 28 annual leave days remaining
                </p>
              </div>
            )}
            
            {requestForm.leaveType !== 'ANNUAL' && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Note:</span> {requestForm.leaveType.charAt(0) + requestForm.leaveType.slice(1).toLowerCase()} leave has no day limit
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest}>
              <Plus className="w-4 h-4 mr-2" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              {selectedRequest && `Request ${selectedRequest.requestNumber}`}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Employee</Label>
                  <p className="font-medium">{selectedRequest.user?.name}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.user?.role.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Leave Type</Label>
                  <Badge variant="secondary" className={cn('mt-1', getLeaveTypeColor(selectedRequest.leaveType))}>
                    {selectedRequest.leaveType}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Start Date</Label>
                  <p className="font-medium">{new Date(selectedRequest.startDate).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <Label className="text-gray-500">End Date</Label>
                  <p className="font-medium">{new Date(selectedRequest.endDate).toLocaleDateString('en-GB')}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-500">Number of Days</Label>
                <p className="font-medium">{selectedRequest.numberOfDays} working days</p>
              </div>

              <div>
                <Label className="text-gray-500">Description</Label>
                <p className="text-sm mt-1">{selectedRequest.description}</p>
              </div>

              <div>
                <Label className="text-gray-500">Status</Label>
                <Badge variant="secondary" className={cn('mt-1', getStatusColor(selectedRequest.status))}>
                  {selectedRequest.status}
                </Badge>
              </div>

              {selectedRequest.hrComment && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-blue-700">HR Comment</Label>
                  <p className="text-sm text-blue-600 mt-1">{selectedRequest.hrComment}</p>
                  {selectedRequest.reviewedAt && (
                    <p className="text-xs text-blue-500 mt-1">
                      Reviewed on {new Date(selectedRequest.reviewedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {isHRManager && selectedRequest.status === 'PENDING' && (
                <div className="space-y-2">
                  <Label>Comment (Optional)</Label>
                  <Textarea
                    placeholder="Add a comment..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {isHRManager && selectedRequest?.status === 'PENDING' ? (
              <>
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="outline" onClick={handleReject} className="text-red-600 hover:text-red-700">
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            ) : (
              <Button onClick={() => setReviewDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
