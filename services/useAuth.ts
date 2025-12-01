import { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../types';
import { getCurrentUser, onAuthStateChange, type AuthUser } from './authService';
import { navigationGuard, getAuthRedirectPath, type AuthState } from './rbac';

export interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAccess: (page: string) => boolean;
  navigate: (page: string, callback: (page: string) => void) => void;
}

// Custom hook for authentication with RBAC
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const { data: authListener } = onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Check if user has access to a page
  const checkAccess = useCallback((page: string): boolean => {
    if (!user) return false;
    
    const result = navigationGuard(
      user.role,
      user.onboardingComplete,
      page
    );
    
    return result.allowed;
  }, [user]);

  // Navigate with RBAC checks
  const navigate = useCallback((page: string, callback: (page: string) => void) => {
    if (!user) {
      callback('login');
      return;
    }

    const result = navigationGuard(
      user.role,
      user.onboardingComplete,
      page
    );

    if (result.allowed) {
      callback(page);
    } else if (result.redirectTo) {
      console.log(`Access denied to ${page}: ${result.reason}`);
      callback(result.redirectTo);
    }
  }, [user]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    checkAccess,
    navigate
  };
};

// Hook for protecting routes
export interface UseProtectedRouteReturn {
  isAllowed: boolean;
  isLoading: boolean;
  redirectTo: string | null;
}

export const useProtectedRoute = (
  requiredPage: string
): UseProtectedRouteReturn => {
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRoute = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          setIsAllowed(false);
          setRedirectTo('login');
          setIsLoading(false);
          return;
        }

        const result = navigationGuard(
          currentUser.role,
          currentUser.onboardingComplete,
          requiredPage
        );

        setIsAllowed(result.allowed);
        setRedirectTo(result.redirectTo || null);
      } catch (error) {
        console.error('Route protection error:', error);
        setIsAllowed(false);
        setRedirectTo('login');
      } finally {
        setIsLoading(false);
      }
    };

    checkRoute();
  }, [requiredPage]);

  return {
    isAllowed,
    isLoading,
    redirectTo
  };
};
