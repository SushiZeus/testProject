// Training Module Types

export type CourseStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type EnrollmentStatus = 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'WITHDRAWN';

export interface TrainingCourse {
  id: string;
  courseNumber: string;
  title: string;
  description: string;
  category: string;
  duration: number; // hours
  capacity: number;
  trainer: string;
  location: string;
  startDate: Date;
  endDate: Date;
  cost: number;
  objectives: string[];
  prerequisites: string[];
  status: CourseStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  enrollmentNumber: string;
  courseId: string;
  courseTitle: string;
  employeeId: string;
  employeeName: string;
  department: string;
  enrolledDate: Date;
  completedDate?: Date;
  attendance: number; // percentage
  score?: number; // percentage
  status: EnrollmentStatus;
  certificateIssued: boolean;
  feedback?: string;
  createdAt: Date;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  enrollmentId: string;
  employeeId: string;
  employeeName: string;
  courseId: string;
  courseTitle: string;
  issueDate: Date;
  expiryDate?: Date;
  score: number;
  grade: string;
  createdAt: Date;
}

export interface TrainingBudget {
  id: string;
  year: number;
  department: string;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
}
