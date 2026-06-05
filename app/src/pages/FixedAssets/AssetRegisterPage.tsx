import { useState } from 'react';
import { Plus, Search, Package, TrendingDown, AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useFixedAssetsStore } from '@/store/fixedAssetsStore';
import type { FixedAsset, AssetStatus, AssetCondition, DepreciationMethod } from '@/types/fixedAssets';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AssetRegisterPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

const statusColors: Record<AssetStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
  UNDER_MAINTENANCE: 'bg-amber-100 text-amber-700',
  DISPOSED: 'bg-red-100 text-red-700',
  LOST: 'bg-purple-100 text-purple-700',
  DAMAGED: 'bg-orange-100 text-orange-700',
};

export function AssetRegisterPage({ navigate }: AssetRegisterPageProps) {
  const { user } = useAuthStore();
  const { assets, createAsset, updateAsset, deleteAsset } = useFixedAssetsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'ALL'>('ALL');
  const [showNewAsset, setShowNewAsset] = useState(false);
  const [showEditAsset, setShowEditAsset] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);

  const [assetData, setAssetData] = useState({
    name: '',
    category: '',
    serialNumber: '',
    description: '',
    purchaseDate: '',
    purchaseCost: '',
    supplier: '',
    warrantyExpiry: '',
    location: '',
    department: '',
    condition: 'GOOD' as AssetCondition,
    status: 'ACTIVE' as AssetStatus,
    depreciationMethod: 'STRAIGHT_LINE' as DepreciationMethod,
    usefulLife: '60', // 5 years in months
    salvageValue: '',
    notes: '',
  });

  if (!user) return null;

  const canManage = user.role === 'hr_manager';

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || asset.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: assets.length,
    active: assets.filter(a => a.status === 'ACTIVE').length,
    maintenance: assets.filter(a => a.status === 'UNDER_MAINTENANCE').length,
    disposed: assets.filter(a => a.status === 'DISPOSED').length,
    totalValue: assets.reduce((sum, a) => sum + a.bookValue, 0),
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

  const resetAssetData = () => {
    setAssetData({
      name: '',
      category: '',
      serialNumber: '',
      description: '',
      purchaseDate: '',
      purchaseCost: '',
      supplier: '',
      warrantyExpiry: '',
      location: '',
      department: '',
      condition: 'GOOD',
      status: 'ACTIVE',
      depreciationMethod: 'STRAIGHT_LINE',
      usefulLife: '60',
      salvageValue: '',
      notes: '',
    });
  };

  const handleCreateAsset = () => {
    if (!assetData.name || !assetData.category || !assetData.purchaseDate || !assetData.purchaseCost) {
      toast.error('Please fill all required fields');
      return;
    }

    const purchaseCost = parseFloat(assetData.purchaseCost);
    const salvageValue = assetData.salvageValue ? parseFloat(assetData.salvageValue) : 0;

    createAsset({
      code: '', // Will be auto-generated
      name: assetData.name,
      category: assetData.category,
      serialNumber: assetData.serialNumber || undefined,
      description: assetData.description || undefined,
      purchaseDate: new Date(assetData.purchaseDate),
      purchaseCost,
      supplier: assetData.supplier || undefined,
      warrantyExpiry: assetData.warrantyExpiry ? new Date(assetData.warrantyExpiry) : undefined,
      location: assetData.location,
      department: assetData.department,
      condition: assetData.condition,
      status: assetData.status,
      bookValue: purchaseCost, // Initial book value equals purchase cost
      accumulatedDepreciation: 0,
      depreciationMethod: assetData.depreciationMethod,
      usefulLife: parseInt(assetData.usefulLife),
      salvageValue,
      notes: assetData.notes || undefined,
    });

    toast.success('Asset registered successfully');
    resetAssetData();
    setShowNewAsset(false);
  };

  const handleEditAsset = (asset: FixedAsset) => {
    setEditingAsset(asset);
    setAssetData({
      name: asset.name,
      category: asset.category,
      serialNumber: asset.serialNumber || '',
      description: asset.description || '',
      purchaseDate: asset.purchaseDate.toISOString().split('T')[0],
      purchaseCost: asset.purchaseCost.toString(),
      supplier: asset.supplier || '',
      warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.toISOString().split('T')[0] : '',
      location: asset.location,
      department: asset.department,
      condition: asset.condition,
      status: asset.status,
      depreciationMethod: asset.depreciationMethod,
      usefulLife: asset.usefulLife.toString(),
      salvageValue: asset.salvageValue.toString(),
      notes: asset.notes || '',
    });
    setShowEditAsset(true);
  };

  const handleUpdateAsset = () => {
    if (!editingAsset || !assetData.name || !assetData.category || !assetData.purchaseDate || !assetData.purchaseCost) {
      toast.error('Please fill all required fields');
      return;
    }

    const purchaseCost = parseFloat(assetData.purchaseCost);
    const salvageValue = assetData.salvageValue ? parseFloat(assetData.salvageValue) : 0;

    updateAsset(editingAsset.id, {
      name: assetData.name,
      category: assetData.category,
      serialNumber: assetData.serialNumber || undefined,
      description: assetData.description || undefined,
      purchaseDate: new Date(assetData.purchaseDate),
      purchaseCost,
      supplier: assetData.supplier || undefined,
      warrantyExpiry: assetData.warrantyExpiry ? new Date(assetData.warrantyExpiry) : undefined,
      location: assetData.location,
      department: assetData.department,
      condition: assetData.condition,
      status: assetData.status,
      depreciationMethod: assetData.depreciationMethod,
      usefulLife: parseInt(assetData.usefulLife),
      salvageValue,
      notes: assetData.notes || undefined,
    });

    toast.success('Asset updated successfully');
    resetAssetData();
    setShowEditAsset(false);
    setEditingAsset(null);
  };

  const handleDeleteAsset = (asset: FixedAsset) => {
    if (window.confirm(`Are you sure you want to delete asset "${asset.name}"? This action cannot be undone.`)) {
      deleteAsset(asset.id);
      toast.success('Asset deleted successfully');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fixed Assets Register</h1>
          <p className="text-gray-500 mt-1">
            Manage company fixed assets
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Dialog open={showNewAsset} onOpenChange={setShowNewAsset}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Register Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Register New Asset</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Asset Name *</Label>
                    <Input
                      value={assetData.name}
                      onChange={(e) => setAssetData({ ...assetData, name: e.target.value })}
                      placeholder="e.g., Toyota Hilux Double Cab"
                    />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <select
                      value={assetData.category}
                      onChange={(e) => setAssetData({ ...assetData, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-gray-300"
                    >
                      <option value="">Select Category</option>
                      <option value="Vehicles">Vehicles</option>
                      <option value="IT Equipment">IT Equipment</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Machinery">Machinery</option>
                      <option value="Buildings">Buildings</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label>Serial Number</Label>
                    <Input
                      value={assetData.serialNumber}
                      onChange={(e) => setAssetData({ ...assetData, serialNumber: e.target.value })}
                      placeholder="Serial or model number"
                    />
                  </div>
                  <div>
                    <Label>Purchase Date *</Label>
                    <Input
                      type="date"
                      value={assetData.purchaseDate}
                      onChange={(e) => setAssetData({ ...assetData, purchaseDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Purchase Cost (TZS) *</Label>
                    <Input
                      type="number"
                      value={assetData.purchaseCost}
                      onChange={(e) => setAssetData({ ...assetData, purchaseCost: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Supplier</Label>
                    <Input
                      value={assetData.supplier}
                      onChange={(e) => setAssetData({ ...assetData, supplier: e.target.value })}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <Label>Location *</Label>
                    <Input
                      value={assetData.location}
                      onChange={(e) => setAssetData({ ...assetData, location: e.target.value })}
                      placeholder="e.g., Dar es Salaam Office"
                    />
                  </div>
                  <div>
                    <Label>Department *</Label>
                    <select
                      value={assetData.department}
                      onChange={(e) => setAssetData({ ...assetData, department: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-gray-300"
                    >
                      <option value="">Select Department</option>
                      <option value="Finance & Accounting">Finance & Accounting</option>
                      <option value="IT Equipment">IT Equipment</option>
                      <option value="Operations">Operations</option>
                      <option value="HR">HR</option>
                      <option value="Administration">Administration</option>
                    </select>
                  </div>
                  <div>
                    <Label>Condition</Label>
                    <select
                      value={assetData.condition}
                      onChange={(e) => setAssetData({ ...assetData, condition: e.target.value as AssetCondition })}
                      className="w-full h-10 px-3 rounded-md border border-gray-300"
                    >
                      <option value="EXCELLENT">Excellent</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                      <option value="DAMAGED">Damaged</option>
                    </select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select
                      value={assetData.status}
                      onChange={(e) => setAssetData({ ...assetData, status: e.target.value as AssetStatus })}
                      className="w-full h-10 px-3 rounded-md border border-gray-300"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <Label>Useful Life (Months)</Label>
                    <Input
                      type="number"
                      value={assetData.usefulLife}
                      onChange={(e) => setAssetData({ ...assetData, usefulLife: e.target.value })}
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <Label>Salvage Value (TZS)</Label>
                    <Input
                      type="number"
                      value={assetData.salvageValue}
                      onChange={(e) => setAssetData({ ...assetData, salvageValue: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Warranty Expiry</Label>
                    <Input
                      type="date"
                      value={assetData.warrantyExpiry}
                      onChange={(e) => setAssetData({ ...assetData, warrantyExpiry: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={assetData.description}
                      onChange={(e) => setAssetData({ ...assetData, description: e.target.value })}
                      rows={2}
                      placeholder="Asset description..."
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={assetData.notes}
                      onChange={(e) => setAssetData({ ...assetData, notes: e.target.value })}
                      rows={2}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setShowNewAsset(false); resetAssetData(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAsset}>Register Asset</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Assets</p>
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
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.maintenance}</p>
                <p className="text-sm text-gray-500">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.disposed}</p>
                <p className="text-sm text-gray-500">Disposed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Assets</CardTitle>
              <CardDescription>View and manage fixed assets</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AssetStatus | 'ALL')}
                className="h-10 px-3 rounded-md border border-gray-300"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="UNDER_MAINTENANCE">Maintenance</option>
                <option value="DISPOSED">Disposed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Purchase Cost</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Book Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No assets found</p>
                      {canManage && (
                        <Button onClick={() => navigate('assets/new')} variant="outline" className="mt-4">
                          Register Your First Asset
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset: FixedAsset) => (
                    <tr key={asset.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-mono font-medium text-blue-600">{asset.code}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{asset.name}</p>
                        {asset.serialNumber && (
                          <p className="text-xs text-gray-500">SN: {asset.serialNumber}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm">{asset.category}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm">{asset.location}</p>
                        <p className="text-xs text-gray-500">{asset.department}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{formatCurrency(asset.purchaseCost)}</p>
                        <p className="text-xs text-gray-500">{formatDate(asset.purchaseDate)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-green-600">{formatCurrency(asset.bookValue)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={cn('text-xs', statusColors[asset.status])}>
                          {asset.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('assets/:id', { id: asset.id })}
                          >
                            View
                          </Button>
                          {canManage && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAsset(asset)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAsset(asset)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Asset Dialog */}
      <Dialog open={showEditAsset} onOpenChange={setShowEditAsset}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Asset Name *</Label>
              <Input
                value={assetData.name}
                onChange={(e) => setAssetData({ ...assetData, name: e.target.value })}
                placeholder="e.g., Toyota Hilux Double Cab"
              />
            </div>
            <div>
              <Label>Category *</Label>
              <select
                value={assetData.category}
                onChange={(e) => setAssetData({ ...assetData, category: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-gray-300"
              >
                <option value="">Select Category</option>
                <option value="Vehicles">Vehicles</option>
                <option value="IT Equipment">IT Equipment</option>
                <option value="Furniture">Furniture</option>
                <option value="Machinery">Machinery</option>
                <option value="Buildings">Buildings</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <Label>Serial Number</Label>
              <Input
                value={assetData.serialNumber}
                onChange={(e) => setAssetData({ ...assetData, serialNumber: e.target.value })}
                placeholder="Serial or model number"
              />
            </div>
            <div>
              <Label>Purchase Date *</Label>
              <Input
                type="date"
                value={assetData.purchaseDate}
                onChange={(e) => setAssetData({ ...assetData, purchaseDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Purchase Cost (TZS) *</Label>
              <Input
                type="number"
                value={assetData.purchaseCost}
                onChange={(e) => setAssetData({ ...assetData, purchaseCost: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Supplier</Label>
              <Input
                value={assetData.supplier}
                onChange={(e) => setAssetData({ ...assetData, supplier: e.target.value })}
                placeholder="Supplier name"
              />
            </div>
            <div>
              <Label>Location *</Label>
              <Input
                value={assetData.location}
                onChange={(e) => setAssetData({ ...assetData, location: e.target.value })}
                placeholder="e.g., Dar es Salaam Office"
              />
            </div>
            <div>
              <Label>Department *</Label>
              <select
                value={assetData.department}
                onChange={(e) => setAssetData({ ...assetData, department: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-gray-300"
              >
                <option value="">Select Department</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
                <option value="IT Equipment">IT Equipment</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
            <div>
              <Label>Condition</Label>
              <select
                value={assetData.condition}
                onChange={(e) => setAssetData({ ...assetData, condition: e.target.value as AssetCondition })}
                className="w-full h-10 px-3 rounded-md border border-gray-300"
              >
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
                <option value="DAMAGED">Damaged</option>
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={assetData.status}
                onChange={(e) => setAssetData({ ...assetData, status: e.target.value as AssetStatus })}
                className="w-full h-10 px-3 rounded-md border border-gray-300"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="DISPOSED">Disposed</option>
                <option value="LOST">Lost</option>
                <option value="DAMAGED">Damaged</option>
              </select>
            </div>
            <div>
              <Label>Useful Life (Months)</Label>
              <Input
                type="number"
                value={assetData.usefulLife}
                onChange={(e) => setAssetData({ ...assetData, usefulLife: e.target.value })}
                placeholder="60"
              />
            </div>
            <div>
              <Label>Salvage Value (TZS)</Label>
              <Input
                type="number"
                value={assetData.salvageValue}
                onChange={(e) => setAssetData({ ...assetData, salvageValue: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Warranty Expiry</Label>
              <Input
                type="date"
                value={assetData.warrantyExpiry}
                onChange={(e) => setAssetData({ ...assetData, warrantyExpiry: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={assetData.description}
                onChange={(e) => setAssetData({ ...assetData, description: e.target.value })}
                rows={2}
                placeholder="Asset description..."
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={assetData.notes}
                onChange={(e) => setAssetData({ ...assetData, notes: e.target.value })}
                rows={2}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditAsset(false); resetAssetData(); setEditingAsset(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAsset}>Update Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
