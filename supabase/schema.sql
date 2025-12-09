-- Create user_role enum
CREATE TYPE user_role AS ENUM ('STUDENT', 'LECTURER', 'ADMIN', 'CLASS_REP');

-- Create institutions table
CREATE TABLE IF NOT EXISTS institutions (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL UNIQUE,
  short_name TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL UNIQUE,
  description TEXT,
  website_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Location and Size
  country TEXT NOT NULL,
  state_province TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  postal_code TEXT,
  
  -- Institution details
  established_year INTEGER,
  institution_type TEXT, -- 'UNIVERSITY', 'POLYTECHNIC', 'COLLEGE', etc.
  accreditation_status TEXT, -- 'ACCREDITED', 'PROVISIONAL', 'PENDING'
  logo_url TEXT,
  cover_image_url TEXT,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for institutions
CREATE INDEX idx_institutions_short_name ON institutions(short_name);
CREATE INDEX idx_institutions_abbreviation ON institutions(abbreviation);
CREATE INDEX idx_institutions_is_active ON institutions(is_active);

-- Enable RLS on institutions
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institutions
CREATE POLICY "Anyone can view active institutions"
  ON institutions
  FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can view all institutions"
  ON institutions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  );

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

-- Create colleges table
CREATE TABLE IF NOT EXISTS colleges (
  id BIGSERIAL PRIMARY KEY,
  institution_id BIGINT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  description TEXT,
  dean_name TEXT,
  dean_email TEXT,
  
  -- Location within institution
  building_block TEXT,
  office_location TEXT,
  
  -- Contact
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  
  -- Metadata
  established_year INTEGER,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: code must be unique within institution
  CONSTRAINT unique_college_code_per_institution UNIQUE (institution_id, code)
);

-- Create index for colleges
CREATE INDEX idx_colleges_institution_id ON colleges(institution_id);
CREATE INDEX idx_colleges_code ON colleges(code);
CREATE INDEX idx_colleges_is_active ON colleges(is_active);

-- Enable RLS on colleges
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for colleges
CREATE POLICY "Anyone can view active colleges"
  ON colleges
  FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can view all colleges"
  ON colleges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  );

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

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  college_id BIGINT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  institution_id BIGINT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  description TEXT,
  head_of_department_name TEXT,
  head_of_department_email TEXT,
  
  -- Contact
  contact_email TEXT,
  contact_phone TEXT,
  office_location TEXT,
  website_url TEXT,
  
  -- Academic details
  established_year INTEGER,
  accreditation_status TEXT, -- 'ACCREDITED', 'PROVISIONAL', 'PENDING'
  
  -- Metadata
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: code must be unique within college
  CONSTRAINT unique_dept_code_per_college UNIQUE (college_id, code)
);

-- Create index for departments
CREATE INDEX idx_departments_college_id ON departments(college_id);
CREATE INDEX idx_departments_institution_id ON departments(institution_id);
CREATE INDEX idx_departments_code ON departments(code);
CREATE INDEX idx_departments_is_active ON departments(is_active);

-- Enable RLS on departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments
CREATE POLICY "Anyone can view active departments"
  ON departments
  FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can view all departments"
  ON departments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage departments"
  ON departments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  );

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'STUDENT',
  avatar_url TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Institutional Affiliation
  institution_id BIGINT REFERENCES institutions(id) ON DELETE SET NULL,
  college_id BIGINT REFERENCES colleges(id) ON DELETE SET NULL,
  
  -- Contact Information
  phone_number TEXT,
  
  -- Student-specific fields
  matric_number TEXT,
  department TEXT,
  level TEXT,
  
  -- Lecturer-specific fields
  staff_id TEXT,
  courses TEXT, -- Comma-separated list of courses
  
  -- Class Rep-specific fields
  assigned_lecturer TEXT,
  
  -- Preferences
  notifications_enabled BOOLEAN DEFAULT TRUE,
  location_enabled BOOLEAN DEFAULT FALSE,
  dark_mode BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  );

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  );

-- Policy: Lecturers can view student and class rep profiles
CREATE POLICY "Lecturers can view students and class reps"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'LECTURER'
    )
    AND profiles.role IN ('STUDENT', 'CLASS_REP')
  );

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update institutions updated_at
CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update colleges updated_at
CREATE TRIGGER update_colleges_updated_at
  BEFORE UPDATE ON colleges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, onboarding_complete)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'STUDENT',
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON institutions TO authenticated;
GRANT SELECT ON colleges TO authenticated;
GRANT ALL ON institutions TO authenticated; -- For admins to manage institutions
GRANT ALL ON colleges TO authenticated; -- For admins to manage colleges
