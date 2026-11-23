import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from '../App';
import { RoleProvider, useRole } from '../context/RoleContext';
import { RoleSelector } from '../components/RoleSelector';
import { RoleDashboard } from '../components/RoleDashboard';
import { StatusBadge } from '../components/StatusBadge';
import { StudentDashboard } from '../pages/StudentDashboard';
import { FacultyDashboard } from '../pages/FacultyDashboard';
import { AdminDashboard } from '../pages/AdminDashboard';

// Mock fetch for isolated unit testing
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/api/users')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 'student-1', name: 'Aarav Sharma', role: 'STUDENT', email: 'aarav@campus.edu' },
          { id: 'student-2', name: 'Priya Patel', role: 'STUDENT', email: 'priya@campus.edu' },
          { id: 'faculty-1', name: 'Dr. Vikram Sen', role: 'FACULTY', email: 'vikram@campus.edu' },
          { id: 'admin-1', name: 'Campus Facilities Admin', role: 'ADMIN', email: 'admin@campus.edu' },
        ]),
      });
    }
    if (url.includes('/api/notifications')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes('/api/equipment/categories')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes('/api/equipment')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes('/api/faculty/requests')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes('/api/bookings/requests')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes('/api/bookings')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes('/api/projects')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes('/api/admin/analytics')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          summary: {
            totalEquipment: 12,
            availableEquipment: 12,
            inUseEquipment: 0,
            activeBookings: 0,
            pendingRequests: 0,
            utilizationPercentage: 0,
          },
          departmentUtilization: [],
          mostRequestedEquipment: [],
        }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  }));
});

describe('Role Selection & Immediate Switching (Bug 1 Fix)', () => {
  it('should render role selector with current demo role', async () => {
    render(
      <MemoryRouter>
        <RoleProvider>
          <RoleSelector />
        </RoleProvider>
      </MemoryRouter>
    );

    const button = screen.getByLabelText(/Switch demonstration role and profile/i);
    expect(button).toBeInTheDocument();
  });

  it('should switch role and immediately update shared state without login prompt', async () => {
    render(
      <MemoryRouter>
        <RoleProvider>
          <RoleSelector />
        </RoleProvider>
      </MemoryRouter>
    );

    const button = screen.getByLabelText(/Switch demonstration role and profile/i);
    fireEvent.click(button);

    // Verify Faculty option is listed
    const facultyBtn = screen.getByText('Faculty');
    expect(facultyBtn).toBeInTheDocument();

    // Click Faculty
    fireEvent.click(facultyBtn);
    expect(localStorage.getItem('lablink_demo_role')).toBe('FACULTY');
  });

  it('RoleDashboard should immediately render corresponding role dashboard and unmount previous view', async () => {
    const TestComponent = () => {
      const { setRole } = useRole();
      return (
        <div>
          <button onClick={() => setRole('STUDENT')}>Set Student</button>
          <button onClick={() => setRole('FACULTY')}>Set Faculty</button>
          <button onClick={() => setRole('ADMIN')}>Set Admin</button>
          <RoleDashboard />
        </div>
      );
    };

    render(
      <MemoryRouter>
        <RoleProvider>
          <TestComponent />
        </RoleProvider>
      </MemoryRouter>
    );

    // Initial default is STUDENT
    await waitFor(() => {
      expect(screen.getByText(/Student Workspace/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Faculty Reviewer Portal/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Administrative Control Console/i)).not.toBeInTheDocument();

    // Switch to Faculty
    fireEvent.click(screen.getByText('Set Faculty'));
    await waitFor(() => {
      expect(screen.getByText(/Faculty Reviewer Portal/i)).toBeInTheDocument();
    });
    // Ensure previous Student Workspace is gone
    expect(screen.queryByText(/Student Workspace/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Administrative Control Console/i)).not.toBeInTheDocument();

    // Switch to Admin
    fireEvent.click(screen.getByText('Set Admin'));
    await waitFor(() => {
      expect(screen.getByText(/Administrative Control Console/i)).toBeInTheDocument();
    });
    // Ensure previous Faculty portal is gone
    expect(screen.queryByText(/Faculty Reviewer Portal/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Student Workspace/i)).not.toBeInTheDocument();

    // Switch back to Student
    fireEvent.click(screen.getByText('Set Student'));
    await waitFor(() => {
      expect(screen.getByText(/Student Workspace/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Administrative Control Console/i)).not.toBeInTheDocument();
  });
});

describe('Equipment Booking Count Logic (Bug 2 Fix)', () => {
  it('should display "0 Equipment Booked" when user has 0 bookings', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/faculty/requests')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes('/api/bookings/requests')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/bookings')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/projects')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/equipment')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }));

    render(
      <MemoryRouter>
        <RoleProvider>
          <StudentDashboard />
        </RoleProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Equipment Booked')).toBeInTheDocument();
    });

    const bookedCard = screen.getByText('Equipment Booked').closest('.rounded-xl');
    expect(bookedCard).toHaveTextContent('0');
  });

  it('should display exactly "1 Equipment Booked" when user has 1 active booking', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/faculty/requests')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes('/api/bookings/requests')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'req-1',
              status: 'APPROVED',
              requestedDate: '2026-11-28',
              startTime: '10:00',
              endTime: '12:00',
              durationMinutes: 120,
              equipment: { id: 'eq-1', name: 'Digital Storage Oscilloscope', equipmentCode: 'EQ-SCOPE', department: { name: 'ECE' }, category: { name: 'Test' } },
              project: { id: 'p-1', title: 'Telemetry' },
              student: { id: 'student-1', name: 'Aarav Sharma' },
            },
          ]),
        });
      }
      if (url.includes('/api/bookings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'book-1',
              bookingRequestId: 'req-1',
              equipmentId: 'eq-1',
              studentId: 'student-1',
              status: 'ACTIVE',
              scheduledDate: '2026-11-28',
              startTime: '10:00',
              endTime: '12:00',
            },
          ]),
        });
      }
      if (url.includes('/api/projects')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/equipment')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }));

    render(
      <MemoryRouter>
        <RoleProvider>
          <StudentDashboard />
        </RoleProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Equipment Booked')).toBeInTheDocument();
    });

    const bookedCard = screen.getByText('Equipment Booked').closest('.rounded-xl');
    expect(bookedCard).toHaveTextContent('1');
  });

  it('should exclude cancelled and rejected bookings from Equipment Booked count', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 'student-1', name: 'Aarav Sharma', role: 'STUDENT', email: 'aarav@campus.edu' },
          ]),
        });
      }
      if (url.includes('/api/faculty/requests')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes('/api/bookings/requests')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 'req-1', status: 'CANCELLED', requestedDate: '2026-11-28', equipment: { name: 'FPGA' }, project: { title: 'Project 1' } },
            { id: 'req-2', status: 'REJECTED', requestedDate: '2026-11-28', equipment: { name: 'Logic Analyzer' }, project: { title: 'Project 1' } },
            { id: 'req-3', status: 'PENDING', requestedDate: '2026-11-28', equipment: { name: 'Jetson' }, project: { title: 'Project 1' } },
          ]),
        });
      }
      if (url.includes('/api/bookings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]), // 0 active bookings
        });
      }
      if (url.includes('/api/projects')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/equipment')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }));

    render(
      <MemoryRouter>
        <RoleProvider>
          <StudentDashboard />
        </RoleProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Equipment Booked')).toBeInTheDocument();
    });

    const bookedCard = screen.getByText('Equipment Booked').closest('.rounded-xl');
    expect(bookedCard).toHaveTextContent('0');

    // Pending requests are counted separately
    const pendingCard = screen.getByText('Pending Requests').closest('.rounded-xl');
    expect(pendingCard).toHaveTextContent('1');
  });
});

describe('Status Badges', () => {
  it('should render correct status badge for all statuses', () => {
    const { rerender } = render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('Pending Review')).toBeInTheDocument();

    rerender(<StatusBadge status="APPROVED" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();

    rerender(<StatusBadge status="CONFLICT_DETECTED" />);
    expect(screen.getByText('Conflict Detected')).toBeInTheDocument();

    rerender(<StatusBadge status="ALTERNATIVE_SUGGESTED" />);
    expect(screen.getByText('Alternative Suggested')).toBeInTheDocument();
  });
});

describe('Landing Page Direct Access', () => {
  it('should render landing page without any login, registration, or password fields', async () => {
    render(<App />);

    expect(screen.queryByPlaceholderText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/login to continue/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument();
  });
});
