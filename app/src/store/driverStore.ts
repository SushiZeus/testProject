import { useState, useEffect } from 'react';
import type { DriverAssignment, DriverStatus, DriverJobStatus } from '@/types';
import { mockDriverAssignments, getUserById } from '@/data/mockData';

interface DriverState {
  assignments: DriverAssignment[];
  createAssignment: (data: {
    fileId: string;
    driverId: string;
    requestedBy: string;
    assignedBy: string;
  }) => DriverAssignment;
  updateAssignmentStatus: (
    assignmentId: string,
    newStatus: DriverJobStatus,
    data?: {
      acceptedAt?: Date;
      collectedAt?: Date;
      deliveredAt?: Date;
    }
  ) => void;
  reassignDriver: (
    assignmentId: string,
    newDriverId: string,
    assignedBy: string
  ) => void;
  getAssignmentById: (id: string) => DriverAssignment | undefined;
  getAssignmentsByFile: (fileId: string) => DriverAssignment[];
  getAssignmentsByDriver: (driverId: string) => DriverAssignment[];
  getPendingDriverRequests: () => DriverAssignment[];
  getDriverStatus: (driverId: string) => DriverStatus;
  getDriverWorkload: (driverId: string) => {
    totalAssigned: number;
    pending: number;
    accepted: number;
    collecting: number;
    collected: number;
  };
}

let state: {
  assignments: DriverAssignment[];
} = {
  assignments: mockDriverAssignments,
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(fn => fn());

export const useDriverStore = (): DriverState => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    get assignments() { return state.assignments; },

    createAssignment: (data) => {
      const newAssignment: DriverAssignment = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      state = {
        ...state,
        assignments: [...state.assignments, newAssignment],
      };
      notify();
      return newAssignment;
    },

    updateAssignmentStatus: (assignmentId, newStatus, data = {}) => {
      state = {
        ...state,
        assignments: state.assignments.map(a =>
          a.id === assignmentId
            ? { ...a, status: newStatus, ...data, updatedAt: new Date() }
            : a
        ),
      };
      notify();
    },

    reassignDriver: (assignmentId, newDriverId, assignedBy) => {
      state = {
        ...state,
        assignments: state.assignments.map(a =>
          a.id === assignmentId
            ? {
                ...a,
                driverId: newDriverId,
                assignedBy,
                status: 'PENDING',
                acceptedAt: undefined,
                updatedAt: new Date(),
              }
            : a
        ),
      };
      notify();
    },

    getAssignmentById: (id) => {
      const assignment = state.assignments.find(a => a.id === id);
      if (assignment) {
        return {
          ...assignment,
          driver: getUserById(assignment.driverId),
          requester: getUserById(assignment.requestedBy),
          assignedByUser: assignment.assignedBy ? getUserById(assignment.assignedBy) : undefined,
        };
      }
      return undefined;
    },

    getAssignmentsByFile: (fileId) => {
      return state.assignments
        .filter(a => a.fileId === fileId)
        .map(a => {
          const enriched = useDriverStore().getAssignmentById(a.id);
          return enriched!;
        });
    },

    getAssignmentsByDriver: (driverId) => {
      return state.assignments
        .filter(a => a.driverId === driverId)
        .map(a => {
          const enriched = useDriverStore().getAssignmentById(a.id);
          return enriched!;
        });
    },

    getPendingDriverRequests: () => {
      return state.assignments
        .filter(a => a.status === 'PENDING')
        .map(a => {
          const enriched = useDriverStore().getAssignmentById(a.id);
          return enriched!;
        });
    },

    getDriverStatus: (driverId) => {
      const assignments = state.assignments.filter(a => a.driverId === driverId);
      const hasActiveJob = assignments.some(a => 
        a.status === 'ACCEPTED' || a.status === 'COLLECTING'
      );
      return hasActiveJob ? 'ON_JOB' : 'AVAILABLE';
    },

    getDriverWorkload: (driverId) => {
      const assignments = state.assignments.filter(a => a.driverId === driverId);
      return {
        totalAssigned: assignments.length,
        pending: assignments.filter(a => a.status === 'PENDING').length,
        accepted: assignments.filter(a => a.status === 'ACCEPTED').length,
        collecting: assignments.filter(a => a.status === 'COLLECTING').length,
        collected: assignments.filter(a => a.status === 'COLLECTED').length,
      };
    },
  };
};
