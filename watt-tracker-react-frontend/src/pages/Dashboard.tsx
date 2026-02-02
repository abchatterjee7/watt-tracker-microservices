import { useState, useEffect } from 'react';
import { Zap, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Usage, DashboardStats } from '../types';
import { usageApi, alertApi, deviceApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDevices: 0,
    totalEnergyConsumption: 0,
    averageDailyConsumption: 0,
    alertsCount: 0
  });
  const [usageData, setUsageData] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  // Load real data from backend
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return; // Don't load if user is not authenticated
      
      try {
        setLoading(true);
        
        // Load data from multiple services in parallel
        const [devicesData] = await Promise.all([
          deviceApi.getAllDevicesForUser(user.id).catch(() => []), // Fallback to empty array
        ]);

        // Try to get usage data, fallback to mock if service not available
        let usageData;
        try {
          usageData = await usageApi.getUserUsage(user.id, 7);
        } catch (usageError) {
          // Create fallback usage data matching the Usage interface
          usageData = {
            userId: user.id,
            devices: devicesData || []
          };
        }

        // Try to get alerts data, fallback to empty array
        let alertsData;
        try {
          alertsData = await alertApi.getAlertsForUser(user.id);
        } catch (alertError) {
          alertsData = [];
        }

        // Calculate stats from real data
        const totalConsumption = usageData?.devices?.reduce((sum: number, device: any) => sum + (device.energyConsumed || 0), 0) || 0;
        const totalDevices = devicesData?.length || 0;
        const alertsCount = alertsData?.length || 0;

        setStats({
          totalDevices,
          totalEnergyConsumption: totalConsumption,
          averageDailyConsumption: totalConsumption / 7,
          alertsCount
        });

        setUsageData(usageData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Set empty state if backend is not available
        setStats({
          totalDevices: 0,
          totalEnergyConsumption: 0,
          averageDailyConsumption: 0,
          alertsCount: 0
        });
        setUsageData({
          userId: user.id,
          devices: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Generate hourly data from real usage
  // TODO: Backend should provide hourly aggregated data instead of hardcoded values
  const hourlyData = usageData?.devices?.length ? 
    // For now, distribute total consumption evenly across hours when real data exists
    Array.from({ length: 7 }, (_, i) => {
      const hour = i * 4; // 0, 4, 8, 12, 16, 20, 23
      const totalConsumption = usageData.devices.reduce((sum: number, device: any) => 
        sum + (device.energyConsumed || 0), 0);
      const avgConsumption = totalConsumption / 7; // Even distribution
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        consumption: Number(avgConsumption.toFixed(2))
      };
    }) : [
    { time: '00:00', consumption: 0 },
    { time: '04:00', consumption: 0 },
    { time: '08:00', consumption: 0 },
    { time: '12:00', consumption: 0 },
    { time: '16:00', consumption: 0 },
    { time: '20:00', consumption: 0 },
    { time: '23:00', consumption: 0 }
  ];

  // Generate device location data from real usage
  const locationData = usageData?.devices?.reduce((acc: any[], device) => {
    const existing = acc.find(item => item.name === device.location);
    if (existing) {
      existing.value += device.energyConsumed || 0;
    } else {
      acc.push({ 
        name: device.location, 
        value: device.energyConsumed || 0,
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][acc.length % 5]
      });
    }
    return acc;
  }, []) || [
    { name: 'No Data', value: 1, color: '#E5E7EB' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDevices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Consumption</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEnergyConsumption.toFixed(2)} kWh</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageDailyConsumption.toFixed(2)} kWh</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.alertsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Consumption Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Energy Consumption</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="consumption" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Usage by Location</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={locationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {locationData.map((entry: any, index: any) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Devices */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Energy Consuming Devices</h3>
          <div className="space-y-4">
            {usageData?.devices?.sort((a, b) => (b.energyConsumed || 0) - (a.energyConsumed || 0))
              .slice(0, 5)
              .map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{device.name}</p>
                    <p className="text-sm text-gray-600">{device.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{Number(device.energyConsumed).toFixed(2)} kWh</p>
                    <p className="text-sm text-gray-600">Last 3 days</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
