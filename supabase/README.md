# Supabase Setup Instructions

This guide will help you set up Supabase for the Presently application.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js installed locally

## Setup Steps

### 1. Create a New Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - Name: `presently` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Select the closest region to your users
4. Click "Create new project"

### 2. Set Up Database Schema

1. In your Supabase project dashboard, go to the **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `schema.sql` from this directory
4. Click "Run" to execute the SQL

This will create:
- `user_role` enum type
- `profiles` table
- RLS (Row Level Security) policies
- Triggers for automatic profile creation
- Helper functions

### 3. Enable Google OAuth (Optional)

1. In your Supabase project, go to **Authentication** → **Providers**
2. Find **Google** and click to configure
3. Enable the Google provider
4. Follow the instructions to set up OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
5. Copy the Client ID and Client Secret to Supabase
6. Save the configuration

### 4. Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize the "Confirm signup" template:
   - Update the confirmation URL to redirect to your app's onboarding page
   - Example: `{{ .ConfirmationURL }}?redirect_to=/onboarding`

### 5. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
   - **anon public**: This is your `VITE_SUPABASE_ANON_KEY`

### 6. Update Environment Variables

1. Open `.env.local` in the project root
2. Update the values:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 7. Test the Setup

1. Start your development server: `npm run dev`
2. Try registering a new user
3. Check the Supabase dashboard:
   - **Authentication** → **Users** should show your new user
   - **Table Editor** → **profiles** should have a new row

## Database Schema Overview

### Tables

#### `profiles`
- `id` (UUID, Primary Key): Links to auth.users
- `email` (TEXT, Unique): User's email address
- `full_name` (TEXT): User's full name
- `role` (user_role): One of STUDENT, LECTURER, ADMIN, CLASS_REP
- `avatar_url` (TEXT, Nullable): Profile picture URL
- `onboarding_complete` (BOOLEAN): Whether user has completed onboarding
- `created_at` (TIMESTAMPTZ): Account creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

### Row Level Security (RLS) Policies

1. **Users can view their own profile**: Users can read their own profile data
2. **Users can update their own profile**: Users can modify their own profile
3. **Users can insert their own profile**: Allows profile creation during signup
4. **Admins can view all profiles**: Admin users can see all user profiles
5. **Admins can update all profiles**: Admin users can modify any profile
6. **Lecturers can view students and class reps**: Lecturers have read access to student profiles

### Functions

1. **update_updated_at_column()**: Automatically updates the `updated_at` field
2. **handle_new_user()**: Creates a profile entry when a new user signs up

## Troubleshooting

### Issue: Users not being created in profiles table

**Solution**: Check that the trigger `on_auth_user_created` is properly set up in the SQL Editor.

### Issue: RLS policies blocking access

**Solution**: 
1. Check that RLS is enabled on the profiles table
2. Verify the user is authenticated
3. Review policy conditions in the SQL

### Issue: Email verification not working

**Solution**:
1. Check email templates in Authentication settings
2. Verify SMTP settings are configured
3. Check spam folder for verification emails

## Next Steps

After setting up Supabase:

1. Test user registration and login
2. Verify email confirmation flow
3. Test Google OAuth (if enabled)
4. Check onboarding flow
5. Verify RBAC (Role-Based Access Control) is working correctly

## Support

For issues with Supabase setup:
- Check [Supabase Documentation](https://supabase.com/docs)
- Visit [Supabase Community](https://github.com/supabase/supabase/discussions)
