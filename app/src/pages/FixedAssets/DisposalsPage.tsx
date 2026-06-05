import { useState } from 'react';
import { Search, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useFixedAssetsStore } from '@/store/fixedAssetsStore';
import type { AppRoute } from '@/App';
import type { DisposalMethod } from '@/types/fixedAssets';
import { toast } from 'sonner';

interface DisposalsPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function DisposalsPage({ navigate: _navigate }: DisposalsPageProps) {
  const { user } = useAuthStore();
  const { assets, disposals, disposeAsset } = useFixedAssetsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDispose, setShowDispose] = useState(false);
  const [disposeData, setDisposeData] = useState({
    assetId: '',
    method: 'SALE' as DisposalMethod,
    disposalDate: new Date().toISOString().split('T')[0],
    disposalValue: '',
    reason: '',
    buyer: '',
    notes: '',
  });

  if (!user) return null;
  const canManage = user.role === 'hr_manager';

  const filteredDisposals = disposals.filter(d => {
    return (
      d.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.disposalNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDispose = () => {
    if (!disposeData.assetId || !disposeData.reason) {
      toast.error('Please fill all required fields');
      return;
    }
    const asset = assets.find(a => a.id === disposeData.assetId);
    if (!asset) return;
    const disposalValue = parseFloat(disposeData.disposalValue) || 0;
    disposeAsset({
      assetId: disposeData.assetId,
      assetCode: asset.code,
      assetName: asset.name,
      method: disposeData.method,
      disposalDate: new Date(disposeData.disposalDate),
      bookValue: asset.bookValue,
      disposalValue,
      gainLoss: disposalValue - asset.bookValue,
      reason: disposeData.reason,
      buyer: disposeData.buyer || undefined,
      notes: disposeData.notes || undefined,
      createdBy: user.id,
    });
    toast.success('Asset disposal recorded');
    setDisposeData({ assetId: '', method: 'SALE', disposalDate: new Date().toISOString().split('T')[0], disposalValue: '', reason: '', buyer: '', notes: '' });
    setShowDispose(false);
  };

  const formatCurrency = (n: number) => `TZS ${n.toLocaleString()}`;
  const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Disposals</h1>
          <p className="text-gray-500 mt-1">Record and track asset disposals</p>
        </div>
        {canManage && (
          <Dialog open={showDispose} onOpenChange={setShowDispose}>
            <DialogTrigger asChild>
              <Button variant="destructive"><Plus className="w-4 h-4 mr-2" />Record Disposal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Asset Disposal</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Asset *</Label>
                  <select value={disposeData.assetId} onChange={e => setDisposeData({ ...disposeData, assetId: e.target.value })} className="w-full h-10 px-3 rounded-md border border-gray-300">
                    <option value="">Select Asset</option>
                    {assets.filter(a => a.status === 'ACTIVE').map(a => (
                      <option key={a.id} value={a.id}>{a.code} — {a.name} (Book: {formatCurrency(a.bookValue)})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Disposal Method</Label>
                    <select value={disposeData.method} onChange={e => setDisposeData({ ...disposeData, method: e.target.value as DisposalMethod })} className="w-full h-10 px-3 rounded-md border border-gray-300">
                      <option value="SALE">Sale</option>
                      <option value="DONATION">Donation</option>
                      <option value="SCRAP">Scrap</option>
                      <option value="TRADE_IN">Trade-In</option>
                      <option value="WRITE_OFF">Write-Off</option>
                    </select>
                  </div>
                  <div><Label>Disposal Date</Label><Input type="date" value={disposeData.disposalDate} onChange={e => setDisposeData({ ...disposeData, disposalDate: e.target.value })} /></div>
                </div>
                <div><Label>Disposal Value (TZS)</Label><Input type="number" value={disposeData.disposalValue} onChange={e => setDisposeData({ ...disposeData, disposalValue: e.target.value })} placeholder="0" /></div>
                <div><Label>Buyer / Recipient</Label><Input value={disposeData.buyer} onChange={e => setDisposeData({ ...disposeData, buyer: e.target.value })} placeholder="Name of buyer or recipient" /></div>
                <div><Label>Reason *</Label><Textarea value={disposeData.reason} onChange={e => setDisposeData({ ...disposeData, reason: e.target.value })} rows={2} placeholder="Reason for disposal" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDispose(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDispose}>Record Disposal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Disposals', value: disposals.length },
          { label: 'Total Disposal Value', value: formatCurrency(disposals.reduce((s, d) => s + d.disposalValue, 0)) },
          { label: 'Total Gain / (Loss)', value: formatCurrency(disposals.reduce((s, d) => s + d.gainLoss, 0)) },
        ].map(({ label, value }) => (
          <Card key={label}><CardContent className="p-4"><p className="text-sm text-gray-500">{label}</p><p className="text-xl font-bold mt-1">{value}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Disposal Records</CardTitle><CardDescription>All asset disposals</CardDescription></div>
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
                {['Disposal #', 'Asset', 'Method', 'Date', 'Book Value', 'Disposal Value', 'Gain / (Loss)'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDisposals.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">
                  <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No disposal records found</p>
                </td></tr>
              ) : filteredDisposals.map(d => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-blue-600 font-medium">{d.disposalNumber}</td>
                  <td className="py-3 px-4"><p className="font-medium">{d.assetName}</p><p className="text-sm text-gray-500">{d.assetCode}</p></td>
                  <td className="py-3 px-4"><Badge variant="outline">{d.method}</Badge></td>
                  <td className="py-3 px-4 text-sm">{formatDate(d.disposalDate)}</td>
                  <td className="py-3 px-4">{formatCurrency(d.bookValue)}</td>
                  <td className="py-3 px-4 font-medium">{formatCurrency(d.disposalValue)}</td>
                  <td className={`py-3 px-4 font-medium ${d.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {d.gainLoss >= 0 ? '+' : ''}{formatCurrency(d.gainLoss)}
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
