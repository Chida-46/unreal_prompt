import { Router } from 'express';
import { getProjects, getProjectById, createProject } from '../services/projectService.js';
import { createProjectSchema } from '../validators/index.js';

const router = Router();

// GET /api/projects
router.get('/', async (req, res, next) => {
  try {
    const { studentId, departmentId } = req.query;
    const projects = await getProjects({
      studentId: studentId as string,
      departmentId: departmentId as string,
    });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res, next) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects
router.post('/', async (req, res, next) => {
  try {
    const validated = createProjectSchema.parse(req.body);
    const created = await createProject(validated);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;
