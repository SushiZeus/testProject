import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Receipt, RefreshCw, Trash2, Clock, DollarSign } from 'lucide-react';
import type { PettyCashRequest, User } from '@/types';
import { cn } from '@/lib/utils';

interface PettyCashTableProps {
  requests: PettyCashRequest[];
  user: User | null;
  statusColors: Record<string, string>;
  onView: (request: PettyCashRequest) => void;
  onApprove?: (request: PettyCashRequest) => void;
  onReject?: (request: PettyCashRequest) => void;
  onProcess?: (request: PettyCashRequest) => void;
  onResubmit?: (request: PettyCashRequest) => void;
  onDelete?: (request: PettyCashRequest) => void;
  onWaiting?: (request: PettyCashRequest) => void;
  onApproved?: (request: PettyCashRequest) => void;
  onPaid?: (request: PettyCashRequest) => void;
  showApproveReject?: boolean;
  showProcess?: boolean;
  showFinanceButtons?: boolean;
  showPaidButton?: boolean;
}

export function PettyCashTable({
  requests,
  user,
  statusColors,
  onView,
  onApprove,
  onReject,
  onProcess,
  onResubmit,
  onDelete,
  onWaiting,
  onApproved,
  onPaid,
  showApproveReject = false,
  showProcess = false,
  showFinanceButtons = false,
  showPaidButton = false,
}: PettyCashTableProps) {
  if (requests.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">No requests found</p>
        <p className="text-sm mt-1">Requests will appear here when available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Request #</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Requester</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4">
                <p className="font-mono font-medium text-blue-600">{request.requestNumber}</p>
              </td>
              <td className="py-4 px-4">
                <p className="font-medium text-gray-900">{request.requester?.name}</p>
                <p className="text-xs text-gray-500">{request.requester?.role.replace(/_/g, ' ')}</p>
              </td>
              <td className="py-4 px-4">
                <p className="font-semibold text-gray-900">
                  {request.currency} {request.amount.toLocaleString()}
                </p>
              </td>
              <td className="py-4 px-4">
                <Badge variant="secondary" className={cn('text-xs font-medium', statusColors[request.status])}>
                  {request.status.replace(/_/g, ' ')}
                </Badge>
              </td>
              <td className="py-4 px-4">
                <p className="text-sm text-gray-600">
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(request.createdAt).toLocaleTimeString()}
                </p>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onView(request)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    View
                  </Button>

                  {/* Approve/Reject buttons for managers */}
                  {showApproveReject && onApprove && onReject && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300" 
                        onClick={() => onApprove(request)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300" 
                        onClick={() => onReject(request)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}

                  {/* Finance Manager: WAITING/APPROVED buttons */}
                  {showFinanceButtons && onWaiting && onApproved && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300" 
                        onClick={() => onWaiting(request)}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Waiting
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white" 
                        onClick={() => onApproved(request)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approved
                      </Button>
                    </>
                  )}

                  {/* Cashier: PAID button */}
                  {showPaidButton && onPaid && (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white" 
                      onClick={() => onPaid(request)}
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Mark as Paid
                    </Button>
                  )}

                  {/* Process button */}
                  {showProcess && onProcess && (
                    <Button 
                      size="sm" 
                      onClick={() => onProcess(request)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Process
                    </Button>
                  )}

                  {/* Resubmit button for rejected requests */}
                  {request.requestedBy === user?.id && onResubmit && (
                    request.status === 'REJECTED_BY_HR' ||
                    request.status === 'REJECTED_BY_MANAGER' ||
                    request.status === 'REJECTED_BY_DECLARATION_MANAGER' ||
                    request.status === 'REJECTED_BY_COO'
                  ) && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300" 
                      onClick={() => onResubmit(request)}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Resubmit
                    </Button>
                  )}

                  {/* Delete button - only for request owner */}
                  {request.requestedBy === user?.id && onDelete && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300" 
                      onClick={() => onDelete(request)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
