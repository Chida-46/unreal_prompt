import { z } from 'zod';
import { aiProvider } from './aiProvider.js';
import { ProjectAnalysisResult } from './types.js';
import { getDeterministicProjectAnalysisFallback } from './fallbacks.js';

const projectAnalysisSchema = z.object({
  projectOverview: z.object({
    title: z.string().min(2),
    category: z.string().min(2),
    summary: z.string().min(5),
  }),
  requiredEquipment: z.array(
    z.object({
      name: z.string().min(2),
      reason: z.string().min(2),
      estimatedQuantity: z.number().default(1),
      categoryHint: z.string().optional(),
    })
  ).min(1),
  technicalRequirements: z.object({
    microcontrollerCompatibility: z.string(),
    sensorInterfaces: z.string(),
    wirelessConnectivity: z.string(),
    powerSpecs: z.string(),
  }),
  estimatedUsage: z.object({
    suggestedDuration: z.string(),
    recommendedSlotMinutes: z.number().default(120),
    requiresSpecializedLab: z.boolean(),
    labType: z.string().optional(),
  }),
  additionalRecommendations: z.object({
    alternativeEquipment: z.array(z.string()).default([]),
    missingComponents: z.array(z.string()).default([]),
    safetyConsiderations: z.array(z.string()).default([]),
  }),
});

export async function analyzeProjectRequirements(description: string): Promise<ProjectAnalysisResult> {
  const sanitized = (description || '').trim();
  if (sanitized.length < 10) {
    throw new Error('Project description must be at least 10 characters long.');
  }

  // If AI is not available, gracefully return deterministic fallback
  if (!aiProvider.isAvailable()) {
    return getDeterministicProjectAnalysisFallback(sanitized);
  }

  const systemPrompt = `You are LabLink's AI Academic Laboratory Engineer and Hardware Architecture Specialist.
Your task is to analyze a student's project description and extract structured technical specifications and laboratory equipment requirements.

RULES:
1. Extract realistic hardware requirements (boards, microcontrollers, sensors, instruments, workstations).
2. Specify exact technical interface protocols (e.g., I2C, SPI, GPIO, UART, Wi-Fi, BLE, PMOD).
3. Estimate lab usage and whether a specialized laboratory facility is necessary.
4. Output MUST be ONLY a single valid JSON object with NO preamble, explanation, or markdown formatting outside the JSON.

SCHEMA:
{
  "projectOverview": {
    "title": "string",
    "category": "string (e.g., Internet of Things, Robotics, Artificial Intelligence, Embedded Systems, Signal Processing)",
    "summary": "string"
  },
  "requiredEquipment": [
    {
      "name": "string (e.g., ESP32 Development Board, Jetson Nano, Logic Analyzer)",
      "reason": "string",
      "estimatedQuantity": number,
      "categoryHint": "string"
    }
  ],
  "technicalRequirements": {
    "microcontrollerCompatibility": "string",
    "sensorInterfaces": "string",
    "wirelessConnectivity": "string",
    "powerSpecs": "string"
  },
  "estimatedUsage": {
    "suggestedDuration": "string",
    "recommendedSlotMinutes": number,
    "requiresSpecializedLab": boolean,
    "labType": "string"
  },
  "additionalRecommendations": {
    "alternativeEquipment": ["string"],
    "missingComponents": ["string"],
    "safetyConsiderations": ["string"]
  }
}`;

  try {
    const { text, model } = await aiProvider.generateText(systemPrompt, sanitized, { jsonMode: true });
    const parsed = aiProvider.cleanAndParseJSON<any>(text);
    const validated = projectAnalysisSchema.parse(parsed);

    return {
      ...validated,
      isAIGenerated: true,
      modelUsed: `Generative AI (${model})`,
    };
  } catch (err: any) {
    console.warn('AI Project Analyzer error, reverting to deterministic fallback:', err.message);
    return getDeterministicProjectAnalysisFallback(sanitized);
  }
}
