import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import { aiProvider } from './aiProvider.js';
import { EquipmentRecommendationResult } from './types.js';
import { getDeterministicEquipmentRecommendationFallback } from './fallbacks.js';

const recommendationResponseSchema = z.object({
  answer: z.string().min(5),
  recommendedEquipmentIds: z.array(
    z.object({
      equipmentId: z.string(),
      relevanceReason: z.string(),
      matchScore: z.number().default(90),
    })
  ).default([]),
  suggestedAlternativeIds: z.array(
    z.object({
      equipmentId: z.string(),
      reason: z.string(),
    })
  ).default([]),
});

export async function recommendEquipment(userQuery: string): Promise<EquipmentRecommendationResult> {
  const sanitized = (userQuery || '').trim();
  if (sanitized.length < 3) {
    throw new Error('Query must be at least 3 characters long.');
  }

  // 1. Authoritative retrieval: Fetch all verified equipment from the database
  const allInventory = prisma.equipment.findMany();
  if (allInventory.length === 0) {
    throw new Error('No equipment inventory is registered in the database.');
  }

  // If AI is not available, return deterministic fallback
  if (!aiProvider.isAvailable()) {
    return getDeterministicEquipmentRecommendationFallback(sanitized, allInventory);
  }

  // Prepare focused, token-efficient inventory catalog representation for LLM context
  const catalogContext = allInventory.map(eq => ({
    id: eq.id,
    code: eq.equipmentCode,
    name: eq.name,
    category: eq.category?.name || 'General',
    department: eq.department?.name || 'Engineering',
    laboratory: eq.laboratory?.name || 'General Lab',
    specifications: eq.specifications,
    status: eq.status,
    requiresApproval: eq.requiresApproval,
    maxDurationHours: eq.maxDurationHours,
  }));

  const systemPrompt = `You are LabLink's AI Equipment Discovery & Laboratory Assistant.
Your task is to recommend suitable equipment to students based strictly on the AUTHORITATIVE CAMPUS INVENTORY provided below.

CRITICAL CONSTRAINTS:
1. NEVER invent or fabricate equipment, model numbers, specifications, departments, or laboratories that are not in the inventory list.
2. Only select equipment by its exact "id" from the catalog.
3. If no equipment matches the student's request, explain clearly in "answer" that no matching item is currently listed in campus labs and suggest alternatives only from the verified inventory list.
4. Output MUST be ONLY a single valid JSON object with NO markdown formatting outside the JSON.

VERIFIED LABLINK INVENTORY:
${JSON.stringify(catalogContext, null, 2)}

OUTPUT SCHEMA:
{
  "answer": "string (conversational explanation of recommendations, availability status, and lab locations)",
  "recommendedEquipmentIds": [
    {
      "equipmentId": "string (MUST match an 'id' from inventory)",
      "relevanceReason": "string (why this specific equipment meets the user's project requirements)",
      "matchScore": number (0-100)
    }
  ],
  "suggestedAlternativeIds": [
    {
      "equipmentId": "string (MUST match an 'id' from inventory)",
      "reason": "string (why this is a viable alternative if primary is in use or maintenance)"
    }
  ]
}`;

  try {
    const { text, model } = await aiProvider.generateText(systemPrompt, sanitized, { jsonMode: true });
    const parsed = aiProvider.cleanAndParseJSON<any>(text);
    const validated = recommendationResponseSchema.parse(parsed);

    // Validate that recommended equipment IDs actually exist in the database!
    const validRecommendations = validated.recommendedEquipmentIds
      .map(rec => {
        const item = allInventory.find(eq => eq.id === rec.equipmentId);
        if (!item) return null;
        return {
          equipmentId: item.id,
          name: item.name,
          equipmentCode: item.equipmentCode,
          departmentName: item.department?.name || 'Engineering',
          labName: item.laboratory?.name || 'Central Lab',
          status: item.status,
          relevanceReason: rec.relevanceReason,
          matchScore: Math.min(100, Math.max(0, rec.matchScore)),
        };
      })
      .filter((rec): rec is NonNullable<typeof rec> => rec !== null);

    const validAlternatives = validated.suggestedAlternativeIds
      .map(alt => {
        const item = allInventory.find(eq => eq.id === alt.equipmentId);
        if (!item) return null;
        return {
          equipmentId: item.id,
          name: item.name,
          reason: alt.reason,
        };
      })
      .filter((alt): alt is NonNullable<typeof alt> => alt !== null);

    return {
      answer: validated.answer,
      recommendedEquipment: validRecommendations,
      suggestedAlternatives: validAlternatives,
      isAIGenerated: true,
      modelUsed: `Generative AI (${model})`,
    };
  } catch (err: any) {
    console.warn('AI Equipment Recommender error, reverting to deterministic fallback:', err.message);
    return getDeterministicEquipmentRecommendationFallback(sanitized, allInventory);
  }
}
