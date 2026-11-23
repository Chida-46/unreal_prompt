import { Router } from 'express';
import { prisma } from '../services/prisma.js';

const router = Router();

// GET /api/users - List fictional demo users categorized by role
router.get('/', async (req, res, next) => {
  try {
    const { role } = req.query;
    const users = prisma.user.findMany({
      where: { role: role as string },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = prisma.user.findUnique({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
