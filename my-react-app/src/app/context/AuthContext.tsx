import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { mockCurrentUser } from '../data/mockData';
import { apiService } from '../../services/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, dateOfBirth: string, gender: string) => Promise<void>;
  verifyEmail: (email: string, code: string, name?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwtPayload(token: string): Record<string, string> {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '='));
    const bytes = Uint8Array.from(decoded, char => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
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
  // Restore the session before the first route renders. Restoring it in an
  // effect briefly left `user` null, which redirected /activities to home on
  // every browser refresh.
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('boredUser');
    const token = localStorage.getItem('boredToken');
    if (storedUser && token) {
      try {
        return JSON.parse(storedUser) as User;
      } catch {
        return buildUserFromJwt(token, '');
      }
    }
    return null;
  });

  const login = async (email: string, password: string) => {
    const token = await apiService.login(email, password);
    const newUser = buildUserFromJwt(token, email);
    localStorage.setItem('boredToken', token);
    localStorage.setItem('boredUser', JSON.stringify(newUser));
    setUser(newUser);
  };

  const signup = async (name: string, email: string, password: string, dateOfBirth: string, gender: string) => {
    const message = await apiService.signup(name, email, password, dateOfBirth, gender);
    toast.success(message);
  };

  const verifyEmail = async (email: string, code: string, name?: string) => {
    const token = await apiService.verifyEmail(email, code);
    const newUser = buildUserFromJwt(token, email, name);
    localStorage.setItem('boredToken', token);
    localStorage.setItem('boredUser', JSON.stringify(newUser));
    setUser(newUser);
    toast.success('Email verified successfully.');
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
        verifyEmail,
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
