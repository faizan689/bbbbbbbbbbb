import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertInvestmentSchema, insertTransactionSchema, insertVoteSchema } from "@shared/schema";
import { z } from "zod";
import { log } from "./vite";

// Input validation schemas
const idParamSchema = z.object({
  id: z.string().transform((val) => {
    const parsed = parseInt(val);
    if (isNaN(parsed) || parsed < 1) {
      throw new Error("Invalid ID parameter");
    }
    return parsed;
  })
});

// Error handling middleware
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class for better error handling
class ApiError extends Error {
  constructor(public statusCode: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Properties
  app.get("/api/properties", asyncHandler(async (req: any, res: any) => {
    log("GET /api/properties", "api");
    const properties = await storage.getProperties();
    res.json(properties);
  }));

  app.get("/api/properties/:id", asyncHandler(async (req: any, res: any) => {
    const { id } = idParamSchema.parse(req.params);
    log(`GET /api/properties/${id}`, "api");
    
    const property = await storage.getProperty(id);
    if (!property) {
      throw new ApiError(404, "Property not found", "PROPERTY_NOT_FOUND");
    }
    res.json(property);
  }));

  // Investments
  app.get("/api/investments", asyncHandler(async (req: any, res: any) => {
    log("GET /api/investments", "api");
    const investments = await storage.getInvestments();
    res.json(investments);
  }));

  app.post("/api/investments", asyncHandler(async (req: any, res: any) => {
    log("POST /api/investments", "api");
    const validatedData = insertInvestmentSchema.parse(req.body);
    
    // Check if property exists and has enough tokens
    const property = await storage.getProperty(validatedData.propertyId);
    if (!property) {
      throw new ApiError(404, "Property not found", "PROPERTY_NOT_FOUND");
    }
    
    if (property.availableTokens < validatedData.tokensOwned) {
      throw new ApiError(400, "Insufficient tokens available", "INSUFFICIENT_TOKENS");
    }
    
    // Create investment
    const investment = await storage.createInvestment(validatedData);
    
    // Update property available tokens
    const newAvailableTokens = property.availableTokens - validatedData.tokensOwned;
    await storage.updatePropertyTokens(validatedData.propertyId, newAvailableTokens);
    
    // Create transaction record
    await storage.createTransaction({
      userId: validatedData.userId,
      propertyId: validatedData.propertyId,
      type: "purchase",
      amount: validatedData.investmentAmount,
      tokens: validatedData.tokensOwned,
      transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
    });
    
    res.status(201).json(investment);
  }));

  app.patch("/api/investments/:id", asyncHandler(async (req: any, res: any) => {
    const { id } = idParamSchema.parse(req.params);
    log(`PATCH /api/investments/${id}`, "api");
    
    // Basic validation for update fields
    const allowedFields = ['isActive', 'currentValue'];
    const updates: any = {};
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "No valid fields to update", "NO_UPDATES");
    }
    
    // Get existing investment
    const investments = await storage.getInvestments();
    const investment = investments.find(inv => inv.id === id);
    
    if (!investment) {
      throw new ApiError(404, "Investment not found", "INVESTMENT_NOT_FOUND");
    }
    
    // Update investment value
    if (updates.currentValue !== undefined) {
      await storage.updateInvestmentValue(id, updates.currentValue);
    }
    
    // For now, we don't have a direct way to update isActive in storage
    // but the currentValue update indicates the sale
    
    res.json({ success: true, message: "Investment updated successfully" });
  }));

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", asyncHandler(async (req: any, res: any) => {
    log("POST /api/transactions", "api");
    const validatedData = insertTransactionSchema.parse(req.body);
    
    const transaction = await storage.createTransaction({
      ...validatedData,
      transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
    });
    
    res.status(201).json(transaction);
  }));

  // Proposals
  app.get("/api/proposals", async (req, res) => {
    try {
      const proposals = await storage.getProposals();
      res.json(proposals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proposals" });
    }
  });

  app.get("/api/proposals/active", async (req, res) => {
    try {
      const proposals = await storage.getActiveProposals();
      res.json(proposals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active proposals" });
    }
  });

  app.post("/api/votes", async (req, res) => {
    try {
      const validatedData = insertVoteSchema.parse(req.body);
      
      // Check if user already voted
      const existingVote = await storage.getVoteByUserAndProposal(
        validatedData.userId, 
        validatedData.proposalId
      );
      
      if (existingVote) {
        return res.status(400).json({ error: "User has already voted on this proposal" });
      }

      const vote = await storage.createVote(validatedData);
      
      // Update proposal vote counts
      const proposal = await storage.getProposal(validatedData.proposalId);
      if (proposal) {
        const currentVotesFor = proposal.votesFor ?? 0;
        const currentVotesAgainst = proposal.votesAgainst ?? 0;
        
        const newVotesFor = validatedData.voteType === "for" 
          ? currentVotesFor + validatedData.votingPower 
          : currentVotesFor;
        const newVotesAgainst = validatedData.voteType === "against" 
          ? currentVotesAgainst + validatedData.votingPower 
          : currentVotesAgainst;
        
        await storage.updateProposalVotes(validatedData.proposalId, newVotesFor, newVotesAgainst);
      }

      res.json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create vote" });
      }
    }
  });

  // Dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      const investments = await storage.getInvestments();
      const transactions = await storage.getTransactions();

      // Calculate portfolio metrics
      const totalPortfolioValue = investments.reduce((sum, inv) => sum + parseFloat(inv.currentValue), 0);
      const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.investmentAmount), 0);
      const totalReturns = totalPortfolioValue - totalInvested;
      const avgROI = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

      // Active properties count
      const activeProperties = properties.filter(p => p.isActive).length;

      // Monthly returns (mock calculation)
      const monthlyReturns = totalPortfolioValue * 0.075; // 7.5% monthly return

      // Token balance (mock)
      const tokenBalance = investments.reduce((sum, inv) => sum + inv.tokensOwned, 0);

      res.json({
        totalPortfolioValue,
        activeProperties,
        monthlyReturns,
        tokenBalance,
        avgROI,
        totalReturns,
        recentTransactions: transactions.slice(-5).reverse()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
