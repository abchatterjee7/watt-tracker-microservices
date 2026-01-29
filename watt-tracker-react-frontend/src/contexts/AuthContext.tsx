import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { userApi } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: Omit<User, 'id'>) => Promise<{ success: boolean; message: string }>;
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
      const response = await userApi.validateToken(authToken);
      if (response.valid && response.user) {
        setUser(response.user);
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
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

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await userApi.login(username, password);
      
      if (response.token) {
        // Create user object from JWT response
        const user: User = {
          id: response.userId,
          email: username, // Using username as email for now
          name: username,
          surname: '',
          address: '',
          alerting: false,
          energyAlertingThreshold: 0
        };
        
        setUser(user);
        setToken(response.token);
        localStorage.setItem('authToken', response.token);
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: 'Login failed' };
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const register = async (userData: Omit<User, 'id'>): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await userApi.register(userData);
      
      if (response.user) {
        setUser(response.user);
        // Auto-login after registration
        const loginResult = await login(userData.email, 'password123'); // Default password for demo
        return loginResult;
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
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
