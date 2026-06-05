import { useState } from 'react';
import { ArrowLeft, Edit, Wrench, Calendar, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { useFixedAssetsStore } from '@/store/fixedAssetsStore';
import type { AppRoute } from '@/App';
import { cn } from '@/lib/utils';
import type { AssetStatus } from '@/types/fixedAssets';

interface AssetDetailPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
  assetId: string;
}

const statusColors: Record<AssetStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
  UNDER_MAINTENANCE: 'bg-amber-100 text-amber-700',
  DISPOSED: 'bg-red-100 text-red-700',
  LOST: 'bg-purple-100 text-purple-700',
  DAMAGED: 'bg-orange-100 text-orange-700',
};

export function AssetDetailPage({ navigate, assetId }: AssetDetailPageProps) {
  const { user } = useAuthStore();
  const { getAssetById, getAssetAssignments, getAssetMaintenances } = useFixedAssetsStore();
  const [activeTab, setActiveTab] = useState('details');

  const asset = getAssetById(assetId);
  const assignments = asset ? getAssetAssignments(asset.id) : [];
  const maintenances = asset ? getAssetMaintenances(asset.id) : [];

  if (!asset || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500">Asset not found</p>
          <Button onClick={() => navigate('assets')} variant="outline" className="mt-4">
            Back to Register
          </Button>
        </div>
      </div>
    );
  }

  const canManage = user.role === 'hr_manager';

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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('assets')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{asset.code}</h1>
          <p className="text-gray-500 mt-1">{asset.name}</p>
        </div>
        <Badge className={cn('text-sm', statusColors[asset.status])}>
          {asset.status.replace(/_/g, ' ')}
        </Badge>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
              Assign
            </Button>
            <Button variant="outline" size="sm" className="bg-amber-600 text-white hover:bg-amber-700">
              <Wrench className="w-4 h-4 mr-2" />
              Maintenance
            </Button>
            <Button variant="destructive" size="sm">
              Dispose
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{asset.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Serial #</p>
                    <p className="font-medium">{asset.serialNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{asset.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{asset.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Condition</p>
                    <Badge variant="outline">{asset.condition}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assigned To</p>
                    <p className="font-medium">{asset.assignedToName || 'Unassigned'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Purchase Cost</p>
                    <p className="font-medium">{formatCurrency(asset.purchaseCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Purchase Date</p>
                    <p className="font-medium">{formatDate(asset.purchaseDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Accumulated Depr.</p>
                    <p className="font-medium text-red-600">{formatCurrency(asset.accumulatedDepreciation)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Book Value</p>
                    <p className="font-medium text-green-600">{formatCurrency(asset.bookValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Useful Life</p>
                    <p className="font-medium">{asset.usefulLife} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Salvage Value</p>
                    <p className="font-medium">{formatCurrency(asset.salvageValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {asset.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{asset.description}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Method</p>
                    <p className="font-medium">Straight Line (SL)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cost</p>
                    <p className="font-medium">{formatCurrency(asset.purchaseCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Life</p>
                    <p className="font-medium">{asset.usefulLife}m</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Depr.</p>
                    <p className="font-medium text-red-600">
                      {formatCurrency((asset.purchaseCost - asset.salvageValue) / asset.usefulLife)}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Period</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Depreciation</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Accumulated</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Book Value</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">Current</td>
                        <td className="text-right py-4 px-4">-</td>
                        <td className="text-right py-4 px-4 text-red-600">
                          {formatCurrency(asset.accumulatedDepreciation)}
                        </td>
                        <td className="text-right py-4 px-4 text-green-600 font-medium">
                          {formatCurrency(asset.bookValue)}
                        </td>
                        <td className="text-center py-4 px-4">
                          <Badge variant="outline">
                            {asset.lastDepreciationDate ? formatDate(asset.lastDepreciationDate) : 'Never'}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment History</CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No assignment history</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Employee</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Assigned Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Return Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Condition</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment) => (
                        <tr key={assignment.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <p className="font-medium">{assignment.employeeName}</p>
                            <p className="text-sm text-gray-500">{assignment.department}</p>
                          </td>
                          <td className="py-4 px-4">{formatDate(assignment.assignedDate)}</td>
                          <td className="py-4 px-4">
                            {assignment.returnDate ? formatDate(assignment.returnDate) : '-'}
                          </td>
                          <td className="py-4 px-4">
                            {assignment.condition && (
                              <Badge variant="outline">{assignment.condition}</Badge>
                            )}
                          </td>
                          <td className="text-center py-4 px-4">
                            <Badge variant={assignment.status === 'ASSIGNED' ? 'default' : 'secondary'}>
                              {assignment.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Maintenance History</CardTitle>
                {canManage && (
                  <Button size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {maintenances.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No maintenance records</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Scheduled</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Completed</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Cost</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenances.map((maintenance) => (
                        <tr key={maintenance.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                          <p className="font-medium">{maintenance.type}</p>
                            <p className="text-sm text-gray-500">{maintenance.title}</p>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline">{maintenance.priority}</Badge>
                          </td>
                          <td className="py-4 px-4">{formatDate(maintenance.scheduledDate)}</td>
                          <td className="py-4 px-4">
                            {maintenance.completedDate ? formatDate(maintenance.completedDate) : '-'}
                          </td>
                          <td className="text-right py-4 px-4">
                            {maintenance.cost ? formatCurrency(maintenance.cost) : '-'}
                          </td>
                          <td className="text-center py-4 px-4">
                            <Badge variant={maintenance.status === 'COMPLETED' ? 'default' : 'secondary'}>
                              {maintenance.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
