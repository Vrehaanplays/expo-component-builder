import { createContext, useContext, type ReactNode } from 'react';
import { useAuth, type UseAuth } from '@/hooks/use-auth';

const AuthContext = createContext<UseAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
