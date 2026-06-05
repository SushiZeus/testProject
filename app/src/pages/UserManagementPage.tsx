import { useState } from 'react';
import { Users, Plus, Edit, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useUserManagementStore } from '@/store/userManagementStore';
import type { User, UserRole } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function UserManagementPage() {
  const { user } = useAuthStore();
  const { registerUser, updateUser, deactivateUser, activateUser, getAllUsers } = useUserManagementStore();

  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'documentation_officer' as UserRole,
    department: 'Documentation',
    password: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'documentation_officer' as UserRole,
    department: 'Documentation',
  });

  const allUsers = getAllUsers();
  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: allUsers.length,
    active: allUsers.filter(u => u.isActive).length,
    inactive: allUsers.filter(u => !u.isActive).length,
  };

  const roleOptions: { value: UserRole; label: string; department: string }[] = [
    { value: 'documentation_officer', label: 'Documentation Officer', department: 'Documentation' },
    { value: 'declaration_manager', label: 'Declaration Manager', department: 'Declaration' },
    { value: 'declarant', label: 'Declarant', department: 'Declaration' },
    { value: 'operations_manager', label: 'Operations Manager', department: 'Operations' },
    { value: 'operation_clerk', label: 'Operations Clerk', department: 'Operations' },
    { value: 'permits_clerk', label: 'Permits Clerk', department: 'Operations' },
    { value: 'shipping_line_clerk', label: 'Shipping Line Clerk', department: 'Operations' },
    { value: 'delivery_clerk', label: 'Delivery Clerk', department: 'Operations' },
    { value: 'transport_manager', label: 'Transport Manager', department: 'Transport' },
    { value: 'driver', label: 'Driver', department: 'Transport' },
    { value: 'finance_manager', label: 'Finance Manager', department: 'Finance' },
    { value: 'cashier', label: 'Cashier', department: 'Finance' },
    { value: 'hr_manager', label: 'HR Manager', department: 'HR' },
    { value: 'commercial_manager', label: 'Commercial Manager', department: 'Management' },
    { value: 'coo', label: 'COO', department: 'Management' },
    { value: 'managing_director', label: 'Managing Director', department: 'Management' },
    { value: 'contact_person', label: 'Contact Person', department: 'Client Services' },
    { value: 'administrator', label: 'Administrator', department: 'IT' },
  ];

  const handleRegister = () => {
    if (!user) return;

    if (!registerForm.name.trim()) {
      toast.error('Please enter user name');
      return;
    }

    if (!registerForm.email.trim()) {
      toast.error('Please enter email address');
      return;
    }

    if (!registerForm.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!registerForm.password.trim()) {
      toast.error('Please enter a password');
      return;
    }

    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const newUser = registerUser({
        ...registerForm,
        createdBy: user.id,
      });

      toast.success(`User ${newUser.name} registered successfully`);
      setRegisterDialogOpen(false);
      setRegisterForm({
        name: '',
        email: '',
        phone: '',
        role: 'documentation_officer',
        department: 'Documentation',
        password: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to register user');
    }
  };

  const handleEdit = () => {
    if (!selectedUser) return;

    if (!editForm.name.trim()) {
      toast.error('Please enter user name');
      return;
    }

    updateUser(selectedUser.id, {
      name: editForm.name,
      phone: editForm.phone,
      role: editForm.role,
      department: editForm.department,
    });

    toast.success('User updated successfully');
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeactivate = (userId: string) => {
    deactivateUser(userId);
    toast.success('User deactivated');
  };

  const handleActivate = (userId: string) => {
    activateUser(userId);
    toast.success('User activated');
  };

  const openEditDialog = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditForm({
      name: userToEdit.name,
      email: userToEdit.email,
      phone: userToEdit.phone || '',
      role: userToEdit.role,
      department: userToEdit.department || '',
    });
    setEditDialogOpen(true);
  };

  const handleRoleChange = (role: UserRole, isEdit: boolean = false) => {
    const roleOption = roleOptions.find(r => r.value === role);
    if (roleOption) {
      if (isEdit) {
        setEditForm({ ...editForm, role, department: roleOption.department });
      } else {
        setRegisterForm({ ...registerForm, role, department: roleOption.department });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Register and manage system users</p>
        </div>
        <Button onClick={() => setRegisterDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Register User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Users</p>
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
                <p className="text-sm text-gray-500">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-sm text-gray-500">Inactive Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage system users and their access</CardDescription>
          <div className="mt-4">
            <Input
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium">{u.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm">{u.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          {u.role.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm">{u.department}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="secondary"
                          className={cn(
                            u.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          )}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(u)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          {u.isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivate(u.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivate(u.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              Activate
                            </Button>
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

      {/* Register User Dialog */}
      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register New User</DialogTitle>
            <DialogDescription>
              Create a new user account with role and department assignment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="John Doe"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  placeholder="john.doe@company.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="+255 712 345 678"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Password *</Label>
                <Input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                  value={registerForm.role}
                  onValueChange={(value) => handleRoleChange(value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Department *</Label>
                <Input
                  value={registerForm.department}
                  onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Module Access</p>
                  <p className="text-xs text-blue-600 mt-1">
                    System will automatically grant appropriate module access based on the selected role
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegister}>
              <Plus className="w-4 h-4 mr-2" />
              Register User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role assignment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value) => handleRoleChange(value as UserRole, true)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Department *</Label>
                <Input
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
