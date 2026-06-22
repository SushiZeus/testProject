import { useState } from 'react';
import {
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  FileText,
  Filter,
  Search,
  User as UserIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { useFileStore } from '@/store/fileStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { ShipmentFile, TruckSize } from '@/types';
import type { AppRoute } from '@/App';
import { mockUsers } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { statusColors } from '@/utils/statusColors';

interface DeliveryPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function DeliveryPage({ navigate }: DeliveryPageProps) {
  const { user, hasPermission } = useAuthStore();
  const { files, updateFileStatus } = useFileStore();
  const { addNotification } = useNotificationStore();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<ShipmentFile | null>(null);
  const [truckSizeDialogOpen, setTruckSizeDialogOpen] = useState(false);
  const [selectedTruckSize, setSelectedTruckSize] = useState<TruckSize | ''>('');
  const [driverSelectionDialogOpen, setDriverSelectionDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [pendingTruckSize, setPendingTruckSize] = useState<TruckSize | null>(null);

  // Delivery files - those with DRIVER_REQUESTED status that need assignment
  const deliveryFiles = files.filter((f: ShipmentFile) =>
    f.status === 'DRIVER_REQUESTED' ||
    f.status === 'DRIVER_ASSIGNED' ||
    f.status === 'DRIVER_COLLECTING_CARGO' ||
    f.status === 'CARGO_COLLECTED_FROM_ICD' ||
    f.status === 'CARGO_COLLECTED_FROM_AIRPORT' ||
    f.status === 'DELIVERED_TO_CLIENT'
  );

  const filteredFiles = deliveryFiles.filter((file: ShipmentFile) => {
    const matchesSearch =
      file.fileNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.client?.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && file.status === 'DRIVER_REQUESTED';
    if (activeTab === 'assigned') return matchesSearch && (
      file.status === 'DRIVER_ASSIGNED' ||
      file.status === 'DRIVER_COLLECTING_CARGO' ||
      file.status === 'CARGO_COLLECTED_FROM_ICD' ||
      file.status === 'CARGO_COLLECTED_FROM_AIRPORT'
    );
    if (activeTab === 'completed') return matchesSearch && file.status === 'DELIVERED_TO_CLIENT';
    return matchesSearch;
  });

  const handleRequestDriver = (file: ShipmentFile) => {
    setSelectedFile(file);
    setTruckSizeDialogOpen(true);
  };

  const handleTruckSizeSelect = (size: TruckSize) => {
    if (!selectedFile || !user) return;

    setSelectedTruckSize(size);
    setPendingTruckSize(size);
    setTruckSizeDialogOpen(false);

    // Determine who receives the request based on truck size
    const hrManagerId = '9'; // HR Manager for small trucks
    const transportManagerId = '8'; // Transport Manager for big trucks
    const recipientId = size === 'SMALL' ? hrManagerId : transportManagerId;
    const recipientRole = size === 'SMALL' ? 'HR Manager' : 'Transport Manager';

    // Store the driver request with truck size info on the file
    updateFileStatus(
      selectedFile.id,
      selectedFile.status, // Keep DRIVER_REQUESTED
      user.id,
      {
        requestedTruckSize: size,
        requestedTruckSizeAt: new Date(),
        requestedTruckSizeBy: user.id,
        truckSizeForApproval: true,
      } as Partial<ShipmentFile>
    );

    // Send notification to appropriate manager
    addNotification({
      userId: recipientId,
      title: `Driver Request - ${size} Truck`,
      message: `File ${selectedFile.fileNumber} requires a ${size.toLowerCase()} truck. Please assign a driver.`,
      type: 'info',
      fileId: selectedFile.id,
      link: size === 'SMALL' ? '/drivers-management' : '/drivers',
    });

    toast.success(`Driver request sent to ${recipientRole} for ${size.toLowerCase()} truck assignment`);
    setTruckSizeDialogOpen(false);
    setSelectedFile(null);
    setSelectedTruckSize('');
  };

  const stats = {
    pending: deliveryFiles.filter((f: ShipmentFile) => f.status === 'DRIVER_REQUESTED').length,
    assigned: deliveryFiles.filter((f: ShipmentFile) =>
      f.status === 'DRIVER_ASSIGNED' ||
      f.status === 'DRIVER_COLLECTING_CARGO' ||
      f.status === 'CARGO_COLLECTED_FROM_ICD' ||
      f.status === 'CARGO_COLLECTED_FROM_AIRPORT'
    ).length,
    completed: deliveryFiles.filter((f: ShipmentFile) => f.status === 'DELIVERED_TO_CLIENT').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Clerk Module</h1>
          <p className="text-gray-500 mt-1">
            Manage shipment deliveries and request drivers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-gray-500">Pending Drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.assigned}</p>
                <p className="text-sm text-gray-500">Assigned/In Progress</p>
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
                <p className="text-sm text-gray-500">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {user?.role !== 'delivery_clerk' && (
        <Card className="bg-gradient-to-r from-orange-50 to-blue-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-300 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-4 h-4 text-slate-800" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  View-Only Access - Delivery Module
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  You have read-only access to view delivery information.
                  Only the Delivery Clerk can request drivers and manage deliveries.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Shipment Files</CardTitle>
              <CardDescription>Request drivers and manage deliveries</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="pending">Pending Drivers</TabsTrigger>
              <TabsTrigger value="assigned">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Delivered</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">File Number</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Client</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Driver</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No files found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredFiles.map((file: ShipmentFile) => (
                        <tr key={file.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-mono font-medium text-blue-600">{file.fileNumber}</p>
                              <p className="text-sm text-gray-500">{file.transportMode}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium">{file.client?.name}</p>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className={cn('text-xs', statusColors[file.status])}>
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
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button variant="ghost" size="sm" onClick={() => navigate('files/:id', { id: file.id })}>
                                View
                              </Button>

                              {/* REQUEST DRIVER button - only for delivery clerk and when status is DRIVER_REQUESTED */}
                              {user?.role === 'delivery_clerk' && file.status === 'DRIVER_REQUESTED' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleRequestDriver(file)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                  title="Select truck size and request driver assignment"
                                >
                                  <Truck className="w-3 h-3 mr-1" />
                                  REQUEST DRIVER
                                </Button>
                              )}

                              {/* Display truck size if already requested */}
                              {file.requestedTruckSize && (
                                <Badge variant="outline" className={cn(
                                  file.requestedTruckSize === 'SMALL' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-red-50 text-red-700 border-red-300'
                                )}>
                                  {file.requestedTruckSize} TRUCK
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Truck Size Selection Dialog */}
      <Dialog open={truckSizeDialogOpen} onOpenChange={setTruckSizeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Truck Size</DialogTitle>
            <DialogDescription>
              {selectedFile && `Choose the truck size needed for file ${selectedFile.fileNumber}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select the appropriate truck size for this shipment:
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Small Truck Option */}
              <button
                onClick={() => handleTruckSizeSelect('SMALL')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
              >
                <div className="text-2xl mb-2">🚙</div>
                <h3 className="font-semibold text-sm mb-1">Small Truck</h3>
                <p className="text-xs text-gray-500">Request via HR Manager</p>
              </button>

              {/* Big Truck Option */}
              <button
                onClick={() => handleTruckSizeSelect('BIG')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-center"
              >
                <div className="text-2xl mb-2">🚛</div>
                <h3 className="font-semibold text-sm mb-1">Big Truck</h3>
                <p className="text-xs text-gray-500">Request via Transport Manager</p>
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTruckSizeDialogOpen(false);
                setSelectedFile(null);
                setSelectedTruckSize('');
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
