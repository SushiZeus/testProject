import { useState } from 'react';
import { ArrowLeft, Plus, Lock, Check, DollarSign, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePayrollStore } from '@/store/payrollStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import type { AppRoute } from '@/App';

interface PayrollRunDetailPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
  runId: string;
}

export function PayrollRunDetailPage({ navigate, runId }: PayrollRunDetailPageProps) {
  const { user: currentUser } = useAuthStore();
  const { getPayrollById, lockPayroll, approvePayroll } = usePayrollStore();
  const payroll = getPayrollById(runId);

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    employeeId: '',
    employeeName: '',
    basicSalary: 0,
    allowances: 0,
  });

  if (!payroll) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('payroll')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payroll
        </Button>
        <div className="mt-6 text-center">Payroll run not found</div>
      </div>
    );
  }

  const handleAddEmployee = () => {
    if (!employeeData.employeeId || !employeeData.employeeName || employeeData.basicSalary <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    toast.info('Add employee functionality coming soon');
    setEmployeeData({ employeeId: '', employeeName: '', basicSalary: 0, allowances: 0 });
    setShowAddEmployee(false);
  };

  const handleRemoveEmployee = (_employeeId: string) => {
    toast.info('Remove employee functionality coming soon');
  };

  const handleLock = () => {
    lockPayroll(runId);
    toast.success('Payroll locked successfully');
  };

  const handleApprove = () => {
    approvePayroll(runId, currentUser?.id || '');
    toast.success('Payroll approved successfully');
  };

  const handleMarkAsPaid = () => {
    toast.info('Mark as paid functionality coming soon');
  };

  const canEdit = payroll.status === 'DRAFT' && ['hr_manager', 'administrator'].includes(currentUser?.role || '');
  const canLock = payroll.status === 'DRAFT' && ['hr_manager', 'administrator'].includes(currentUser?.role || '');
  const canApprove = payroll.status === 'LOCKED' && ['finance_manager', 'administrator'].includes(currentUser?.role || '');
  const canMarkPaid = payroll.status === 'APPROVED' && ['cashier', 'administrator'].includes(currentUser?.role || '');

  const statusColors = {
    DRAFT: 'bg-gray-500',
    LOCKED: 'bg-blue-500',
    APPROVED: 'bg-green-500',
    PAID: 'bg-purple-500',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('payroll')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{payroll.runNumber}</h1>
            <p className="text-muted-foreground">{payroll.period}</p>
          </div>
          <Badge className={statusColors[payroll.status]}>{payroll.status}</Badge>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Employee to Payroll</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Employee ID</Label>
                    <Input
                      value={employeeData.employeeId}
                      onChange={(e) => setEmployeeData({ ...employeeData, employeeId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Employee Name</Label>
                    <Input
                      value={employeeData.employeeName}
                      onChange={(e) => setEmployeeData({ ...employeeData, employeeName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Basic Salary (TZS)</Label>
                    <Input
                      type="number"
                      value={employeeData.basicSalary}
                      onChange={(e) => setEmployeeData({ ...employeeData, basicSalary: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Allowances (TZS)</Label>
                    <Input
                      type="number"
                      value={employeeData.allowances}
                      onChange={(e) => setEmployeeData({ ...employeeData, allowances: parseFloat(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleAddEmployee} className="w-full">Add Employee</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {canLock && (
            <Button onClick={handleLock} variant="outline">
              <Lock className="mr-2 h-4 w-4" />
              Lock Payroll
            </Button>
          )}
          {canApprove && (
            <Button onClick={handleApprove} variant="default">
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
          {canMarkPaid && (
            <Button onClick={handleMarkAsPaid} variant="default">
              <DollarSign className="mr-2 h-4 w-4" />
              Mark as Paid
            </Button>
          )}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payroll.employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gross Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TZS {payroll.totalGrossPay.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TZS {payroll.totalDeductions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">TZS {payroll.totalNetPay.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Employee</th>
                  <th className="text-right p-2">Basic</th>
                  <th className="text-right p-2">Allowances</th>
                  <th className="text-right p-2">Gross</th>
                  <th className="text-right p-2">PAYE</th>
                  <th className="text-right p-2">NSSF</th>
                  <th className="text-right p-2">Net Pay</th>
                  {canEdit && <th className="text-center p-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {payroll.employees.map((emp) => (
                  <tr key={emp.employeeId} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{emp.employeeName}</div>
                        <div className="text-sm text-muted-foreground">{emp.employeeId}</div>
                      </div>
                    </td>
                    <td className="text-right p-2">{emp.basicSalary.toLocaleString()}</td>
                    <td className="text-right p-2">{emp.allowances.toLocaleString()}</td>
                    <td className="text-right p-2 font-medium">{emp.grossPay.toLocaleString()}</td>
                    <td className="text-right p-2 text-red-600">{emp.paye.toLocaleString()}</td>
                    <td className="text-right p-2 text-red-600">{emp.nssf.toLocaleString()}</td>
                    <td className="text-right p-2 font-bold text-green-600">{emp.netPay.toLocaleString()}</td>
                    {canEdit && (
                      <td className="text-center p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEmployee(emp.employeeId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
