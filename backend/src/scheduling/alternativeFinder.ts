import { AlternativeSlot } from '../types/index.js';
import { timeOverlaps, isSameDay } from './conflictDetector.js';

export interface EquipmentRecord {
  id: string;
  name: string;
  categoryId: string;
  departmentId: string;
  department: { name: string };
  category: { name: string; slug: string };
  status: string;
  maxDurationHours: number;
}

export interface ExistingReservation {
  equipmentId: string;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  status: string;
}

export interface MaintenanceRecord {
  equipmentId: string;
  startDate: Date;
  endDate: Date;
  status: string;
}

/**
 * Checks whether a given slot is genuinely available for an equipment item.
 */
export function isSlotAvailable(
  equipmentId: string,
  targetDate: Date,
  startTime: string,
  endTime: string,
  existingReservations: ExistingReservation[],
  maintenances: MaintenanceRecord[]
): boolean {
  // Check maintenance
  const targetTime = new Date(targetDate).getTime();
  const inMaintenance = maintenances.some(m => {
    if (m.equipmentId !== equipmentId || m.status === 'COMPLETED') return false;
    return targetTime >= new Date(m.startDate).getTime() && targetTime <= new Date(m.endDate).getTime();
  });
  if (inMaintenance) return false;

  // Check approved bookings
  const hasOverlap = existingReservations.some(r => {
    if (r.equipmentId !== equipmentId || r.status !== 'ACTIVE') return false;
    return isSameDay(r.scheduledDate, targetDate) && timeOverlaps(startTime, endTime, r.startTime, r.endTime);
  });

  return !hasOverlap;
}

/**
 * Searches the database for viable alternative time slots and alternative equipment.
 */
export function findAlternativeOptions(
  requestedEquipment: EquipmentRecord,
  requestedDate: Date,
  requestedStartTime: string,
  requestedEndTime: string,
  durationMinutes: number,
  allEquipments: EquipmentRecord[],
  existingReservations: ExistingReservation[],
  maintenances: MaintenanceRecord[]
): AlternativeSlot[] {
  const alternatives: AlternativeSlot[] = [];
  const reqDateObj = new Date(requestedDate);
  const dateStr = reqDateObj.toISOString().split('T')[0];

  // 1. Check alternative time slots on the SAME DAY on the requested equipment
  const candidateTimes = [
    { start: '09:00', end: '11:00', duration: 120 },
    { start: '11:30', end: '13:30', duration: 120 },
    { start: '14:00', end: '16:00', duration: 120 },
    { start: '16:00', end: '18:00', duration: 120 },
  ];

  for (const candidate of candidateTimes) {
    if (timeOverlaps(requestedStartTime, requestedEndTime, candidate.start, candidate.end)) {
      continue; // Skip the overlapping slot
    }
    if (isSlotAvailable(requestedEquipment.id, reqDateObj, candidate.start, candidate.end, existingReservations, maintenances)) {
      alternatives.push({
        type: 'SLOT',
        equipmentId: requestedEquipment.id,
        equipmentName: requestedEquipment.name,
        departmentName: requestedEquipment.department.name,
        date: dateStr,
        startTime: candidate.start,
        endTime: candidate.end,
        durationMinutes: candidate.duration,
        reason: `Available same-day slot on ${requestedEquipment.name} (${candidate.start} - ${candidate.end})`,
      });
      if (alternatives.length >= 2) break;
    }
  }

  // 2. Check NEXT DAY at the same requested time
  const nextDay = new Date(reqDateObj);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayStr = nextDay.toISOString().split('T')[0];

  if (isSlotAvailable(requestedEquipment.id, nextDay, requestedStartTime, requestedEndTime, existingReservations, maintenances)) {
    alternatives.push({
      type: 'SLOT',
      equipmentId: requestedEquipment.id,
      equipmentName: requestedEquipment.name,
      departmentName: requestedEquipment.department.name,
      date: nextDayStr,
      startTime: requestedStartTime,
      endTime: requestedEndTime,
      durationMinutes,
      reason: `Available next-day slot on ${requestedEquipment.name} at your preferred time (${requestedStartTime} - ${requestedEndTime})`,
    });
  }

  // 3. Check ALTERNATIVE COMPATIBLE EQUIPMENT in the same or related category across departments
  const compatibleEquipments = allEquipments.filter(e => 
    e.id !== requestedEquipment.id &&
    e.status !== 'MAINTENANCE' &&
    (e.categoryId === requestedEquipment.categoryId ||
     e.category.slug === requestedEquipment.category.slug ||
     e.name.toLowerCase().includes(requestedEquipment.name.toLowerCase().split(' ')[0]))
  );

  for (const compEq of compatibleEquipments) {
    if (isSlotAvailable(compEq.id, reqDateObj, requestedStartTime, requestedEndTime, existingReservations, maintenances)) {
      alternatives.push({
        type: 'EQUIPMENT',
        equipmentId: compEq.id,
        equipmentName: compEq.name,
        departmentName: compEq.department.name,
        date: dateStr,
        startTime: requestedStartTime,
        endTime: requestedEndTime,
        durationMinutes,
        reason: `Compatible alternative: ${compEq.name} in ${compEq.department.name} is available for your exact requested time!`,
      });
      if (alternatives.length >= 4) break;
    }
  }

  return alternatives;
}
