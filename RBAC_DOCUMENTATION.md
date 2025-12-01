# Role-Based Access Control (RBAC) System

This document describes the RBAC implementation in the Presently application.

## Overview

The RBAC system controls access to different pages and features based on user roles. It includes:
- Role-based permissions
- Navigation guards
- Automatic redirections
- Onboarding flow control

## User Roles

The application supports four user roles:

1. **STUDENT** - Students attending classes
2. **LECTURER** - Teachers managing courses and attendance
3. **CLASS_REP** - Class representatives with additional permissions
4. **ADMIN** - System administrators with full access

## Page Access Rules

### Student Access
- **Allowed pages**: dashboard, profile, notifications, settings
- **Restricted pages**: admin, lecturer-tools
- **Default page**: dashboard

### Lecturer Access
- **Allowed pages**: dashboard, profile, notifications, settings, lecturer-tools
- **Restricted pages**: admin
- **Default page**: dashboard

### Class Rep Access
- **Allowed pages**: dashboard, profile, notifications, settings
- **Restricted pages**: admin, lecturer-tools
- **Default page**: dashboard

### Admin Access
- **Allowed pages**: All pages
- **Restricted pages**: None
- **Default page**: dashboard

## Usage

### In Components

Use the `useAuth` hook to access authentication state and RBAC functions:

```typescript
import { useAuth } from './services/useAuth';

function MyComponent() {
  const { user, isAuthenticated, checkAccess, navigate } = useAuth();

  // Check if user has access to a page
  const canAccessAdmin = checkAccess('admin');

  // Navigate with RBAC checks
  const handleNavigation = () => {
    navigate('admin', (redirectPage) => {
      // This callback receives the actual page to navigate to
      // after RBAC checks (might be different from 'admin')
      setCurrentPage(redirectPage);
    });
  };

  return (
    <div>
      {canAccessAdmin && <AdminButton />}
    </div>
  );
}
```

### Navigation Guard

The `navigationGuard` function checks if a user can access a specific page:

```typescript
import { navigationGuard } from './services/rbac';

const result = navigationGuard(
  user.role,
  user.onboardingComplete,
  'admin'
);

if (result.allowed) {
  // User can access the page
} else {
  // Redirect to: result.redirectTo
  // Reason: result.reason
}
```

### Protected Routes

Use the `useProtectedRoute` hook to protect entire route components:

```typescript
import { useProtectedRoute } from './services/useAuth';

function ProtectedPage() {
  const { isAllowed, isLoading, redirectTo } = useProtectedRoute('admin');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAllowed) {
    // Redirect handled automatically
    return null;
  }

  return <AdminContent />;
}
```

## Authentication Flow

1. **Unauthenticated User**
   - Access: landing, login, register
   - Attempting to access protected pages → Redirect to login

2. **Authenticated + Onboarding Incomplete**
   - Forced redirect to onboarding page
   - Cannot access other pages until onboarding is complete

3. **Authenticated + Onboarding Complete**
   - Access pages based on role permissions
   - Redirect to default page if accessing restricted page
   - Cannot access public pages (landing, login, register)

## Callbacks

The RBAC system uses callbacks for navigation to ensure proper state management:

```typescript
// Example: Navigate to a page with RBAC
rbacNavigate('dashboard', (actualPage) => {
  // actualPage might be 'dashboard' or a redirect destination
  setCurrentPage(actualPage);
});
```

### Why Callbacks?

1. **Flexible Redirection**: The callback receives the actual destination page after RBAC checks
2. **State Management**: Components can update their state based on the final destination
3. **Side Effects**: Execute additional logic when navigation occurs
4. **Decoupling**: RBAC logic is separate from navigation implementation

## Adding New Roles

1. Add the role to `types.ts`:
```typescript
export enum UserRole {
  // ... existing roles
  NEW_ROLE = 'NEW_ROLE'
}
```

2. Define permissions in `services/rbac.ts`:
```typescript
export const ROLE_PERMISSIONS = {
  // ... existing roles
  [UserRole.NEW_ROLE]: {
    allowedPages: ['dashboard', 'profile'],
    defaultPage: 'dashboard',
    restrictedPages: ['admin']
  }
};
```

## Adding New Protected Pages

1. Add the page to allowed/restricted lists in `ROLE_PERMISSIONS`
2. Check access before rendering:
```typescript
const canAccess = checkAccess('new-page');
```

## Security Considerations

- **Server-Side Validation**: Always validate permissions on the server
- **Row-Level Security**: Use Supabase RLS policies to enforce database-level access control
- **Token Validation**: Verify JWT tokens on API endpoints
- **Principle of Least Privilege**: Grant minimum necessary permissions

## Testing

Test RBAC by:

1. Creating users with different roles in Supabase
2. Attempting to access various pages
3. Verifying redirections work correctly
4. Checking that restricted features are hidden/disabled

## Troubleshooting

**Issue**: User not redirected after login
- Check: `onboardingComplete` flag in user profile
- Verify: Auth state is properly loaded

**Issue**: Access denied to allowed pages
- Check: Role permissions in `ROLE_PERMISSIONS`
- Verify: Page name matches exactly

**Issue**: Infinite redirect loop
- Check: Default page is in allowed pages for the role
- Verify: Onboarding status is correctly set
