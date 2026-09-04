import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('homesync_token');
    const storedUser = localStorage.getItem('homesync_user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Refresh user profile from API
      authAPI.getProfile()
        .then(res => {
          setUser(res.data);
          localStorage.setItem('homesync_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const { token, user: userData } = response.data;
    localStorage.setItem('homesync_token', token);
    localStorage.setItem('homesync_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('homesync_token');
    localStorage.removeItem('homesync_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
