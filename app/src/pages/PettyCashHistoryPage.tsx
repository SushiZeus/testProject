import { useState } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const { requests } = usePettyCashStore();

  const [activeTab, setActiveTab] = useState('made');
  const [selectedRequest, setSelectedRequest] = useState<PettyCashRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  if (!user) return null;

  // Filter requests based on user's actions
  const requestsMade = requests.filter(r => r.requestedBy === user.id);
  
  const requestsApproved = requests.filter(r => 
    (r.hrManagerId === user.id && r.status !== 'REJECTED_BY_HR' && r.hrActionAt) ||
    (r.managerId === user.id && r.status !== 'REJECTED_BY_MANAGER' && r.managerActionAt) ||
    (r.declarationManagerId === user.id && r.status !== 'REJECTED_BY_DECLARATION_MANAGER' && r.declarationManagerActionAt) ||
    (r.cooId === user.id && r.status !== 'REJECTED_BY_COO' && r.cooActionAt) ||
    (r.financeManagerId === user.id && r.status !== 'REJECTED_BACK_TO_CLERK' && r.financeActionAt)
  );

  const requestsRejected = requests.filter(r =>
    (r.hrManagerId === user.id && r.status === 'REJECTED_BY_HR') ||
    (r.managerId === user.id && r.status === 'REJECTED_BY_MANAGER') ||
    (r.declarationManagerId === user.id && r.status === 'REJECTED_BY_DECLARATION_MANAGER') ||
    (r.cooId === user.id && r.status === 'REJECTED_BY_COO') ||
    (r.financeManagerId === user.id && r.status === 'REJECTED_BACK_TO_CLERK')
  );

  const requestsPaid = requests.filter(r => r.cashierId === user.id && r.status === 'PAID');

  const statusColors: Record<PettyCashStatus, string> = {
    PENDING_HR_APPROVAL: 'bg-amber-100 text-amber-700',
    PENDING_MANAGER_APPROVAL: 'bg-amber-100 text-amber-700',
    PENDING_DECLARATION_MANAGER_APPROVAL: 'bg-amber-100 text-amber-700',
    PENDING_COO_APPROVAL: 'bg-amber-100 text-amber-700',
    APPROVED_BY_COO: 'bg-blue-100 text-blue-700',
    COO_DIRECT_TO_FINANCE: 'bg-blue-100 text-blue-700',
    REJECTED_BY_HR: 'bg-red-100 text-red-700',
    REJECTED_BY_MANAGER: 'bg-red-100 text-red-700',
    REJECTED_BY_DECLARATION_MANAGER: 'bg-red-100 text-red-700',
    REJECTED_BY_COO: 'bg-red-100 text-red-700',
    PENDING_FINANCE: 'bg-purple-100 text-purple-700',
    PENDING_PAYMENT: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
    REJECTED_BACK_TO_CLERK: 'bg-red-100 text-red-700',
  };

  const getTimeline = (request: PettyCashRequest) => {
    const timeline = [];

    timeline.push({
      title: 'Request Created',
      user: request.requester?.name || 'Unknown',
      date: request.createdAt,
      status: 'created',
    });

    if (request.hrActionAt) {
      timeline.push({
        title: request.status === 'REJECTED_BY_HR' ? 'Rejected by HR Manager' : 'Approved by HR Manager',
        user: request.hrManager?.name || 'HR Manager',
        comment: request.hrComment,
        date: request.hrActionAt,
        status: request.status === 'REJECTED_BY_HR' ? 'rejected' : 'approved',
      });
    }

    if (request.managerActionAt) {
      timeline.push({
        title: request.status === 'REJECTED_BY_MANAGER' ? 'Rejected by Manager' : 'Approved by Manager',
        user: request.manager?.name || 'Manager',
        comment: request.managerComment,
        date: request.managerActionAt,
        status: request.status === 'REJECTED_BY_MANAGER' ? 'rejected' : 'approved',
      });
    }

    if (request.declarationManagerActionAt) {
      timeline.push({
        title: request.status === 'REJECTED_BY_DECLARATION_MANAGER' ? 'Rejected by Declaration Manager' : 'Approved by Declaration Manager',
        user: request.declarationManager?.name || 'Declaration Manager',
        comment: request.declarationManagerComment,
        date: request.declarationManagerActionAt,
        status: request.status === 'REJECTED_BY_DECLARATION_MANAGER' ? 'rejected' : 'approved',
      });
    }

    if (request.cooActionAt) {
      timeline.push({
        title: request.status === 'REJECTED_BY_COO' ? 'Rejected by COO' : 'Approved by COO',
        user: request.coo?.name || 'COO',
        comment: request.cooComment,
        date: request.cooActionAt,
        status: request.status === 'REJECTED_BY_COO' ? 'rejected' : 'approved',
      });
    }

    if (request.financeActionAt) {
      timeline.push({
        title: request.status === 'REJECTED_BACK_TO_CLERK' ? 'Rejected by Finance Manager' : 'Approved by Finance Manager',
        user: request.financeManager?.name || 'Finance Manager',
        comment: request.financeComment,
        date: request.financeActionAt,
        status: request.status === 'REJECTED_BACK_TO_CLERK' ? 'rejected' : 'approved',
      });
    }

    if (request.paidAt) {
      timeline.push({
        title: 'Payment Completed',
        user: request.cashier?.name || 'Cashier',
        date: request.paidAt,
        status: 'paid',
        paymentRef: request.paymentReference,
      });
    }

    return timeline;
  };

  const renderRequestTable = (requestsList: PettyCashRequest[], emptyMessage: string) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-gray-500">Request #</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requestsList.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            requestsList.map((request: PettyCashRequest) => (
              <tr key={request.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <p className="font-mono font-medium text-blue-600">{request.requestNumber}</p>
                  {request.file && (
                    <p className="text-xs text-gray-500">File: {request.file.fileNumber}</p>
                  )}
                </td>
                <td className="py-4 px-4">
                  <p className="font-semibold">{request.currency} {request.amount.toLocaleString()}</p>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm line-clamp-2">{request.description}</p>
                </td>
                <td className="py-4 px-4">
                  <Badge variant="secondary" className={cn('text-xs', statusColors[request.status])}>
                    {request.status.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm">{new Date(request.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleTimeString()}</p>
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
                    View Timeline
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const stats = {
    made: requestsMade.length,
    approved: requestsApproved.length,
    rejected: requestsRejected.length,
    paid: requestsPaid.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Petty Cash History</h1>
          <p className="text-gray-500 mt-1">
            View your petty cash request history and actions
          </p>
        </div>
        <Button onClick={() => navigate('petty-cash')}>
          <DollarSign className="w-4 h-4 mr-2" />
          Back to Petty Cash
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.made}</p>
                <p className="text-sm text-gray-500">Requests Made</p>
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
                <p className="text-2xl font-bold">{stats.paid}</p>
                <p className="text-sm text-gray-500">Paid Out</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="made">
            Requests Made ({stats.made})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({stats.rejected})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid Out ({stats.paid})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="made" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Requests You Made</CardTitle>
              <CardDescription>All petty cash requests you have submitted</CardDescription>
            </CardHeader>
            <CardContent>
              {renderRequestTable(requestsMade, 'You have not made any petty cash requests')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Requests You Approved</CardTitle>
              <CardDescription>All petty cash requests you have approved</CardDescription>
            </CardHeader>
            <CardContent>
              {renderRequestTable(requestsApproved, 'You have not approved any petty cash requests')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Requests You Rejected</CardTitle>
              <CardDescription>All petty cash requests you have rejected</CardDescription>
            </CardHeader>
            <CardContent>
              {renderRequestTable(requestsRejected, 'You have not rejected any petty cash requests')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Requests You Paid</CardTitle>
              <CardDescription>All petty cash requests you have paid out</CardDescription>
            </CardHeader>
            <CardContent>
              {renderRequestTable(requestsPaid, 'You have not paid out any petty cash requests')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Timeline</DialogTitle>
            <DialogDescription>
              {selectedRequest && `Complete history for request ${selectedRequest.requestNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Request Number:</span>
                    <p className="font-mono font-medium">{selectedRequest.requestNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <p className="font-semibold">{selectedRequest.currency} {selectedRequest.amount.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Description:</span>
                    <p>{selectedRequest.description}</p>
                  </div>
                  {selectedRequest.file && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Related File:</span>
                      <p className="font-mono">{selectedRequest.file.fileNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Timeline of Events</h4>
                {getTimeline(selectedRequest).map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        event.status === 'created' ? 'bg-blue-100' :
                        event.status === 'approved' ? 'bg-green-100' :
                        event.status === 'rejected' ? 'bg-red-100' :
                        'bg-purple-100'
                      )}>
                        {event.status === 'created' && <Clock className="w-4 h-4 text-blue-600" />}
                        {event.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {event.status === 'rejected' && <XCircle className="w-4 h-4 text-red-600" />}
                        {event.status === 'paid' && <DollarSign className="w-4 h-4 text-purple-600" />}
                      </div>
                      {index < getTimeline(selectedRequest).length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.user}</p>
                      {event.comment && (
                        <p className="text-sm text-gray-600 mt-1 italic">"{event.comment}"</p>
                      )}
                      {event.paymentRef && (
                        <p className="text-sm text-gray-600 mt-1">Ref: {event.paymentRef}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
