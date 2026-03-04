import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { FileOpeningPage } from '@/pages/FileOpeningPage';
import { DeclarationPage } from '@/pages/DeclarationPage';
import { OperationsPage } from '@/pages/OperationsPage';
import { PettyCashPage } from '@/pages/PettyCashPage';
import { DriverManagementPage } from '@/pages/DriverManagementPage';
import { DriversPage } from '@/pages/DriversPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { FileDetailPage } from '@/pages/FileDetailPage';
import { PettyCashHistoryPage } from '@/pages/PettyCashHistoryPage';
import { useAuthStore } from '@/store/authStore';

export type AppRoute = 
  | 'login'
  | 'dashboard'
  | 'files/open'
  | 'files/:id'
  | 'declaration'
  | 'operations'
  | 'petty-cash'
  | 'petty-cash/history'
  | 'reports'
  | 'drivers'
  | 'drivers-management';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('dashboard');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

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
      case 'petty-cash':
        return <PettyCashPage navigate={navigate} fileId={routeParams.fileId} />;
      case 'petty-cash/history':
        return <PettyCashHistoryPage navigate={navigate} />;
      case 'reports':
        return <ReportsPage navigate={navigate} />;
      case 'drivers':
        return <DriversPage navigate={navigate} />;
      case 'drivers-management':
        return <DriverManagementPage navigate={navigate} />;
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
