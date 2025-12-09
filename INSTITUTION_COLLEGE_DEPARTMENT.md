# Institution, College & Department Tables Documentation

## Overview

This document describes the three-tier hierarchical structure for managing educational institutions:
1. **Institutions** - The top-level organization (e.g., University)
2. **Colleges** - Faculty/School level (depends on institutions)
3. **Departments** - Academic departments (depends on colleges and institutions)

---

## 1. Institutions Table

Stores information about educational institutions.

### Schema
```sql
CREATE TABLE institutions (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL UNIQUE,
  short_name TEXT NOT NULL UNIQUE,          -- e.g., "OAU", "UNILAG"
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
  institution_type TEXT,                    -- 'UNIVERSITY', 'POLYTECHNIC', 'COLLEGE', 'INSTITUTE'
  accreditation_status TEXT,                -- 'ACCREDITED', 'PROVISIONAL', 'PENDING'
  logo_url TEXT,
  cover_image_url TEXT,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_institutions_short_name ON institutions(short_name);
CREATE INDEX idx_institutions_abbreviation ON institutions(abbreviation);
CREATE INDEX idx_institutions_is_active ON institutions(is_active);
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `full_name` | TEXT | Complete name of institution |
| `short_name` | TEXT | Abbreviation commonly used (e.g., "OAU") |
| `abbreviation` | TEXT | Alternative abbreviation |
| `description` | TEXT | Description of the institution |
| `website_url` | TEXT | Official website |
| `contact_email` | TEXT | Contact email address |
| `contact_phone` | TEXT | Contact phone number |
| `country` | TEXT | Country (required) |
| `state_province` | TEXT | State/Province |
| `city` | TEXT | City (required) |
| `address` | TEXT | Full address (required) |
| `latitude` | DECIMAL | Geographic latitude for geo-fencing |
| `longitude` | DECIMAL | Geographic longitude for geo-fencing |
| `postal_code` | TEXT | Postal/Zip code |
| `established_year` | INTEGER | Year the institution was established |
| `institution_type` | TEXT | UNIVERSITY / POLYTECHNIC / COLLEGE / INSTITUTE |
| `accreditation_status` | TEXT | ACCREDITED / PROVISIONAL / PENDING |
| `logo_url` | TEXT | URL to logo image |
| `cover_image_url` | TEXT | URL to cover image |
| `is_active` | BOOLEAN | Whether institution is active |
| `created_at` | TIMESTAMPTZ | Timestamp of creation |
| `updated_at` | TIMESTAMPTZ | Timestamp of last update |

---

## 2. Colleges Table

Represents faculties or schools within an institution. Depends on institutions table.

### Schema
```sql
CREATE TABLE colleges (
  id BIGSERIAL PRIMARY KEY,
  institution_id BIGINT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,                      -- e.g., "COS", "COLENG"
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

-- Indexes
CREATE INDEX idx_colleges_institution_id ON colleges(institution_id);
CREATE INDEX idx_colleges_code ON colleges(code);
CREATE INDEX idx_colleges_is_active ON colleges(is_active);
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `institution_id` | BIGINT | Foreign key to institutions (required) |
| `name` | TEXT | Name of the college/faculty |
| `code` | TEXT | Code/abbreviation (e.g., "COS") |
| `abbreviation` | TEXT | Alternative abbreviation |
| `description` | TEXT | Description of the college |
| `dean_name` | TEXT | Name of the dean |
| `dean_email` | TEXT | Email of the dean |
| `building_block` | TEXT | Building location |
| `office_location` | TEXT | Office location within institution |
| `contact_email` | TEXT | Contact email |
| `contact_phone` | TEXT | Contact phone |
| `website_url` | TEXT | College website URL |
| `established_year` | INTEGER | Year college was established |
| `logo_url` | TEXT | URL to college logo |
| `is_active` | BOOLEAN | Whether college is active |
| `created_at` | TIMESTAMPTZ | Timestamp of creation |
| `updated_at` | TIMESTAMPTZ | Timestamp of last update |

### Constraints
- **Unique**: `(institution_id, code)` - Ensures each college code is unique within an institution

---

## 3. Departments Table

Represents academic departments within a college. Depends on colleges and institutions.

### Schema
```sql
CREATE TABLE departments (
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
  accreditation_status TEXT,                -- 'ACCREDITED', 'PROVISIONAL', 'PENDING'
  
  -- Metadata
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: code must be unique within college
  CONSTRAINT unique_dept_code_per_college UNIQUE (college_id, code)
);

-- Indexes
CREATE INDEX idx_departments_college_id ON departments(college_id);
CREATE INDEX idx_departments_institution_id ON departments(institution_id);
CREATE INDEX idx_departments_code ON departments(code);
CREATE INDEX idx_departments_is_active ON departments(is_active);
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `college_id` | BIGINT | Foreign key to colleges (required) |
| `institution_id` | BIGINT | Foreign key to institutions (required) |
| `name` | TEXT | Name of department |
| `code` | TEXT | Department code |
| `abbreviation` | TEXT | Department abbreviation |
| `description` | TEXT | Description of department |
| `head_of_department_name` | TEXT | Name of HOD |
| `head_of_department_email` | TEXT | Email of HOD |
| `contact_email` | TEXT | Department contact email |
| `contact_phone` | TEXT | Department contact phone |
| `office_location` | TEXT | Office location |
| `website_url` | TEXT | Department website |
| `established_year` | INTEGER | Year department was established |
| `accreditation_status` | TEXT | ACCREDITED / PROVISIONAL / PENDING |
| `logo_url` | TEXT | Department logo URL |
| `is_active` | BOOLEAN | Whether department is active |
| `created_at` | TIMESTAMPTZ | Timestamp of creation |
| `updated_at` | TIMESTAMPTZ | Timestamp of last update |

### Constraints
- **Unique**: `(college_id, code)` - Ensures each department code is unique within a college

---

## 4. Profiles Table Integration

The `profiles` table now includes references to institutions and colleges:

```sql
ALTER TABLE profiles 
ADD COLUMN institution_id BIGINT REFERENCES institutions(id) ON DELETE SET NULL,
ADD COLUMN college_id BIGINT REFERENCES colleges(id) ON DELETE SET NULL;

CREATE INDEX idx_profiles_institution_id ON profiles(institution_id);
CREATE INDEX idx_profiles_college_id ON profiles(college_id);
```

This allows users to be associated with:
- Their institution
- Their college (within the institution)
- Their department (via college -> institution hierarchy)

---

## Relationships

```
┌─────────────────────────────────────────┐
│        INSTITUTIONS                     │
│  (Universities, Polytechnics, etc.)     │
│                                         │
│  - full_name                           │
│  - short_name (e.g., "OAU")           │
│  - location (country, state, city)    │
│  - contact info                         │
└──────────────┬──────────────────────────┘
               │ (1 to Many)
               │ institution_id
               ▼
┌─────────────────────────────────────────┐
│         COLLEGES                        │
│  (Faculties/Schools)                    │
│                                         │
│  - code (e.g., "COS")                  │
│  - name                                 │
│  - dean info                            │
│  - institution_id (FK)                 │
└──────────────┬──────────────────────────┘
               │ (1 to Many)
               │ college_id
               ▼
┌─────────────────────────────────────────┐
│       DEPARTMENTS                       │
│  (Academic Departments)                 │
│                                         │
│  - code                                 │
│  - name                                 │
│  - head_of_department info             │
│  - college_id (FK)                     │
│  - institution_id (FK)                 │
└─────────────────────────────────────────┘
```

---

## Service Functions

### Institution Functions
```typescript
getAllInstitutions()                      // Get all active institutions
getInstitutionById(id)                   // Get by ID
getInstitutionByShortName(shortName)     // Get by abbreviation
createInstitution(data)                  // Create (Admin only)
updateInstitution(id, data)              // Update (Admin only)
```

### College Functions
```typescript
getCollegesByInstitution(institutionId)  // Get all colleges in institution
getCollegeById(id)                       // Get by ID
getCollegeByCode(institutionId, code)    // Get by code within institution
createCollege(data)                      // Create (Admin only)
updateCollege(id, data)                  // Update (Admin only)
deleteCollege(id)                        // Delete (Admin only)
```

### User Affiliation Functions
```typescript
getUserInstitution()                     // Get current user's institution
getUserCollege()                         // Get current user's college
```

---

## Row Level Security (RLS)

### Institution Policies
- Public users can view active institutions
- Admins can view all institutions
- Admins can manage (CRUD) all institutions

### College Policies
- Public users can view active colleges
- Admins can view all colleges
- Admins can manage (CRUD) all colleges

### Department Policies
- Public users can view active departments
- Admins can view all departments
- Admins can manage (CRUD) all departments

---

## Example Usage

### Create an Institution
```typescript
import { createInstitution } from '@/services/supabase/institutions';

const result = await createInstitution({
  full_name: 'Obafemi Awolowo University',
  short_name: 'OAU',
  abbreviation: 'OAU',
  country: 'Nigeria',
  state_province: 'Osun',
  city: 'Ile-Ife',
  address: 'Ile-Ife, Osun State',
  institution_type: 'UNIVERSITY',
  accreditation_status: 'ACCREDITED',
  established_year: 1961,
  is_active: true
});
```

### Create a College
```typescript
import { createCollege } from '@/services/supabase/institutions';

const result = await createCollege({
  institution_id: 1,
  name: 'College of Science',
  code: 'COS',
  abbreviation: 'COS',
  dean_name: 'Prof. John Doe',
  dean_email: 'john@oau.edu.ng',
  is_active: true
});
```

### Get User's Institution
```typescript
import { getUserInstitution } from '@/services/supabase/institutions';

const institution = await getUserInstitution();
console.log(institution.full_name); // "Obafemi Awolowo University"
```

---

## TypeScript Types

```typescript
interface Institution {
  id: number;
  full_name: string;
  short_name: string;
  abbreviation: string;
  description?: string;
  country: string;
  state_province?: string;
  city: string;
  address: string;
  institution_type?: string;
  accreditation_status?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface College {
  id: number;
  institution_id: number;
  name: string;
  code: string;
  abbreviation: string;
  description?: string;
  dean_name?: string;
  dean_email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Department {
  id: number;
  college_id: number;
  institution_id: number;
  name: string;
  code: string;
  abbreviation: string;
  head_of_department_name?: string;
  head_of_department_email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## Migration

A migration file has been created at:
```
supabase/migrations/20251209120000_create_institution_college_tables.sql
```

This file contains all the SQL for creating the tables if applying to a new database.

---

## Notes

1. **Geo-fencing**: The original schema included a `geo_boundary POLYGON` field for PostGIS support. This requires the PostGIS extension to be enabled in Supabase.

2. **Cascading Deletes**: 
   - Deleting an institution cascades to delete all its colleges
   - Deleting a college cascades to delete all its departments
   - Deleting does NOT cascade user profiles (set to NULL)

3. **Unique Codes**: 
   - College code is unique within an institution
   - Department code is unique within a college

4. **Admin-Only Operations**: Creating/updating/deleting institutions, colleges, and departments is restricted to ADMIN users via RLS policies.
