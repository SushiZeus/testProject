import { useState } from 'react';
import { Building2, Plus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInventoryStore } from '@/store/inventoryStore';
import { toast } from 'sonner';

const emptyForm = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  paymentTerms: '',
};

export function SuppliersPage() {
  const { suppliers, createSupplier } = useInventoryStore();
  const [query, setQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filteredSuppliers = suppliers.filter((supplier) =>
    [supplier.code, supplier.name, supplier.contactPerson, supplier.email, supplier.phone]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast.error('Enter a supplier name');
      return;
    }

    createSupplier({ ...form, name: form.name.trim(), status: 'ACTIVE' });
    setForm(emptyForm);
    setIsDialogOpen(false);
    toast.success('Supplier added');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Suppliers</h1>
          <p className="mt-1 text-gray-500">Manage inventory suppliers and contact details</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" />Add supplier</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>Add supplier</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="supplier-name">Supplier name *</Label>
                <Input id="supplier-name" autoComplete="organization" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-contact">Contact person</Label>
                <Input id="supplier-contact" autoComplete="name" value={form.contactPerson} onChange={(event) => setForm({ ...form, contactPerson: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-phone">Phone</Label>
                <Input id="supplier-phone" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-email">Email</Label>
                <Input id="supplier-email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-terms">Payment terms</Label>
                <Input id="supplier-terms" value={form.paymentTerms} onChange={(event) => setForm({ ...form, paymentTerms: event.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="supplier-address">Address</Label>
                <Input id="supplier-address" autoComplete="street-address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
              </div>
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Save supplier</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">All suppliers</p><p className="text-2xl font-bold">{suppliers.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Active</p><p className="text-2xl font-bold text-green-700">{suppliers.filter((supplier) => supplier.status === 'ACTIVE').length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Supplier directory</CardTitle><CardDescription>{filteredSuppliers.length} suppliers</CardDescription></div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input aria-label="Search suppliers" placeholder="Search suppliers..." value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Payment terms</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500"><Building2 className="mx-auto mb-3 h-10 w-10 opacity-30" />No suppliers found</td></tr>
              ) : filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-sm">{supplier.code}</td>
                  <td className="px-4 py-3 font-medium">{supplier.name}</td>
                  <td className="px-4 py-3">{supplier.contactPerson || '—'}</td>
                  <td className="px-4 py-3">{supplier.email || '—'}</td>
                  <td className="px-4 py-3">{supplier.phone || '—'}</td>
                  <td className="px-4 py-3">{supplier.paymentTerms || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={supplier.status === 'ACTIVE' ? 'default' : 'secondary'}>{supplier.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}