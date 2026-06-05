import { useState } from 'react';
import { Plus, Search, Filter, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { useClaimsStore } from '@/store/claimsStore';
import type { ExpenseClaim, ClaimStatus } from '@/types/hr';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClaimsExpensesPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
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

export function ClaimsExpensesPage({ navigate }: ClaimsExpensesPageProps) {
  const { user } = useAuthStore();
  const { createClaim, getPendingApprovals, getClaimsByEmployee } = useClaimsStore();
  
  const [activeTab, setActiveTab] = useState('my-claims');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;

  const handleCreateClaim = () => {
    const newClaim = createClaim({
      employeeId: user.id,
      employeeName: user.name,
      department: user.department || 'General',
    });
    
    toast.success('New claim created');
    navigate('claims/:id', { id: newClaim.id });
  };

  const myClaims = getClaimsByEmployee(user.id);
  const pendingApprovals = getPendingApprovals(user.id, user.role);
  
  const filteredMyClaims = myClaims.filter(claim =>
    claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPendingApprovals = pendingApprovals.filter(claim =>
    claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalClaims: myClaims.length,
    pending: myClaims.filter(c => c.status === 'SUBMITTED' || c.status === 'MANAGER_APPROVED' || c.status === 'HR_APPROVED').length,
    approved: myClaims.filter(c => c.status === 'FINANCE_APPROVED' || c.status === 'PAID').length,
    rejected: myClaims.filter(c => c.status.includes('REJECTED')).length,
    pendingApprovals: pendingApprovals.length,
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
          <h1 className="text-3xl font-bold text-gray-900">Claims & Expenses</h1>
          <p className="text-gray-500 mt-1">
            Submit and manage expense claims
          </p>
        </div>
        <Button onClick={handleCreateClaim}>
          <Plus className="w-4 h-4 mr-2" />
          New Claim
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalClaims}</p>
                <p className="text-sm text-gray-500">Total Claims</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
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
        {stats.pendingApprovals > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                  <p className="text-sm text-gray-500">To Approve</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Expense Claims</CardTitle>
              <CardDescription>View and manage your expense claims</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search claims..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="my-claims">My Claims</TabsTrigger>
              {stats.pendingApprovals > 0 && (
                <TabsTrigger value="approvals">
                  Pending Approvals ({stats.pendingApprovals})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="my-claims">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Claim Number</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMyClaims.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No claims found</p>
                          <Button onClick={handleCreateClaim} variant="outline" className="mt-4">
                            Create Your First Claim
                          </Button>
                        </td>
                      </tr>
                    ) : (
                      filteredMyClaims.map((claim: ExpenseClaim) => (
                        <tr key={claim.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <p className="font-mono font-medium text-blue-600">{claim.claimNumber}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm">{formatDate(claim.createdAt)}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm">{claim.items.length} items</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium">{formatCurrency(claim.totalAmount)}</p>
                            {claim.approvedAmount > 0 && claim.approvedAmount !== claim.totalAmount && (
                              <p className="text-xs text-green-600">
                                Approved: {formatCurrency(claim.approvedAmount)}
                              </p>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={cn('text-xs', statusColors[claim.status])}>
                              {claim.status.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate('claims/:id', { id: claim.id })}
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
            </TabsContent>

            <TabsContent value="approvals">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Claim Number</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Employee</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Department</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPendingApprovals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No claims pending your approval</p>
                        </td>
                      </tr>
                    ) : (
                      filteredPendingApprovals.map((claim: ExpenseClaim) => (
                        <tr key={claim.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <p className="font-mono font-medium text-blue-600">{claim.claimNumber}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium">{claim.employeeName}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm">{claim.department}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium">{formatCurrency(claim.totalAmount)}</p>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={cn('text-xs', statusColors[claim.status])}>
                              {claim.status.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate('claims/:id', { id: claim.id })}
                            >
                              Review
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
