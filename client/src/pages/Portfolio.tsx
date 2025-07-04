import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, TrendingUp, ArrowUpIcon, ArrowDownIcon, Plus, DollarSign, Loader2 } from "lucide-react";
import { type Property, type Investment, type Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useICPWallet } from "@/components/ICPWalletProvider";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function Portfolio() {
  const { toast } = useToast();
  const { wallet } = useICPWallet();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [sellPercentage, setSellPercentage] = useState("");
  
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: investments = [], isLoading: investmentsLoading } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Sell investment mutation
  const sellInvestmentMutation = useMutation({
    mutationFn: async ({ investmentId, percentage }: { investmentId: number; percentage: number }) => {
      const investment = investments.find(inv => inv.id === investmentId);
      if (!investment) throw new Error("Investment not found");
      
      const sellAmount = Math.floor((investment.tokensOwned * percentage) / 100);
      const saleValue = Math.floor((parseFloat(investment.currentValue) * percentage) / 100);
      
      // Create sell transaction
      await apiRequest('POST', '/api/transactions', {
        userId: investment.userId,
        propertyId: investment.propertyId,
        type: 'sale',
        amount: saleValue.toString(),
        tokens: sellAmount,
      });

      // Update investment (mark as sold if 100% or update current value)
      if (percentage === 100) {
        await apiRequest('PATCH', `/api/investments/${investmentId}`, {
          isActive: false,
          currentValue: "0"
        });
      } else {
        const newCurrentValue = parseFloat(investment.currentValue) - saleValue;
        await apiRequest('PATCH', `/api/investments/${investmentId}`, {
          currentValue: newCurrentValue.toString()
        });
      }

      return { saleValue, tokensOwned: sellAmount, investmentId };
    },
    onSuccess: (data) => {
      toast({
        title: "Sale Successful",
        description: `Sold ${data.tokensOwned} tokens for $${data.saleValue.toLocaleString()}. Funds added to your wallet.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      setSellDialogOpen(false);
      setSelectedInvestment(null);
      setSellPercentage("");
    },
    onError: (error: any) => {
      toast({
        title: "Sale Failed",
        description: error.message || "Failed to sell investment",
        variant: "destructive",
      });
    }
  });

  // Real portfolio investments from API with property details
  const portfolioInvestments = investments
    .filter(inv => inv.userId === 1) // Filter by current user (in real app, use authenticated user)
    .map(investment => {
      const property = properties.find(p => p.id === investment.propertyId);
      const investmentAmount = parseFloat(investment.investmentAmount);
      const currentValue = parseFloat(investment.currentValue);
      const returns = currentValue - investmentAmount;
      const returnsPercentage = investmentAmount > 0 ? (returns / investmentAmount) * 100 : 0;
      
      return {
        ...investment,
        property,
        investmentAmount,
        currentValue,
        returns,
        returnsPercentage
      };
    })
    .filter(inv => inv.property); // Only include investments where property is found

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

  const handleViewProperty = (property: Property | undefined) => {
    if (!property) {
      toast({
        title: "Error",
        description: "Property not found",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedProperty(property);
    toast({
      title: "Property Details",
      description: `Viewing ${property.title} details`,
    });
    
    // In a real app, this would navigate to property details page
    // For now, we'll show property info in the toast
    setTimeout(() => {
      toast({
        title: property.title,
        description: `${property.description || 'No description available'} - Expected ROI: ${property.expectedROI}%`,
      });
    }, 1000);
  };

  const handleSellTokens = (investment: any) => {
    const property = properties.find(p => p.id === investment.propertyId);
    if (!property) {
      toast({
        title: "Error",
        description: "Property not found",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedInvestment(investment);
    setSellDialogOpen(true);
  };

  const handleSellConfirm = () => {
    if (!selectedInvestment || !sellPercentage) {
      toast({
        title: "Error",
        description: "Please enter a valid percentage to sell",
        variant: "destructive",
      });
      return;
    }

    const percentage = parseFloat(sellPercentage);
    if (percentage <= 0 || percentage > 100) {
      toast({
        title: "Error", 
        description: "Percentage must be between 1 and 100",
        variant: "destructive",
      });
      return;
    }

    sellInvestmentMutation.mutate({
      investmentId: selectedInvestment.id,
      percentage
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

        {/* Sell Investment Dialog */}
        <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sell Investment</DialogTitle>
              <DialogDescription>
                {selectedInvestment && (
                  <>
                    Sell tokens from your investment in {selectedInvestment.property?.title}.
                    <br />
                    Current Value: {formatCurrency(selectedInvestment.currentValue)}
                    <br />
                    Tokens Owned: {selectedInvestment.tokensOwned.toLocaleString()}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="sellPercentage">Percentage to Sell (%)</Label>
                <Input
                  id="sellPercentage"
                  type="number"
                  min="1"
                  max="100"
                  value={sellPercentage}
                  onChange={(e) => setSellPercentage(e.target.value)}
                  placeholder="Enter percentage (1-100)"
                  className="mt-1"
                />
              </div>
              
              {sellPercentage && selectedInvestment && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div>Tokens to sell: {Math.floor((selectedInvestment.tokensOwned * parseFloat(sellPercentage)) / 100).toLocaleString()}</div>
                    <div>Sale amount: {formatCurrency(Math.floor((selectedInvestment.currentValue * parseFloat(sellPercentage)) / 100))}</div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSellDialogOpen(false)}
                disabled={sellInvestmentMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSellConfirm}
                disabled={sellInvestmentMutation.isPending || !sellPercentage}
                className="bg-red-600 hover:bg-red-700"
              >
                {sellInvestmentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Selling...
                  </>
                ) : (
                  'Confirm Sale'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
