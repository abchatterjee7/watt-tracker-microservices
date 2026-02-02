import axios from 'axios';
import type { User, Device, Usage, Alert } from '../types';
import toast from 'react-hot-toast';

// Service URLs - All calls go through API Gateway
const API_GATEWAY_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090';

const api = axios.create({
  timeout: 300000, // Increased to 5 minutes for Ollama responses
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle errors for actual API requests (not navigation)
    if (error.config && error.config.url) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Network error. Please check your connection.');
      }
    }
    return Promise.reject(error);
  }
);

// User Service APIs
export const userApi = {
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`${API_GATEWAY_URL}/user-service/api/v1/user/${id}`);
    return response.data;
  },
  
  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    const response = await api.post(`${API_GATEWAY_URL}/user-service/api/v1/user`, user);
    return response.data;
  },
  
  updateUser: async (id: number, user: Partial<User>): Promise<void> => {
    await api.put(`${API_GATEWAY_URL}/user-service/api/v1/user/${id}`, user);
  },
  
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`${API_GATEWAY_URL}/user-service/api/v1/user/${id}`);
  },

  // Authentication APIs
  login: async (email: string, password: string): Promise<{ token: string; type: string; userId: number; email: string; role: string }> => {
    const response = await api.post(`${API_GATEWAY_URL}/user-service/api/v1/auth/login`, {
      email: email,
      password
    });
    return response.data;
  },

  register: async (userData: any): Promise<{ user: User; message: string }> => {
    const response = await api.post(`${API_GATEWAY_URL}/user-service/api/v1/user/register`, userData);
    return response.data;
  },

  validateToken: async (token: string): Promise<{ valid: boolean; user?: User; message?: string }> => {
    const response = await api.post(`${API_GATEWAY_URL}/user-service/api/v1/user/validate-token`, null, {
      params: { token }
    });
    return response.data;
  }
};

// Device Service APIs
export const deviceApi = {
  getDeviceById: async (id: number): Promise<Device> => {
    try {
      const response = await api.get(`${API_GATEWAY_URL}/device-service/api/v1/device/${id}`);
      return response.data;
    } catch (error: any) {
      // If it's a network error or 404, handle gracefully
      if (error.code === 'NETWORK_ERROR' || error.response?.status === 404) {
        console.log('Device service not available for device ${id}');
        throw new Error('Device not available');
      }
      throw error; // Re-throw other errors
    }
  },
  
  getAllDevicesForUser: async (userId: number): Promise<Device[]> => {
    try {
      const response = await api.get(`${API_GATEWAY_URL}/device-service/api/v1/device/user/${userId}`);
      return response.data;
    } catch (error: any) {
      // If it's a network error or 404, return empty array
      if (error.code === 'NETWORK_ERROR' || error.response?.status === 404) {
        console.log('Device service not available, returning empty array');
        return [];
      }
      throw error; // Re-throw other errors
    }
  },
  
  createDevice: async (device: Omit<Device, 'id'>): Promise<Device> => {
    try {
      const response = await api.post(`${API_GATEWAY_URL}/device-service/api/v1/device/create`, device);
      return response.data;
    } catch (error: any) {
      // If it's a network error, handle gracefully
      if (error.code === 'NETWORK_ERROR') {
        console.log('Device service not available for creating device');
        throw new Error('Cannot create device - service unavailable');
      }
      throw error; // Re-throw other errors
    }
  },
  
  updateDevice: async (id: number, device: Partial<Device>): Promise<Device> => {
    try {
      const response = await api.put(`${API_GATEWAY_URL}/device-service/api/v1/device/${id}`, device);
      return response.data;
    } catch (error: any) {
      // If it's a network error, handle gracefully
      if (error.code === 'NETWORK_ERROR') {
        console.log('Device service not available for updating device');
        throw new Error('Cannot update device - service unavailable');
      }
      throw error; // Re-throw other errors
    }
  },
  
  deleteDevice: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_GATEWAY_URL}/device-service/api/v1/device/${id}`);
    } catch (error: any) {
      // If it's a network error, handle gracefully
      if (error.code === 'NETWORK_ERROR') {
        console.log('Device service not available for deleting device');
        throw new Error('Cannot delete device - service unavailable');
      }
      throw error; // Re-throw other errors
    }
  }
};

// Usage Service APIs
export const usageApi = {
  getUserUsage: async (userId: number, days: number = 3): Promise<Usage> => {
    try {
      const response = await api.get(`${API_GATEWAY_URL}/usage-service/api/v1/usage/${userId}?days=${days}`);
      return response.data;
    } catch (error: any) {
      // If it's a network error or 404, return fallback data
      if (error.code === 'NETWORK_ERROR' || error.response?.status === 404) {
        console.log('Usage service not available, returning fallback data');
        return {
          userId: userId,
          devices: []
        };
      }
      throw error; // Re-throw other errors
    }
  }
};

// Alert Service APIs (Insight Service actually)
export const alertApi = {
  getAlertsForUser: async (userId: number): Promise<Alert[]> => {
    try {
      const response = await api.get(`${API_GATEWAY_URL}/alert-service/api/v1/alert/user/${userId}`);
      return response.data;
    } catch (error: any) {
      // If it's a network error or 404, return empty array
      if (error.code === 'NETWORK_ERROR' || error.response?.status === 404) {
        console.log('Alert service not available, returning empty array');
        return [];
      }
      throw error; // Re-throw other errors
    }
  }
};

// Insight Service APIs
export const insightApi = {
  getSavingTips: async (userId: number): Promise<{ userId: number; tips: string; energyUsage: number }> => {
    try {
      const response = await api.get(`${API_GATEWAY_URL}/insight-service/api/v1/insight/saving-tips/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || error.response?.status === 404) {
        console.log('Insight service not available');
        throw new Error('Insight service not available');
      }
      throw error;
    }
  },
  
  getOverview: async (userId: number): Promise<{ userId: number; tips: string; energyUsage: number }> => {
    try {
      const response = await api.get(`${API_GATEWAY_URL}/insight-service/api/v1/insight/overview/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR' || error.response?.status === 404) {
        console.log('Insight service not available');
        throw new Error('Insight service not available');
      }
      throw error;
    }
  },

  // Streaming APIs
  getSavingTipsStream: (userId: number): EventSource => {
    return new EventSource(`${API_GATEWAY_URL}/insight-service/api/v1/insight/saving-tips/${userId}/stream`);
  },

  getOverviewStream: (userId: number): EventSource => {
    return new EventSource(`${API_GATEWAY_URL}/insight-service/api/v1/insight/overview/${userId}/stream`);
  }
};
