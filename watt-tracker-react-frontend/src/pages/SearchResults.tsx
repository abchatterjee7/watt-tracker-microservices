import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { deviceApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Device } from '../types';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const query = searchParams.get('q') || '';
  
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDevices = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const devicesData = await deviceApi.getAllDevicesForUser(user.id);
        
        // Filter devices based on search query
        if (query.trim()) {
          const filtered = devicesData.filter(device => 
            device.name.toLowerCase().includes(query.toLowerCase()) ||
            device.location.toLowerCase().includes(query.toLowerCase()) ||
            device.type.toLowerCase().includes(query.toLowerCase())
          );
          setFilteredDevices(filtered);
        } else {
          setFilteredDevices(devicesData);
        }
      } catch (error) {
        console.error('Failed to load devices:', error);
        setFilteredDevices([]);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, [user, query]);

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
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
          <p className="text-gray-600">
            {filteredDevices.length} result{filteredDevices.length !== 1 ? 's' : ''} found for "{query}"
          </p>
        </div>
      </div>

      {/* Results */}
      {filteredDevices.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">Try searching with different keywords</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <div key={device.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => navigate('/devices')}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">
                      {device.type === 'SPEAKER' ? '🔊' :
                       device.type === 'CAMERA' ? '📹' :
                       device.type === 'THERMOSTAT' ? '🌡️' :
                       device.type === 'LIGHT' ? '💡' :
                       device.type === 'LOCK' ? '🔒' : '🔔'}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
                      <p className="text-sm text-gray-600">{device.location}</p>
                    </div>
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
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      (device.energyConsumed || 0) > 100 ? 'text-red-600 bg-red-100' :
                      (device.energyConsumed || 0) > 50 ? 'text-yellow-600 bg-yellow-100' :
                      'text-green-600 bg-green-100'
                    }`}>
                      {Number(device.energyConsumed || 0).toFixed(2)} kWh
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
