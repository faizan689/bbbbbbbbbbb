import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { supabase, supabaseAdmin } from './supabase.js';

const { Pool } = pg;

// Use Supabase connection string format for PostgreSQL
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseConnectionString = process.env.DATABASE_URL || 
  (supabaseUrl ? `postgresql://postgres:[YOUR-PASSWORD]@${supabaseUrl.replace('https://', '').replace('.supabase.co', '')}.supabase.co:5432/postgres` : null);

if (!supabaseConnectionString) {
  throw new Error(
    "DATABASE_URL must be set. Please provide your Supabase PostgreSQL connection string.",
  );
}

export const pool = new Pool({ connectionString: supabaseConnectionString });
export const db = drizzle({ client: pool, schema });

// Export Supabase clients for real-time and auth features
export { supabase, supabaseAdmin };