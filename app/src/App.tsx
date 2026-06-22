import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { FileOpeningPage } from '@/pages/FileOpeningPage';
import { DeclarationPage } from '@/pages/DeclarationPage';
import { OperationsPage } from '@/pages/OperationsPage';
import { DeliveryPage } from '@/pages/DeliveryPage';
import { ShippingLinePage } from '@/pages/ShippingLinePage';
import { PettyCashPage } from '@/pages/PettyCashPage';
import { DriverManagementPage } from '@/pages/DriverManagementPage';
import { DriversPage } from '@/pages/DriversPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { FileDetailPage } from '@/pages/FileDetailPage';
import { PettyCashHistoryPage } from '@/pages/PettyCashHistoryPage';
import { LeaveHistoryPage } from '@/pages/LeaveHistoryPage';
import { LeaveManagementPage } from '@/pages/LeaveManagementPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { PayrollPage } from '@/pages/PayrollPage';
import { PayrollRunDetailPage } from '@/pages/PayrollRunDetailPage';
import { AssetRegisterPage } from '@/pages/FixedAssets/AssetRegisterPage';
import { AssetDetailPage } from '@/pages/FixedAssets/AssetDetailPage';
import { MaintenancePage } from '@/pages/FixedAssets/MaintenancePage';
import { DepreciationPage } from '@/pages/FixedAssets/DepreciationPage';
import { AssignmentsPage } from '@/pages/FixedAssets/AssignmentsPage';
import { DisposalsPage } from '@/pages/FixedAssets/DisposalsPage';
import { ItemsPage } from '@/pages/Inventory/ItemsPage';
import { RequestsPage } from '@/pages/Inventory/RequestsPage';
import { PurchaseOrdersPage } from '@/pages/Inventory/PurchaseOrdersPage';
import { GoodsReceivedPage } from '@/pages/Inventory/GoodsReceivedPage';
import { InventoryDashboardPage } from '@/pages/InventoryDashboardPage';
import { RecruitmentDashboardPage } from '@/pages/RecruitmentDashboardPage';
import { TrainingDashboardPage } from '@/pages/TrainingDashboardPage';
import { PerformanceDashboardPage } from '@/pages/PerformanceDashboardPage';
import { OutsourcingDashboardPage } from '@/pages/OutsourcingDashboardPage';
import { QuotationsPage } from '@/pages/QuotationsPage';
import { useAuthStore } from '@/store/authStore';
import { initializeSampleData } from '@/utils/initializeSampleData';

export type AppRoute = 
  | 'login'
  | 'dashboard'
  | 'files/open'
  | 'files/:id'
  | 'declaration'
  | 'operations'
  | 'delivery'
  | 'shipping-line'
  | 'petty-cash'
  | 'petty-cash/history'
  | 'leave-management'
  | 'leave-management/history'
  | 'user-management'
  | 'documents'
  | 'reports'
  | 'drivers'
  | 'drivers-management'
  | 'payroll'
  | 'payroll/:id'
  | 'assets'
  | 'assets/:id'
  | 'assets/new'
  | 'assets/maintenance'
  | 'assets/depreciation'
  | 'assets/assignments'
  | 'assets/disposals'
  | 'inventory'
  | 'inventory/items'
  | 'inventory/po'
  | 'inventory/requests'
  | 'inventory/suppliers'
  | 'inventory/goods-received'
  | 'recruitment'
  | 'recruitment/jobs'
  | 'recruitment/applicants'
  | 'recruitment/interviews'
  | 'training'
  | 'training/courses'
  | 'training/enrollments'
  | 'training/certificates'
  | 'performance'
  | 'performance/appraisals'
  | 'performance/goals'
  | 'performance/pips'
  | 'outsourcing'
  | 'outsourcing/contracts'
  | 'outsourcing/vendors'
  | 'outsourcing/deliverables'
  | 'outsourcing/invoices'
  | 'quotations';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('dashboard');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  // Initialize sample data on first load
  useEffect(() => {
    initializeSampleData();
  }, []);

  const navigate = (route: AppRoute, params?: Record<string, string>) => {
    setCurrentRoute(route);
    if (params) {
      setRouteParams(params);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={() => navigate('dashboard')} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  const renderContent = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardPage navigate={navigate} />;
      case 'files/open':
        return <FileOpeningPage navigate={navigate} />;
      case 'files/:id':
        return <FileDetailPage fileId={routeParams.id} navigate={navigate} />;
      case 'declaration':
        return <DeclarationPage navigate={navigate} />;
      case 'operations':
        return <OperationsPage navigate={navigate} />;
      case 'delivery':
        return <DeliveryPage navigate={navigate} />;
      case 'shipping-line':
        return <ShippingLinePage navigate={navigate} />;
      case 'petty-cash':
        return <PettyCashPage navigate={navigate} fileId={routeParams.fileId} />;
      case 'petty-cash/history':
        return <PettyCashHistoryPage navigate={navigate} />;
      case 'leave-management':
        return <LeaveManagementPage navigate={navigate} />;
      case 'leave-management/history':
        return <LeaveHistoryPage navigate={navigate} />;
      case 'user-management':
        return <UserManagementPage />;
      case 'documents':
        return <DocumentsPage navigate={navigate} />;
      case 'reports':
        return <ReportsPage navigate={navigate} />;
      case 'drivers':
        return <DriversPage navigate={navigate} />;
      case 'drivers-management':
        return <DriverManagementPage navigate={navigate} />;
      case 'payroll':
        return <PayrollPage navigate={navigate} />;
      case 'payroll/:id':
        return <PayrollRunDetailPage navigate={navigate} runId={routeParams.id} />;
      case 'assets':
        return <AssetRegisterPage navigate={navigate} />;
      case 'assets/:id':
        return <AssetDetailPage navigate={navigate} assetId={routeParams.id} />;
      case 'assets/maintenance':
        return <MaintenancePage navigate={navigate} />;
      case 'assets/depreciation':
        return <DepreciationPage navigate={navigate} />;
      case 'assets/assignments':
        return <AssignmentsPage navigate={navigate} />;
      case 'assets/disposals':
        return <DisposalsPage navigate={navigate} />;
      case 'inventory':
        return <InventoryDashboardPage navigate={navigate} />;
      case 'inventory/items':
        return <ItemsPage navigate={navigate} />;
      case 'inventory/requests':
        return <RequestsPage navigate={navigate} />;
      case 'inventory/po':
        return <PurchaseOrdersPage navigate={navigate} />;
      case 'inventory/goods-received':
        return <GoodsReceivedPage navigate={navigate} />;
      case 'recruitment':
        return <RecruitmentDashboardPage navigate={navigate} />;
      case 'training':
        return <TrainingDashboardPage navigate={navigate} />;
      case 'performance':
        return <PerformanceDashboardPage navigate={navigate} />;
      case 'outsourcing':
        return <OutsourcingDashboardPage navigate={navigate} />;
      case 'quotations':
        return <QuotationsPage navigate={navigate} />;
      default:
        return <DashboardPage navigate={navigate} />;
    }
  };

  return (
    <DashboardLayout navigate={navigate} currentRoute={currentRoute}>
      {renderContent()}
    </DashboardLayout>
  );
}

export default App;
