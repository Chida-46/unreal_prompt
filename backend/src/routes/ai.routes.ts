import { Router } from 'express';
import { z } from 'zod';
import { aiProvider } from '../ai/aiProvider.js';
import { analyzeProjectRequirements } from '../ai/projectAnalyzer.js';
import { recommendEquipment } from '../ai/equipmentRecommender.js';
import { explainSchedulingConflict } from '../ai/conflictExplainer.js';
import { summarizeRequestForFaculty } from '../ai/facultySummarizer.js';

const router = Router();

// Validation schemas
const analyzeProjectSchema = z.object({
  description: z.string().min(10, 'Project description must be at least 10 characters long.'),
});

const recommendEquipmentSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters long.'),
});

const explainConflictSchema = z.object({
  conflictGroupId: z.string().min(1, 'Conflict Group ID is required.'),
});

const summarizeRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required.'),
});

// GET /api/ai/status - Check AI provider availability & configured model
router.get('/status', (req, res) => {
  res.json(aiProvider.getStatus());
});

// POST /api/ai/analyze-project - Feature 1: AI Project Requirement Analyzer
router.post('/analyze-project', async (req, res, next) => {
  try {
    const { description } = analyzeProjectSchema.parse(req.body);
    const result = await analyzeProjectRequirements(description);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/recommend-equipment - Feature 2: AI Equipment Recommendation Assistant
router.post('/recommend-equipment', async (req, res, next) => {
  try {
    const { query } = recommendEquipmentSchema.parse(req.body);
    const result = await recommendEquipment(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/explain-conflict - Feature 3: AI Conflict Resolution Assistant
router.post('/explain-conflict', async (req, res, next) => {
  try {
    const { conflictGroupId } = explainConflictSchema.parse(req.body);
    const result = await explainSchedulingConflict(conflictGroupId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/summarize-request - Feature 4: AI Faculty Request Summarizer
router.post('/summarize-request', async (req, res, next) => {
  try {
    const { requestId } = summarizeRequestSchema.parse(req.body);
    const result = await summarizeRequestForFaculty(requestId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
