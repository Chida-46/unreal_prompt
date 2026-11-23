export interface AIProviderConfig {
  provider: 'gemini' | 'ollama';
  apiKey?: string;
  model: string;
  enabled: boolean;
  ollamaBaseUrl?: string;
  timeoutMs?: number;
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

export interface EquipmentRecommendationResult {
  answer: string;
  recommendedEquipment: Array<{
    equipmentId: string;
    name: string;
    equipmentCode: string;
    departmentName: string;
    labName: string;
    status: string;
    relevanceReason: string;
    matchScore: number;
  }>;
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
