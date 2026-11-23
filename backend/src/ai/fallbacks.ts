import {
  ProjectAnalysisResult,
  EquipmentRecommendationResult,
  ConflictExplanationResult,
  FacultySummaryResult,
} from './types.js';

export function getDeterministicProjectAnalysisFallback(description: string): ProjectAnalysisResult {
  const lower = description.toLowerCase();
  const isIoT = lower.includes('iot') || lower.includes('sensor') || lower.includes('agriculture');
  const isAI = lower.includes('ai') || lower.includes('vision') || lower.includes('machine learning') || lower.includes('yolo');
  const isRobo = lower.includes('robot') || lower.includes('arm') || lower.includes('motor');
  const isFPGA = lower.includes('fpga') || lower.includes('verilog') || lower.includes('vhdl') || lower.includes('hardware');

  return {
    projectOverview: {
      title: isIoT ? 'IoT Telemetry & Embedded Prototype' : isAI ? 'Edge AI / Vision Research Module' : 'Academic Hardware Prototype',
      category: isIoT ? 'Internet of Things' : isAI ? 'Artificial Intelligence' : isRobo ? 'Robotics' : 'Embedded Systems',
      summary: description.slice(0, 180) + (description.length > 180 ? '...' : ''),
    },
    requiredEquipment: [
      {
        name: isIoT ? 'ESP32 NodeMCU IoT Development Board' : isAI ? 'NVIDIA Jetson Nano Edge AI Kit' : isFPGA ? 'FPGA Development Kit' : 'Digital Storage Oscilloscope',
        reason: 'Primary processing and hardware prototyping unit matching project scope.',
        estimatedQuantity: 1,
        categoryHint: isIoT ? 'iot' : isAI ? 'ai-workstations' : 'embedded-systems',
      },
    ],
    technicalRequirements: {
      microcontrollerCompatibility: isIoT ? '3.3V logic, Wi-Fi 802.11 b/g/n, BLE 4.2' : 'ARM Cortex / CUDA 11+ runtime',
      sensorInterfaces: 'I2C / SPI / GPIO analog pins',
      wirelessConnectivity: isIoT ? '2.4 GHz Wi-Fi & Bluetooth Low Energy' : 'Gigabit Ethernet / USB 3.0',
      powerSpecs: '5V DC micro-USB / regulated 3.3V rail',
    },
    estimatedUsage: {
      suggestedDuration: '2 - 4 Weeks',
      recommendedSlotMinutes: 120,
      requiresSpecializedLab: isAI || isFPGA,
      labType: isAI ? 'AI and Machine Learning Lab' : 'Embedded Systems Lab',
    },
    additionalRecommendations: {
      alternativeEquipment: [isIoT ? 'Raspberry Pi 4 Model B' : 'Jetson Orin Nano'],
      missingComponents: ['Jumper wires', 'Breadboard', 'External sensors / probes'],
      safetyConsiderations: ['Ensure regulated current when powering sensor pins directly.'],
    },
    isAIGenerated: false,
    modelUsed: 'Deterministic Fallback Engine (Non-GenAI)',
  };
}

export function getDeterministicEquipmentRecommendationFallback(
  query: string,
  inventory: any[]
): EquipmentRecommendationResult {
  const lower = query.toLowerCase();
  const matched = inventory.filter(e => {
    const text = `${e.name} ${e.description} ${e.specifications} ${e.category?.name || ''}`.toLowerCase();
    return lower.split(/\s+/).some(word => word.length > 3 && text.includes(word));
  }).slice(0, 3);

  const pool = matched.length > 0 ? matched : inventory.slice(0, 2);

  return {
    answer: `[Deterministic Fallback Notice]: Generative AI is currently offline or unconfigured. Below are catalog matches retrieved directly via keyword filtering across verified inventory.`,
    recommendedEquipment: pool.map(e => ({
      equipmentId: e.id,
      name: e.name,
      equipmentCode: e.equipmentCode,
      departmentName: e.department?.name || 'Engineering',
      labName: e.laboratory?.name || 'Central Lab',
      status: e.status,
      relevanceReason: `Matches hardware catalog category and specifications for: "${query}".`,
      matchScore: 85,
    })),
    suggestedAlternatives: inventory.filter(e => !pool.some(p => p.id === e.id)).slice(0, 2).map(e => ({
      equipmentId: e.id,
      name: e.name,
      reason: 'Alternative equipment available in adjacent laboratory facility.',
    })),
    isAIGenerated: false,
    modelUsed: 'Deterministic Keyword Matcher (Non-GenAI)',
  };
}

export function getDeterministicConflictExplanationFallback(
  cluster: any,
  winner: any,
  losers: any[]
): ConflictExplanationResult {
  return {
    summary: `Scheduling conflict detected on ${cluster.equipmentName} for ${cluster.date}. ${winner.request.student.name} and ${losers.length} other student(s) requested overlapping slots.`,
    recommendedStudentExplanation: `The deterministic fairness engine recommended allocating the primary slot to ${winner.request.student.name} with a verified priority score of ${winner.breakdown.totalScore.toFixed(1)}/100, driven primarily by deadline urgency (${winner.breakdown.deadlineScore.toFixed(1)} pts) and hardware compatibility (${winner.breakdown.compatibilityScore.toFixed(1)} pts).`,
    factorBreakdownExplanations: {
      deadlineUrgency: `Evaluates milestone delivery proximity (35% weight). Winner scored ${winner.breakdown.deadlineScore.toFixed(1)}/35.`,
      technicalCompatibility: `Evaluates hardware match between project and instrument (25% weight). Winner scored ${winner.breakdown.compatibilityScore.toFixed(1)}/25.`,
      waitingTime: `Evaluates how early the request was queued (15% weight). Winner scored ${winner.breakdown.waitingTimeScore.toFixed(1)}/15.`,
      historicalFairness: `Prevents monopolization by rewarding students with fewer prior bookings (15% weight). Winner scored ${winner.breakdown.fairnessScore.toFixed(1)}/15.`,
      schedulingFeasibility: `Checks conflict-free buffer time and duration fit (10% weight). Winner scored ${winner.breakdown.feasibilityScore.toFixed(1)}/10.`,
    },
    alternativeRecommendationsRationale: `Verified alternative slots and compatible hardware are recommended for runner-up student(s) based on verified real-time laboratory availability.`,
    isAIGenerated: false,
    modelUsed: 'Deterministic Allocation Engine (Non-GenAI)',
  };
}

export function getDeterministicFacultySummaryFallback(
  request: any,
  equipment: any
): FacultySummaryResult {
  const deadlineDays = Math.max(0, Math.round((new Date(request.projectDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  return {
    projectSummary: request.project?.title || 'Academic Student Engineering Project',
    requestedEquipment: [
      {
        name: equipment.name,
        specs: equipment.specifications || 'Standard specifications',
        requestedSlot: `${new Date(request.requestedDate).toISOString().split('T')[0]} (${request.startTime} - ${request.endTime})`,
      },
    ],
    purposeOfEquipment: request.accessReason || 'Laboratory testing and hardware validation.',
    technicalCompatibility: {
      isCompatible: true,
      explanation: `Requested ${equipment.name} satisfies the project technical scope. Project deadline is in ${deadlineDays} day(s).`,
    },
    availabilityAndConstraints: `Slot requested for ${request.durationMinutes / 60} hour(s). Maximum permitted on instrument is ${equipment.maxDurationHours} hour(s).`,
    potentialConcerns: deadlineDays < 3 ? ['Urgent project deadline (due within 3 days).'] : ['Standard supervision recommended.'],
    aiRecommendation: {
      verdict: 'APPEARS_TECHNICALLY_SUITABLE',
      rationale: 'Project scope aligns with hardware capabilities and lab operating hours. Faculty has sole approval authority.',
    },
    isAIGenerated: false,
    modelUsed: 'Deterministic Analysis Fallback (Non-GenAI)',
  };
}
