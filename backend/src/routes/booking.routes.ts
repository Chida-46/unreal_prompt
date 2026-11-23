import { Router } from 'express';
import { createBookingRequest, cancelBookingRequest } from '../services/bookingService.js';
import { prisma } from '../services/prisma.js';
import { createBookingRequestSchema } from '../validators/index.js';

const router = Router();

// POST /api/bookings/request - Submit booking request
router.post('/request', async (req, res, next) => {
  try {
    const validated = createBookingRequestSchema.parse(req.body);
    const result = await createBookingRequest(validated);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/requests - List requests (with optional studentId or status filters)
router.get('/requests', async (req, res, next) => {
  try {
    const { studentId, status, equipmentId } = req.query;
    const requests = prisma.bookingRequest.findMany({
      where: {
        studentId: studentId as string,
        status: status as string,
        equipmentId: equipmentId as string,
      },
    });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/calendar - Active approved bookings for calendar display
router.get('/calendar', async (req, res, next) => {
  try {
    const { equipmentId, month } = req.query;
    const bookings = prisma.booking.findMany({
      where: {
        equipmentId: equipmentId as string,
        status: 'ACTIVE',
      },
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings/requests/:id/cancel
router.post('/requests/:id/cancel', async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required to cancel request' });
    }
    const cancelled = await cancelBookingRequest(req.params.id, studentId);
    res.json(cancelled);
  } catch (err) {
    next(err);
  }
});

export default router;
