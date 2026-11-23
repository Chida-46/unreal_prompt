import { db } from '../db/database.js';

export async function getSystemAnalytics() {
  // 1. Overview counts
  const totalEquipmentRow = db.prepare('SELECT COUNT(*) as count FROM equipment').get() as any;
  const availableEquipmentRow = db.prepare("SELECT COUNT(*) as count FROM equipment WHERE status = 'AVAILABLE'").get() as any;
  const inUseEquipmentRow = db.prepare("SELECT COUNT(*) as count FROM equipment WHERE status = 'IN_USE'").get() as any;
  const maintenanceEquipmentRow = db.prepare("SELECT COUNT(*) as count FROM equipment WHERE status = 'MAINTENANCE'").get() as any;

  const totalBookingsRow = db.prepare('SELECT COUNT(*) as count FROM bookings').get() as any;
  const activeBookingsRow = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'ACTIVE'").get() as any;

  const pendingRequestsRow = db.prepare("SELECT COUNT(*) as count FROM booking_requests WHERE status IN ('PENDING', 'CONFLICT_DETECTED', 'ALTERNATIVE_SUGGESTED')").get() as any;
  const approvedRequestsRow = db.prepare("SELECT COUNT(*) as count FROM booking_requests WHERE status = 'APPROVED'").get() as any;
  const rejectedRequestsRow = db.prepare("SELECT COUNT(*) as count FROM booking_requests WHERE status = 'REJECTED'").get() as any;
  const conflictFrequencyRow = db.prepare("SELECT COUNT(DISTINCT conflict_group_id) as count FROM booking_requests WHERE conflict_group_id IS NOT NULL").get() as any;

  const totalEquipment = totalEquipmentRow?.count || 0;
  const availableEquipment = availableEquipmentRow?.count || 0;
  const activeBookings = activeBookingsRow?.count || 0;
  const pendingRequests = pendingRequestsRow?.count || 0;
  const approvedRequests = approvedRequestsRow?.count || 0;
  const conflictFrequency = conflictFrequencyRow?.count || 0;

  // Equipment utilization percentage: (booked / total) * 100
  const utilizationPercentage = totalEquipment > 0
    ? Math.min(100, parseFloat(((activeBookings / totalEquipment) * 100).toFixed(1)))
    : 0;

  // 2. Department-wise equipment utilization
  const deptStatsRows = db.prepare(`
    SELECT d.id, d.code, d.name,
           COUNT(DISTINCT e.id) as total_equipment,
           COUNT(DISTINCT b.id) as active_bookings
    FROM departments d
    LEFT JOIN equipment e ON d.id = e.department_id
    LEFT JOIN bookings b ON e.id = b.equipment_id AND b.status = 'ACTIVE'
    GROUP BY d.id
    ORDER BY d.name ASC
  `).all() as any[];

  const departmentUtilization = deptStatsRows.map(row => {
    const total = row.total_equipment || 0;
    const active = row.active_bookings || 0;
    const rate = total > 0 ? Math.round((active / total) * 100) : 0;
    return {
      departmentId: row.id,
      departmentCode: row.code,
      departmentName: row.name,
      totalEquipment: total,
      activeBookings: active,
      utilizationRate: rate,
    };
  });

  // 3. Most requested equipment
  const mostRequestedRows = db.prepare(`
    SELECT e.id, e.name, e.equipment_code, d.name as department_name,
           COUNT(br.id) as request_count
    FROM equipment e
    JOIN departments d ON e.department_id = d.id
    LEFT JOIN booking_requests br ON e.id = br.equipment_id
    GROUP BY e.id
    ORDER BY request_count DESC, e.name ASC
    LIMIT 6
  `).all() as any[];

  // 4. Booking status distribution
  const statusDistributionRows = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM booking_requests
    GROUP BY status
  `).all() as any[];

  // 5. Unused resources (equipment with 0 bookings)
  const unusedEquipmentRows = db.prepare(`
    SELECT e.id, e.name, e.equipment_code, d.name as department_name
    FROM equipment e
    JOIN departments d ON e.department_id = d.id
    LEFT JOIN bookings b ON e.id = b.equipment_id AND b.status = 'ACTIVE'
    WHERE b.id IS NULL
    LIMIT 5
  `).all() as any[];

  // 6. Peak booking hours distribution
  const peakHoursRows = db.prepare(`
    SELECT start_time, COUNT(*) as count
    FROM booking_requests
    GROUP BY start_time
    ORDER BY count DESC
  `).all() as any[];

  // 7. Maintenance frequency
  const maintenanceCountRow = db.prepare('SELECT COUNT(*) as count FROM maintenance_schedules').get() as any;

  return {
    summary: {
      totalEquipment,
      availableEquipment,
      inUseEquipment: inUseEquipmentRow?.count || 0,
      maintenanceEquipment: maintenanceEquipmentRow?.count || 0,
      totalBookings: totalBookingsRow?.count || 0,
      activeBookings,
      pendingRequests,
      approvedRequests,
      rejectedRequests: rejectedRequestsRow?.count || 0,
      conflictFrequency,
      utilizationPercentage,
      maintenanceFrequency: maintenanceCountRow?.count || 0,
    },
    departmentUtilization,
    mostRequestedEquipment: mostRequestedRows,
    bookingStatusDistribution: statusDistributionRows,
    unusedResources: unusedEquipmentRows,
    peakBookingHours: peakHoursRows,
  };
}
