import { prisma } from './prisma.js';
import { runInTransaction } from '../db/database.js';
import {
  conflictsWithApprovedBooking,
  conflictsWithMaintenance,
  timeOverlaps,
  isSameDay,
} from '../scheduling/conflictDetector.js';
import { runSchedulingAnalysis } from './schedulingService.js';

export interface CreateBookingRequestInput {
  projectId: string;
  equipmentId: string;
  studentId: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  projectDeadline: string;
  technicalRequirements?: string;
  accessReason: string;
}

export async function createBookingRequest(input: CreateBookingRequestInput) {
  const reqDate = new Date(input.requestedDate);
  const projDeadline = new Date(input.projectDeadline);

  // Execute database conflict checks and request creation inside an atomic SQLite IMMEDIATE transaction
  const { newRequestId, conflictGroupId, status, equipment } = runInTransaction(() => {
    // 1. Fetch equipment details
    const eq = prisma.equipment.findUnique({ id: input.equipmentId });
    if (!eq) {
      throw new Error('Equipment not found');
    }

    // 2. Prevent duplicate submissions:
    // Check if this student already has an active or pending request for the same equipment and overlapping slot
    const existingForStudent = prisma.bookingRequest.findMany({
      where: {
        studentId: input.studentId,
        equipmentId: input.equipmentId,
      },
    });

    const duplicateRequest = existingForStudent.find(r =>
      ['PENDING', 'APPROVED', 'CONFLICT_DETECTED', 'ALTERNATIVE_SUGGESTED'].includes(r.status) &&
      isSameDay(r.requestedDate, reqDate) &&
      timeOverlaps(input.startTime, input.endTime, r.startTime, r.endTime)
    );

    if (duplicateRequest) {
      throw new Error(
        `Duplicate request: You already have an active or pending booking for this equipment during this time slot.`
      );
    }

    // 3. Fetch existing active bookings for this equipment
    const activeBookings = prisma.booking.findMany({
      where: { equipmentId: input.equipmentId, status: 'ACTIVE' },
    });

    // Check if overlapping an already APPROVED booking
    const overlapsApproved = conflictsWithApprovedBooking(
      {
        equipmentId: input.equipmentId,
        requestedDate: reqDate,
        startTime: input.startTime,
        endTime: input.endTime,
      },
      activeBookings
    );

    if (overlapsApproved) {
      throw new Error(
        `The requested time slot (${input.startTime} - ${input.endTime}) on this equipment is already reserved by an approved booking. Please select an alternative time or check AI recommendations.`
      );
    }

    // 3. Check maintenance schedules
    const maintenances = prisma.maintenanceSchedule.findMany({
      where: { equipmentId: input.equipmentId, status: 'SCHEDULED' },
    });

    const inMaintenance = conflictsWithMaintenance(reqDate, input.equipmentId, maintenances);
    if (inMaintenance) {
      throw new Error(
        `Equipment is scheduled for maintenance during the requested period. Access cannot be scheduled.`
      );
    }

    // 4. Check for overlapping PENDING requests for the same equipment and date (Conflict Detection)
    const existingPending = prisma.bookingRequest.findMany({
      where: {
        equipmentId: input.equipmentId,
        status: ['PENDING', 'CONFLICT_DETECTED', 'ALTERNATIVE_SUGGESTED'],
      },
    });

    const conflictingPending = existingPending.filter(r =>
      isSameDay(r.requestedDate, reqDate) &&
      timeOverlaps(input.startTime, input.endTime, r.startTime, r.endTime)
    );

    let reqStatus = 'PENDING';
    let cGroupId: string | null = null;

    if (conflictingPending.length > 0) {
      // Conflict detected!
      reqStatus = 'CONFLICT_DETECTED';
      cGroupId = conflictingPending[0].conflictGroupId || `conflict-${input.equipmentId}-${input.requestedDate.split('T')[0]}-${Date.now()}`;

      // Update existing conflicting requests to CONFLICT_DETECTED
      for (const confReq of conflictingPending) {
        prisma.bookingRequest.update(
          { id: confReq.id },
          { status: 'CONFLICT_DETECTED', conflictGroupId: cGroupId }
        );
      }
    } else if (!eq.requiresApproval) {
      // Equipment does not require faculty approval and has no conflicts -> Auto-approve!
      reqStatus = 'APPROVED';
    }

    // 5. Create new booking request
    const createdReq = prisma.bookingRequest.create({
      projectId: input.projectId,
      equipmentId: input.equipmentId,
      studentId: input.studentId,
      requestedDate: reqDate,
      startTime: input.startTime,
      endTime: input.endTime,
      durationMinutes: input.durationMinutes,
      projectDeadline: projDeadline,
      technicalRequirements: input.technicalRequirements,
      accessReason: input.accessReason,
      status: reqStatus,
      conflictGroupId: cGroupId,
    });

    // If auto-approved, create the corresponding active booking immediately
    if (reqStatus === 'APPROVED' && createdReq) {
      prisma.booking.create({
        bookingRequestId: createdReq.id,
        equipmentId: input.equipmentId,
        studentId: input.studentId,
        scheduledDate: reqDate,
        startTime: input.startTime,
        endTime: input.endTime,
        status: 'ACTIVE',
      });
    }

    // Create notification for student
    const student = prisma.user.findUnique({ id: input.studentId });
    let notifTitle = 'Booking Request Submitted';
    let notifMsg = `Your request for ${eq.name} on ${input.requestedDate.split('T')[0]} (${input.startTime}-${input.endTime}) has been queued for faculty review.`;
    let notifType: any = 'SUBMISSION';

    if (reqStatus === 'CONFLICT_DETECTED') {
      notifTitle = '⚠️ Booking Conflict Detected';
      notifMsg = `Another student also requested ${eq.name} for an overlapping time on ${input.requestedDate.split('T')[0]}. The AI scheduling engine has analyzed both requests.`;
      notifType = 'CONFLICT';
    } else if (reqStatus === 'APPROVED') {
      notifTitle = '🎉 Booking Confirmed!';
      notifMsg = `Your booking for ${eq.name} on ${input.requestedDate.split('T')[0]} (${input.startTime}-${input.endTime}) has been automatically confirmed.`;
      notifType = 'APPROVAL';
    }

    prisma.notification.create({
      userId: input.studentId,
      title: notifTitle,
      message: notifMsg,
      type: notifType,
      linkUrl: '/my-bookings',
    });

    // Log audit
    prisma.auditLog.create({
      action: 'BOOKING_REQUEST_CREATED',
      entityType: 'BookingRequest',
      entityId: createdReq?.id,
      actorName: student?.name || 'Student',
      actorRole: 'STUDENT',
      details: `Submitted request for ${eq.name} on ${input.requestedDate} (${input.startTime}-${input.endTime}) - Status: ${reqStatus}`,
    });

    return {
      newRequestId: createdReq!.id,
      conflictGroupId: cGroupId,
      status: reqStatus,
      equipment: eq,
    };
  });

  // 6. If conflict occurred, trigger AI Scheduling Analysis outside the transaction
  if (conflictGroupId) {
    await runSchedulingAnalysis(conflictGroupId);
  }

  return prisma.bookingRequest.findUnique({ id: newRequestId });
}

export async function getStudentRequests(studentId: string) {
  return prisma.bookingRequest.findMany({
    where: { studentId },
  });
}

export async function cancelBookingRequest(requestId: string, studentId: string) {
  const req = prisma.bookingRequest.findUnique({ id: requestId });
  if (!req) throw new Error('Request not found');
  if (req.studentId !== studentId) throw new Error('Unauthorized to cancel this request');
  if (req.status === 'COMPLETED' || req.status === 'CANCELLED') {
    throw new Error('Request cannot be cancelled in its current state');
  }

  const updated = prisma.bookingRequest.update({ id: requestId }, { status: 'CANCELLED' });

  // If there was an active booking, cancel it as well
  const bookings = prisma.booking.findMany({ where: { studentId } });
  const relatedBooking = bookings.find(b => b.bookingRequestId === requestId);
  if (relatedBooking) {
    prisma.booking.update({ id: relatedBooking.id }, { status: 'CANCELLED' });
  }

  prisma.notification.create({
    userId: studentId,
    title: 'Booking Request Cancelled',
    message: `Your request for ${req.equipment.name} on ${new Date(req.requestedDate).toISOString().split('T')[0]} has been cancelled.`,
    type: 'CANCELLATION',
    linkUrl: '/my-bookings',
  });

  return updated;
}
