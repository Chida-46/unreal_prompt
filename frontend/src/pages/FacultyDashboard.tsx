import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { api } from '../services/api';
import { BookingRequest } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  BrainCircuit,
  Search,
  Building2,
  Sparkles,
  Brain,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacultyDashboard: React.FC = () => {
  const { currentUser } = useRole();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFacultyData = () => {
    setLoading(true);
    api.getFacultyRequests()
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFacultyData();
  }, [currentUser]);

  const safeRequests = Array.isArray(requests) ? requests : [];
  const conflictsCount = safeRequests.filter(r => r.status === 'CONFLICT_DETECTED' || r.status === 'ALTERNATIVE_SUGGESTED').length;
  const urgentCount = safeRequests.filter(r => {
    const diff = (new Date(r.projectDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 4;
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Greeting */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
                Faculty Reviewer Portal
              </span>
              <span className="text-xs text-slate-300">• {currentUser?.department?.name || 'Academic Lab In-Charge'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {currentUser?.name}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Inspect student laboratory requests, review AI priority scores, resolve contested hardware time slots, and verify resource allocations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/faculty/approvals"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Review Requests ({requests.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Review"
          value={requests.length}
          sublabel="Awaiting faculty action"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Active Conflicts"
          value={conflictsCount}
          sublabel="AI suggestions generated"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Urgent Deadlines"
          value={urgentCount}
          sublabel="Due within 4 days"
          icon={AlertTriangle}
          color="indigo"
        />
        <StatCard
          title="Lab Supervision"
          value="5 Labs"
          sublabel="Cross-departmental access"
          icon={Building2}
          color="emerald"
        />
      </div>

      {/* Feature 4: GenAI Request Summarizer Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
            <Brain className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-emerald-950">AI Faculty Request Summarizer</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                GenAI Feature 4
              </span>
            </div>
            <p className="text-xs text-emerald-800/90 mt-1 max-w-2xl leading-relaxed">
              Reviewing complex lab requests? LabLink's GenAI model analyzes student project scopes against verified hardware specifications, identifying technical compatibility flags, duration limits, and risks while preserving your sole approval authority.
            </p>
          </div>
        </div>

        <Link
          to="/faculty/approvals"
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shadow-xs"
        >
          <span>Open AI Approvals Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Quick Approvals Queue Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Priority Approvals Queue</h2>
            <p className="text-xs text-slate-500">Student requests ordered by AI priority score and deadline urgency</p>
          </div>
          <Link
            to="/faculty/approvals"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Open Approvals Interface</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading pending requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">All caught up!</h3>
              <p className="mt-1">No student requests are currently awaiting faculty decisions.</p>
            </div>
          ) : (
            requests.slice(0, 5).map(req => (
              <div key={req.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.student.name}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-indigo-600">{req.equipment.name}</span>
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                  <p className="text-slate-600 mt-1">Project: {req.project.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-slate-500 text-[11px]">
                    <span>Slot: <strong>{new Date(req.requestedDate).toISOString().split('T')[0]} ({req.startTime}-{req.endTime})</strong></span>
                    <span>Deadline: <strong>{new Date(req.projectDeadline).toISOString().split('T')[0]}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  {req.priorityScore && (
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-xs">
                      AI: {req.priorityScore}/100
                    </span>
                  )}
                  <Link
                    to="/faculty/approvals"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
                  >
                    Review Request
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
