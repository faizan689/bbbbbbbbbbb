import { db } from "./db";
import { users, properties, investments, transactions, proposals, votes } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Seed users
    const seedUsers = await db.insert(users).values([
      {
        username: "john_investor",
        email: "john@example.com",
        walletAddress: "rrkah-fqaaa-aaaah-qcdaq-cai",
        kycStatus: "verified"
      },
      {
        username: "mary_trader",
        email: "mary@example.com", 
        walletAddress: "rdmx6-jaaaa-aaaah-qazqq-cai",
        kycStatus: "verified"
      },
      {
        username: "alex_crypto",
        email: "alex@example.com",
        walletAddress: "ryjl3-tyaaa-aaaah-qazsa-cai", 
        kycStatus: "pending"
      }
    ]).returning();

    console.log(`Created ${seedUsers.length} users`);

    // Seed properties
    const seedProperties = await db.insert(properties).values([
      {
        title: "Manhattan Luxury Residences",
        description: "Premium apartment complex in the heart of Manhattan with high-end amenities.",
        location: "New York, NY",
        propertyType: "Residential",
        totalValue: "4200000",
        totalTokens: 4200,
        availableTokens: 2840,
        expectedROI: "14.2",
        minInvestment: "1000",
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
        isActive: true
      },
      {
        title: "Silicon Valley Tech Campus",
        description: "Modern office complex in the heart of Silicon Valley tech district.",
        location: "Palo Alto, CA",
        propertyType: "Commercial",
        totalValue: "8500000",
        totalTokens: 8500,
        availableTokens: 3400,
        expectedROI: "12.8",
        minInvestment: "2500",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
        isActive: true
      },
      {
        title: "Miami Beach Resort",
        description: "Luxury beachfront resort with premium amenities and ocean views.",
        location: "Miami Beach, FL",
        propertyType: "Hospitality",
        totalValue: "12000000",
        totalTokens: 12000,
        availableTokens: 7200,
        expectedROI: "16.5",
        minInvestment: "5000",
        imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400",
        isActive: true
      },
      {
        title: "Austin Mixed-Use Development",
        description: "Mixed-use development combining retail, office, and residential spaces.",
        location: "Austin, TX",
        propertyType: "Mixed-Use",
        totalValue: "6800000",
        totalTokens: 6800,
        availableTokens: 4760,
        expectedROI: "13.7",
        minInvestment: "1500",
        imageUrl: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400",
        isActive: true
      },
      {
        title: "Chicago Industrial Complex",
        description: "Large-scale industrial complex with modern logistics facilities.",
        location: "Chicago, IL",
        propertyType: "Industrial",
        totalValue: "5400000",
        totalTokens: 5400,
        availableTokens: 2160,
        expectedROI: "11.3",
        minInvestment: "3000",
        imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400",
        isActive: true
      },
      {
        title: "Seattle Waterfront Towers",
        description: "Twin towers with stunning waterfront views and premium finishes.",
        location: "Seattle, WA",
        propertyType: "Residential",
        totalValue: "9200000",
        totalTokens: 9200,
        availableTokens: 5520,
        expectedROI: "15.1",
        minInvestment: "2000",
        imageUrl: "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=400",
        isActive: true
      },
      {
        title: "Mumbai Financial District Tower",
        description: "Premium commercial tower in Bandra Kurla Complex, Mumbai's financial district.",
        location: "Mumbai, Maharashtra",
        propertyType: "Commercial",
        totalValue: "3500000",
        totalTokens: 3500,
        availableTokens: 2450,
        expectedROI: "15.8",
        minInvestment: "800",
        imageUrl: "https://images.unsplash.com/photo-1594736797933-d0d8e1f06ddb?w=400",
        isActive: true
      },
      {
        title: "Bangalore Tech Park",
        description: "State-of-the-art IT campus in Electronic City with world-class infrastructure.",
        location: "Bangalore, Karnataka",
        propertyType: "Commercial",
        totalValue: "2800000",
        totalTokens: 2800,
        availableTokens: 1960,
        expectedROI: "16.2",
        minInvestment: "600",
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
        isActive: true
      },
      {
        title: "Delhi Luxury Residences",
        description: "Ultra-luxurious residential complex in South Delhi with premium amenities.",
        location: "New Delhi, Delhi",
        propertyType: "Residential",
        totalValue: "4200000",
        totalTokens: 4200,
        availableTokens: 2940,
        expectedROI: "14.5",
        minInvestment: "1000",
        imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400",
        isActive: true
      },
      {
        title: "Hyderabad IT Hub",
        description: "Modern office complex in HITEC City, Hyderabad's IT corridor.",
        location: "Hyderabad, Telangana",
        propertyType: "Commercial",
        totalValue: "2100000",
        totalTokens: 2100,
        availableTokens: 1470,
        expectedROI: "17.1",
        minInvestment: "500",
        imageUrl: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400",
        isActive: true
      },
      {
        title: "Pune Metropolitan Mall",
        description: "Premium shopping and entertainment complex in Pune's business district.",
        location: "Pune, Maharashtra",
        propertyType: "Retail",
        totalValue: "1800000",
        totalTokens: 1800,
        availableTokens: 1260,
        expectedROI: "13.8",
        minInvestment: "400",
        imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400",
        isActive: true
      },
      {
        title: "Chennai IT Corridor",
        description: "Technology park in Old Mahabalipuram Road with modern facilities.",
        location: "Chennai, Tamil Nadu",
        propertyType: "Commercial",
        totalValue: "2600000",
        totalTokens: 2600,
        availableTokens: 1820,
        expectedROI: "15.3",
        minInvestment: "650",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
        isActive: true
      }
    ]).returning();

    console.log(`Created ${seedProperties.length} properties`);

    // Seed investments
    const seedInvestments = await db.insert(investments).values([
      {
        userId: seedUsers[0].id,
        propertyId: seedProperties[0].id,
        tokensOwned: 50,
        investmentAmount: "50000",
        currentValue: "52500"
      },
      {
        userId: seedUsers[0].id,
        propertyId: seedProperties[1].id,
        tokensOwned: 25,
        investmentAmount: "62500",
        currentValue: "65000"
      },
      {
        userId: seedUsers[1].id,
        propertyId: seedProperties[0].id,
        tokensOwned: 75,
        investmentAmount: "75000",
        currentValue: "78750"
      },
      {
        userId: seedUsers[1].id,
        propertyId: seedProperties[2].id,
        tokensOwned: 30,
        investmentAmount: "150000",
        currentValue: "157500"
      }
    ]).returning();

    console.log(`Created ${seedInvestments.length} investments`);

    // Seed transactions
    const seedTransactions = await db.insert(transactions).values([
      {
        userId: seedUsers[0].id,
        propertyId: seedProperties[0].id,
        type: "investment",
        amount: "50000",
        tokens: 50,
        transactionHash: "0x1a2b3c4d5e6f"
      },
      {
        userId: seedUsers[0].id,
        propertyId: seedProperties[1].id,
        type: "investment",
        amount: "62500",
        tokens: 25,
        transactionHash: "0x2b3c4d5e6f7a"
      },
      {
        userId: seedUsers[1].id,
        propertyId: seedProperties[0].id,
        type: "investment",
        amount: "75000",
        tokens: 75,
        transactionHash: "0x3c4d5e6f7a8b"
      },
      {
        userId: seedUsers[1].id,
        propertyId: seedProperties[2].id,
        type: "investment",
        amount: "150000",
        tokens: 30,
        transactionHash: "0x4d5e6f7a8b9c"
      },
      {
        userId: seedUsers[0].id,
        propertyId: seedProperties[0].id,
        type: "dividend",
        amount: "2500",
        tokens: 50,
        transactionHash: "0x5e6f7a8b9c0d"
      },
      {
        userId: seedUsers[1].id,
        propertyId: seedProperties[2].id,
        type: "dividend",
        amount: "7500",
        tokens: 30,
        transactionHash: "0x6f7a8b9c0d1e"
      }
    ]).returning();

    console.log(`Created ${seedTransactions.length} transactions`);

    // Seed proposals
    const seedProposals = await db.insert(proposals).values([
      {
        title: "Property Maintenance Upgrade",
        description: "Upgrade the HVAC system and common area lighting to improve energy efficiency and tenant satisfaction.",
        propertyId: seedProperties[0].id,
        proposalType: "maintenance",
        totalVotingPower: 125,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "active",
        votesFor: 85,
        votesAgainst: 15
      },
      {
        title: "Refinancing Opportunity",
        description: "Refinance the property mortgage to take advantage of lower interest rates and improve cash flow.",
        propertyId: seedProperties[1].id,
        proposalType: "financial",
        totalVotingPower: 25,
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: "active",
        votesFor: 20,
        votesAgainst: 3
      },
      {
        title: "New Investment Opportunity",
        description: "Acquire an adjacent property to expand the development and increase overall portfolio value.",
        propertyId: seedProperties[2].id,
        proposalType: "acquisition",
        totalVotingPower: 30,
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: "active",
        investmentAmount: "2500000",
        expectedROI: "18.2",
        votesFor: 22,
        votesAgainst: 5
      }
    ]).returning();

    console.log(`Created ${seedProposals.length} proposals`);

    // Seed votes
    const seedVotes = await db.insert(votes).values([
      {
        userId: seedUsers[0].id,
        proposalId: seedProposals[0].id,
        voteType: "for",
        votingPower: 50
      },
      {
        userId: seedUsers[1].id,
        proposalId: seedProposals[0].id,
        voteType: "for",
        votingPower: 75
      },
      {
        userId: seedUsers[0].id,
        proposalId: seedProposals[1].id,
        voteType: "for",
        votingPower: 25
      },
      {
        userId: seedUsers[1].id,
        proposalId: seedProposals[2].id,
        voteType: "for",
        votingPower: 30
      }
    ]).returning();

    console.log(`Created ${seedVotes.length} votes`);

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

export default seed;

// Run seed if this file is executed directly
seed()
  .then(() => {
    console.log("Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });