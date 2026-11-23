import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateDeadlineUrgency,
  calculateCompatibilityScore,
  calculateWaitingTimeScore,
  calculateFairnessScore,
  calculateFeasibilityScore,
  computePriorityScore,
} from '../src/scheduling/priorityScorer.js';
import {
  timeOverlaps,
  conflictsWithApprovedBooking,
  conflictsWithMaintenance,
  clusterConflictingRequests,
} from '../src/scheduling/conflictDetector.js';
import { findAlternativeOptions } from '../src/scheduling/alternativeFinder.js';
import { resolveConflictCluster } from '../src/scheduling/fairAllocator.js';

describe('Intelligent Scheduling Engine - Priority Scoring', () => {
  it('should assign highest urgency (>=90) to project deadlines within 3 days', () => {
    const today = new Date('2026-11-23T10:00:00Z');
    const urgentDeadline = new Date('2026-11-25T10:00:00Z'); // 2 days
    const distantDeadline = new Date('2026-12-23T10:00:00Z'); // 30 days

    const scoreUrgent = calculateDeadlineUrgency(urgentDeadline, today);
    const scoreDistant = calculateDeadlineUrgency(distantDeadline, today);

    expect(scoreUrgent).toBeGreaterThanOrEqual(90);
    expect(scoreDistant).toBeLessThanOrEqual(35);
    expect(scoreUrgent).toBeGreaterThan(scoreDistant);
  });

  it('should award higher fairness score to students with 0 previous bookings', () => {
    const scoreFirstTime = calculateFairnessScore(0);
    const scoreFrequentUser = calculateFairnessScore(4);

    expect(scoreFirstTime).toBe(100);
    expect(scoreFrequentUser).toBe(40);
    expect(scoreFirstTime).toBeGreaterThan(scoreFrequentUser);
  });

  it('should evaluate domain compatibility between project description and hardware specs', () => {
    const specs = 'Xilinx Artix-7 XC7A100T FPGA Vivado Verilog VHDL PMOD DDR3';
    const matchingReq = 'Real-time image processing filter using Verilog on FPGA';
    const unrelatedReq = 'Simple Python web server testing';

    const scoreMatching = calculateCompatibilityScore(matchingReq, 'FPGA architecture', specs);
    const scoreUnrelated = calculateCompatibilityScore(unrelatedReq, 'Web backend', specs);

    expect(scoreMatching).toBeGreaterThan(scoreUnrelated);
  });

  it('should penalize requests exceeding max equipment duration', () => {
    const normalFeasibility = calculateFeasibilityScore(180, 4, '10:00', '13:00'); // 3h on 4h max
    const excessiveFeasibility = calculateFeasibilityScore(360, 4, '10:00', '16:00'); // 6h on 4h max

    expect(normalFeasibility).toBeGreaterThan(excessiveFeasibility);
  });
});

describe('Conflict Detection', () => {
  it('should detect overlapping time intervals accurately', () => {
    expect(timeOverlaps('10:00', '12:00', '11:00', '13:00')).toBe(true);
    expect(timeOverlaps('10:00', '12:00', '09:00', '11:00')).toBe(true);
    expect(timeOverlaps('10:00', '12:00', '10:30', '11:30')).toBe(true);

    // Non-overlapping / touching boundary slots
    expect(timeOverlaps('10:00', '12:00', '12:00', '14:00')).toBe(false);
    expect(timeOverlaps('10:00', '12:00', '08:00', '10:00')).toBe(false);
  });

  it('should detect conflicts with approved bookings', () => {
    const req = {
      requestedDate: new Date('2026-11-25T00:00:00Z'),
      startTime: '10:00',
      endTime: '12:00',
      equipmentId: 'eq-fpga-01',
    };

    const approvedBookings = [
      {
        scheduledDate: new Date('2026-11-25T00:00:00Z'),
        startTime: '11:00',
        endTime: '13:00',
        equipmentId: 'eq-fpga-01',
        status: 'ACTIVE',
      },
    ];

    expect(conflictsWithApprovedBooking(req, approvedBookings)).toBe(true);
  });

  it('should detect maintenance lockout periods', () => {
    const targetDate = new Date('2026-11-26T10:00:00Z');
    const maintenances = [
      {
        equipmentId: 'eq-scope-01',
        startDate: new Date('2026-11-25T00:00:00Z'),
        endDate: new Date('2026-11-27T00:00:00Z'),
        status: 'SCHEDULED',
      },
    ];

    expect(conflictsWithMaintenance(targetDate, 'eq-scope-01', maintenances)).toBe(true);
    expect(conflictsWithMaintenance(targetDate, 'eq-fpga-01', maintenances)).toBe(false);
  });
});

describe('End-to-End Conflict Resolution Scenario (2 Students Competing for FPGA Kit)', () => {
  it('should fairly allocate the FPGA kit to the student with the more urgent deadline and lower usage', () => {
    const today = new Date('2026-11-23T10:00:00Z');
    const requestedDate = new Date('2026-11-25T00:00:00Z');

    // Student 1: Aarav Sharma - Urgent deadline in 3 days, 0 prior bookings
    const req1: any = {
      id: 'req-aarav',
      projectId: 'proj-1',
      project: {
        id: 'proj-1',
        title: 'Real-Time FPGA Image Processing',
        description: 'Implementing hardware accelerated Sobel filter on Artix-7 FPGA using Vivado',
        category: 'FPGA Development',
        deadline: new Date('2026-11-26T00:00:00Z'), // 3 days
        techStack: 'Vivado, Verilog, Artix-7',
      },
      equipmentId: 'eq-fpga-01',
      equipment: {
        id: 'eq-fpga-01',
        equipmentCode: 'EQ-FPGA-01',
        name: 'FPGA Development Kit',
        categoryId: 'cat-fpga',
        departmentId: 'dept-ece',
        specifications: 'Xilinx Artix-7 XC7A100T FPGA Vivado Verilog VHDL PMOD DDR3',
        status: 'AVAILABLE',
        maxDurationHours: 4,
        department: { name: 'Electronics and Communication Engineering' },
        category: { name: 'FPGA Development', slug: 'fpga-development' },
      },
      studentId: 'student-1',
      student: {
        id: 'student-1',
        name: 'Aarav Sharma',
        email: 'aarav@campus.edu',
        bookings: [], // 0 prior bookings -> maximum fairness score!
      },
      requestedDate,
      startTime: '10:00',
      endTime: '13:00',
      durationMinutes: 180,
      projectDeadline: new Date('2026-11-26T00:00:00Z'),
      technicalRequirements: 'Vivado synthesis on Artix-7',
      accessReason: 'Final hardware milestone verification',
      status: 'CONFLICT_DETECTED',
      createdAt: today,
    };

    // Student 2: Priya Patel - Deadline in 20 days, already had 3 prior bookings
    const req2: any = {
      id: 'req-priya',
      projectId: 'proj-2',
      project: {
        id: 'proj-2',
        title: 'Digital Signal Generator',
        description: 'Preliminary synthesis trial for waveform generator',
        category: 'FPGA Development',
        deadline: new Date('2026-12-15T00:00:00Z'), // 22 days
        techStack: 'VHDL',
      },
      equipmentId: 'eq-fpga-01',
      equipment: req1.equipment,
      studentId: 'student-2',
      student: {
        id: 'student-2',
        name: 'Priya Patel',
        email: 'priya@campus.edu',
        bookings: [{ id: 'b1' }, { id: 'b2' }, { id: 'b3' }], // 3 bookings already -> lower fairness score
      },
      requestedDate,
      startTime: '11:00',
      endTime: '14:00',
      durationMinutes: 180,
      projectDeadline: new Date('2026-12-15T00:00:00Z'),
      technicalRequirements: 'FPGA synthesizer',
      accessReason: 'Exploratory testing',
      status: 'CONFLICT_DETECTED',
      createdAt: today,
    };

    const cluster = {
      conflictGroupId: 'conflict-fpga-test',
      equipmentId: 'eq-fpga-01',
      equipmentName: 'FPGA Development Kit',
      date: '2026-11-25',
      requests: [req1, req2],
    };

    const resolution = resolveConflictCluster(
      cluster,
      [req1.equipment],
      [],
      []
    );

    expect(resolution.winner.request.id).toBe('req-aarav');
    expect(resolution.losers.length).toBe(1);
    expect(resolution.losers[0].request.id).toBe('req-priya');
    expect(resolution.winner.breakdown.totalScore).toBeGreaterThan(resolution.losers[0].breakdown.totalScore);
    expect(resolution.aiExplanation).toContain('Aarav Sharma');
    expect(resolution.aiExplanation).toContain('Decision Rationale & Scoring Breakdown');
  });
});
