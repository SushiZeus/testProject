import { useState } from 'react';
import { Plus, Search, DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { usePayrollStore } from '@/store/payrollStore';
import type { PayrollRun, PayrollStatus } from '@/types/hr';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PayrollPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

const statusColors: Record<PayrollStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  LOCKED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  PAID: 'bg-emerald-100 text-emerald-700',
};

export function PayrollPage({ navigate }: PayrollPageProps) {
  const { user } = useAuthStore();
  const { payrollRuns, createPayrollRun } = usePayrollStore();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPayroll, setNewPayroll] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  if (!user) return null;

  const canCreate = user.role === 'hr_manager' || user.role === 'administrator';

  const handleCreatePayroll = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const period = `${monthNames[newPayroll.month - 1]} ${newPayroll.year}`;
    
    // Check if payroll already exists for this period
    const existing = payrollRuns.find(r => r.month === newPayroll.month && r.year === newPayroll.year);
    if (existing) {
      toast.error('Payroll already exists for this period');
      return;
    }

    const newRun = createPayrollRun({
      period,
      month: newPayroll.month,
      year: newPayroll.year,
      createdBy: user.name,
    });
    
    toast.success('Payroll run created');
    setCreateDialogOpen(false);
    navigate('payroll/:id', { id: newRun.id });
  };

  const filteredRuns = payrollRuns.filter(run =>
    run.runNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    run.period.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalRuns: payrollRuns.length,
    draft: payrollRuns.filter(r => r.status === 'DRAFT').length,
    approved: payrollRuns.filter(r => r.status === 'APPROVED').length,
    paid: payrollRuns.filter(r => r.status === 'PAID').length,
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-500 mt-1">
            Manage employee payroll runs
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Payroll Run
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRuns}</p>
                <p className="text-sm text-gray-500">Total Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-sm text-gray-500">Draft</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
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
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.paid}</p>
                <p className="text-sm text-gray-500">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Payroll Runs</CardTitle>
              <CardDescription>View and manage payroll runs</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search payroll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Run Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Period</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Employees</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Gross Pay</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Net Pay</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No payroll runs found</p>
                      {canCreate && (
                        <Button onClick={() => setCreateDialogOpen(true)} variant="outline" className="mt-4">
                          Create Your First Payroll Run
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredRuns.map((run: PayrollRun) => (
                    <tr key={run.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-mono font-medium text-blue-600">{run.runNumber}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{run.period}</p>
                        <p className="text-xs text-gray-500">{formatDate(run.createdAt)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm">{run.totalEmployees} employees</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{formatCurrency(run.totalGrossPay)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-green-600">{formatCurrency(run.totalNetPay)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={cn('text-xs', statusColors[run.status])}>
                          {run.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('payroll/:id', { id: run.id })}
                        >
                          View
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

      {/* Create Payroll Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payroll Run</DialogTitle>
            <DialogDescription>
              Create a new payroll run for a specific period
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Month *</Label>
              <select
                value={newPayroll.month}
                onChange={(e) => setNewPayroll({ ...newPayroll, month: parseInt(e.target.value) })}
                className="w-full h-10 px-3 rounded-md border border-gray-300"
              >
                <option value={1}>January</option>
                <option value={2}>February</option>
                <option value={3}>March</option>
                <option value={4}>April</option>
                <option value={5}>May</option>
                <option value={6}>June</option>
                <option value={7}>July</option>
                <option value={8}>August</option>
                <option value={9}>September</option>
                <option value={10}>October</option>
                <option value={11}>November</option>
                <option value={12}>December</option>
              </select>
            </div>
            <div>
              <Label>Year *</Label>
              <Input
                type="number"
                value={newPayroll.year}
                onChange={(e) => setNewPayroll({ ...newPayroll, year: parseInt(e.target.value) })}
                min={2020}
                max={2030}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePayroll}>Create Payroll</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
