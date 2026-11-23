import { Router } from 'express';
import {
  getRecommendations,
  getRecommendationByConflictGroup,
  evaluateSingleRequestScore,
} from '../services/schedulingService.js';
import { prisma } from '../services/prisma.js';
import { updateWeightsSchema } from '../validators/index.js';

const router = Router();

// GET /api/scheduling/recommendations
router.get('/recommendations', async (req, res, next) => {
  try {
    const list = await getRecommendations();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// GET /api/scheduling/recommendations/:conflictGroupId
router.get('/recommendations/:conflictGroupId', async (req, res, next) => {
  try {
    const rec = await getRecommendationByConflictGroup(req.params.conflictGroupId);
    if (!rec) {
      return res.status(404).json({ error: 'Recommendation not found for this conflict group' });
    }
    res.json(rec);
  } catch (err) {
    next(err);
  }
});

// GET /api/scheduling/evaluate/:requestId
router.get('/evaluate/:requestId', async (req, res, next) => {
  try {
    const score = await evaluateSingleRequestScore(req.params.requestId);
    if (!score) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(score);
  } catch (err) {
    next(err);
  }
});

// GET /api/scheduling/weights
router.get('/weights', async (req, res, next) => {
  try {
    const weights = prisma.schedulingWeightConfig.get();
    res.json(weights);
  } catch (err) {
    next(err);
  }
});

// PUT /api/scheduling/weights
router.put('/weights', async (req, res, next) => {
  try {
    const validated = updateWeightsSchema.parse(req.body);
    const updated = prisma.schedulingWeightConfig.update(validated);
    prisma.auditLog.create({
      action: 'SCHEDULING_WEIGHTS_UPDATED',
      entityType: 'SchedulingWeightConfig',
      entityId: 'default-config',
      actorName: req.headers['x-actor-name'] as string || 'Admin',
      actorRole: 'ADMIN',
      details: `Updated algorithm weights: Deadline=${validated.deadlineWeight}, Compatibility=${validated.compatibilityWeight}, Wait=${validated.waitingTimeWeight}, Fairness=${validated.fairnessWeight}, Feasibility=${validated.feasibilityWeight}`,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
