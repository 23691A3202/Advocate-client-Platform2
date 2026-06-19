import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = (user) => setCurrentUser(user);

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...currentUser, ...updates };
    localStorage.setItem('currentUser', JSON.stringify(updated));
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
