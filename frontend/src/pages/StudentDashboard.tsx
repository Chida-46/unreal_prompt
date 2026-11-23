import React, { useEffect, useState } from 'react';
import { useRole } from '../context/RoleContext';
import { api } from '../services/api';
import { Equipment, BookingRequest, Booking, Project } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { AIProjectAnalyzer } from '../components/AIProjectAnalyzer';
import { AIAssistantChat } from '../components/AIAssistantChat';
import {
  Calendar,
  Clock,
  Search,
  FolderGit2,
  BrainCircuit,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useRole();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [activeBookingsList, setActiveBookingsList] = useState<Booking[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableCount, setAvailableCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    Promise.all([
      api.getBookingRequests({ studentId: currentUser.id }),
      api.getBookings({ studentId: currentUser.id, status: 'ACTIVE' }),
      api.getProjects({ studentId: currentUser.id }),
      api.getEquipment({ status: 'AVAILABLE' }),
    ])
      .then(([reqs, bks, projs, equips]) => {
        setRequests(reqs);
        setActiveBookingsList(bks);
        setProjects(projs);
        setAvailableCount(equips.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentUser]);

  // Active confirmed bookings from database (status = 'ACTIVE')
  // Strictly excludes cancelled, rejected, and pending bookings
  const safeRequests = Array.isArray(requests) ? requests : [];
  const safeBookings = Array.isArray(activeBookingsList) ? activeBookingsList : [];

  const activeBookingsCount = safeBookings.length > 0
    ? safeBookings.filter(b => b.status === 'ACTIVE').length
    : safeRequests.filter(r => r.status === 'APPROVED').length;

  const pendingRequests = safeRequests.filter(r => ['PENDING', 'CONFLICT_DETECTED', 'ALTERNATIVE_SUGGESTED'].includes(r.status));
  const conflictingRequests = safeRequests.filter(r => r.status === 'CONFLICT_DETECTED' || r.status === 'ALTERNATIVE_SUGGESTED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Greeting */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                Student Workspace
              </span>
              <span className="text-xs text-indigo-300">• {currentUser?.department?.name || 'Engineering'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Access specialized laboratory equipment, manage your semester research projects, and track intelligent scheduling slots.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/equipment"
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-semibold text-xs hover:bg-indigo-50 transition shadow-sm flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-indigo-600" />
              <span>Discover Equipment</span>
            </Link>
            <Link
              to="/projects"
              className="px-4 py-2.5 rounded-xl bg-indigo-700/60 text-white font-semibold text-xs hover:bg-indigo-700 transition border border-indigo-500/50 flex items-center gap-1.5"
            >
              <FolderGit2 className="w-4 h-4 text-indigo-300" />
              <span>My Projects</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Conflict / Alternative Alert Callout (If active) */}
      {conflictingRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-amber-900">
                Scheduling Contention on {conflictingRequests.length} of your requests!
              </h2>
              <p className="text-xs text-amber-700 mt-0.5">
                The GenAI allocation engine has evaluated your request alongside competing peers and generated alternative slots or compatible equipment.
              </p>
            </div>
          </div>
          <Link
            to="/ai-recommendations"
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 self-end sm:self-center"
          >
            <span>Inspect Recommendations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Equipment Booked"
          value={activeBookingsCount}
          sublabel={activeBookingsCount === 1 ? '1 active confirmed reservation' : `${activeBookingsCount} active confirmed reservations`}
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests.length}
          sublabel="Under review or AI queuing"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Active Projects"
          value={projects.length}
          sublabel="Created research modules"
          icon={FolderGit2}
          color="indigo"
        />
        <StatCard
          title="Available Hardware"
          value={availableCount}
          sublabel="Ready across 5 departments"
          icon={Sparkles}
          color="blue"
        />
      </div>

      {/* Feature 1: AI Project Requirement Analyzer */}
      <AIProjectAnalyzer />

      {/* Main Content Grid: Recent Requests & Active Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: My Requests, Approvals & Conversational AI Assistant */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Recent Booking Requests</h2>
                <p className="text-xs text-slate-500">Track real-time approval status and conflict detection</p>
              </div>
              <Link to="/my-bookings" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <p>You have not submitted any equipment requests yet.</p>
                  <Link
                    to="/equipment"
                    className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs hover:bg-indigo-100 transition"
                  >
                    <span>Browse Equipment Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                requests.slice(0, 5).map(req => (
                  <div key={req.id} className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{req.equipment?.name || 'Equipment'}</span>
                        <StatusBadge status={req.status} size="sm" />
                      </div>
                      <p className="text-slate-600 mt-1">
                        Project: <strong className="text-slate-800">{req.project?.title || 'Project'}</strong>
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-slate-500 text-[11px]">
                        <span>Date: <strong>{new Date(req.requestedDate).toISOString().split('T')[0]}</strong></span>
                        <span>Time: <strong>{req.startTime} - {req.endTime}</strong></span>
                        <span>Dept: <strong>{req.equipment?.department?.name || 'Department'}</strong></span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {req.status === 'CONFLICT_DETECTED' || req.status === 'ALTERNATIVE_SUGGESTED' ? (
                        <Link
                          to="/ai-recommendations"
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition flex items-center gap-1 text-[11px]"
                        >
                          <BrainCircuit className="w-3.5 h-3.5" />
                          <span>AI Alternatives</span>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Feature 2: Conversational AI Equipment Recommendation Assistant */}
          <AIAssistantChat />
        </div>

        {/* Right Column: Quick Actions & Projects */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Quick Navigation</h3>
            <div className="space-y-2">
              <Link
                to="/equipment"
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition text-xs font-semibold text-slate-700 hover:text-indigo-700"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-indigo-600" />
                  <span>Discover Equipment</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/projects"
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition text-xs font-semibold text-slate-700 hover:text-indigo-700"
              >
                <div className="flex items-center gap-2.5">
                  <FolderGit2 className="w-4 h-4 text-indigo-600" />
                  <span>Create / View Projects</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/ai-recommendations"
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition text-xs font-semibold text-slate-700 hover:text-indigo-700"
              >
                <div className="flex items-center gap-2.5">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  <span>AI Scheduling Engine</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Seed Projects Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">Your Projects</h3>
              <Link to="/projects" className="text-xs text-indigo-600 font-semibold hover:underline">Manage</Link>
            </div>
            <div className="space-y-2.5">
              {projects.length === 0 ? (
                <p className="text-xs text-slate-500">No projects registered yet.</p>
              ) : (
                projects.map(p => (
                  <div key={p.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div className="font-bold text-slate-800">{p.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{p.description}</div>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span>Deadline: <strong className="text-slate-600">{new Date(p.deadline).toISOString().split('T')[0]}</strong></span>
                      <span className="bg-indigo-100/60 text-indigo-700 px-1.5 py-0.5 rounded font-medium">{p.category}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
