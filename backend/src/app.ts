import express from 'express';
import cors from 'cors';
import equipmentRoutes from './routes/equipment.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import projectRoutes from './routes/project.routes.js';
import schedulingRoutes from './routes/scheduling.routes.js';
import facultyRoutes from './routes/faculty.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import userRoutes from './routes/user.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// Secure CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-name', 'x-user-role', 'x-actor-name'],
}));

// Body parsing with safe size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LabLink API & Scheduling Engine',
    version: '1.0.0',
    auth: 'NONE (Academic Demonstration Mode)',
  });
});

// Register all modular REST API routes
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
