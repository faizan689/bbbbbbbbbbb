import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';
import { config } from './env';

// Canister IDs from environment
const PROPERTY_CANISTER_ID = config.PROPERTY_CANISTER_ID;
const INVESTMENT_CANISTER_ID = config.INVESTMENT_CANISTER_ID;
const USER_CANISTER_ID = config.USER_CANISTER_ID;
const GOVERNANCE_CANISTER_ID = config.GOVERNANCE_CANISTER_ID;

// Property canister interface
export interface Property {
  id: bigint;
  title: string;
  description: string;
  location: string;
  property_type: string;
  total_value: bigint;
  total_tokens: bigint;
  available_tokens: bigint;
  expected_roi: string;
  min_investment: bigint;
  image_url: string;
  is_active: boolean;
  created_at: bigint;
  owner: Principal;
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  location: string;
  property_type: string;
  total_value: bigint;
  total_tokens: bigint;
  expected_roi: string;
  min_investment: bigint;
  image_url: string;
}

// Investment canister interface
export interface Investment {
  id: bigint;
  user_id: Principal;
  property_id: bigint;
  tokens_owned: bigint;
  investment_amount: bigint;
  current_value: bigint;
  purchase_date: bigint;
  is_active: boolean;
}

export interface Transaction {
  id: bigint;
  user_id: Principal;
  property_id: bigint;
  transaction_type: string;
  amount: bigint;
  tokens: bigint;
  timestamp: bigint;
}

// IDL definitions for canisters
const propertyIDL = ({ IDL }: any) => {
  const Property = IDL.Record({
    id: IDL.Nat64,
    title: IDL.Text,
    description: IDL.Text,
    location: IDL.Text,
    property_type: IDL.Text,
    total_value: IDL.Nat64,
    total_tokens: IDL.Nat64,
    available_tokens: IDL.Nat64,
    expected_roi: IDL.Text,
    min_investment: IDL.Nat64,
    image_url: IDL.Text,
    is_active: IDL.Bool,
    created_at: IDL.Nat64,
    owner: IDL.Principal,
  });

  const CreatePropertyRequest = IDL.Record({
    title: IDL.Text,
    description: IDL.Text,
    location: IDL.Text,
    property_type: IDL.Text,
    total_value: IDL.Nat64,
    total_tokens: IDL.Nat64,
    expected_roi: IDL.Text,
    min_investment: IDL.Nat64,
    image_url: IDL.Text,
  });

  const UpdateTokensRequest = IDL.Record({
    property_id: IDL.Nat64,
    tokens_purchased: IDL.Nat64,
  });

  return IDL.Service({
    create_property: IDL.Func([CreatePropertyRequest], [IDL.Variant({ Ok: Property, Err: IDL.Text })], []),
    get_properties: IDL.Func([], [IDL.Vec(Property)], ['query']),
    get_property: IDL.Func([IDL.Nat64], [IDL.Opt(Property)], ['query']),
    get_active_properties: IDL.Func([], [IDL.Vec(Property)], ['query']),
    update_available_tokens: IDL.Func([UpdateTokensRequest], [IDL.Variant({ Ok: Property, Err: IDL.Text })], []),
    toggle_property_status: IDL.Func([IDL.Nat64], [IDL.Variant({ Ok: Property, Err: IDL.Text })], []),
    get_properties_by_owner: IDL.Func([IDL.Principal], [IDL.Vec(Property)], ['query']),
  });
};

const investmentIDL = ({ IDL }: any) => {
  const Investment = IDL.Record({
    id: IDL.Nat64,
    user_id: IDL.Principal,
    property_id: IDL.Nat64,
    tokens_owned: IDL.Nat64,
    investment_amount: IDL.Nat64,
    current_value: IDL.Nat64,
    purchase_date: IDL.Nat64,
    is_active: IDL.Bool,
  });

  const Transaction = IDL.Record({
    id: IDL.Nat64,
    user_id: IDL.Principal,
    property_id: IDL.Nat64,
    transaction_type: IDL.Text,
    amount: IDL.Nat64,
    tokens: IDL.Nat64,
    timestamp: IDL.Nat64,
  });

  const CreateInvestmentRequest = IDL.Record({
    property_id: IDL.Nat64,
    tokens_to_purchase: IDL.Nat64,
    investment_amount: IDL.Nat64,
  });

  const PortfolioSummary = IDL.Record({
    total_value: IDL.Nat64,
    total_investments: IDL.Nat64,
    active_properties: IDL.Nat64,
    total_returns: IDL.Nat64,
  });

  return IDL.Service({
    create_investment: IDL.Func([CreateInvestmentRequest], [IDL.Variant({ Ok: Investment, Err: IDL.Text })], []),
    get_investments_by_user: IDL.Func([IDL.Principal], [IDL.Vec(Investment)], ['query']),
    get_transactions_by_user: IDL.Func([IDL.Principal], [IDL.Vec(Transaction)], ['query']),
    get_portfolio_summary: IDL.Func([IDL.Principal], [PortfolioSummary], ['query']),
    sell_investment: IDL.Func([IDL.Nat64, IDL.Nat64], [IDL.Variant({ Ok: Investment, Err: IDL.Text })], []),
    update_investment_value: IDL.Func([IDL.Nat64, IDL.Nat64], [IDL.Variant({ Ok: Investment, Err: IDL.Text })], []),
  });
};

// ICP Client class
export class ICPClient {
  private agent: HttpAgent;
  private authClient: AuthClient | null = null;
  private propertyActor: any;
  private investmentActor: any;
  private userActor: any;
  private governanceActor: any;
  
  constructor() {
    this.agent = new HttpAgent({
      host: process.env.NODE_ENV === 'development' ? 'http://localhost:4943' : 'https://ic0.app',
    });

    // In development, fetch root key
    if (process.env.NODE_ENV === 'development') {
      this.agent.fetchRootKey().catch(err => {
        console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
        console.error(err);
      });
    }

    this.initializeActors();
  }

  private initializeActors() {
    this.propertyActor = Actor.createActor(propertyIDL, {
      agent: this.agent,
      canisterId: PROPERTY_CANISTER_ID,
    });

    this.investmentActor = Actor.createActor(investmentIDL, {
      agent: this.agent,
      canisterId: INVESTMENT_CANISTER_ID,
    });
  }

  async initAuth(): Promise<AuthClient> {
    if (!this.authClient) {
      this.authClient = await AuthClient.create();
    }
    return this.authClient;
  }

  async login(): Promise<Principal | null> {
    const authClient = await this.initAuth();
    
    return new Promise((resolve) => {
      authClient.login({
        identityProvider: process.env.NODE_ENV === 'development' 
          ? `http://localhost:4943/?canisterId=${process.env.VITE_INTERNET_IDENTITY_CANISTER_ID}`
          : 'https://identity.ic0.app',
        onSuccess: () => {
          const identity = authClient.getIdentity();
          this.agent.replaceIdentity(identity);
          this.initializeActors(); // Reinitialize with authenticated identity
          resolve(identity.getPrincipal());
        },
        onError: () => {
          resolve(null);
        },
      });
    });
  }

  async logout(): Promise<void> {
    const authClient = await this.initAuth();
    await authClient.logout();
    this.agent.replaceIdentity(null);
    this.initializeActors();
  }

  async isAuthenticated(): Promise<boolean> {
    const authClient = await this.initAuth();
    return await authClient.isAuthenticated();
  }

  async getPrincipal(): Promise<Principal | null> {
    if (await this.isAuthenticated()) {
      const authClient = await this.initAuth();
      return authClient.getIdentity().getPrincipal();
    }
    return null;
  }

  // Property methods
  async getProperties(): Promise<Property[]> {
    try {
      const result = await this.propertyActor.get_properties();
      return result.map(this.convertProperty);
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async getProperty(id: number): Promise<Property | null> {
    try {
      const result = await this.propertyActor.get_property(BigInt(id));
      return result[0] ? this.convertProperty(result[0]) : null;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  }

  async createProperty(request: CreatePropertyRequest): Promise<Property> {
    try {
      const result = await this.propertyActor.create_property(request);
      if ('Ok' in result) {
        return this.convertProperty(result.Ok);
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  // Investment methods
  async getUserInvestments(principal: Principal): Promise<Investment[]> {
    try {
      const result = await this.investmentActor.get_investments_by_user(principal);
      return result.map(this.convertInvestment);
    } catch (error) {
      console.error('Error fetching investments:', error);
      throw error;
    }
  }

  async getUserTransactions(principal: Principal): Promise<Transaction[]> {
    try {
      const result = await this.investmentActor.get_transactions_by_user(principal);
      return result.map(this.convertTransaction);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async createInvestment(propertyId: number, tokens: number, amount: number): Promise<Investment> {
    try {
      const request = {
        property_id: BigInt(propertyId),
        tokens_to_purchase: BigInt(tokens),
        investment_amount: BigInt(amount * 100), // Convert to cents
      };
      
      const result = await this.investmentActor.create_investment(request);
      if ('Ok' in result) {
        return this.convertInvestment(result.Ok);
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Error creating investment:', error);
      throw error;
    }
  }

  // Conversion utilities
  private convertProperty(prop: any): Property {
    return {
      id: Number(prop.id),
      title: prop.title,
      description: prop.description,
      location: prop.location,
      propertyType: prop.property_type,
      totalValue: (Number(prop.total_value) / 100).toString(), // Convert from cents
      totalTokens: Number(prop.total_tokens),
      availableTokens: Number(prop.available_tokens),
      expectedROI: prop.expected_roi,
      minInvestment: (Number(prop.min_investment) / 100).toString(), // Convert from cents
      imageUrl: prop.image_url,
      isActive: prop.is_active,
      createdAt: new Date(Number(prop.created_at) / 1000000), // Convert from nanoseconds
    };
  }

  private convertInvestment(inv: any): Investment {
    return {
      id: Number(inv.id),
      userId: Number(inv.user_id.toString()), // Convert Principal to string representation
      propertyId: Number(inv.property_id),
      tokensOwned: Number(inv.tokens_owned),
      investmentAmount: (Number(inv.investment_amount) / 100).toString(), // Convert from cents
      currentValue: (Number(inv.current_value) / 100).toString(), // Convert from cents
      purchaseDate: new Date(Number(inv.purchase_date) / 1000000), // Convert from nanoseconds
    };
  }

  private convertTransaction(tx: any): Transaction {
    return {
      id: Number(tx.id),
      userId: Number(tx.user_id.toString()), // Convert Principal to string representation
      propertyId: Number(tx.property_id),
      type: tx.transaction_type,
      amount: (Number(tx.amount) / 100).toString(), // Convert from cents
      tokens: Number(tx.tokens),
      timestamp: new Date(Number(tx.timestamp) / 1000000), // Convert from nanoseconds
    };
  }
}

// Singleton instance
export const icpClient = new ICPClient();