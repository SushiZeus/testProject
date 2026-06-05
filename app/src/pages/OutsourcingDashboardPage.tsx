import { Plus, FileText, Users, CheckCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useOutsourcingStore } from '@/store/outsourcingStore';
import type { AppRoute } from '@/App';

interface OutsourcingDashboardPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function OutsourcingDashboardPage({ navigate }: OutsourcingDashboardPageProps) {
  const { user } = useAuthStore();
  const { contracts, vendors, deliverables, invoices } = useOutsourcingStore();

  if (!user) return null;

  const canManage = ['administrator', 'finance_manager', 'operations_manager'].includes(user.role);

  const stats = {
    activeContracts: contracts.filter(c => c.status === 'ACTIVE').length,
    totalVendors: vendors.filter(v => v.status === 'ACTIVE').length,
    pendingDeliverables: deliverables.filter(d => d.status === 'PENDING' || d.status === 'IN_PROGRESS').length,
    pendingInvoices: invoices.filter(i => i.status === 'PENDING').length,
    totalValue: contracts.filter(c => c.status === 'ACTIVE').reduce((sum, c) => sum + c.value, 0),
  };

  const formatCurrency = (amount: number) => `TZS ${amount.toLocaleString()}`;

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
          <h1 className="text-3xl font-bold text-gray-900">Outsourcing Management</h1>
          <p className="text-gray-500 mt-1">Manage contracts, vendors, and deliverables</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button onClick={() => navigate('outsourcing')}>
              <Plus className="w-4 h-4 mr-2" />
              New Contract
            </Button>
            <Button onClick={() => navigate('outsourcing')} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeContracts}</p>
                <p className="text-sm text-gray-500">Active Contracts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalVendors}</p>
                <p className="text-sm text-gray-500">Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingDeliverables}</p>
                <p className="text-sm text-gray-500">Deliverables</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
                <p className="text-sm text-gray-500">Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common outsourcing tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('outsourcing/contracts')}>
              <FileText className="w-4 h-4 mr-2" />
              View Contracts
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('outsourcing/vendors')}>
              <Users className="w-4 h-4 mr-2" />
              View Vendors
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('outsourcing/deliverables')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              View Deliverables
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('outsourcing/invoices')}>
              <DollarSign className="w-4 h-4 mr-2" />
              View Invoices
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Contracts</CardTitle>
            <CardDescription>Current outsourcing agreements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contracts.filter(c => c.status === 'ACTIVE').slice(0, 5).map(contract => (
                <div key={contract.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{contract.title}</p>
                    <p className="text-sm text-gray-500">{contract.vendorName} • {contract.serviceType}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{formatCurrency(contract.value)}</p>
                    <p className="text-xs text-gray-500">Ends {formatDate(contract.endDate)}</p>
                  </div>
                </div>
              ))}
              {contracts.filter(c => c.status === 'ACTIVE').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active contracts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
