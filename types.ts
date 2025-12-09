export enum UserRole {
  STUDENT = 'STUDENT',
  LECTURER = 'LECTURER',
  ADMIN = 'ADMIN',
  CLASS_REP = 'CLASS_REP'
}

export interface Institution {
  id: number;
  full_name: string;
  short_name: string; // Abbreviation (e.g., "OAU", "UNILAG")
  abbreviation: string;
  description?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  
  // Location and Size
  country: string;
  state_province?: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  postal_code?: string;
  
  // Institution details
  established_year?: number;
  institution_type?: string; // 'UNIVERSITY', 'POLYTECHNIC', 'COLLEGE', 'INSTITUTE'
  accreditation_status?: string;
  logo_url?: string;
  cover_image_url?: string;
  
  // Metadata
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface College {
  id: number;
  institution_id: number;
  name: string;
  code: string; // Abbreviation (e.g., "COS", "COLENG")
  abbreviation: string;
  description?: string;
  
  // Contact Information
  dean_name?: string;
  dean_email?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  
  // Location within institution
  building_block?: string;
  office_location?: string;
  
  // Status & Settings
  established_year?: number;
  logo_url?: string;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  college_id: number;
  institution_id: number;
  name: string;
  code: string;
  abbreviation: string;
  description?: string;
  
  // Contact
  head_of_department_name?: string;
  head_of_department_email?: string;
  contact_email?: string;
  contact_phone?: string;
  office_location?: string;
  website_url?: string;
  
  // Academic details
  established_year?: number;
  accreditation_status?: string;
  
  // Metadata
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  onboarding_complete: boolean;
  
  // Institutional Affiliation
  institution_id?: number;
  college_id?: number;
}

export interface Session {
  id: string;
  courseName: string;
  courseCode: string;
  startTime: Date;
  endTime: Date;
  active: boolean;
  attendees: number;
  sessionCode: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}