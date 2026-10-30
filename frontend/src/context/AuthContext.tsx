'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, saveAuth, clearAuth, getStoredUser, type AuthToken, type UserRole } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: AuthToken | null;
  role: UserRole | null;
  isLoading: boolean;
  studentLogin: (demoId: string, pin: string) => Promise<void>;
  adminLogin: (adminId: string, password: string) => Promise<void>;
  aicteAdminLogin: (adminId: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    // Restore the persisted session after hydration to keep server and client markup consistent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setUser(stored);
    setIsLoading(false);
  }, []);

  const studentLogin = useCallback(async (demoId: string, pin: string) => {
    const auth: AuthToken = await api.auth.studentLogin(demoId, pin);
    saveAuth(auth);
    setUser(auth);
    router.push('/student/dashboard');
  }, [router]);

  const adminLogin = useCallback(async (adminId: string, password: string) => {
    const auth: AuthToken = await api.auth.adminLogin(adminId, password);
    saveAuth(auth);
    setUser(auth);
    router.push('/admin/overview');
  }, [router]);

  const aicteAdminLogin = useCallback(async (adminId: string, password: string) => {
    const auth: AuthToken = await api.auth.aicteAdminLogin(adminId, password);
    saveAuth(auth);
    setUser(auth);
    router.push('/aicte/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, isLoading, studentLogin, adminLogin, aicteAdminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
