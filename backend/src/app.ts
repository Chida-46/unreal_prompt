import express from 'express';
import cors from 'cors';
import { securityHeaders } from './middleware/security.js';
import { apiRateLimiter, aiRateLimiter, bookingRateLimiter } from './middleware/rateLimiter.js';
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

// Apply enterprise security headers
app.use(securityHeaders);

// CORS configuration supporting local dev and configured client origin
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.trim());
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g., automated tests, curl, postman) or matching origins
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in demo mode, but sends specific origin header
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-name', 'x-user-role', 'x-actor-name'],
}));

// Body parsing with safe size limit (defense against payload bombs)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// General API Rate Limiting
app.use('/api', apiRateLimiter);

// Specific rate limiters for expensive operations
app.use('/api/ai', aiRateLimiter);
app.use('/api/bookings/request', bookingRateLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LabLink API & Scheduling Engine',
    version: '1.0.0',
    auth: 'NONE (Academic Demonstration Mode)',
    security: {
      rateLimiting: 'ACTIVE',
      securityHeaders: 'ACTIVE',
      transactions: 'SQLITE_IMMEDIATE',
    },
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
