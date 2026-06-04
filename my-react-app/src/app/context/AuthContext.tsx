import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { mockCurrentUser } from '../data/mockData';
import { apiService } from '../../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwtPayload(token: string): Record<string, string> {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
}

function buildUserFromJwt(token: string, fallbackEmail: string, fallbackName?: string): User {
  const claims = decodeJwtPayload(token);
  // Handle both short claim names and full URI claim names used by ASP.NET Core
  const email =
    claims['email'] ||
    claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    fallbackEmail;
  const name =
    claims['name'] ||
    claims['unique_name'] ||
    claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
    fallbackName ||
    email;
  const id =
    claims['sub'] ||
    claims['nameid'] ||
    claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    email;
  const rawRole =
    claims['role'] ||
    claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    '';
  const role: 'ADMIN' | 'USER' = rawRole.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
  return {
    ...mockCurrentUser,
    id,
    name,
    email,
    role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('boredUser');
    const token = localStorage.getItem('boredToken');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const token = await apiService.login(email, password);
    const newUser = buildUserFromJwt(token, email);
    localStorage.setItem('boredToken', token);
    localStorage.setItem('boredUser', JSON.stringify(newUser));
    setUser(newUser);
  };

  const signup = async (name: string, email: string, password: string) => {
    await apiService.signup(name, email, password);
    // Auto-login after successful signup
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('boredUser');
    localStorage.removeItem('boredToken');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('boredUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
