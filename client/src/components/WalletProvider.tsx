import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  network: string;
  isConnecting: boolean;
}

interface WalletContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    network: "Internet Computer",
    isConnecting: false,
  });

  // Simulate checking for existing wallet connection on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      // In a real ICP app, this would check for Internet Identity or other wallet connections
      const savedConnection = localStorage.getItem("wallet_connection");
      if (savedConnection) {
        const connectionData = JSON.parse(savedConnection);
        setWallet(prev => ({
          ...prev,
          isConnected: true,
          address: connectionData.address,
          balance: connectionData.balance,
        }));
      }
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock wallet connection - in production this would integrate with ICP wallets
      const mockAddress = `rdmx6-jaaaa-aaaah-qcaiq-cai`;
      const mockBalance = Math.floor(Math.random() * 10000) + 5000;

      const connectionData = {
        address: mockAddress,
        balance: mockBalance,
      };

      setWallet(prev => ({
        ...prev,
        isConnected: true,
        address: mockAddress,
        balance: mockBalance,
        isConnecting: false,
      }));

      // Save connection state
      localStorage.setItem("wallet_connection", JSON.stringify(connectionData));

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${mockAddress.substring(0, 8)}...`,
      });

      // Simulate balance updates every 30 seconds
      const balanceInterval = setInterval(() => {
        setWallet(prev => ({
          ...prev,
          balance: prev.balance + Math.floor(Math.random() * 100) - 50, // Random fluctuation
        }));
      }, 30000);

      // Store interval ID for cleanup
      (window as any).balanceInterval = balanceInterval;

    } catch (error) {
      setWallet(prev => ({ ...prev, isConnecting: false }));
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: 0,
      network: "Internet Computer",
      isConnecting: false,
    });

    localStorage.removeItem("wallet_connection");
    
    // Clear balance update interval
    if ((window as any).balanceInterval) {
      clearInterval((window as any).balanceInterval);
      delete (window as any).balanceInterval;
    }

    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected successfully.",
    });
  };

  return (
    <WalletContext.Provider value={{ wallet, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};