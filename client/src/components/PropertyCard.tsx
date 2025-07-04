import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, MapPin, TrendingUp, Wallet } from "lucide-react";
import { type Property } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useICPWallet } from "@/components/ICPWalletProvider";
import { queryClient } from "@/lib/queryClient";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { toast } = useToast();
  const { wallet, investInProperty } = useICPWallet();
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isInvesting, setIsInvesting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseFloat(amount));
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "residential":
        return "bg-secondary/10 text-secondary";
      case "commercial":
        return "bg-accent/10 text-accent";
      case "industrial":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300";
    }
  };

  const tokenProgress = property.totalTokens > 0 
    ? ((property.totalTokens - property.availableTokens) / property.totalTokens) * 100 
    : 0;

  const handleInvestmentSubmit = async () => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your ICP wallet to invest in properties.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(investmentAmount);
    const minInvestment = parseFloat(property.minInvestment);

    if (!amount || amount < minInvestment) {
      toast({
        title: "Invalid Investment Amount",
        description: `Minimum investment is ${formatCurrency(property.minInvestment)}.`,
        variant: "destructive",
      });
      return;
    }

    if (amount > wallet.balance) {
      toast({
        title: "Insufficient Balance",
        description: `Your wallet balance is ${wallet.balance.toLocaleString()} RTC.`,
        variant: "destructive",
      });
      return;
    }

    setIsInvesting(true);
    try {
      await investInProperty(property.id, amount);
      
      toast({
        title: "Investment Successful! 🎉",
        description: `Successfully invested ${formatCurrency(investmentAmount)} in ${property.title}`,
      });

      // Reset form and close dialog
      setInvestmentAmount("");
      setIsDialogOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
    } catch (error) {
      toast({
        title: "Investment Failed",
        description: "There was an error processing your investment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInvesting(false);
    }
  };

  const maxTokens = Math.floor(wallet.balance / 100); // Assuming 100 USD per token
  const tokensFromAmount = investmentAmount ? Math.floor(parseFloat(investmentAmount) / 100) : 0;

  return (
    <div className="property-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
        <img 
          src={property.imageUrl} 
          alt={property.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&crop=center`;
          }}
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-1">
            {property.title}
          </h3>
          <Badge className={getPropertyTypeColor(property.propertyType)}>
            {property.propertyType}
          </Badge>
        </div>

        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-2">
          {property.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(property.totalValue)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Expected ROI</div>
            <div className="text-lg font-semibold text-secondary flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {property.expectedROI}%
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400">Tokens Available</span>
            <span className="text-gray-900 dark:text-white">
              {property.availableTokens.toLocaleString()} / {property.totalTokens.toLocaleString()}
            </span>
          </div>
          <Progress value={tokenProgress} className="h-2" />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={property.availableTokens === 0}
            >
              {property.availableTokens === 0 
                ? "Fully Funded" 
                : `Invest Now - Min ${formatCurrency(property.minInvestment)}`
              }
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Invest in {property.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Property Type</Label>
                  <p className="font-medium">{property.propertyType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expected ROI</Label>
                  <p className="font-medium text-green-600">{property.expectedROI}%</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Min Investment</Label>
                  <p className="font-medium">{formatCurrency(property.minInvestment)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Available Tokens</Label>
                  <p className="font-medium">{property.availableTokens.toLocaleString()}</p>
                </div>
              </div>
              
              {wallet.isConnected ? (
                <>
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span>Wallet Balance:</span>
                      <span className="font-medium">{wallet.balance.toLocaleString()} RTC</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Connected as:</span>
                      <span className="font-medium">{wallet.walletType}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="investment-amount">Investment Amount (USD)</Label>
                    <Input
                      id="investment-amount"
                      type="number"
                      placeholder={`Min: ${formatCurrency(property.minInvestment)}`}
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      min={parseFloat(property.minInvestment)}
                      max={wallet.balance}
                    />
                    {tokensFromAmount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        This will purchase approximately {tokensFromAmount} tokens
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleInvestmentSubmit}
                    disabled={isInvesting || !investmentAmount || parseFloat(investmentAmount) < parseFloat(property.minInvestment)}
                    className="w-full"
                  >
                    {isInvesting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Investment...
                      </>
                    ) : (
                      `Invest ${investmentAmount ? formatCurrency(investmentAmount) : ''}`
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Connect your ICP wallet to invest in this property
                  </p>
                  <Button 
                    onClick={() => setIsDialogOpen(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Connect Wallet First
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
