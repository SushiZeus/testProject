import { useState } from 'react';
import { Plus, Search, Package, ShoppingCart, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import type { AppRoute } from '@/App';

interface InventoryDashboardPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function InventoryDashboardPage({ navigate }: InventoryDashboardPageProps) {
  const { user } = useAuthStore();
  const { items, purchaseOrders, stockRequests, suppliers } = useInventoryStore();
  
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;

  const canManage = ['administrator', 'finance_manager', 'operations_manager'].includes(user.role);

  const stats = {
    totalItems: items.length,
    lowStock: items.filter(i => {
      const totalQty = i.locations.reduce((sum, l) => sum + l.quantity, 0);
      return totalQty <= i.reorderLevel;
    }).length,
    pendingPOs: purchaseOrders.filter(po => po.status === 'PENDING').length,
    pendingRequests: stockRequests.filter(sr => sr.status === 'PENDING').length,
    totalSuppliers: suppliers.length,
    totalValue: items.reduce((sum, i) => {
      const qty = i.locations.reduce((s, l) => s + l.quantity, 0);
      return sum + (qty * i.unitCost);
    }, 0),
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => `TZS ${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Manage stock, purchase orders, and suppliers</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button onClick={() => navigate('inventory/items')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
            <Button onClick={() => navigate('inventory')} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New PO
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
                <p className="text-sm text-gray-500">Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
                <p className="text-sm text-gray-500">Low Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingPOs}</p>
                <p className="text-sm text-gray-500">Pending POs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                <p className="text-sm text-gray-500">Requests</p>
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
                <p className="text-2xl font-bold">{stats.totalSuppliers}</p>
                <p className="text-sm text-gray-500">Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-500">Stock Value</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common inventory tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('inventory/items')}>
              <Package className="w-4 h-4 mr-2" />
              View All Items
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('inventory/po')}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Purchase Orders
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('inventory/requests')}>
              <FileText className="w-4 h-4 mr-2" />
              Stock Requests
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('inventory/suppliers')}>
              <Users className="w-4 h-4 mr-2" />
              Manage Suppliers
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Items</CardTitle>
                <CardDescription>Latest inventory items</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredItems.slice(0, 5).map(item => {
                const totalQty = item.locations.reduce((sum, l) => sum + l.quantity, 0);
                const isLowStock = totalQty <= item.reorderLevel;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.code} • {item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                        {totalQty} {item.unit}
                      </p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.unitCost)}</p>
                    </div>
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No items found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
