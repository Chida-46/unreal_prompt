import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { api } from '../services/api';
import { BookingRequest } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Calendar,
  Clock,
  AlertTriangle,
  Lightbulb,
  Ban,
  CheckCircle2,
  ExternalLink,
  BrainCircuit,
  XCircle,
} from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const { currentUser } = useRole();
  const location = useLocation();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(
    (location.state as any)?.successMessage || null
  );

  const fetchRequests = () => {
    if (!currentUser) return;
    setLoading(true);
    api.getBookingRequests({ studentId: currentUser.id })
      .then(setRequests)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const handleCancel = async (id: string) => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      await api.cancelBookingRequest(id, currentUser.id);
      setActionSuccess('Booking request cancelled successfully');
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel request');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Personal Schedule</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings & Requests</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time request statuses, conflict notifications, and faculty decisions for {currentUser?.name}.
          </p>
        </div>
        <Link
          to="/equipment"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm"
        >
          + Request New Equipment
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 font-bold ml-2">×</button>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your reservations...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No reservations found</h3>
            <p className="mt-1">You currently have no equipment requests or active bookings.</p>
            <Link
              to="/equipment"
              className="mt-4 inline-block px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs hover:bg-indigo-100 transition"
            >
              Browse Equipment Catalog
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map(req => {
              const isEligibleCancel = !['CANCELLED', 'COMPLETED', 'REJECTED'].includes(req.status);
              const hasAlternatives = req.status === 'ALTERNATIVE_SUGGESTED' || req.status === 'CONFLICT_DETECTED';

              return (
                <div key={req.id} className="p-5 hover:bg-slate-50/60 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-sm font-bold text-slate-900">{req.equipment.name}</h3>
                        <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {req.equipment.equipmentCode}
                        </span>
                        <StatusBadge status={req.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Project: <strong className="text-slate-800">{req.project.title}</strong>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-start">
                      {hasAlternatives && (
                        <Link
                          to="/ai-recommendations"
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition flex items-center gap-1.5"
                        >
                          <BrainCircuit className="w-3.5 h-3.5" />
                          <span>View AI Alternatives</span>
                        </Link>
                      )}

                      {isEligibleCancel && (
                        <button
                          onClick={() => handleCancel(req.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 font-semibold text-xs transition flex items-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Cancel Request</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slot & Location Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Date: <strong className="text-slate-800">{new Date(req.requestedDate).toISOString().split('T')[0]}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Time: <strong className="text-slate-800">{req.startTime} - {req.endTime}</strong> ({req.durationMinutes / 60}h)</span>
                    </div>
                    <div className="truncate">
                      Dept: <strong className="text-slate-800">{req.equipment.department.name}</strong>
                    </div>
                  </div>

                  {/* Feedback / Faculty notes / Rejection reasons */}
                  {req.facultyNotes && (
                    <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900">
                      <strong>Faculty Feedback:</strong> {req.facultyNotes}
                    </div>
                  )}

                  {req.rejectionReason && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                      <strong>Rejection Reason:</strong> {req.rejectionReason}
                    </div>
                  )}

                  {req.priorityScore && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span>Calculated AI Priority Score:</span>
                      <strong className="text-indigo-600 font-mono">{req.priorityScore}/100</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
