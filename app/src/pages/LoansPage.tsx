import { useState } from 'react';
import { Plus, Search, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLoansStore } from '@/store/loansStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import type { AppRoute } from '@/App';

interface LoansPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function LoansPage({ navigate }: LoansPageProps) {
  const { user: currentUser } = useAuthStore();
  const { loans, createLoan } = useLoansStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'my-loans' | 'pending'>('my-loans');
  const [showNewLoan, setShowNewLoan] = useState(false);
  const [loanData, setLoanData] = useState({
    amount: 0,
    purpose: '',
    repaymentMonths: 12,
  });

  const myLoans = loans.filter(l => l.employeeId === currentUser?.id);
  const pendingApprovals = loans.filter(l => {
    if (currentUser?.role === 'hr_manager') return l.status === 'MANAGER_APPROVED';
    if (currentUser?.role === 'finance_manager') return l.status === 'HR_APPROVED';
    return false;
  });

  const displayLoans = activeTab === 'my-loans' ? myLoans : pendingApprovals;
  const filteredLoans = displayLoans.filter(l =>
    l.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateLoan = () => {
    if (!loanData.amount || !loanData.purpose || !currentUser) {
      toast.error('Please fill all required fields');
      return;
    }

    createLoan({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department || 'General',
      amount: loanData.amount,
      purpose: loanData.purpose,
      repaymentMonths: loanData.repaymentMonths,
    });

    toast.success('Loan application submitted');
    setLoanData({ amount: 0, purpose: '', repaymentMonths: 12 });
    setShowNewLoan(false);
  };

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

  const totalLoans = myLoans.length;
  const activeLoans = myLoans.filter(l => l.status === 'REPAYING').length;
  const totalBorrowed = myLoans.reduce((sum, l) => sum + l.amount, 0);
  const totalOutstanding = myLoans.reduce((sum, l) => sum + l.balance, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Loans</h1>
        <Dialog open={showNewLoan} onOpenChange={setShowNewLoan}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Apply for Loan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Loan Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Loan Amount (TZS)</Label>
                <Input
                  type="number"
                  value={loanData.amount}
                  onChange={(e) => setLoanData({ ...loanData, amount: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Purpose</Label>
                <Textarea
                  value={loanData.purpose}
                  onChange={(e) => setLoanData({ ...loanData, purpose: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Repayment Period (Months)</Label>
                <Input
                  type="number"
                  value={loanData.repaymentMonths}
                  onChange={(e) => setLoanData({ ...loanData, repaymentMonths: parseInt(e.target.value) })}
                />
              </div>
              {loanData.amount > 0 && loanData.repaymentMonths > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Monthly Repayment</div>
                  <div className="text-xl font-bold">
                    TZS {(loanData.amount / loanData.repaymentMonths).toLocaleString()}
                  </div>
                </div>
              )}
              <Button onClick={handleCreateLoan} className="w-full">Submit Application</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLoans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activeLoans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Total Borrowed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TZS {totalBorrowed.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">TZS {totalOutstanding.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'my-loans' ? 'default' : 'outline'}
                onClick={() => setActiveTab('my-loans')}
              >
                My Loans
              </Button>
              {(currentUser?.role === 'hr_manager' || currentUser?.role === 'finance_manager') && (
                <Button
                  variant={activeTab === 'pending' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('pending')}
                >
                  Pending Approvals ({pendingApprovals.length})
                </Button>
              )}
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLoans.map((loan) => (
              <div
                key={loan.id}
                className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate('loans/:id', { id: loan.id })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold">{loan.loanNumber}</div>
                      <Badge className={statusColors[loan.status]}>{loan.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{loan.employeeName}</div>
                    <div className="text-sm mt-1">{loan.purpose}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">TZS {loan.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      Balance: TZS {loan.balance.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {loan.repaymentMonths} months @ TZS {(loan.amount / loan.repaymentMonths).toLocaleString()}/mo
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredLoans.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No loans found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
