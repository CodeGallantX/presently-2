# Supabase Database Setup

This document describes the database schema required for the Presently application.

## Database Schema

### Users Table

Create a `users` table with the following structure:

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('STUDENT', 'LECTURER', 'ADMIN', 'CLASS_REP')),
  phone_number TEXT,
  matric_number TEXT,
  department TEXT,
  level TEXT,
  staff_id TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_matric_number ON users(matric_number);
CREATE INDEX idx_users_staff_id ON users(staff_id);
```

### Trigger for updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Setup Instructions

1. Create a Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL commands above to create the required tables and policies
4. Copy your project URL and anon key from Settings > API
5. Add them to your `.env` file (see `.env.example`)

## Authentication Setup

1. Enable Email authentication in Supabase Authentication settings
2. (Optional) Enable Google OAuth provider:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials

## Environment Variables

Create a `.env` file in the project root with:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key (optional)
```
