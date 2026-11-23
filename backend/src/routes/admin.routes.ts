import { Router } from 'express';
import { getSystemAnalytics } from '../services/analyticsService.js';
import { prisma } from '../services/prisma.js';
import { createMaintenanceSchema } from '../validators/index.js';

const router = Router();

// GET /api/admin/analytics
router.get('/analytics', async (req, res, next) => {
  try {
    const data = await getSystemAnalytics();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = prisma.auditLog.findMany(100);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/departments
router.get('/departments', async (req, res, next) => {
  try {
    const list = prisma.department.findMany();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/departments
router.post('/departments', async (req, res, next) => {
  try {
    const { code, name, description, icon } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and Name are required' });
    }
    const created = prisma.department.create({ code, name, description, icon });
    prisma.auditLog.create({
      action: 'DEPARTMENT_CREATED',
      entityType: 'Department',
      entityId: created?.id,
      actorName: req.headers['x-actor-name'] as string || 'Admin',
      actorRole: 'ADMIN',
      details: `Registered department: ${name} (${code})`,
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/laboratories
router.get('/laboratories', async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const list = prisma.laboratory.findMany({ where: { departmentId: departmentId as string } });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/laboratories
router.post('/laboratories', async (req, res, next) => {
  try {
    const { name, roomNumber, departmentId, operatingHours } = req.body;
    if (!name || !roomNumber || !departmentId) {
      return res.status(400).json({ error: 'Name, roomNumber, and departmentId are required' });
    }
    const created = prisma.laboratory.create({ name, roomNumber, departmentId, operatingHours });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/maintenance
router.get('/maintenance', async (req, res, next) => {
  try {
    const { equipmentId, status } = req.query;
    const list = prisma.maintenanceSchedule.findMany({
      where: { equipmentId: equipmentId as string, status: status as string },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/maintenance
router.post('/maintenance', async (req, res, next) => {
  try {
    const validated = createMaintenanceSchema.parse(req.body);
    const created = prisma.maintenanceSchedule.create(validated);
    prisma.auditLog.create({
      action: 'MAINTENANCE_SCHEDULED',
      entityType: 'MaintenanceSchedule',
      entityId: created?.id,
      actorName: req.headers['x-actor-name'] as string || 'Admin',
      actorRole: 'ADMIN',
      details: `Scheduled maintenance: "${validated.title}" on equipment ${validated.equipmentId}`,
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/maintenance/:id
router.put('/maintenance/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = prisma.maintenanceSchedule.update({ id: req.params.id }, { status });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
