import { useState } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, FileText, Filter } from 'lucide-react';
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
import { usePettyCashStore } from '@/store/pettyCashStore';
import type { PettyCashRequest, PettyCashStatus } from '@/types';
import type { AppRoute } from '@/App';
import { cn } from '@/lib/utils';

interface PettyCashHistoryPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function PettyCashHistoryPage({ navigate }: PettyCashHistoryPageProps) {
  const { user } = useAuthStore();
  const { getRequestsByRequester } = usePettyCashStore();

  const [selectedRequest, setSelectedRequest] = useState<PettyCashRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'all',
    amountMin: '',
    amountMax: '',
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your petty cash history.</p>
      </div>
    );
  }

  const myPettyCashRequests = getRequestsByRequester(user.id);

  // Filter petty cash requests
  const filteredPettyCashRequests = myPettyCashRequests.filter((request: PettyCashRequest) => {
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

    // Amount filter
    if (filters.amountMin && request.amount < parseFloat(filters.amountMin)) {
      return false;
    }
    if (filters.amountMax && request.amount > parseFloat(filters.amountMax)) {
      return false;
    }

    return true;
  });

  const getStatusColor = (status: PettyCashStatus) => {
    if (status.includes('PENDING')) return 'bg-yellow-100 text-yellow-700';
    if (status.includes('APPROVED') || status === 'PAID') return 'bg-green-100 text-green-700';
    if (status.includes('REJECTED')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      status: 'all',
      amountMin: '',
      amountMax: '',
    });
  };

  const stats = {
    total: myPettyCashRequests.length,
    pending: myPettyCashRequests.filter(r => r.status.includes('PENDING')).length,
    approved: myPettyCashRequests.filter(r => r.status.includes('APPROVED') || r.status === 'PAID').length,
    rejected: myPettyCashRequests.filter(r => r.status.includes('REJECTED')).length,
    totalAmount: myPettyCashRequests.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Petty Cash History</h1>
          <p className="text-gray-500 mt-1">
            View all your petty cash requests and their status
          </p>
        </div>
        <Button onClick={() => navigate('petty-cash')}>
          <DollarSign className="w-4 h-4 mr-2" />
          Back to Petty Cash
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
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
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">TZS {stats.totalAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Petty Cash History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Petty Cash Request History</CardTitle>
              <CardDescription>All your petty cash requests and their status</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
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
                value={filters.amountMin}
                onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Amount</Label>
              <Input
                type="number"
                placeholder="1000000"
                value={filters.amountMax}
                onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
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
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPettyCashRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
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
            <DialogTitle>Petty Cash Request Details</DialogTitle>
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
                  <Label className="text-gray-500">Amount</Label>
                  <p className="font-semibold text-lg">
                    {selectedRequest.currency} {selectedRequest.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-gray-500">Description</Label>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded border">{selectedRequest.description}</p>
              </div>

              {selectedRequest.file && (
                <div>
                  <Label className="text-gray-500">Related File</Label>
                  <p className="font-mono">{selectedRequest.file.fileNumber}</p>
                </div>
              )}

              <div>
                <Label className="text-gray-500">Status</Label>
                <Badge variant="secondary" className={cn('mt-1', getStatusColor(selectedRequest.status))}>
                  {selectedRequest.status.replace(/_/g, ' ')}
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
                </div>
              )}

              {selectedRequest.managerComment && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <Label className="text-green-700">Manager Comment</Label>
                  <p className="text-sm text-green-600 mt-1">{selectedRequest.managerComment}</p>
                </div>
              )}

              {selectedRequest.cooComment && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Label className="text-purple-700">COO Comment</Label>
                  <p className="text-sm text-purple-600 mt-1">{selectedRequest.cooComment}</p>
                </div>
              )}

              {selectedRequest.financeComment && (
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <Label className="text-indigo-700">Finance Manager Comment</Label>
                  <p className="text-sm text-indigo-600 mt-1">{selectedRequest.financeComment}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}