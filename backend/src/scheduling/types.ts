import { PriorityScoreBreakdown, SchedulingWeights, AlternativeSlot } from '../types/index.js';

export interface BookingRequestWithDetails {
  id: string;
  projectId: string;
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
    deadline: Date;
    techStack?: string | null;
  };
  equipmentId: string;
  equipment: {
    id: string;
    equipmentCode: string;
    name: string;
    categoryId: string;
    departmentId: string;
    specifications: string;
    status: string;
    maxDurationHours: number;
    department: {
      name: string;
    };
    category: {
      name: string;
      slug: string;
    };
  };
  studentId: string;
  student: {
    id: string;
    name: string;
    email: string;
    bookings?: { id: string; scheduledDate: Date; status: string }[];
  };
  requestedDate: Date;
  startTime: string;             // "09:00"
  endTime: string;               // "12:00"
  durationMinutes: number;
  projectDeadline: Date;
  technicalRequirements?: string | null;
  accessReason: string;
  status: string;
  priorityScore?: number | null;
  conflictGroupId?: string | null;
  createdAt: Date;
}

export interface ConflictCluster {
  conflictGroupId: string;
  equipmentId: string;
  equipmentName: string;
  date: string;
  requests: BookingRequestWithDetails[];
}

export interface EvaluatedRequest {
  request: BookingRequestWithDetails;
  breakdown: PriorityScoreBreakdown;
}

export interface ConflictResolutionResult {
  conflictGroupId: string;
  equipmentId: string;
  winner: EvaluatedRequest;
  losers: EvaluatedRequest[];
  recommendedSlot: {
    date: string;
    startTime: string;
    endTime: string;
  };
  alternativeOptionsForLosers: Record<string, AlternativeSlot[]>;
  aiExplanation: string;
  fairnessScore: number;
}
