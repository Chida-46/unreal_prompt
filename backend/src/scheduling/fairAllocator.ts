import { BookingRequestWithDetails, ConflictCluster, ConflictResolutionResult, EvaluatedRequest } from './types.js';
import { computePriorityScore, DEFAULT_WEIGHTS } from './priorityScorer.js';
import { findAlternativeOptions, EquipmentRecord, ExistingReservation, MaintenanceRecord } from './alternativeFinder.js';
import { generateSchedulingExplanation } from './explanationGenerator.js';
import { SchedulingWeights, AlternativeSlot } from '../types/index.js';

export function resolveConflictCluster(
  cluster: ConflictCluster,
  allEquipments: EquipmentRecord[],
  existingReservations: ExistingReservation[],
  maintenances: MaintenanceRecord[],
  weights: SchedulingWeights = DEFAULT_WEIGHTS
): ConflictResolutionResult {
  const evaluatedRequests: EvaluatedRequest[] = cluster.requests.map(req => ({
    request: req,
    breakdown: computePriorityScore(req, weights),
  }));

  // Sort descending by total composite score
  // If tied, prioritize earlier project deadline, then lower previous booking count, then earlier creation
  evaluatedRequests.sort((a, b) => {
    if (b.breakdown.totalScore !== a.breakdown.totalScore) {
      return b.breakdown.totalScore - a.breakdown.totalScore;
    }
    const deadlineDiff = new Date(a.request.projectDeadline).getTime() - new Date(b.request.projectDeadline).getTime();
    if (deadlineDiff !== 0) return deadlineDiff;

    const aBookings = a.request.student.bookings?.length || 0;
    const bBookings = b.request.student.bookings?.length || 0;
    if (aBookings !== bBookings) return aBookings - bBookings;

    return new Date(a.request.createdAt).getTime() - new Date(b.request.createdAt).getTime();
  });

  const winner = evaluatedRequests[0];
  const losers = evaluatedRequests.slice(1);

  // For each loser, find viable alternatives
  const alternativesForLosers: Record<string, AlternativeSlot[]> = {};

  // Treat the winner's slot as reserved when searching for alternatives
  const simulatedReservations: ExistingReservation[] = [
    ...existingReservations,
    {
      equipmentId: winner.request.equipmentId,
      scheduledDate: winner.request.requestedDate,
      startTime: winner.request.startTime,
      endTime: winner.request.endTime,
      status: 'ACTIVE',
    },
  ];

  for (const loser of losers) {
    const alts = findAlternativeOptions(
      loser.request.equipment,
      loser.request.requestedDate,
      loser.request.startTime,
      loser.request.endTime,
      loser.request.durationMinutes,
      allEquipments,
      simulatedReservations,
      maintenances
    );
    alternativesForLosers[loser.request.id] = alts;
  }

  const aiExplanation = generateSchedulingExplanation(
    winner,
    losers,
    cluster.equipmentName,
    alternativesForLosers
  );

  return {
    conflictGroupId: cluster.conflictGroupId,
    equipmentId: cluster.equipmentId,
    winner,
    losers,
    recommendedSlot: {
      date: cluster.date,
      startTime: winner.request.startTime,
      endTime: winner.request.endTime,
    },
    alternativeOptionsForLosers: alternativesForLosers,
    aiExplanation,
    fairnessScore: winner.breakdown.fairness,
  };
}
