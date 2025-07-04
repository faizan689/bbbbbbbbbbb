// Mock ICP client that simulates the Rust blockchain backend
// This demonstrates the complete ICP architecture without requiring actual canister deployment

export interface Property {
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

export interface Investment {
  id: number;
  userId: number;
  propertyId: number;
  tokensOwned: number;
  investmentAmount: string;
  currentValue: string;
  purchaseDate: Date | null;
}

export interface Transaction {
  id: number;
  userId: number;
  propertyId: number;
  type: string;
  amount: string;
  tokens: number;
  timestamp: Date;
}

// Mock blockchain data that simulates ICP canister storage
const mockProperties: Property[] = [
  {
    id: 1,
    title: "Manhattan Luxury Residences",
    description: "Premium apartment complex in the heart of Manhattan with high-end amenities and strong rental demand.",
    location: "New York, NY",
    propertyType: "Residential",
    totalValue: "4200000",
    totalTokens: 4200,
    availableTokens: 2800,
    expectedROI: "14.20",
    minInvestment: "1000",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
    isActive: true,
    createdAt: new Date('2024-12-01'),
  },
  {
    id: 2,
    title: "Silicon Valley Tech Campus",
    description: "Modern office complex in the heart of Silicon Valley tech district with major tech companies as tenants.",
    location: "Palo Alto, CA",
    propertyType: "Commercial",
    totalValue: "8500000",
    totalTokens: 8500,
    availableTokens: 6200,
    expectedROI: "12.80",
    minInvestment: "2500",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    isActive: true,
    createdAt: new Date('2024-12-05'),
  },
  {
    id: 3,
    title: "Miami Beachfront Resort",
    description: "Luxury beachfront resort in Miami Beach with premium vacation rental income and high appreciation potential.",
    location: "Miami Beach, FL",
    propertyType: "Hospitality",
    totalValue: "6800000",
    totalTokens: 6800,
    availableTokens: 4500,
    expectedROI: "16.50",
    minInvestment: "5000",
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400",
    isActive: true,
    createdAt: new Date('2024-12-10'),
  },
  {
    id: 4,
    title: "Austin Industrial Complex",
    description: "Strategic industrial complex in Austin with long-term leases to established logistics companies.",
    location: "Austin, TX",
    propertyType: "Industrial",
    totalValue: "3200000",
    totalTokens: 3200,
    availableTokens: 1800,
    expectedROI: "11.40",
    minInvestment: "1500",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    isActive: true,
    createdAt: new Date('2024-12-15'),
  },
  {
    id: 5,
    title: "Seattle Mixed-Use Development",
    description: "Modern mixed-use development in Seattle combining retail, office, and residential spaces.",
    location: "Seattle, WA",
    propertyType: "Mixed-Use",
    totalValue: "7200000",
    totalTokens: 7200,
    availableTokens: 5400,
    expectedROI: "13.20",
    minInvestment: "2000",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
    isActive: true,
    createdAt: new Date('2024-12-20'),
  },
];

let mockInvestments: Investment[] = [
  {
    id: 1,
    userId: 1,
    propertyId: 1,
    tokensOwned: 1250,
    investmentAmount: "12500",
    currentValue: "14275",
    purchaseDate: new Date('2024-12-02'),
  },
  {
    id: 2,
    userId: 1,
    propertyId: 2,
    tokensOwned: 800,
    investmentAmount: "8000",
    currentValue: "8944",
    purchaseDate: new Date('2024-12-06'),
  },
  {
    id: 3,
    userId: 1,
    propertyId: 4,
    tokensOwned: 450,
    investmentAmount: "4500",
    currentValue: "5045",
    purchaseDate: new Date('2024-12-16'),
  },
];

let mockTransactions: Transaction[] = [
  {
    id: 1,
    userId: 1,
    propertyId: 1,
    type: "purchase",
    amount: "12500",
    tokens: 1250,
    timestamp: new Date('2024-12-02'),
  },
  {
    id: 2,
    userId: 1,
    propertyId: 2,
    type: "purchase",
    amount: "8000",
    tokens: 800,
    timestamp: new Date('2024-12-06'),
  },
  {
    id: 3,
    userId: 1,
    propertyId: 4,
    type: "purchase",
    amount: "4500",
    tokens: 450,
    timestamp: new Date('2024-12-16'),
  },
];

// Mock ICP Client that simulates Rust canister interactions
export class MockICPClient {
  private isAuthenticated = false;
  private currentUserId = 1;

  // Simulate user authentication
  async login(): Promise<boolean> {
    this.isAuthenticated = true;
    return true;
  }

  async logout(): Promise<void> {
    this.isAuthenticated = false;
  }

  async isUserAuthenticated(): Promise<boolean> {
    return this.isAuthenticated;
  }

  // Property canister methods
  async getProperties(): Promise<Property[]> {
    // Simulate network delay like real blockchain calls
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockProperties];
  }

  async getProperty(id: number): Promise<Property | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProperties.find(p => p.id === id) || null;
  }

  // Investment canister methods
  async getUserInvestments(): Promise<Investment[]> {
    if (!this.isAuthenticated) throw new Error('Not authenticated');
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockInvestments.filter(inv => inv.userId === this.currentUserId);
  }

  async createInvestment(propertyId: number, tokens: number, amount: number): Promise<Investment> {
    if (!this.isAuthenticated) throw new Error('Not authenticated');
    
    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const property = mockProperties.find(p => p.id === propertyId);
    if (!property) throw new Error('Property not found');
    
    if (property.availableTokens < tokens) {
      throw new Error('Not enough tokens available');
    }
    
    // Create new investment
    const newInvestment: Investment = {
      id: Date.now(),
      userId: this.currentUserId,
      propertyId,
      tokensOwned: tokens,
      investmentAmount: amount.toString(),
      currentValue: (amount * 1.1).toString(), // Simulate 10% gain
      purchaseDate: new Date(),
    };
    
    // Update blockchain state
    mockInvestments.push(newInvestment);
    property.availableTokens -= tokens;
    
    // Create transaction record
    const transaction: Transaction = {
      id: Date.now() + 1,
      userId: this.currentUserId,
      propertyId,
      type: "purchase",
      amount: amount.toString(),
      tokens,
      timestamp: new Date(),
    };
    mockTransactions.push(transaction);
    
    return newInvestment;
  }

  async sellInvestment(investmentId: number, tokensToSell: number): Promise<Investment> {
    if (!this.isAuthenticated) throw new Error('Not authenticated');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const investment = mockInvestments.find(inv => inv.id === investmentId);
    if (!investment) throw new Error('Investment not found');
    
    if (investment.tokensOwned < tokensToSell) {
      throw new Error('Not enough tokens owned');
    }
    
    const saleValue = (parseFloat(investment.currentValue) / investment.tokensOwned) * tokensToSell;
    
    // Update investment
    investment.tokensOwned -= tokensToSell;
    investment.currentValue = (parseFloat(investment.currentValue) - saleValue).toString();
    
    // Return tokens to property
    const property = mockProperties.find(p => p.id === investment.propertyId);
    if (property) {
      property.availableTokens += tokensToSell;
    }
    
    // Create sale transaction
    const transaction: Transaction = {
      id: Date.now(),
      userId: this.currentUserId,
      propertyId: investment.propertyId,
      type: "sale",
      amount: saleValue.toString(),
      tokens: tokensToSell,
      timestamp: new Date(),
    };
    mockTransactions.push(transaction);
    
    return investment;
  }

  // Transaction methods
  async getUserTransactions(): Promise<Transaction[]> {
    if (!this.isAuthenticated) throw new Error('Not authenticated');
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTransactions
      .filter(tx => tx.userId === this.currentUserId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Dashboard data aggregation
  async getDashboardData() {
    if (!this.isAuthenticated) throw new Error('Not authenticated');
    
    const [investments, transactions] = await Promise.all([
      this.getUserInvestments(),
      this.getUserTransactions()
    ]);
    
    const totalPortfolioValue = investments.reduce((sum, inv) => sum + parseFloat(inv.currentValue), 0);
    const totalInvestmentAmount = investments.reduce((sum, inv) => sum + parseFloat(inv.investmentAmount), 0);
    const totalReturns = totalPortfolioValue - totalInvestmentAmount;
    const returnsPercentage = totalInvestmentAmount > 0 ? (totalReturns / totalInvestmentAmount) * 100 : 0;
    
    return {
      totalPortfolioValue: Math.round(totalPortfolioValue),
      totalInvestmentAmount: Math.round(totalInvestmentAmount),
      totalReturns: Math.round(totalReturns),
      returnsPercentage: Math.round(returnsPercentage * 100) / 100,
      activeProperties: new Set(investments.map(inv => inv.propertyId)).size,
      totalInvestments: investments.length,
      recentTransactions: transactions.slice(0, 5)
    };
  }

  // Governance simulation (future feature)
  async getProposals() {
    return []; // Placeholder for governance features
  }

  // AI Recommendations (rule-based since no OpenAI in pure blockchain)
  async getRecommendations() {
    const properties = await this.getProperties();
    
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
  }
}

// Export singleton instance
export const mockICPClient = new MockICPClient();