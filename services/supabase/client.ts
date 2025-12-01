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

// Create Supabase client only if properly configured
// Use placeholder values if not configured to prevent errors
const createSupabaseClient = () => {
  if (isSupabaseConfigured()) {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }
  
  // Return a client with placeholder values for demo mode
  // This prevents "supabaseUrl is required" error
  // Using a far future expiration date (year 2099)
  return createClient<Database>(
    'https://placeholder.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6NDA3MDkwODgwMH0.placeholder',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );
};

export const supabase = createSupabaseClient();
