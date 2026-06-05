import { useState } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
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

interface RequestsPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function RequestsPage({ navigate: _navigate }: RequestsPageProps) {
  const { user } = useAuthStore();
  const { items, stockRequests, createStockRequest, approveStockRequest } = useInventoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [formData, setFormData] = useState({ itemId: '', quantity: '', requestedFor: '', notes: '' });

  if (!user) return null;
  const canApprove = ['administrator', 'finance_manager', 'operations_manager'].includes(user.role);

  const filtered = stockRequests.filter(r =>
    r.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.requestedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (!formData.itemId || !formData.quantity) { toast.error('Please fill required fields'); return; }
    const item = items.find(i => i.id === formData.itemId);
    if (!item) return;
    createStockRequest({
      itemId: formData.itemId,
      itemCode: item.code,
      itemName: item.name,
      quantity: parseInt(formData.quantity),
      unit: item.unit,
      requestedBy: user.name,
      requestedFor: formData.requestedFor || user.name,
      requestDate: new Date(),
      status: 'PENDING',
      notes: formData.notes,
    });
    toast.success('Stock request submitted');
    setFormData({ itemId: '', quantity: '', requestedFor: '', notes: '' });
    setShowNew(false);
  };

  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    FULFILLED: 'bg-blue-100 text-blue-700',
  };

  const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Requests</h1>
          <p className="text-gray-500 mt-1">Request and manage stock items</p>
        </div>
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Request</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Stock Request</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Item *</Label>
                <select value={formData.itemId} onChange={e => setFormData({ ...formData, itemId: e.target.value })} className="w-full h-10 px-3 rounded-md border border-gray-300">
                  <option value="">Select Item</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.code} — {i.name}</option>)}
                </select>
              </div>
              <div><Label>Quantity *</Label><Input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" /></div>
              <div><Label>Requested For</Label><Input value={formData.requestedFor} onChange={e => setFormData({ ...formData, requestedFor: e.target.value })} placeholder="Department or person" /></div>
              <div><Label>Notes</Label><Input value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stockRequests.length, cls: 'text-gray-900' },
          { label: 'Pending', value: stockRequests.filter(r => r.status === 'PENDING').length, cls: 'text-amber-600' },
          { label: 'Approved', value: stockRequests.filter(r => r.status === 'APPROVED').length, cls: 'text-green-600' },
          { label: 'Fulfilled', value: stockRequests.filter(r => r.status === 'FULFILLED').length, cls: 'text-blue-600' },
        ].map(({ label, value, cls }) => (
          <Card key={label}><CardContent className="p-4"><p className="text-sm text-gray-500">{label}</p><p className={`text-2xl font-bold ${cls}`}>{value}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Requests</CardTitle><CardDescription>All stock requests</CardDescription></div>
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
                {['Request #', 'Item', 'Qty', 'Requested By', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No requests found</p>
                </td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-blue-600 font-medium">{r.requestNumber}</td>
                  <td className="py-3 px-4"><p className="font-medium">{r.itemName}</p><p className="text-sm text-gray-500">{r.itemCode}</p></td>
                  <td className="py-3 px-4 font-medium">{r.quantity} {r.unit}</td>
                  <td className="py-3 px-4 text-sm">{r.requestedBy}</td>
                  <td className="py-3 px-4 text-sm">{formatDate(r.requestDate)}</td>
                  <td className="py-3 px-4"><Badge className={cn('text-xs', statusColor[r.status] || 'bg-gray-100 text-gray-700')}>{r.status}</Badge></td>
                  <td className="py-3 px-4">
                    {canApprove && r.status === 'PENDING' && (
                      <Button size="sm" onClick={() => { approveStockRequest(r.id, user.id); toast.success('Request approved'); }}>Approve</Button>
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
