// Mock data utilities for the application
// In production, this would be replaced with actual blockchain data

export const mockUserPortfolio = {
  totalValue: 24582,
  totalInvested: 20000,
  totalReturns: 4582,
  avgROI: 22.9,
  tokenBalance: 12847,
  activeProperties: 7,
  monthlyReturns: 1847
};

export const mockMarketStats = {
  totalAssets: "2.4B",
  activeInvestors: "15,000",
  avgAnnualReturn: "12.4",
  totalProperties: "850"
};

export const mockTransactions = [
  {
    id: 1,
    type: "Token Purchase",
    property: "Manhattan Luxury Residences",
    amount: 2500,
    tokens: 250,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: "completed"
  },
  {
    id: 2,
    type: "Dividend Payment",
    property: "Downtown Business Center",
    amount: 127.50,
    tokens: 0,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: "completed"
  },
  {
    id: 3,
    type: "Token Sale",
    property: "Oceanview Condominiums",
    amount: -1500,
    tokens: -150,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: "completed"
  }
];

export const mockWalletConnection = {
  address: "0x742d35cc6bf8b45e9c5e3...",
  balance: 12847,
  network: "Internet Computer",
  connected: false
};

export const generateMockData = {
  portfolioPerformance: (months: number = 12) => {
    const data = [];
    const baseValue = 18000;
    
    for (let i = 0; i < months; i++) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const growth = Math.random() * 0.1 + 0.05; // 5-15% growth
      const value = Math.round(baseValue * (1 + growth * i));
      
      data.push({
        month: monthNames[i],
        value: value + Math.random() * 1000 - 500 // Add some volatility
      });
    }
    
    return data;
  },
  
  assetAllocation: () => [
    { name: 'Residential', value: 45, amount: 11062 },
    { name: 'Commercial', value: 30, amount: 7375 },
    { name: 'Industrial', value: 15, amount: 3687 },
    { name: 'Mixed-Use', value: 10, amount: 2458 }
  ]
};
