import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power } from 'lucide-react';
import type { Device } from '../types';
import { DeviceType } from '../types';
import { deviceApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Devices = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: DeviceType.SPEAKER as DeviceType,
    location: ''
  });

  // Load real devices from backend
  useEffect(() => {
    const loadDevices = async () => {
      if (!user) return; // Don't load if user is not authenticated
      
      try {
        setLoading(true);
        // Get devices for authenticated user
        const devicesData = await deviceApi.getAllDevicesForUser(user.id);
        setDevices(devicesData);
      } catch (error: any) {
        console.error('Failed to load devices:', error);
        
        // Handle network errors gracefully
        if (error.message?.includes('service unavailable') || error.code === 'NETWORK_ERROR') {
          console.log('Device service not available - using empty data');
        }
        
        // Set empty array if backend is not available
        setDevices([]);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, [user]);

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDevice.name || !newDevice.location) {
      alert('Please fill in all fields');
      return;
    }

    try {
      if (!user) {
        alert('Please login to add devices');
        return;
      }
      
      const deviceData = {
        name: newDevice.name,
        type: newDevice.type,
        location: newDevice.location,
        userId: user.id
      };
      
      const createdDevice = await deviceApi.createDevice(deviceData);
      setDevices([...devices, createdDevice]);
      setShowAddModal(false);
      setNewDevice({ name: '', type: DeviceType.SPEAKER as DeviceType, location: '' });
    } catch (error) {
      console.error('Failed to add device:', error);
      alert('Failed to add device. Please try again.');
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    if (!confirm('Are you sure you want to delete this device?')) {
      return;
    }

    try {
      await deviceApi.deleteDevice(deviceId);
      setDevices(devices.filter(device => device.id !== deviceId));
    } catch (error) {
      console.error('Failed to delete device:', error);
      alert('Failed to delete device. Please try again.');
    }
  };

  const deviceTypeIcons: Record<DeviceType, string> = {
    [DeviceType.SPEAKER]: '�',
    [DeviceType.CAMERA]: '📹',
    [DeviceType.THERMOSTAT]: '🌡️',
    [DeviceType.LIGHT]: '💡',
    [DeviceType.LOCK]: '�',
    [DeviceType.DOORBELL]: '🔔'
  };

  const getConsumptionColor = (consumption: number) => {
    if (consumption > 100) return 'text-red-600 bg-red-100';
    if (consumption > 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
          <p className="text-gray-600">Manage and monitor your household devices</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Device
        </button>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div key={device.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{deviceTypeIcons[device.type]}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
                    <p className="text-sm text-gray-600">{device.location}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    onClick={() => handleDeleteDevice(device.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Device Type</span>
                  <span className="text-sm font-medium text-gray-900">
                    {device.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Energy Usage</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${getConsumptionColor(device.energyConsumed || 0)}`}>
                    {device.energyConsumed || 0} kWh
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-900">Active</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Power className="w-4 h-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Device</h2>
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter device name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                <select 
                  value={newDevice.type}
                  onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value as DeviceType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select device type</option>
                  {Object.values(DeviceType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newDevice.location}
                  onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
