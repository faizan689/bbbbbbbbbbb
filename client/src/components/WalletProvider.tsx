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
    network: "Ethereum Mainnet",
    isConnecting: false,
  });

  // Simulate checking for existing wallet connection on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      // Check for saved wallet connection
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

      // Use the provided Ethereum address
      const ethAddress = "0x95868a76A768Ea791B28a4866106f3743dbEA2e8";
      const mockBalance = Math.floor(Math.random() * 10000) + 5000;

      const connectionData = {
        address: ethAddress,
        balance: mockBalance,
      };

      setWallet(prev => ({
        ...prev,
        isConnected: true,
        address: ethAddress,
        balance: mockBalance,
        isConnecting: false,
      }));

      // Save connection state
      localStorage.setItem("wallet_connection", JSON.stringify(connectionData));

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${ethAddress.substring(0, 8)}... with ${mockBalance.toLocaleString()} ETH`,
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