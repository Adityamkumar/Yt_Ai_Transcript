import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/v1/user/current-user');
      // Backend returns { user: { id, name, email } }
      setUser(response.data.user);
      localStorage.setItem('isAuthenticated', 'true');
    } catch (error) {
      setUser(null);
      localStorage.removeItem('isAuthenticated');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post('/api/v1/user/login', { email, password });
    // Backend returns { user: { user: loggedInUser, ... } }
    const userData = response.data.user.user;
    setUser({
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email
    });
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/app');
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await axiosInstance.post('/api/v1/user/register', { name, email, password });
    // Backend returns { user: { id, name, email } }
    setUser(response.data.user);
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/app');
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/v1/user/logout');
    } finally {
      setUser(null);
      localStorage.removeItem('isAuthenticated');
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
