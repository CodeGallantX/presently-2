import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../types';
import { canAccessRoute } from './rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userRole: UserRole | null;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

/**
 * Protected Route Component
 * Enforces role-based access control for routes
 * Only allows access if user has the required role
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  userRole,
  allowedRoles,
  fallbackPath = '/login'
}) => {
  // If no user role, redirect to login
  if (!userRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If specific allowed roles are defined, check against them
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          message: 'You do not have permission to access this page',
          requiredRole: allowedRoles
        }}
      />
    );
  }

  // Allow access
  return <>{children}</>;
};

/**
 * Admin Only Route
 * Restricts access to admin users only
 */
export const AdminOnlyRoute: React.FC<{ children: React.ReactNode; userRole: UserRole | null }> = ({
  children,
  userRole
}) => {
  return (
    <ProtectedRoute
      userRole={userRole}
      allowedRoles={[UserRole.ADMIN]}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Lecturer Only Route
 * Restricts access to lecturers and admins
 */
export const LecturerOnlyRoute: React.FC<{ children: React.ReactNode; userRole: UserRole | null }> = ({
  children,
  userRole
}) => {
  return (
    <ProtectedRoute
      userRole={userRole}
      allowedRoles={[UserRole.LECTURER, UserRole.ADMIN]}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Student Route
 * Restricts access to students (and admins can view)
 */
export const StudentRoute: React.FC<{ children: React.ReactNode; userRole: UserRole | null }> = ({
  children,
  userRole
}) => {
  return (
    <ProtectedRoute
      userRole={userRole}
      allowedRoles={[UserRole.STUDENT, UserRole.ADMIN]}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
