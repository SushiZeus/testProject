import { useState } from 'react';
import { Plus, Search, Wrench, AlertCircle, Calendar, Edit, Trash2, CheckCircle, Clock, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useFixedAssetsStore } from '@/store/fixedAssetsStore';
import type { MaintenanceStatus, MaintenanceType, AssetMaintenance } from '@/types/fixedAssets';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MaintenancePageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

const statusColors: Record<MaintenanceStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export function MaintenancePage({ navigate: _navigate }: MaintenancePageProps) {
  const { user } = useAuthStore();
  const { assets, maintenances, createMaintenance, updateMaintenance, updateMaintenanceStatus } = useFixedAssetsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'ALL'>('ALL');
  const [showNewMaintenance, setShowNewMaintenance] = useState(false);
  const [showEditMaintenance, setShowEditMaintenance] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<AssetMaintenance | null>(null);

  const [maintenanceData, setMaintenanceData] = useState({
    assetId: '',
    title: '',
    description: '',
    type: 'PREVENTIVE' as MaintenanceType,
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    scheduledDate: '',
    cost: '',
    performedBy: '',
    vendor: '',
    notes: '',
  });

  if (!user) return null;

  const canManage = user.role === 'hr_manager';

  const filteredMaintenances = maintenances.filter(maintenance => {
    const asset = assets.find(a => a.id === maintenance.assetId);
    const matchesSearch =
      maintenance.maintenanceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      maintenance.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset?.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || maintenance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: maintenances.length,
    scheduled: maintenances.filter(m => m.status === 'SCHEDULED').length,
    inProgress: maintenances.filter(m => m.status === 'IN_PROGRESS').length,
    completed: maintenances.filter(m => m.status === 'COMPLETED').length,
  };

  const resetMaintenanceData = () => {
    setMaintenanceData({
      assetId: '',
      title: '',
      description: '',
      type: 'PREVENTIVE',
      priority: 'MEDIUM',
      scheduledDate: '',
      cost: '',
      performedBy: '',
      vendor: '',
      notes: '',
    });
  };

  const handleCreateMaintenance = () => {
    if (!maintenanceData.assetId || !maintenanceData.title || !maintenanceData.scheduledDate) {
      toast.error('Please fill all required fields');
      return;
    }
    const asset = assets.find(a => a.id === maintenanceData.assetId);
    if (!asset) return;

    createMaintenance({
      assetId: maintenanceData.assetId,
      assetCode: asset.code,
      assetName: asset.name,
      title: maintenanceData.title,
      description: maintenanceData.description,
      type: maintenanceData.type,
      priority: maintenanceData.priority,
      scheduledDate: new Date(maintenanceData.scheduledDate),
      cost: maintenanceData.cost ? parseFloat(maintenanceData.cost) : 0,
      performedBy: maintenanceData.performedBy || undefined,
      vendor: maintenanceData.vendor || undefined,
      status: 'SCHEDULED',
      notes: maintenanceData.notes || undefined,
      createdBy: user.id,
    });

    toast.success('Maintenance scheduled successfully');
    resetMaintenanceData();
    setShowNewMaintenance(false);
  };

  const handleEditMaintenance = (maintenance: AssetMaintenance) => {
    setEditingMaintenance(maintenance);
    setMaintenanceData({
      assetId: maintenance.assetId,
      title: maintenance.title,
      description: maintenance.description,
      type: maintenance.type,
      priority: maintenance.priority,
      scheduledDate: maintenance.scheduledDate.toISOString().split('T')[0],
      cost: maintenance.cost.toString(),
      performedBy: maintenance.performedBy || '',
      vendor: maintenance.vendor || '',
      notes: maintenance.notes || '',
    });
    setShowEditMaintenance(true);
  };

  const handleUpdateMaintenanceStatus = (maintenance: AssetMaintenance, newStatus: MaintenanceStatus) => {
    const completedDate = newStatus === 'COMPLETED' ? new Date() : undefined;
    updateMaintenanceStatus(maintenance.id, newStatus, completedDate);
    
    const statusMessages = {
      SCHEDULED: 'Maintenance rescheduled',
      IN_PROGRESS: 'Maintenance started',
      COMPLETED: 'Maintenance completed',
      CANCELLED: 'Maintenance cancelled',
    };
    
    toast.success(statusMessages[newStatus]);
  };

  const formatCurrency = (amount: number) => `TZS ${amount.toLocaleString()}`;
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Maintenance</h1>
          <p className="text-gray-500 mt-1">Schedule and track asset maintenance</p>
        </div>
        {canManage && (
          <Dialog open={showNewMaintenance} onOpenChange={setShowNewMaintenance}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Maintenance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Asset *</Label>
                  <select
                    value={maintenanceData.assetId}
                    onChange={(e) => setMaintenanceData({ ...maintenanceData, assetId: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-300"
                  >
                    <option value="">Select Asset</option>
                    {assets.filter(a => a.status === 'ACTIVE').map(asset => (
                      <option key={asset.id} value={asset.id}>{asset.code} - {asset.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={maintenanceData.title}
                    onChange={(e) => setMaintenanceData({ ...maintenanceData, title: e.target.value })}
                    placeholder="e.g., Annual Service"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={maintenanceData.description}
                    onChange={(e) => setMaintenanceData({ ...maintenanceData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <select
                      value={maintenanceData.type}
                      onChange={(e) => setMaintenanceData({ ...maintenanceData, type: e.target.value as MaintenanceType })}
                      className="w-full h-10 px-3 rounded-md border border-gray-300"
                    >
                      <option value="PREVENTIVE">Preventive</option>
                      <option value="CORRECTIVE">Corrective</option>
                      <option value="EMERGENCY">Emergency</option>
                      <option value="ROUTINE">Routine</option>
                    </select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <select
                      value={maintenanceData.priority}
                      onChange={(e) => setMaintenanceData({ ...maintenanceData, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' })}
                      className="w-full h-10 px-3 rounded-md border border-gray-300"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Scheduled Date *</Label>
                    <Input
                      type="date"
                      value={maintenanceData.scheduledDate}
                      onChange={(e) => setMaintenanceData({ ...maintenanceData, scheduledDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Cost (TZS)</Label>
                    <Input
                      type="number"
                      value={maintenanceData.cost}
                      onChange={(e) => setMaintenanceData({ ...maintenanceData, cost: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label>Performed By</Label>
                  <Input
                    value={maintenanceData.performedBy}
                    onChange={(e) => setMaintenanceData({ ...maintenanceData, performedBy: e.target.value })}
                    placeholder="Technician or company name"
                  />
                </div>
                <div>
                  <Label>Vendor</Label>
                  <Input
                    value={maintenanceData.vendor}
                    onChange={(e) => setMaintenanceData({ ...maintenanceData, vendor: e.target.value })}
                    placeholder="Service provider"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={maintenanceData.notes}
                    onChange={(e) => setMaintenanceData({ ...maintenanceData, notes: e.target.value })}
                    rows={2}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowNewMaintenance(false); resetMaintenanceData(); }}>Cancel</Button>
                <Button onClick={handleCreateMaintenance}>Schedule Maintenance</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-100', icon: Wrench, iconColor: 'text-blue-600' },
          { label: 'Scheduled', value: stats.scheduled, color: 'bg-blue-100', icon: Calendar, iconColor: 'text-blue-600' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-amber-100', icon: AlertCircle, iconColor: 'text-amber-600' },
          { label: 'Completed', value: stats.completed, color: 'bg-green-100', icon: Wrench, iconColor: 'text-green-600' },
        ].map(({ label, value, color, icon: Icon, iconColor }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Maintenance Records</CardTitle>
              <CardDescription>View and manage maintenance schedules</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search maintenance..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as MaintenanceStatus | 'ALL')}
                className="h-10 px-3 rounded-md border border-gray-300"
              >
                <option value="ALL">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Asset</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Scheduled</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Completed</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Cost</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaintenances.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No maintenance records found</p>
                    </td>
                  </tr>
                ) : (
                  filteredMaintenances.map((maintenance) => {
                    const asset = assets.find(a => a.id === maintenance.assetId);
                    return (
                      <tr key={maintenance.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-mono font-medium text-blue-600">{asset?.code}</p>
                          <p className="text-sm text-gray-500">{asset?.name}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium">{maintenance.title}</p>
                          <p className="text-xs text-gray-500">{maintenance.maintenanceNumber}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{maintenance.type}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={cn('text-xs', priorityColors[maintenance.priority] || 'bg-gray-100 text-gray-700')}>
                            {maintenance.priority}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">{formatDate(maintenance.scheduledDate)}</td>
                        <td className="py-4 px-4">
                          {maintenance.completedDate ? formatDate(maintenance.completedDate) : '-'}
                        </td>
                        <td className="text-right py-4 px-4">
                          {maintenance.cost ? formatCurrency(maintenance.cost) : '-'}
                        </td>
                        <td className="text-center py-4 px-4">
                          <Badge className={cn('text-xs', statusColors[maintenance.status])}>
                            {maintenance.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1 justify-center">
                            {canManage && maintenance.status === 'SCHEDULED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateMaintenanceStatus(maintenance, 'IN_PROGRESS')}
                                title="Start Maintenance"
                              >
                                <Clock className="w-4 h-4 text-amber-600" />
                              </Button>
                            )}
                            {canManage && maintenance.status === 'IN_PROGRESS' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateMaintenanceStatus(maintenance, 'COMPLETED')}
                                title="Complete Maintenance"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            {canManage && maintenance.status !== 'COMPLETED' && maintenance.status !== 'CANCELLED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateMaintenanceStatus(maintenance, 'CANCELLED')}
                                title="Cancel Maintenance"
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
                            {canManage && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditMaintenance(maintenance)}
                                title="Edit Maintenance"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Maintenance Dialog */}
      <Dialog open={showEditMaintenance} onOpenChange={setShowEditMaintenance}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Maintenance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Asset *</Label>
              <select
                value={maintenanceData.assetId}
                onChange={(e) => setMaintenanceData({ ...maintenanceData, assetId: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-gray-300"
                disabled
              >
                <option value="">Select Asset</option>
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.code} - {asset.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Title *</Label>
              <Input
                value={maintenanceData.title}
                onChange={(e) => setMaintenanceData({ ...maintenanceData, title: e.target.value })}
                placeholder="e.g., Annual Service"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={maintenanceData.description}
                onChange={(e) => setMaintenanceData({ ...maintenanceData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <select
                  value={maintenanceData.type}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, type: e.target.value as MaintenanceType })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                >
                  <option value="PREVENTIVE">Preventive</option>
                  <option value="CORRECTIVE">Corrective</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="ROUTINE">Routine</option>
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select
                  value={maintenanceData.priority}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Scheduled Date *</Label>
                <Input
                  type="date"
                  value={maintenanceData.scheduledDate}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, scheduledDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Cost (TZS)</Label>
                <Input
                  type="number"
                  value={maintenanceData.cost}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label>Performed By</Label>
              <Input
                value={maintenanceData.performedBy}
                onChange={(e) => setMaintenanceData({ ...maintenanceData, performedBy: e.target.value })}
                placeholder="Technician or company name"
              />
            </div>
            <div>
              <Label>Vendor</Label>
              <Input
                value={maintenanceData.vendor}
                onChange={(e) => setMaintenanceData({ ...maintenanceData, vendor: e.target.value })}
                placeholder="Service provider"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={maintenanceData.notes}
                onChange={(e) => setMaintenanceData({ ...maintenanceData, notes: e.target.value })}
                rows={2}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditMaintenance(false); resetMaintenanceData(); setEditingMaintenance(null); }}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (!editingMaintenance || !maintenanceData.title || !maintenanceData.scheduledDate) {
                toast.error('Please fill all required fields');
                return;
              }
              
              updateMaintenance(editingMaintenance.id, {
                title: maintenanceData.title,
                description: maintenanceData.description,
                type: maintenanceData.type,
                priority: maintenanceData.priority,
                scheduledDate: new Date(maintenanceData.scheduledDate),
                cost: maintenanceData.cost ? parseFloat(maintenanceData.cost) : 0,
                performedBy: maintenanceData.performedBy || undefined,
                vendor: maintenanceData.vendor || undefined,
                notes: maintenanceData.notes || undefined,
              });
              
              toast.success('Maintenance updated successfully');
              resetMaintenanceData();
              setShowEditMaintenance(false);
              setEditingMaintenance(null);
            }}>
              Update Maintenance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
