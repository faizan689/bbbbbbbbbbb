import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, TrendingUp, Shield, Target, ChevronRight, Sparkles } from "lucide-react";
import { useICPWallet } from "@/components/ICPWalletProvider";
import { useToast } from "@/hooks/use-toast";

interface PropertyRecommendation {
  property: {
    id: number;
    title: string;
    location: string;
    propertyType: string;
    totalValue: string;
    minInvestment: string;
    expectedROI: string;
    availableTokens: number;
    totalTokens: number;
    imageUrl: string;
    description: string;
  };
  score: number;
  reasons: string[];
  riskLevel: 'low' | 'medium' | 'high';
  matchPercentage: number;
}

interface UserProfile {
  preferredInvestmentRange: { min: number; max: number };
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredPropertyTypes: string[];
  preferredLocations: string[];
  investmentGoals: string[];
}

export default function AIRecommendations() {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const { wallet, investInProperty } = useICPWallet();
  const { toast } = useToast();

  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery<PropertyRecommendation[]>({
    queryKey: ["/api/recommendations"],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/recommendations/profile"],
  });

  const { data: explanation, isLoading: explanationLoading } = useQuery<{explanation: string}>({
    queryKey: ["/api/recommendations/explain", selectedProperty],
    enabled: selectedProperty !== null,
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleInvest = async (property: PropertyRecommendation['property']) => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your ICP wallet to invest",
        variant: "destructive",
      });
      return;
    }

    try {
      const minInvestment = parseFloat(property.minInvestment);
      await investInProperty(property.id, minInvestment);
      
      toast({
        title: "Investment Successful!",
        description: `You've invested ${formatCurrency(minInvestment)} in ${property.title}`,
      });
    } catch (error: any) {
      toast({
        title: "Investment Failed",
        description: error.message || "Failed to complete investment",
        variant: "destructive",
      });
    }
  };

  if (recommendationsLoading || profileLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI-Powered Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile Insights */}
      {userProfile && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Target className="h-5 w-5" />
              Your Investment Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Investment Range</p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {formatCurrency(userProfile.preferredInvestmentRange.min)} - {formatCurrency(userProfile.preferredInvestmentRange.max)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Risk Tolerance</p>
                <Badge variant="secondary" className="capitalize">
                  {userProfile.riskTolerance}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Preferred Types</p>
                <div className="flex flex-wrap gap-1">
                  {userProfile.preferredPropertyTypes.slice(0, 2).map((type) => (
                    <Badge key={type} variant="outline" className="text-xs capitalize">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Goals</p>
                <div className="flex flex-wrap gap-1">
                  {userProfile.investmentGoals.slice(0, 2).map((goal) => (
                    <Badge key={goal} variant="outline" className="text-xs">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI-Powered Property Recommendations
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Personalized recommendations based on your investment profile and market analysis
          </p>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No recommendations available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Make some investments to get personalized recommendations
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.property.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {rec.property.title}
                        </h3>
                        <Badge className={getRiskColor(rec.riskLevel)}>
                          {rec.riskLevel} risk
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          {rec.matchPercentage}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {rec.property.location} • {rec.property.propertyType}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          {rec.property.expectedROI}% ROI
                        </span>
                        <span>Min: {formatCurrency(rec.property.minInvestment)}</span>
                        <span className="text-gray-500">
                          {rec.property.availableTokens}/{rec.property.totalTokens} tokens available
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        Score: {rec.score}/100
                      </div>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                          style={{ width: `${rec.score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg p-3 mb-3">
                    <h4 className="font-medium text-sm text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-1">
                      <Brain className="h-4 w-4" />
                      Why this property matches you:
                    </h4>
                    <ul className="space-y-1">
                      {rec.reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-purple-800 dark:text-purple-200 flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleInvest(rec.property)}
                      disabled={!wallet.isConnected}
                      className="flex-1"
                    >
                      Invest {formatCurrency(rec.property.minInvestment)}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedProperty(rec.property.id)}
                      className="flex items-center gap-1"
                    >
                      AI Analysis
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Detailed AI Explanation */}
                  {selectedProperty === rec.property.id && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-purple-500">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-600" />
                        Detailed AI Analysis
                      </h5>
                      {explanationLoading ? (
                        <Skeleton className="h-20 w-full" />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {explanation?.explanation || "Analysis not available"}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}