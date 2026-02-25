import { useState } from 'react';
import {
  Truck,
  UserCheck,
  Package,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { useFileStore } from '@/store/fileStore';
import { useDriverStore } from '@/store/driverStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { User, DriverStatus, ShipmentFile } from '@/types';
import type { AppRoute } from '@/App';
import { mockUsers } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DriverCardProps {
  driver: User;
  workload: {
    totalAssigned: number;
    pending: number;
    accepted: number;
    collecting: number;
    collected: number;
  };
  status: DriverStatus;
  onAssign: () => void;
}

function DriverCard({ driver, workload, status, onAssign }: DriverCardProps) {
  const statusColors: Record<DriverStatus, string> = {
    AVAILABLE: 'bg-green-100 text-green-700',
    ON_JOB: 'bg-amber-100 text-amber-700',
    OFF_DUTY: 'bg-gray-100 text-gray-700',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <Truck className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-lg">{driver.name}</p>
              <p className="text-sm text-gray-500">{driver.phone}</p>
            </div>
          </div>
          <Badge className={cn(statusColors[status])}>
            {status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center mb-4">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-lg font-bold">{workload.totalAssigned}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-2">
            <p className="text-lg font-bold text-amber-600">{workload.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-lg font-bold text-blue-600">{workload.collecting}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-lg font-bold text-green-600">{workload.collected}</p>
            <p className="text-xs text-gray-500">Done</p>
          </div>
        </div>

        <Button 
          onClick={onAssign} 
          variant="outline" 
          className="w-full"
          disabled={status === 'ON_JOB'}
        >
          {status === 'ON_JOB' ? 'Currently on Job' : 'Assign to File'}
        </Button>
      </CardContent>
    </Card>
  );
}

interface DriverManagementPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function DriverManagementPage({ }: DriverManagementPageProps) {
  const { user } = useAuthStore();
  const { files, updateFileStatus } = useFileStore();
  const { createAssignment, getDriverWorkload, getDriverStatus } = useDriverStore();
  const { addNotification } = useNotificationStore();

  const [activeTab, setActiveTab] = useState('drivers');
  const [selectedFile, setSelectedFile] = useState<ShipmentFile | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const drivers = mockUsers.filter((u: User) => u.role === 'driver');

  const readyForDelivery: ShipmentFile[] = files.filter((f: ShipmentFile) => 
    f.status === 'SWISSPORT_CHARGES_PAID' || 
    f.status === 'DRIVER_REQUESTED' ||
    f.status === 'DRIVER_ASSIGNED' ||
    f.status === 'DRIVER_COLLECTING_CARGO'
  );

  const handleAssignDriver = () => {
    if (!selectedFile || !selectedDriver || !user) return;

    createAssignment({
      fileId: selectedFile.id,
      driverId: selectedDriver,
      requestedBy: user.id,
      assignedBy: user.id,
    });

    updateFileStatus(
      selectedFile.id,
      'DRIVER_ASSIGNED',
      user.id,
      { assignedDriverId: selectedDriver }
    );

    addNotification({
      userId: selectedDriver,
      title: 'New Delivery Assignment',
      message: `You have been assigned to collect cargo for file ${selectedFile.fileNumber}`,
      type: 'info',
      fileId: selectedFile.id,
    });

    drivers
      .filter((d: User) => d.id !== selectedDriver)
      .forEach((driver: User) => {
        addNotification({
          userId: driver.id,
          title: 'Driver Assignment Update',
          message: `File ${selectedFile.fileNumber} has been assigned to another driver`,
          type: 'info',
        });
      });

    toast.success('Driver assigned successfully');
    setAssignDialogOpen(false);
    setSelectedFile(null);
    setSelectedDriver('');
  };

  const stats = {
    totalDrivers: drivers.length,
    available: drivers.filter((d: User) => getDriverStatus(d.id) === 'AVAILABLE').length,
    onJob: drivers.filter((d: User) => getDriverStatus(d.id) === 'ON_JOB').length,
    pendingAssignments: readyForDelivery.filter((f: ShipmentFile) => !f.assignedDriverId).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-500 mt-1">
            Manage drivers and assign delivery jobs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDrivers}</p>
                <p className="text-sm text-gray-500">Total Drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.available}</p>
                <p className="text-sm text-gray-500">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.onJob}</p>
                <p className="text-sm text-gray-500">On Job</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingAssignments}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver: User) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                workload={getDriverWorkload(driver.id)}
                status={getDriverStatus(driver.id)}
                onAssign={() => {
                  setSelectedDriver(driver.id);
                  setAssignDialogOpen(true);
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Assignments</CardTitle>
              <CardDescription>Files ready for driver assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">File Number</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Client</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Assigned Driver</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readyForDelivery.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No files ready for delivery</p>
                        </td>
                      </tr>
                    ) : (
                      readyForDelivery.map((file: ShipmentFile) => (
                        <tr key={file.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-mono font-medium text-blue-600">{file.fileNumber}</p>
                              <p className="text-sm text-gray-500">{file.shipmentType}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium">{file.client?.name}</p>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              {file.status.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            {file.assignedDriver ? (
                              <span className="text-sm">{file.assignedDriver.name}</span>
                            ) : (
                              <span className="text-sm text-gray-400">Not assigned</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <Button size="sm" onClick={() => { setSelectedFile(file); setAssignDialogOpen(true); }}>
                              {file.assignedDriver ? 'Reassign' : 'Assign Driver'}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
            <DialogDescription>
              {selectedFile 
                ? `Assign a driver to file ${selectedFile.fileNumber}`
                : 'Select a file and driver to assign'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!selectedFile && (
              <div className="space-y-2">
                <Label>Select File</Label>
                <Select 
                  value={''} 
                  onValueChange={(id: string) => {
                    const foundFile = readyForDelivery.find((f) => f.id === id);
                    setSelectedFile(foundFile || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a file" />
                  </SelectTrigger>
                  <SelectContent>
                    {readyForDelivery.map((file: ShipmentFile) => (
                      <SelectItem key={file.id} value={file.id}>
                        {file.fileNumber} - {file.client?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Select Driver</Label>
              <Select 
                value={selectedDriver} 
                onValueChange={setSelectedDriver}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver: User) => {
                    const status = getDriverStatus(driver.id);
                    const workload = getDriverWorkload(driver.id);
                    return (
                      <SelectItem 
                        key={driver.id} 
                        value={driver.id}
                        disabled={status === 'ON_JOB'}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{driver.name}</span>
                          <span className={cn(
                            'text-xs ml-4',
                            status === 'AVAILABLE' ? 'text-green-600' : 'text-amber-600'
                          )}>
                            {status.replace('_', ' ')} ({workload.totalAssigned} jobs)
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAssignDialogOpen(false);
              setSelectedFile(null);
              setSelectedDriver('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignDriver}
              disabled={!selectedFile || !selectedDriver}
            >
              <Truck className="w-4 h-4 mr-2" />
              Assign Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
