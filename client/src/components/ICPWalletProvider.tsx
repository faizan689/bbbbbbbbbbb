import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

// Plug Wallet Integration
declare global {
  interface Window {
    ic?: {
      plug?: {
        isConnected: () => Promise<boolean>;
        createAgent: (args?: { whitelist?: string[] }) => Promise<any>;
        requestConnect: (args?: { whitelist?: string[] }) => Promise<boolean>;
        disconnect: () => Promise<void>;
        principal: Principal;
        agent: any;
        accountId: string;
      };
    };
  }
}

interface ICPWalletState {
  isConnected: boolean;
  principal: Principal | null;
  accountId: string | null;
  walletType: 'plug' | 'stoic' | 'internet-identity' | null;
  balance: number;
  isConnecting: boolean;
}

interface ICPWalletContextType {
  wallet: ICPWalletState;
  connectPlug: () => Promise<void>;
  connectStoic: () => Promise<void>;
  connectInternetIdentity: () => Promise<void>;
  disconnect: () => Promise<void>;
  isWalletInstalled: (walletType: 'plug' | 'stoic') => boolean;
}

const ICPWalletContext = createContext<ICPWalletContextType | undefined>(undefined);

const CANISTER_IDS = [
  import.meta.env.VITE_PROPERTY_CANISTER_ID || 'rrkah-fqaaa-aaaaa-aaaaq-cai',
  import.meta.env.VITE_INVESTMENT_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai',
  import.meta.env.VITE_GOVERNANCE_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai',
  import.meta.env.VITE_USER_CANISTER_ID || 'renrk-eyaaa-aaaaa-aaada-cai',
];

export function ICPWalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<ICPWalletState>({
    isConnected: false,
    principal: null,
    accountId: null,
    walletType: null,
    balance: 0,
    isConnecting: false,
  });

  const [authClient, setAuthClient] = useState<AuthClient | null>(null);

  useEffect(() => {
    // Initialize auth client for Internet Identity
    AuthClient.create().then(client => {
      setAuthClient(client);
      
      // Check if already authenticated
      if (client.isAuthenticated()) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();
        
        setWallet(prev => ({
          ...prev,
          isConnected: true,
          principal,
          walletType: 'internet-identity',
          accountId: principal.toString(),
        }));
      }
    });

    // Check for existing Plug connection
    checkPlugConnection();
    
    // Check for existing Stoic connection
    checkStoicConnection();
  }, []);

  const checkPlugConnection = async () => {
    if (window.ic?.plug) {
      try {
        const isConnected = await window.ic.plug.isConnected();
        if (isConnected) {
          const principal = window.ic.plug.principal;
          const accountId = window.ic.plug.accountId;
          
          setWallet(prev => ({
            ...prev,
            isConnected: true,
            principal,
            accountId,
            walletType: 'plug',
          }));
        }
      } catch (error) {
        console.error('Error checking Plug connection:', error);
      }
    }
  };

  const checkStoicConnection = () => {
    // Check localStorage for Stoic connection
    const stoicIdentity = localStorage.getItem('_scApp');
    if (stoicIdentity) {
      try {
        const identity = JSON.parse(stoicIdentity);
        if (identity.principal) {
          setWallet(prev => ({
            ...prev,
            isConnected: true,
            principal: Principal.fromText(identity.principal),
            accountId: identity.principal,
            walletType: 'stoic',
          }));
        }
      } catch (error) {
        console.error('Error checking Stoic connection:', error);
      }
    }
  };

  const connectPlug = async () => {
    if (!window.ic?.plug) {
      throw new Error('Plug wallet is not installed. Please install Plug from https://plugwallet.ooo/');
    }

    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      const connected = await window.ic.plug.requestConnect({
        whitelist: CANISTER_IDS,
      });

      if (connected) {
        await window.ic.plug.createAgent({ whitelist: CANISTER_IDS });
        const principal = window.ic.plug.principal;
        const accountId = window.ic.plug.accountId;

        setWallet(prev => ({
          ...prev,
          isConnected: true,
          principal,
          accountId,
          walletType: 'plug',
          isConnecting: false,
        }));
      } else {
        throw new Error('Failed to connect to Plug wallet');
      }
    } catch (error) {
      setWallet(prev => ({ ...prev, isConnecting: false }));
      throw error;
    }
  };

  const connectStoic = async () => {
    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      // Stoic wallet connection via popup window
      const stoicUrl = `https://www.stoicwallet.com/connect?dapp=${encodeURIComponent(window.location.origin)}`;
      
      const popup = window.open(stoicUrl, 'stoic-connect', 'width=420,height=600');
      
      return new Promise<void>((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            checkStoicConnection();
            
            // Check if connection was successful
            setTimeout(() => {
              if (wallet.walletType === 'stoic') {
                setWallet(prev => ({ ...prev, isConnecting: false }));
                resolve();
              } else {
                setWallet(prev => ({ ...prev, isConnecting: false }));
                reject(new Error('Stoic wallet connection was cancelled'));
              }
            }, 1000);
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          if (!popup?.closed) {
            popup?.close();
            clearInterval(checkClosed);
            setWallet(prev => ({ ...prev, isConnecting: false }));
            reject(new Error('Stoic wallet connection timeout'));
          }
        }, 300000);
      });
    } catch (error) {
      setWallet(prev => ({ ...prev, isConnecting: false }));
      throw error;
    }
  };

  const connectInternetIdentity = async () => {
    if (!authClient) {
      throw new Error('Auth client not initialized');
    }

    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      const isLocal = process.env.NODE_ENV === 'development';
      const identityProvider = isLocal 
        ? `http://127.0.0.1:4943?canisterId=${process.env.VITE_INTERNET_IDENTITY_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai'}`
        : 'https://identity.ic0.app';

      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider,
          onSuccess: () => {
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal();

            setWallet(prev => ({
              ...prev,
              isConnected: true,
              principal,
              accountId: principal.toString(),
              walletType: 'internet-identity',
              isConnecting: false,
            }));

            resolve();
          },
          onError: (error) => {
            setWallet(prev => ({ ...prev, isConnecting: false }));
            reject(error);
          },
        });
      });
    } catch (error) {
      setWallet(prev => ({ ...prev, isConnecting: false }));
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      if (wallet.walletType === 'plug' && window.ic?.plug) {
        await window.ic.plug.disconnect();
      } else if (wallet.walletType === 'stoic') {
        localStorage.removeItem('_scApp');
      } else if (wallet.walletType === 'internet-identity' && authClient) {
        await authClient.logout();
      }

      setWallet({
        isConnected: false,
        principal: null,
        accountId: null,
        walletType: null,
        balance: 0,
        isConnecting: false,
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const isWalletInstalled = (walletType: 'plug' | 'stoic') => {
    switch (walletType) {
      case 'plug':
        return !!window.ic?.plug;
      case 'stoic':
        // Stoic is web-based, so always "available"
        return true;
      default:
        return false;
    }
  };

  return (
    <ICPWalletContext.Provider
      value={{
        wallet,
        connectPlug,
        connectStoic,
        connectInternetIdentity,
        disconnect,
        isWalletInstalled,
      }}
    >
      {children}
    </ICPWalletContext.Provider>
  );
}

export const useICPWallet = () => {
  const context = useContext(ICPWalletContext);
  if (!context) {
    throw new Error('useICPWallet must be used within an ICPWalletProvider');
  }
  return context;
};