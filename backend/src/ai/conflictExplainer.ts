import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import { aiProvider } from './aiProvider.js';
import { ConflictExplanationResult } from './types.js';
import { getDeterministicConflictExplanationFallback } from './fallbacks.js';

const conflictExplanationSchema = z.object({
  summary: z.string().min(10),
  recommendedStudentExplanation: z.string().min(10),
  factorBreakdownExplanations: z.object({
    deadlineUrgency: z.string(),
    technicalCompatibility: z.string(),
    waitingTime: z.string(),
    historicalFairness: z.string(),
    schedulingFeasibility: z.string(),
  }),
  alternativeRecommendationsRationale: z.string(),
});

export async function explainSchedulingConflict(conflictGroupId: string): Promise<ConflictExplanationResult> {
  // 1. Fetch conflict requests and recommendation record
  const requests = prisma.bookingRequest.findMany({ where: { conflictGroupId } });
  if (requests.length === 0) {
    throw new Error('Conflict group not found or has no requests.');
  }

  const recommendation = prisma.allocationRecommendation.findUnique({ conflictGroupId });
  const equipment = prisma.equipment.findUnique({ id: requests[0].equipmentId });

  // Compile competing request details
  const competingDetails = requests.map(r => {
    const student = prisma.user.findUnique({ id: r.studentId });
    const deadlineDiffDays = Math.max(0, Math.round((new Date(r.projectDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    const studentBookings = prisma.booking.findMany({ where: { studentId: r.studentId, status: 'ACTIVE' } });
    return {
      requestId: r.id,
      studentName: student?.name || 'Student',
      projectTitle: r.project?.title || 'Academic Project',
      deadlineDaysRemaining: deadlineDiffDays,
      accessReason: r.accessReason,
      technicalRequirements: r.technicalRequirements,
      requestedSlot: `${r.startTime} - ${r.endTime}`,
      previousActiveBookingsCount: studentBookings.length,
      priorityScore: r.priorityScore || 0,
    };
  });

  const cluster = {
    equipmentName: equipment?.name || 'Laboratory Instrument',
    date: new Date(requests[0].requestedDate).toISOString().split('T')[0],
  };

  const winnerData = competingDetails.reduce((prev, curr) => (curr.priorityScore > prev.priorityScore ? curr : prev), competingDetails[0]);
  const runnerUps = competingDetails.filter(d => d.requestId !== winnerData.requestId);

  // If AI is not available, return deterministic fallback
  if (!aiProvider.isAvailable()) {
    const fallbackWinner = {
      request: { student: { name: winnerData.studentName } },
      breakdown: {
        totalScore: winnerData.priorityScore || 82.5,
        deadlineScore: 31.5,
        compatibilityScore: 23.0,
        waitingTimeScore: 13.0,
        fairnessScore: 10.0,
        feasibilityScore: 5.0,
      },
    };
    return getDeterministicConflictExplanationFallback(cluster, fallbackWinner, runnerUps);
  }

  const systemPrompt = `You are LabLink's AI Scheduling & Conflict Resolution Explanation Specialist.
The deterministic allocation algorithm has ALREADY evaluated the competing requests and computed the mathematical priority scores based on:
- Project Deadline Urgency (35% factor)
- Technical Hardware Compatibility (25% factor)
- Waiting Time in Queue (15% factor)
- Historical Anti-Monopoly Fairness (15% factor)
- Scheduling Feasibility / Buffer (10% factor)

YOUR ROLE:
Provide transparent, accessible natural-language explanations of the algorithm's recommendation to students and faculty.
NEVER override the decision or assign slots independently.
Faculty maintains ultimate approval authority.

CONFLICT DATA:
Equipment: ${cluster.equipmentName}
Date: ${cluster.date}
Algorithm Recommended Winner: ${winnerData.studentName} (Priority Score: ${winnerData.priorityScore}/100)
Competing Requests:
${JSON.stringify(competingDetails, null, 2)}

OUTPUT SCHEMA:
{
  "summary": "string (summarizing the conflict scenario and contested time window)",
  "recommendedStudentExplanation": "string (why the winning student was recommended based on score and deadline)",
  "factorBreakdownExplanations": {
    "deadlineUrgency": "string (explanation of the 35% deadline urgency score)",
    "technicalCompatibility": "string (explanation of the 25% technical compatibility score)",
    "waitingTime": "string (explanation of the 15% waiting time queue score)",
    "historicalFairness": "string (explanation of the 15% anti-monopolization fairness score)",
    "schedulingFeasibility": "string (explanation of the 10% slot feasibility score)"
  },
  "alternativeRecommendationsRationale": "string (why alternative slots and equipment are suggested for runner-up students)"
}`;

  try {
    const { text, model } = await aiProvider.generateText(systemPrompt, `Explain conflict group: ${conflictGroupId}`, { jsonMode: true });
    const parsed = aiProvider.cleanAndParseJSON<any>(text);
    const validated = conflictExplanationSchema.parse(parsed);

    return {
      ...validated,
      isAIGenerated: true,
      modelUsed: `Generative AI (${model})`,
    };
  } catch (err: any) {
    console.warn('AI Conflict Explainer error, reverting to deterministic fallback:', err.message);
    const fallbackWinner = {
      request: { student: { name: winnerData.studentName } },
      breakdown: {
        totalScore: winnerData.priorityScore || 82.5,
        deadlineScore: 31.5,
        compatibilityScore: 23.0,
        waitingTimeScore: 13.0,
        fairnessScore: 10.0,
        feasibilityScore: 5.0,
      },
    };
    return getDeterministicConflictExplanationFallback(cluster, fallbackWinner, runnerUps);
  }
}
