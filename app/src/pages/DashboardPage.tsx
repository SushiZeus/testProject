// Transport mode icons updated: AIR uses Plane, RAIL uses Train
import { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  DollarSign,
  Truck,
  ArrowRight,
  Calendar,
  Ship,
  AlertCircle,
  Plane,
  Train,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { useFileStore } from '@/store/fileStore';
import type { ShipmentFile, TransportMode } from '@/types';
import type { AppRoute } from '@/App';
import { cn } from '@/lib/utils';
import { statusColors } from '@/utils/statusColors';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ElementType;
  trend?: number;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  onClick?: () => void;
  clickable?: boolean;
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
};

function StatCard({ title, value, description, icon: Icon, trend, color, onClick, clickable }: StatCardProps) {
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-shadow duration-200",
        clickable && "cursor-pointer hover:border-blue-300 hover:shadow-lg"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn('p-3 rounded-xl border', colorMap[color])}>
            <Icon className="w-6 h-6" />
          </div>
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              <TrendingUp className="w-4 h-4" />
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-500 mt-1">{title}</p>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
          {clickable && (
            <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
              Click to view files <ArrowRight className="w-3 h-3" />
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentFileCardProps {
  file: ShipmentFile;
  onClick: () => void;
}

function RecentFileCard({ file, onClick }: RecentFileCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{file.fileNumber}</p>
          <p className="text-sm text-gray-500">{file.client?.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className={cn('text-xs', statusColors[file.status])}>
          {file.status.replace(/_/g, ' ')}
        </Badge>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}

interface DashboardPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function DashboardPage({ navigate }: DashboardPageProps) {
  const { user } = useAuthStore();
  const { files } = useFileStore();

  const [stats, setStats] = useState({
    totalFiles: 0,
    waitingFiles: 0,
    inProgressFiles: 0,
    completedFiles: 0,
    myAssignedFiles: 0,
    pendingApprovals: 0,
  });

  const [filteredFilesDialog, setFilteredFilesDialog] = useState<{
    open: boolean;
    title: string;
    files: ShipmentFile[];
    transportMode?: TransportMode;
  }>({
    open: false,
    title: '',
    files: [],
  });

  const showFilteredFiles = (title: string, filteredFiles: ShipmentFile[], transportMode?: TransportMode) => {
    console.log('🔍 Opening dialog:', { title, fileCount: filteredFiles.length, transportMode, files: filteredFiles });
    setFilteredFilesDialog({
      open: true,
      title,
      files: filteredFiles,
      transportMode,
    });
  };

  useEffect(() => {
    if (!user) {
      setStats({
        totalFiles: 0,
        waitingFiles: 0,
        inProgressFiles: 0,
        completedFiles: 0,
        myAssignedFiles: 0,
        pendingApprovals: 0,
      });
      return;
    }

    // Simple stats calculation without store function calls
    // Only count CLEARANCE files for clearance-related stats
    const clearanceFiles = files.filter(f => f.serviceType === 'CLEARANCE');
    const totalFiles = files.length;
    const waitingFiles = clearanceFiles.filter(f => f.status === 'WAITING_FOR_DECLARATION').length;
    const completedFiles = files.filter(f => 
      f.status === 'CARGO_COLLECTED_FROM_AIRPORT' ||
      f.status === 'DELIVERED_TO_CLIENT' ||
      f.status === 'SHIPMENT_AT_WAREHOUSE' ||
      f.status === 'COMPLETED'
    ).length;
    const inProgressFiles = totalFiles - waitingFiles - completedFiles;

    setStats({
      totalFiles,
      waitingFiles,
      inProgressFiles,
      completedFiles,
      myAssignedFiles: 0, // Simplified for now
      pendingApprovals: 0, // Simplified for now
    });
  }, [files, user]);

  const getRoleSpecificStats = () => {
    if (!user) return [];

    const commonStats = [
      {
        title: 'Total Files',
        value: stats.totalFiles,
        icon: FileText,
        color: 'blue' as const,
        clickable: true,
        onClick: () => showFilteredFiles('All Files', files),
      },
      {
        title: 'In Progress',
        value: stats.inProgressFiles,
        icon: TrendingUp,
        color: 'purple' as const,
        clickable: true,
        onClick: () => showFilteredFiles('In Progress Files', files.filter((f: ShipmentFile) => 
          f.status !== 'WAITING_FOR_DECLARATION' && 
          f.status !== 'ASSIGNED_TO_DECLARANT' &&
          f.status !== 'DECLARANT_ACKNOWLEDGED' &&
          f.status !== 'WAITING_FOR_FINAL_ASSESSMENT' &&
          f.status !== 'DECLARATION_DONE' &&
          f.status !== 'CARGO_COLLECTED_FROM_AIRPORT' &&
          f.status !== 'DELIVERED_TO_CLIENT' &&
          f.status !== 'SHIPMENT_AT_WAREHOUSE' &&
          f.status !== 'COMPLETED'
        )),
      },
      {
        title: 'Completed',
        value: stats.completedFiles,
        icon: CheckCircle,
        color: 'green' as const,
        clickable: true,
        onClick: () => showFilteredFiles('Completed Files', files.filter((f: ShipmentFile) => 
          f.status === 'CARGO_COLLECTED_FROM_AIRPORT' ||
          f.status === 'DELIVERED_TO_CLIENT' ||
          f.status === 'SHIPMENT_AT_WAREHOUSE' ||
          f.status === 'COMPLETED'
        )),
      },
    ];

    switch (user.role) {
      case 'documentation_officer':
        // Show transport mode statistics - Only count CLEARANCE files
        const clearanceOnly = files.filter((f: ShipmentFile) => f.serviceType === 'CLEARANCE');
        const seaFiles = clearanceOnly.filter((f: ShipmentFile) => f.transportMode === 'SEA');
        const airFiles = clearanceOnly.filter((f: ShipmentFile) => f.transportMode === 'AIR');
        const roadFiles = clearanceOnly.filter((f: ShipmentFile) => f.transportMode === 'ROAD');
        const railFiles = clearanceOnly.filter((f: ShipmentFile) => f.transportMode === 'RAIL');
        const filesWithoutDocs = clearanceOnly.filter((f: ShipmentFile) => f.documents.length === 0);
        
        return [
          {
            title: 'SEA Shipments',
            value: seaFiles.length,
            icon: Ship,
            color: 'blue' as const,
            clickable: true,
            onClick: () => showFilteredFiles('SEA Shipments', seaFiles, 'SEA'),
          },
          {
            title: 'AIR Shipments ✈️', // Using airplane icon
            value: airFiles.length,
            icon: Plane,
            color: 'purple' as const,
            clickable: true,
            onClick: () => showFilteredFiles('AIR Shipments', airFiles, 'AIR'),
          },
          {
            title: 'ROAD Shipments',
            value: roadFiles.length,
            icon: Truck,
            color: 'green' as const,
            clickable: true,
            onClick: () => showFilteredFiles('ROAD Shipments', roadFiles, 'ROAD'),
          },
          {
            title: 'RAIL Shipments 🚂', // Using train icon
            value: railFiles.length,
            icon: Train,
            color: 'amber' as const,
            clickable: true,
            onClick: () => showFilteredFiles('RAIL Shipments', railFiles, 'RAIL'),
          },
          {
            title: 'Files Without Documents',
            value: filesWithoutDocs.length,
            icon: AlertCircle,
            color: 'red' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Without Documents', filesWithoutDocs),
          },
        ];
      case 'declaration_manager':
        // Only count CLEARANCE files for declaration manager
        const clearanceFilesOnly = files.filter(f => f.serviceType === 'CLEARANCE');
        const waitingAssignment = clearanceFilesOnly.filter(f => f.status === 'WAITING_FOR_DECLARATION');
        return [
          {
            title: 'Total Clearance Files',
            value: clearanceFilesOnly.length,
            icon: FileText,
            color: 'blue' as const,
            clickable: true,
            onClick: () => showFilteredFiles('All Clearance Files', clearanceFilesOnly),
          },
          {
            title: 'Pending Assignment',
            value: waitingAssignment.length,
            icon: FileText,
            color: 'red' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Pending Assignment', waitingAssignment),
          },
          {
            title: 'In Progress',
            value: clearanceFilesOnly.filter((f: ShipmentFile) => 
              f.status !== 'WAITING_FOR_DECLARATION' && 
              f.status !== 'CARGO_COLLECTED_FROM_AIRPORT' &&
              f.status !== 'DELIVERED_TO_CLIENT' &&
              f.status !== 'SHIPMENT_AT_WAREHOUSE' &&
              f.status !== 'COMPLETED'
            ).length,
            icon: TrendingUp,
            color: 'purple' as const,
            clickable: true,
            onClick: () => showFilteredFiles('In Progress Files', clearanceFilesOnly.filter((f: ShipmentFile) => 
              f.status !== 'WAITING_FOR_DECLARATION' && 
              f.status !== 'ASSIGNED_TO_DECLARANT' &&
              f.status !== 'DECLARANT_ACKNOWLEDGED' &&
              f.status !== 'WAITING_FOR_FINAL_ASSESSMENT' &&
              f.status !== 'DECLARATION_DONE' &&
              f.status !== 'CARGO_COLLECTED_FROM_AIRPORT' &&
              f.status !== 'DELIVERED_TO_CLIENT' &&
              f.status !== 'SHIPMENT_AT_WAREHOUSE' &&
              f.status !== 'COMPLETED'
            )),
          },
          {
            title: 'Completed',
            value: clearanceFilesOnly.filter((f: ShipmentFile) => 
              f.status === 'CARGO_COLLECTED_FROM_AIRPORT' ||
              f.status === 'DELIVERED_TO_CLIENT' ||
              f.status === 'SHIPMENT_AT_WAREHOUSE' ||
              f.status === 'COMPLETED'
            ).length,
            icon: CheckCircle,
            color: 'green' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Completed Files', clearanceFilesOnly.filter((f: ShipmentFile) => 
              f.status === 'CARGO_COLLECTED_FROM_AIRPORT' ||
              f.status === 'DELIVERED_TO_CLIENT' ||
              f.status === 'SHIPMENT_AT_WAREHOUSE' ||
              f.status === 'COMPLETED'
            )),
          },
          {
            title: 'Pending Approvals',
            value: stats.pendingApprovals,
            icon: DollarSign,
            color: 'amber' as const,
            clickable: true,
            onClick: () => navigate('petty-cash'),
          },
        ];
      case 'declarant':
        const myFiles = files.filter((f: ShipmentFile) => f.assignedDeclarantId === user.id);
        const waitingAssessment = files.filter((f: ShipmentFile) => 
          f.assignedDeclarantId === user.id && 
          f.status === 'WAITING_FOR_FINAL_ASSESSMENT'
        );
        const declarationDone = files.filter((f: ShipmentFile) => 
          f.assignedDeclarantId === user.id && 
          (f.status === 'TAXES_PAID' || f.status === 'READY_FOR_OPERATIONS')
        );
        return [
          {
            title: 'My Files',
            value: myFiles.length,
            icon: FileText,
            color: 'blue' as const,
            clickable: true,
            onClick: () => showFilteredFiles('My Assigned Files', myFiles),
          },
          {
            title: 'Waiting Assessment',
            value: waitingAssessment.length,
            icon: Clock,
            color: 'amber' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Waiting Assessment', waitingAssessment),
          },
          {
            title: 'Declaration Done',
            value: declarationDone.length,
            icon: CheckCircle,
            color: 'green' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Declaration Completed', declarationDone),
          },
        ];
      case 'operations_manager':
        return [
          ...commonStats,
          {
            title: 'Pending Approvals',
            value: stats.pendingApprovals,
            icon: DollarSign,
            color: 'red' as const,
            clickable: true,
            onClick: () => navigate('petty-cash'),
          },
        ];
      case 'operation_clerk':
        const myOperationFiles = files.filter((f: ShipmentFile) => f.assignedOperationClerkId === user.id);
        const pendingPermits = files.filter((f: ShipmentFile) => 
          f.assignedOperationClerkId === user.id && 
          f.status === 'WAITING_FOR_PERMIT_PAYMENTS'
        );
        const readyForDelivery = files.filter((f: ShipmentFile) => 
          f.assignedOperationClerkId === user.id && 
          f.status === 'SWISSPORT_CHARGES_PAID'
        );
        return [
          {
            title: 'My Files',
            value: myOperationFiles.length,
            icon: FileText,
            color: 'blue' as const,
            clickable: true,
            onClick: () => showFilteredFiles('My Operation Files', myOperationFiles),
          },
          {
            title: 'Pending Permits',
            value: pendingPermits.length,
            icon: FileText,
            color: 'amber' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Pending Permits', pendingPermits),
          },
          {
            title: 'Ready for Delivery',
            value: readyForDelivery.length,
            icon: Truck,
            color: 'green' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Ready for Delivery', readyForDelivery),
          },
        ];
      case 'coo':
        return [
          ...commonStats,
          {
            title: 'Pending COO Approvals',
            value: stats.pendingApprovals,
            icon: DollarSign,
            color: 'red' as const,
            clickable: true,
            onClick: () => navigate('petty-cash'),
          },
        ];
      case 'hr_manager':
        const driverRequestedFiles = files.filter((f: ShipmentFile) => f.status === 'DRIVER_REQUESTED');
        return [
          {
            title: 'Total Drivers',
            value: 5,
            icon: Users,
            color: 'blue' as const,
            clickable: true,
            onClick: () => navigate('drivers'),
          },
          {
            title: 'Available',
            value: 3,
            icon: CheckCircle,
            color: 'green' as const,
            clickable: true,
            onClick: () => navigate('drivers'),
          },
          {
            title: 'On Job',
            value: 2,
            icon: Truck,
            color: 'amber' as const,
            clickable: true,
            onClick: () => navigate('drivers'),
          },
          {
            title: 'Pending Requests',
            value: driverRequestedFiles.length,
            icon: FileText,
            color: 'red' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Requesting Drivers', driverRequestedFiles),
          },
          {
            title: 'Pending Approvals',
            value: stats.pendingApprovals,
            icon: DollarSign,
            color: 'purple' as const,
            clickable: true,
            onClick: () => navigate('petty-cash'),
          },
        ];
      case 'finance_manager':
        return [
          ...commonStats,
          {
            title: 'Pending Approvals',
            value: stats.pendingApprovals,
            icon: DollarSign,
            color: 'red' as const,
            clickable: true,
            onClick: () => navigate('petty-cash'),
          },
        ];
      case 'cashier':
        return [
          ...commonStats,
          {
            title: 'Pending Payments',
            value: stats.pendingApprovals,
            icon: DollarSign,
            color: 'red' as const,
            clickable: true,
            onClick: () => navigate('petty-cash'),
          },
        ];
      case 'driver':
        const myDriverFiles = files.filter((f: ShipmentFile) => f.assignedDriverId === user.id);
        const pendingPickup = files.filter((f: ShipmentFile) => 
          f.assignedDriverId === user.id && 
          f.status === 'DRIVER_ASSIGNED'
        );
        const inTransit = files.filter((f: ShipmentFile) => 
          f.assignedDriverId === user.id && 
          (f.status === 'DRIVER_COLLECTING_CARGO' || f.status === 'CARGO_COLLECTED_FROM_ICD' || f.status === 'CARGO_COLLECTED_FROM_AIRPORT')
        );
        const delivered = files.filter((f: ShipmentFile) => 
          f.assignedDriverId === user.id && 
          f.status === 'DELIVERED_TO_CLIENT'
        );
        return [
          {
            title: 'My Deliveries',
            value: myDriverFiles.length,
            icon: Truck,
            color: 'blue' as const,
            clickable: true,
            onClick: () => showFilteredFiles('My Delivery Files', myDriverFiles),
          },
          {
            title: 'Pending Pickup',
            value: pendingPickup.length,
            icon: Clock,
            color: 'amber' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Pending Pickup', pendingPickup),
          },
          {
            title: 'In Transit',
            value: inTransit.length,
            icon: TrendingUp,
            color: 'purple' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files In Transit', inTransit),
          },
          {
            title: 'Delivered',
            value: delivered.length,
            icon: CheckCircle,
            color: 'green' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Delivered Files', delivered),
          },
        ];
      case 'shipping_line_clerk':
        const seaImportFiles = files.filter((f: ShipmentFile) => 
          f.transportMode === 'SEA' && f.shipmentType === 'IMPORT'
        );
        const seaExportFiles = files.filter((f: ShipmentFile) => 
          f.transportMode === 'SEA' && f.shipmentType === 'EXPORT'
        );
        const pendingBLFiles = files.filter((f: ShipmentFile) => 
          f.transportMode === 'SEA' && 
          (f.status === 'PROCESSING_DELIVERY_ORDER' || f.status === 'WAITING_FOR_DO_PAYMENT')
        );
        const readyForCollection = files.filter((f: ShipmentFile) => 
          f.transportMode === 'SEA' && 
          f.status === 'DELIVERY_ORDER_READY'
        );
        return [
          {
            title: 'SEA Imports',
            value: seaImportFiles.length,
            icon: Ship,
            color: 'blue' as const,
            clickable: true,
            onClick: () => showFilteredFiles('SEA Import Files', seaImportFiles),
          },
          {
            title: 'SEA Exports',
            value: seaExportFiles.length,
            icon: Ship,
            color: 'green' as const,
            clickable: true,
            onClick: () => showFilteredFiles('SEA Export Files', seaExportFiles),
          },
          {
            title: 'Pending B/L',
            value: pendingBLFiles.length,
            icon: FileText,
            color: 'amber' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Pending Bill of Lading', pendingBLFiles),
          },
          {
            title: 'Ready for Collection',
            value: readyForCollection.length,
            icon: CheckCircle,
            color: 'purple' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Ready for Collection', readyForCollection),
          },
        ];
      case 'permits_clerk':
        const pendingPermitsFiles = files.filter((f: ShipmentFile) => 
          f.status === 'WAITING_FOR_PERMITS'
        );
        const permitsApproved = files.filter((f: ShipmentFile) => 
          f.status === 'PERMITS_DONE'
        );
        const pendingInspection = files.filter((f: ShipmentFile) => 
          f.status === 'SHIPMENT_UNDER_VERIFICATION'
        );
        return [
          {
            title: 'Total Files',
            value: stats.totalFiles,
            icon: FileText,
            color: 'blue' as const,
            clickable: true,
            onClick: () => showFilteredFiles('All Files', files),
          },
          {
            title: 'Pending Permits',
            value: pendingPermitsFiles.length,
            icon: Clock,
            color: 'amber' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Pending Permits', pendingPermitsFiles),
          },
          {
            title: 'Permits Approved',
            value: permitsApproved.length,
            icon: CheckCircle,
            color: 'green' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files with Approved Permits', permitsApproved),
          },
          {
            title: 'Pending Inspection',
            value: pendingInspection.length,
            icon: AlertCircle,
            color: 'red' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Pending Inspection', pendingInspection),
          },
        ];
      case 'delivery_clerk':
        const readyForDeliveryFiles = files.filter((f: ShipmentFile) => 
          f.status === 'OPERATIONS_DONE' || f.status === 'CARGO_CLEARED'
        );
        const inDelivery = files.filter((f: ShipmentFile) => 
          f.status === 'DRIVER_ASSIGNED' || f.status === 'DRIVER_COLLECTING_CARGO'
        );
        const deliveredFiles = files.filter((f: ShipmentFile) => 
          f.status === 'DELIVERED_TO_CLIENT'
        );
        return [
          {
            title: 'Total Files',
            value: stats.totalFiles,
            icon: FileText,
            color: 'blue' as const,
            clickable: true,
            onClick: () => showFilteredFiles('All Files', files),
          },
          {
            title: 'Ready for Delivery',
            value: readyForDeliveryFiles.length,
            icon: Truck,
            color: 'amber' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Ready for Delivery', readyForDeliveryFiles),
          },
          {
            title: 'Out for Delivery',
            value: inDelivery.length,
            icon: TrendingUp,
            color: 'purple' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Out for Delivery', inDelivery),
          },
          {
            title: 'Delivered',
            value: deliveredFiles.length,
            icon: CheckCircle,
            color: 'green' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Delivered Files', deliveredFiles),
          },
        ];
      case 'commercial_manager':
        const importFiles = files.filter((f: ShipmentFile) => f.shipmentType === 'IMPORT');
        const exportFiles = files.filter((f: ShipmentFile) => f.shipmentType === 'EXPORT');
        const transitFiles = files.filter((f: ShipmentFile) => f.shipmentType === 'TRANSIT');
        return [
          {
            title: 'Import Files',
            value: importFiles.length,
            icon: FileText,
            color: 'blue' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Import Files', importFiles),
          },
          {
            title: 'Export Files',
            value: exportFiles.length,
            icon: TrendingUp,
            color: 'green' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Export Files', exportFiles),
          },
          {
            title: 'Transit Files',
            value: transitFiles.length,
            icon: Truck,
            color: 'purple' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Transit Files', transitFiles),
          },
          {
            title: 'Completed',
            value: stats.completedFiles,
            icon: CheckCircle,
            color: 'amber' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Completed Files', files.filter((f: ShipmentFile) => 
              f.status === 'CARGO_COLLECTED_FROM_AIRPORT' ||
              f.status === 'DELIVERED_TO_CLIENT' ||
              f.status === 'SHIPMENT_AT_WAREHOUSE' ||
              f.status === 'COMPLETED'
            )),
          },
        ];
      case 'managing_director':
        const thisMonthFiles = files.filter((f: ShipmentFile) => {
          const fileDate = new Date(f.createdAt);
          const now = new Date();
          return fileDate.getMonth() === now.getMonth() && fileDate.getFullYear() === now.getFullYear();
        });
        const thisWeekFiles = files.filter((f: ShipmentFile) => {
          const fileDate = new Date(f.createdAt);
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return fileDate >= weekAgo;
        });
        return [
          {
            title: 'Total Files',
            value: stats.totalFiles,
            icon: FileText,
            color: 'blue' as const,
            clickable: true,
            onClick: () => showFilteredFiles('All Files', files),
          },
          {
            title: 'This Month',
            value: thisMonthFiles.length,
            icon: Calendar,
            color: 'green' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files This Month', thisMonthFiles),
          },
          {
            title: 'This Week',
            value: thisWeekFiles.length,
            icon: TrendingUp,
            color: 'purple' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files This Week', thisWeekFiles),
          },
          {
            title: 'Completed',
            value: stats.completedFiles,
            icon: CheckCircle,
            color: 'amber' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Completed Files', files.filter((f: ShipmentFile) => 
              f.status === 'CARGO_COLLECTED_FROM_AIRPORT' ||
              f.status === 'DELIVERED_TO_CLIENT' ||
              f.status === 'SHIPMENT_AT_WAREHOUSE' ||
              f.status === 'COMPLETED'
            )),
          },
        ];
      case 'administrator':
        const todayFiles = files.filter((f: ShipmentFile) => {
          const fileDate = new Date(f.createdAt);
          const today = new Date();
          return fileDate.toDateString() === today.toDateString();
        });
        const errorFiles = files.filter((f: ShipmentFile) => 
          f.status.includes('ERROR') || f.status.includes('FAILED')
        );
        return [
          {
            title: 'Total Files',
            value: stats.totalFiles,
            icon: FileText,
            color: 'blue' as const,
            clickable: true,
            onClick: () => showFilteredFiles('All Files', files),
          },
          {
            title: 'Today\'s Files',
            value: todayFiles.length,
            icon: Calendar,
            color: 'green' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files Created Today', todayFiles),
          },
          {
            title: 'System Errors',
            value: errorFiles.length,
            icon: AlertCircle,
            color: 'red' as const,
            clickable: true,
            onClick: () => showFilteredFiles('Files with Errors', errorFiles),
          },
          {
            title: 'Active Users',
            value: 25,
            icon: Users,
            color: 'purple' as const,
            clickable: true,
            onClick: () => navigate('user-management'),
          },
        ];
      default:
        return commonStats;
    }
  };

  const recentFiles = files.slice(-5).reverse();

  const getQuickActions = () => {
    if (!user) return [];

    const actions: { label: string; onClick: () => void; icon: React.ElementType; color: string }[] = [];

    if (user.role === 'documentation_officer' || user.role === 'administrator') {
      actions.push({
        label: 'Open New File',
        onClick: () => navigate('files/open'),
        icon: FileText,
        color: 'bg-blue-500',
      });
    }

    if (user.role === 'declaration_manager' || user.role === 'administrator') {
      actions.push({
        label: 'Assign Declarants',
        onClick: () => navigate('declaration'),
        icon: Users,
        color: 'bg-purple-500',
      });
    }

    if (user.role === 'operations_manager' || user.role === 'operation_clerk') {
      actions.push({
        label: 'Request Petty Cash',
        onClick: () => navigate('petty-cash'),
        icon: DollarSign,
        color: 'bg-green-500',
      });
    }

    if (user.role === 'hr_manager') {
      actions.push({
        label: 'Manage Drivers',
        onClick: () => navigate('drivers'),
        icon: Truck,
        color: 'bg-amber-500',
      });
    }

    return actions;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.name}. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {useMemo(() => getRoleSpecificStats(), [user, stats, files]).map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            onClick={(stat as any).onClick}
            clickable={(stat as any).clickable}
          />
        ))}
      </div>

      {/* Simple Modal for Files */}
      {filteredFilesDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setFilteredFilesDialog({ ...filteredFilesDialog, open: false })}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {filteredFilesDialog.transportMode === 'SEA' && <Ship className="w-5 h-5 text-blue-600" />}
                  {filteredFilesDialog.transportMode === 'AIR' && <Plane className="w-5 h-5 text-purple-600" />}
                  {filteredFilesDialog.transportMode === 'ROAD' && <Truck className="w-5 h-5 text-green-600" />}
                  {filteredFilesDialog.transportMode === 'RAIL' && <Train className="w-5 h-5 text-amber-600" />}
                  <h2 className="text-xl font-semibold text-gray-900">{filteredFilesDialog.title}</h2>
                </div>
                <button
                  onClick={() => setFilteredFilesDialog({ ...filteredFilesDialog, open: false })}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {filteredFilesDialog.files.length} file{filteredFilesDialog.files.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {filteredFilesDialog.files.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium text-gray-900">No files found</p>
                    <p className="text-sm mt-1 text-gray-600">There are no files matching this criteria</p>
                  </div>
                ) : (
                  filteredFilesDialog.files.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => {
                        setFilteredFilesDialog({ ...filteredFilesDialog, open: false });
                        navigate('files/:id', { id: file.id });
                      }}
                      className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all cursor-pointer hover:bg-white"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center',
                          file.transportMode === 'SEA' && 'bg-blue-100',
                          file.transportMode === 'AIR' && 'bg-purple-100',
                          file.transportMode === 'ROAD' && 'bg-green-100',
                          file.transportMode === 'RAIL' && 'bg-amber-100'
                        )}>
                          {file.transportMode === 'SEA' && <Ship className="w-6 h-6 text-blue-600" />}
                          {file.transportMode === 'AIR' && <Plane className="w-6 h-6 text-purple-600" />}
                          {file.transportMode === 'ROAD' && <Truck className="w-6 h-6 text-green-600" />}
                          {file.transportMode === 'RAIL' && <Train className="w-6 h-6 text-amber-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{file.fileNumber}</p>
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              {file.transportMode}
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              {file.shipmentType}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mt-1 font-medium">{file.client?.name}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                            <span>Type: {file.shipmentType}</span>
                            <span>•</span>
                            <span>Mode: {file.transportMode}</span>
                            <span>•</span>
                            <span>Created: {new Date(file.createdAt).toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className={cn('text-xs font-medium', statusColors[file.status])}>
                          {file.status.replace(/_/g, ' ')}
                        </Badge>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {getQuickActions().length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {getQuickActions().map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                className={cn(
                  'flex items-center gap-2 text-white hover:opacity-90 transition-opacity',
                  action.color
                )}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Recent Files */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Recent Files</CardTitle>
                <CardDescription>Latest shipment files in the system</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('dashboard')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No files yet</p>
                  </div>
                ) : (
                  recentFiles.map((file) => (
                    <RecentFileCard
                      key={file.id}
                      file={file}
                      onClick={() => navigate('files/:id', { id: file.id })}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Workflow Status */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Overview</CardTitle>
              <CardDescription>Current system status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Pending Assignment</span>
                  <span className="font-medium">{stats.waitingFiles} files</span>
                </div>
                <Progress value={(stats.waitingFiles / stats.totalFiles) * 100 || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">In Operations</span>
                  <span className="font-medium">{stats.inProgressFiles} files</span>
                </div>
                <Progress value={(stats.inProgressFiles / stats.totalFiles) * 100 || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">{stats.completedFiles} files</span>
                </div>
                <Progress value={(stats.completedFiles / stats.totalFiles) * 100 || 0} className="h-2 bg-green-100" />
              </div>
            </CardContent>
          </Card>

          {/* System Status - Only visible to administrators */}
          {user?.role === 'administrator' && (
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-600">All systems operational</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-600">Database connected</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-600">Notifications active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
