import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PortfolioChart from "@/components/charts/PortfolioChart";
import AssetAllocationChart from "@/components/charts/AssetAllocationChart";
import { TrendingUp, Building2, DollarSign, Wallet, ArrowUpIcon } from "lucide-react";

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
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

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
    <div className="min-h-screen bg-white dark:bg-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Investment Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track your portfolio performance and manage your investments
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-foreground/80 text-sm font-medium">Total Portfolio Value</p>
                  <p className="text-3xl font-bold">{formatCurrency(dashboardData?.totalPortfolioValue || 0)}</p>
                  <p className="text-primary-foreground/80 text-sm flex items-center mt-2">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    {formatPercentage(dashboardData?.avgROI || 0)} this month
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary-foreground/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-secondary to-secondary/80 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-foreground/80 text-sm font-medium">Active Properties</p>
                  <p className="text-3xl font-bold">{dashboardData?.activeProperties || 0}</p>
                  <p className="text-secondary-foreground/80 text-sm flex items-center mt-2">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    2 new this month
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-secondary-foreground/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-accent to-accent/80 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-accent-foreground/80 text-sm font-medium">Monthly Returns</p>
                  <p className="text-3xl font-bold">{formatCurrency(dashboardData?.monthlyReturns || 0)}</p>
                  <p className="text-accent-foreground/80 text-sm flex items-center mt-2">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    +8.2% vs last month
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-accent-foreground/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Token Balance</p>
                  <p className="text-3xl font-bold">{(dashboardData?.tokenBalance || 0).toLocaleString()}</p>
                  <p className="text-purple-200 text-sm flex items-center mt-2">
                    <Wallet className="h-4 w-4 mr-1" />
                    ETH Balance
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Portfolio Performance
                <Tabs defaultValue="1M" className="w-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="1M">1M</TabsTrigger>
                    <TabsTrigger value="3M">3M</TabsTrigger>
                    <TabsTrigger value="1Y">1Y</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PortfolioChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <AssetAllocationChart totalValue={dashboardData?.totalPortfolioValue || 0} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(!dashboardData?.recentTransactions || dashboardData.recentTransactions.length === 0) ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent transactions found.
                </p>
              ) : (
                dashboardData.recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mr-4">
                        <ArrowUpIcon className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{transaction?.type || 'Unknown Transaction'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Property Transaction</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(parseFloat(transaction?.amount || '0'))}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction?.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
