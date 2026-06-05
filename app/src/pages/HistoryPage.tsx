import { useState } from 'react';
import { Calendar, Clock, DollarSign, FileText, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { usePettyCashStore } from '@/store/pettyCashStore';
import { useLeaveStore } from '@/store/leaveStore';
import type { PettyCashRequest, LeaveRequest, LeaveType } from '@/types';

export function HistoryPage() {
  const { user } = useAuthStore();
  const { getRequestsByRequester } = usePettyCashStore();
  const { getRequestsByUser } = useLeaveStore();

  const [activeTab, setActiveTab] = useState('petty-cash');
  const [pettyCashFilters, setPettyCashFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'all',
    amountMin: '',
    amountMax: '',
  });
  const [leaveFilters, setLeaveFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'all',
    leaveType: 'all',
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your history.</p>
      </div>
    );
  }

  const myPettyCashRequests = getRequestsByRequester(user.id);
  const myLeaveRequests = getRequestsByUser(user.id);

  // Filter petty cash requests
  const filteredPettyCashRequests = myPettyCashRequests.filter((request: PettyCashRequest) => {
    // Date range filter
    if (pettyCashFilters.dateFrom) {
      const requestDate = new Date(request.createdAt);
      const filterDate = new Date(pettyCashFilters.dateFrom);
      if (requestDate < filterDate) return false;
    }
    if (pettyCashFilters.dateTo) {
      const requestDate = new Date(request.createdAt);
      const filterDate = new Date(pettyCashFilters.dateTo);
      filterDate.setHours(23, 59, 59, 999);
      if (requestDate > filterDate) return false;
    }

    // Status filter
    if (pettyCashFilters.status !== 'all' && request.status !== pettyCashFilters.status) {
      return false;
    }

    // Amount filter
    if (pettyCashFilters.amountMin && request.amount < parseFloat(pettyCashFilters.amountMin)) {
      return false;
    }
    if (pettyCashFilters.amountMax && request.amount > parseFloat(pettyCashFilters.amountMax)) {
      return false;
    }

    return true;
  });

  // Filter leave requests
  const filteredLeaveRequests = myLeaveRequests.filter((request: LeaveRequest) => {
    // Date range filter
    if (leaveFilters.dateFrom) {
      const requestDate = new Date(request.createdAt);
      const filterDate = new Date(leaveFilters.dateFrom);
      if (requestDate < filterDate) return false;
    }
    if (leaveFilters.dateTo) {
      const requestDate = new Date(request.createdAt);
      const filterDate = new Date(leaveFilters.dateTo);
      filterDate.setHours(23, 59, 59, 999);
      if (requestDate > filterDate) return false;
    }

    // Status filter
    if (leaveFilters.status !== 'all' && request.status !== leaveFilters.status) {
      return false;
    }

    // Leave type filter
    if (leaveFilters.leaveType !== 'all' && request.leaveType !== leaveFilters.leaveType) {
      return false;
    }

    return true;
  });

  const getStatusColor = (status: string) => {
    if (status.includes('PENDING')) return 'bg-yellow-100 text-yellow-700';
    if (status.includes('APPROVED') || status === 'PAID') return 'bg-green-100 text-green-700';
    if (status.includes('REJECTED') || status === 'CANCELLED') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

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

  const clearPettyCashFilters = () => {
    setPettyCashFilters({
      dateFrom: '',
      dateTo: '',
      status: 'all',
      amountMin: '',
      amountMax: '',
    });
  };

  const clearLeaveFilters = () => {
    setLeaveFilters({
      dateFrom: '',
      dateTo: '',
      status: 'all',
      leaveType: 'all',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Request History</h1>
          <p className="text-gray-500 mt-1">
            View all your petty cash and leave requests
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myPettyCashRequests.length}</p>
                <p className="text-sm text-gray-500">Petty Cash Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myLeaveRequests.length}</p>
                <p className="text-sm text-gray-500">Leave Requests</p>
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
                <p className="text-2xl font-bold">
                  {[...myPettyCashRequests, ...myLeaveRequests].filter(r => 
                    r.status.includes('PENDING')
                  ).length}
                </p>
                <p className="text-sm text-gray-500">Pending Requests</p>
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
                <p className="text-2xl font-bold">
                  {[...myPettyCashRequests, ...myLeaveRequests].filter(r => 
                    r.status.includes('APPROVED') || r.status === 'PAID'
                  ).length}
                </p>
                <p className="text-sm text-gray-500">Approved Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="petty-cash">
            Petty Cash History ({myPettyCashRequests.length})
          </TabsTrigger>
          <TabsTrigger value="leave">
            Leave History ({myLeaveRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Petty Cash History Tab */}
        <TabsContent value="petty-cash" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Petty Cash Request History</CardTitle>
                  <CardDescription>All your petty cash requests and their status</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={clearPettyCashFilters}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={pettyCashFilters.dateFrom}
                    onChange={(e) => setPettyCashFilters({ ...pettyCashFilters, dateFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={pettyCashFilters.dateTo}
                    onChange={(e) => setPettyCashFilters({ ...pettyCashFilters, dateTo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={pettyCashFilters.status}
                    onValueChange={(value) => setPettyCashFilters({ ...pettyCashFilters, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING_HR_APPROVAL">Pending HR</SelectItem>
                      <SelectItem value="PENDING_MANAGER_APPROVAL">Pending Manager</SelectItem>
                      <SelectItem value="PENDING_COO_APPROVAL">Pending COO</SelectItem>
                      <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="REJECTED_BY_HR">Rejected by HR</SelectItem>
                      <SelectItem value="REJECTED_BY_MANAGER">Rejected by Manager</SelectItem>
                      <SelectItem value="REJECTED_BY_COO">Rejected by COO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Min Amount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={pettyCashFilters.amountMin}
                    onChange={(e) => setPettyCashFilters({ ...pettyCashFilters, amountMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Amount</Label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={pettyCashFilters.amountMax}
                    onChange={(e) => setPettyCashFilters({ ...pettyCashFilters, amountMax: e.target.value })}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Request #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">File</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPettyCashRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No petty cash requests found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredPettyCashRequests.map((request) => (
                        <tr key={request.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <p className="font-mono text-sm">{request.requestNumber}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold">
                              {request.currency} {request.amount.toLocaleString()}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm max-w-xs truncate" title={request.description}>
                              {request.description}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            {request.file ? (
                              <p className="text-sm text-blue-600">{request.file.fileNumber}</p>
                            ) : (
                              <p className="text-sm text-gray-500">General Request</p>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className={getStatusColor(request.status)}>
                              {request.status.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm">{new Date(request.createdAt).toLocaleDateString('en-GB')}</p>
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

        {/* Leave History Tab */}
        <TabsContent value="leave" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Leave Request History</CardTitle>
                  <CardDescription>All your leave requests and their status</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={clearLeaveFilters}>
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
                    value={leaveFilters.dateFrom}
                    onChange={(e) => setLeaveFilters({ ...leaveFilters, dateFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={leaveFilters.dateTo}
                    onChange={(e) => setLeaveFilters({ ...leaveFilters, dateTo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={leaveFilters.status}
                    onValueChange={(value) => setLeaveFilters({ ...leaveFilters, status: value })}
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
                    value={leaveFilters.leaveType}
                    onValueChange={(value) => setLeaveFilters({ ...leaveFilters, leaveType: value })}
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaveRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}