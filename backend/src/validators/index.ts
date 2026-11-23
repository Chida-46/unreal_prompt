import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Project title must be at least 3 characters'),
  description: z.string().min(10, 'Project description must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  departmentId: z.string().min(1, 'Department is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  deadline: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid project deadline date',
  }),
  techStack: z.string().optional(),
});

export const createBookingRequestSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  equipmentId: z.string().min(1, 'Equipment is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  requestedDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid requested date',
  }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid start time format (HH:mm)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid end time format (HH:mm)'),
  durationMinutes: z.number().min(30).max(480),
  projectDeadline: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid project deadline',
  }),
  technicalRequirements: z.string().optional(),
  accessReason: z.string().min(5, 'Access reason must be at least 5 characters'),
});

export const facultyDecisionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'SUGGEST_ALTERNATIVE']),
  facultyNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  suggestedAlternative: z.object({
    equipmentId: z.string().optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }).optional(),
});

export const updateWeightsSchema = z.object({
  deadlineWeight: z.number().min(0).max(1),
  compatibilityWeight: z.number().min(0).max(1),
  waitingTimeWeight: z.number().min(0).max(1),
  fairnessWeight: z.number().min(0).max(1),
  feasibilityWeight: z.number().min(0).max(1),
}).refine(data => {
  const sum = data.deadlineWeight + data.compatibilityWeight + data.waitingTimeWeight + data.fairnessWeight + data.feasibilityWeight;
  return Math.abs(sum - 1.0) < 0.01;
}, {
  message: 'Weights must sum to 1.0 (100%)',
});

export const createEquipmentSchema = z.object({
  equipmentCode: z.string().min(2),
  name: z.string().min(3),
  categoryId: z.string().min(1),
  departmentId: z.string().min(1),
  laboratoryId: z.string().min(1),
  description: z.string().min(10),
  specifications: z.string().min(5),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RESERVED']).default('AVAILABLE'),
  maxDurationHours: z.number().min(1).max(12).default(4),
  requiresApproval: z.boolean().default(true),
  modelNumber: z.string().optional(),
});

export const createMaintenanceSchema = z.object({
  equipmentId: z.string().min(1),
  title: z.string().min(3),
  reason: z.string().min(5),
  startDate: z.string().refine(val => !isNaN(Date.parse(val))),
  endDate: z.string().refine(val => !isNaN(Date.parse(val))),
});
