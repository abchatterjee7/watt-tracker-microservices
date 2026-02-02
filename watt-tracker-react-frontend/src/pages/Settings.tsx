import { useState, useEffect } from 'react';
import { User, Bell, Zap, Shield, Database, HelpCircle } from 'lucide-react';
import type { User as UserType } from '../types';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState<UserType>({
    id: 1,
    name: 'Aaditya',
    surname: 'Raj',
    email: 'aaditya.raj@example.com',
    address: 'CS Street, HiTech City, Hyderabad, Telangana 500001',
    alerting: false,
    energyAlertingThreshold: 100,
    emailNotifications: false
  });

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          const fullProfile = await userApi.getUserById(user.id);
          setUserProfile(fullProfile);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };
    loadUserProfile();
  }, []);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    weeklyReports: true,
    monthlyReports: true,
    alertThresholds: true,
    deviceStatus: true
  });

  const [energySettings, setEnergySettings] = useState({
    defaultThreshold: 100,
    peakHourAlerts: true,
    anomalyDetection: true,
    weeklyGoals: true,
    costTracking: true,
    carbonFootprint: true
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'energy', name: 'Energy Settings', icon: Zap },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'data', name: 'Data Management', icon: Database },
    { id: 'help', name: 'Help & Support', icon: HelpCircle }
  ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.updateUser(userProfile.id, userProfile);
      
      // Update localStorage with new profile data
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = { ...user, ...userProfile };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleEmailNotificationToggle = async () => {
    try {
      const updatedProfile = { ...userProfile, emailNotifications: !userProfile.emailNotifications };
      await userApi.updateUser(userProfile.id, updatedProfile);
      setUserProfile(updatedProfile);
      
      // Update localStorage
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = { ...user, ...updatedProfile };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      toast.success(`Email notifications ${updatedProfile.emailNotifications ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle email notifications:', error);
      toast.error('Failed to update email notification settings. Please try again.');
    }
  };

  const handleAlertToggle = async () => {
    try {
      const updatedProfile = { ...userProfile, alerting: !userProfile.alerting };
      await userApi.updateUser(userProfile.id, updatedProfile);
      setUserProfile(updatedProfile);
      
      // Update localStorage
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = { ...user, ...updatedProfile };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      toast.success(`Alerts ${updatedProfile.alerting ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle alerts:', error);
      toast.error('Failed to update alert settings. Please try again.');
    }
  };

  const handleThresholdChange = async (newThreshold: number) => {
    try {
      const updatedProfile = { ...userProfile, energyAlertingThreshold: newThreshold };
      await userApi.updateUser(userProfile.id, updatedProfile);
      setUserProfile(updatedProfile);
      
      // Update localStorage
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = { ...user, ...updatedProfile };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      toast.success('Threshold updated successfully!');
    } catch (error) {
      console.error('Failed to update threshold:', error);
      toast.error('Failed to update threshold. Please try again.');
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-1 sm:space-y-6 px-0.5 sm:px-0">
      <div className="bg-white rounded shadow p-1.5 sm:p-2 md:p-6">
        <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 mb-0.5 sm:mb-1 md:mb-4">Personal Information</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-1 sm:space-y-4">
          <div className="grid grid-cols-1 gap-0.5 sm:gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">First Name</label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-1 py-0.5 sm:px-3 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Last Name</label>
              <input
                type="text"
                value={userProfile.surname}
                onChange={(e) => setUserProfile(prev => ({ ...prev, surname: e.target.value }))}
                className="w-full px-1 py-0.5 sm:px-3 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Email Address</label>
            <input
              type="email"
              value={userProfile.email}
              onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-1 py-0.5 sm:px-3 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Address</label>
            <textarea
              value={userProfile.address}
              onChange={(e) => setUserProfile(prev => ({ ...prev, address: e.target.value }))}
              rows={2}
              className="w-full px-1 py-0.5 sm:px-3 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div className="flex flex-col space-y-0.5 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button
              type="submit"
              className="px-1.5 py-0.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-full sm:w-auto text-xs"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="px-1.5 py-0.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors w-full sm:w-auto text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Alert Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Energy Alerts</p>
              <p className="text-sm text-gray-600">Receive alerts when energy consumption exceeds thresholds</p>
            </div>
            <button
              onClick={handleAlertToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                userProfile.alerting ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  userProfile.alerting ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Threshold (kWh)
            </label>
            <input
              type="number"
              value={userProfile.energyAlertingThreshold}
              onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive alerts via email</p>
            </div>
            <button
              onClick={handleEmailNotificationToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                userProfile.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  userProfile.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(notificationSettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
                <p className="text-sm text-gray-600">
                  {key === 'emailNotifications' && 'Receive notifications via email'}
                  {key === 'pushNotifications' && 'Receive push notifications on mobile devices'}
                  {key === 'smsNotifications' && 'Receive SMS alerts for critical issues'}
                  {key === 'weeklyReports' && 'Get weekly energy consumption reports'}
                  {key === 'monthlyReports' && 'Get monthly energy consumption summaries'}
                  {key === 'alertThresholds' && 'Alert when thresholds are exceeded'}
                  {key === 'deviceStatus' && 'Notify about device status changes'}
                </p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, [key]: !value }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEnergyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Monitoring Settings</h3>
        <div className="space-y-4">
          {Object.entries(energySettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
                <p className="text-sm text-gray-600">
                  {key === 'defaultThreshold' && 'Default alert threshold for energy consumption'}
                  {key === 'peakHourAlerts' && 'Alert during peak consumption hours'}
                  {key === 'anomalyDetection' && 'Detect unusual consumption patterns'}
                  {key === 'weeklyGoals' && 'Set and track weekly energy goals'}
                  {key === 'costTracking' && 'Track energy costs and savings'}
                  {key === 'carbonFootprint' && 'Calculate carbon footprint based on consumption'}
                </p>
              </div>
              {key === 'defaultThreshold' ? (
                <input
                  type="number"
                  value={typeof value === 'boolean' ? '' : value}
                  onChange={(e) => setEnergySettings(prev => ({ 
                    ...prev, 
                    [key]: parseFloat(e.target.value) 
                  }))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <button
                  onClick={() => setEnergySettings(prev => ({ ...prev, [key]: !value }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'energy':
        return renderEnergyTab();
      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {tabs.find(tab => tab.id === activeTab)?.name}
            </h3>
            <p className="text-gray-600">Settings for {tabs.find(tab => tab.id === activeTab)?.name} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-[90vw] mx-auto space-y-1 sm:space-y-6 overflow-x-hidden">
      <div className="px-0.5 sm:px-0 text-center sm:text-left">
        <h1 className="text-sm sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Settings</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 truncate">Manage your account and application settings</p>
      </div>

      <div className="flex flex-col space-y-1 sm:space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0 px-0.5 sm:px-0">
        {/* Sidebar */}
        <div className="w-full lg:w-64">
          <nav className="flex flex-row lg:flex-col lg:space-y-1 space-x-0.5 lg:space-x-0 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 lg:px-4 py-0.5 lg:py-3 text-xs font-medium rounded transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-2 h-2 lg:w-5 lg:h-5 mr-0.5 lg:mr-2" />
                  <span className="hidden sm:inline text-xs sm:text-sm">{tab.name}</span>
                  <span className="sm:hidden text-xs">{tab.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
