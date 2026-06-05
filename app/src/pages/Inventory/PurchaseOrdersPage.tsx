import { useState } from 'react';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PurchaseOrdersPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function PurchaseOrdersPage({ navigate: _navigate }: PurchaseOrdersPageProps) {
  const { user } = useAuthStore();
  const { purchaseOrders, createPO, approvePO } = useInventoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [formData, setFormData] = useState({ supplierName: '', description: '', totalAmount: '', expectedDelivery: '' });

  if (!user) return null;
  const canManage = ['administrator', 'finance_manager', 'operations_manager'].includes(user.role);

  const filtered = purchaseOrders.filter(po =>
    po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (!formData.supplierName || !formData.totalAmount) { toast.error('Please fill required fields'); return; }
    createPO({
      supplierName: formData.supplierName,
      supplierCode: `SUP-${Date.now()}`,
      items: [],
      totalAmount: parseFloat(formData.totalAmount),
      status: 'PENDING',
      expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery) : new Date(),
      createdBy: user.id,
      notes: formData.description,
    });
    toast.success('Purchase order created');
    setFormData({ supplierName: '', description: '', totalAmount: '', expectedDelivery: '' });
    setShowNew(false);
  };

  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    ORDERED: 'bg-blue-100 text-blue-700',
    RECEIVED: 'bg-purple-100 text-purple-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const formatCurrency = (n: number) => `TZS ${n.toLocaleString()}`;
  const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 mt-1">Manage purchase orders and supplier orders</p>
        </div>
        {canManage && (
          <Dialog open={showNew} onOpenChange={setShowNew}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New PO</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Supplier Name *</Label><Input value={formData.supplierName} onChange={e => setFormData({ ...formData, supplierName: e.target.value })} placeholder="Supplier name" /></div>
                <div><Label>Total Amount (TZS) *</Label><Input type="number" value={formData.totalAmount} onChange={e => setFormData({ ...formData, totalAmount: e.target.value })} placeholder="0" /></div>
                <div><Label>Expected Delivery</Label><Input type="date" value={formData.expectedDelivery} onChange={e => setFormData({ ...formData, expectedDelivery: e.target.value })} /></div>
                <div><Label>Description</Label><Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Order description" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create PO</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total POs', value: purchaseOrders.length, cls: 'text-gray-900' },
          { label: 'Pending', value: purchaseOrders.filter(p => p.status === 'PENDING').length, cls: 'text-amber-600' },
          { label: 'Approved', value: purchaseOrders.filter(p => p.status === 'APPROVED').length, cls: 'text-green-600' },
          { label: 'Total Value', value: formatCurrency(purchaseOrders.reduce((s, p) => s + p.totalAmount, 0)), cls: 'text-blue-600' },
        ].map(({ label, value, cls }) => (
          <Card key={label}><CardContent className="p-4"><p className="text-sm text-gray-500">{label}</p><p className={`text-xl font-bold ${cls}`}>{value}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Purchase Orders</CardTitle><CardDescription>All purchase orders</CardDescription></div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {['PO Number', 'Supplier', 'Amount', 'Expected Delivery', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No purchase orders found</p>
                </td></tr>
              ) : filtered.map(po => (
                <tr key={po.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-blue-600 font-medium">{po.poNumber}</td>
                  <td className="py-3 px-4 font-medium">{po.supplierName}</td>
                  <td className="py-3 px-4 font-medium">{formatCurrency(po.totalAmount)}</td>
                  <td className="py-3 px-4 text-sm">{formatDate(po.expectedDelivery)}</td>
                  <td className="py-3 px-4"><Badge className={cn('text-xs', statusColor[po.status] || 'bg-gray-100 text-gray-700')}>{po.status}</Badge></td>
                  <td className="py-3 px-4">
                    {canManage && po.status === 'PENDING' && (
                      <Button size="sm" onClick={() => { approvePO(po.id, user.id); toast.success('PO approved'); }}>Approve</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
