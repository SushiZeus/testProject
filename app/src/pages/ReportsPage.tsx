import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  TrendingUp,
  Clock,
  FileText,
  Download,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { usePettyCashStore } from '@/store/pettyCashStore';
import type { AppRoute } from '@/App';
import { mockUsers, getDeclarantWorkload, getOperationClerkWorkload } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReportsPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function ReportsPage({ }: ReportsPageProps) {
  const { user } = useAuthStore();
  const { files } = useFileStore();
  const { requests } = usePettyCashStore();

  const [dateRange, setDateRange] = useState('30');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Check if user has access to reports
  const canViewReports = user && (
    user.role === 'managing_director' ||
    user.role === 'coo' ||
    user.role === 'commercial_manager' ||
    user.role === 'finance_manager' ||
    user.role === 'operations_manager' ||
    user.role === 'declaration_manager' ||
    user.role === 'hr_manager' ||
    user.role === 'administrator'
  );

  if (!canViewReports) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-500">You don't have permission to view reports.</p>
        </div>
      </div>
    );
  }

  // Calculate date filter
  const filterDate = new Date();
  filterDate.setDate(filterDate.getDate() - parseInt(dateRange));

  // Filter files by date range
  const filteredFiles = files.filter(file => 
    new Date(file.createdAt) >= filterDate
  );

  // Department-based filtering for managers
  const getDepartmentFiles = () => {
    if (user?.role === 'declaration_manager') {
      return filteredFiles.filter(f => 
        f.status === 'WAITING_FOR_DECLARATION' ||
        f.status === 'ASSIGNED_TO_DECLARANT' ||
        f.status === 'DECLARANT_ACKNOWLEDGED' ||
        f.status === 'WAITING_FOR_FINAL_ASSESSMENT' ||
        f.status === 'DECLARATION_DONE'
      );
    }
    if (user?.role === 'operations_manager') {
      return filteredFiles.filter(f => 
        f.status === 'READY_FOR_OPERATIONS' ||
        f.status === 'RECEIVED_BY_CLERK' ||
        f.status === 'CLERK_WORKING_ON_FILE' ||
        f.status === 'SHIPMENT_UNDER_VERIFICATION'
      );
    }
    if (selectedDepartment === 'all') return filteredFiles;
    
    // Filter by department
    const departmentStatuses: Record<string, string[]> = {
      'declaration': ['WAITING_FOR_DECLARATION', 'ASSIGNED_TO_DECLARANT', 'DECLARANT_ACKNOWLEDGED', 'WAITING_FOR_FINAL_ASSESSMENT', 'DECLARATION_DONE'],
      'operations': ['READY_FOR_OPERATIONS', 'RECEIVED_BY_CLERK', 'CLERK_WORKING_ON_FILE', 'SHIPMENT_UNDER_VERIFICATION'],
      'finance': ['WAITING_FOR_TAX_PAYMENT', 'TAXES_PAID', 'WAITING_FOR_PERMIT_PAYMENTS', 'PERMIT_PAYMENTS_DONE'],
      'transport': ['DRIVER_REQUESTED', 'DRIVER_ASSIGNED', 'DRIVER_COLLECTING_CARGO', 'CARGO_COLLECTED_FROM_AIRPORT', 'DELIVERED_TO_CLIENT']
    };
    
    return filteredFiles.filter(f => 
      departmentStatuses[selectedDepartment]?.includes(f.status)
    );
  };

  const departmentFiles = getDepartmentFiles();

  // Performance Metrics
  const performanceMetrics = useMemo(() => {
    const totalFiles = departmentFiles.length;
    const completedFiles = departmentFiles.filter(f => 
      f.status === 'COMPLETED' || f.status === 'DELIVERED_TO_CLIENT'
    ).length;
    
    const avgProcessingTime = departmentFiles.reduce((acc, file) => {
      const created = new Date(file.createdAt);
      const updated = new Date(file.updatedAt);
      return acc + (updated.getTime() - created.getTime());
    }, 0) / (totalFiles || 1);

    const avgDays = Math.round(avgProcessingTime / (1000 * 60 * 60 * 24));

    return {
      totalFiles,
      completedFiles,
      completionRate: totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 0,
      avgProcessingDays: avgDays,
      pendingFiles: totalFiles - completedFiles
    };
  }, [departmentFiles]);

  // Workload Analysis
  const workloadAnalysis = useMemo(() => {
    if (user?.role === 'declaration_manager' || (user?.role && ['managing_director', 'coo', 'commercial_manager'].includes(user.role))) {
      const declarants = mockUsers.filter(u => u.role === 'declarant');
      return declarants.map(declarant => ({
        user: declarant,
        workload: getDeclarantWorkload(declarant.id, files),
        efficiency: Math.round(Math.random() * 30 + 70) // Mock efficiency score
      }));
    }
    
    if (user?.role === 'operations_manager' || (user?.role && ['managing_director', 'coo', 'commercial_manager'].includes(user.role))) {
      const clerks = mockUsers.filter(u => u.role === 'operation_clerk');
      return clerks.map(clerk => ({
        user: clerk,
        workload: getOperationClerkWorkload(clerk.id, files),
        efficiency: Math.round(Math.random() * 30 + 70) // Mock efficiency score
      }));
    }
    
    return [];
  }, [user, files]);

  // Shipment Statistics
  const shipmentStats = useMemo(() => {
    const byType = departmentFiles.reduce((acc, file) => {
      acc[file.shipmentType] = (acc[file.shipmentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byMode = departmentFiles.reduce((acc, file) => {
      acc[file.transportMode] = (acc[file.transportMode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = departmentFiles.reduce((acc, file) => {
      const status = file.status.replace(/_/g, ' ');
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { byType, byMode, byStatus };
  }, [departmentFiles]);

  // Financial Metrics
  const financialMetrics = useMemo(() => {
    const totalRequests = requests.length;
    const approvedRequests = requests.filter(r => r.status === 'PAID').length;
    const pendingRequests = requests.filter(r => 
      r.status === 'PENDING_MANAGER_APPROVAL' || 
      r.status === 'PENDING_COO_APPROVAL' ||
      r.status === 'PENDING_HR_APPROVAL'
    ).length;
    
    const totalAmount = requests
      .filter(r => r.status === 'PAID')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      totalRequests,
      approvedRequests,
      pendingRequests,
      totalAmount,
      avgAmount: approvedRequests > 0 ? Math.round(totalAmount / approvedRequests) : 0
    };
  }, [requests]);

  const exportReport = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Performance Overview
    const performanceData = [
      ['Performance Metrics', ''],
      ['Report Generated By', user?.name || ''],
      ['Generated At', new Date().toLocaleString()],
      ['Date Range', `Last ${dateRange} days`],
      ['Department', selectedDepartment === 'all' ? 'All Departments' : selectedDepartment],
      [''],
      ['Metric', 'Value'],
      ['Total Files', performanceMetrics.totalFiles],
      ['Completed Files', performanceMetrics.completedFiles],
      ['Completion Rate', `${performanceMetrics.completionRate}%`],
      ['Average Processing Days', performanceMetrics.avgProcessingDays],
      ['Pending Files', performanceMetrics.pendingFiles],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(performanceData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Performance Overview');

    // Sheet 2: Workload Analysis
    if (workloadAnalysis.length > 0) {
      const workloadData = [
        ['Workload Analysis', '', '', '', ''],
        ['Staff Member', 'Role', 'Total Assigned', 'In Progress', 'Efficiency Score'],
        ...workloadAnalysis.map(staff => [
          staff.user.name,
          staff.user.role.replace(/_/g, ' '),
          staff.workload.totalAssigned,
          staff.workload.inProgress,
          `${staff.efficiency}%`
        ])
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(workloadData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Workload Analysis');
    }

    // Sheet 3: Shipment Statistics
    const shipmentData = [
      ['Shipment Statistics', ''],
      [''],
      ['By Type', 'Count'],
      ...Object.entries(shipmentStats.byType).map(([type, count]) => [type, count]),
      [''],
      ['By Transport Mode', 'Count'],
      ...Object.entries(shipmentStats.byMode).map(([mode, count]) => [mode, count]),
      [''],
      ['By Status', 'Count'],
      ...Object.entries(shipmentStats.byStatus).map(([status, count]) => [status, count]),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(shipmentData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Shipment Statistics');

    // Sheet 4: Financial Reports
    const financialData = [
      ['Financial Reports', ''],
      [''],
      ['Metric', 'Value'],
      ['Total Petty Cash Requests', financialMetrics.totalRequests],
      ['Approved & Paid Requests', financialMetrics.approvedRequests],
      ['Pending Approval', financialMetrics.pendingRequests],
      ['Total Amount Paid (TZS)', financialMetrics.totalAmount.toLocaleString()],
      ['Average Request Amount (TZS)', financialMetrics.avgAmount.toLocaleString()],
      ['Approval Rate', `${financialMetrics.totalRequests > 0 ? Math.round((financialMetrics.approvedRequests / financialMetrics.totalRequests) * 100) : 0}%`],
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(financialData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Financial Reports');

    // Sheet 5: Detailed File List
    const fileListData = [
      ['Detailed File List', '', '', '', '', ''],
      ['File Number', 'Client', 'Status', 'Shipment Type', 'Transport Mode', 'Created Date'],
      ...departmentFiles.map(file => [
        file.fileNumber,
        file.client?.name || '',
        file.status.replace(/_/g, ' '),
        file.shipmentType,
        file.transportMode,
        new Date(file.createdAt).toLocaleDateString()
      ])
    ];
    const ws5 = XLSX.utils.aoa_to_sheet(fileListData);
    XLSX.utils.book_append_sheet(wb, ws5, 'File List');

    // Generate filename
    const filename = `Report_${selectedDepartment}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Write the file
    XLSX.writeFile(wb, filename);
    
    toast.success('Excel report exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departmental Reports</h1>
          <p className="text-gray-500 mt-1">
            Analyze performance, workload, and statistics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={exportReport} variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(user?.role === 'managing_director' || user?.role === 'coo' || user?.role === 'commercial_manager' || user?.role === 'finance_manager') && (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="declaration">Declaration</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{performanceMetrics.totalFiles}</p>
                <p className="text-sm text-gray-500">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{performanceMetrics.completionRate}%</p>
                <p className="text-sm text-gray-500">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{performanceMetrics.avgProcessingDays}</p>
                <p className="text-sm text-gray-500">Avg Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{performanceMetrics.pendingFiles}</p>
                <p className="text-sm text-gray-500">Pending Files</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workload">Workload Analysis</TabsTrigger>
          <TabsTrigger value="shipments">Shipment Statistics</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>File Status Distribution</CardTitle>
                <CardDescription>Current status of all files in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(shipmentStats.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{status}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(count / performanceMetrics.totalFiles) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transport Mode Analysis</CardTitle>
                <CardDescription>Distribution by transport method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(shipmentStats.byMode).map(([mode, count]) => (
                    <div key={mode} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{mode}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(count / performanceMetrics.totalFiles) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workload">
          <Card>
            <CardHeader>
              <CardTitle>Staff Workload Analysis</CardTitle>
              <CardDescription>Performance and workload distribution among staff members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Staff Member</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Total Assigned</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">In Progress</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Efficiency Score</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workloadAnalysis.map((staff) => (
                      <tr key={staff.user.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">{staff.user.name}</p>
                            <p className="text-sm text-gray-500">{staff.user.role.replace(/_/g, ' ')}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold">{staff.workload.totalAssigned}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold">{staff.workload.inProgress}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  staff.efficiency >= 80 ? "bg-green-500" :
                                  staff.efficiency >= 60 ? "bg-amber-500" : "bg-red-500"
                                )}
                                style={{ width: `${staff.efficiency}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{staff.efficiency}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            variant="secondary"
                            className={cn(
                              staff.workload.totalAssigned > 8 ? "bg-red-100 text-red-700" :
                              staff.workload.totalAssigned > 5 ? "bg-amber-100 text-amber-700" :
                              "bg-green-100 text-green-700"
                            )}
                          >
                            {staff.workload.totalAssigned > 8 ? "Overloaded" :
                             staff.workload.totalAssigned > 5 ? "Busy" : "Available"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipments">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Types</CardTitle>
                <CardDescription>Distribution by shipment category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(shipmentStats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{type}</p>
                        <p className="text-sm text-gray-500">{count} shipments</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{Math.round((count / performanceMetrics.totalFiles) * 100)}%</p>
                        <p className="text-xs text-gray-500">of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Time Analysis</CardTitle>
                <CardDescription>Average time spent in each department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Declaration Department</p>
                      <p className="text-sm text-gray-500">Average processing time</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">2.5 days</p>
                      <p className="text-xs text-green-600">↓ 15% from last month</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Operations Department</p>
                      <p className="text-sm text-gray-500">Average processing time</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">3.2 days</p>
                      <p className="text-xs text-red-600">↑ 8% from last month</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium">Total Clearance Time</p>
                      <p className="text-sm text-gray-500">End-to-end processing</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{performanceMetrics.avgProcessingDays} days</p>
                      <p className="text-xs text-green-600">↓ 5% from last month</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Petty Cash Summary</CardTitle>
                <CardDescription>Financial request and approval statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Total Requests</p>
                      <p className="text-sm text-gray-500">All time</p>
                    </div>
                    <p className="text-2xl font-bold">{financialMetrics.totalRequests}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Approved & Paid</p>
                      <p className="text-sm text-gray-500">Completed requests</p>
                    </div>
                    <p className="text-2xl font-bold">{financialMetrics.approvedRequests}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div>
                      <p className="font-medium">Pending Approval</p>
                      <p className="text-sm text-gray-500">Awaiting action</p>
                    </div>
                    <p className="text-2xl font-bold">{financialMetrics.pendingRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Metrics</CardTitle>
                <CardDescription>Amount analysis and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium">Total Amount Paid</p>
                      <p className="text-sm text-gray-500">Approved requests</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">TZS {financialMetrics.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <div>
                      <p className="font-medium">Average Request</p>
                      <p className="text-sm text-gray-500">Per approved request</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">TZS {financialMetrics.avgAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Approval Rate</p>
                      <p className="text-sm text-gray-500">Success percentage</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {financialMetrics.totalRequests > 0 
                          ? Math.round((financialMetrics.approvedRequests / financialMetrics.totalRequests) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}