-- LabLink SQLite Database Schema

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS laboratories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  department_id TEXT NOT NULL,
  operating_hours TEXT DEFAULT '08:00 - 18:00',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL, -- STUDENT, FACULTY, ADMIN
  avatar TEXT,
  department_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS equipment_categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY,
  equipment_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  department_id TEXT NOT NULL,
  laboratory_id TEXT NOT NULL,
  description TEXT NOT NULL,
  specifications TEXT NOT NULL,
  status TEXT DEFAULT 'AVAILABLE', -- AVAILABLE, IN_USE, MAINTENANCE, RESERVED
  max_duration_hours INTEGER DEFAULT 4,
  requires_approval INTEGER DEFAULT 1,
  model_number TEXT,
  icon_svg TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES equipment_categories(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (laboratory_id) REFERENCES laboratories(id)
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  department_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  deadline TEXT NOT NULL,
  tech_stack TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS booking_requests (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  equipment_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  requested_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  project_deadline TEXT NOT NULL,
  technical_requirements TEXT,
  access_reason TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, CONFLICT_DETECTED, ALTERNATIVE_SUGGESTED, CANCELLED, COMPLETED
  priority_score REAL,
  faculty_notes TEXT,
  rejection_reason TEXT,
  conflict_group_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_request_id TEXT UNIQUE NOT NULL,
  equipment_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, CANCELLED, COMPLETED
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (booking_request_id) REFERENCES booking_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS availability_schedules (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  open_time TEXT DEFAULT '08:00',
  close_time TEXT DEFAULT '18:00',
  is_available INTEGER DEFAULT 1,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL,
  title TEXT NOT NULL,
  reason TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, COMPLETED
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS allocation_recommendations (
  id TEXT PRIMARY KEY,
  conflict_group_id TEXT UNIQUE NOT NULL,
  equipment_id TEXT NOT NULL,
  winning_request_id TEXT NOT NULL,
  recommended_date TEXT NOT NULL,
  recommended_start_time TEXT NOT NULL,
  recommended_end_time TEXT NOT NULL,
  priority_score_breakdown TEXT NOT NULL,
  fairness_score REAL NOT NULL,
  ai_explanation TEXT NOT NULL,
  alternative_options_json TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, ACCEPTED, REJECTED
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- SUBMISSION, APPROVAL, REJECTION, CONFLICT, ALTERNATIVE, CANCELLATION, MAINTENANCE
  link_url TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  details TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scheduling_weight_configs (
  id TEXT PRIMARY KEY,
  deadline_weight REAL DEFAULT 0.35,
  compatibility_weight REAL DEFAULT 0.25,
  waiting_time_weight REAL DEFAULT 0.15,
  fairness_weight REAL DEFAULT 0.15,
  feasibility_weight REAL DEFAULT 0.10,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance and lookup speeds
CREATE INDEX IF NOT EXISTS idx_equipment_dept ON equipment(department_id);
CREATE INDEX IF NOT EXISTS idx_equipment_cat ON equipment(category_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_equip ON booking_requests(equipment_id);
CREATE INDEX IF NOT EXISTS idx_requests_student ON booking_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
