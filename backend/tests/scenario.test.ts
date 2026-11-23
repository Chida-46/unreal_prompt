import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { seed } from '../src/db/seed.js';

beforeAll(() => {
  seed();
});

describe('Master Project Prompt: Complete 20-Step End-to-End Scenario', () => {
  let fpgaEquipmentId: string;
  let project1Id: string;
  let project2Id: string;
  let request1Id: string;
  let request2Id: string;
  let conflictGroupId: string;

  it('STEP 1 & 2: Open LabLink and get student profiles without authentication', async () => {
    const healthRes = await request(app).get('/api/health');
    expect(healthRes.status).toBe(200);
    expect(healthRes.body.auth).toContain('NONE');

    const studentsRes = await request(app).get('/api/users?role=STUDENT');
    expect(studentsRes.status).toBe(200);
    expect(studentsRes.body.length).toBeGreaterThanOrEqual(2);
  });

  it('STEP 3 & 4: Search for "FPGA Development Kit" and inspect its details, specifications, and availability', async () => {
    const searchRes = await request(app).get('/api/equipment?search=FPGA');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.length).toBeGreaterThanOrEqual(1);

    fpgaEquipmentId = searchRes.body[0].id;
    expect(searchRes.body[0].name).toContain('FPGA');

    const detailsRes = await request(app).get(`/api/equipment/${fpgaEquipmentId}`);
    expect(detailsRes.status).toBe(200);
    expect(detailsRes.body.specifications).toContain('Artix-7');
    expect(detailsRes.body.department.name).toContain('Electronics');
    expect(detailsRes.body.status).toBe('AVAILABLE');
  });

  it('STEP 5 & 6: Student 1 (Aarav) creates project and submits a booking request for FPGA Kit', async () => {
    // Aarav creates project "Real-Time Image Processing System" with an urgent deadline in 3 days
    const urgentDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const projRes = await request(app)
      .post('/api/projects')
      .set('x-user-id', 'student-1')
      .set('x-user-name', 'Aarav Sharma')
      .send({
        title: 'Real-Time Image Processing System',
        description: 'Implementing hardware accelerated Sobel filter on Artix-7 FPGA using Vivado toolchain.',
        category: 'FPGA Development',
        departmentId: 'dept-ece',
        studentId: 'student-1',
        deadline: urgentDeadline,
        techStack: 'Vivado, Verilog, Artix-7',
      });
    expect(projRes.status).toBe(201);
    project1Id = projRes.body.id;

    // Aarav requests slot for tomorrow 10:00 - 13:00 (3 hours)
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const reqRes = await request(app)
      .post('/api/bookings/request')
      .set('x-user-id', 'student-1')
      .set('x-user-name', 'Aarav Sharma')
      .send({
        projectId: project1Id,
        equipmentId: fpgaEquipmentId,
        studentId: 'student-1',
        requestedDate: tomorrowStr,
        startTime: '10:00',
        endTime: '13:00',
        durationMinutes: 180,
        projectDeadline: urgentDeadline,
        technicalRequirements: 'Vivado synthesis on Artix-7',
        accessReason: 'Final hardware milestone verification for project submission',
      });
    expect(reqRes.status).toBe(201);
    expect(reqRes.body.status).toBe('PENDING');
    request1Id = reqRes.body.id;
  });

  it('STEP 7 & 8: Student 2 (Priya) submits competing overlapping request -> Application detects conflict', async () => {
    // Priya has a project with deadline in 25 days (less urgent)
    const distantDeadline = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString();
    const proj2Res = await request(app)
      .post('/api/projects')
      .set('x-user-id', 'student-2')
      .set('x-user-name', 'Priya Patel')
      .send({
        title: 'Digital Signal Synthesis Trial',
        description: 'Preliminary synthesis exploration for arbitrary waveform generator.',
        category: 'FPGA Development',
        departmentId: 'dept-ece',
        studentId: 'student-2',
        deadline: distantDeadline,
        techStack: 'VHDL',
      });
    expect(proj2Res.status).toBe(201);
    project2Id = proj2Res.body.id;

    // Priya requests overlapping slot on same date: 11:00 - 14:00 (overlaps Aarav 10:00-13:00)
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const req2Res = await request(app)
      .post('/api/bookings/request')
      .set('x-user-id', 'student-2')
      .set('x-user-name', 'Priya Patel')
      .send({
        projectId: project2Id,
        equipmentId: fpgaEquipmentId,
        studentId: 'student-2',
        requestedDate: tomorrowStr,
        startTime: '11:00',
        endTime: '14:00',
        durationMinutes: 180,
        projectDeadline: distantDeadline,
        technicalRequirements: 'FPGA synthesizer',
        accessReason: 'Exploratory waveform testing',
      });

    expect(req2Res.status).toBe(201);
    expect(['CONFLICT_DETECTED', 'ALTERNATIVE_SUGGESTED']).toContain(req2Res.body.status);
    expect(req2Res.body.conflictGroupId).toBeDefined();

    request2Id = req2Res.body.id;
    conflictGroupId = req2Res.body.conflictGroupId;
  });

  it('STEP 9, 10, 11, & 12: AI Scheduling Engine analyzes competing requests, computes weighted scores, recommends fair winner, and finds alternatives for loser', async () => {
    const recRes = await request(app).get(`/api/scheduling/recommendations/${conflictGroupId}`);
    expect(recRes.status).toBe(200);

    const rec = recRes.body;
    // Winning request must be Aarav due to urgent deadline (3 days vs 25 days)
    expect(rec.winningRequestId).toBe(request1Id);
    expect(rec.priorityScoreBreakdown).toBeDefined();
    expect(rec.priorityScoreBreakdown.deadlineUrgency).toBeGreaterThan(60);
    expect(rec.aiExplanation).toContain('Aarav Sharma');

    // Alternatives must be suggested for Priya
    expect(rec.alternativeOptionsJson).toBeDefined();
    expect(rec.alternativeOptionsJson[request2Id]).toBeDefined();
    expect(rec.alternativeOptionsJson[request2Id].length).toBeGreaterThan(0);
  });

  it('STEP 13, 14, 15, & 16: Switch to Faculty role -> Review pending requests & AI recommendations -> Approve recommended allocation', async () => {
    const pendingRes = await request(app).get('/api/faculty/requests');
    expect(pendingRes.status).toBe(200);
    expect(pendingRes.body.some((r: any) => r.id === request1Id)).toBe(true);

    // Faculty approves winning request (request1Id)
    const approveRes = await request(app)
      .post(`/api/faculty/requests/${request1Id}/decision`)
      .set('x-user-id', 'faculty-2')
      .set('x-user-name', 'Prof. Ananya Iyer')
      .send({
        action: 'APPROVE',
        facultyNotes: 'Approved priority allocation per AI recommendation and deadline urgency.',
      });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.status).toBe('APPROVED');
    expect(approveRes.body.bookingId).toBeDefined();
  });

  it('STEP 17 & 18: Switch back to Student -> Both students view updated statuses & alternative proposals', async () => {
    // Check Aarav's request status -> APPROVED
    const aaravReqs = await request(app).get('/api/bookings/requests?studentId=student-1');
    const aaravReq = aaravReqs.body.find((r: any) => r.id === request1Id);
    expect(aaravReq.status).toBe('APPROVED');

    // Check Priya's request status -> ALTERNATIVE_SUGGESTED
    const priyaReqs = await request(app).get('/api/bookings/requests?studentId=student-2');
    const priyaReq = priyaReqs.body.find((r: any) => r.id === request2Id);
    expect(priyaReq.status).toBe('ALTERNATIVE_SUGGESTED');
  });

  it('STEP 19 & 20: Switch to Administrator -> Verify updated equipment utilization, active bookings, and conflict history', async () => {
    const analyticsRes = await request(app).get('/api/admin/analytics');
    expect(analyticsRes.status).toBe(200);
    expect(analyticsRes.body.summary.activeBookings).toBeGreaterThanOrEqual(1);
    expect(analyticsRes.body.summary.conflictFrequency).toBeGreaterThanOrEqual(1);

    // Verify audit log captured the actions
    const auditRes = await request(app).get('/api/admin/audit-logs');
    expect(auditRes.status).toBe(200);
    expect(auditRes.body.some((l: any) => l.action === 'BOOKING_APPROVED')).toBe(true);
  });
});
