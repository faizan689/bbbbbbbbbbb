import OpenAI from "openai";
import { storage } from "./storage.js";
import type { Property, Investment, User } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PropertyRecommendation {
  property: Property;
  score: number;
  reasons: string[];
  riskLevel: 'low' | 'medium' | 'high';
  matchPercentage: number;
}

export interface UserInvestmentProfile {
  preferredInvestmentRange: { min: number; max: number };
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredPropertyTypes: string[];
  preferredLocations: string[];
  investmentGoals: string[];
}

export class AIRecommendationEngine {
  async analyzeUserProfile(userId: number): Promise<UserInvestmentProfile> {
    try {
      const user = await storage.getUser(userId);
      const investments = await storage.getInvestmentsByUser(userId);
      
      if (!user || investments.length === 0) {
        // Return default profile for new users
        return {
          preferredInvestmentRange: { min: 1000, max: 50000 },
          riskTolerance: 'moderate',
          preferredPropertyTypes: ['residential', 'commercial'],
          preferredLocations: ['urban', 'suburban'],
          investmentGoals: ['long-term growth', 'passive income']
        };
      }

      const prompt = `
        Analyze this real estate investor's profile and investment history to determine their preferences:
        
        User Profile:
        - Total Investments: ${investments.length}
        - KYC Status: ${user.kycStatus}
        - Registration Date: ${user.createdAt}
        
        Investment History:
        ${investments.map(inv => `
          - Property ID: ${inv.propertyId}
          - Investment: $${inv.investmentAmount}
          - Current Value: $${inv.currentValue}
          - Tokens: ${inv.tokensOwned}
        `).join('')}
        
        Based on this data, determine the user's investment profile and respond with JSON in this exact format:
        {
          "preferredInvestmentRange": { "min": number, "max": number },
          "riskTolerance": "conservative" | "moderate" | "aggressive",
          "preferredPropertyTypes": ["type1", "type2"],
          "preferredLocations": ["location1", "location2"],
          "investmentGoals": ["goal1", "goal2"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a real estate investment analyst. Analyze user data and respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return analysis;
    } catch (error) {
      console.error('Error analyzing user profile:', error);
      // Return default profile on error
      return {
        preferredInvestmentRange: { min: 1000, max: 50000 },
        riskTolerance: 'moderate',
        preferredPropertyTypes: ['residential', 'commercial'],
        preferredLocations: ['urban', 'suburban'],
        investmentGoals: ['long-term growth', 'passive income']
      };
    }
  }

  async generateRecommendations(userId: number, limit: number = 5): Promise<PropertyRecommendation[]> {
    try {
      const userProfile = await this.analyzeUserProfile(userId);
      const allProperties = await storage.getProperties();
      const userInvestments = await storage.getInvestmentsByUser(userId);
      
      // Filter out properties user already invested in
      const investedPropertyIds = userInvestments.map(inv => inv.propertyId);
      const availableProperties = allProperties.filter(prop => 
        !investedPropertyIds.includes(prop.id) && prop.availableTokens > 0
      );

      if (availableProperties.length === 0) {
        return [];
      }

      const prompt = `
        As a real estate investment AI, recommend the best properties for this user based on their profile and preferences.

        User Investment Profile:
        - Preferred Investment Range: $${userProfile.preferredInvestmentRange.min} - $${userProfile.preferredInvestmentRange.max}
        - Risk Tolerance: ${userProfile.riskTolerance}
        - Preferred Property Types: ${userProfile.preferredPropertyTypes.join(', ')}
        - Preferred Locations: ${userProfile.preferredLocations.join(', ')}
        - Investment Goals: ${userProfile.investmentGoals.join(', ')}

        Available Properties:
        ${availableProperties.map(prop => `
          Property ID: ${prop.id}
          Title: ${prop.title}
          Location: ${prop.location}
          Type: ${prop.propertyType}
          Total Value: $${prop.totalValue}
          Min Investment: $${prop.minInvestment}
          Expected ROI: ${prop.expectedROI}%
          Available Tokens: ${prop.availableTokens}/${prop.totalTokens}
          Description: ${prop.description}
        `).join('\n')}

        Analyze each property and provide recommendations. Respond with JSON array containing exactly this structure:
        [
          {
            "propertyId": number,
            "score": number (0-100),
            "reasons": ["reason1", "reason2", "reason3"],
            "riskLevel": "low" | "medium" | "high",
            "matchPercentage": number (0-100)
          }
        ]

        Consider factors like:
        - Alignment with user's risk tolerance and investment goals
        - Property location preferences
        - Investment amount fit within preferred range
        - Expected ROI vs risk level
        - Property type preferences
        - Market potential and growth prospects
      `;

      let recommendations: any[] = [];
      
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert real estate investment advisor. Provide data-driven property recommendations based on user profiles."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.4
        });

        const aiRecommendations = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
        recommendations = aiRecommendations.recommendations || [];
      } catch (error) {
        console.error('OpenAI API error, using fallback logic:', error);
        
        // Fallback to rule-based recommendations when OpenAI is unavailable
        recommendations = this.generateFallbackRecommendations(availableProperties, userProfile);
      }

      // Map AI recommendations to full property objects
      const propertyRecommendations: PropertyRecommendation[] = recommendations
        .map((rec: any) => {
          const property = availableProperties.find(p => p.id === rec.propertyId);
          if (!property) return null;
          
          return {
            property,
            score: rec.score,
            reasons: rec.reasons,
            riskLevel: rec.riskLevel,
            matchPercentage: rec.matchPercentage
          };
        })
        .filter((rec: PropertyRecommendation | null): rec is PropertyRecommendation => rec !== null)
        .sort((a: PropertyRecommendation, b: PropertyRecommendation) => b.score - a.score)
        .slice(0, limit);

      return propertyRecommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  private generateFallbackRecommendations(availableProperties: Property[], userProfile: UserInvestmentProfile): any[] {
    return availableProperties.map((property, index) => {
      const minInvestment = parseInt(property.minInvestment.replace(/[^0-9]/g, ''));
      const expectedROI = parseFloat(property.expectedROI);
      
      // Simple rule-based scoring
      let score = 50;
      let reasons: string[] = [];
      let riskLevel: 'low' | 'medium' | 'high' = 'medium';
      
      // Check investment range fit
      if (minInvestment >= userProfile.preferredInvestmentRange.min && 
          minInvestment <= userProfile.preferredInvestmentRange.max) {
        score += 20;
        reasons.push('Investment amount fits your preferred range');
      }
      
      // Check property type preference
      if (userProfile.preferredPropertyTypes.includes(property.propertyType)) {
        score += 15;
        reasons.push('Matches your preferred property type');
      }
      
      // Check location preference
      if (userProfile.preferredLocations.some(loc => 
          property.location.toLowerCase().includes(loc.toLowerCase()))) {
        score += 15;
        reasons.push('Located in your preferred area');
      }
      
      // Risk assessment based on ROI
      if (expectedROI > 15) {
        riskLevel = 'high';
        if (userProfile.riskTolerance === 'aggressive') {
          score += 10;
          reasons.push('High ROI potential aligns with your risk tolerance');
        }
      } else if (expectedROI > 10) {
        riskLevel = 'medium';
        if (userProfile.riskTolerance === 'moderate') {
          score += 10;
          reasons.push('Balanced risk-return profile');
        }
      } else {
        riskLevel = 'low';
        if (userProfile.riskTolerance === 'conservative') {
          score += 10;
          reasons.push('Low-risk investment suitable for conservative approach');
        }
      }
      
      // Add general reasons if none specific
      if (reasons.length === 0) {
        reasons.push('Solid investment opportunity');
        reasons.push('Available for fractional ownership');
      }
      
      return {
        propertyId: property.id,
        score: Math.min(score, 100),
        reasons: reasons.slice(0, 3),
        riskLevel,
        matchPercentage: Math.min(score, 100)
      };
    }).sort((a, b) => b.score - a.score);
  }

  async explainRecommendation(propertyId: number, userId: number): Promise<string> {
    try {
      const property = await storage.getProperty(propertyId);
      const userProfile = await this.analyzeUserProfile(userId);
      
      if (!property) {
        return "Property not found";
      }

      const prompt = `
        Provide a detailed explanation of why this property is recommended for the user.

        User Profile:
        - Investment Range: $${userProfile.preferredInvestmentRange.min} - $${userProfile.preferredInvestmentRange.max}
        - Risk Tolerance: ${userProfile.riskTolerance}
        - Preferred Types: ${userProfile.preferredPropertyTypes.join(', ')}
        - Preferred Locations: ${userProfile.preferredLocations.join(', ')}
        - Goals: ${userProfile.investmentGoals.join(', ')}

        Recommended Property:
        - Title: ${property.title}
        - Location: ${property.location}
        - Type: ${property.propertyType}
        - Value: $${property.totalValue}
        - Min Investment: $${property.minInvestment}
        - Expected ROI: ${property.expectedROI}%
        - Description: ${property.description}

        Write a comprehensive, personalized explanation (2-3 paragraphs) of why this property aligns with their investment profile and goals. Be specific about the financial benefits, risk factors, and strategic fit.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional real estate investment advisor providing personalized property recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6
      });

      return response.choices[0].message.content || "Unable to generate explanation";
    } catch (error) {
      console.error('Error explaining recommendation:', error);
      return "Unable to generate detailed explanation at this time";
    }
  }
}

export const aiRecommendationEngine = new AIRecommendationEngine();