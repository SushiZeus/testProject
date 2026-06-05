import { useState } from 'react';
import { Search, UserCheck, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { useFixedAssetsStore } from '@/store/fixedAssetsStore';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AssignmentsPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function AssignmentsPage({ navigate: _navigate }: AssignmentsPageProps) {
  const { user } = useAuthStore();
  const { assets, assignments, assignAsset } = useFixedAssetsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [assignData, setAssignData] = useState({
    assetId: '',
    employeeId: '',
    employeeName: '',
    department: '',
    notes: '',
  });

  if (!user) return null;
  const canManage = user.role === 'hr_manager';

  const filteredAssignments = assignments.filter(a => {
    const asset = assets.find(x => x.id === a.assetId);
    return (
      a.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset?.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAssign = () => {
    if (!assignData.assetId || !assignData.employeeName || !assignData.department) {
      toast.error('Please fill all required fields');
      return;
    }
    const asset = assets.find(a => a.id === assignData.assetId);
    if (!asset) return;
    assignAsset({
      assetId: assignData.assetId,
      assetCode: asset.code,
      assetName: asset.name,
      employeeId: assignData.employeeId || `EMP-${Date.now()}`,
      employeeName: assignData.employeeName,
      department: assignData.department,
      assignedDate: new Date(),
      condition: asset.condition,
      notes: assignData.notes,
      assignedBy: user.id,
    });
    toast.success('Asset assigned successfully');
    setAssignData({ assetId: '', employeeId: '', employeeName: '', department: '', notes: '' });
    setShowAssign(false);
  };

  const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.status === 'ASSIGNED').length,
    returned: assignments.filter(a => a.status === 'RETURNED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Assignments</h1>
          <p className="text-gray-500 mt-1">Track asset assignments to employees</p>
        </div>
        {canManage && (
          <Dialog open={showAssign} onOpenChange={setShowAssign}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Assign Asset</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Assign Asset to Employee</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Asset *</Label>
                  <select value={assignData.assetId} onChange={e => setAssignData({ ...assignData, assetId: e.target.value })} className="w-full h-10 px-3 rounded-md border border-gray-300">
                    <option value="">Select Asset</option>
                    {assets.filter(a => a.status === 'ACTIVE' && !a.assignedTo).map(a => (
                      <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                    ))}
                  </select>
                </div>
                <div><Label>Employee Name *</Label><Input value={assignData.employeeName} onChange={e => setAssignData({ ...assignData, employeeName: e.target.value })} placeholder="Full name" /></div>
                <div><Label>Department *</Label><Input value={assignData.department} onChange={e => setAssignData({ ...assignData, department: e.target.value })} placeholder="Department" /></div>
                <div><Label>Notes</Label><Input value={assignData.notes} onChange={e => setAssignData({ ...assignData, notes: e.target.value })} placeholder="Optional notes" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
                <Button onClick={handleAssign}>Assign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Assignments', value: stats.total, color: 'bg-blue-100 text-blue-600' },
          { label: 'Currently Assigned', value: stats.active, color: 'bg-green-100 text-green-600' },
          { label: 'Returned', value: stats.returned, color: 'bg-gray-100 text-gray-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <UserCheck className="w-5 h-5" />
              </div>
              <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-gray-500">{label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Assignment Records</CardTitle><CardDescription>All asset assignments</CardDescription></div>
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
                {['Asset', 'Employee', 'Department', 'Assigned Date', 'Return Date', 'Condition', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No assignments found</p>
                </td></tr>
              ) : filteredAssignments.map(a => {
                const asset = assets.find(x => x.id === a.assetId);
                return (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4"><p className="font-mono text-blue-600 font-medium">{asset?.code}</p><p className="text-sm text-gray-500">{asset?.name}</p></td>
                    <td className="py-3 px-4 font-medium">{a.employeeName}</td>
                    <td className="py-3 px-4 text-sm">{a.department}</td>
                    <td className="py-3 px-4 text-sm">{formatDate(a.assignedDate)}</td>
                    <td className="py-3 px-4 text-sm">{a.returnDate ? formatDate(a.returnDate) : '—'}</td>
                    <td className="py-3 px-4"><Badge variant="outline">{a.condition}</Badge></td>
                    <td className="py-3 px-4">
                      <Badge className={cn(a.status === 'ASSIGNED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700')}>
                        {a.status}
                      </Badge>
                    </td>
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
