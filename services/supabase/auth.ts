import { supabase, isSupabaseConfigured } from './client';
import { UserRole } from '../../types';

export interface AuthResponse {
  success: boolean;
  error?: string;
  requiresEmailVerification?: boolean;
  requiresOnboarding?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    onboardingComplete: boolean;
  };
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResponse> {
  if (!isSupabaseConfigured()) {
    return { 
      success: false, 
      error: 'Supabase is not configured. Please set up your environment variables.' 
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/#/onboarding`
      }
    });

    if (error) throw error;

    if (!data.user) {
      return { success: false, error: 'Failed to create user' };
    }

    // Create profile entry
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        role: 'STUDENT', // Default role, will be updated during onboarding
        onboarding_complete: false
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    return {
      success: true,
      requiresEmailVerification: !data.session,
      requiresOnboarding: true,
      user: data.user ? {
        id: data.user.id,
        email: data.user.email!,
        name: fullName,
        role: 'STUDENT' as UserRole,
        onboardingComplete: false
      } : undefined
    };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message || 'Failed to sign up' };
  }
}

// Sign in with email and password
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  if (!isSupabaseConfigured()) {
    return { 
      success: false, 
      error: 'Supabase is not configured. Please set up your environment variables.' 
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user) {
      return { success: false, error: 'Failed to sign in' };
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return { success: false, error: 'Failed to fetch profile' };
    }

    return {
      success: true,
      requiresOnboarding: !profile.onboarding_complete,
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: profile.full_name,
        role: profile.role as UserRole,
        onboardingComplete: profile.onboarding_complete
      }
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message || 'Failed to sign in' };
  }
}

// Sign in with Google OAuth
export async function signInWithGoogle(): Promise<AuthResponse> {
  if (!isSupabaseConfigured()) {
    return { 
      success: false, 
      error: 'Supabase is not configured. Please set up your environment variables.' 
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/#/onboarding`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) throw error;

    return { success: true, requiresOnboarding: true };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    return { success: false, error: error.message || 'Failed to sign in with Google' };
  }
}

// Sign out
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }; // Allow sign out even if not configured
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message || 'Failed to sign out' };
  }
}

// Update user profile after onboarding
export async function completeOnboarding(
  userId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { 
      success: false, 
      error: 'Supabase is not configured. Please set up your environment variables.' 
    };
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        role,
        onboarding_complete: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Complete onboarding error:', error);
    return { success: false, error: error.message || 'Failed to complete onboarding' };
  }
}

// Get current session
export async function getCurrentSession() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

// Get current user profile
export async function getCurrentUserProfile() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return {
      id: user.id,
      email: user.email!,
      name: profile.full_name,
      role: profile.role as UserRole,
      onboardingComplete: profile.onboarding_complete,
      avatar: profile.avatar_url
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
}
