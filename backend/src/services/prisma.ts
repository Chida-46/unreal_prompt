import { db } from '../db/database.js';

function generateId(): string {
  return 'c' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export const prisma = {
  department: {
    findMany(params?: { orderBy?: any }) {
      const rows = db.prepare('SELECT * FROM departments ORDER BY name ASC').all() as any[];
      return rows.map(r => ({
        id: r.id,
        code: r.code,
        name: r.name,
        description: r.description,
        icon: r.icon,
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at),
      }));
    },
    findUnique(where: { id?: string; code?: string }) {
      let row: any;
      if (where.id) {
        row = db.prepare('SELECT * FROM departments WHERE id = ?').get(where.id);
      } else if (where.code) {
        row = db.prepare('SELECT * FROM departments WHERE code = ?').get(where.code);
      }
      if (!row) return null;
      return {
        id: row.id,
        code: row.code,
        name: row.name,
        description: row.description,
        icon: row.icon,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    },
    create(data: { id?: string; code: string; name: string; description?: string; icon?: string }) {
      const id = data.id || generateId();
      db.prepare(`
        INSERT INTO departments (id, code, name, description, icon)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, data.code, data.name, data.description || null, data.icon || null);
      return this.findUnique({ id });
    },
  },

  laboratory: {
    findMany(params?: { where?: { departmentId?: string } }) {
      let sql = 'SELECT l.*, d.name as department_name FROM laboratories l JOIN departments d ON l.department_id = d.id';
      const args: any[] = [];
      if (params?.where?.departmentId) {
        sql += ' WHERE l.department_id = ?';
        args.push(params.where.departmentId);
      }
      sql += ' ORDER BY l.name ASC';
      const rows = db.prepare(sql).all(...args) as any[];
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        roomNumber: r.room_number,
        departmentId: r.department_id,
        operatingHours: r.operating_hours,
        department: { id: r.department_id, name: r.department_name },
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at),
      }));
    },
    findUnique(where: { id: string }) {
      const row = db.prepare(`
        SELECT l.*, d.name as department_name FROM laboratories l
        JOIN departments d ON l.department_id = d.id
        WHERE l.id = ?
      `).get(where.id) as any;
      if (!row) return null;
      return {
        id: row.id,
        name: row.name,
        roomNumber: row.room_number,
        departmentId: row.department_id,
        operatingHours: row.operating_hours,
        department: { id: row.department_id, name: row.department_name },
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    },
    create(data: { id?: string; name: string; roomNumber: string; departmentId: string; operatingHours?: string }) {
      const id = data.id || generateId();
      db.prepare(`
        INSERT INTO laboratories (id, name, room_number, department_id, operating_hours)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, data.name, data.roomNumber, data.departmentId, data.operatingHours || '08:00 - 18:00');
      return this.findUnique({ id });
    },
  },

  equipmentCategory: {
    findMany() {
      const rows = db.prepare('SELECT * FROM equipment_categories ORDER BY name ASC').all() as any[];
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        icon: r.icon,
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at),
      }));
    },
    findUnique(where: { id?: string; slug?: string }) {
      let row: any;
      if (where.id) {
        row = db.prepare('SELECT * FROM equipment_categories WHERE id = ?').get(where.id);
      } else if (where.slug) {
        row = db.prepare('SELECT * FROM equipment_categories WHERE slug = ?').get(where.slug);
      }
      if (!row) return null;
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        icon: row.icon,
      };
    },
    create(data: { id?: string; name: string; slug: string; description?: string; icon?: string }) {
      const id = data.id || generateId();
      db.prepare(`
        INSERT INTO equipment_categories (id, name, slug, description, icon)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, data.name, data.slug, data.description || null, data.icon || null);
      return this.findUnique({ id });
    },
  },

  user: {
    findMany(params?: { where?: { role?: string; departmentId?: string } }) {
      let sql = 'SELECT u.*, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id';
      const conditions: string[] = [];
      const args: any[] = [];
      if (params?.where?.role) {
        conditions.push('u.role = ?');
        args.push(params.where.role);
      }
      if (params?.where?.departmentId) {
        conditions.push('u.department_id = ?');
        args.push(params.where.departmentId);
      }
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      sql += ' ORDER BY u.name ASC';
      const rows = db.prepare(sql).all(...args) as any[];
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        avatar: r.avatar,
        departmentId: r.department_id,
        department: r.department_id ? { id: r.department_id, name: r.department_name } : null,
      }));
    },
    findUnique(where: { id?: string; email?: string }) {
      let row: any;
      if (where.id) {
        row = db.prepare(`
          SELECT u.*, d.name as department_name FROM users u
          LEFT JOIN departments d ON u.department_id = d.id
          WHERE u.id = ?
        `).get(where.id);
      } else if (where.email) {
        row = db.prepare(`
          SELECT u.*, d.name as department_name FROM users u
          LEFT JOIN departments d ON u.department_id = d.id
          WHERE u.email = ?
        `).get(where.email);
      }
      if (!row) return null;
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        avatar: row.avatar,
        departmentId: row.department_id,
        department: row.department_id ? { id: row.department_id, name: row.department_name } : null,
      };
    },
    create(data: { id?: string; name: string; email: string; role: string; avatar?: string; departmentId?: string }) {
      const id = data.id || generateId();
      db.prepare(`
        INSERT INTO users (id, name, email, role, avatar, department_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, data.name, data.email, data.role, data.avatar || null, data.departmentId || null);
      return this.findUnique({ id });
    },
  },

  equipment: {
    findMany(params?: { where?: any; orderBy?: any }) {
      let sql = `
        SELECT e.*, 
               d.name as department_name, d.code as department_code,
               l.name as laboratory_name, l.room_number as room_number, l.operating_hours as laboratory_operating_hours,
               c.name as category_name, c.slug as category_slug
        FROM equipment e
        JOIN departments d ON e.department_id = d.id
        JOIN laboratories l ON e.laboratory_id = l.id
        JOIN equipment_categories c ON e.category_id = c.id
      `;
      const conditions: string[] = [];
      const args: any[] = [];

      if (params?.where?.departmentId) {
        conditions.push('e.department_id = ?');
        args.push(params.where.departmentId);
      }
      if (params?.where?.categoryId) {
        conditions.push('e.category_id = ?');
        args.push(params.where.categoryId);
      }
      if (params?.where?.laboratoryId) {
        conditions.push('e.laboratory_id = ?');
        args.push(params.where.laboratoryId);
      }
      if (params?.where?.status) {
        conditions.push('e.status = ?');
        args.push(params.where.status);
      }
      if (params?.where?.search) {
        const s = `%${params.where.search}%`;
        conditions.push('(e.name LIKE ? OR e.description LIKE ? OR e.specifications LIKE ? OR e.equipment_code LIKE ? OR d.name LIKE ? OR c.name LIKE ?)');
        args.push(s, s, s, s, s, s);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY e.name ASC';

      const rows = db.prepare(sql).all(...args) as any[];
      return rows.map(r => ({
        id: r.id,
        equipmentCode: r.equipment_code,
        name: r.name,
        categoryId: r.category_id,
        departmentId: r.department_id,
        laboratoryId: r.laboratory_id,
        description: r.description,
        specifications: r.specifications,
        status: r.status,
        maxDurationHours: r.max_duration_hours,
        requiresApproval: Boolean(r.requires_approval),
        modelNumber: r.model_number,
        iconSvg: r.icon_svg,
        department: { id: r.department_id, name: r.department_name, code: r.department_code },
        laboratory: { id: r.laboratory_id, name: r.laboratory_name, roomNumber: r.room_number, operatingHours: r.laboratory_operating_hours || '08:00 - 18:00' },
        category: { id: r.category_id, name: r.category_name, slug: r.category_slug },
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at),
      }));
    },
    findUnique(where: { id?: string; equipmentCode?: string }) {
      let sql = `
        SELECT e.*, 
               d.name as department_name, d.code as department_code,
               l.name as laboratory_name, l.room_number as room_number, l.operating_hours as laboratory_operating_hours,
               c.name as category_name, c.slug as category_slug
        FROM equipment e
        JOIN departments d ON e.department_id = d.id
        JOIN laboratories l ON e.laboratory_id = l.id
        JOIN equipment_categories c ON e.category_id = c.id
      `;
      let row: any;
      if (where.id) {
        sql += ' WHERE e.id = ?';
        row = db.prepare(sql).get(where.id);
      } else if (where.equipmentCode) {
        sql += ' WHERE e.equipment_code = ?';
        row = db.prepare(sql).get(where.equipmentCode);
      }
      if (!row) return null;

      // Fetch active bookings and maintenance
      const bookings = db.prepare(`
        SELECT b.*, u.name as student_name FROM bookings b
        JOIN users u ON b.student_id = u.id
        WHERE b.equipment_id = ? AND b.status = 'ACTIVE'
        ORDER BY b.scheduled_date ASC, b.start_time ASC
      `).all(row.id) as any[];

      const maintenances = db.prepare(`
        SELECT * FROM maintenance_schedules
        WHERE equipment_id = ? AND status != 'COMPLETED'
        ORDER BY start_date ASC
      `).all(row.id) as any[];

      return {
        id: row.id,
        equipmentCode: row.equipment_code,
        name: row.name,
        categoryId: row.category_id,
        departmentId: row.department_id,
        laboratoryId: row.laboratory_id,
        description: row.description,
        specifications: row.specifications,
        status: row.status,
        maxDurationHours: row.max_duration_hours,
        requiresApproval: Boolean(row.requires_approval),
        modelNumber: row.model_number,
        iconSvg: row.icon_svg,
        department: { id: row.department_id, name: row.department_name, code: row.department_code },
        laboratory: { id: row.laboratory_id, name: row.laboratory_name, roomNumber: row.room_number, operatingHours: row.laboratory_operating_hours || '08:00 - 18:00' },
        category: { id: row.category_id, name: row.category_name, slug: row.category_slug },
        bookings: bookings.map(b => ({
          id: b.id,
          scheduledDate: new Date(b.scheduled_date),
          startTime: b.start_time,
          endTime: b.end_time,
          status: b.status,
          student: { id: b.student_id, name: b.student_name },
        })),
        maintenanceSchedules: maintenances.map(m => ({
          id: m.id,
          title: m.title,
          reason: m.reason,
          startDate: new Date(m.start_date),
          endDate: new Date(m.end_date),
          status: m.status,
        })),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    },
    create(data: any) {
      const id = data.id || generateId();
      db.prepare(`
        INSERT INTO equipment (
          id, equipment_code, name, category_id, department_id, laboratory_id,
          description, specifications, status, max_duration_hours, requires_approval,
          model_number, icon_svg
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, data.equipmentCode, data.name, data.categoryId, data.departmentId, data.laboratoryId,
        data.description, data.specifications, data.status || 'AVAILABLE',
        data.maxDurationHours || 4, data.requiresApproval ? 1 : 0,
        data.modelNumber || null, data.iconSvg || null
      );
      return this.findUnique({ id });
    },
    update(where: { id: string }, data: any) {
      const fields: string[] = [];
      const args: any[] = [];

      if (data.name !== undefined) { fields.push('name = ?'); args.push(data.name); }
      if (data.description !== undefined) { fields.push('description = ?'); args.push(data.description); }
      if (data.specifications !== undefined) { fields.push('specifications = ?'); args.push(data.specifications); }
      if (data.status !== undefined) { fields.push('status = ?'); args.push(data.status); }
      if (data.maxDurationHours !== undefined) { fields.push('max_duration_hours = ?'); args.push(data.maxDurationHours); }
      if (data.requiresApproval !== undefined) { fields.push('requires_approval = ?'); args.push(data.requiresApproval ? 1 : 0); }
      if (data.modelNumber !== undefined) { fields.push('model_number = ?'); args.push(data.modelNumber); }
      if (data.categoryId !== undefined) { fields.push('category_id = ?'); args.push(data.categoryId); }
      if (data.departmentId !== undefined) { fields.push('department_id = ?'); args.push(data.departmentId); }
      if (data.laboratoryId !== undefined) { fields.push('laboratory_id = ?'); args.push(data.laboratoryId); }

      fields.push("updated_at = datetime('now')");
      args.push(where.id);

      db.prepare(`UPDATE equipment SET ${fields.join(', ')} WHERE id = ?`).run(...args);
      return this.findUnique({ id: where.id });
    },
    delete(where: { id: string }) {
      db.prepare('DELETE FROM equipment WHERE id = ?').run(where.id);
      return { success: true };
    },
  },

  project: {
    findMany(params?: { where?: { studentId?: string; departmentId?: string } }) {
      let sql = `
        SELECT p.*, d.name as department_name, u.name as student_name
        FROM projects p
        JOIN departments d ON p.department_id = d.id
        JOIN users u ON p.student_id = u.id
      `;
      const conditions: string[] = [];
      const args: any[] = [];
      if (params?.where?.studentId) {
        conditions.push('p.student_id = ?');
        args.push(params.where.studentId);
      }
      if (params?.where?.departmentId) {
        conditions.push('p.department_id = ?');
        args.push(params.where.departmentId);
      }
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      sql += ' ORDER BY p.created_at DESC';
      const rows = db.prepare(sql).all(...args) as any[];
      return rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        departmentId: r.department_id,
        studentId: r.student_id,
        deadline: new Date(r.deadline),
        techStack: r.tech_stack,
        department: { id: r.department_id, name: r.department_name },
        student: { id: r.student_id, name: r.student_name },
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at),
      }));
    },
    findUnique(where: { id: string }) {
      const row = db.prepare(`
        SELECT p.*, d.name as department_name, u.name as student_name
        FROM projects p
        JOIN departments d ON p.department_id = d.id
        JOIN users u ON p.student_id = u.id
        WHERE p.id = ?
      `).get(where.id) as any;
      if (!row) return null;
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        departmentId: row.department_id,
        studentId: row.student_id,
        deadline: new Date(row.deadline),
        techStack: row.tech_stack,
        department: { id: row.department_id, name: row.department_name },
        student: { id: row.student_id, name: row.student_name },
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    },
    create(data: any) {
      const id = data.id || generateId();
      db.prepare(`
        INSERT INTO projects (id, title, description, category, department_id, student_id, deadline, tech_stack)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, data.title, data.description, data.category, data.departmentId, data.studentId,
        new Date(data.deadline).toISOString(), data.techStack || null
      );
      return this.findUnique({ id });
    },
  },

  bookingRequest: {
    findMany(params?: { where?: any; orderBy?: any }) {
      let sql = `
        SELECT br.*,
               p.title as project_title, p.description as project_description, p.category as project_category, p.tech_stack,
               e.name as equipment_name, e.equipment_code, e.specifications as equipment_specs, e.max_duration_hours,
               e.department_id as equip_dept_id, ed.name as equip_dept_name,
               c.name as category_name, c.slug as category_slug,
               u.name as student_name, u.email as student_email
        FROM booking_requests br
        JOIN projects p ON br.project_id = p.id
        JOIN equipment e ON br.equipment_id = e.id
        JOIN departments ed ON e.department_id = ed.id
        JOIN equipment_categories c ON e.category_id = c.id
        JOIN users u ON br.student_id = u.id
      `;
      const conditions: string[] = [];
      const args: any[] = [];

      if (params?.where?.studentId) {
        conditions.push('br.student_id = ?');
        args.push(params.where.studentId);
      }
      if (params?.where?.equipmentId) {
        conditions.push('br.equipment_id = ?');
        args.push(params.where.equipmentId);
      }
      if (params?.where?.status) {
        if (Array.isArray(params.where.status)) {
          conditions.push(`br.status IN (${params.where.status.map(() => '?').join(',')})`);
          args.push(...params.where.status);
        } else {
          conditions.push('br.status = ?');
          args.push(params.where.status);
        }
      }
      if (params?.where?.conflictGroupId) {
        conditions.push('br.conflict_group_id = ?');
        args.push(params.where.conflictGroupId);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY br.created_at DESC';

      const rows = db.prepare(sql).all(...args) as any[];
      return rows.map(r => ({
        id: r.id,
        projectId: r.project_id,
        equipmentId: r.equipment_id,
        studentId: r.student_id,
        requestedDate: new Date(r.requested_date),
        startTime: r.start_time,
        endTime: r.end_time,
        durationMinutes: r.duration_minutes,
        projectDeadline: new Date(r.project_deadline),
        technicalRequirements: r.technical_requirements,
        accessReason: r.access_reason,
        status: r.status,
        priorityScore: r.priority_score,
        facultyNotes: r.faculty_notes,
        rejectionReason: r.rejection_reason,
        conflictGroupId: r.conflict_group_id,
        project: {
          id: r.project_id,
          title: r.project_title,
          description: r.project_description,
          category: r.project_category,
          deadline: new Date(r.project_deadline),
          techStack: r.tech_stack,
        },
        equipment: {
          id: r.equipment_id,
          equipmentCode: r.equipment_code,
          name: r.equipment_name,
          specifications: r.equipment_specs,
          maxDurationHours: r.max_duration_hours,
          department: { name: r.equip_dept_name },
          category: { name: r.category_name, slug: r.category_slug },
        },
        student: {
          id: r.student_id,
          name: r.student_name,
          email: r.student_email,
        },
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at),
      }));
    },
    findUnique(where: { id: string }) {
      const sql = `
        SELECT br.*,
               p.title as project_title, p.description as project_description, p.category as project_category, p.tech_stack,
               e.name as equipment_name, e.equipment_code, e.specifications as equipment_specs, e.max_duration_hours,
               e.department_id as equip_dept_id, ed.name as equip_dept_name,
               c.name as category_name, c.slug as category_slug,
               u.name as student_name, u.email as student_email
        FROM booking_requests br
        JOIN projects p ON br.project_id = p.id
        JOIN equipment e ON br.equipment_id = e.id
        JOIN departments ed ON e.department_id = ed.id
        JOIN equipment_categories c ON e.category_id = c.id
        JOIN users u ON br.student_id = u.id
        WHERE br.id = ?
      `;
      const r = db.prepare(sql).get(where.id) as any;
      if (!r) return null;
      return {
        id: r.id,
        projectId: r.project_id,
        equipmentId: r.equipment_id,
        studentId: r.student_id,
        requestedDate: new Date(r.requested_date),
        startTime: r.start_time,
        endTime: r.end_time,
        durationMinutes: r.duration_minutes,
        projectDeadline: new Date(r.project_deadline),
        technicalRequirements: r.technical_requirements,
        accessReason: r.access_reason,
        status: r.status,
        priorityScore: r.priority_score,
        facultyNotes: r.faculty_notes,
        rejectionReason: r.rejection_reason,
        conflictGroupId: r.conflict_group_id,
        project: {
          id: r.project_id,
          title: r.project_title,
          description: r.project_description,
          category: r.project_category,
          deadline: new Date(r.project_deadline),
          techStack: r.tech_stack,
        },
        equipment: {
          id: r.equipment_id,
          equipmentCode: r.equipment_code,
          name: r.equipment_name,
          specifications: r.equipment_specs,
          maxDurationHours: r.max_duration_hours,
          department: { name: r.equip_dept_name },
          category: { name: r.category_name, slug: r.category_slug },
        },
        student: {
          id: r.student_id,
          name: r.student_name,
          email: r.student_email,
        },
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at),
      };
    },
    create(data: any) {
      const id = data.id || generateId();
      db.prepare(`
        INSERT INTO booking_requests (
          id, project_id, equipment_id, student_id, requested_date,
          start_time, end_time, duration_minutes, project_deadline,
          technical_requirements, access_reason, status, priority_score,
          conflict_group_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, data.projectId, data.equipmentId, data.studentId,
        new Date(data.requestedDate).toISOString(),
        data.startTime, data.endTime, data.durationMinutes,
        new Date(data.projectDeadline).toISOString(),
        data.technicalRequirements || null, data.accessReason,
        data.status || 'PENDING', data.priorityScore || null,
        data.conflictGroupId || null
      );
      return this.findUnique({ id });
    },
    update(where: { id: string }, data: any) {
      const fields: string[] = [];
      const args: any[] = [];

      if (data.status !== undefined) { fields.push('status = ?'); args.push(data.status); }
      if (data.priorityScore !== undefined) { fields.push('priority_score = ?'); args.push(data.priorityScore); }
      if (data.facultyNotes !== undefined) { fields.push('faculty_notes = ?'); args.push(data.facultyNotes); }
      if (data.rejectionReason !== undefined) { fields.push('rejection_reason = ?'); args.push(data.rejectionReason); }
      if (data.conflictGroupId !== undefined) { fields.push('conflict_group_id = ?'); args.push(data.conflictGroupId); }

      fields.push("updated_at = datetime('now')");
      args.push(where.id);

      db.prepare(`UPDATE booking_requests SET ${fields.join(', ')} WHERE id = ?`).run(...args);
      return this.findUnique({ id: where.id });
    },
  },

  booking: {
    findMany(params?: { where?: any; orderBy?: any }) {
      let sql = `
        SELECT b.*,
               e.name as equipment_name, e.equipment_code, ed.name as dept_name,
               u.name as student_name, u.email as student_email,
               p.title as project_title
        FROM bookings b
        JOIN equipment e ON b.equipment_id = e.id
        JOIN departments ed ON e.department_id = ed.id
        JOIN users u ON b.student_id = u.id
        JOIN booking_requests br ON b.booking_request_id = br.id
        JOIN projects p ON br.project_id = p.id
      `;
      const conditions: string[] = [];
      const args: any[] = [];

      if (params?.where?.studentId) {
        conditions.push('b.student_id = ?');
        args.push(params.where.studentId);
      }
      if (params?.where?.equipmentId) {
        conditions.push('b.equipment_id = ?');
        args.push(params.where.equipmentId);
      }
      if (params?.where?.status) {
        conditions.push('b.status = ?');
        args.push(params.where.status);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY b.scheduled_date DESC, b.start_time DESC';

      const rows = db.prepare(sql).all(...args) as any[];
      return rows.map(r => ({
        id: r.id,
        bookingRequestId: r.booking_request_id,
        equipmentId: r.equipment_id,
        studentId: r.student_id,
        scheduledDate: new Date(r.scheduled_date),
        startTime: r.start_time,
        endTime: r.end_time,
        status: r.status,
        equipment: {
          id: r.equipment_id,
          name: r.equipment_name,
          equipmentCode: r.equipment_code,
          department: { name: r.dept_name },
        },
        student: { id: r.student_id, name: r.student_name, email: r.student_email },
        projectTitle: r.project_title,
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at),
      }));
    },
    create(data: any) {
      const id = data.id || generateId();
      db.prepare(`
        INSERT INTO bookings (id, booking_request_id, equipment_id, student_id, scheduled_date, start_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, data.bookingRequestId, data.equipmentId, data.studentId,
        new Date(data.scheduledDate).toISOString(),
        data.startTime, data.endTime, data.status || 'ACTIVE'
      );
      return id;
    },
    update(where: { id: string }, data: { status: string }) {
      db.prepare("UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?").run(data.status, where.id);
      return { success: true };
    },
  },

  maintenanceSchedule: {
    findMany(params?: { where?: { equipmentId?: string; status?: string } }) {
      let sql = 'SELECT m.*, e.name as equipment_name FROM maintenance_schedules m JOIN equipment e ON m.equipment_id = e.id';
      const conditions: string[] = [];
      const args: any[] = [];
      if (params?.where?.equipmentId) {
        conditions.push('m.equipment_id = ?');
        args.push(params.where.equipmentId);
      }
      if (params?.where?.status) {
        conditions.push('m.status = ?');
        args.push(params.where.status);
      }
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      sql += ' ORDER BY m.start_date ASC';
      const rows = db.prepare(sql).all(...args) as any[];
      return rows.map(r => ({
        id: r.id,
        equipmentId: r.equipment_id,
        equipmentName: r.equipment_name,
        title: r.title,
        reason: r.reason,
        startDate: new Date(r.start_date),
        endDate: new Date(r.end_date),
        status: r.status,
      }));
    },
    create(data: any) {
      const id = data.id || generateId();
      db.prepare(`
        INSERT INTO maintenance_schedules (id, equipment_id, title, reason, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, data.equipmentId, data.title, data.reason,
        new Date(data.startDate).toISOString(),
        new Date(data.endDate).toISOString(),
        data.status || 'SCHEDULED'
      );
      // Automatically update equipment status to MAINTENANCE if currently active
      db.prepare("UPDATE equipment SET status = 'MAINTENANCE' WHERE id = ?").run(data.equipmentId);
      return { id };
    },
    update(where: { id: string }, data: any) {
      db.prepare("UPDATE maintenance_schedules SET status = ?, updated_at = datetime('now') WHERE id = ?").run(data.status, where.id);
      if (data.status === 'COMPLETED') {
        const m = db.prepare('SELECT equipment_id FROM maintenance_schedules WHERE id = ?').get(where.id) as any;
        if (m) {
          db.prepare("UPDATE equipment SET status = 'AVAILABLE' WHERE id = ?").run(m.equipment_id);
        }
      }
      return { success: true };
    },
  },

  allocationRecommendation: {
    findUnique(where: { conflictGroupId: string }) {
      const row = db.prepare('SELECT * FROM allocation_recommendations WHERE conflict_group_id = ?').get(where.conflictGroupId) as any;
      if (!row) return null;
      return {
        id: row.id,
        conflictGroupId: row.conflict_group_id,
        equipmentId: row.equipment_id,
        winningRequestId: row.winning_request_id,
        recommendedDate: new Date(row.recommended_date),
        recommendedStartTime: row.recommended_start_time,
        recommendedEndTime: row.recommended_end_time,
        priorityScoreBreakdown: JSON.parse(row.priority_score_breakdown),
        fairnessScore: row.fairness_score,
        aiExplanation: row.ai_explanation,
        alternativeOptionsJson: JSON.parse(row.alternative_options_json),
        status: row.status,
        createdAt: new Date(row.created_at),
      };
    },
    findMany() {
      const rows = db.prepare('SELECT * FROM allocation_recommendations ORDER BY created_at DESC').all() as any[];
      return rows.map(r => ({
        id: r.id,
        conflictGroupId: r.conflict_group_id,
        equipmentId: r.equipment_id,
        winningRequestId: r.winning_request_id,
        recommendedDate: new Date(r.recommended_date),
        recommendedStartTime: r.recommended_start_time,
        recommendedEndTime: r.recommended_end_time,
        priorityScoreBreakdown: JSON.parse(r.priority_score_breakdown),
        fairnessScore: r.fairness_score,
        aiExplanation: r.ai_explanation,
        alternativeOptionsJson: JSON.parse(r.alternative_options_json),
        status: r.status,
        createdAt: new Date(r.created_at),
      }));
    },
    upsert(data: any) {
      const existing = db.prepare('SELECT id FROM allocation_recommendations WHERE conflict_group_id = ?').get(data.conflictGroupId) as any;
      if (existing) {
        db.prepare(`
          UPDATE allocation_recommendations SET
            winning_request_id = ?, recommended_date = ?,
            recommended_start_time = ?, recommended_end_time = ?,
            priority_score_breakdown = ?, fairness_score = ?,
            ai_explanation = ?, alternative_options_json = ?,
            status = ?, updated_at = datetime('now')
          WHERE conflict_group_id = ?
        `).run(
          data.winningRequestId, new Date(data.recommendedDate).toISOString(),
          data.recommendedStartTime, data.recommendedEndTime,
          JSON.stringify(data.priorityScoreBreakdown), data.fairnessScore,
          data.aiExplanation, JSON.stringify(data.alternativeOptionsJson),
          data.status || 'PENDING_REVIEW', data.conflictGroupId
        );
        return existing.id;
      } else {
        const id = generateId();
        db.prepare(`
          INSERT INTO allocation_recommendations (
            id, conflict_group_id, equipment_id, winning_request_id,
            recommended_date, recommended_start_time, recommended_end_time,
            priority_score_breakdown, fairness_score, ai_explanation,
            alternative_options_json, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id, data.conflictGroupId, data.equipmentId, data.winningRequestId,
          new Date(data.recommendedDate).toISOString(),
          data.recommendedStartTime, data.recommendedEndTime,
          JSON.stringify(data.priorityScoreBreakdown), data.fairnessScore,
          data.aiExplanation, JSON.stringify(data.alternativeOptionsJson),
          data.status || 'PENDING_REVIEW'
        );
        return id;
      }
    },
  },

  notification: {
    findMany(params?: { where?: { userId?: string } }) {
      let sql = 'SELECT * FROM notifications';
      const args: any[] = [];
      if (params?.where?.userId) {
        sql += ' WHERE user_id = ?';
        args.push(params.where.userId);
      }
      sql += ' ORDER BY created_at DESC LIMIT 50';
      const rows = db.prepare(sql).all(...args) as any[];
      return rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        title: r.title,
        message: r.message,
        type: r.type,
        linkUrl: r.link_url,
        isRead: Boolean(r.is_read),
        createdAt: new Date(r.created_at),
      }));
    },
    create(data: { id?: string; userId: string; title: string; message: string; type: string; linkUrl?: string }) {
      const id = data.id || generateId();
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, link_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, data.userId, data.title, data.message, data.type, data.linkUrl || null);
      return { id };
    },
    markAsRead(id: string) {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
      return { success: true };
    },
    markAllAsRead(userId: string) {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
      return { success: true };
    },
  },

  auditLog: {
    findMany(limit = 100) {
      const rows = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(limit) as any[];
      return rows.map(r => ({
        id: r.id,
        action: r.action,
        entityType: r.entity_type,
        entityId: r.entity_id,
        actorName: r.actor_name,
        actorRole: r.actor_role,
        details: r.details,
        createdAt: new Date(r.created_at),
      }));
    },
    create(data: { action: string; entityType: string; entityId?: string; actorName: string; actorRole: string; details?: string }) {
      const id = generateId();
      db.prepare(`
        INSERT INTO audit_logs (id, action, entity_type, entity_id, actor_name, actor_role, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, data.action, data.entityType, data.entityId || null, data.actorName, data.actorRole, data.details || null);
      return { id };
    },
  },

  schedulingWeightConfig: {
    get() {
      const row = db.prepare('SELECT * FROM scheduling_weight_configs WHERE id = ?').get('default-config') as any;
      if (!row) {
        return {
          id: 'default-config',
          deadlineWeight: 0.35,
          compatibilityWeight: 0.25,
          waitingTimeWeight: 0.15,
          fairnessWeight: 0.15,
          feasibilityWeight: 0.10,
        };
      }
      return {
        id: row.id,
        deadlineWeight: row.deadline_weight,
        compatibilityWeight: row.compatibility_weight,
        waitingTimeWeight: row.waiting_time_weight,
        fairnessWeight: row.fairness_weight,
        feasibilityWeight: row.feasibility_weight,
      };
    },
    update(weights: { deadlineWeight: number; compatibilityWeight: number; waitingTimeWeight: number; fairnessWeight: number; feasibilityWeight: number }) {
      db.prepare(`
        INSERT INTO scheduling_weight_configs (id, deadline_weight, compatibility_weight, waiting_time_weight, fairness_weight, feasibility_weight, updated_at)
        VALUES ('default-config', ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          deadline_weight = excluded.deadline_weight,
          compatibility_weight = excluded.compatibility_weight,
          waiting_time_weight = excluded.waiting_time_weight,
          fairness_weight = excluded.fairness_weight,
          feasibility_weight = excluded.feasibility_weight,
          updated_at = datetime('now')
      `).run(
        weights.deadlineWeight, weights.compatibilityWeight, weights.waitingTimeWeight,
        weights.fairnessWeight, weights.feasibilityWeight
      );
      return this.get();
    },
  },
};

export default prisma;
