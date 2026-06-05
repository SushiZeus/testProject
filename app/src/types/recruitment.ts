// Recruitment Module Types

export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'CANCELLED';
export type ApplicationStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFERED' | 'REJECTED' | 'HIRED' | 'WITHDRAWN';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export interface JobPosting {
  id: string;
  jobNumber: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  salaryRange: {
    min: number;
    max: number;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  openings: number;
  status: JobStatus;
  postedBy: string;
  postedDate: Date;
  closingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Applicant {
  id: string;
  applicationNumber: string;
  jobId: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  coverLetter?: string;
  experience: number; // years
  education: string;
  skills: string[];
  status: ApplicationStatus;
  rating?: number; // 1-5
  notes?: string;
  appliedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interview {
  id: string;
  interviewNumber: string;
  applicantId: string;
  applicantName: string;
  jobId: string;
  jobTitle: string;
  interviewType: 'PHONE' | 'VIDEO' | 'IN_PERSON' | 'PANEL';
  scheduledDate: Date;
  duration: number; // minutes
  interviewers: string[];
  location?: string;
  meetingLink?: string;
  status: InterviewStatus;
  feedback?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  id: string;
  offerNumber: string;
  applicantId: string;
  applicantName: string;
  jobId: string;
  jobTitle: string;
  salary: number;
  startDate: Date;
  benefits: string[];
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  sentDate?: Date;
  responseDate?: Date;
  expiryDate: Date;
  createdAt: Date;
}
