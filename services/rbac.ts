import { UserRole } from '../types';

/**
 * RBAC (Role-Based Access Control) Utility Functions
 * Provides helper methods for role-based authorization and routing
 */

/**
 * Define role hierarchy and permissions
 */
export const rolePermissions = {
  [UserRole.STUDENT]: {
    canViewDashboard: true,
    canJoinSession: true,
    canViewProfile: true,
    canViewNotifications: true,
    canAccessSettings: true,
    canModifyOwnProfile: true,
    canViewCourses: true,
    canMarkAttendance: true,
  },
  [UserRole.LECTURER]: {
    canViewDashboard: true,
    canCreateSession: true,
    canViewProfile: true,
    canViewNotifications: true,
    canAccessSettings: true,
    canModifyOwnProfile: true,
    canManageStudents: true,
    canViewAttendance: true,
    canCreateCourses: true,
    canGradeStudents: true,
  },
  [UserRole.ADMIN]: {
    canViewDashboard: true,
    canManageUsers: true,
    canManageLecturers: true,
    canManageStudents: true,
    canViewAllSessions: true,
    canViewAllAttendance: true,
    canAccessSettings: true,
    canManageRoles: true,
    canGenerateReports: true,
    canAccessAdminPanel: true,
  },
  [UserRole.CLASS_REP]: {
    canViewDashboard: true,
    canViewProfile: true,
    canViewNotifications: true,
    canAccessSettings: true,
    canManageClassAttendance: true,
    canViewClassStats: true,
    canCommunicateWithClass: true,
  },
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(role: UserRole, permission: keyof typeof rolePermissions[UserRole]): boolean {
  const permissions = rolePermissions[role];
  return (permissions[permission as any] as boolean) ?? false;
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: (keyof typeof rolePermissions[UserRole])[]
): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: (keyof typeof rolePermissions[UserRole])[]
): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get the default dashboard path for a role
 */
export function getDefaultDashboardPath(role: UserRole): string {
  switch (role) {
    case UserRole.STUDENT:
      return '/dashboard?tab=sessions';
    case UserRole.LECTURER:
      return '/dashboard?tab=courses';
    case UserRole.ADMIN:
      return '/dashboard?tab=users';
    case UserRole.CLASS_REP:
      return '/dashboard?tab=attendance';
    default:
      return '/dashboard';
  }
}

/**
 * Check if a user can access a specific route based on their role
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  // Admin can access everything
  if (role === UserRole.ADMIN) {
    return true;
  }

  // Define route access by role
  const routeAccess: { [key: string]: UserRole[] } = {
    '/dashboard': [UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN, UserRole.CLASS_REP],
    '/profile': [UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN, UserRole.CLASS_REP],
    '/notifications': [UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN, UserRole.CLASS_REP],
    '/settings': [UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN, UserRole.CLASS_REP],
    '/admin': [UserRole.ADMIN],
  };

  const allowedRoles = routeAccess[route] || [];
  return allowedRoles.includes(role);
}

/**
 * Get accessible tabs/pages for a role in the dashboard
 */
export function getAccessiblePages(role: UserRole): string[] {
  const basePages = ['profile', 'notifications', 'settings'];

  switch (role) {
    case UserRole.STUDENT:
      return ['dashboard', 'sessions', 'courses', ...basePages];
    case UserRole.LECTURER:
      return ['dashboard', 'courses', 'students', 'grades', ...basePages];
    case UserRole.ADMIN:
      return ['dashboard', 'users', 'lecturers', 'reports', 'settings', ...basePages];
    case UserRole.CLASS_REP:
      return ['dashboard', 'attendance', 'class-stats', ...basePages];
    default:
      return basePages;
  }
}

/**
 * Role hierarchy for cascading permissions
 * Admin > Lecturer > Class_Rep > Student
 */
export function getRoleHierarchy(): UserRole[] {
  return [UserRole.ADMIN, UserRole.LECTURER, UserRole.CLASS_REP, UserRole.STUDENT];
}

/**
 * Check if one role has higher authority than another
 */
export function hasHigherAuthority(role1: UserRole, role2: UserRole): boolean {
  const hierarchy = getRoleHierarchy();
  return hierarchy.indexOf(role1) < hierarchy.indexOf(role2);
}

/**
 * Validate if a role transition is allowed
 * (e.g., Student can be promoted to ClassRep, but not directly to Admin)
 */
export function isValidRoleTransition(fromRole: UserRole, toRole: UserRole): boolean {
  const validTransitions: { [key in UserRole]: UserRole[] } = {
    [UserRole.STUDENT]: [UserRole.CLASS_REP],
    [UserRole.CLASS_REP]: [UserRole.LECTURER],
    [UserRole.LECTURER]: [UserRole.ADMIN],
    [UserRole.ADMIN]: [], // Admin cannot transition to other roles
  };

  return validTransitions[fromRole].includes(toRole);
}
