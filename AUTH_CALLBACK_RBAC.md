# Auth Callback & RBAC Documentation

## Overview

The authentication callback system handles OAuth provider redirects, email verification, and implements Role-Based Access Control (RBAC) to route users to appropriate dashboards based on their roles and onboarding status.

## Components

### 1. **AuthCallback Component** (`components/Auth/Callback.tsx`)

Handles all authentication callbacks from OAuth providers and email verification links.

**Key Features:**
- Processes Supabase OAuth session tokens
- Fetches user profile and role information
- Implements RBAC routing based on user role
- Handles loading and error states gracefully
- Redirects to onboarding if incomplete

**Usage:**
The callback route is automatically added to your routing:
```tsx
<Route path="/auth/callback" element={<AuthCallback />} />
```

**Supported Flows:**
- Google OAuth sign-in
- Email verification callbacks
- Session recovery after redirect

### 2. **RBAC Service** (`services/rbac.ts`)

Centralized role-based access control utilities.

**Available Functions:**

#### `hasPermission(role, permission)`
Check if a user has a specific permission.
```typescript
import { hasPermission } from './services/rbac';

if (hasPermission(UserRole.LECTURER, 'canCreateSession')) {
  // Show create session button
}
```

#### `hasAnyPermission(role, permissions)`
Check if user has ANY of the specified permissions.
```typescript
if (hasAnyPermission(role, ['canCreateSession', 'canManageStudents'])) {
  // User has at least one permission
}
```

#### `hasAllPermissions(role, permissions)`
Check if user has ALL specified permissions.
```typescript
if (hasAllPermissions(role, ['canViewAttendance', 'canGradeStudents'])) {
  // User has all permissions
}
```

#### `getDefaultDashboardPath(role)`
Get the default landing page for a role.
```typescript
const path = getDefaultDashboardPath(UserRole.LECTURER);
// Returns: '/dashboard?tab=courses'
```

#### `canAccessRoute(role, route)`
Check if user can access a specific route.
```typescript
if (canAccessRoute(userRole, '/admin')) {
  // Allow access
}
```

#### `getAccessiblePages(role)`
Get all pages accessible to a role.
```typescript
const pages = getAccessiblePages(UserRole.STUDENT);
// Returns: ['dashboard', 'sessions', 'courses', 'profile', 'notifications', 'settings']
```

### 3. **Protected Route Components** (`components/ProtectedRoute.tsx`)

Enforce RBAC at the component level.

**Basic ProtectedRoute:**
```tsx
<ProtectedRoute 
  userRole={userRole}
  allowedRoles={[UserRole.LECTURER, UserRole.ADMIN]}
>
  <LecturerDashboard />
</ProtectedRoute>
```

**Convenience Components:**
```tsx
// Admin only
<AdminOnlyRoute userRole={userRole}>
  <AdminDashboard />
</AdminOnlyRoute>

// Lecturer and Admin
<LecturerOnlyRoute userRole={userRole}>
  <LecturerDashboard />
</LecturerOnlyRoute>

// Student and Admin
<StudentRoute userRole={userRole}>
  <StudentDashboard />
</StudentRoute>
```

### 4. **UnauthorizedPage Component** (`components/UnauthorizedPage.tsx`)

Displays when users try to access restricted routes.

Features:
- Shows clear error message
- Displays required role information
- Provides navigation options
- Contact support link

## Role Definitions

### User Roles
```typescript
export enum UserRole {
  STUDENT = 'STUDENT',
  LECTURER = 'LECTURER',
  ADMIN = 'ADMIN',
  CLASS_REP = 'CLASS_REP'
}
```

### Role Permissions

#### **STUDENT**
- View personal dashboard and sessions
- Join sessions
- View profile and notifications
- Access settings
- View enrolled courses
- Mark attendance

#### **LECTURER**
- View courses and student management
- Create and manage sessions
- View attendance reports
- Grade students
- Manage class roster
- Access notifications and settings

#### **ADMIN**
- Full system access
- Manage all users (students, lecturers)
- View all sessions and attendance
- Generate reports
- Manage user roles
- Access admin panel

#### **CLASS_REP**
- View class dashboard
- Manage class attendance records
- View class statistics
- Communicate with class members
- Access profile and notifications

## Callback Flow

### OAuth Provider Flow
```
1. User clicks "Login with Google"
   ↓
2. Supabase OAuth handler opens Google login
   ↓
3. User authenticates with Google
   ↓
4. Google redirects back to /auth/callback
   ↓
5. AuthCallback component processes the session
   ↓
6. Fetches user profile and role
   ↓
7. RBAC logic determines destination:
   - If onboarding incomplete → /onboarding
   - If STUDENT → /dashboard?tab=sessions
   - If LECTURER → /dashboard?tab=courses
   - If ADMIN → /dashboard?tab=users
   - If CLASS_REP → /dashboard?tab=attendance
```

### Email Verification Flow
```
1. User registers with email
   ↓
2. Receives verification email
   ↓
3. Clicks link (points to /auth/callback)
   ↓
4. AuthCallback verifies email
   ↓
5. Same RBAC routing as OAuth flow
```

## Configuration

### OAuth Redirect URLs

Update these in your Supabase project settings:

**Allowed Redirect URLs:**
- `http://localhost:3000/auth/callback` (local development)
- `https://yourdomain.com/auth/callback` (production)
- `https://yourdomain.com/auth/callback/` (with trailing slash)

### Environment Variables

No additional environment variables needed. The callback uses the existing Supabase configuration.

## Error Handling

### Common Errors

**"No session found"**
- User's session expired or URL was tampered with
- Automatically redirects to login after 3 seconds

**"Failed to fetch user profile"**
- Profile doesn't exist in database
- Usually indicates a database sync issue
- Check that auth trigger creates profiles correctly

**"Authentication Failed"**
- Network error during callback processing
- Supabase configuration issue
- Invalid OAuth credentials

## Best Practices

### 1. Always Check Permissions
```tsx
// Don't do this:
if (userRole === UserRole.LECTURER) {
  // Show features
}

// Do this instead:
if (hasPermission(userRole, 'canCreateSession')) {
  // Show features
}
```

### 2. Use Protected Routes
```tsx
// Don't trust role alone in routing
<Route path="/admin" element={<AdminDashboard />} />

// Use protected routes
<Route 
  path="/admin" 
  element={
    <AdminOnlyRoute userRole={userRole}>
      <AdminDashboard />
    </AdminOnlyRoute>
  } 
/>
```

### 3. Implement Server-Side Authorization
While RBAC provides UI-level protection, always validate permissions on the backend for sensitive operations.

### 4. Handle Loading States
```tsx
if (isLoading) {
  return <LoadingSpinner />;
}

if (!userRole) {
  return <Navigate to="/login" />;
}

// Render protected content
```

## Testing

### Test Callback Flow
1. Visit `/auth/callback` manually (will show error - expected)
2. Use OAuth provider to test full flow
3. Verify redirect happens to correct dashboard

### Test RBAC
```typescript
import { hasPermission, canAccessRoute } from './services/rbac';

// Test STUDENT
expect(hasPermission(UserRole.STUDENT, 'canJoinSession')).toBe(true);
expect(hasPermission(UserRole.STUDENT, 'canManageUsers')).toBe(false);

// Test LECTURER
expect(canAccessRoute(UserRole.LECTURER, '/dashboard')).toBe(true);
expect(canAccessRoute(UserRole.STUDENT, '/admin')).toBe(false);
```

## Migration Guide

If you had existing OAuth redirects:

1. Update Supabase OAuth redirect URLs to `/auth/callback`
2. Update any hardcoded redirects in your auth service (done in `services/supabase/auth.ts`)
3. Optionally replace existing role check logic with RBAC functions
4. Add Protected Route wrappers around sensitive pages

## Troubleshooting

### User Stuck on Callback Page
- Check browser console for errors
- Verify Supabase session is valid
- Check user profile exists in database

### Wrong Dashboard After Login
- Verify user role is correctly set in database
- Check RBAC function returns expected values
- Review browser console logs

### "Access Denied" on Protected Routes
- Verify user has required role in database
- Check ProtectedRoute component has correct `allowedRoles`
- Test with `hasPermission()` function in console

## Security Considerations

1. **Session Tokens**: Never log or expose session tokens
2. **Role Verification**: Always verify roles server-side before sensitive operations
3. **CSRF Protection**: Supabase handles CSRF for OAuth flows
4. **Token Expiry**: AuthCallback handles expired tokens gracefully
5. **Profile Sync**: Ensure database profiles stay in sync with auth system

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Role-Based Access Control (RBAC) Patterns](https://en.wikipedia.org/wiki/Role-based_access_control)
- [OAuth 2.0 Specification](https://datatracker.ietf.org/doc/html/rfc6749)
