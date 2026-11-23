import { prisma } from './prisma.js';
import { conflictsWithApprovedBooking } from '../scheduling/conflictDetector.js';

export async function getPendingRequestsForFaculty(departmentId?: string) {
  const allRequests = prisma.bookingRequest.findMany();
  // Filter for pending, conflict, or alternative suggested
  return allRequests.filter(r => 
    ['PENDING', 'CONFLICT_DETECTED', 'ALTERNATIVE_SUGGESTED'].includes(r.status) &&
    (!departmentId || r.equipment.department.name.includes(departmentId))
  );
}

export async function processFacultyDecision(
  requestId: string,
  facultyUser: { id: string; name: string },
  decision: {
    action: 'APPROVE' | 'REJECT' | 'SUGGEST_ALTERNATIVE';
    facultyNotes?: string;
    rejectionReason?: string;
    suggestedAlternative?: any;
  }
) {
  const req = prisma.bookingRequest.findUnique({ id: requestId });
  if (!req) throw new Error('Booking request not found');

  if (decision.action === 'APPROVE') {
    // 1. Double check no approved booking overlaps this slot
    const activeBookings = prisma.booking.findMany({
      where: { equipmentId: req.equipmentId, status: 'ACTIVE' },
    });

    const isOverlap = conflictsWithApprovedBooking(
      {
        equipmentId: req.equipmentId,
        requestedDate: req.requestedDate,
        startTime: req.startTime,
        endTime: req.endTime,
      },
      activeBookings
    );

    if (isOverlap) {
      throw new Error('Cannot approve: this equipment slot has already been reserved by an active booking.');
    }

    // 2. Update request status to APPROVED
    prisma.bookingRequest.update(
      { id: requestId },
      {
        status: 'APPROVED',
        facultyNotes: decision.facultyNotes || 'Approved by faculty reviewer',
      }
    );

    // 3. Create active booking record in database
    const bookingId = prisma.booking.create({
      bookingRequestId: req.id,
      equipmentId: req.equipmentId,
      studentId: req.studentId,
      scheduledDate: req.requestedDate,
      startTime: req.startTime,
      endTime: req.endTime,
      status: 'ACTIVE',
    });

    // 4. If this request was part of a conflict group, mark recommendation as ACCEPTED
    if (req.conflictGroupId) {
      const rec = prisma.allocationRecommendation.findUnique({ conflictGroupId: req.conflictGroupId });
      if (rec) {
        prisma.allocationRecommendation.upsert({
          ...rec,
          status: 'ACCEPTED',
        });
      }
    }

    // 5. Notify student
    prisma.notification.create({
      userId: req.studentId,
      title: '🎉 Request Approved!',
      message: `Your booking request for ${req.equipment.name} on ${new Date(req.requestedDate).toISOString().split('T')[0]} (${req.startTime}-${req.endTime}) was approved by ${facultyUser.name}.`,
      type: 'APPROVAL',
      linkUrl: '/my-bookings',
    });

    // 6. Audit log
    prisma.auditLog.create({
      action: 'BOOKING_APPROVED',
      entityType: 'BookingRequest',
      entityId: req.id,
      actorName: facultyUser.name,
      actorRole: 'FACULTY',
      details: `Approved booking on ${req.equipment.name} for student ${req.student.name} (${req.startTime}-${req.endTime}). Booking ID: ${bookingId}`,
    });

    return { success: true, status: 'APPROVED', bookingId };
  } else if (decision.action === 'REJECT') {
    prisma.bookingRequest.update(
      { id: requestId },
      {
        status: 'REJECTED',
        rejectionReason: decision.rejectionReason || 'Project requirements could not be accommodated at this time.',
        facultyNotes: decision.facultyNotes,
      }
    );

    prisma.notification.create({
      userId: req.studentId,
      title: 'Booking Request Rejected',
      message: `Your request for ${req.equipment.name} was rejected. Reason: ${decision.rejectionReason || 'No specific reason provided.'}`,
      type: 'REJECTION',
      linkUrl: '/my-bookings',
    });

    prisma.auditLog.create({
      action: 'BOOKING_REJECTED',
      entityType: 'BookingRequest',
      entityId: req.id,
      actorName: facultyUser.name,
      actorRole: 'FACULTY',
      details: `Rejected booking request for ${req.student.name}. Reason: ${decision.rejectionReason}`,
    });

    return { success: true, status: 'REJECTED' };
  } else {
    // SUGGEST_ALTERNATIVE
    prisma.bookingRequest.update(
      { id: requestId },
      {
        status: 'ALTERNATIVE_SUGGESTED',
        facultyNotes: decision.facultyNotes || 'Faculty suggested reviewing alternative available time slots.',
      }
    );

    prisma.notification.create({
      userId: req.studentId,
      title: 'Alternative Slot Suggested by Faculty',
      message: `${facultyUser.name} suggested alternative options for your ${req.equipment.name} request: ${decision.facultyNotes}`,
      type: 'ALTERNATIVE',
      linkUrl: '/ai-recommendations',
    });

    return { success: true, status: 'ALTERNATIVE_SUGGESTED' };
  }
}
