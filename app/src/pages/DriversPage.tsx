import { useState } from 'react';
import { Truck, UserCheck, Clock, CheckCircle, Package } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { useFileStore } from '@/store/fileStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { ShipmentFile, User } from '@/types';
import type { AppRoute } from '@/App';
import { mockUsers } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DriverWorkloadCardProps {
  driver: User;
  workload: {
    totalAssigned: number;
    inProgress: number;
    completed: number;
  };
  onAssign: () => void;
}

function DriverWorkloadCard({ driver, workload, onAssign }: DriverWorkloadCardProps) {
  const { canManipulateDriversModule } = useAuthStore();
  const capacity = 5; // Drivers can handle 5 jobs at a time
  const utilization = (workload.totalAssigned / capacity) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold">{driver.name}</p>
              <p className="text-sm text-gray-500">{driver.email}</p>
            </div>
          </div>
          <Badge
            className={cn(
              utilization > 80 ? 'bg-red-100 text-red-700' :
              utilization > 50 ? 'bg-amber-100 text-amber-700' :
              'bg-green-100 text-green-700'
            )}
          >
            {utilization > 80 ? 'Busy' : utilization > 50 ? 'Moderate' : 'Available'}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Workload</span>
              <span className="font-medium">{workload.totalAssigned}/{capacity}</span>
            </div>
            <Progress value={utilization} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-lg font-bold">{workload.totalAssigned}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="text-lg font-bold text-blue-600">{workload.inProgress}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <p className="text-lg font-bold text-green-600">{workload.completed}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={onAssign} 
          variant="outline" 
          className="w-full mt-4"
          disabled={!canManipulateDriversModule()}
        >
          {canManipulateDriversModule() ? 'Assign Job' : 'View Only'}
        </Button>
      </CardContent>
    </Card>
  );
}

interface DriversPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function DriversPage({ navigate }: DriversPageProps) {
  const { user, canManipulateDriversModule, canViewDriversModule, isExecutive } = useAuthStore();
  const { files, assignDriver } = useFileStore();
  const { addNotification } = useNotificationStore();

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ShipmentFile | null>(null);
  const [selectedDriver, setSelectedDriver] = useState('');

  const drivers = mockUsers.filter((u: User) => u.role === 'driver');
  const canManipulate = canManipulateDriversModule();
  const canView = canViewDriversModule();
  const isUserExecutive = isExecutive();

  // Files that need driver assignment
  const filesNeedingDrivers = files.filter((f: ShipmentFile) => 
    f.status === 'DRIVER_REQUESTED' || 
    f.status === 'DRIVER_ASSIGNED' ||
    f.status === 'DRIVER_COLLECTING_CARGO'
  );

  const getDriverWorkload = (driverId: string) => {
    const driverFiles = files.filter(f => f.assignedDriverId === driverId);
    return {
      totalAssigned: driverFiles.filter(f => 
        f.status === 'DRIVER_ASSIGNED' || 
        f.status === 'DRIVER_COLLECTING_CARGO'
      ).length,
      inProgress: driverFiles.filter(f => f.status === 'DRIVER_COLLECTING_CARGO').length,
      completed: driverFiles.filter(f => 
        f.status === 'CARGO_COLLECTED_FROM_AIRPORT' || 
        f.status === 'CARGO_COLLECTED_FROM_ICD' ||
        f.status === 'DELIVERED_TO_CLIENT'
      ).length,
    };
  };

  const handleAssignDriver = () => {
    if (!selectedDriver || !selectedFile || !user) return;

    assignDriver(selectedFile.id, selectedDriver, user.id);
    
    addNotification({
      userId: selectedDriver,
      title: 'Job Assigned',
      message: `You have been assigned to collect cargo for file ${selectedFile.fileNumber}`,
      type: 'info',
      fileId: selectedFile.id,
      link: '/drivers',
    });

    toast.success('Driver assigned successfully');
    setAssignDialogOpen(false);
    setSelectedFile(null);
    setSelectedDriver('');
  };

  const stats = {
    needingDrivers: files.filter((f: ShipmentFile) => f.status === 'DRIVER_REQUESTED').length,
    assigned: files.filter((f: ShipmentFile) => f.status === 'DRIVER_ASSIGNED').length,
    collecting: files.filter((f: ShipmentFile) => f.status === 'DRIVER_COLLECTING_CARGO').length,
    completed: files.filter((f: ShipmentFile) => 
      f.status === 'CARGO_COLLECTED_FROM_AIRPORT' || 
      f.status === 'CARGO_COLLECTED_FROM_ICD'
    ).length,
  };

  if (!canView) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-300 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-slate-800" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">Access Denied</h3>
                <p className="text-sm text-slate-600 mt-1">
                  You do not have permission to access the Drivers Module. 
                  Only HR Manager, Executives (COO, Managing Director, Commercial Manager), and Administrator can view this module.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drivers Management</h1>
          <p className="text-gray-500 mt-1">
            Manage driver assignments and monitor delivery operations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.needingDrivers}</p>
                <p className="text-sm text-gray-500">Needs Driver</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.assigned}</p>
                <p className="text-sm text-gray-500">Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.collecting}</p>
                <p className="text-sm text-gray-500">Collecting</p>
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
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-gray-500">Collected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!canManipulate && user && (
        <Card className="bg-gradient-to-r from-orange-50 to-blue-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-300 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4 text-slate-800" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  {isUserExecutive ? 'Executive View' : 'View-Only Access'} - Drivers Module
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  You have read-only access to view driver statistics and assignments. 
                  Only the HR Manager can assign drivers and manage driver operations. 
                  You can view all driver activities and file assignments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {canManipulate && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Driver Workload</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver: User) => (
              <DriverWorkloadCard
                key={driver.id}
                driver={driver}
                workload={getDriverWorkload(driver.id)}
                onAssign={() => {
                  const needingDrivers = files.filter(f => f.status === 'DRIVER_REQUESTED');
                  if (needingDrivers.length === 0) {
                    toast.error('No files need driver assignment');
                    return;
                  }
                  if (needingDrivers.length === 1) {
                    setSelectedFile(needingDrivers[0]);
                  }
                  setSelectedDriver(driver.id);
                  setAssignDialogOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Files Requiring Drivers</CardTitle>
          <CardDescription>Manage driver assignments for cargo collection</CardDescription>
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
                {filesNeedingDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No files requiring driver assignment</p>
                    </td>
                  </tr>
                ) : (
                  filesNeedingDrivers.map((file: ShipmentFile) => (
                    <tr key={file.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-mono font-medium text-blue-600">{file.fileNumber}</p>
                          <p className="text-sm text-gray-500">{file.shipmentType} | {file.transportMode}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{file.client?.name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            'text-xs',
                            file.status === 'DRIVER_REQUESTED' ? 'bg-amber-100 text-amber-700' :
                            file.status === 'DRIVER_ASSIGNED' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          )}
                        >
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
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate('files/:id', { id: file.id })}>
                            View
                          </Button>
                          {canManipulate && file.status === 'DRIVER_REQUESTED' && (
                            <Button size="sm" onClick={() => { setSelectedFile(file); setAssignDialogOpen(true); }}>
                              Assign Driver
                            </Button>
                          )}
                          {!canManipulate && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                              View Only
                            </Badge>
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

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
            <DialogDescription>
              {selectedFile && `Assign a driver to collect cargo for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!selectedFile && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select File</label>
                <Select 
                  value="" 
                  onValueChange={(fileId) => {
                    const file = files.find(f => f.id === fileId);
                    setSelectedFile(file || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a file" />
                  </SelectTrigger>
                  <SelectContent>
                    {files
                      .filter(f => f.status === 'DRIVER_REQUESTED')
                      .map((file) => (
                        <SelectItem key={file.id} value={file.id}>
                          {file.fileNumber} - {file.client?.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Driver</label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver: User) => {
                    const workload = getDriverWorkload(driver.id);
                    return (
                      <SelectItem key={driver.id} value={driver.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{driver.name}</span>
                          <span className="text-xs text-gray-500 ml-4">
                            ({workload.totalAssigned} active jobs)
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
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignDriver} disabled={!selectedDriver || !selectedFile}>
              Assign Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
