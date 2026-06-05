import { useState, useEffect } from 'react';
import type { TrainingCourse, Enrollment, Certificate } from '@/types/training';

interface TrainingState {
  courses: TrainingCourse[];
  enrollments: Enrollment[];
  certificates: Certificate[];
  createCourse: (data: Omit<TrainingCourse, 'id' | 'courseNumber' | 'createdAt' | 'updatedAt'>) => TrainingCourse;
  enrollEmployee: (data: Omit<Enrollment, 'id' | 'enrollmentNumber' | 'createdAt'>) => Enrollment;
  issueCertificate: (data: Omit<Certificate, 'id' | 'certificateNumber' | 'createdAt'>) => Certificate;
  completeEnrollment: (enrollmentId: string, score: number) => void;
}

const generateNumber = (prefix: string, existing: any[]): string => {
  const year = new Date().getFullYear();
  const count = existing.length + 1;
  return `${prefix}-${year}-${count.toString().padStart(4, '0')}`;
};

const loadState = () => {
  if (typeof window === 'undefined') return { courses: [], enrollments: [], certificates: [] };
  try {
    const saved = localStorage.getItem('trainingStore');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        courses: parsed.courses.map((c: any) => ({ ...c, startDate: new Date(c.startDate), endDate: new Date(c.endDate), createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) })),
        enrollments: parsed.enrollments.map((e: any) => ({ ...e, enrolledDate: new Date(e.enrolledDate), completedDate: e.completedDate ? new Date(e.completedDate) : undefined, createdAt: new Date(e.createdAt) })),
        certificates: parsed.certificates.map((c: any) => ({ ...c, issueDate: new Date(c.issueDate), expiryDate: c.expiryDate ? new Date(c.expiryDate) : undefined, createdAt: new Date(c.createdAt) })),
      };
    }
  } catch (error) {
    console.error('Error loading training state:', error);
  }
  return { courses: [], enrollments: [], certificates: [] };
};

const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('trainingStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving training state:', error);
    }
  }
};

let state = loadState();
const listeners = new Set<() => void>();

const notify = () => {
  saveState(state);
  listeners.forEach(fn => fn());
};

export const useTrainingStore = (): TrainingState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return {
    get courses() { return state.courses; },
    get enrollments() { return state.enrollments; },
    get certificates() { return state.certificates; },

    createCourse: (data) => {
      const newCourse: TrainingCourse = {
        id: Math.random().toString(36).substr(2, 9),
        courseNumber: generateNumber('TRN', state.courses),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state = { ...state, courses: [...state.courses, newCourse] };
      notify();
      return newCourse;
    },

    enrollEmployee: (data) => {
      const newEnrollment: Enrollment = {
        id: Math.random().toString(36).substr(2, 9),
        enrollmentNumber: generateNumber('ENR', state.enrollments),
        ...data,
        createdAt: new Date(),
      };
      state = { ...state, enrollments: [...state.enrollments, newEnrollment] };
      notify();
      return newEnrollment;
    },

    issueCertificate: (data) => {
      const newCertificate: Certificate = {
        id: Math.random().toString(36).substr(2, 9),
        certificateNumber: generateNumber('CERT', state.certificates),
        ...data,
        createdAt: new Date(),
      };
      state = { ...state, certificates: [...state.certificates, newCertificate] };
      notify();
      return newCertificate;
    },

    completeEnrollment: (enrollmentId, score) => {
      state = {
        ...state,
        enrollments: state.enrollments.map((e: any) =>
          e.id === enrollmentId ? {
            ...e,
            status: score >= 50 ? 'COMPLETED' : 'FAILED',
            score,
            completedDate: new Date(),
            certificateIssued: score >= 50,
          } : e
        ),
      };
      notify();
    },
  };
};
