import { 
  users, properties, investments, transactions, proposals, votes,
  type User, type InsertUser, type Property, type InsertProperty,
  type Investment, type InsertInvestment, type Transaction, type InsertTransaction,
  type Proposal, type InsertProposal, type Vote, type InsertVote
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        walletAddress: insertUser.walletAddress ?? null,
        kycStatus: insertUser.kycStatus ?? "pending"
      })
      .returning();
    return user;
  }

  // Property operations
  async getProperties(): Promise<Property[]> {
    return await db.select().from(properties);
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values({
        ...insertProperty,
        isActive: insertProperty.isActive ?? true
      })
      .returning();
    return property;
  }

  async updatePropertyTokens(id: number, availableTokens: number): Promise<void> {
    await db
      .update(properties)
      .set({ availableTokens })
      .where(eq(properties.id, id));
  }

  // Investment operations
  async getInvestments(): Promise<Investment[]> {
    return await db.select().from(investments);
  }

  async getInvestmentsByUser(userId: number): Promise<Investment[]> {
    return await db.select().from(investments).where(eq(investments.userId, userId));
  }

  async getInvestmentsByProperty(propertyId: number): Promise<Investment[]> {
    return await db.select().from(investments).where(eq(investments.propertyId, propertyId));
  }

  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const [investment] = await db
      .insert(investments)
      .values(insertInvestment)
      .returning();
    return investment;
  }

  async updateInvestmentValue(id: number, currentValue: string): Promise<void> {
    await db
      .update(investments)
      .set({ currentValue })
      .where(eq(investments.id, id));
  }

  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...insertTransaction,
        transactionHash: insertTransaction.transactionHash ?? null
      })
      .returning();
    return transaction;
  }

  // Proposal operations
  async getProposals(): Promise<Proposal[]> {
    return await db.select().from(proposals);
  }

  async getActiveProposals(): Promise<Proposal[]> {
    return await db.select().from(proposals).where(eq(proposals.status, "active"));
  }

  async getProposal(id: number): Promise<Proposal | undefined> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    return proposal || undefined;
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const [proposal] = await db
      .insert(proposals)
      .values({
        ...insertProposal,
        expectedROI: insertProposal.expectedROI ?? null,
        investmentAmount: insertProposal.investmentAmount ?? null,
        status: insertProposal.status ?? "active",
        votesFor: insertProposal.votesFor ?? 0,
        votesAgainst: insertProposal.votesAgainst ?? 0
      })
      .returning();
    return proposal;
  }

  async updateProposalVotes(id: number, votesFor: number, votesAgainst: number): Promise<void> {
    await db
      .update(proposals)
      .set({ votesFor, votesAgainst })
      .where(eq(proposals.id, id));
  }

  // Vote operations
  async getVotes(): Promise<Vote[]> {
    return await db.select().from(votes);
  }

  async getVotesByProposal(proposalId: number): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.proposalId, proposalId));
  }

  async getVoteByUserAndProposal(userId: number, proposalId: number): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.proposalId, proposalId)));
    return vote || undefined;
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const [vote] = await db
      .insert(votes)
      .values(insertVote)
      .returning();
    return vote;
  }
}

export const storage = new DatabaseStorage();