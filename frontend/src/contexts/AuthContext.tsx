import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const isAuthenticated = !!token;

  const login = useCallback(async (email: string, _password: string) => {
    const mockToken = `mock-jwt-token-${Date.now()}`;
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
    };

    localStorage.setItem('token', mockToken);
    setToken(mockToken);
    setUser(mockUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (token) {
      const mockUser: User = {
        id: '1',
        email: 'user@distroviz.com',
        name: 'Usuario',
      };
      setUser(mockUser);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}