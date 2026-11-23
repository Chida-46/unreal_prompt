import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, useRole } from './context/RoleContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Banner } from './components/Banner';
import { RoleDashboard } from './components/RoleDashboard';

// Pages
import { LandingPage } from './pages/LandingPage';
import { EquipmentDiscoveryPage } from './pages/EquipmentDiscoveryPage';
import { EquipmentDetailsPage } from './pages/EquipmentDetailsPage';
import { BookingRequestPage } from './pages/BookingRequestPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { ProjectManagementPage } from './pages/ProjectManagementPage';
import { AISchedulingPage } from './pages/AISchedulingPage';
import { FacultyApprovalsPage } from './pages/FacultyApprovalsPage';
import { AdminEquipmentPage } from './pages/AdminEquipmentPage';
import { AdminDepartmentsPage } from './pages/AdminDepartmentsPage';
import { AdminMaintenancePage } from './pages/AdminMaintenancePage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

// Route wrappers that ensure role synchronization and instant dashboard rendering
const StudentRoute: React.FC = () => {
  const { role, setRole } = useRole();
  useEffect(() => {
    if (role !== 'STUDENT') {
      setRole('STUDENT');
    }
  }, [role, setRole]);
  return <RoleDashboard />;
};

const FacultyRoute: React.FC = () => {
  const { role, setRole } = useRole();
  useEffect(() => {
    if (role !== 'FACULTY') {
      setRole('FACULTY');
    }
  }, [role, setRole]);
  return <RoleDashboard />;
};

const AdminRoute: React.FC = () => {
  const { role, setRole } = useRole();
  useEffect(() => {
    if (role !== 'ADMIN') {
      setRole('ADMIN');
    }
  }, [role, setRole]);
  return <RoleDashboard />;
};

export const App: React.FC = () => {
  return (
    <RoleProvider>
      <NotificationProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-xs font-semibold"
            >
              Skip to main content
            </a>
            <Banner />
            <Navbar />
            <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
              <Routes>
                {/* Public & Student Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<RoleDashboard />} />
                <Route path="/student" element={<StudentRoute />} />
                <Route path="/equipment" element={<EquipmentDiscoveryPage />} />
                <Route path="/equipment/:id" element={<EquipmentDetailsPage />} />
                <Route path="/book" element={<BookingRequestPage />} />
                <Route path="/book/:equipmentId" element={<BookingRequestPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/projects" element={<ProjectManagementPage />} />
                <Route path="/ai-recommendations" element={<AISchedulingPage />} />

                {/* Faculty Routes */}
                <Route path="/faculty" element={<FacultyRoute />} />
                <Route path="/faculty/approvals" element={<FacultyApprovalsPage />} />

                {/* Administrator Routes */}
                <Route path="/admin" element={<AdminRoute />} />
                <Route path="/admin/equipment" element={<AdminEquipmentPage />} />
                <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
                <Route path="/admin/maintenance" element={<AdminMaintenancePage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />

                {/* Fallback to Landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </RoleProvider>
  );
};

export default App;
