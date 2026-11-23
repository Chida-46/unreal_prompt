import {
  Equipment,
  EquipmentCategory,
  Project,
  BookingRequest,
  Booking,
  AllocationRecommendation,
  NotificationItem,
  AnalyticsData,
  Department,
  Laboratory,
  User,
  SchedulingWeights,
  AIStatus,
  ProjectAnalysisResult,
  EquipmentRecommendationResult,
  ConflictExplanationResult,
  FacultySummaryResult,
} from '../types';

const envApiUrl = (import.meta as any).env?.VITE_API_URL;
const API_BASE = envApiUrl ? `${envApiUrl.replace(/\/$/, '')}/api` : '/api';

function getHeaders(currentUser?: User | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (currentUser) {
    headers['x-user-id'] = currentUser.id;
    headers['x-user-name'] = currentUser.name;
    headers['x-user-role'] = currentUser.role;
    headers['x-actor-name'] = currentUser.name;
  }
  return headers;
}

export const api = {
  // Users (Demo Accounts)
  async getUsers(role?: string): Promise<User[]> {
    const url = role ? `${API_BASE}/users?role=${role}` : `${API_BASE}/users`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // Equipment
  async getEquipment(params?: {
    search?: string;
    departmentId?: string;
    categoryId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Equipment[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.status) query.append('status', params.status);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

    const res = await fetch(`${API_BASE}/equipment?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch equipment');
    return res.json();
  },

  async getEquipmentById(id: string): Promise<Equipment> {
    const res = await fetch(`${API_BASE}/equipment/${id}`);
    if (!res.ok) throw new Error('Failed to fetch equipment details');
    return res.json();
  },

  async getCategories(): Promise<EquipmentCategory[]> {
    const res = await fetch(`${API_BASE}/equipment/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createEquipment(data: any, currentUser?: User | null): Promise<Equipment> {
    const res = await fetch(`${API_BASE}/equipment`, {
      method: 'POST',
      headers: getHeaders(currentUser),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create equipment');
    }
    return res.json();
  },

  async updateEquipment(id: string, data: any, currentUser?: User | null): Promise<Equipment> {
    const res = await fetch(`${API_BASE}/equipment/${id}`, {
      method: 'PUT',
      headers: getHeaders(currentUser),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update equipment');
    }
    return res.json();
  },

  async deleteEquipment(id: string, currentUser?: User | null): Promise<void> {
    const res = await fetch(`${API_BASE}/equipment/${id}`, {
      method: 'DELETE',
      headers: getHeaders(currentUser),
    });
    if (!res.ok) throw new Error('Failed to delete equipment');
  },

  // Projects
  async getProjects(params?: { studentId?: string; departmentId?: string }): Promise<Project[]> {
    const query = new URLSearchParams();
    if (params?.studentId) query.append('studentId', params.studentId);
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    const res = await fetch(`${API_BASE}/projects?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async createProject(data: any, currentUser?: User | null): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getHeaders(currentUser),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create project');
    }
    return res.json();
  },

  // Bookings
  async createBookingRequest(data: any, currentUser?: User | null): Promise<BookingRequest> {
    const res = await fetch(`${API_BASE}/bookings/request`, {
      method: 'POST',
      headers: getHeaders(currentUser),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit booking request');
    }
    return res.json();
  },

  async getBookingRequests(params?: { studentId?: string; status?: string; equipmentId?: string }): Promise<BookingRequest[]> {
    const query = new URLSearchParams();
    if (params?.studentId) query.append('studentId', params.studentId);
    if (params?.status) query.append('status', params.status);
    if (params?.equipmentId) query.append('equipmentId', params.equipmentId);
    const res = await fetch(`${API_BASE}/bookings/requests?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch booking requests');
    return res.json();
  },

  async getBookings(params?: { studentId?: string; status?: string; equipmentId?: string }): Promise<Booking[]> {
    const query = new URLSearchParams();
    if (params?.studentId) query.append('studentId', params.studentId);
    if (params?.status) query.append('status', params.status);
    if (params?.equipmentId) query.append('equipmentId', params.equipmentId);
    const res = await fetch(`${API_BASE}/bookings?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },

  async cancelBookingRequest(requestId: string, studentId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/bookings/requests/${requestId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to cancel booking request');
    }
    return res.json();
  },

  // Scheduling Recommendations
  async getRecommendations(): Promise<AllocationRecommendation[]> {
    const res = await fetch(`${API_BASE}/scheduling/recommendations`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  async getSchedulingWeights(): Promise<SchedulingWeights> {
    const res = await fetch(`${API_BASE}/scheduling/weights`);
    if (!res.ok) throw new Error('Failed to fetch weights');
    return res.json();
  },

  async updateSchedulingWeights(weights: SchedulingWeights, currentUser?: User | null): Promise<SchedulingWeights> {
    const res = await fetch(`${API_BASE}/scheduling/weights`, {
      method: 'PUT',
      headers: getHeaders(currentUser),
      body: JSON.stringify(weights),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update weights');
    }
    return res.json();
  },

  // Faculty
  async getFacultyRequests(departmentId?: string): Promise<BookingRequest[]> {
    const url = departmentId ? `${API_BASE}/faculty/requests?departmentId=${departmentId}` : `${API_BASE}/faculty/requests`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch faculty pending requests');
    return res.json();
  },

  async processFacultyDecision(
    requestId: string,
    decision: { action: 'APPROVE' | 'REJECT' | 'SUGGEST_ALTERNATIVE'; facultyNotes?: string; rejectionReason?: string },
    currentUser?: User | null
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/faculty/requests/${requestId}/decision`, {
      method: 'POST',
      headers: getHeaders(currentUser),
      body: JSON.stringify(decision),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record faculty decision');
    }
    return res.json();
  },

  // Notifications
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    const url = userId ? `${API_BASE}/notifications?userId=${userId}` : `${API_BASE}/notifications`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  },

  // Admin & Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch(`${API_BASE}/admin/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async getAuditLogs(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE}/admin/departments`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },

  async createDepartment(data: any, currentUser?: User | null): Promise<Department> {
    const res = await fetch(`${API_BASE}/admin/departments`, {
      method: 'POST',
      headers: getHeaders(currentUser),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create department');
    }
    return res.json();
  },

  async getLaboratories(departmentId?: string): Promise<Laboratory[]> {
    const url = departmentId ? `${API_BASE}/admin/laboratories?departmentId=${departmentId}` : `${API_BASE}/admin/laboratories`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch laboratories');
    return res.json();
  },

  async createLaboratory(data: any, currentUser?: User | null): Promise<Laboratory> {
    const res = await fetch(`${API_BASE}/admin/laboratories`, {
      method: 'POST',
      headers: getHeaders(currentUser),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create laboratory');
    }
    return res.json();
  },

  async getMaintenanceSchedules(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/maintenance`);
    if (!res.ok) throw new Error('Failed to fetch maintenance');
    return res.json();
  },

  async createMaintenanceSchedule(data: any, currentUser?: User | null): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/maintenance`, {
      method: 'POST',
      headers: getHeaders(currentUser),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to schedule maintenance');
    }
    return res.json();
  },

  async updateMaintenanceStatus(id: string, status: string, currentUser?: User | null): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/maintenance/${id}`, {
      method: 'PUT',
      headers: getHeaders(currentUser),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update maintenance');
    return res.json();
  },

  // ===========================================================================
  // Generative AI Services
  // ===========================================================================
  async getAIStatus(): Promise<AIStatus> {
    const res = await fetch(`${API_BASE}/ai/status`);
    if (!res.ok) throw new Error('Failed to fetch AI status');
    return res.json();
  },

  async analyzeProject(description: string): Promise<ProjectAnalysisResult> {
    const res = await fetch(`${API_BASE}/ai/analyze-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to analyze project requirements');
    }
    return res.json();
  },

  async recommendEquipment(query: string): Promise<EquipmentRecommendationResult> {
    const res = await fetch(`${API_BASE}/ai/recommend-equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to recommend equipment');
    }
    return res.json();
  },

  async explainConflict(conflictGroupId: string): Promise<ConflictExplanationResult> {
    const res = await fetch(`${API_BASE}/ai/explain-conflict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conflictGroupId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to explain scheduling conflict');
    }
    return res.json();
  },

  async summarizeFacultyRequest(requestId: string): Promise<FacultySummaryResult> {
    const res = await fetch(`${API_BASE}/ai/summarize-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate faculty request summary');
    }
    return res.json();
  },
};
