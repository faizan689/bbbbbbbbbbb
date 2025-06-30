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
                  <p className="text-purple-100 text-sm font-medium mb-2">Token Balance</p>
                  <p className="text-3xl font-bold text-white mb-3">{(dashboardData?.tokenBalance || 0).toLocaleString()}</p>
                  <p className="text-purple-200 text-sm flex items-center">
                    <Wallet className="h-4 w-4 mr-1" />
                    ETH Balance
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

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {(!dashboardData?.recentTransactions || dashboardData.recentTransactions.length === 0) ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No recent transactions</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Your investment activity will appear here</p>
                </div>
              ) : (
                dashboardData.recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                        <ArrowUpIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-base">
                          {transaction?.type || 'Unknown Transaction'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Property Investment</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white text-lg">
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
