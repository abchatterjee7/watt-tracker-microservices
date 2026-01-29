import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Home, Zap, Settings, BarChart3, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Trigger footer repositioning on route change
  useEffect(() => {
    setIsNavigating(true);
    // Small delay to ensure content is rendered
    const timer = setTimeout(() => {
      setIsNavigating(false);
      // Trigger a resize event to notify footer component
      window.dispatchEvent(new Event('resize'));
    }, 300); // Increased delay for navigation
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Devices', href: '/devices', icon: Zap },
    { name: 'Usage', href: '/usage', icon: BarChart3 },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block w-64 bg-white shadow-lg`}>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <img src="./logo.png" className="w-10 h-10 mr-2" alt=""/>
              Watt Tracker
            </h1>
            <p className="text-sm text-gray-600 mt-2">Energy Monitoring System</p>
          </div>
          
          <nav className="mt-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header Component */}
          <Header 
            onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />

          <main className="flex-1 p-8 pb-24 relative" style={{ minHeight: '400px' }}>
            {isNavigating && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            <div className={isNavigating ? 'invisible' : ''}>
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* Footer - Always at bottom */}
      <Footer />
    </div>
  );
};

export default Layout;
