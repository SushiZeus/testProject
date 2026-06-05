import { useState } from 'react';
import { Search, PackageCheck, Plus } from 'lucide-react';
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

interface GoodsReceivedPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function GoodsReceivedPage({ navigate: _navigate }: GoodsReceivedPageProps) {
  const { user } = useAuthStore();
  const { items, purchaseOrders, updateItemStock } = useInventoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showReceive, setShowReceive] = useState(false);
  const [formData, setFormData] = useState({ poId: '', itemId: '', quantity: '', location: '', notes: '' });

  if (!user) return null;
  const canManage = ['administrator', 'finance_manager', 'operations_manager'].includes(user.role);

  const approvedPOs = purchaseOrders.filter(po => po.status === 'APPROVED' || po.status === 'ORDERED');

  const handleReceive = () => {
    if (!formData.itemId || !formData.quantity || !formData.location) {
      toast.error('Please fill all required fields');
      return;
    }
    updateItemStock(formData.itemId, formData.location, parseInt(formData.quantity));
    toast.success('Goods received and stock updated');
    setFormData({ poId: '', itemId: '', quantity: '', location: '', notes: '' });
    setShowReceive(false);
  };

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (n: number) => `TZS ${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goods Received</h1>
          <p className="text-gray-500 mt-1">Record received goods and update stock levels</p>
        </div>
        {canManage && (
          <Dialog open={showReceive} onOpenChange={setShowReceive}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Receive Goods</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Receive Goods</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Purchase Order (Optional)</Label>
                  <select value={formData.poId} onChange={e => setFormData({ ...formData, poId: e.target.value })} className="w-full h-10 px-3 rounded-md border border-gray-300">
                    <option value="">Select PO (optional)</option>
                    {approvedPOs.map(po => <option key={po.id} value={po.id}>{po.poNumber} — {po.supplierName}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Item *</Label>
                  <select value={formData.itemId} onChange={e => setFormData({ ...formData, itemId: e.target.value })} className="w-full h-10 px-3 rounded-md border border-gray-300">
                    <option value="">Select Item</option>
                    {items.map(i => <option key={i.id} value={i.id}>{i.code} — {i.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Quantity Received *</Label><Input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" /></div>
                  <div><Label>Storage Location *</Label><Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Main Store" /></div>
                </div>
                <div><Label>Notes</Label><Input value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReceive(false)}>Cancel</Button>
                <Button onClick={handleReceive}>Confirm Receipt</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Total Items</p><p className="text-2xl font-bold">{items.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Pending POs</p><p className="text-2xl font-bold text-amber-600">{approvedPOs.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Total Stock Value</p><p className="text-xl font-bold text-green-600">{formatCurrency(items.reduce((s, i) => s + (i.locations.reduce((q, l) => q + l.quantity, 0) * i.unitCost), 0))}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Current Stock Levels</CardTitle><CardDescription>Items and their current stock</CardDescription></div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {['Code', 'Item', 'Category', 'Location', 'Qty', 'Unit Cost', 'Total Value', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-gray-500">
                  <PackageCheck className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No items found</p>
                </td></tr>
              ) : filteredItems.map(item => {
                const totalQty = item.locations.reduce((s, l) => s + l.quantity, 0);
                const isLow = totalQty <= item.reorderLevel;
                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-blue-600 font-medium">{item.code}</td>
                    <td className="py-3 px-4"><p className="font-medium">{item.name}</p><p className="text-xs text-gray-500">{item.description}</p></td>
                    <td className="py-3 px-4 text-sm">{item.category}</td>
                    <td className="py-3 px-4 text-sm">{item.locations[0]?.location || '—'}</td>
                    <td className={`py-3 px-4 font-medium ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{totalQty} {item.unit}{isLow && <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 rounded">LOW</span>}</td>
                    <td className="py-3 px-4">{formatCurrency(item.unitCost)}</td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(totalQty * item.unitCost)}</td>
                    <td className="py-3 px-4"><Badge className={item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{item.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
