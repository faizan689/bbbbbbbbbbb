import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;
let isConfigured = false;

// Initialize Supabase client dynamically
export const initializeSupabase = async () => {
  try {
    const response = await fetch('/api/supabase-config');
    const config = await response.json();
    
    if (config.configured && config.url && config.anonKey) {
      supabaseClient = createClient(config.url, config.anonKey);
      isConfigured = true;
      console.log('Supabase client initialized successfully');
    } else {
      console.warn('Supabase not configured on server');
    }
  } catch (error) {
    console.warn('Could not initialize Supabase:', error);
  }
};

// Get the Supabase client (may be null)
export const getSupabase = () => supabaseClient;

// Check if Supabase is configured
export const isSupabaseConfigured = () => isConfigured;

// Default export for compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    if (!supabaseClient) {
      console.warn(`Supabase method ${String(prop)} called but client not initialized`);
      return () => Promise.resolve(null);
    }
    return supabaseClient[prop as keyof SupabaseClient];
  }
});

// Auth helpers
export const auth = supabase.auth;

// Database helpers
export const db = supabase;

// Real-time helpers
export const realtime = supabase.realtime;