import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useICPWallet } from "@/components/ICPWalletProvider";
import { Moon, Sun, Wallet, ChevronDown, LogOut, Link2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import WalletConnectModal from "@/components/WalletConnectModal";
import { useState } from "react";

export default function Navbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { wallet: icpWallet, disconnect: disconnectICP } = useICPWallet();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const navItems = [
    { path: "/marketplace", label: "Marketplace" },
    { path: "/recommendations", label: "AI Recommendations" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/portfolio", label: "Portfolio" },
    { path: "/governance", label: "Governance" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold gradient-text">RealtyChain</h1>
              </div>
            </Link>
            <div className="hidden md:ml-10 md:flex space-x-8">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <span className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    location === item.path
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary"
                  }`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-lg"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            
{/* ICP Wallet Only */}
            {icpWallet.isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" className="flex items-center space-x-2">
                    <Link2 className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {icpWallet.accountId?.substring(0, 8)}...
                    </span>
                    <span className="text-xs bg-primary-foreground text-primary px-2 py-1 rounded">
                      {icpWallet.walletType?.toUpperCase()}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="p-3 border-b">
                    <div className="text-sm font-medium">ICP Wallet Connected</div>
                    <div className="text-xs text-muted-foreground">{icpWallet.accountId}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Type: {icpWallet.walletType}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Principal: {icpWallet.principal?.toString().substring(0, 20)}...
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={disconnectICP} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect ICP Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => setWalletModalOpen(true)}
                disabled={icpWallet.isConnecting}
                className="bg-primary hover:bg-primary/90"
              >
                <Link2 className="h-4 w-4 mr-2" />
                {icpWallet.isConnecting ? "Connecting..." : "Connect ICP"}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* ICP Wallet Connect Modal */}
      <WalletConnectModal
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
      />
    </nav>
  );
}
