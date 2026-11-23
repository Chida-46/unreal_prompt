import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import { aiProvider } from './aiProvider.js';
import { FacultySummaryResult } from './types.js';
import { getDeterministicFacultySummaryFallback } from './fallbacks.js';

const facultySummarySchema = z.object({
  projectSummary: z.string().min(5),
  requestedEquipment: z.array(
    z.object({
      name: z.string(),
      specs: z.string(),
      requestedSlot: z.string(),
    })
  ).min(1),
  purposeOfEquipment: z.string().min(5),
  technicalCompatibility: z.object({
    isCompatible: z.boolean(),
    explanation: z.string(),
  }),
  availabilityAndConstraints: z.string(),
  potentialConcerns: z.array(z.string()).default([]),
  aiRecommendation: z.object({
    verdict: z.enum([
      'APPEARS_TECHNICALLY_SUITABLE',
      'ADDITIONAL_INFO_REQUIRED',
      'POTENTIAL_MISMATCH',
      'ALTERNATIVE_SUGGESTED',
    ]),
    rationale: z.string(),
  }),
});

export async function summarizeRequestForFaculty(requestId: string): Promise<FacultySummaryResult> {
  // 1. Retrieve the student's booking request
  const req = prisma.bookingRequest.findUnique({ id: requestId });
  if (!req) {
    throw new Error('Booking request not found');
  }

  const equipment = prisma.equipment.findUnique({ id: req.equipmentId });
  if (!equipment) {
    throw new Error('Equipment associated with this request not found');
  }

  const student = prisma.user.findUnique({ id: req.studentId });
  const project = prisma.project.findUnique({ id: req.projectId });

  const deadlineDays = Math.max(
    0,
    Math.round((new Date(req.projectDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  // If AI is not available, return deterministic fallback
  if (!aiProvider.isAvailable()) {
    return getDeterministicFacultySummaryFallback(req, equipment);
  }

  const requestContext = {
    studentName: student?.name || 'Student',
    projectTitle: project?.title || req.project?.title || 'Academic Research Project',
    projectDescription: project?.description || 'Capstone hardware research project',
    projectDeadlineDaysRemaining: deadlineDays,
    equipmentName: equipment.name,
    equipmentCode: equipment.equipmentCode,
    equipmentSpecs: equipment.specifications,
    department: equipment.department?.name,
    laboratory: equipment.laboratory?.name,
    operatingHours: equipment.laboratory?.operatingHours,
    maxDurationHours: equipment.maxDurationHours,
    requestedSlot: `${new Date(req.requestedDate).toISOString().split('T')[0]} (${req.startTime} - ${req.endTime})`,
    requestedDurationMinutes: req.durationMinutes,
    studentAccessReason: req.accessReason,
    studentTechnicalRequirements: req.technicalRequirements || 'None specified',
    priorityScore: req.priorityScore || 'Pending calculation',
  };

  const systemPrompt = `You are LabLink's AI Faculty Request Briefing Specialist.
Your task is to analyze a student's laboratory equipment booking request and provide a clear, structured summary to assist faculty reviewers.

CRITICAL INSTRUCTIONS:
1. Provide an objective, neutral technical assessment of whether the student's project scope matches the hardware specifications.
2. Flag genuine concerns (e.g., tight project deadlines, missing voltage/protocol specs, duration exceeding limits).
3. AI ASSISTS FACULTY BUT NEVER MAKES APPROVAL OR REJECTION DECISIONS. Faculty retains sole authority.
4. Output MUST be ONLY a single valid JSON object with NO preamble or markdown formatting outside the JSON.

REQUEST DETAILS:
${JSON.stringify(requestContext, null, 2)}

OUTPUT SCHEMA:
{
  "projectSummary": "string (concise overview of project goals and scope)",
  "requestedEquipment": [
    {
      "name": "string",
      "specs": "string",
      "requestedSlot": "string"
    }
  ],
  "purposeOfEquipment": "string (why the student needs this hardware based on their justification)",
  "technicalCompatibility": {
    "isCompatible": boolean,
    "explanation": "string (technical match between hardware specs and project requirements)"
  },
  "availabilityAndConstraints": "string (slot compatibility with operating hours and max duration rules)",
  "potentialConcerns": ["string (any safety, power, timing, or missing specification flags)"],
  "aiRecommendation": {
    "verdict": "APPEARS_TECHNICALLY_SUITABLE | ADDITIONAL_INFO_REQUIRED | POTENTIAL_MISMATCH | ALTERNATIVE_SUGGESTED",
    "rationale": "string (objective rationale for the recommendation)"
  }
}`;

  try {
    const { text, model } = await aiProvider.generateText(systemPrompt, `Summarize request: ${requestId}`, { jsonMode: true });
    const parsed = aiProvider.cleanAndParseJSON<any>(text);
    const validated = facultySummarySchema.parse(parsed);

    return {
      ...validated,
      isAIGenerated: true,
      modelUsed: `Generative AI (${model})`,
    };
  } catch (err: any) {
    console.warn('AI Faculty Summarizer error, reverting to deterministic fallback:', err.message);
    return getDeterministicFacultySummaryFallback(req, equipment);
  }
}
