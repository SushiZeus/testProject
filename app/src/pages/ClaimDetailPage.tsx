import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { useClaimsStore } from '@/store/claimsStore';
import type { ClaimItem, ClaimStatus } from '@/types/hr';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClaimDetailPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
  claimId: string;
}

const statusColors: Record<ClaimStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  MANAGER_APPROVED: 'bg-green-100 text-green-700',
  MANAGER_REJECTED: 'bg-red-100 text-red-700',
  HR_APPROVED: 'bg-green-100 text-green-700',
  HR_REJECTED: 'bg-red-100 text-red-700',
  FINANCE_APPROVED: 'bg-green-100 text-green-700',
  FINANCE_REJECTED: 'bg-red-100 text-red-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export function ClaimDetailPage({ navigate, claimId }: ClaimDetailPageProps) {
  const { user } = useAuthStore();
  const { getClaimById, addClaimItem, removeClaimItem, submitClaim, approveClaim, rejectClaim, markAsPaid } = useClaimsStore();
  
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  
  const [newItem, setNewItem] = useState({
    description: '',
    receiptDate: '',
    amount: '',
    category: 'Travel',
  });

  const [approvalData, setApprovalData] = useState({
    approvedAmount: '',
    comments: '',
  });

  const [rejectionComments, setRejectionComments] = useState('');

  const claim = getClaimById(claimId);

  if (!claim || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500">Claim not found</p>
          <Button onClick={() => navigate('claims')} variant="outline" className="mt-4">
            Back to Claims
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = claim.employeeId === user.id;
  const canEdit = isOwner && claim.status === 'DRAFT';
  const canSubmit = isOwner && claim.status === 'DRAFT' && claim.items.length > 0;
  
  const canApprove = 
    (user.role.includes('manager') && !user.role.includes('hr') && !user.role.includes('finance') && claim.status === 'SUBMITTED') ||
    (user.role === 'hr_manager' && claim.status === 'MANAGER_APPROVED') ||
    (user.role === 'finance_manager' && claim.status === 'HR_APPROVED');

  const canMarkPaid = user.role === 'cashier' && claim.status === 'FINANCE_APPROVED';

  const handleAddItem = () => {
    if (!newItem.description || !newItem.receiptDate || !newItem.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(newItem.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    addClaimItem(claimId, {
      description: newItem.description,
      receiptDate: new Date(newItem.receiptDate),
      amount,
      category: newItem.category,
    });

    toast.success('Item added successfully');
    setNewItem({ description: '', receiptDate: '', amount: '', category: 'Travel' });
    setAddItemDialogOpen(false);
  };

  const handleRemoveItem = (itemId: string) => {
    removeClaimItem(claimId, itemId);
    toast.success('Item removed');
  };

  const handleSubmit = () => {
    submitClaim(claimId);
    toast.success('Claim submitted for approval');
  };

  const handleApprove = () => {
    const approvedAmount = approvalData.approvedAmount ? parseFloat(approvalData.approvedAmount) : claim.totalAmount;
    
    if (isNaN(approvedAmount) || approvedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (approvedAmount > claim.totalAmount) {
      toast.error('Approved amount cannot exceed claimed amount');
      return;
    }

    approveClaim(claimId, user.id, user.name, user.role, approvedAmount, approvalData.comments);
    toast.success('Claim approved');
    setApproveDialogOpen(false);
    setApprovalData({ approvedAmount: '', comments: '' });
  };

  const handleReject = () => {
    if (!rejectionComments.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    rejectClaim(claimId, user.id, user.name, user.role, rejectionComments);
    toast.success('Claim rejected');
    setRejectDialogOpen(false);
    setRejectionComments('');
  };

  const handleMarkPaid = () => {
    markAsPaid(claimId);
    toast.success('Claim marked as paid');
  };

  const formatCurrency = (amount: number) => {
    return `TZS ${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('claims')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{claim.claimNumber}</h1>
          <p className="text-gray-500 mt-1">
            {claim.employeeName} • {claim.department}
          </p>
        </div>
        <Badge className={cn('text-sm', statusColors[claim.status])}>
          {claim.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold">{formatCurrency(claim.totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Approved Amount</p>
            <p className="text-2xl font-bold text-green-600">
              {claim.approvedAmount > 0 ? formatCurrency(claim.approvedAmount) : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Items</p>
            <p className="text-2xl font-bold">{claim.items.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Claim Items</CardTitle>
            {canEdit && (
              <Button size="sm" onClick={() => setAddItemDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {claim.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No items added yet</p>
              {canEdit && (
                <Button onClick={() => setAddItemDialogOpen(true)} variant="outline" className="mt-4">
                  Add Your First Item
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                    {canEdit && <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {claim.items.map((item: ClaimItem) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <p className="font-medium">{item.description}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">{item.category}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm">{formatDate(item.receiptDate)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{formatCurrency(item.amount)}</p>
                      </td>
                      {canEdit && (
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {claim.approvals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Approval History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {claim.approvals.map((approval) => (
                <div key={approval.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    approval.decision === 'APPROVED' ? 'bg-green-100' : 'bg-red-100'
                  )}>
                    {approval.decision === 'APPROVED' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{approval.approverName}</p>
                      <p className="text-sm text-gray-500">{formatDate(approval.approvedAt)}</p>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">{approval.approverRole.replace(/_/g, ' ')}</p>
                    {approval.approvedAmount && (
                      <p className="text-sm text-green-600 mt-1">
                        Approved Amount: {formatCurrency(approval.approvedAmount)}
                      </p>
                    )}
                    {approval.comments && (
                      <p className="text-sm text-gray-700 mt-2 italic">"{approval.comments}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        {canSubmit && (
          <Button onClick={handleSubmit}>
            Submit for Approval
          </Button>
        )}
        {canApprove && (
          <>
            <Button onClick={() => setApproveDialogOpen(true)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button variant="destructive" onClick={() => setRejectDialogOpen(true)}>
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </>
        )}
        {canMarkPaid && (
          <Button onClick={handleMarkPaid}>
            Mark as Paid
          </Button>
        )}
      </div>

      {/* Add Item Dialog */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Claim Item</DialogTitle>
            <DialogDescription>Add a new expense item to this claim</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description *</Label>
              <Input
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="e.g., Taxi fare to client meeting"
              />
            </div>
            <div>
              <Label>Category</Label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-gray-300"
              >
                <option>Travel</option>
                <option>Meals</option>
                <option>Accommodation</option>
                <option>Office Supplies</option>
                <option>Communication</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <Label>Receipt Date *</Label>
              <Input
                type="date"
                value={newItem.receiptDate}
                onChange={(e) => setNewItem({ ...newItem, receiptDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Amount (TZS) *</Label>
              <Input
                type="number"
                value={newItem.amount}
                onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Claim</DialogTitle>
            <DialogDescription>
              Review and approve this expense claim
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Claimed Amount</Label>
              <p className="text-2xl font-bold">{formatCurrency(claim.totalAmount)}</p>
            </div>
            <div>
              <Label>Approved Amount (TZS)</Label>
              <Input
                type="number"
                value={approvalData.approvedAmount}
                onChange={(e) => setApprovalData({ ...approvalData, approvedAmount: e.target.value })}
                placeholder={claim.totalAmount.toString()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to approve full amount
              </p>
            </div>
            <div>
              <Label>Comments (Optional)</Label>
              <Textarea
                value={approvalData.comments}
                onChange={(e) => setApprovalData({ ...approvalData, comments: e.target.value })}
                placeholder="Add any comments..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>Approve Claim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Claim</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this claim
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Reason for Rejection *</Label>
            <Textarea
              value={rejectionComments}
              onChange={(e) => setRejectionComments(e.target.value)}
              placeholder="Explain why this claim is being rejected..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
