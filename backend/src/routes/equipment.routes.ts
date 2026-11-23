import { Router } from 'express';
import { getEquipmentList, getEquipmentById } from '../services/equipmentService.js';
import { prisma } from '../services/prisma.js';
import { createEquipmentSchema } from '../validators/index.js';

const router = Router();

// GET /api/equipment - Discovery list with filters, search, sort
router.get('/', async (req, res, next) => {
  try {
    const { search, departmentId, categoryId, laboratoryId, status, sortBy, sortOrder } = req.query;
    const list = await getEquipmentList({
      search: search as string,
      departmentId: departmentId as string,
      categoryId: categoryId as string,
      laboratoryId: laboratoryId as string,
      status: status as string,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// GET /api/equipment/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = prisma.equipmentCategory.findMany();
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// GET /api/equipment/:id - Details with specs and availability
router.get('/:id', async (req, res, next) => {
  try {
    const item = await getEquipmentById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/equipment - Admin add equipment
router.post('/', async (req, res, next) => {
  try {
    const validated = createEquipmentSchema.parse(req.body);
    const created = prisma.equipment.create(validated);
    prisma.auditLog.create({
      action: 'EQUIPMENT_CREATED',
      entityType: 'Equipment',
      entityId: created?.id,
      actorName: req.headers['x-actor-name'] as string || 'Admin',
      actorRole: 'ADMIN',
      details: `Created new equipment: ${validated.name} (${validated.equipmentCode})`,
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /api/equipment/:id - Admin update equipment
router.put('/:id', async (req, res, next) => {
  try {
    const updated = prisma.equipment.update({ id: req.params.id }, req.body);
    prisma.auditLog.create({
      action: 'EQUIPMENT_UPDATED',
      entityType: 'Equipment',
      entityId: req.params.id,
      actorName: req.headers['x-actor-name'] as string || 'Admin',
      actorRole: 'ADMIN',
      details: `Updated equipment: ${updated?.name}`,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/equipment/:id - Admin remove equipment
router.delete('/:id', async (req, res, next) => {
  try {
    prisma.equipment.delete({ id: req.params.id });
    prisma.auditLog.create({
      action: 'EQUIPMENT_DELETED',
      entityType: 'Equipment',
      entityId: req.params.id,
      actorName: req.headers['x-actor-name'] as string || 'Admin',
      actorRole: 'ADMIN',
      details: `Deleted equipment with ID: ${req.params.id}`,
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
