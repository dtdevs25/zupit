import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserAccount, AllowanceCheckResult, AdminMetrics } from '../types/auth';

interface AuthContextType {
  user: UserAccount | null;
  token: string | null;
  allowance: AllowanceCheckResult | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  quickLoginMaster: () => Promise<void>;
  simulateUpgrade: (planType?: 'pro' | 'basic' | 'master' | 'unlimited', addCredits?: number) => Promise<void>;
  refreshAuth: () => Promise<void>;
  isMaster: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'quizpop_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [user, setUser] = useState<UserAccount | null>(null);
  const [allowance, setAllowance] = useState<AllowanceCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAllowance(data.allowance);
      } else {
        // Expired or invalid
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setAllowance(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token, fetchCurrentUser]);

  const login = async (email: string, password = 'senha') => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao entrar.');
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setAllowance(data.allowance);
  };

  const register = async (name: string, email: string, password = 'senha') => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao cadastrar.');
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setAllowance(data.allowance);
  };

  const quickLoginMaster = async () => {
    const res = await fetch('/api/auth/quick-master', {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao logar como master.');
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setAllowance(data.allowance);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAllowance(null);
  };

  const simulateUpgrade = async (planType?: 'pro' | 'basic' | 'master' | 'unlimited', addCredits?: number) => {
    if (!token) return;
    const res = await fetch('/api/auth/simulate-upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ planType, addCredits }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setAllowance(data.allowance);
    }
  };

  const refreshAuth = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  const isMaster = user?.role === 'master' || user?.email.toLowerCase() === 'dani.dk.santos@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        allowance,
        isLoading,
        login,
        register,
        logout,
        quickLoginMaster,
        simulateUpgrade,
        refreshAuth,
        isMaster,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
