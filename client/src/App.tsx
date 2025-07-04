import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { ICPWalletProvider } from "@/components/ICPWalletProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Marketplace from "@/pages/Marketplace";
import Dashboard from "@/pages/Dashboard";
import Portfolio from "@/pages/Portfolio";
import Governance from "@/pages/Governance";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/governance" component={Governance} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <WalletProvider>
            <ICPWalletProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </ICPWalletProvider>
          </WalletProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
