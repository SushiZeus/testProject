import { useState } from 'react';
import {
  LayoutDashboard,
  FilePlus,
  ClipboardCheck,
  Truck,
  DollarSign,
  Users,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  User,
  BarChart3,
  FileText,
  Receipt,
  Banknote,
  Package,
  ShoppingCart,
  Briefcase,
  BookOpen,
  TrendingUp,
  Handshake,
  Wrench,
  Trash2,
  ClipboardList,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { AppRoute } from '@/App';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: AppRoute;
  roles: string[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    href: 'dashboard', 
    roles: ['*']
  },
  { 
    label: 'File Opening', 
    icon: FilePlus, 
    href: 'files/open', 
    roles: ['documentation_officer', 'coo', 'managing_director', 'administrator'] 
  },
  { 
    label: 'Declaration', 
    icon: ClipboardCheck, 
    href: 'declaration', 
    roles: ['declaration_manager', 'declarant', 'administrator'] 
  },
  { 
    label: 'Operations', 
    icon: Truck, 
    href: 'operations', 
    roles: ['operations_manager', 'operation_clerk', 'permits_clerk', 'administrator'] 
  },
  { 
    label: 'Shipping Line', 
    icon: Truck, 
    href: 'shipping-line', 
    roles: ['shipping_line_clerk', 'operations_manager', 'administrator'] 
  },
  { 
    label: 'Petty Cash', 
    icon: DollarSign, 
    href: 'petty-cash', 
    roles: ['documentation_officer', 'declaration_manager', 'declarant', 'operations_manager', 'operation_clerk', 'shipping_line_clerk', 'hr_manager', 'finance_manager', 'cashier', 'commercial_manager', 'coo', 'managing_director', 'administrator'] 
  },
  { 
    label: 'Payroll', 
    icon: Banknote, 
    href: 'payroll', 
    roles: ['hr_manager', 'finance_manager', 'cashier', 'administrator'] 
  },
  { 
    label: 'Fixed Assets', 
    icon: Package, 
    roles: ['hr_manager', 'finance_manager', 'administrator', 'commercial_manager', 'coo', 'managing_director'],
    children: [
      { label: 'Asset Register', icon: Package, href: 'assets', roles: ['hr_manager', 'finance_manager', 'administrator', 'commercial_manager', 'coo', 'managing_director'] },
      { label: 'Depreciation', icon: TrendingUp, href: 'assets/depreciation', roles: ['hr_manager', 'finance_manager', 'administrator', 'commercial_manager', 'coo', 'managing_director'] },
      { label: 'Assignments', icon: Users, href: 'assets/assignments', roles: ['hr_manager', 'finance_manager', 'administrator', 'commercial_manager', 'coo', 'managing_director'] },
      { label: 'Maintenance', icon: Wrench, href: 'assets/maintenance', roles: ['hr_manager', 'finance_manager', 'administrator', 'commercial_manager', 'coo', 'managing_director'] },
      { label: 'Disposals', icon: Trash2, href: 'assets/disposals', roles: ['hr_manager', 'finance_manager', 'administrator', 'commercial_manager', 'coo', 'managing_director'] },
    ]
  },
  { 
    label: 'Inventory', 
    icon: ShoppingCart, 
    roles: ['hr_manager', 'administrator', 'commercial_manager', 'coo', 'managing_director'],
    children: [
      { label: 'Dashboard', icon: LayoutDashboard, href: 'inventory', roles: ['hr_manager', 'administrator', 'commercial_manager', 'coo', 'managing_director'] },
      { label: 'Items & Stock', icon: Package, href: 'inventory/items', roles: ['hr_manager', 'administrator', 'commercial_manager', 'coo', 'managing_director'] },
      { label: 'Requests', icon: FileText, href: 'inventory/requests', roles: ['hr_manager', 'administrator', 'commercial_manager', 'coo', 'managing_director'] },
      { label: 'Purchase Orders', icon: Receipt, href: 'inventory/po', roles: ['hr_manager', 'administrator', 'commercial_manager', 'coo', 'managing_director'] },
      { label: 'Goods Received', icon: Banknote, href: 'inventory/goods-received', roles: ['hr_manager', 'administrator', 'commercial_manager', 'coo', 'managing_director'] },
    ]
  },
  { 
    label: 'Recruitment', 
    icon: Briefcase, 
    href: 'recruitment', 
    roles: ['hr_manager', 'administrator', 'coo', 'managing_director'] 
  },
  { 
    label: 'Training', 
    icon: BookOpen, 
    href: 'training', 
    roles: ['hr_manager', 'administrator', 'coo', 'managing_director'] 
  },
  { 
    label: 'Performance', 
    icon: TrendingUp, 
    href: 'performance', 
    roles: ['hr_manager', 'administrator', 'coo', 'managing_director'] 
  },
  { 
    label: 'Outsourcing', 
    icon: Handshake, 
    href: 'outsourcing', 
    roles: ['hr_manager', 'administrator', 'coo', 'managing_director'] 
  },
  { 
    label: 'Leave Management', 
    icon: Users, 
    href: 'leave-management', 
    roles: ['*']
  },
  { 
    label: 'User Management', 
    icon: Users, 
    href: 'user-management', 
    roles: ['hr_manager', 'administrator'] 
  },
  { 
    label: 'Documents', 
    icon: FileText, 
    href: 'documents', 
    roles: ['*']
  },
  { 
    label: 'Reports', 
    icon: BarChart3, 
    href: 'reports', 
    roles: ['operations_manager', 'declaration_manager', 'hr_manager', 'finance_manager', 'commercial_manager', 'coo', 'managing_director', 'administrator'] 
  },
  { 
    label: 'Quotations', 
    icon: ClipboardList, 
    href: 'quotations', 
    roles: ['commercial_manager', 'administrator'] 
  },
  { 
    label: 'Drivers', 
    icon: Users, 
    href: 'drivers', 
    roles: ['hr_manager', 'coo', 'managing_director', 'administrator'] 
  },
  { 
    label: 'Driver Management', 
    icon: Truck, 
    href: 'drivers-management', 
    roles: ['transport_manager', 'delivery_clerk', 'administrator'] 
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  navigate: (route: AppRoute) => void;
  currentRoute: AppRoute;
}

export function DashboardLayout({ children, navigate, currentRoute }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore();
  const { getUnreadCount, getNotificationsForUser, markAsRead, markAllAsRead } = useNotificationStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['Fixed Assets', 'Inventory']);

  const unreadCount = user ? getUnreadCount(user.id) : 0;
  const notifications = user ? getNotificationsForUser(user.id).slice(0, 5) : [];

  const toggleSection = (label: string) => {
    setExpandedSections(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  // Get notification count per module based on notification links
  const getModuleNotificationCount = (route: AppRoute): number => {
    if (!user) return 0;
    
    const userNotifications = getNotificationsForUser(user.id).filter(n => !n.isRead);
    
    // Map routes to notification link patterns
    const routePatterns: Record<string, string[]> = {
      'dashboard': ['/dashboard'],
      'files/open': ['/files'],
      'declaration': ['/declaration'],
      'operations': ['/operations'],
      'shipping-line': ['/shipping-line'],
      'petty-cash': ['/petty-cash'],
      'claims': ['/claims'],
      'payroll': ['/payroll'],
      'loans': ['/loans'],
      'leave-management': ['/leave-management'],
      'user-management': ['/user-management'],
      'reports': ['/reports'],
      'drivers': ['/drivers'],
      'drivers-management': ['/drivers-management'],
      'quotations': ['/quotations'],
    };
    
    const patterns = routePatterns[route] || [];
    return userNotifications.filter(n => 
      n.link && patterns.some(pattern => n.link?.includes(pattern))
    ).length;
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const filteredNavItems = navItems.filter(
    item => item.roles.includes('*') || (user && item.roles.includes(user.role))
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-slate-800 text-white transition-all duration-300 z-40 hidden lg:block',
          sidebarOpen ? 'w-72' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-6">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/dow-elef-logo.svg" alt="DOW ELEF Logo" className="w-full h-full" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">DOW ELEF</h1>
                <p className="text-xs text-orange-200">INTERNATIONAL (T) LTD</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/dow-elef-logo.svg" alt="DOW ELEF Logo" className="w-full h-full" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto" style={{ height: 'calc(100vh - 160px)' }}>
          {filteredNavItems.map((item) => {
            if (item.children) {
              // Expandable section
              const isExpanded = expandedSections.includes(item.label);
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleSection(item.label)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left hover:bg-white/10 border-l-4 border-transparent"
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="font-medium flex-1">{item.label}</span>
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform",
                          isExpanded && "rotate-180"
                        )} />
                      </>
                    )}
                  </button>
                  {isExpanded && sidebarOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <button
                          key={child.href}
                          onClick={() => navigate(child.href!)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-left text-sm',
                            currentRoute === child.href
                              ? 'bg-orange-300 text-slate-800'
                              : 'hover:bg-white/10'
                          )}
                        >
                          <span className="font-medium">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            
            // Regular item
            const notificationCount = getModuleNotificationCount(item.href!);
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href!)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left relative',
                  currentRoute === item.href
                    ? 'bg-orange-300 text-slate-800 border-l-4 border-orange-500'
                    : 'hover:bg-white/10 border-l-4 border-transparent'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="font-medium flex-1">{item.label}</span>
                    {notificationCount > 0 && (
                      <Badge className="h-5 min-w-5 flex items-center justify-center p-0 px-1.5 bg-red-500 text-white text-xs">
                        {notificationCount}
                      </Badge>
                    )}
                  </>
                )}
                {!sidebarOpen && notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-red-500 text-white text-[10px]">
                    {notificationCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-slate-800 text-white transition-all duration-300 z-50 lg:hidden',
          mobileMenuOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full'
        )}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/dow-elef-logo.svg" alt="DOW ELEF Logo" className="w-full h-full" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">DOW ELEF</h1>
              <p className="text-xs text-orange-200">INTERNATIONAL (T) LTD</p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
          {filteredNavItems.map((item) => {
            if (item.children) {
              // Expandable section
              const isExpanded = expandedSections.includes(item.label);
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleSection(item.label)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left hover:bg-white/10 border-l-4 border-transparent"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium flex-1">{item.label}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <button
                          key={child.href}
                          onClick={() => {
                            navigate(child.href!);
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-left text-sm',
                            currentRoute === child.href
                              ? 'bg-orange-300 text-slate-800'
                              : 'hover:bg-white/10'
                          )}
                        >
                          <span className="font-medium">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            
            // Regular item
            const notificationCount = getModuleNotificationCount(item.href!);
            return (
              <button
                key={item.href}
                onClick={() => {
                  navigate(item.href!);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left relative',
                  currentRoute === item.href
                    ? 'bg-orange-300 text-slate-800 border-l-4 border-orange-500'
                    : 'hover:bg-white/10 border-l-4 border-transparent'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium flex-1">{item.label}</span>
                {notificationCount > 0 && (
                  <Badge className="h-5 min-w-5 flex items-center justify-center p-0 px-1.5 bg-red-500 text-white text-xs">
                    {notificationCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
        )}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          {/* Left: Mobile Menu + Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-6 w-64"
              />
            </div>
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => user && markAllAsRead(user.id)}
                      className="text-xs text-[#3b82f6] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                      onClick={() => {
                        markAsRead(notification.id);
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className={cn(
                          'w-2 h-2 rounded-full',
                          notification.type === 'info' && 'bg-orange-300',
                          notification.type === 'success' && 'bg-green-500',
                          notification.type === 'warning' && 'bg-amber-500',
                          notification.type === 'error' && 'bg-red-500',
                        )} />
                        <span className="font-medium text-sm flex-1">{notification.title}</span>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 pl-4">
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-400 pl-4">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors">
                  <Avatar className="h-8 w-8 bg-orange-300">
                    <AvatarFallback className="bg-orange-300 text-slate-800 text-sm">
                      {user ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
