import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Home, Package, Users, Calendar, BarChart3, Settings, Sun, Moon, LogOut } from 'lucide-react';
import { useStore } from '../../lib/store';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useStore((state) => state.logout);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: Calendar, label: 'Rentals', path: '/rentals' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className={`font-bold text-xl text-gray-800 dark:text-white ${!sidebarOpen && 'hidden'}`}>
              RentalPro
            </h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                active={location.pathname === item.path}
                sidebarOpen={sidebarOpen}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={toggleDarkMode}
              className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
              {sidebarOpen && (
                <span className="ml-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && (
                <span className="ml-3 text-sm font-medium">
                  Logout
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto max-w-7xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  active: boolean;
  sidebarOpen: boolean;
}

function NavItem({ icon: Icon, label, path, active, sidebarOpen }: NavItemProps) {
  return (
    <Link
      to={path}
      className={`flex items-center w-full p-2 rounded-lg transition-colors
        ${active 
          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
    >
      <Icon className="w-5 h-5" />
      {sidebarOpen && <span className="ml-3 text-sm font-medium">{label}</span>}
    </Link>
  );
}