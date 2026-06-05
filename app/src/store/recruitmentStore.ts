import { useState, useEffect } from 'react';
import type { JobPosting, Applicant, Interview } from '@/types/recruitment';

interface RecruitmentState {
  jobs: JobPosting[];
  applicants: Applicant[];
  interviews: Interview[];
  createJob: (data: Omit<JobPosting, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt'>) => JobPosting;
  createApplicant: (data: Omit<Applicant, 'id' | 'applicationNumber' | 'createdAt' | 'updatedAt'>) => Applicant;
  scheduleInterview: (data: Omit<Interview, 'id' | 'interviewNumber' | 'createdAt' | 'updatedAt'>) => Interview;
}

const generateNumber = (prefix: string, existing: any[]): string => {
  const year = new Date().getFullYear();
  const count = existing.length + 1;
  return `${prefix}-${year}-${count.toString().padStart(4, '0')}`;
};

const loadState = () => {
  if (typeof window === 'undefined') return { jobs: [], applicants: [], interviews: [] };
  try {
    const saved = localStorage.getItem('recruitmentStore');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        jobs: parsed.jobs.map((j: any) => ({ ...j, postedDate: new Date(j.postedDate), closingDate: new Date(j.closingDate), createdAt: new Date(j.createdAt), updatedAt: new Date(j.updatedAt) })),
        applicants: parsed.applicants.map((a: any) => ({ ...a, appliedDate: new Date(a.appliedDate), createdAt: new Date(a.createdAt), updatedAt: new Date(a.updatedAt) })),
        interviews: parsed.interviews.map((i: any) => ({ ...i, scheduledDate: new Date(i.scheduledDate), createdAt: new Date(i.createdAt), updatedAt: new Date(i.updatedAt) })),
      };
    }
  } catch (error) {
    console.error('Error loading recruitment state:', error);
  }
  return { jobs: [], applicants: [], interviews: [] };
};

const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('recruitmentStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving recruitment state:', error);
    }
  }
};

let state = loadState();
const listeners = new Set<() => void>();

const notify = () => {
  saveState(state);
  listeners.forEach(fn => fn());
};

export const useRecruitmentStore = (): RecruitmentState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return {
    get jobs() { return state.jobs; },
    get applicants() { return state.applicants; },
    get interviews() { return state.interviews; },

    createJob: (data) => {
      const newJob: JobPosting = {
        id: Math.random().toString(36).substr(2, 9),
        jobNumber: generateNumber('JOB', state.jobs),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state = { ...state, jobs: [...state.jobs, newJob] };
      notify();
      return newJob;
    },

    createApplicant: (data) => {
      const newApplicant: Applicant = {
        id: Math.random().toString(36).substr(2, 9),
        applicationNumber: generateNumber('APP', state.applicants),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state = { ...state, applicants: [...state.applicants, newApplicant] };
      notify();
      return newApplicant;
    },

    scheduleInterview: (data) => {
      const newInterview: Interview = {
        id: Math.random().toString(36).substr(2, 9),
        interviewNumber: generateNumber('INT', state.interviews),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state = { ...state, interviews: [...state.interviews, newInterview] };
      notify();
      return newInterview;
    },
  };
};
