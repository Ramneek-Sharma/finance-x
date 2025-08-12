import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './auth-context';

const API_BASE_URL = 'http://localhost:5001';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {
      console.log('🚫 No token found, staying in loading=false state');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching profile with token...');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('📨 Profile response:', data);

      if (response.ok && data.success) {
        console.log('✅ Profile fetched successfully');
        setUser(data.user);
      } else {
        console.error('❌ Profile fetch failed, clearing auth state');
        logout();
      }
    } catch (error) {
      console.error('🔥 Profile fetch error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []); // Remove token dependency to prevent loops

  useEffect(() => {
    console.log('🔄 AuthContext useEffect triggered');
    fetchProfile();
  }, []); // Empty dependency array

  const login = (newToken, userData) => {
    console.log('🔐 Login function called');
    console.log('📝 Setting token and user data immediately');
    
    // Set everything synchronously
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setLoading(false);
    
    console.log('✅ Auth state set - dashboard should be stable now');
  };

  const logout = () => {
    console.log('🚪 Logout called');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    refreshProfile: fetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
