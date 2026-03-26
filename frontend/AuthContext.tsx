'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { User, LoginPayload, RegisterPayload, AuthTokens } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const saveTokens = (tokens: AuthTokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
    } catch {
      clearTokens();
      setUser(null);
    }
  }, []);

  // Hydrate user from stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = async (payload: LoginPayload) => {
    const { data } = await api.post('/auth/login', payload);
    const { user: u, accessToken, refreshToken } = data.data;
    saveTokens({ accessToken, refreshToken });
    setUser(u);
    // Role-based redirect
    if (u.role === 'admin')    router.push('/admin');
    else if (u.role === 'provider') router.push('/dashboard/provider');
    else router.push('/dashboard');
  };

  const register = async (payload: RegisterPayload) => {
    const { data } = await api.post('/auth/register', payload);
    const { user: u, accessToken, refreshToken } = data.data;
    saveTokens({ accessToken, refreshToken });
    setUser(u);
    router.push('/dashboard');
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    clearTokens();
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
