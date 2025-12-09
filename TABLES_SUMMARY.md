# Institution & College Tables - Quick Reference

## 📋 What Was Created

### 1. **Institutions Table**
- Stores educational institutions (Universities, Polytechnics, etc.)
- Fields: full_name, short_name, location, contact info, type, accreditation status
- Example: `Obafemi Awolowo University` (short_name: `OAU`)

### 2. **Colleges Table**
- Faculties/Schools within institutions
- Each college belongs to exactly one institution
- Fields: name, code, dean info, contact, location
- Example: `College of Science` (code: `COS`) at OAU
- **Key constraint**: Code is unique within an institution

### 3. **Departments Table** (Already existed)
- Academic departments within colleges
- Each department belongs to a college and institution
- Fields: name, code, HOD info, contact, accreditation
- Example: `Computer Science` in College of Science

### 4. **Updated Profiles Table**
- Now includes `institution_id` and `college_id` fields
- Links users to their institution and college
- Allows filtering users by their academic affiliation

---

## 🗂️ File Structure

### Database
```
supabase/
├── schema.sql                           (Updated with all tables)
└── migrations/
    └── 20251209120000_create_institution_college_tables.sql
```

### Services
```
services/supabase/
└── institutions.ts                      (New - functions for managing institutions & colleges)
```

### Documentation
```
INSTITUTION_COLLEGE_DEPARTMENT.md        (Comprehensive documentation)
```

### Types
```
types.ts                                 (Updated with Institution, College, Department interfaces)
```

---

## 🚀 Key Functions

### Get Institutions
```typescript
import { getAllInstitutions, getInstitutionByShortName } from '@/services/supabase/institutions';

// Get all active institutions
const institutions = await getAllInstitutions();

// Get by abbreviation
const oau = await getInstitutionByShortName('OAU');
```

### Get Colleges
```typescript
import { getCollegesByInstitution, getCollegeByCode } from '@/services/supabase/institutions';

// Get all colleges in an institution
const colleges = await getCollegesByInstitution(institutionId);

// Get specific college by code
const cosCollege = await getCollegeByCode(institutionId, 'COS');
```

### Get User's Affiliation
```typescript
import { getUserInstitution, getUserCollege } from '@/services/supabase/institutions';

const institution = await getUserInstitution();
const college = await getUserCollege();
```

### Create/Update (Admin only)
```typescript
import { createInstitution, updateCollege } from '@/services/supabase/institutions';

// Create institution
await createInstitution({
  full_name: 'University of Ibadan',
  short_name: 'UI',
  abbreviation: 'UI',
  country: 'Nigeria',
  state_province: 'Oyo',
  city: 'Ibadan',
  address: 'Ibadan, Oyo State',
  is_active: true
});

// Update college
await updateCollege(collegeId, {
  dean_name: 'Prof. Jane Doe'
});
```

---

## 📊 Database Hierarchy

```
INSTITUTION (top level)
    ↓ (1 institution → many colleges)
COLLEGE (faculty/school)
    ↓ (1 college → many departments)
DEPARTMENT (academic unit)
    ↓ (1 department → many courses)
COURSE
    ↓ (1 course → many students)
STUDENT PROFILE
```

---

## 🔐 Access Control

| Operation | Public | Lecturer | Admin |
|-----------|--------|----------|-------|
| View active institutions | ✅ | ✅ | ✅ |
| View all institutions | ❌ | ❌ | ✅ |
| Create institution | ❌ | ❌ | ✅ |
| Update institution | ❌ | ❌ | ✅ |
| View own college | ✅ | ✅ | ✅ |
| Manage colleges | ❌ | ❌ | ✅ |

---

## 📝 TypeScript Types

```typescript
interface Institution {
  id: number;
  full_name: string;
  short_name: string;
  country: string;
  city: string;
  institution_type?: string;
  is_active: boolean;
  created_at: string;
}

interface College {
  id: number;
  institution_id: number;
  name: string;
  code: string;
  dean_name?: string;
  is_active: boolean;
}

interface Department {
  id: number;
  college_id: number;
  name: string;
  code: string;
  head_of_department_name?: string;
}
```

---

## 🔄 User-Institution Relationship

### User Profile Now Has:
- `institution_id` - Foreign key to institutions table
- `college_id` - Foreign key to colleges table

### This Enables:
- Filtering students by institution
- Filtering lecturers by college
- Assigning roles at institution level
- Generating institution-wide reports

---

## 📈 Example Data

### Institution
| ID | full_name | short_name | city | country |
|----|-----------|-----------|------|---------|
| 1 | Obafemi Awolowo University | OAU | Ile-Ife | Nigeria |
| 2 | University of Lagos | UNILAG | Lagos | Nigeria |

### College
| ID | name | code | institution_id |
|----|------|------|-----------------|
| 1 | College of Science | COS | 1 |
| 2 | College of Technology | COLTECH | 1 |
| 3 | Faculty of Science | FSC | 2 |

### Department
| ID | name | code | college_id |
|----|------|------|------------|
| 1 | Computer Science | CS | 1 |
| 2 | Physics | PHY | 1 |
| 3 | Chemistry | CHM | 1 |

---

## ✨ Features

### ✅ Implemented
- Institution creation and management
- College creation and management (within institutions)
- Department management (already existed)
- Geographic coordinates for institutions
- Institution accreditation tracking
- Row-level security (RLS) for all tables
- Automatic timestamp management
- User affiliation tracking

### 🔜 Potential Enhancements
- PostGIS support for geo-fencing
- Institution contact directory
- College-level statistics/dashboards
- Department resource allocation
- Inter-institutional student exchange

---

## 🐛 Important Notes

1. **Unique Codes**: College codes are unique per institution (same code can exist in different institutions)
2. **Cascading Deletes**: Deleting an institution deletes all its colleges; deleting a college deletes all its departments
3. **User Affiliation**: When deleting a college, user profiles are NOT deleted (college_id becomes NULL)
4. **Admin-Only**: Only admins can create/update/delete institutions and colleges
5. **Geo-coordinates**: Use for future geo-fencing (e.g., marking attendance by location)

---

## 🔗 Related Files

- Database Schema: `supabase/schema.sql`
- TypeScript Types: `types.ts`
- Service Functions: `services/supabase/institutions.ts`
- Full Documentation: `INSTITUTION_COLLEGE_DEPARTMENT.md`

---

## 💡 Usage Example

```typescript
// In a component
import { useEffect, useState } from 'react';
import { getAllInstitutions, getCollegesByInstitution, getUserInstitution } from '@/services/supabase/institutions';

export function InstitutionSelector() {
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    // Load all institutions
    const fetchInstitutions = async () => {
      const data = await getAllInstitutions();
      setInstitutions(data);
    };
    fetchInstitutions();
  }, []);

  const handleInstitutionSelect = async (institutionId) => {
    setSelectedInstitution(institutionId);
    // Load colleges for selected institution
    const data = await getCollegesByInstitution(institutionId);
    setColleges(data);
  };

  return (
    <div>
      <select onChange={(e) => handleInstitutionSelect(e.target.value)}>
        <option>Select Institution</option>
        {institutions.map(inst => (
          <option key={inst.id} value={inst.id}>
            {inst.full_name} ({inst.short_name})
          </option>
        ))}
      </select>

      {colleges.length > 0 && (
        <select>
          <option>Select College</option>
          {colleges.map(col => (
            <option key={col.id} value={col.id}>
              {col.name} ({col.code})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
```
