import { prisma } from './prisma.js';
import { resolveConflictCluster } from '../scheduling/fairAllocator.js';
import { computePriorityScore } from '../scheduling/priorityScorer.js';
import { ConflictCluster } from '../scheduling/types.js';

export async function runSchedulingAnalysis(conflictGroupId: string) {
  // Fetch all requests in this conflict group
  const requests = prisma.bookingRequest.findMany({
    where: { conflictGroupId },
  });

  if (requests.length === 0) return null;

  // Enhance with student booking histories for fairness calculation
  const enhancedRequests = requests.map(r => {
    const studentBookings = prisma.booking.findMany({ where: { studentId: r.studentId } });
    return {
      ...r,
      student: {
        ...r.student,
        bookings: studentBookings.map(b => ({
          id: b.id,
          scheduledDate: b.scheduledDate,
          status: b.status,
        })),
      },
    };
  });

  const equipmentId = requests[0].equipmentId;
  const equipment = prisma.equipment.findUnique({ id: equipmentId });
  if (!equipment) return null;

  // Fetch all equipment, reservations, and maintenances for alternatives
  const allEquipments = prisma.equipment.findMany();
  const existingReservations = prisma.booking.findMany({ where: { status: 'ACTIVE' } });
  const maintenances = prisma.maintenanceSchedule.findMany({ where: { status: 'SCHEDULED' } });
  const weights = prisma.schedulingWeightConfig.get();

  const cluster: ConflictCluster = {
    conflictGroupId,
    equipmentId,
    equipmentName: equipment.name,
    date: new Date(requests[0].requestedDate).toISOString().split('T')[0],
    requests: enhancedRequests as any,
  };

  const resolution = resolveConflictCluster(
    cluster,
    allEquipments as any,
    existingReservations.map(r => ({
      equipmentId: r.equipmentId,
      scheduledDate: r.scheduledDate,
      startTime: r.startTime,
      endTime: r.endTime,
      status: r.status,
    })),
    maintenances.map(m => ({
      equipmentId: m.equipmentId,
      startDate: m.startDate,
      endDate: m.endDate,
      status: m.status,
    })),
    weights
  );

  // Update winning request priority score
  prisma.bookingRequest.update(
    { id: resolution.winner.request.id },
    { priorityScore: resolution.winner.breakdown.totalScore }
  );

  // Update losers with priority scores and status ALTERNATIVE_SUGGESTED
  for (const loser of resolution.losers) {
    prisma.bookingRequest.update(
      { id: loser.request.id },
      {
        priorityScore: loser.breakdown.totalScore,
        status: 'ALTERNATIVE_SUGGESTED',
      }
    );

    // Notify student about alternatives
    const loserAlts = resolution.alternativeOptionsForLosers[loser.request.id] || [];
    prisma.notification.create({
      userId: loser.request.studentId,
      title: '💡 Alternative Slots Recommended',
      message: `Due to a scheduling conflict for ${equipment.name}, the AI engine found ${loserAlts.length} alternative slots/equipment for your project.`,
      type: 'ALTERNATIVE',
      linkUrl: '/ai-recommendations',
    });
  }

  // Save or update recommendation record
  prisma.allocationRecommendation.upsert({
    conflictGroupId,
    equipmentId,
    winningRequestId: resolution.winner.request.id,
    recommendedDate: resolution.recommendedSlot.date,
    recommendedStartTime: resolution.recommendedSlot.startTime,
    recommendedEndTime: resolution.recommendedSlot.endTime,
    priorityScoreBreakdown: resolution.winner.breakdown,
    fairnessScore: resolution.fairnessScore,
    aiExplanation: resolution.aiExplanation,
    alternativeOptionsJson: resolution.alternativeOptionsForLosers,
    status: 'PENDING_REVIEW',
  });

  return resolution;
}

export async function getRecommendations() {
  const recommendations = prisma.allocationRecommendation.findMany();
  const results = [];

  for (const rec of recommendations) {
    const winningReq = prisma.bookingRequest.findUnique({ id: rec.winningRequestId });
    const allRequestsInGroup = prisma.bookingRequest.findMany({
      where: { conflictGroupId: rec.conflictGroupId },
    });
    const equipment = prisma.equipment.findUnique({ id: rec.equipmentId });

    results.push({
      ...rec,
      equipment,
      winningRequest: winningReq,
      allRequests: allRequestsInGroup,
    });
  }

  return results;
}

export async function getRecommendationByConflictGroup(conflictGroupId: string) {
  const rec = prisma.allocationRecommendation.findUnique({ conflictGroupId });
  if (!rec) return null;

  const winningReq = prisma.bookingRequest.findUnique({ id: rec.winningRequestId });
  const allRequestsInGroup = prisma.bookingRequest.findMany({
    where: { conflictGroupId },
  });
  const equipment = prisma.equipment.findUnique({ id: rec.equipmentId });

  return {
    ...rec,
    equipment,
    winningRequest: winningReq,
    allRequests: allRequestsInGroup,
  };
}

export async function evaluateSingleRequestScore(requestId: string) {
  const req = prisma.bookingRequest.findUnique({ id: requestId });
  if (!req) return null;

  const studentBookings = prisma.booking.findMany({ where: { studentId: req.studentId } });
  const weights = prisma.schedulingWeightConfig.get();

  const reqWithDetails = {
    ...req,
    student: {
      ...req.student,
      bookings: studentBookings.map(b => ({
        id: b.id,
        scheduledDate: b.scheduledDate,
        status: b.status,
      })),
    },
  };

  const breakdown = computePriorityScore(reqWithDetails as any, weights);
  return {
    requestId,
    breakdown,
  };
}
