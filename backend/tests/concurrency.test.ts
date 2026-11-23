import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { db, initDatabase } from '../src/db/database.js';
import { seed } from '../src/db/seed.js';

describe('LabLink Concurrency, Security, & Integrity Tests', () => {
  beforeEach(() => {
    initDatabase();
    seed();
  });

  it('should emit enterprise security headers on all API responses', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('should include rate limit telemetry headers', async () => {
    const res = await request(app).get('/api/equipment');
    expect(res.status).toBe(200);
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
  });

  it('should reject invalid booking request with startTime >= endTime (chronological integrity)', async () => {
    const res = await request(app)
      .post('/api/bookings/request')
      .send({
        projectId: 'proj-drone-nav',
        equipmentId: 'eq-fpga-01',
        studentId: 'student-1',
        requestedDate: '2026-11-25T00:00:00.000Z',
        startTime: '14:00',
        endTime: '10:00', // invalid: end before start
        durationMinutes: 180,
        projectDeadline: '2026-11-28T00:00:00.000Z',
        accessReason: 'Testing inverted time slot validation',
      });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toMatch(/end time must be strictly after start time/i);
  });

  it('should handle concurrent booking attempts atomically without creating duplicate active slots', async () => {
    const targetDate = '2026-11-26T00:00:00.000Z';
    const payloadAarav = {
      projectId: 'proj-drone-nav',
      equipmentId: 'eq-fpga-01',
      studentId: 'student-1',
      requestedDate: targetDate,
      startTime: '10:00',
      endTime: '12:00',
      durationMinutes: 120,
      projectDeadline: '2026-11-29T00:00:00.000Z',
      accessReason: 'Aarav project slot reservation',
    };

    const payloadPriya = {
      projectId: 'proj-edge-traffic',
      equipmentId: 'eq-fpga-01',
      studentId: 'student-3',
      requestedDate: targetDate,
      startTime: '10:00',
      endTime: '12:00',
      durationMinutes: 120,
      projectDeadline: '2026-12-05T00:00:00.000Z',
      accessReason: 'Priya competing slot reservation',
    };

    // Execute concurrent requests
    const [res1, res2] = await Promise.all([
      request(app).post('/api/bookings/request').send(payloadAarav),
      request(app).post('/api/bookings/request').send(payloadPriya),
    ]);

    expect([201, 400]).toContain(res1.status);
    expect([201, 400]).toContain(res2.status);

    // Verify database state: one or both were safely categorized or clustered
    const checkRequests = db.prepare(
      "SELECT * FROM booking_requests WHERE equipment_id = 'eq-fpga-01' AND requested_date LIKE '2026-11-26%'"
    ).all() as any[];

    expect(checkRequests.length).toBeGreaterThanOrEqual(1);
    // Overlapping requests are detected and assigned conflict state
    if (checkRequests.length > 1) {
      expect(checkRequests.some(r => r.status === 'CONFLICT_DETECTED')).toBe(true);
    }
  });

  it('should enforce atomic faculty approval without double-booking active reservations', async () => {
    // Submit request for eq-jetson-01
    const reqRes = await request(app)
      .post('/api/bookings/request')
      .send({
        projectId: 'proj-drone-nav',
        equipmentId: 'eq-jetson-01',
        studentId: 'student-1',
        requestedDate: '2026-11-27T00:00:00.000Z',
        startTime: '13:00',
        endTime: '16:00',
        durationMinutes: 180,
        projectDeadline: '2026-11-30T00:00:00.000Z',
        accessReason: 'Edge AI inference session',
      });

    expect(reqRes.status).toBe(201);
    const requestId = reqRes.body.id;

    // Faculty approves
    const approveRes = await request(app)
      .post(`/api/faculty/requests/${requestId}/decision`)
      .send({
        action: 'APPROVE',
        facultyNotes: 'Verified project compatibility and safety guidelines',
      });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.status).toBe('APPROVED');
    expect(approveRes.body.bookingId).toBeDefined();

    // Secondary attempt to approve another overlapping request must be rejected
    const secondReq = await request(app)
      .post('/api/bookings/request')
      .send({
        projectId: 'proj-edge-traffic',
        equipmentId: 'eq-jetson-01',
        studentId: 'student-3',
        requestedDate: '2026-11-27T00:00:00.000Z',
        startTime: '14:00',
        endTime: '17:00',
        durationMinutes: 180,
        projectDeadline: '2026-12-05T00:00:00.000Z',
        accessReason: 'Overlapping request',
      });

    // Already approved booking blocks submission or faculty approval
    if (secondReq.status === 201) {
      const secondApprove = await request(app)
        .post(`/api/faculty/requests/${secondReq.body.id}/decision`)
        .send({ action: 'APPROVE' });
      expect(secondApprove.status).toBe(500); // Throws already reserved error
    } else {
      expect(secondReq.status).toBe(500);
    }
  });
});
