import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Principal } from '@dfinity/principal';
import { icpClient } from '@/lib/icp-client';

interface ICPContextType {
  isAuthenticated: boolean;
  principal: Principal | null;
  isConnecting: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  balance: number;
}

const ICPContext = createContext<ICPContextType | undefined>(undefined);

// Create a dedicated query client for ICP
const icpQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      retry: (failureCount, error) => {
        if (error?.message?.includes('Not authenticated')) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

interface ICPProviderProps {
  children: ReactNode;
}

export function ICPProvider({ children }: ICPProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance] = useState(50000); // Mock balance for demo

  useEffect(() => {
    // Skip automatic auth check to prevent Principal validation errors during init
    // User can manually login when needed
    console.log('ICP Provider initialized, login available');
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await icpClient.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userPrincipal = await icpClient.getPrincipal();
        setPrincipal(userPrincipal);
      }
    } catch (error) {
      console.warn('Auth status check failed:', error);
      // Reset to unauthenticated state on error
      setIsAuthenticated(false);
      setPrincipal(null);
    }
  };

  const login = async () => {
    setIsConnecting(true);
    try {
      const userPrincipal = await icpClient.login();
      if (userPrincipal) {
        setIsAuthenticated(true);
        setPrincipal(userPrincipal);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const logout = async () => {
    try {
      await icpClient.logout();
      setIsAuthenticated(false);
      setPrincipal(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value: ICPContextType = {
    isAuthenticated,
    principal,
    isConnecting,
    login,
    logout,
    balance,
  };

  return (
    <QueryClientProvider client={icpQueryClient}>
      <ICPContext.Provider value={value}>
        {children}
      </ICPContext.Provider>
    </QueryClientProvider>
  );
}

export const useICP = () => {
  const context = useContext(ICPContext);
  if (context === undefined) {
    throw new Error('useICP must be used within an ICPProvider');
  }
  return context;
};