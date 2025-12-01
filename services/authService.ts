import { supabase } from './supabase';
import { UserRole } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  matricNumber?: string;
  department?: string;
  level?: string;
  staffId?: string;
  onboardingComplete: boolean;
  avatar?: string;
}

// Sign up with email and password
export const signUp = async (email: string, password: string, name: string): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          onboarding_complete: false
        }
      }
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Failed to create user' };
    }

    // Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        name,
        onboarding_complete: false
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email!,
      name,
      role: UserRole.STUDENT, // Default role, will be set during onboarding
      onboardingComplete: false
    };

    return { user: authUser, error: null };
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : 'An error occurred during sign up' };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Failed to sign in' };
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.name || data.user.user_metadata.name || 'User',
      role: profile?.role || UserRole.STUDENT,
      phoneNumber: profile?.phone_number,
      matricNumber: profile?.matric_number,
      department: profile?.department,
      level: profile?.level,
      staffId: profile?.staff_id,
      onboardingComplete: profile?.onboarding_complete || false,
      avatar: profile?.avatar
    };

    return { user: authUser, error: null };
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : 'An error occurred during sign in' };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred during sign out' };
  }
};

// Get current user session
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    // Get user profile from database
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    const authUser: AuthUser = {
      id: user.id,
      email: user.email!,
      name: profile?.name || user.user_metadata.name || 'User',
      role: profile?.role || UserRole.STUDENT,
      phoneNumber: profile?.phone_number,
      matricNumber: profile?.matric_number,
      department: profile?.department,
      level: profile?.level,
      staffId: profile?.staff_id,
      onboardingComplete: profile?.onboarding_complete || false,
      avatar: profile?.avatar
    };

    return authUser;
  } catch (err) {
    console.error('Error getting current user:', err);
    return null;
  }
};

// Update user profile during onboarding
export const updateUserProfile = async (
  userId: string,
  updates: Partial<{
    name: string;
    role: UserRole;
    phoneNumber: string;
    matricNumber: string;
    department: string;
    level: string;
    staffId: string;
    onboardingComplete: boolean;
    avatar: string;
  }>
): Promise<{ error: string | null }> => {
  try {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.matricNumber !== undefined) dbUpdates.matric_number = updates.matricNumber;
    if (updates.department !== undefined) dbUpdates.department = updates.department;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.staffId !== undefined) dbUpdates.staff_id = updates.staffId;
    if (updates.onboardingComplete !== undefined) dbUpdates.onboarding_complete = updates.onboardingComplete;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;

    const { error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', userId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred during profile update' };
  }
};

// Sign in with Google OAuth
export const signInWithGoogle = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred during Google sign in' };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
};
