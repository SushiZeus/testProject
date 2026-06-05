import { useState } from 'react';
import { Calendar, Clock, Filter, User, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { useLeaveStore } from '@/store/leaveStore';
import type { LeaveRequest, LeaveType } from '@/types';
import type { AppRoute } from '@/App';
import { cn } from '@/lib/utils';

interface LeaveHistoryPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function LeaveHistoryPage({ navigate }: LeaveHistoryPageProps) {
  const { user } = useAuthStore();
  const { getRequestsByUser } = useLeaveStore();

  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'all',
    leaveType: 'all',
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your leave history.</p>
      </div>
    );
  }

  const myLeaveRequests = getRequestsByUser(user.id);

  // Filter leave requests
  const filteredLeaveRequests = myLeaveRequests.filter((request: LeaveRequest) => {
    // Date range filter
    if (filters.dateFrom) {
      const requestDate = new Date(request.createdAt);
      const filterDate = new Date(filters.dateFrom);
      if (requestDate < filterDate) return false;
    }
    if (filters.dateTo) {
      const requestDate = new Date(request.createdAt);
      const filterDate = new Date(filters.dateTo);
      filterDate.setHours(23, 59, 59, 999);
      if (requestDate > filterDate) return false;
    }

    // Status filter
    if (filters.status !== 'all' && request.status !== filters.status) {
      return false;
    }

    // Leave type filter
    if (filters.leaveType !== 'all' && request.leaveType !== filters.leaveType) {
      return false;
    }

    return true;
  });

  const getLeaveTypeColor = (type: LeaveType) => {
    switch (type) {
      case 'ANNUAL': return 'bg-blue-100 text-blue-700';
      case 'SICK': return 'bg-orange-100 text-orange-700';
      case 'EMERGENCY': return 'bg-red-100 text-red-700';
      case 'UNPAID': return 'bg-gray-100 text-gray-700';
      case 'MATERNITY': return 'bg-pink-100 text-pink-700';
      case 'PATERNITY': return 'bg-purple-100 text-purple-700';
      case 'COMPASSIONATE': return 'bg-indigo-100 text-indigo-700';
      case 'STUDY': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'CANCELLED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      status: 'all',
      leaveType: 'all',
    });
  };

  const stats = {
    total: myLeaveRequests.length,
    pending: myLeaveRequests.filter(r => r.status === 'PENDING').length,
    approved: myLeaveRequests.filter(r => r.status === 'APPROVED').length,
    rejected: myLeaveRequests.filter(r => r.status === 'REJECTED').length,
    totalDays: myLeaveRequests.filter(r => r.status === 'APPROVED').reduce((sum, r) => sum + r.numberOfDays, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leave History</h1>
          <p className="text-gray-500 mt-1">
            View all your leave requests and their status
          </p>
        </div>
        <Button onClick={() => navigate('leave-management')}>
          <Calendar className="w-4 h-4 mr-2" />
          Back to Leave Management
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
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
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDays}</p>
                <p className="text-sm text-gray-500">Days Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leave Request History</CardTitle>
              <CardDescription>All your leave requests and their status</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select
                value={filters.leaveType}
                onValueChange={(value) => setFilters({ ...filters, leaveType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
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
          </div>
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
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Submitted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No leave requests found</p>
                    </td>
                  </tr>
                ) : (
                  filteredLeaveRequests.map((request) => (
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
                        <p className="text-sm">{new Date(request.createdAt).toLocaleDateString('en-GB')}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setViewDialogOpen(true);
                          }}
                        >
                          View Details
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

      {/* View Request Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
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
                  <Label className="text-gray-500">Request Number</Label>
                  <p className="font-mono font-medium">{selectedRequest.requestNumber}</p>
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
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded border">{selectedRequest.description}</p>
              </div>

              <div>
                <Label className="text-gray-500">Status</Label>
                <Badge variant="secondary" className={cn('mt-1', getStatusColor(selectedRequest.status))}>
                  {selectedRequest.status}
                </Badge>
              </div>

              <div>
                <Label className="text-gray-500">Submitted On</Label>
                <p className="text-sm">{new Date(selectedRequest.createdAt).toLocaleString('en-GB')}</p>
              </div>

              {selectedRequest.hrComment && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-blue-700">HR Manager Comment</Label>
                  <p className="text-sm text-blue-600 mt-1">{selectedRequest.hrComment}</p>
                  {selectedRequest.reviewedAt && (
                    <p className="text-xs text-blue-500 mt-1">
                      Reviewed on {new Date(selectedRequest.reviewedAt).toLocaleString('en-GB')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}