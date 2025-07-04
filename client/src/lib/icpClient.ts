import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Canister IDs (will be generated when deployed)
export const CANISTER_IDS = {
  property_canister: process.env.VITE_PROPERTY_CANISTER_ID || 'rrkah-fqaaa-aaaaa-aaaaq-cai',
  investment_canister: process.env.VITE_INVESTMENT_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai',
  governance_canister: process.env.VITE_GOVERNANCE_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai',
  user_canister: process.env.VITE_USER_CANISTER_ID || 'renrk-eyaaa-aaaaa-aaada-cai',
};

// Local development URL
const LOCAL_REPLICA_URL = 'http://127.0.0.1:4943';

// Property Canister Interface
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

// Investment Canister Interface
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

export interface CreateInvestmentRequest {
  property_id: bigint;
  tokens_to_purchase: bigint;
  investment_amount: bigint;
}

// Governance Canister Interface
export interface Proposal {
  id: bigint;
  property_id: bigint;
  title: string;
  description: string;
  proposal_type: string;
  proposer: Principal;
  votes_for: bigint;
  votes_against: bigint;
  voting_power_for: bigint;
  voting_power_against: bigint;
  status: string;
  created_at: bigint;
  voting_deadline: bigint;
  execution_data: string[] | [];
}

export interface CreateProposalRequest {
  property_id: bigint;
  title: string;
  description: string;
  proposal_type: string;
  voting_duration_days: bigint;
  execution_data: string[] | [];
}

// User Canister Interface
export interface User {
  principal: Principal;
  email: string;
  name: string;
  kyc_status: string;
  wallet_address: string;
  registration_date: bigint;
  is_active: boolean;
  total_investments: bigint;
  portfolio_value: bigint;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  wallet_address: string;
}

class ICPClient {
  private agent: HttpAgent;
  private authClient: AuthClient | null = null;
  private isLocal: boolean;

  constructor() {
    this.isLocal = process.env.NODE_ENV === 'development';
    this.agent = new HttpAgent({
      host: this.isLocal ? LOCAL_REPLICA_URL : 'https://ic0.app',
    });

    // Fetch root key for local development
    if (this.isLocal) {
      this.agent.fetchRootKey().catch(err => {
        console.warn('Unable to fetch root key. Check if local replica is running.');
        console.error(err);
      });
    }
  }

  async initAuth() {
    if (!this.authClient) {
      this.authClient = await AuthClient.create();
    }
    return this.authClient;
  }

  async login() {
    const authClient = await this.initAuth();
    return new Promise<boolean>((resolve) => {
      authClient.login({
        identityProvider: this.isLocal 
          ? `http://127.0.0.1:4943?canisterId=${process.env.VITE_INTERNET_IDENTITY_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai'}`
          : 'https://identity.ic0.app',
        onSuccess: () => resolve(true),
        onError: () => resolve(false),
      });
    });
  }

  async logout() {
    const authClient = await this.initAuth();
    await authClient.logout();
  }

  async isAuthenticated() {
    const authClient = await this.initAuth();
    return await authClient.isAuthenticated();
  }

  async getIdentity() {
    const authClient = await this.initAuth();
    return authClient.getIdentity();
  }

  async getPrincipal() {
    const identity = await this.getIdentity();
    return identity.getPrincipal();
  }

  // Property Canister Methods
  async getProperties(): Promise<Property[]> {
    const identity = await this.getIdentity();
    const agent = new HttpAgent({ host: this.isLocal ? LOCAL_REPLICA_URL : 'https://ic0.app', identity });
    
    if (this.isLocal) {
      await agent.fetchRootKey();
    }

    const actor = Actor.createActor(idlFactory.property, {
      agent,
      canisterId: CANISTER_IDS.property_canister,
    });

    return await actor.get_properties() as Property[];
  }

  async createProperty(req: CreatePropertyRequest): Promise<{ Ok?: Property; Err?: string }> {
    const identity = await this.getIdentity();
    const agent = new HttpAgent({ host: this.isLocal ? LOCAL_REPLICA_URL : 'https://ic0.app', identity });
    
    if (this.isLocal) {
      await agent.fetchRootKey();
    }

    const actor = Actor.createActor(idlFactory.property, {
      agent,
      canisterId: CANISTER_IDS.property_canister,
    });

    return await actor.create_property(req);
  }

  // Investment Canister Methods
  async getUserInvestments(userId: Principal): Promise<Investment[]> {
    const identity = await this.getIdentity();
    const agent = new HttpAgent({ host: this.isLocal ? LOCAL_REPLICA_URL : 'https://ic0.app', identity });
    
    if (this.isLocal) {
      await agent.fetchRootKey();
    }

    const actor = Actor.createActor(idlFactory.investment, {
      agent,
      canisterId: CANISTER_IDS.investment_canister,
    });

    return await actor.get_user_investments(userId) as Investment[];
  }

  async createInvestment(req: CreateInvestmentRequest): Promise<{ Ok?: Investment; Err?: string }> {
    const identity = await this.getIdentity();
    const agent = new HttpAgent({ host: this.isLocal ? LOCAL_REPLICA_URL : 'https://ic0.app', identity });
    
    if (this.isLocal) {
      await agent.fetchRootKey();
    }

    const actor = Actor.createActor(idlFactory.investment, {
      agent,
      canisterId: CANISTER_IDS.investment_canister,
    });

    return await actor.create_investment(req);
  }

  // Governance Canister Methods
  async getProposals(): Promise<Proposal[]> {
    const identity = await this.getIdentity();
    const agent = new HttpAgent({ host: this.isLocal ? LOCAL_REPLICA_URL : 'https://ic0.app', identity });
    
    if (this.isLocal) {
      await agent.fetchRootKey();
    }

    const actor = Actor.createActor(idlFactory.governance, {
      agent,
      canisterId: CANISTER_IDS.governance_canister,
    });

    return await actor.get_proposals() as Proposal[];
  }

  async createProposal(req: CreateProposalRequest): Promise<{ Ok?: Proposal; Err?: string }> {
    const identity = await this.getIdentity();
    const agent = new HttpAgent({ host: this.isLocal ? LOCAL_REPLICA_URL : 'https://ic0.app', identity });
    
    if (this.isLocal) {
      await agent.fetchRootKey();
    }

    const actor = Actor.createActor(idlFactory.governance, {
      agent,
      canisterId: CANISTER_IDS.governance_canister,
    });

    return await actor.create_proposal(req);
  }

  // User Canister Methods
  async getCurrentUser(): Promise<User | null> {
    const identity = await this.getIdentity();
    const agent = new HttpAgent({ host: this.isLocal ? LOCAL_REPLICA_URL : 'https://ic0.app', identity });
    
    if (this.isLocal) {
      await agent.fetchRootKey();
    }

    const actor = Actor.createActor(idlFactory.user, {
      agent,
      canisterId: CANISTER_IDS.user_canister,
    });

    const result = await actor.get_current_user();
    return result.length > 0 ? result[0] as User : null;
  }

  async createUser(req: CreateUserRequest): Promise<{ Ok?: User; Err?: string }> {
    const identity = await this.getIdentity();
    const agent = new HttpAgent({ host: this.isLocal ? LOCAL_REPLICA_URL : 'https://ic0.app', identity });
    
    if (this.isLocal) {
      await agent.fetchRootKey();
    }

    const actor = Actor.createActor(idlFactory.user, {
      agent,
      canisterId: CANISTER_IDS.user_canister,
    });

    return await actor.create_user(req);
  }
}

// IDL Factory (Interface Definition Language) - Simplified version
// In a real application, these would be generated from your Rust canisters
const idlFactory = {
  property: ({ IDL }: any) => {
    return IDL.Service({
      'get_properties': IDL.Func([], [IDL.Vec(IDL.Record({}))], ['query']),
      'create_property': IDL.Func([IDL.Record({})], [IDL.Variant({ 'Ok': IDL.Record({}), 'Err': IDL.Text })], []),
    });
  },
  investment: ({ IDL }: any) => {
    return IDL.Service({
      'get_user_investments': IDL.Func([IDL.Principal], [IDL.Vec(IDL.Record({}))], ['query']),
      'create_investment': IDL.Func([IDL.Record({})], [IDL.Variant({ 'Ok': IDL.Record({}), 'Err': IDL.Text })], []),
    });
  },
  governance: ({ IDL }: any) => {
    return IDL.Service({
      'get_proposals': IDL.Func([], [IDL.Vec(IDL.Record({}))], ['query']),
      'create_proposal': IDL.Func([IDL.Record({})], [IDL.Variant({ 'Ok': IDL.Record({}), 'Err': IDL.Text })], []),
    });
  },
  user: ({ IDL }: any) => {
    return IDL.Service({
      'get_current_user': IDL.Func([], [IDL.Opt(IDL.Record({}))], ['query']),
      'create_user': IDL.Func([IDL.Record({})], [IDL.Variant({ 'Ok': IDL.Record({}), 'Err': IDL.Text })], []),
    });
  },
};

export const icpClient = new ICPClient();