import { supabase, supabaseAdmin } from './supabase.js';
import { DatabaseStorage } from './storage.js';
import type { IStorage } from './storage.js';
import type { User, Property, Investment, Transaction, Proposal, Vote } from '@shared/schema';

/**
 * Enhanced storage class that combines Drizzle ORM with Supabase real-time features
 */
export class SupabaseStorage extends DatabaseStorage implements IStorage {
  private supabase = supabase;
  private supabaseAdmin = supabaseAdmin;

  constructor() {
    super();
  }

  /**
   * Subscribe to real-time changes for a specific table
   */
  subscribeToTable(table: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();
  }

  /**
   * Subscribe to property changes for real-time updates
   */
  subscribeToProperties(callback: (payload: any) => void) {
    return this.subscribeToTable('properties', callback);
  }

  /**
   * Subscribe to investment changes
   */
  subscribeToInvestments(callback: (payload: any) => void) {
    return this.subscribeToTable('investments', callback);
  }

  /**
   * Subscribe to transaction changes
   */
  subscribeToTransactions(callback: (payload: any) => void) {
    return this.subscribeToTable('transactions', callback);
  }

  /**
   * Subscribe to proposal changes
   */
  subscribeToProposals(callback: (payload: any) => void) {
    return this.subscribeToTable('proposals', callback);
  }

  /**
   * Get user profile with Supabase auth integration
   */
  async getUserProfile(authId: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', authId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return undefined;
    }

    return data;
  }

  /**
   * Create user with Supabase auth integration
   */
  async createUserWithAuth(userData: any): Promise<User | undefined> {
    const { data, error } = await this.supabaseAdmin
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return undefined;
    }

    return data;
  }

  /**
   * Get real-time portfolio value updates
   */
  async getPortfolioRealtimeUpdates(userId: number, callback: (value: number) => void) {
    // Subscribe to investment changes for this user
    return this.supabase
      .channel(`user-${userId}-portfolio`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'investments',
          filter: `userId=eq.${userId}`
        },
        async () => {
          // Recalculate portfolio value
          const investments = await this.getInvestmentsByUser(userId);
          const totalValue = investments.reduce((sum, inv) => 
            sum + parseFloat(inv.currentValue), 0
          );
          callback(totalValue);
        }
      )
      .subscribe();
  }

  /**
   * Broadcast investment updates to all clients
   */
  async broadcastInvestmentUpdate(investment: Investment) {
    await this.supabase
      .channel('investment-updates')
      .send({
        type: 'broadcast',
        event: 'investment-update',
        payload: investment
      });
  }

  /**
   * Broadcast property updates to all clients
   */
  async broadcastPropertyUpdate(property: Property) {
    await this.supabase
      .channel('property-updates')
      .send({
        type: 'broadcast',
        event: 'property-update',
        payload: property
      });
  }
}

export const supabaseStorage = new SupabaseStorage();