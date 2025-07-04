import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ICPProvider } from "@/components/ICPProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Marketplace from "@/pages/ICPMarketplace";
import Dashboard from "@/pages/Dashboard";
import Portfolio from "@/pages/Portfolio";
import Governance from "@/pages/Governance";
import Recommendations from "@/pages/Recommendations";
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
        <Route path="/recommendations" component={Recommendations} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ICPProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </ICPProvider>
    </ErrorBoundary>
  );
}

export default App;
