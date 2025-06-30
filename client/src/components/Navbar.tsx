import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Navbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleWalletConnect = () => {
    toast({
      title: "Wallet Connection",
      description: "Mock wallet connection functionality. In production, this would integrate with ICP wallet.",
    });
  };

  const navItems = [
    { path: "/marketplace", label: "Marketplace" },
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
                  <a className={`px-3 py-2 text-sm font-medium transition-colors ${
                    location === item.path
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary"
                  }`}>
                    {item.label}
                  </a>
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
            <Button onClick={handleWalletConnect} className="bg-primary hover:bg-primary/90">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
