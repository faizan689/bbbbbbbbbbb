import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, TrendingUp, ArrowUpIcon, ArrowDownIcon, Plus, DollarSign } from "lucide-react";
import { type Property, type Investment, type Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Portfolio() {
  const { toast } = useToast();
  
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: investments = [] } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Mock portfolio investments (in real app, these would be filtered by user)
  const portfolioInvestments = [
    {
      id: 1,
      property: properties.find(p => p.title.includes("Manhattan")) || properties[0],
      tokensOwned: 1250,
      investmentAmount: 12500,
      currentValue: 14275,
      returns: 1775,
      returnsPercentage: 14.2
    },
    {
      id: 2,
      property: properties.find(p => p.title.includes("Downtown")) || properties[1],
      tokensOwned: 800,
      investmentAmount: 8000,
      currentValue: 8944,
      returns: 944,
      returnsPercentage: 11.8
    },
    {
      id: 3,
      property: properties.find(p => p.title.includes("Garden")) || properties[4],
      tokensOwned: 450,
      investmentAmount: 4500,
      currentValue: 5045,
      returns: 545,
      returnsPercentage: 12.1
    }
  ];

  // Mock recent transactions
  const recentTransactions = [
    {
      id: 1,
      type: "Token Purchase",
      property: "Manhattan Luxury Residences",
      amount: "+250 RTC",
      date: "2 days ago",
      icon: Plus,
      color: "text-secondary"
    },
    {
      id: 2,
      type: "Dividend Payment",
      property: "Downtown Business Center",
      amount: "+$127.50",
      date: "5 days ago",
      icon: DollarSign,
      color: "text-accent"
    },
    {
      id: 3,
      type: "Token Sale",
      property: "Oceanview Condominiums",
      amount: "-150 RTC",
      date: "1 week ago",
      icon: TrendingUp,
      color: "text-primary"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleViewProperty = (property: Property) => {
    toast({
      title: "Property Details",
      description: `Viewing details for ${property?.title || 'property'}. This would open a detailed property view.`,
    });
  };

  const handleSellTokens = (investment: any) => {
    toast({
      title: "Sell Tokens",
      description: `Mock: Selling tokens for ${investment.property?.title || 'property'}. This would open a sell dialog.`,
    });
  };

  const totalPortfolioValue = portfolioInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalInvested = portfolioInvestments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
  const totalReturns = totalPortfolioValue - totalInvested;
  const totalReturnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Portfolio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage your real estate investments and track performance
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatCurrency(totalPortfolioValue)}
              </div>
              <div className="flex items-center text-sm">
                <ArrowUpIcon className="h-4 w-4 text-secondary mr-1" />
                <span className="text-secondary font-medium">
                  {formatCurrency(totalReturns)} ({totalReturnsPercentage.toFixed(1)}%)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatCurrency(totalInvested)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Across {portfolioInvestments.length} properties
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {portfolioInvestments.reduce((sum, inv) => sum + inv.tokensOwned, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                RTC Tokens owned
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Holdings Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Tokens Owned</TableHead>
                    <TableHead>Investment</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>Returns</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolioInvestments.map((investment) => (
                    <TableRow key={investment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell>
                        <div className="flex items-center">
                          <img 
                            src={investment.property?.imageUrl} 
                            alt={investment.property?.title}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {investment.property?.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {investment.property?.location}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {investment.tokensOwned.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(investment.investmentAmount)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(investment.currentValue)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <ArrowUpIcon className="h-4 w-4 text-secondary mr-1" />
                          <span className="text-secondary font-medium">
                            {formatCurrency(investment.returns)} ({investment.returnsPercentage}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewProperty(investment.property)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleSellTokens(investment)}
                          >
                            Sell
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => {
                const Icon = transaction.icon;
                return (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mr-4">
                        <Icon className={`h-5 w-5 ${transaction.color}`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {transaction.type}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.property}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${transaction.color}`}>
                        {transaction.amount}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
