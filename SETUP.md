# Presently Setup Guide

This guide will help you set up and run the Presently attendance management system.

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- A Supabase account (for authentication features)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd presently-2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   
   # Gemini API (Optional - for AI features)
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

## Supabase Setup

The application uses Supabase for authentication and data storage. To set up Supabase:

1. **Create a Supabase Project:**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign in or create an account
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Schema:**
   - In your Supabase dashboard, go to the SQL Editor
   - Copy the contents of `supabase/schema.sql`
   - Paste and execute the SQL

3. **Configure Authentication:**
   - In Supabase dashboard, go to Authentication → Providers
   - Enable Email provider (enabled by default)
   - (Optional) Enable Google OAuth following the instructions in `supabase/README.md`

For detailed Supabase setup instructions, see [supabase/README.md](./supabase/README.md).

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm run preview
```

## Demo Mode

If Supabase is not configured, the application will run in demo mode with simulated authentication:

- Use email patterns to simulate different roles:
  - `admin@example.com` → Admin
  - `prof@example.com` or `lecturer@example.com` → Lecturer
  - `rep@example.com` → Class Rep
  - Any other email → Student

## Features

### Implemented Features

✅ **Blank Page Fix:**
- Removed CDN dependencies
- Configured local TailwindCSS v3
- Fixed styling system

✅ **Supabase Authentication:**
- Email/password authentication
- Google OAuth support
- Email verification flow
- Session management

✅ **RBAC (Role-Based Access Control):**
- Student role
- Lecturer role
- Admin role
- Class Representative role

✅ **Auth Pages:**
- Landing page
- Login page
- Registration page
- Email verification sent page
- Onboarding page with role selection

✅ **Database Schema:**
- Profiles table with user information
- Role enum (STUDENT, LECTURER, ADMIN, CLASS_REP)
- RLS (Row Level Security) policies
- Automatic profile creation on signup
- Updated_at trigger

### User Roles

**Student:**
- Fast check-in (QR + GPS)
- Attendance history & stats
- Exam clearance PDF
- Absence alerts

**Lecturer:**
- Unlimited courses & sessions
- Real-time attendance (QR + GPS)
- Instant exports (PDF/Excel)
- Automated exam clearance
- Student reminders

**Admin:**
- Full system access
- User management
- System-wide analytics

**Class Representative:**
- Class-level attendance management
- Student coordination

## Project Structure

```
presently-2/
├── components/           # React components
│   ├── Auth/            # Authentication components
│   ├── Dashboard/       # Dashboard views by role
│   ├── Profile/         # User profile components
│   ├── Settings/        # Settings pages
│   └── ...              # Other UI components
├── services/            # Service layer
│   ├── supabase/        # Supabase integration
│   │   ├── client.ts    # Supabase client initialization
│   │   ├── auth.ts      # Authentication functions
│   │   └── types.ts     # TypeScript types
│   └── geminiService.ts # AI service (optional)
├── supabase/            # Supabase configuration
│   ├── schema.sql       # Database schema
│   └── README.md        # Supabase setup guide
├── src/                 # Source files
│   └── index.css        # Global styles
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
├── types.ts             # TypeScript type definitions
└── ...                  # Configuration files
```

## Authentication Flow

1. **Registration:**
   - User provides email, password, and full name
   - Account is created in Supabase
   - Verification email is sent (if email confirmation is enabled)
   - User completes onboarding to select role

2. **Login:**
   - User provides email and password
   - Supabase validates credentials
   - User profile is loaded
   - If onboarding incomplete, redirect to onboarding
   - Otherwise, redirect to role-appropriate dashboard

3. **Google OAuth:**
   - User clicks "Continue with Google"
   - OAuth flow initiated
   - On success, redirect to onboarding
   - User selects role and completes setup

4. **Onboarding:**
   - User selects their role (Student, Lecturer, etc.)
   - Additional role-specific information collected
   - Profile updated with role and onboarding_complete flag
   - Redirect to dashboard

## Troubleshooting

### Page is blank
- Ensure all dependencies are installed: `npm install`
- Clear browser cache and reload
- Check browser console for errors

### Authentication not working
- Verify Supabase credentials in `.env.local`
- Check that database schema is applied
- Ensure RLS policies are enabled
- Review Supabase logs in dashboard

### Development server issues
- Stop the server (Ctrl+C)
- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart: `npm run dev`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes (for auth features) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes (for auth features) |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | No (for AI features) |

## Tech Stack

- **Frontend Framework:** React 19
- **Routing:** React Router DOM
- **Styling:** TailwindCSS v3
- **Animations:** Framer Motion
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **Build Tool:** Vite
- **Icons:** Lucide React
- **Charts:** Recharts
- **Maps:** React Map GL + MapLibre GL

## Support

For issues or questions:
1. Check this documentation
2. Review [supabase/README.md](./supabase/README.md) for Supabase-specific issues
3. Check the GitHub issues
4. Create a new issue with detailed information

## License

[Add your license information here]
