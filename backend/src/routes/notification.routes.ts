import { Router } from 'express';
import { prisma } from '../services/prisma.js';

const router = Router();

// GET /api/notifications
router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query;
    const list = prisma.notification.findMany({
      where: { userId: userId as string },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/:id/read
router.post('/:id/read', async (req, res, next) => {
  try {
    const result = prisma.notification.markAsRead(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/read-all
router.post('/read-all', async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const result = prisma.notification.markAllAsRead(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
