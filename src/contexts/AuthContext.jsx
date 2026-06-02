import { useState, useCallback, useMemo, useEffect } from 'react';
import { AuthContext } from './auth-context';

const decodeJWT = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const isTokenValid = (token) => {
  if (!token || typeof token !== 'string' || token.split('.').length !== 3)
    return false;
  const payload = decodeJWT(token);
  return payload && payload.exp * 1000 > Date.now();
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored && !isTokenValid(stored)) {
      localStorage.removeItem('token');
      setToken(null);
    }
    setIsLoading(false);
  }, []);

  const user = useMemo(() => {
    if (!isTokenValid(token)) return null;
    const payload = decodeJWT(token);
    
    const nameFromEmail = payload.email ? payload.email.split('@')[0] : 'Usuario';
    
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role,
      name: payload.name || nameFromEmail
    };
  }, [token]);

  const login = useCallback((newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
  }, []);

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}