import { Router } from 'express';
import { getPendingRequestsForFaculty, processFacultyDecision } from '../services/facultyService.js';
import { facultyDecisionSchema } from '../validators/index.js';

const router = Router();

// GET /api/faculty/requests
router.get('/requests', async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const requests = await getPendingRequestsForFaculty(departmentId as string);
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// POST /api/faculty/requests/:id/decision
router.post('/requests/:id/decision', async (req, res, next) => {
  try {
    const validated = facultyDecisionSchema.parse(req.body);
    const facultyUser = {
      id: (req.headers['x-user-id'] as string) || 'faculty-1',
      name: (req.headers['x-user-name'] as string) || 'Dr. Vikram Sen',
    };

    const result = await processFacultyDecision(req.params.id, facultyUser, validated);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
