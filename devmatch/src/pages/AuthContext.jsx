import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('devmatch_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('devmatch_user');
      }
    }
    setLoading(false);
  }, []);

  const fetchUserFromBackend = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me', { params: { token } });
      setUser(res.data);
      localStorage.setItem('devmatch_user', JSON.stringify(res.data));
    } catch (error) {
      // Optionally handle error (logout or show error)
    }
  };

  const login = async (userData, token) => {
    setUser(userData);
    localStorage.setItem('devmatch_user', JSON.stringify(userData));
    const { connectSocket } = useAuthStore.getState();
    connectSocket();
    if (token) {
      await fetchUserFromBackend(token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('devmatch_user');
    const { disconnectSocket } = useAuthStore.getState();
    disconnectSocket();
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('devmatch_user', JSON.stringify(newUser));
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isRecruiter: user?.role === 'recruiter',
    isProgrammer: user?.role === 'programmer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};