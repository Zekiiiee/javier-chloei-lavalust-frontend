import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, getTokens, loginUser, logoutUser, clearTokens } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const storedUser = getUser();
    const tokens = getTokens();
    if (storedUser && tokens?.access_token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await loginUser(username, password);
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password) => {
    return await registerUser(username, email, password);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
