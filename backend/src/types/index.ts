export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN';

export type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONFLICT_DETECTED'
  | 'ALTERNATIVE_SUGGESTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RESERVED';

export interface PriorityScoreBreakdown {
  deadlineUrgency: number;       // 0-100 (weight: 35%)
  compatibility: number;         // 0-100 (weight: 25%)
  waitingTime: number;           // 0-100 (weight: 15%)
  fairness: number;              // 0-100 (weight: 15%)
  feasibility: number;           // 0-100 (weight: 10%)
  totalScore: number;            // 0-100
}

export interface SchedulingWeights {
  deadlineWeight: number;
  compatibilityWeight: number;
  waitingTimeWeight: number;
  fairnessWeight: number;
  feasibilityWeight: number;
}

export interface AlternativeSlot {
  type: 'SLOT' | 'EQUIPMENT' | 'DURATION';
  equipmentId: string;
  equipmentName: string;
  departmentName: string;
  date: string;                  // YYYY-MM-DD
  startTime: string;             // HH:mm
  endTime: string;               // HH:mm
  durationMinutes: number;
  reason: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  departmentName?: string;
  avatar?: string;
}
