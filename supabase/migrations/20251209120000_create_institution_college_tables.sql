-- Supabase Migration: Create Institution and College Tables
-- This migration creates the institution and college tables with proper relationships

-- Create institution_status enum
CREATE TYPE institution_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- Create institution table
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL UNIQUE,
  short_name TEXT NOT NULL UNIQUE, -- Abbreviation (e.g., "OAU", "UNILAG")
  description TEXT,
  
  -- Geographic Information
  country TEXT NOT NULL,
  state TEXT,
  city TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  geo_boundary POLYGON, -- PostGIS geometry for geo-fencing (requires PostGIS extension)
  
  -- Institution Size & Type
  size TEXT CHECK (size IN ('SMALL', 'MEDIUM', 'LARGE', 'VERY_LARGE')),
  institution_type TEXT CHECK (institution_type IN ('UNIVERSITY', 'POLYTECHNIC', 'COLLEGE', 'INSTITUTE')),
  
  -- Contact & Web
  website TEXT,
  email TEXT,
  phone_number TEXT,
  
  -- Administrative Details
  rector_vice_chancellor TEXT, -- Name of head
  registration_number TEXT UNIQUE, -- Government registration number
  accreditation_status TEXT,
  year_established INTEGER,
  
  -- Operational Settings
  status institution_status NOT NULL DEFAULT 'ACTIVE',
  is_verified BOOLEAN DEFAULT FALSE,
  logo_url TEXT,
  
  -- Metadata
  total_students INTEGER DEFAULT 0,
  total_staff INTEGER DEFAULT 0,
  total_colleges INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for institutions
CREATE INDEX idx_institutions_short_name ON institutions(short_name);
CREATE INDEX idx_institutions_country_state ON institutions(country, state);
CREATE INDEX idx_institutions_status ON institutions(status);

-- Enable RLS on institutions
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- Create college table (depends on institutions)
CREATE TABLE IF NOT EXISTS colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- Abbreviation (e.g., "COS", "COLENG")
  name TEXT NOT NULL,
  full_name TEXT,
  description TEXT,
  
  -- Contact Information
  dean_name TEXT,
  dean_email TEXT,
  phone_number TEXT,
  email TEXT,
  
  -- Location within institution
  building_location TEXT,
  
  -- Statistics
  total_departments INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  total_lecturers INTEGER DEFAULT 0,
  
  -- Status & Settings
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Unique constraint: code is unique within an institution
  UNIQUE(institution_id, code)
);

-- Create indexes for colleges
CREATE INDEX idx_colleges_institution_id ON colleges(institution_id);
CREATE INDEX idx_colleges_code ON colleges(code);
CREATE INDEX idx_colleges_is_active ON colleges(is_active);

-- Enable RLS on colleges
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institutions
-- Policy: Anyone can view active institutions
CREATE POLICY "Anyone can view active institutions"
  ON institutions
  FOR SELECT
  USING (status = 'ACTIVE' OR auth.role() = 'authenticated');

-- Policy: Admins can manage all institutions
CREATE POLICY "Admins can manage institutions"
  ON institutions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  );

-- RLS Policies for colleges
-- Policy: Users can view colleges in their institution
CREATE POLICY "Users can view colleges in their institution"
  ON colleges
  FOR SELECT
  USING (
    is_active = TRUE
    OR institution_id IN (
      SELECT institution_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Admins can manage all colleges
CREATE POLICY "Admins can manage colleges"
  ON colleges
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  );

-- Update profiles table to include institution and college references
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;

-- Create indexes on profiles for institution and college
CREATE INDEX IF NOT EXISTS idx_profiles_institution_id ON profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_college_id ON profiles(college_id);

-- Grant permissions
GRANT SELECT ON institutions TO authenticated;
GRANT SELECT ON colleges TO authenticated;
GRANT ALL ON institutions TO authenticated; -- For admins to manage
GRANT ALL ON colleges TO authenticated; -- For admins to manage
