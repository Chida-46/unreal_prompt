import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Banner } from './components/Banner';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { EquipmentDiscoveryPage } from './pages/EquipmentDiscoveryPage';
import { EquipmentDetailsPage } from './pages/EquipmentDetailsPage';
import { BookingRequestPage } from './pages/BookingRequestPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { ProjectManagementPage } from './pages/ProjectManagementPage';
import { AISchedulingPage } from './pages/AISchedulingPage';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { FacultyApprovalsPage } from './pages/FacultyApprovalsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminEquipmentPage } from './pages/AdminEquipmentPage';
import { AdminDepartmentsPage } from './pages/AdminDepartmentsPage';
import { AdminMaintenancePage } from './pages/AdminMaintenancePage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <RoleProvider>
      <NotificationProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            <Banner />
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public & Student Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/equipment" element={<EquipmentDiscoveryPage />} />
                <Route path="/equipment/:id" element={<EquipmentDetailsPage />} />
                <Route path="/book" element={<BookingRequestPage />} />
                <Route path="/book/:equipmentId" element={<BookingRequestPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/projects" element={<ProjectManagementPage />} />
                <Route path="/ai-recommendations" element={<AISchedulingPage />} />

                {/* Faculty Routes */}
                <Route path="/faculty" element={<FacultyDashboard />} />
                <Route path="/faculty/approvals" element={<FacultyApprovalsPage />} />

                {/* Administrator Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
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
