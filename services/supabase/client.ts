import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase URL for this project
const supabaseUrl = 'https://fvksxcavxjslqptjwsvo.supabase.co';

// Load environment variable - works in both local development and Vercel
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Minimum length for a valid Supabase anon key (JWT tokens are typically much longer)
const MIN_KEY_LENGTH = 20;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  const isConfigured = supabaseAnonKey && 
         supabaseAnonKey !== 'your-anon-key-here' &&
         supabaseAnonKey !== 'your-supabase-anon-key' &&
         supabaseAnonKey.length > MIN_KEY_LENGTH;
  
  // Log configuration status for debugging (only in development)
  if (import.meta.env.DEV) {
    if (!isConfigured) {
      console.warn('⚠️ Supabase is not properly configured. Please set VITE_SUPABASE_ANON_KEY environment variable.');
    } else {
      console.log('✅ Supabase client initialized successfully');
    }
  }
  
  return isConfigured;
};

// Create Supabase client - returns null if not properly configured
const createSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase client creation failed: Missing or invalid VITE_SUPABASE_ANON_KEY');
    return null;
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
};

export const supabase = createSupabaseClient();
