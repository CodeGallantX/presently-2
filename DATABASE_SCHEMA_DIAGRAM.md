# Database Schema Diagram

## Visual Hierarchy

```
┌─────────────────────────────────────────────────────┐
│              INSTITUTIONS                           │
│  (Universities, Polytechnics, Colleges, etc.)       │
├─────────────────────────────────────────────────────┤
│ id (BIGSERIAL PK)                                   │
│ full_name (UNIQUE)                                  │
│ short_name (UNIQUE) - e.g., "OAU", "UNILAG"        │
│ abbreviation (UNIQUE)                               │
│ country, state_province, city, address              │
│ latitude, longitude                                 │
│ institution_type - UNIVERSITY / POLYTECHNIC / etc. │
│ accreditation_status - ACCREDITED / PROVISIONAL     │
│ website_url, contact_email, contact_phone           │
│ logo_url, cover_image_url                           │
│ is_active, created_at, updated_at                   │
└────────────────────┬────────────────────────────────┘
                     │ (1 to Many)
                     │ institution_id FK
                     ▼
┌─────────────────────────────────────────────────────┐
│              COLLEGES                               │
│  (Faculties, Schools, etc.)                         │
├─────────────────────────────────────────────────────┤
│ id (BIGSERIAL PK)                                   │
│ institution_id (BIGINT FK) - Required              │
│ name                                                │
│ code - e.g., "COS", "COLENG", "COLTECH"           │
│ abbreviation                                        │
│ dean_name, dean_email                               │
│ building_block, office_location                     │
│ contact_email, contact_phone, website_url           │
│ established_year, logo_url                          │
│ is_active, created_at, updated_at                   │
│ UNIQUE(institution_id, code)                        │
└────────────────────┬────────────────────────────────┘
                     │ (1 to Many)
                     │ college_id FK
                     ▼
┌─────────────────────────────────────────────────────┐
│              DEPARTMENTS                            │
│  (Academic Departments)                             │
├─────────────────────────────────────────────────────┤
│ id (BIGSERIAL PK)                                   │
│ college_id (BIGINT FK) - Required                  │
│ institution_id (BIGINT FK) - Required              │
│ name                                                │
│ code - e.g., "CS", "PHY", "CHM"                    │
│ abbreviation                                        │
│ head_of_department_name, head_of_department_email  │
│ contact_email, contact_phone, office_location      │
│ established_year, accreditation_status             │
│ logo_url, is_active, created_at, updated_at        │
│ UNIQUE(college_id, code)                            │
└────────────────────┬────────────────────────────────┘
                     │
                     │ (1 to Many)
                     │
                     ▼
        [Courses, Programs, Classes, etc.]
        (Additional tables can extend from here)
```

## Relationship Overview

```
One Institution Has:
├── Multiple Colleges
│   └── Each College Has:
│       ├── Multiple Departments
│       │   └── Each Department Has:
│       │       ├── Multiple Programs
│       │       ├── Multiple Courses
│       │       └── Multiple Students/Staff
│       └── Multiple Staff Members
├── Multiple Students
└── Multiple Lecturers

Example:
┌─ Obafemi Awolowo University (OAU)
│  ├─ College of Science (COS)
│  │  ├─ Computer Science (CS)
│  │  │  ├─ BSc Computer Science
│  │  │  ├─ Algorithms & Data Structures (CS201)
│  │  │  └─ 150 Students
│  │  ├─ Physics (PHY)
│  │  └─ Chemistry (CHM)
│  ├─ College of Technology (COLTECH)
│  │  ├─ Electrical Engineering (EE)
│  │  └─ Mechanical Engineering (ME)
│  └─ College of Medicine (COLMED)
│     ├─ Medicine (MED)
│     └─ Nursing (NUR)
│
└─ University of Lagos (UNILAG)
   ├─ Faculty of Science (FSC)
   └─ Faculty of Social Sciences (FSSH)
```

## Table Relationships

```
INSTITUTIONS (1)
    │
    └──────────── FK ─────────────┐
                                  (M) COLLEGES
                                       │
                                       ├──────── FK ─────────────┐
                                       │                          (M) DEPARTMENTS
                                       │
                                       └──────── FK ──────────────┐
                                                                   │
                                    ┌──────────────────────────────┘
                                    │
                                    └─ Each College Can Have
                                       Multiple Departments
                                       (via college_id FK)


INSTITUTIONS (1)
    │
    └──────────── FK ─────────────┐
                                  (M) PROFILES (Users)
                                       │
                                       ├─ institution_id (Which institution)
                                       └─ college_id (Which college)
                                       
                                    (A user can be:
                                     - Associated with an institution
                                     - Associated with a specific college)
```

## Foreign Key Constraints

```
colleges.institution_id → institutions.id
├─ ON DELETE CASCADE  (Delete institution → Delete all its colleges)
└─ ON UPDATE CASCADE  (Update institution ID → Update in colleges)

departments.college_id → colleges.id
├─ ON DELETE CASCADE  (Delete college → Delete all its departments)
└─ ON UPDATE CASCADE

departments.institution_id → institutions.id
├─ ON DELETE CASCADE
└─ ON UPDATE CASCADE

profiles.institution_id → institutions.id
├─ ON DELETE SET NULL  (Delete institution → Set to NULL, don't delete user)
└─ ON UPDATE CASCADE

profiles.college_id → colleges.id
├─ ON DELETE SET NULL  (Delete college → Set to NULL, don't delete user)
└─ ON UPDATE CASCADE
```

## Unique Constraints

```
institutions:
  - full_name (UNIQUE) - No two institutions with same full name
  - short_name (UNIQUE) - No two institutions with same abbreviation
  - abbreviation (UNIQUE)

colleges:
  - (institution_id, code) UNIQUE
    └─ College code is unique within an institution
    └─ Same code can exist in different institutions

departments:
  - (college_id, code) UNIQUE
    └─ Department code is unique within a college
    └─ Same code can exist in different colleges
```

## Data Flow Example

```
User Signs Up
    │
    └─ Creates profile with:
       ├─ id (UUID from auth)
       ├─ email
       ├─ full_name
       ├─ role (STUDENT, LECTURER, ADMIN, CLASS_REP)
       └─ Initially: institution_id = NULL, college_id = NULL
    
    │
    └─ Onboarding Process
       │
       ├─ Admin/User selects institution
       │  └─ institution_id = 1 (OAU)
       │
       └─ Admin/User selects college
          └─ college_id = 3 (College of Science)

    │
    └─ User Now Associated With:
       ├─ Institution: Obafemi Awolowo University
       └─ College: College of Science
           (Department can be inferred from department table)
```

## Query Examples

### Get a complete institutional hierarchy
```sql
SELECT 
  i.id, i.full_name, i.short_name,
  c.id, c.name, c.code,
  d.id, d.name, d.code
FROM institutions i
LEFT JOIN colleges c ON i.id = c.institution_id
LEFT JOIN departments d ON c.id = d.college_id
WHERE i.short_name = 'OAU'
ORDER BY i.full_name, c.name, d.name;
```

### Get all users in a college
```sql
SELECT p.full_name, p.email, p.role
FROM profiles p
WHERE p.college_id = 3
ORDER BY p.full_name;
```

### Get college information with department count
```sql
SELECT 
  c.name, c.code, c.dean_name,
  COUNT(d.id) as department_count
FROM colleges c
LEFT JOIN departments d ON c.id = d.college_id
WHERE c.institution_id = 1
GROUP BY c.id
ORDER BY c.name;
```

### Get user's complete institutional path
```sql
SELECT 
  i.full_name as institution,
  i.short_name as institution_abbr,
  c.name as college,
  c.code as college_code,
  p.full_name as user_name,
  p.role
FROM profiles p
LEFT JOIN institutions i ON p.institution_id = i.id
LEFT JOIN colleges c ON p.college_id = c.id
WHERE p.id = 'user-uuid';
```

## Indexes for Performance

```
institutions:
  ✅ idx_institutions_short_name(short_name)
  ✅ idx_institutions_abbreviation(abbreviation)
  ✅ idx_institutions_is_active(is_active)

colleges:
  ✅ idx_colleges_institution_id(institution_id)
  ✅ idx_colleges_code(code)
  ✅ idx_colleges_is_active(is_active)

departments:
  ✅ idx_departments_college_id(college_id)
  ✅ idx_departments_institution_id(institution_id)
  ✅ idx_departments_code(code)
  ✅ idx_departments_is_active(is_active)

profiles:
  ✅ idx_profiles_institution_id(institution_id)
  ✅ idx_profiles_college_id(college_id)
```

## Entity Relationship Diagram (ERD)

```
┌──────────────────────────┐
│    INSTITUTIONS          │
├──────────────────────────┤
│ PK id                    │
│    full_name (U)         │
│    short_name (U)        │
│    abbreviation (U)      │
│    country               │
│    state_province        │
│    city                  │
│    address               │
│    latitude              │
│    longitude             │
│    institution_type      │
│    accreditation_status  │
│    is_active             │
│    created_at            │
│    updated_at            │
└──────────────────────────┘
         │ 1 (PK)
         │
         │ M (FK)
         │
┌──────────────────────────────┐
│    COLLEGES                  │
├──────────────────────────────┤
│ PK id                        │
│ FK institution_id            │
│    name                      │
│    code                      │
│    abbreviation              │
│    dean_name                 │
│    dean_email                │
│    is_active                 │
│    created_at                │
│    updated_at                │
│ UQ (institution_id, code)    │
└──────────────────────────────┘
         │ 1 (PK)
         │
         │ M (FK)
         │
┌──────────────────────────────┐
│    DEPARTMENTS               │
├──────────────────────────────┤
│ PK id                        │
│ FK college_id                │
│ FK institution_id            │
│    name                      │
│    code                      │
│    abbreviation              │
│    head_of_department_name   │
│    is_active                 │
│    created_at                │
│    updated_at                │
│ UQ (college_id, code)        │
└──────────────────────────────┘
```

---

**Legend:**
- `PK` = Primary Key
- `FK` = Foreign Key
- `UQ` = Unique Constraint
- `(U)` = Unique
- `1` = One (side of 1:M relationship)
- `M` = Many (side of 1:M relationship)
