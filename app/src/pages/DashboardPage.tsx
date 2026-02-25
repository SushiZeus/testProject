import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { useFileStore } from '@/store/fileStore';
import { usePettyCashStore } from '@/store/pettyCashStore';
import type { ShipmentFile, FileStatus } from '@/types';
import type { AppRoute } from '@/App';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ElementType;
  trend?: number;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
};

function StatCard({ title, value, description, icon: Icon, trend, color }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
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
  const statusColors: Record<FileStatus, string> = {
    WAITING_FOR_DECLARATION: 'bg-amber-100 text-amber-700',
    ASSIGNED_TO_DECLARANT: 'bg-blue-100 text-blue-700',
    DECLARANT_ACKNOWLEDGED: 'bg-green-100 text-green-700',
    WAITING_FOR_FINAL_ASSESSMENT: 'bg-purple-100 text-purple-700',
    DECLARATION_DONE: 'bg-green-100 text-green-700',
    WAITING_FOR_TAX_PAYMENT: 'bg-amber-100 text-amber-700',
    TAXES_PAID: 'bg-green-100 text-green-700',
    READY_FOR_OPERATIONS: 'bg-blue-100 text-blue-700',
    RECEIVED_BY_CLERK: 'bg-blue-100 text-blue-700',
    CLERK_WORKING_ON_FILE: 'bg-blue-100 text-blue-700',
    SHIPMENT_UNDER_VERIFICATION: 'bg-purple-100 text-purple-700',
    WAITING_FOR_PERMIT_PAYMENTS: 'bg-amber-100 text-amber-700',
    PERMIT_PAYMENTS_DONE: 'bg-green-100 text-green-700',
    RELEASE_ORDER_UPLOADED: 'bg-green-100 text-green-700',
    PROCESSING_DELIVERY_ORDER: 'bg-blue-100 text-blue-700',
    WAITING_FOR_DO_PAYMENT: 'bg-amber-100 text-amber-700',
    DELIVERY_ORDER_PAYMENTS_DONE: 'bg-green-100 text-green-700',
    DELIVERY_ORDER_READY: 'bg-green-100 text-green-700',
    WAITING_FOR_PORT_CHARGES: 'bg-amber-100 text-amber-700',
    WAITING_FOR_PORT_PAYMENT: 'bg-amber-100 text-amber-700',
    PORT_CHARGES_PAID: 'bg-green-100 text-green-700',
    WAITING_FOR_PAYMENTS: 'bg-amber-100 text-amber-700',
    WAITING_FOR_SWISSPORT_PAYMENTS: 'bg-amber-100 text-amber-700',
    SWISSPORT_CHARGES_PAID: 'bg-green-100 text-green-700',
    DRIVER_REQUESTED: 'bg-blue-100 text-blue-700',
    DRIVER_ASSIGNED: 'bg-blue-100 text-blue-700',
    DRIVER_COLLECTING_CARGO: 'bg-purple-100 text-purple-700',
    CARGO_COLLECTED_FROM_ICD: 'bg-green-100 text-green-700',
    CARGO_COLLECTED_FROM_AIRPORT: 'bg-green-100 text-green-700',
    DELIVERED_TO_CLIENT: 'bg-green-100 text-green-700',
    SHIPMENT_AT_WAREHOUSE: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

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
  const { files, getFilesByStatus } = useFileStore();
  const { getPendingApprovalsForManager, getPendingApprovalsForCOO, getPendingPayments } = usePettyCashStore();

  const [stats, setStats] = useState({
    totalFiles: 0,
    waitingFiles: 0,
    inProgressFiles: 0,
    completedFiles: 0,
    myAssignedFiles: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    if (!user) return;

    const totalFiles = files.length;
    const waitingFiles = getFilesByStatus('WAITING_FOR_DECLARATION').length;
    const inProgressFiles = files.filter((f: ShipmentFile) => 
      f.status !== 'WAITING_FOR_DECLARATION' && 
      f.status !== 'ASSIGNED_TO_DECLARANT' &&
      f.status !== 'DECLARANT_ACKNOWLEDGED' &&
      f.status !== 'WAITING_FOR_FINAL_ASSESSMENT' &&
      f.status !== 'DECLARATION_DONE' &&
      f.status !== 'CARGO_COLLECTED_FROM_AIRPORT' &&
      f.status !== 'DELIVERED_TO_CLIENT' &&
      f.status !== 'SHIPMENT_AT_WAREHOUSE' &&
      f.status !== 'COMPLETED'
    ).length;
    const completedFiles = files.filter((f: ShipmentFile) => 
      f.status === 'CARGO_COLLECTED_FROM_AIRPORT' ||
      f.status === 'DELIVERED_TO_CLIENT' ||
      f.status === 'SHIPMENT_AT_WAREHOUSE' ||
      f.status === 'COMPLETED'
    ).length;

    let myAssignedFiles = 0;
    let pendingApprovals = 0;

    if (user.role === 'declarant') {
      myAssignedFiles = files.filter((f: ShipmentFile) => f.assignedDeclarantId === user.id).length;
    } else if (user.role === 'operation_clerk') {
      myAssignedFiles = files.filter((f: ShipmentFile) => f.assignedOperationClerkId === user.id).length;
    } else if (user.role === 'driver') {
      myAssignedFiles = files.filter((f: ShipmentFile) => f.assignedDriverId === user.id).length;
    }

    if (user.role === 'operations_manager') {
      pendingApprovals = getPendingApprovalsForManager(user.id).length;
    } else if (user.role === 'coo') {
      pendingApprovals = getPendingApprovalsForCOO().length;
    } else if (user.role === 'cashier') {
      pendingApprovals = getPendingPayments().length;
    }

    setStats({
      totalFiles,
      waitingFiles,
      inProgressFiles,
      completedFiles,
      myAssignedFiles,
      pendingApprovals,
    });
  }, [files, user, getFilesByStatus, getPendingApprovalsForManager, getPendingApprovalsForCOO, getPendingPayments]);

  const getRoleSpecificStats = () => {
    if (!user) return [];

    const commonStats = [
      {
        title: 'Total Files',
        value: stats.totalFiles,
        icon: FileText,
        color: 'blue' as const,
      },
      {
        title: 'Waiting',
        value: stats.waitingFiles,
        icon: Clock,
        color: 'amber' as const,
      },
      {
        title: 'In Progress',
        value: stats.inProgressFiles,
        icon: TrendingUp,
        color: 'purple' as const,
      },
      {
        title: 'Completed',
        value: stats.completedFiles,
        icon: CheckCircle,
        color: 'green' as const,
      },
    ];

    switch (user.role) {
      case 'declaration_manager':
        return [
          ...commonStats,
          {
            title: 'Pending Assignment',
            value: stats.waitingFiles,
            icon: FileText,
            color: 'red' as const,
          },
        ];
      case 'declarant':
        return [
          {
            title: 'My Files',
            value: stats.myAssignedFiles,
            icon: FileText,
            color: 'blue' as const,
          },
          {
            title: 'Waiting Assessment',
            value: files.filter((f: ShipmentFile) => 
              f.assignedDeclarantId === user.id && 
              f.status === 'WAITING_FOR_FINAL_ASSESSMENT'
            ).length,
            icon: Clock,
            color: 'amber' as const,
          },
          {
            title: 'Declaration Done',
            value: files.filter((f: ShipmentFile) => 
              f.assignedDeclarantId === user.id && 
              f.status === 'DECLARATION_DONE'
            ).length,
            icon: CheckCircle,
            color: 'green' as const,
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
          },
        ];
      case 'operation_clerk':
        return [
          {
            title: 'My Files',
            value: stats.myAssignedFiles,
            icon: FileText,
            color: 'blue' as const,
          },
          {
            title: 'Pending Permits',
            value: files.filter((f: ShipmentFile) => 
              f.assignedOperationClerkId === user.id && 
              f.status === 'WAITING_FOR_PAYMENTS'
            ).length,
            icon: FileText,
            color: 'amber' as const,
          },
          {
            title: 'Ready for Delivery',
            value: files.filter((f: ShipmentFile) => 
              f.assignedOperationClerkId === user.id && 
              f.status === 'SWISSPORT_CHARGES_PAID'
            ).length,
            icon: Truck,
            color: 'green' as const,
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
          },
        ];
      case 'hr_manager':
        return [
          {
            title: 'Total Drivers',
            value: 5,
            icon: Users,
            color: 'blue' as const,
          },
          {
            title: 'Available',
            value: 3,
            icon: CheckCircle,
            color: 'green' as const,
          },
          {
            title: 'On Job',
            value: 2,
            icon: Truck,
            color: 'amber' as const,
          },
          {
            title: 'Pending Requests',
            value: files.filter((f: ShipmentFile) => f.status === 'DRIVER_REQUESTED').length,
            icon: FileText,
            color: 'red' as const,
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

    if (user.role === 'documentation_officer' || user.role === 'admin') {
      actions.push({
        label: 'Open New File',
        onClick: () => navigate('files/open'),
        icon: FileText,
        color: 'bg-blue-500',
      });
    }

    if (user.role === 'declaration_manager' || user.role === 'admin') {
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
        {getRoleSpecificStats().map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

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
                  <span className="text-gray-600">Declaration Queue</span>
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

          {/* System Status */}
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
        </div>
      </div>
    </div>
  );
}
