import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUserMe, useLogout } from '../hooks/useAuth';

export interface AuthUser {
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface MePayloadLike extends AuthUser {
  user?: AuthUser;
  data?: AuthUser & { user?: AuthUser };
}

interface AuthContextValue {
  user: AuthUser | null;
  role: string | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  syncToken: (newToken: string | null) => void;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const extractUser = (payload: unknown): AuthUser | null => {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as MePayloadLike;
  return p.user ?? p.data?.user ?? p.data ?? p;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const meQuery = useUserMe();
  const logoutMutation = useLogout();

  const syncToken = useCallback(
    (newToken: string | null) => {
      if (newToken) {
        localStorage.setItem('token', newToken);
      } else {
        localStorage.removeItem('token');
      }
      setToken(newToken);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      if (newToken) {
        void meQuery.refetch();
      }
    },
    [queryClient, meQuery]
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        setToken(e.newValue);
        queryClient.invalidateQueries({ queryKey: ['me'] });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [queryClient]);

  useEffect(() => {
    if (meQuery.isError) {
      localStorage.removeItem('token');
      setToken(null);
    }
  }, [meQuery.isError]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setToken(null);
    }
  }, [logoutMutation]);

  const refetchUser = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['me'] });
    void meQuery.refetch();
  }, [queryClient, meQuery]);

  const extracted = extractUser(meQuery.data);
  const user: AuthUser | null =
    extracted && (extracted.id || extracted.email || extracted.role) ? extracted : null;

  const isAuthenticated = Boolean(token && user && !meQuery.isError);
  const isLoading = Boolean(token) && (meQuery.isLoading || meQuery.isFetching);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        isAuthenticated,
        isLoading,
        token,
        syncToken,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth يجب أن يُستخدم داخل AuthProvider');
  }
  return ctx;
};