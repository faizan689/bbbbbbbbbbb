import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertInvestmentSchema, insertTransactionSchema, insertVoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Properties
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  // Investments
  app.get("/api/investments", async (req, res) => {
    try {
      const investments = await storage.getInvestments();
      res.json(investments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investments" });
    }
  });

  app.post("/api/investments", async (req, res) => {
    try {
      const validatedData = insertInvestmentSchema.parse(req.body);
      const investment = await storage.createInvestment(validatedData);
      
      // Update property available tokens
      const property = await storage.getProperty(validatedData.propertyId);
      if (property) {
        const newAvailableTokens = property.availableTokens - validatedData.tokensOwned;
        await storage.updatePropertyTokens(validatedData.propertyId, newAvailableTokens);
      }

      // Create transaction record
      await storage.createTransaction({
        userId: validatedData.userId,
        propertyId: validatedData.propertyId,
        type: "purchase",
        amount: validatedData.investmentAmount,
        tokens: validatedData.tokensOwned,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
      });

      res.json(investment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create investment" });
      }
    }
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

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
