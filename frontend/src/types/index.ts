export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN';

export type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONFLICT_DETECTED'
  | 'ALTERNATIVE_SUGGESTED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  departmentId?: string;
  department?: { id: string; name: string };
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Laboratory {
  id: string;
  name: string;
  roomNumber: string;
  departmentId: string;
  operatingHours: string;
  department?: { id: string; name: string };
}

export interface EquipmentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Equipment {
  id: string;
  equipmentCode: string;
  name: string;
  categoryId: string;
  departmentId: string;
  laboratoryId: string;
  description: string;
  specifications: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RESERVED';
  maxDurationHours: number;
  requiresApproval: boolean;
  modelNumber?: string;
  iconSvg?: string;
  department: { id: string; name: string; code: string };
  laboratory: { id: string; name: string; roomNumber: string };
  category: { id: string; name: string; slug: string };
  bookings?: {
    id: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    status: string;
    student?: { id: string; name: string };
  }[];
  maintenanceSchedules?: {
    id: string;
    title: string;
    reason: string;
    startDate: string;
    endDate: string;
    status: string;
  }[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  departmentId: string;
  studentId: string;
  deadline: string;
  techStack?: string;
  department?: { id: string; name: string };
  student?: { id: string; name: string };
  createdAt: string;
}

export interface BookingRequest {
  id: string;
  projectId: string;
  equipmentId: string;
  studentId: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  projectDeadline: string;
  technicalRequirements?: string;
  accessReason: string;
  status: BookingStatus;
  priorityScore?: number;
  facultyNotes?: string;
  rejectionReason?: string;
  conflictGroupId?: string;
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
    deadline: string;
    techStack?: string;
  };
  equipment: {
    id: string;
    equipmentCode: string;
    name: string;
    specifications: string;
    maxDurationHours: number;
    department: { name: string };
    category: { name: string; slug: string };
  };
  student: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingRequestId: string;
  equipmentId: string;
  studentId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
  equipment: {
    id: string;
    name: string;
    equipmentCode: string;
    department: { name: string };
  };
  student: { id: string; name: string; email: string };
  projectTitle?: string;
  createdAt: string;
}

export interface PriorityScoreBreakdown {
  deadlineUrgency: number;
  compatibility: number;
  waitingTime: number;
  fairness: number;
  feasibility: number;
  totalScore: number;
}

export interface AlternativeOption {
  type: 'SLOT' | 'EQUIPMENT' | 'DURATION';
  equipmentId: string;
  equipmentName: string;
  departmentName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  reason: string;
}

export interface AllocationRecommendation {
  id: string;
  conflictGroupId: string;
  equipmentId: string;
  winningRequestId: string;
  recommendedDate: string;
  recommendedStartTime: string;
  recommendedEndTime: string;
  priorityScoreBreakdown: PriorityScoreBreakdown;
  fairnessScore: number;
  aiExplanation: string;
  alternativeOptionsJson: Record<string, AlternativeOption[]>;
  status: string;
  equipment?: Equipment;
  winningRequest?: BookingRequest;
  allRequests?: BookingRequest[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'SUBMISSION' | 'APPROVAL' | 'REJECTION' | 'CONFLICT' | 'ALTERNATIVE' | 'CANCELLATION' | 'MAINTENANCE';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnalyticsData {
  summary: {
    totalEquipment: number;
    availableEquipment: number;
    inUseEquipment: number;
    maintenanceEquipment: number;
    totalBookings: number;
    activeBookings: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    conflictFrequency: number;
    utilizationPercentage: number;
    maintenanceFrequency: number;
  };
  departmentUtilization: {
    departmentId: string;
    departmentCode: string;
    departmentName: string;
    totalEquipment: number;
    activeBookings: number;
    utilizationRate: number;
  }[];
  mostRequestedEquipment: {
    id: string;
    name: string;
    equipment_code: string;
    department_name: string;
    request_count: number;
  }[];
  bookingStatusDistribution: {
    status: string;
    count: number;
  }[];
  unusedResources: {
    id: string;
    name: string;
    equipment_code: string;
    department_name: string;
  }[];
  peakBookingHours: {
    start_time: string;
    count: number;
  }[];
}

export interface SchedulingWeights {
  id?: string;
  deadlineWeight: number;
  compatibilityWeight: number;
  waitingTimeWeight: number;
  fairnessWeight: number;
  feasibilityWeight: number;
}

// =============================================================================
// Generative AI Types
// =============================================================================
export interface AIStatus {
  provider: 'gemini' | 'ollama';
  model: string;
  enabled: boolean;
  hasApiKey: boolean;
}

export interface ProjectAnalysisResult {
  projectOverview: {
    title: string;
    category: string;
    summary: string;
  };
  requiredEquipment: Array<{
    name: string;
    reason: string;
    estimatedQuantity: number;
    categoryHint?: string;
  }>;
  technicalRequirements: {
    microcontrollerCompatibility: string;
    sensorInterfaces: string;
    wirelessConnectivity: string;
    powerSpecs: string;
  };
  estimatedUsage: {
    suggestedDuration: string;
    recommendedSlotMinutes: number;
    requiresSpecializedLab: boolean;
    labType?: string;
  };
  additionalRecommendations: {
    alternativeEquipment: string[];
    missingComponents: string[];
    safetyConsiderations: string[];
  };
  isAIGenerated: boolean;
  modelUsed: string;
}

export interface RecommendedEquipmentItem {
  equipmentId: string;
  name: string;
  equipmentCode: string;
  departmentName: string;
  labName: string;
  status: string;
  relevanceReason: string;
  matchScore: number;
}

export interface EquipmentRecommendationResult {
  answer: string;
  recommendedEquipment: RecommendedEquipmentItem[];
  suggestedAlternatives: Array<{
    equipmentId: string;
    name: string;
    reason: string;
  }>;
  isAIGenerated: boolean;
  modelUsed: string;
}

export interface ConflictExplanationResult {
  summary: string;
  recommendedStudentExplanation: string;
  factorBreakdownExplanations: {
    deadlineUrgency: string;
    technicalCompatibility: string;
    waitingTime: string;
    historicalFairness: string;
    schedulingFeasibility: string;
  };
  alternativeRecommendationsRationale: string;
  isAIGenerated: boolean;
  modelUsed: string;
}

export interface FacultySummaryResult {
  projectSummary: string;
  requestedEquipment: Array<{
    name: string;
    specs: string;
    requestedSlot: string;
  }>;
  purposeOfEquipment: string;
  technicalCompatibility: {
    isCompatible: boolean;
    explanation: string;
  };
  availabilityAndConstraints: string;
  potentialConcerns: string[];
  aiRecommendation: {
    verdict: 'APPEARS_TECHNICALLY_SUITABLE' | 'ADDITIONAL_INFO_REQUIRED' | 'POTENTIAL_MISMATCH' | 'ALTERNATIVE_SUGGESTED';
    rationale: string;
  };
  isAIGenerated: boolean;
  modelUsed: string;
}

