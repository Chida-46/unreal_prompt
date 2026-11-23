import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { seed } from '../src/db/seed.js';

beforeAll(() => {
  seed();
});

describe('LabLink Backend REST APIs', () => {
  it('GET /api/health should respond with open-access status and service info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toContain('LabLink');
  });

  it('GET /api/equipment should list all equipment with department and category', async () => {
    const res = await request(app).get('/api/equipment');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(12);
    expect(res.body[0]).toHaveProperty('equipmentCode');
    expect(res.body[0]).toHaveProperty('department');
  });

  it('GET /api/equipment?search=FPGA should filter equipment correctly', async () => {
    const res = await request(app).get('/api/equipment?search=FPGA');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].name).toContain('FPGA');
  });

  it('GET /api/equipment/:id should return complete equipment details', async () => {
    const res = await request(app).get('/api/equipment/eq-fpga-01');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('eq-fpga-01');
    expect(res.body.name).toBe('FPGA Development Kit');
    expect(res.body.department.name).toBe('Electronics and Communication Engineering');
  });

  it('GET /api/admin/analytics should return dynamic stats from database', async () => {
    const res = await request(app).get('/api/admin/analytics');
    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.totalEquipment).toBeGreaterThanOrEqual(12);
    expect(Array.isArray(res.body.departmentUtilization)).toBe(true);
    expect(Array.isArray(res.body.mostRequestedEquipment)).toBe(true);
  });

  it('POST /api/bookings/request should create a booking request without authentication', async () => {
    const newReq = {
      projectId: 'proj-drone-nav',
      equipmentId: 'eq-jetson-01',
      studentId: 'student-1',
      requestedDate: '2026-11-28',
      startTime: '10:00',
      endTime: '12:00',
      durationMinutes: 120,
      projectDeadline: '2026-12-05',
      technicalRequirements: 'CUDA neural runtime acceleration',
      accessReason: 'Validation of optical odometry filter',
    };

    const res = await request(app).post('/api/bookings/request').send(newReq);
    expect(res.status).toBe(201);
    expect(res.body.equipmentId).toBe('eq-jetson-01');
    expect(res.body.status).toBe('PENDING');
  });

  it('POST /api/faculty/requests/:id/decision should approve a request and generate a booking', async () => {
    // 1. Submit request
    const reqRes = await request(app).post('/api/bookings/request').send({
      projectId: 'proj-drone-nav',
      equipmentId: 'eq-rpi5-01',
      studentId: 'student-1',
      requestedDate: '2026-11-29',
      startTime: '13:00',
      endTime: '15:00',
      durationMinutes: 120,
      projectDeadline: '2026-12-05',
      accessReason: 'Hardware communication check',
    });
    const requestId = reqRes.body.id;

    // 2. Faculty approves
    const decisionRes = await request(app)
      .post(`/api/faculty/requests/${requestId}/decision`)
      .set('x-user-id', 'faculty-1')
      .set('x-user-name', 'Dr. Vikram Sen')
      .send({
        action: 'APPROVE',
        facultyNotes: 'Verified project alignment with lab capacity.',
      });

    expect(decisionRes.status).toBe(200);
    expect(decisionRes.body.status).toBe('APPROVED');
    expect(decisionRes.body.bookingId).toBeDefined();
  });
});
