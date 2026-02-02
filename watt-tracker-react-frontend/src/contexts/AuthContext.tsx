import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { userApi } from '../services/api';
import type { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      validateToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (authToken: string) => {
    try {
      // First try to decode JWT locally to avoid API call on refresh
      const decodedToken = decodeJWT(authToken);
      if (decodedToken && decodedToken.userId) {
        // Create basic user object from token
        const user: User = {
          id: decodedToken.userId,
          email: '', // Will be populated from API if needed
          name: 'User',
          surname: '',
          address: '',
          alerting: false,
          energyAlertingThreshold: 0,
          emailNotifications: false
        };
        
        setUser(user);
        setToken(authToken);
        
        // Optionally fetch full user data in background
        fetchUserData(decodedToken.userId, authToken);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  };

  const fetchUserData = async (userId: number, _token: string) => {
    try {
      const userData = await userApi.getUserById(userId);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Don't logout on failure, keep basic user info from token
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await userApi.login(email, password);
      
      if (response.token) {
        // Create user object from JWT response
        const user: User = {
          id: response.userId,
          email: email,
          name: email.split('@')[0] || 'User', // Extract name from email
          surname: '',
          address: '',
          alerting: false,
          energyAlertingThreshold: 0,
          emailNotifications: false
        };
        
        setUser(user);
        setToken(response.token);
        localStorage.setItem('authToken', response.token);
        toast.success('Login successful! Welcome back.');
        return { success: true, message: 'Login successful' };
      } else {
        toast.error('Login failed. Please check your credentials.');
        return { success: false, message: 'Login failed' };
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await userApi.register(userData);
      
      if (response.user) {
        setUser(response.user);
        toast.success('Registration successful! Welcome to Watt Tracker.');
        // Auto-login after registration
        const loginResult = await login(userData.email, userData.password);
        return loginResult;
      } else {
        toast.error(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
