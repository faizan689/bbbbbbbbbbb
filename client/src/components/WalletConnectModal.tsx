import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, ExternalLink, CheckCircle } from 'lucide-react';
import { useICPWallet } from './ICPWalletProvider';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WalletOption {
  id: 'plug' | 'stoic' | 'internet-identity';
  name: string;
  description: string;
  icon: string;
  installUrl?: string;
  features: string[];
  recommended?: boolean;
}

const walletOptions: WalletOption[] = [
  {
    id: 'plug',
    name: 'Plug Wallet',
    description: 'Most popular ICP wallet with DeFi features',
    icon: '🔌',
    installUrl: 'https://plugwallet.ooo/',
    features: ['Token Management', 'DeFi Integration', 'Browser Extension'],
    recommended: true,
  },
  {
    id: 'stoic',
    name: 'Stoic Wallet',
    description: 'Web-based wallet, no installation required',
    icon: '🌐',
    features: ['Web-based', 'Multi-device', 'No Installation'],
  },
  {
    id: 'internet-identity',
    name: 'Internet Identity',
    description: 'Official ICP authentication system',
    icon: '🆔',
    features: ['Biometric Auth', 'Hardware Keys', 'Anonymous'],
  },
];

export default function WalletConnectModal({ open, onOpenChange }: WalletConnectModalProps) {
  const { wallet, connectPlug, connectStoic, connectInternetIdentity, isWalletInstalled } = useICPWallet();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnect = async (walletId: 'plug' | 'stoic' | 'internet-identity') => {
    setConnectingWallet(walletId);
    
    try {
      switch (walletId) {
        case 'plug':
          if (!isWalletInstalled('plug')) {
            toast({
              title: "Plug Wallet Not Found",
              description: "Please install Plug wallet first",
              variant: "destructive",
            });
            window.open('https://plugwallet.ooo/', '_blank');
            return;
          }
          await connectPlug();
          break;
        case 'stoic':
          await connectStoic();
          break;
        case 'internet-identity':
          await connectInternetIdentity();
          break;
      }
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletOptions.find(w => w.id === walletId)?.name}`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setConnectingWallet(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect ICP Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your Internet Computer wallet to access blockchain features, real estate tokenization, and governance voting.
          </p>
          
          <div className="space-y-3">
            {walletOptions.map((walletOption) => {
              const isInstalled = walletOption.id === 'stoic' || walletOption.id === 'internet-identity' || isWalletInstalled(walletOption.id as 'plug');
              const isConnecting = connectingWallet === walletOption.id;
              const isConnected = wallet.isConnected && wallet.walletType === walletOption.id;
              
              return (
                <Card key={walletOption.id} className="p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{walletOption.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{walletOption.name}</h3>
                          {walletOption.recommended && (
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                          {isConnected && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {walletOption.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {walletOption.features.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-3">
                      {!isInstalled && walletOption.installUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(walletOption.installUrl, '_blank')}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Install
                        </Button>
                      ) : isConnected ? (
                        <Button variant="default" size="sm" disabled className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleConnect(walletOption.id)}
                          disabled={isConnecting || !isInstalled}
                          size="sm"
                          className="text-xs"
                        >
                          {isConnecting ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Why connect a wallet?</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Invest in tokenized real estate properties</li>
              <li>• Participate in governance voting</li>
              <li>• Receive automated dividend distributions</li>
              <li>• Access blockchain-verified ownership records</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}