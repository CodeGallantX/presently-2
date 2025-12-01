export enum UserRole {
  STUDENT = 'STUDENT',
  LECTURER = 'LECTURER',
  ADMIN = 'ADMIN',
  CLASS_REP = 'CLASS_REP'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  onboardingComplete: boolean;
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