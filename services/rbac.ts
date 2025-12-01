import { UserRole } from '../types';

// Define page access rules by role
export const ROLE_PERMISSIONS = {
  [UserRole.STUDENT]: {
    allowedPages: ['dashboard', 'profile', 'notifications', 'settings'],
    defaultPage: 'dashboard',
    restrictedPages: ['admin', 'lecturer-tools']
  },
  [UserRole.LECTURER]: {
    allowedPages: ['dashboard', 'profile', 'notifications', 'settings', 'lecturer-tools'],
    defaultPage: 'dashboard',
    restrictedPages: ['admin']
  },
  [UserRole.ADMIN]: {
    allowedPages: ['dashboard', 'profile', 'notifications', 'settings', 'admin', 'lecturer-tools'],
    defaultPage: 'dashboard',
    restrictedPages: []
  },
  [UserRole.CLASS_REP]: {
    allowedPages: ['dashboard', 'profile', 'notifications', 'settings'],
    defaultPage: 'dashboard',
    restrictedPages: ['admin', 'lecturer-tools']
  }
};

// Check if a role has access to a specific page
export const hasPageAccess = (role: UserRole, page: string): boolean => {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  
  return permissions.allowedPages.includes(page) && !permissions.restrictedPages.includes(page);
};

// Get default page for a role
export const getDefaultPageForRole = (role: UserRole): string => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.defaultPage || 'dashboard';
};

// Redirect callback type
export type RedirectCallback = (page: string) => void;

// RBAC redirect handler
export const handleRoleBasedRedirect = (
  role: UserRole | null,
  requestedPage: string,
  callback: RedirectCallback
): void => {
  if (!role) {
    // Not authenticated - redirect to login
    callback('login');
    return;
  }

  // Check if user has access to requested page
  if (hasPageAccess(role, requestedPage)) {
    callback(requestedPage);
  } else {
    // User doesn't have access - redirect to their default page
    const defaultPage = getDefaultPageForRole(role);
    callback(defaultPage);
  }
};

// Check if onboarding is required
export const requiresOnboarding = (onboardingComplete: boolean): boolean => {
  return !onboardingComplete;
};

// Navigation guard with RBAC
export interface NavigationGuardResult {
  allowed: boolean;
  redirectTo?: string;
  reason?: string;
}

export const navigationGuard = (
  role: UserRole | null,
  onboardingComplete: boolean,
  requestedPage: string
): NavigationGuardResult => {
  // Check authentication
  if (!role) {
    return {
      allowed: false,
      redirectTo: 'login',
      reason: 'Not authenticated'
    };
  }

  // Check onboarding status
  if (requiresOnboarding(onboardingComplete) && requestedPage !== 'onboarding') {
    return {
      allowed: false,
      redirectTo: 'onboarding',
      reason: 'Onboarding not completed'
    };
  }

  // Prevent access to onboarding if already completed
  if (!requiresOnboarding(onboardingComplete) && requestedPage === 'onboarding') {
    return {
      allowed: false,
      redirectTo: getDefaultPageForRole(role),
      reason: 'Onboarding already completed'
    };
  }

  // Check role-based access
  if (!hasPageAccess(role, requestedPage)) {
    return {
      allowed: false,
      redirectTo: getDefaultPageForRole(role),
      reason: 'Insufficient permissions'
    };
  }

  return {
    allowed: true
  };
};

// Auth state with RBAC
export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
    onboardingComplete: boolean;
  } | null;
}

// Get redirect path based on auth state
export const getAuthRedirectPath = (
  authState: AuthState,
  currentPath: string
): string | null => {
  // Public pages that don't require auth
  const publicPages = ['landing', 'login', 'register'];
  
  if (!authState.isAuthenticated) {
    // Not authenticated - redirect to login if trying to access protected page
    if (!publicPages.includes(currentPath)) {
      return 'login';
    }
    return null;
  }

  // Authenticated - check onboarding
  if (authState.user && requiresOnboarding(authState.user.onboardingComplete)) {
    if (currentPath !== 'onboarding') {
      return 'onboarding';
    }
    return null;
  }

  // Authenticated and onboarded - check if on public page
  if (publicPages.includes(currentPath)) {
    return authState.user ? getDefaultPageForRole(authState.user.role) : null;
  }

  // Check role-based access
  if (authState.user && !hasPageAccess(authState.user.role, currentPath)) {
    return getDefaultPageForRole(authState.user.role);
  }

  return null;
};
