import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PortfolioChart from "@/components/charts/PortfolioChart";
import AssetAllocationChart from "@/components/charts/AssetAllocationChart";
import { TrendingUp, Building2, DollarSign, Wallet, ArrowUpIcon, Activity, RefreshCw, ExternalLink, TrendingDown } from "lucide-react";
import { useICPWallet } from "@/components/ICPWalletProvider";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Investment, type Transaction } from "@shared/schema";

interface DashboardData {
  totalPortfolioValue: number;
  activeProperties: number;
  monthlyReturns: number;
  tokenBalance: number;
  avgROI: number;
  totalReturns: number;
  recentTransactions: any[];
}

export default function Dashboard() {
  const { wallet, sellProperty } = useICPWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const { data: investments = [] } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const sellMutation = useMutation({
    mutationFn: sellProperty,
    onSuccess: (result: any) => {
      if (result && result.success) {
        toast({
          title: "Property Sold Successfully!",
          description: `Received ${formatCurrency(result.saleAmount)} in your ICP wallet. New balance: ${result.newBalance.toLocaleString()} RTC`,
        });
      } else {
        toast({
          title: "Property Sold!",
          description: "Your property has been sold successfully.",
        });
      }
      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error: any) => {
      toast({
        title: "Sale Failed",
        description: error.message || "Failed to sell property",
        variant: "destructive",
      });
    },
  });

  const handleSellProperty = async (investmentId: number) => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your ICP wallet to sell properties",
        variant: "destructive",
      });
      return;
    }

    try {
      await sellMutation.mutateAsync(investmentId);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Dashboard Unavailable
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Unable to load dashboard data. Please try again later.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Investment Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Track your portfolio performance and manage your investments with real-time data
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-blue-100 text-sm font-medium mb-2">Total Portfolio Value</p>
                  <p className="text-3xl font-bold text-white mb-3">{formatCurrency(dashboardData?.totalPortfolioValue || 0)}</p>
                  <p className="text-blue-200 text-sm flex items-center">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    {formatPercentage(dashboardData?.avgROI || 0)} this month
                  </p>
                </div>
                <div className="ml-4">
                  <TrendingUp className="h-8 w-8 text-blue-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-green-100 text-sm font-medium mb-2">Active Properties</p>
                  <p className="text-3xl font-bold text-white mb-3">{dashboardData?.activeProperties || 0}</p>
                  <p className="text-green-200 text-sm flex items-center">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    2 new this month
                  </p>
                </div>
                <div className="ml-4">
                  <Building2 className="h-8 w-8 text-green-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-orange-100 text-sm font-medium mb-2">Monthly Returns</p>
                  <p className="text-3xl font-bold text-white mb-3">{formatCurrency(dashboardData?.monthlyReturns || 0)}</p>
                  <p className="text-orange-200 text-sm flex items-center">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    +8.2% vs last month
                  </p>
                </div>
                <div className="ml-4">
                  <DollarSign className="h-8 w-8 text-orange-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-purple-100 text-sm font-medium mb-2">ICP Wallet Balance</p>
                  <p className="text-3xl font-bold text-white mb-3">{wallet.balance.toLocaleString()} RTC</p>
                  <p className="text-purple-200 text-sm flex items-center">
                    <Wallet className="h-4 w-4 mr-1" />
                    {wallet.isConnected ? `Connected (${wallet.walletType})` : 'Not Connected'}
                  </p>
                </div>
                <div className="ml-4">
                  <Wallet className="h-8 w-8 text-purple-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span>Portfolio Performance</span>
                <Tabs defaultValue="1M" className="w-auto">
                  <TabsList className="grid grid-cols-3 w-32">
                    <TabsTrigger value="1M" className="text-xs">1M</TabsTrigger>
                    <TabsTrigger value="3M" className="text-xs">3M</TabsTrigger>
                    <TabsTrigger value="1Y" className="text-xs">1Y</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <PortfolioChart />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <AssetAllocationChart totalValue={dashboardData?.totalPortfolioValue || 0} />
            </CardContent>
          </Card>
        </div>

        {/* ICP Wallet & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* ICP Wallet Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                ICP Wallet Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Connection Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${wallet.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {wallet.isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  <Badge variant={wallet.isConnected ? "default" : "secondary"}>
                    {wallet.walletType || 'None'}
                  </Badge>
                </div>
                
                {wallet.isConnected && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Wallet Balance</span>
                        <span className="font-semibold text-lg text-gray-900 dark:text-white">
                          {wallet.balance.toLocaleString()} RTC
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Account ID</span>
                        <span className="font-mono text-sm text-gray-900 dark:text-white truncate max-w-32">
                          {wallet.accountId}
                        </span>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on ICP Explorer
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Your Investments */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Your Investments
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {investments.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No investments yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Start investing in properties</p>
                  </div>
                ) : (
                  investments.slice(0, 3).map((investment) => (
                    <div key={investment.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Property #{investment.propertyId}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {investment.tokensOwned.toLocaleString()} tokens
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(parseFloat(investment.currentValue))}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => handleSellProperty(investment.id)}
                          disabled={sellMutation.isPending || !wallet.isConnected}
                        >
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {sellMutation.isPending ? 'Selling...' : 'Sell'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 text-xs"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                {investments.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full mt-3">
                    View All ({investments.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </div>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Activity will appear here</p>
                  </div>
                ) : (
                  transactions.slice(0, 4).map((transaction) => (
                    <div key={transaction.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'investment' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {transaction.type === 'investment' ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {transaction.type}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          Property #{transaction.propertyId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(parseFloat(transaction.amount))}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
