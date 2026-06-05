import { useState, useEffect } from 'react';
import type { PerformanceAppraisal, Goal, PerformanceImprovementPlan } from '@/types/performance';

interface PerformanceState {
  appraisals: PerformanceAppraisal[];
  goals: Goal[];
  pips: PerformanceImprovementPlan[];
  createAppraisal: (data: Omit<PerformanceAppraisal, 'id' | 'appraisalNumber' | 'createdAt' | 'updatedAt'>) => PerformanceAppraisal;
  createGoal: (data: Omit<Goal, 'id' | 'goalNumber' | 'createdAt' | 'updatedAt'>) => Goal;
  createPIP: (data: Omit<PerformanceImprovementPlan, 'id' | 'pipNumber' | 'createdAt' | 'updatedAt'>) => PerformanceImprovementPlan;
  updateGoalProgress: (goalId: string, progress: number) => void;
  completeAppraisal: (appraisalId: string, overallRating: number) => void;
}

const generateNumber = (prefix: string, existing: any[]): string => {
  const year = new Date().getFullYear();
  const count = existing.length + 1;
  return `${prefix}-${year}-${count.toString().padStart(4, '0')}`;
};

const loadState = () => {
  if (typeof window === 'undefined') return { appraisals: [], goals: [], pips: [] };
  try {
    const saved = localStorage.getItem('performanceStore');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        appraisals: parsed.appraisals.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt), completedAt: a.completedAt ? new Date(a.completedAt) : undefined, updatedAt: new Date(a.updatedAt) })),
        goals: parsed.goals.map((g: any) => ({ ...g, startDate: new Date(g.startDate), targetDate: new Date(g.targetDate), createdAt: new Date(g.createdAt), updatedAt: new Date(g.updatedAt) })),
        pips: parsed.pips.map((p: any) => ({ ...p, startDate: new Date(p.startDate), endDate: new Date(p.endDate), reviewDate: new Date(p.reviewDate), createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt) })),
      };
    }
  } catch (error) {
    console.error('Error loading performance state:', error);
  }
  return { appraisals: [], goals: [], pips: [] };
};

const saveState = (state: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('performanceStore', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving performance state:', error);
    }
  }
};

let state = loadState();
const listeners = new Set<() => void>();

const notify = () => {
  saveState(state);
  listeners.forEach(fn => fn());
};

export const usePerformanceStore = (): PerformanceState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return {
    get appraisals() { return state.appraisals; },
    get goals() { return state.goals; },
    get pips() { return state.pips; },

    createAppraisal: (data) => {
      const newAppraisal: PerformanceAppraisal = {
        id: Math.random().toString(36).substr(2, 9),
        appraisalNumber: generateNumber('APR', state.appraisals),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state = { ...state, appraisals: [...state.appraisals, newAppraisal] };
      notify();
      return newAppraisal;
    },

    createGoal: (data) => {
      const newGoal: Goal = {
        id: Math.random().toString(36).substr(2, 9),
        goalNumber: generateNumber('GOAL', state.goals),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state = { ...state, goals: [...state.goals, newGoal] };
      notify();
      return newGoal;
    },

    createPIP: (data) => {
      const newPIP: PerformanceImprovementPlan = {
        id: Math.random().toString(36).substr(2, 9),
        pipNumber: generateNumber('PIP', state.pips),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state = { ...state, pips: [...state.pips, newPIP] };
      notify();
      return newPIP;
    },

    updateGoalProgress: (goalId, progress) => {
      state = {
        ...state,
        goals: state.goals.map((g: any) =>
          g.id === goalId ? {
            ...g,
            progress,
            status: progress >= 100 ? 'ACHIEVED' : 'ACTIVE',
            updatedAt: new Date(),
          } : g
        ),
      };
      notify();
    },

    completeAppraisal: (appraisalId, overallRating) => {
      state = {
        ...state,
        appraisals: state.appraisals.map((a: PerformanceAppraisal) =>
          a.id === appraisalId ? {
            ...a,
            status: 'COMPLETED',
            overallRating,
            completedAt: new Date(),
            updatedAt: new Date(),
          } : a
        ),
      };
      notify();
    },
  };
};
