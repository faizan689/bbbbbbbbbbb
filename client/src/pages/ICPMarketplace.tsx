import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Building2, MapPin, TrendingUp, DollarSign, Users, ArrowRight, Loader2 } from "lucide-react";
import { useICP } from "@/components/ICPProvider";
import { icpClient } from "@/lib/icp-client";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: number;
  title: string;
  description: string;
  location: string;
  propertyType: string;
  totalValue: string;
  totalTokens: number;
  availableTokens: number;
  expectedROI: string;
  minInvestment: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date | null;
}

export default function ICPMarketplace() {
  const { isAuthenticated, login } = useICP();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch properties from ICP canisters
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['icp-properties'],
    queryFn: async () => {
      const icpProperties = await icpClient.getProperties();
      return icpProperties.map((prop: any) => ({
        id: Number(prop.id),
        title: prop.title,
        description: prop.description,
        location: prop.location,
        propertyType: prop.property_type,
        totalValue: (Number(prop.total_value) / 100).toString(),
        totalTokens: Number(prop.total_tokens),
        availableTokens: Number(prop.available_tokens),
        expectedROI: prop.expected_roi,
        minInvestment: (Number(prop.min_investment) / 100).toString(),
        imageUrl: prop.image_url,
        isActive: prop.is_active,
        createdAt: new Date(Number(prop.created_at) / 1000000),
      }));
    },
    staleTime: 30000,
  });

  // Investment mutation for ICP
  const investMutation = useMutation({
    mutationFn: async ({ propertyId, amount }: { propertyId: number; amount: number }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }
      
      const property = properties.find(p => p.id === propertyId);
      if (!property) {
        throw new Error('Property not found');
      }
      
      const tokenPrice = parseFloat(property.totalValue) / property.totalTokens;
      const tokensToInvest = Math.floor(amount / tokenPrice);
      
      return icpClient.createInvestment(propertyId, tokensToInvest, amount);
    },
    onSuccess: () => {
      toast({
        title: "Investment Successful",
        description: "Your investment has been recorded on the ICP blockchain!",
      });
      queryClient.invalidateQueries({ queryKey: ['icp-properties'] });
      queryClient.invalidateQueries({ queryKey: ['icp-investments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Investment Failed",
        description: error.message || "Unable to process investment",
        variant: "destructive",
      });
    },
  });

  const handleInvest = async (propertyId: number) => {
    if (!isAuthenticated) {
      await login();
      return;
    }
    
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    
    const amount = parseFloat(property.minInvestment);
    investMutation.mutate({ propertyId, amount });
  };

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getTokenizationPercentage = (property: Property) => {
    return ((property.totalTokens - property.availableTokens) / property.totalTokens) * 100;
  };

  if (propertiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading properties from ICP blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            ICP Blockchain Marketplace
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Invest in tokenized real estate powered by Internet Computer blockchain technology
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center border-0 shadow-lg">
            <CardContent className="p-6">
              <Building2 className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {properties.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Properties Available</div>
            </CardContent>
          </Card>
          
          <Card className="text-center border-0 shadow-lg">
            <CardContent className="p-6">
              <DollarSign className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(properties.reduce((sum, p) => sum + parseFloat(p.totalValue), 0))}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
            </CardContent>
          </Card>
          
          <Card className="text-center border-0 shadow-lg">
            <CardContent className="p-6">
              <Users className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {properties.reduce((sum, p) => sum + p.totalTokens, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Tokens</div>
            </CardContent>
          </Card>
          
          <Card className="text-center border-0 shadow-lg">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-orange-600" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {properties.length > 0 ? 
                  (properties.reduce((sum, p) => sum + parseFloat(p.expectedROI), 0) / properties.length).toFixed(1) + '%'
                  : '0%'
                }
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Avg Expected ROI</div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="relative">
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                    {property.propertyType}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">
                    {property.expectedROI}% ROI
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                    {property.description}
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Value</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(property.totalValue)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Min Investment</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(property.minInvestment)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Tokenization</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getTokenizationPercentage(property).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={getTokenizationPercentage(property)} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {property.availableTokens.toLocaleString()} of {property.totalTokens.toLocaleString()} tokens available
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => handleInvest(property.id)}
                  disabled={investMutation.isPending || property.availableTokens === 0}
                >
                  {investMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : property.availableTokens === 0 ? (
                    'Fully Tokenized'
                  ) : (
                    <>
                      Invest {formatCurrency(property.minInvestment)}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {properties.length === 0 && !propertiesLoading && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Properties Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Properties will appear here once they're deployed to the ICP blockchain.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}