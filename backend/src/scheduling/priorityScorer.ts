import { PriorityScoreBreakdown, SchedulingWeights } from '../types/index.js';
import { BookingRequestWithDetails } from './types.js';

export const DEFAULT_WEIGHTS: SchedulingWeights = {
  deadlineWeight: 0.35,
  compatibilityWeight: 0.25,
  waitingTimeWeight: 0.15,
  fairnessWeight: 0.15,
  feasibilityWeight: 0.10,
};

/**
 * Calculates deadline urgency score on a 0-100 scale.
 * The sooner the project deadline is relative to requested access date, the higher the score.
 */
export function calculateDeadlineUrgency(projectDeadline: Date, requestedDate: Date): number {
  const diffMs = new Date(projectDeadline).getTime() - new Date(requestedDate).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays <= 0) {
    // Project deadline is on the day of or past the requested date - critical urgency
    return 100;
  }
  if (diffDays <= 1) return 98;
  if (diffDays <= 3) return 90;
  if (diffDays <= 7) return 78;
  if (diffDays <= 14) return 60;
  if (diffDays <= 21) return 45;
  if (diffDays <= 30) return 30;
  return 15;
}

/**
 * Evaluates technical requirement and equipment compatibility.
 * Checks student's technical requirements and project description against equipment specifications.
 */
export function calculateCompatibilityScore(
  techReqs: string | null | undefined,
  projectDesc: string,
  equipmentSpecs: string,
  projectTechStack?: string | null
): number {
  const combinedUserText = `${techReqs || ''} ${projectDesc} ${projectTechStack || ''}`.toLowerCase();
  const specsLower = equipmentSpecs.toLowerCase();

  // Keyword extraction from specifications
  const specTokens = specsLower
    .split(/[\s,;|/()\-]+/)
    .map(t => t.trim())
    .filter(t => t.length > 2);

  if (specTokens.length === 0) return 70; // baseline if no specific tokens

  let matchedTokens = 0;
  for (const token of specTokens) {
    if (combinedUserText.includes(token)) {
      matchedTokens++;
    }
  }

  // Also check specific domain indicators
  const domainKeywords = [
    'fpga', 'vhdl', 'verilog', 'vivado', 'xilinx', 'altera',
    'jetson', 'cuda', 'gpu', 'deep learning', 'neural', 'tensor',
    'arduino', 'microcontroller', 'embedded', 'firmware',
    'raspberry', 'linux', 'arm', 'gpio', 'spi', 'i2c',
    'oscilloscope', 'waveform', 'bandwidth', 'mhz', 'ghz', 'probe',
    '3d print', 'filament', 'pla', 'stl', 'layer', 'nozzle',
    'pcb', 'schematic', 'soldering', 'smt', 'prototyping',
    'iot', 'esp32', 'sensor', 'zigbee', 'mqtt', 'lora',
    'robotics', 'servo', 'kinematics', 'ros', 'motor'
  ];

  let domainMatches = 0;
  for (const kw of domainKeywords) {
    if (specsLower.includes(kw) && combinedUserText.includes(kw)) {
      domainMatches += 2;
    }
  }

  const matchRatio = (matchedTokens + domainMatches) / Math.max(specTokens.length, 5);
  const score = Math.min(100, Math.max(40, Math.round(50 + matchRatio * 50)));
  return score;
}

/**
 * Calculates waiting time score (0-100) based on how long the request has been waiting.
 */
export function calculateWaitingTimeScore(createdAt: Date): number {
  const now = Date.now();
  const waitMs = now - new Date(createdAt).getTime();
  const waitHours = waitMs / (1000 * 60 * 60);

  if (waitHours >= 48) return 100;
  if (waitHours >= 24) return 85;
  if (waitHours >= 12) return 70;
  if (waitHours >= 4) return 50;
  if (waitHours >= 1) return 35;
  return 20;
}

/**
 * Calculates historical allocation fairness score (0-100).
 * Students with fewer existing bookings receive a higher fairness score
 * to prevent resource monopolization.
 */
export function calculateFairnessScore(existingBookingsCount: number): number {
  if (existingBookingsCount === 0) return 100; // First-time access: maximum fairness boost
  if (existingBookingsCount === 1) return 85;
  if (existingBookingsCount === 2) return 70;
  if (existingBookingsCount === 3) return 55;
  if (existingBookingsCount === 4) return 40;
  return 25; // Frequent user: lower priority to give others a turn
}

/**
 * Calculates scheduling feasibility (0-100).
 * Evaluates duration fit within lab hours (08:00-18:00) and equipment max limits.
 */
export function calculateFeasibilityScore(
  durationMinutes: number,
  maxDurationHours: number,
  startTime: string,
  endTime: string
): number {
  const maxAllowedMinutes = maxDurationHours * 60;
  let score = 100;

  // Penalize exceeding max allowed duration
  if (durationMinutes > maxAllowedMinutes) {
    score -= 40;
  }

  // Operating hours check: preferred 08:00 to 18:00
  const [startH] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  if (startH < 8 || endH > 18 || (endH === 18 && endM > 0)) {
    score -= 30; // Outside standard lab hours
  }

  // Compact slots (e.g. 1-3 hours) are more easily scheduleable than 6+ hour blocks
  if (durationMinutes > 240) {
    score -= 15;
  }

  return Math.max(20, Math.min(100, score));
}

/**
 * Computes full composite priority score using transparent weighted scoring model.
 */
export function computePriorityScore(
  request: BookingRequestWithDetails,
  weights: SchedulingWeights = DEFAULT_WEIGHTS
): PriorityScoreBreakdown {
  const deadlineUrgency = calculateDeadlineUrgency(request.projectDeadline, request.requestedDate);
  const compatibility = calculateCompatibilityScore(
    request.technicalRequirements,
    request.project.description,
    request.equipment.specifications,
    request.project.techStack
  );
  const waitingTime = calculateWaitingTimeScore(request.createdAt);
  const existingBookings = request.student.bookings ? request.student.bookings.length : 0;
  const fairness = calculateFairnessScore(existingBookings);
  const feasibility = calculateFeasibilityScore(
    request.durationMinutes,
    request.equipment.maxDurationHours,
    request.startTime,
    request.endTime
  );

  const totalScore = parseFloat(
    (
      deadlineUrgency * weights.deadlineWeight +
      compatibility * weights.compatibilityWeight +
      waitingTime * weights.waitingTimeWeight +
      fairness * weights.fairnessWeight +
      feasibility * weights.feasibilityWeight
    ).toFixed(2)
  );

  return {
    deadlineUrgency,
    compatibility,
    waitingTime,
    fairness,
    feasibility,
    totalScore,
  };
}
