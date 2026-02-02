import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle, Settings } from 'lucide-react';
import { alertApi } from '../services/api';
import type { Alert } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Alerts = () => {
  const { user } = useAuth();
  const [alertSettings, setAlertSettings] = useState({
    thresholdEnabled: true,
    thresholdValue: 100,
    anomalyDetection: true,
    emailNotifications: true,
    pushNotifications: false
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real alerts from backend
  useEffect(() => {
    const loadAlerts = async () => {
      if (!user) return; // Don't load if user is not authenticated
      
      try {
        setLoading(true);
        const alertsData = await alertApi.getAlertsForUser(user.id);
        setAlerts(alertsData);
      } catch (error: any) {
        console.error('Failed to load alerts:', error);
        
        // Handle network errors gracefully
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
          console.log('Alert service not available - using empty data');
        }
        
        // Fallback to empty array if backend is not available
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [user]);

  const triggerAlertCheck = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:9090'}/usage-service/api/v1/usage/check-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Reload alerts after triggering check
        setTimeout(() => {
          if (user) {
            alertApi.getAlertsForUser(user.id)
              .then(alertsData => setAlerts(alertsData))
              .catch(() => setAlerts([]));
          }
        }, 2000); // Wait 2 seconds for alerts to be processed
      }
    } catch (error) {
      console.error('Failed to trigger alert check:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'low': return <Bell className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    if (!type) return 'Unknown Alert';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
          <h1 className="text-2xl font-bold text-gray-900">Energy Alerts</h1>
          <p className="text-gray-600">Monitor and manage your energy consumption alerts</p>
        </div>
        
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Settings className="w-4 h-4 mr-2" />
          Alert Settings
        </button>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter((a: any) => !a.acknowledged).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Acknowledged</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter((a: any) => a.acknowledged).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alert Status</p>
              <p className="text-2xl font-bold text-gray-900">Active</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Alert Settings Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Alert Settings</h3>
          <button
            onClick={triggerAlertCheck}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Trigger Alert Check
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Threshold Alerts</p>
              <p className="text-sm text-gray-600">Alert when consumption exceeds limit</p>
            </div>
            <button
              onClick={() => setAlertSettings(prev => ({ ...prev, thresholdEnabled: !prev.thresholdEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                alertSettings.thresholdEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  alertSettings.thresholdEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Anomaly Detection</p>
              <p className="text-sm text-gray-600">Detect unusual consumption patterns</p>
            </div>
            <button
              onClick={() => setAlertSettings(prev => ({ ...prev, anomalyDetection: !prev.anomalyDetection }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                alertSettings.anomalyDetection ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  alertSettings.anomalyDetection ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive alerts via email</p>
            </div>
            <button
              onClick={() => setAlertSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                alertSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  alertSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Alert History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert History</h3>
          <div className="space-y-4">
            {alerts.map((alert: Alert) => (
              <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity || 'low')}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(alert.severity || 'low')}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          {getAlertTypeLabel(alert.type || 'energy_alert')}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity || 'low')}`}>
                          {(alert.severity || 'low').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-500 mb-2">{alert.message || 'Energy alert notification'}</p>
                      
                      {(alert.value || alert.threshold) && (
                        <div className="text-sm text-gray-600 mb-2">
                          {alert.value && <span>Current: {alert.value} kWh</span>}
                          {alert.threshold && <span> • Threshold: {alert.threshold} kWh</span>}
                          {alert.expectedValue && <span> • Expected: {alert.expectedValue} kWh</span>}
                          {alert.averageValue && <span> • Average: {alert.averageValue} kWh</span>}
                        </div>
                      )}
                      
                      {alert.device && (
                        <div className="text-sm text-gray-600 mb-2">
                          Device: {alert.device}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : new Date(alert.createdAt).toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          alert.acknowledged 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.acknowledged ? 'Acknowledged' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {!alert.acknowledged && (
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
