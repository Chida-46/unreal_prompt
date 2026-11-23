import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { RoleProvider, useRole } from '../context/RoleContext';
import { RoleSelector } from '../components/RoleSelector';
import { StatusBadge } from '../components/StatusBadge';

// Mock fetch for isolated unit testing
beforeEach(() => {
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
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  }));
});

describe('Role Selection Without Authentication', () => {
  it('should render role selector with current demo role', async () => {
    render(
      <RoleProvider>
        <RoleSelector />
      </RoleProvider>
    );

    const button = screen.getByLabelText(/Switch demonstration role and profile/i);
    expect(button).toBeInTheDocument();
  });

  it('should open role selector menu and switch roles instantly without password or login prompt', async () => {
    render(
      <RoleProvider>
        <RoleSelector />
      </RoleProvider>
    );

    const button = screen.getByLabelText(/Switch demonstration role and profile/i);
    fireEvent.click(button);

    // Verify Faculty and Administrator options are listed
    expect(screen.getByText('Faculty')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();

    // Click Faculty
    fireEvent.click(screen.getByText('Faculty'));
    expect(localStorage.getItem('lablink_demo_role')).toBe('FACULTY');
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

    // Check title and tagline
    expect(screen.getAllByText(/Making College Laboratories/i).length).toBeGreaterThanOrEqual(1);

    // Ensure NO login, password, or registration buttons exist
    expect(screen.queryByRole('button', { name: /Sign in/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Register/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Log in/i })).toBeNull();
    expect(screen.queryByPlaceholderText(/password/i)).toBeNull();

    // Direct entry button must exist
    expect(screen.getByText(/Explore Lab Catalog/i)).toBeInTheDocument();
  });
});
