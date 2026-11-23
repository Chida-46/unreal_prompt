import React from 'react';
import { useRole } from '../context/RoleContext';
import { StudentDashboard } from '../pages/StudentDashboard';
import { FacultyDashboard } from '../pages/FacultyDashboard';
import { AdminDashboard } from '../pages/AdminDashboard';

/**
 * RoleDashboard
 * Centralized dynamic dispatcher for role-specific dashboards.
 * Renders the dashboard strictly according to the currently active role in RoleContext.
 * Using a keyed container ensures that switching roles immediately unmounts
 * the previous role's view and state, preventing stale dashboard content.
 */
export const RoleDashboard: React.FC = () => {
  const { role, currentUser } = useRole();

  const key = `${role}-${currentUser?.id || 'demo'}`;

  switch (role) {
    case 'STUDENT':
      return <StudentDashboard key={key} />;
    case 'FACULTY':
      return <FacultyDashboard key={key} />;
    case 'ADMIN':
      return <AdminDashboard key={key} />;
    default:
      return <StudentDashboard key={key} />;
  }
};
