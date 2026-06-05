import { useState } from 'react';
import { ArrowLeft, Check, X, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useLoansStore } from '@/store/loansStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import type { AppRoute } from '@/App';

interface LoanDetailPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
  loanId: string;
}

export function LoanDetailPage({ navigate, loanId }: LoanDetailPageProps) {
  const { user: currentUser } = useAuthStore();
  const { getLoanById, approveLoan, rejectLoan } = useLoansStore();
  const loan = getLoanById(loanId);

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showDisburse, setShowDisburse] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [comment, setComment] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  if (!loan) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('loans')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Loans
        </Button>
        <div className="mt-6 text-center">Loan not found</div>
      </div>
    );
  }

  const handleApprove = () => {
    approveLoan(loanId, currentUser?.id || '');
    toast.success('Loan approved');
    setShowApprove(false);
    setComment('');
  };

  const handleReject = () => {
    if (!comment) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    rejectLoan(loanId, currentUser?.id || '');
    toast.success('Loan rejected');
    setShowReject(false);
    setComment('');
  };

  const handleDisburse = () => {
    toast.info('Disburse functionality coming soon');
    setShowDisburse(false);
  };

  const handleRecordPayment = () => {
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    toast.info('Record payment functionality coming soon');
    setShowPayment(false);
    setPaymentAmount(0);
  };

  const canApprove = 
    (loan.status === 'PENDING' && currentUser?.role === 'hr_manager') ||
    (loan.status === 'MANAGER_APPROVED' && currentUser?.role === 'hr_manager') ||
    (loan.status === 'HR_APPROVED' && currentUser?.role === 'finance_manager') ||
    currentUser?.role === 'administrator';

  const canDisburse = loan.status === 'FINANCE_APPROVED' && 
    (currentUser?.role === 'finance_manager' || currentUser?.role === 'administrator');

  const canRecordPayment = loan.status === 'REPAYING' && 
    (currentUser?.role === 'finance_manager' || currentUser?.role === 'cashier' || currentUser?.role === 'administrator');

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500',
    MANAGER_APPROVED: 'bg-blue-500',
    HR_APPROVED: 'bg-indigo-500',
    FINANCE_APPROVED: 'bg-green-500',
    DISBURSED: 'bg-purple-500',
    REPAYING: 'bg-orange-500',
    COMPLETED: 'bg-gray-500',
    REJECTED: 'bg-red-500',
    CANCELLED: 'bg-gray-400',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('loans')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{loan.loanNumber}</h1>
            <p className="text-muted-foreground">{loan.employeeName}</p>
          </div>
          <Badge className={statusColors[loan.status]}>{loan.status}</Badge>
        </div>
        <div className="flex gap-2">
          {canApprove && (
            <>
              <Button onClick={() => setShowApprove(true)} variant="default">
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button onClick={() => setShowReject(true)} variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
          {canDisburse && (
            <Button onClick={() => setShowDisburse(true)} variant="default">
              <DollarSign className="mr-2 h-4 w-4" />
              Disburse
            </Button>
          )}
          {canRecordPayment && (
            <Button onClick={() => setShowPayment(true)} variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Loan Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TZS {loan.amount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">TZS {loan.balance.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TZS {(loan.amount / loan.repaymentMonths).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Repayment Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loan.repaymentMonths} months</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Employee</div>
              <div className="font-medium">{loan.employeeName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Department</div>
              <div className="font-medium">{loan.department}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Purpose</div>
              <div className="font-medium">{loan.purpose}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Application Date</div>
              <div className="font-medium">{loan.createdAt.toLocaleDateString()}</div>
            </div>
            {loan.disbursedAt && (
              <div>
                <div className="text-sm text-muted-foreground">Disbursed Date</div>
                <div className="font-medium">{loan.disbursedAt.toLocaleDateString()}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Approval history will be displayed here
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {false && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Payment history will be displayed here
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showApprove} onOpenChange={setShowApprove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Loan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Comments (Optional)</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleApprove} className="w-full">Approve Loan</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Loan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Rejection</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                required
              />
            </div>
            <Button onClick={handleReject} variant="destructive" className="w-full">Reject Loan</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDisburse} onOpenChange={setShowDisburse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disburse Loan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Amount to Disburse</div>
              <div className="text-2xl font-bold">TZS {loan.amount.toLocaleString()}</div>
            </div>
            <p className="text-sm text-muted-foreground">
              This will mark the loan as disbursed and start the repayment period.
            </p>
            <Button onClick={handleDisburse} className="w-full">Confirm Disbursement</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Payment Amount (TZS)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Current Balance</div>
              <div className="text-xl font-bold">TZS {loan.balance.toLocaleString()}</div>
            </div>
            <Button onClick={handleRecordPayment} className="w-full">Record Payment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
