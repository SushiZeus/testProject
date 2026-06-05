import { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInventoryStore } from '@/store/inventoryStore';
import { toast } from 'sonner';
import type { AppRoute } from '@/App';

interface ItemsPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function ItemsPage({ }: ItemsPageProps) {
  const { items, createItem } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewItem, setShowNewItem] = useState(false);
  const [itemData, setItemData] = useState({
    name: '',
    description: '',
    category: '',
    unit: '',
    reorderLevel: 0,
    reorderQuantity: 0,
    unitCost: 0,
    status: 'ACTIVE' as const,
    code: '',
  });

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateItem = () => {
    if (!itemData.name || !itemData.category || !itemData.unit) {
      toast.error('Please fill all required fields');
      return;
    }

    createItem(itemData);
    toast.success('Item created successfully');
    setItemData({
      name: '',
      description: '',
      category: '',
      unit: '',
      reorderLevel: 0,
      reorderQuantity: 0,
      unitCost: 0,
      status: 'ACTIVE',
      code: '',
    });
    setShowNewItem(false);
  };

  const getTotalStock = (item: typeof items[0]) => {
    return item.locations.reduce((sum, loc) => sum + loc.quantity, 0);
  };

  const lowStockItems = items.filter(item => getTotalStock(item) <= item.reorderLevel);
  const totalValue = items.reduce((sum, item) => sum + (getTotalStock(item) * item.unitCost), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Items</h1>
        <Dialog open={showNewItem} onOpenChange={setShowNewItem}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Item Name</Label>
                <Input
                  value={itemData.name}
                  onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={itemData.description}
                  onChange={(e) => setItemData({ ...itemData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Input
                    value={itemData.category}
                    onChange={(e) => setItemData({ ...itemData, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={itemData.unit}
                    onChange={(e) => setItemData({ ...itemData, unit: e.target.value })}
                    placeholder="e.g., PCS, KG, L"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reorder Level</Label>
                  <Input
                    type="number"
                    value={itemData.reorderLevel}
                    onChange={(e) => setItemData({ ...itemData, reorderLevel: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Reorder Quantity</Label>
                  <Input
                    type="number"
                    value={itemData.reorderQuantity}
                    onChange={(e) => setItemData({ ...itemData, reorderQuantity: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>Unit Cost (TZS)</Label>
                <Input
                  type="number"
                  value={itemData.unitCost}
                  onChange={(e) => setItemData({ ...itemData, unitCost: parseFloat(e.target.value) })}
                />
              </div>
              <Button onClick={handleCreateItem} className="w-full">Create Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TZS {totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {items.filter(i => i.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Items</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-center p-2">Stock</th>
                  <th className="text-center p-2">Reorder Level</th>
                  <th className="text-right p-2">Unit Cost</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const totalStock = getTotalStock(item);
                  const isLowStock = totalStock <= item.reorderLevel;
                  return (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-sm">{item.code}</td>
                      <td className="p-2">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </td>
                      <td className="p-2">{item.category}</td>
                      <td className="text-center p-2">
                        <span className={isLowStock ? 'text-red-600 font-bold' : ''}>
                          {totalStock} {item.unit}
                        </span>
                      </td>
                      <td className="text-center p-2">{item.reorderLevel} {item.unit}</td>
                      <td className="text-right p-2">TZS {item.unitCost.toLocaleString()}</td>
                      <td className="text-center p-2">
                        <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {item.status}
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
    </div>
  );
}
