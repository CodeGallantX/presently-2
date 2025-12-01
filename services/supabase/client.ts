import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Hardcoded Supabase URL for this project
const supabaseUrl = 'https://fvksxcavxjslqptjwsvo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Minimum length for a valid Supabase anon key (JWT tokens are typically much longer)
const MIN_KEY_LENGTH = 20;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseAnonKey && 
         supabaseAnonKey !== 'your-anon-key-here' &&
         supabaseAnonKey !== 'your-supabase-anon-key' &&
         supabaseAnonKey.length > MIN_KEY_LENGTH; // Basic validation for a real key
};

// Create Supabase client - always create a client but with configuration check
const createSupabaseClient = () => {
  // If not properly configured, create a client with placeholder values
  // The auth functions will check isSupabaseConfigured() and return errors
  if (!isSupabaseConfigured()) {
    // Create a minimal client with placeholder values to avoid initialization errors
    // Real operations will be blocked by isSupabaseConfigured() checks in auth functions
    // Using a placeholder URL and a valid JWT format placeholder key to prevent parsing errors
    return createClient<Database>(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDU1MjAwMH0.placeholder-signature',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );
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
