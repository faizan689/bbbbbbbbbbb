import { 
  users, properties, investments, transactions, proposals, votes,
  type User, type InsertUser, type Property, type InsertProperty,
  type Investment, type InsertInvestment, type Transaction, type InsertTransaction,
  type Proposal, type InsertProposal, type Vote, type InsertVote
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Property operations
  getProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updatePropertyTokens(id: number, availableTokens: number): Promise<void>;
  
  // Investment operations
  getInvestments(): Promise<Investment[]>;
  getInvestmentsByUser(userId: number): Promise<Investment[]>;
  getInvestmentsByProperty(propertyId: number): Promise<Investment[]>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestmentValue(id: number, currentValue: string): Promise<void>;
  
  // Transaction operations
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Proposal operations
  getProposals(): Promise<Proposal[]>;
  getActiveProposals(): Promise<Proposal[]>;
  getProposal(id: number): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposalVotes(id: number, votesFor: number, votesAgainst: number): Promise<void>;
  
  // Vote operations
  getVotes(): Promise<Vote[]>;
  getVotesByProposal(proposalId: number): Promise<Vote[]>;
  getVoteByUserAndProposal(userId: number, proposalId: number): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private investments: Map<number, Investment>;
  private transactions: Map<number, Transaction>;
  private proposals: Map<number, Proposal>;
  private votes: Map<number, Vote>;
  private currentUserId: number;
  private currentPropertyId: number;
  private currentInvestmentId: number;
  private currentTransactionId: number;
  private currentProposalId: number;
  private currentVoteId: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.investments = new Map();
    this.transactions = new Map();
    this.proposals = new Map();
    this.votes = new Map();
    this.currentUserId = 1;
    this.currentPropertyId = 1;
    this.currentInvestmentId = 1;
    this.currentTransactionId = 1;
    this.currentProposalId = 1;
    this.currentVoteId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed properties
    const sampleProperties = [
      {
        title: "Manhattan Luxury Residences",
        description: "Premium apartment complex in the heart of Manhattan with high-end amenities.",
        location: "New York, NY",
        propertyType: "Residential",
        totalValue: "4200000",
        totalTokens: 4200,
        availableTokens: 2840,
        expectedROI: "14.2",
        minInvestment: "100",
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isActive: true
      },
      {
        title: "Downtown Business Center",
        description: "Grade-A office building with Fortune 500 tenants and long-term leases.",
        location: "Chicago, IL",
        propertyType: "Commercial",
        totalValue: "12800000",
        totalTokens: 12800,
        availableTokens: 4200,
        expectedROI: "11.8",
        minInvestment: "250",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isActive: true
      },
      {
        title: "Oceanview Condominiums",
        description: "Luxury waterfront condos with premium amenities and stunning ocean views.",
        location: "Miami, FL",
        propertyType: "Residential",
        totalValue: "8500000",
        totalTokens: 8500,
        availableTokens: 1200,
        expectedROI: "16.3",
        minInvestment: "500",
        imageUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isActive: true
      },
      {
        title: "Logistics Hub Complex",
        description: "Strategic warehouse facility with e-commerce and distribution tenants.",
        location: "Dallas, TX",
        propertyType: "Industrial",
        totalValue: "6200000",
        totalTokens: 6200,
        availableTokens: 5800,
        expectedROI: "13.5",
        minInvestment: "200",
        imageUrl: "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isActive: true
      },
      {
        title: "Garden District Homes",
        description: "Family-friendly suburban development with modern amenities and schools nearby.",
        location: "Austin, TX",
        propertyType: "Residential",
        totalValue: "3800000",
        totalTokens: 3800,
        availableTokens: 2100,
        expectedROI: "12.1",
        minInvestment: "150",
        imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isActive: true
      },
      {
        title: "Metro Shopping Plaza",
        description: "Prime retail location with anchor tenants and high foot traffic.",
        location: "Los Angeles, CA",
        propertyType: "Commercial",
        totalValue: "9100000",
        totalTokens: 9100,
        availableTokens: 6400,
        expectedROI: "10.7",
        minInvestment: "300",
        imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        isActive: true
      }
    ];

    sampleProperties.forEach(prop => {
      this.createProperty(prop);
    });

    // Seed proposals
    const sampleProposals = [
      {
        propertyId: 1,
        title: "Property Maintenance Upgrade - Manhattan Luxury Residences",
        description: "Proposed investment of $250,000 for HVAC system upgrades and lobby renovation to increase property value and tenant satisfaction.",
        proposalType: "maintenance",
        investmentAmount: "250000",
        expectedROI: "2.5",
        votesFor: 6124,
        votesAgainst: 2418,
        totalVotingPower: 12000,
        status: "active",
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      },
      {
        propertyId: 2,
        title: "Lease Agreement Renewal - Downtown Business Center",
        description: "Major tenant requesting 5-year lease extension with 3% annual rent increase. This would secure stable income stream through 2029.",
        proposalType: "lease",
        investmentAmount: null,
        expectedROI: null,
        votesFor: 2720,
        votesAgainst: 480,
        totalVotingPower: 12800,
        status: "active",
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
      },
      {
        propertyId: 5,
        title: "Security System Upgrade - Garden District Homes",
        description: "Installation of modern security systems and access controls. Proposal was approved and implementation is underway.",
        proposalType: "security",
        investmentAmount: "125000",
        expectedROI: "1.8",
        votesFor: 2850,
        votesAgainst: 450,
        totalVotingPower: 3800,
        status: "completed",
        endDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 2 weeks ago
      }
    ];

    sampleProposals.forEach(proposal => {
      this.createProposal(proposal);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const property: Property = { 
      ...insertProperty, 
      id, 
      createdAt: new Date()
    };
    this.properties.set(id, property);
    return property;
  }

  async updatePropertyTokens(id: number, availableTokens: number): Promise<void> {
    const property = this.properties.get(id);
    if (property) {
      property.availableTokens = availableTokens;
      this.properties.set(id, property);
    }
  }

  async getInvestments(): Promise<Investment[]> {
    return Array.from(this.investments.values());
  }

  async getInvestmentsByUser(userId: number): Promise<Investment[]> {
    return Array.from(this.investments.values()).filter(inv => inv.userId === userId);
  }

  async getInvestmentsByProperty(propertyId: number): Promise<Investment[]> {
    return Array.from(this.investments.values()).filter(inv => inv.propertyId === propertyId);
  }

  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const id = this.currentInvestmentId++;
    const investment: Investment = { 
      ...insertInvestment, 
      id, 
      purchaseDate: new Date()
    };
    this.investments.set(id, investment);
    return investment;
  }

  async updateInvestmentValue(id: number, currentValue: string): Promise<void> {
    const investment = this.investments.get(id);
    if (investment) {
      investment.currentValue = currentValue;
      this.investments.set(id, investment);
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(tx => tx.userId === userId);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getProposals(): Promise<Proposal[]> {
    return Array.from(this.proposals.values());
  }

  async getActiveProposals(): Promise<Proposal[]> {
    return Array.from(this.proposals.values()).filter(p => p.status === "active");
  }

  async getProposal(id: number): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const id = this.currentProposalId++;
    const proposal: Proposal = { 
      ...insertProposal, 
      id, 
      createdAt: new Date()
    };
    this.proposals.set(id, proposal);
    return proposal;
  }

  async updateProposalVotes(id: number, votesFor: number, votesAgainst: number): Promise<void> {
    const proposal = this.proposals.get(id);
    if (proposal) {
      proposal.votesFor = votesFor;
      proposal.votesAgainst = votesAgainst;
      this.proposals.set(id, proposal);
    }
  }

  async getVotes(): Promise<Vote[]> {
    return Array.from(this.votes.values());
  }

  async getVotesByProposal(proposalId: number): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(v => v.proposalId === proposalId);
  }

  async getVoteByUserAndProposal(userId: number, proposalId: number): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(v => v.userId === userId && v.proposalId === proposalId);
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = this.currentVoteId++;
    const vote: Vote = { 
      ...insertVote, 
      id, 
      createdAt: new Date()
    };
    this.votes.set(id, vote);
    return vote;
  }
}

export const storage = new MemStorage();
