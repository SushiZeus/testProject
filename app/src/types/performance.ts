// Performance Management Types

export type AppraisalStatus = 'DRAFT' | 'SELF_ASSESSMENT' | 'MANAGER_REVIEW' | 'HR_REVIEW' | 'COMPLETED';
export type GoalStatus = 'DRAFT' | 'ACTIVE' | 'ACHIEVED' | 'NOT_ACHIEVED' | 'CANCELLED';
export type PIPStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface PerformanceAppraisal {
  id: string;
  appraisalNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  period: string; // "2026 Annual Review"
  reviewYear: number;
  selfAssessment?: AppraisalSection;
  managerAssessment?: AppraisalSection;
  goals: GoalReview[];
  competencies: CompetencyRating[];
  overallRating?: number; // 1-5
  status: AppraisalStatus;
  managerId?: string;
  managerName?: string;
  hrReviewerId?: string;
  hrReviewerName?: string;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export interface AppraisalSection {
  strengths: string;
  areasForImprovement: string;
  achievements: string;
  comments: string;
  rating: number; // 1-5
  submittedAt: Date;
}

export interface GoalReview {
  goalId: string;
  goalTitle: string;
  targetDate: Date;
  status: GoalStatus;
  achievement: number; // percentage
  comments: string;
}

export interface CompetencyRating {
  competency: string;
  description: string;
  rating: number; // 1-5
  comments?: string;
}

export interface Goal {
  id: string;
  goalNumber: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  category: 'INDIVIDUAL' | 'TEAM' | 'DEPARTMENTAL' | 'ORGANIZATIONAL';
  startDate: Date;
  targetDate: Date;
  progress: number; // percentage
  status: GoalStatus;
  kpis: KPI[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KPI {
  id: string;
  name: string;
  target: number;
  actual: number;
  unit: string;
  weight: number; // percentage
}

export interface PerformanceImprovementPlan {
  id: string;
  pipNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  reason: string;
  objectives: PIPObjective[];
  startDate: Date;
  endDate: Date;
  reviewDate: Date;
  status: PIPStatus;
  managerId: string;
  managerName: string;
  outcome?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PIPObjective {
  id: string;
  objective: string;
  actions: string[];
  targetDate: Date;
  achieved: boolean;
  comments?: string;
}

export interface Feedback360 {
  id: string;
  feedbackNumber: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRelation: 'MANAGER' | 'PEER' | 'SUBORDINATE' | 'SELF';
  period: string;
  ratings: CompetencyRating[];
  overallRating: number;
  comments: string;
  submittedAt: Date;
  createdAt: Date;
}
