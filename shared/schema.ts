import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  walletAddress: text("wallet_address"),
  kycStatus: text("kyc_status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  propertyType: text("property_type").notNull(),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull(),
  totalTokens: integer("total_tokens").notNull(),
  availableTokens: integer("available_tokens").notNull(),
  expectedROI: decimal("expected_roi", { precision: 5, scale: 2 }).notNull(),
  minInvestment: decimal("min_investment", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  propertyId: integer("property_id").notNull(),
  tokensOwned: integer("tokens_owned").notNull(),
  investmentAmount: decimal("investment_amount", { precision: 10, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  propertyId: integer("property_id").notNull(),
  type: text("type").notNull(), // "purchase", "sale", "dividend"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  tokens: integer("tokens").notNull(),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  proposalType: text("proposal_type").notNull(),
  investmentAmount: decimal("investment_amount", { precision: 10, scale: 2 }),
  expectedROI: decimal("expected_roi", { precision: 5, scale: 2 }),
  votesFor: integer("votes_for").default(0),
  votesAgainst: integer("votes_against").default(0),
  totalVotingPower: integer("total_voting_power").notNull(),
  status: text("status").notNull().default("active"), // "active", "completed", "cancelled"
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  proposalId: integer("proposal_id").notNull(),
  voteType: text("vote_type").notNull(), // "for", "against"
  votingPower: integer("voting_power").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  investments: many(investments),
  transactions: many(transactions),
  votes: many(votes),
}));

export const propertiesRelations = relations(properties, ({ many }) => ({
  investments: many(investments),
  transactions: many(transactions),
  proposals: many(proposals),
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  user: one(users, {
    fields: [investments.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [investments.propertyId],
    references: [properties.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [transactions.propertyId],
    references: [properties.id],
  }),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  property: one(properties, {
    fields: [proposals.propertyId],
    references: [properties.id],
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  proposal: one(proposals, {
    fields: [votes.proposalId],
    references: [proposals.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  purchaseDate: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
