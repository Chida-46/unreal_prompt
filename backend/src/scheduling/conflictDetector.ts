import { BookingRequestWithDetails, ConflictCluster } from './types.js';

/**
 * Converts "HH:mm" time string into total minutes from midnight.
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Checks whether two time intervals [start1, end1] and [start2, end2] overlap.
 * Touching boundaries (e.g. 10:00-11:00 and 11:00-12:00) do NOT count as conflict.
 */
export function timeOverlaps(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && s2 < e1;
}

/**
 * Checks if two dates represent the same calendar day (ignoring time).
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

/**
 * Detects whether a new or pending request conflicts with an existing approved booking.
 */
export function conflictsWithApprovedBooking(
  request: { requestedDate: Date; startTime: string; endTime: string; equipmentId: string },
  approvedBookings: { scheduledDate: Date; startTime: string; endTime: string; equipmentId: string; status: string }[]
): boolean {
  return approvedBookings.some(b => 
    b.status === 'ACTIVE' &&
    b.equipmentId === request.equipmentId &&
    isSameDay(b.scheduledDate, request.requestedDate) &&
    timeOverlaps(request.startTime, request.endTime, b.startTime, b.endTime)
  );
}

/**
 * Detects whether a request falls within an active equipment maintenance period.
 */
export function conflictsWithMaintenance(
  requestDate: Date,
  equipmentId: string,
  maintenanceSchedules: { equipmentId: string; startDate: Date; endDate: Date; status: string }[]
): boolean {
  const targetTime = new Date(requestDate).getTime();
  return maintenanceSchedules.some(m => {
    if (m.equipmentId !== equipmentId) return false;
    if (m.status === 'COMPLETED') return false;
    const start = new Date(m.startDate).getTime();
    const end = new Date(m.endDate).getTime();
    return targetTime >= start && targetTime <= end;
  });
}

/**
 * Groups multiple pending requests into clusters of overlapping requests for the same equipment on the same date.
 */
export function clusterConflictingRequests(requests: BookingRequestWithDetails[]): ConflictCluster[] {
  const clusters: ConflictCluster[] = [];
  const visited = new Set<string>();

  for (let i = 0; i < requests.length; i++) {
    const current = requests[i];
    if (visited.has(current.id)) continue;

    const group: BookingRequestWithDetails[] = [current];
    visited.add(current.id);

    for (let j = 0; j < requests.length; j++) {
      if (i === j) continue;
      const other = requests[j];
      if (visited.has(other.id)) continue;

      if (
        other.equipmentId === current.equipmentId &&
        isSameDay(other.requestedDate, current.requestedDate) &&
        timeOverlaps(current.startTime, current.endTime, other.startTime, other.endTime)
      ) {
        group.push(other);
        visited.add(other.id);
      }
    }

    if (group.length > 1) {
      const conflictGroupId = current.conflictGroupId || `conflict-${current.equipmentId}-${new Date(current.requestedDate).toISOString().split('T')[0]}-${Date.now()}`;
      clusters.push({
        conflictGroupId,
        equipmentId: current.equipmentId,
        equipmentName: current.equipment.name,
        date: new Date(current.requestedDate).toISOString().split('T')[0],
        requests: group,
      });
    }
  }

  return clusters;
}
