import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../services/supabase/client';
import { UserRole } from '../../types';

interface CallbackState {
  loading: boolean;
  error: string | null;
  message: string;
}

/**
 * Auth Callback Component
 * Handles OAuth provider callbacks and email verification redirects
 * Implements RBAC (Role-Based Access Control) for proper route redirection
 */
export const AuthCallback: React.FC<{
  onAuthSuccess?: (userId: string, role: UserRole, onboardingComplete: boolean) => void;
}> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<CallbackState>({
    loading: true,
    error: null,
    message: 'Processing authentication...'
  });

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      setState(prev => ({ ...prev, message: 'Verifying authentication...' }));

      // Get the session from the URL hash/fragment
      // Supabase redirects with #access_token=... in the URL
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw new Error(`Auth error: ${error.message}`);
      }

      if (!data.session) {
        // No session found - might be an invalid callback
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'No session found. Please try logging in again.',
          message: ''
        }));

        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      const user = data.session.user;

      setState(prev => ({ ...prev, message: 'Fetching user profile...' }));

      // Fetch user profile to determine role and onboarding status
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, onboarding_complete, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to fetch user profile');
      }

      if (!profileData) {
        throw new Error('User profile not found');
      }

      const userRole = profileData.role as UserRole;
      const onboardingComplete = profileData.onboarding_complete;

      // Call success callback if provided
      if (onAuthSuccess) {
        onAuthSuccess(user.id, userRole, onboardingComplete);
      }

      // RBAC: Redirect based on role and onboarding status
      setState(prev => ({ ...prev, message: 'Redirecting...' }));
      redirectUserByRole(userRole, onboardingComplete, user.id);

    } catch (error: any) {
      console.error('Callback error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'An error occurred during authentication',
        message: ''
      }));

      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  };

  /**
   * RBAC Logic: Redirect users based on their role and onboarding status
   */
  const redirectUserByRole = (role: UserRole, onboardingComplete: boolean, userId: string) => {
    // If onboarding not complete, direct to onboarding
    if (!onboardingComplete) {
      navigate('/onboarding', { replace: true, state: { userId } });
      return;
    }

    // If onboarding is complete, redirect to appropriate dashboard
    switch (role) {
      case UserRole.STUDENT:
        navigate('/dashboard?tab=sessions', { replace: true });
        break;
      case UserRole.LECTURER:
        navigate('/dashboard?tab=courses', { replace: true });
        break;
      case UserRole.ADMIN:
        navigate('/dashboard?tab=users', { replace: true });
        break;
      case UserRole.CLASS_REP:
        navigate('/dashboard?tab=attendance', { replace: true });
        break;
      default:
        navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Loading State */}
        {state.loading && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
            </div>
            <p className="mt-6 text-lg text-foreground font-medium">{state.message}</p>
            <p className="mt-2 text-sm text-zinc-400">This should only take a moment...</p>
          </div>
        )}

        {/* Error State */}
        {!state.loading && state.error && (
          <div className="text-center">
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg inline-flex items-center justify-center w-16 h-16">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mt-4">Authentication Failed</h2>
            <p className="mt-2 text-sm text-zinc-400">{state.error}</p>
            <p className="mt-4 text-xs text-zinc-500">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
