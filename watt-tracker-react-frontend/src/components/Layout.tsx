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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed on mobile
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
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-3 md:p-3 ml-2 md:ml-4 lg:ml-0 min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
              <img src="./logo.png" className="w-6 h-6 md:w-10 md:h-10 mr-2" alt=""/>
              Watt Tracker
            </h1>     </div>
          
          <nav className="mt-4 md:mt-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)} // Close sidebar on mobile after navigation
                  className={`flex items-center px-4 md:px-6 py-3 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 mr-3" />
                  <span className="text-sm md:text-base">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header Component */}
          <Header 
            onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-24 relative" style={{ minHeight: '400px' }}>
            {isNavigating && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600"></div>
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
