import { QueryClient } from "@tanstack/react-query";
import { icpClient } from "./icp-client";

// ICP-specific query functions that replace the REST API calls
export const icpQueryFunctions = {
  // Properties
  getProperties: () => icpClient.getProperties(),
  getProperty: (id: number) => icpClient.getProperty(id),
  
  // Investments (requires authentication)
  getInvestments: async () => {
    const principal = await icpClient.getPrincipal();
    if (!principal) throw new Error("Not authenticated");
    return icpClient.getUserInvestments(principal);
  },
  
  // Transactions (requires authentication)
  getTransactions: async () => {
    const principal = await icpClient.getPrincipal();
    if (!principal) throw new Error("Not authenticated");
    return icpClient.getUserTransactions(principal);
  },
  
  // Dashboard data (computed from investments)
  getDashboard: async () => {
    const principal = await icpClient.getPrincipal();
    if (!principal) throw new Error("Not authenticated");
    
    const [investments, transactions] = await Promise.all([
      icpClient.getUserInvestments(principal),
      icpClient.getUserTransactions(principal)
    ]);
    
    // Calculate dashboard metrics
    const totalPortfolioValue = investments.reduce((sum, inv) => 
      sum + parseFloat(inv.currentValue), 0
    );
    
    const totalInvestmentAmount = investments.reduce((sum, inv) => 
      sum + parseFloat(inv.investmentAmount), 0
    );
    
    const totalReturns = totalPortfolioValue - totalInvestmentAmount;
    const returnsPercentage = totalInvestmentAmount > 0 ? 
      (totalReturns / totalInvestmentAmount) * 100 : 0;
    
    const activeProperties = new Set(investments.map(inv => inv.propertyId)).size;
    
    return {
      totalPortfolioValue: Math.round(totalPortfolioValue),
      totalInvestmentAmount: Math.round(totalInvestmentAmount),
      totalReturns: Math.round(totalReturns),
      returnsPercentage: Math.round(returnsPercentage * 100) / 100,
      activeProperties,
      totalInvestments: investments.length,
      recentTransactions: transactions.slice(0, 5) // Last 5 transactions
    };
  },
  
  // AI Recommendations (mock data since OpenAI requires backend)
  getRecommendations: async () => {
    const properties = await icpClient.getProperties();
    
    // Generate simple rule-based recommendations
    return properties
      .filter(p => p.availableTokens > 0)
      .slice(0, 3)
      .map((property, index) => ({
        property,
        score: 85 - index * 5,
        reasons: [
          "Strong location fundamentals",
          "Attractive expected ROI",
          "Low-risk investment profile"
        ],
        riskLevel: ['low', 'medium', 'low'][index] as 'low' | 'medium' | 'high',
        matchPercentage: 90 - index * 5
      }));
  },
  
  // User profile (mock data)
  getUserProfile: async () => ({
    preferredInvestmentRange: { min: 1000, max: 50000 },
    riskTolerance: 'moderate' as const,
    preferredPropertyTypes: ['Residential', 'Commercial'],
    preferredLocations: ['New York, NY', 'California'],
    investmentGoals: ['Capital Appreciation', 'Passive Income']
  })
};

// Create ICP-configured query client
export const icpQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      retry: (failureCount, error) => {
        // Don't retry authentication errors
        if (error?.message?.includes('Not authenticated')) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// ICP-specific mutations
export const icpMutations = {
  createInvestment: async (data: { propertyId: number; tokens: number; amount: number }) => {
    return icpClient.createInvestment(data.propertyId, data.tokens, data.amount);
  },
  
  // Add other mutations as needed
};