import { useState } from 'react';
import { Calendar, TrendingDown, DollarSign, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { useFixedAssetsStore } from '@/store/fixedAssetsStore';
import type { AppRoute } from '@/App';
import { toast } from 'sonner';

interface DepreciationPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function DepreciationPage({ navigate: _navigate }: DepreciationPageProps) {
  const { user } = useAuthStore();
  const { assets, depreciationRuns, runDepreciation } = useFixedAssetsStore();
  
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  if (!user) return null;

  const canManage = user.role === 'hr_manager';

  const activeAssets = assets.filter(a => a.status === 'ACTIVE');
  const totalBookValue = activeAssets.reduce((sum, a) => sum + a.bookValue, 0);
  const totalAccumulatedDepr = activeAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
  const totalCost = activeAssets.reduce((sum, a) => sum + a.purchaseCost, 0);

  const handleRunDepreciation = () => {
    if (!user) return;

    const existingRun = depreciationRuns.find(r => r.month === selectedMonth && r.year === selectedYear);
    if (existingRun) {
      toast.error('Depreciation already run for this period');
      return;
    }

    runDepreciation(selectedMonth, selectedYear, user.name);
    toast.success('Depreciation run completed successfully');
    setShowRunDialog(false);
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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Depreciation</h1>
          <p className="text-gray-500 mt-1">
            Calculate and track asset depreciation
          </p>
        </div>
        {canManage && (
          <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Play className="w-4 h-4 mr-2" />
                Run Depreciation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Run Depreciation</DialogTitle>
                <DialogDescription>
                  Calculate depreciation for all active assets for the selected period
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Month</Label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-gray-300"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Year</Label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-gray-300"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>{activeAssets.length}</strong> active assets will be depreciated for{' '}
                    <strong>{months[selectedMonth - 1]} {selectedYear}</strong>
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRunDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRunDepreciation} className="bg-blue-600 hover:bg-blue-700">
                  Run Depreciation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
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
                <p className="text-sm text-gray-500">Accumulated Depr.</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalAccumulatedDepr)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Book Value</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalBookValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Runs</p>
                <p className="text-xl font-bold">{depreciationRuns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Depreciation Schedule ({activeAssets.length} assets)</CardTitle>
          <CardDescription>Current depreciation status for all active assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Method</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Cost</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Life</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Monthly Depr.</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Accumulated</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Book Value</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Last Run</th>
                </tr>
              </thead>
              <tbody>
                {activeAssets.map((asset) => {
                  const monthlyDepr = (asset.purchaseCost - asset.salvageValue) / asset.usefulLife;
                  return (
                    <tr key={asset.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-mono font-medium text-blue-600">{asset.code}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{asset.name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm">{asset.category}</p>
                      </td>
                      <td className="text-center py-4 px-4">
                        <Badge variant="outline">SL</Badge>
                      </td>
                      <td className="text-right py-4 px-4">
                        {formatCurrency(asset.purchaseCost)}
                      </td>
                      <td className="text-center py-4 px-4">
                        {asset.usefulLife}m
                      </td>
                      <td className="text-right py-4 px-4 text-red-600">
                        {formatCurrency(monthlyDepr)}
                      </td>
                      <td className="text-right py-4 px-4 text-red-600 font-medium">
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {depreciationRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Depreciation History</CardTitle>
            <CardDescription>Previous depreciation runs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Run Number</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Period</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Assets</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Total Depreciation</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Run By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Run Date</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {depreciationRuns.slice().reverse().map((run) => (
                    <tr key={run.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-mono font-medium text-blue-600">{run.runNumber}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{run.period}</p>
                      </td>
                      <td className="text-center py-4 px-4">
                        {run.assetsCount}
                      </td>
                      <td className="text-right py-4 px-4 text-red-600 font-medium">
                        {formatCurrency(run.totalDepreciation)}
                      </td>
                      <td className="py-4 px-4">
                        {run.runBy}
                      </td>
                      <td className="py-4 px-4">
                        {formatDate(run.runDate)}
                      </td>
                      <td className="text-center py-4 px-4">
                        <Badge className="bg-green-100 text-green-700">
                          {run.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
