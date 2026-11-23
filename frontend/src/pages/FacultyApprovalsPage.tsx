import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { api } from '../services/api';
import { BookingRequest } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Sparkles,
  Check,
  X,
  MessageSquare,
  Brain,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacultyApprovalsPage: React.FC = () => {
  const { currentUser } = useRole();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Rejection Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [activeReqId, setActiveReqId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    api.getFacultyRequests()
      .then(setRequests)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const handleApprove = async (req: BookingRequest) => {
    if (!window.confirm(`Approve lab reservation for ${req.student.name} on ${req.equipment.name} (${req.startTime}-${req.endTime})?`)) {
      return;
    }

    try {
      setSubmittingAction(true);
      await api.processFacultyDecision(
        req.id,
        {
          action: 'APPROVE',
          facultyNotes: 'Approved by faculty reviewer. Laboratory access confirmed.',
        },
        currentUser
      );
      setActionSuccess(`Successfully approved request for ${req.student.name}! Slot is now actively reserved.`);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReqId) return;

    try {
      setSubmittingAction(true);
      await api.processFacultyDecision(
        activeReqId,
        {
          action: 'REJECT',
          rejectionReason: rejectionReason || 'Request cannot be accommodated at this scheduled time.',
        },
        currentUser
      );
      setRejectModalOpen(false);
      setRejectionReason('');
      setActiveReqId(null);
      setActionSuccess('Request rejected and student notified.');
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Faculty Review</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Pending Approval Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review project scopes, evaluate AI-weighted priorities, and authorize laboratory access.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Pending Decisions: <strong className="text-slate-900">{requests.length}</strong>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="font-bold text-emerald-800">×</button>
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading pending requests...</div>
      ) : requests.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">All Caught Up!</h3>
          <p className="mt-1">No requests are currently pending faculty review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const hasConflict = req.status === 'CONFLICT_DETECTED' || req.status === 'ALTERNATIVE_SUGGESTED';

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Top Banner with Student & Equipment */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-base">{req.student.name}</span>
                      <span className="text-xs font-mono text-slate-400">({req.student.email})</span>
                      <StatusBadge status={req.status} size="sm" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                      <span>Requested: <strong className="text-indigo-600">{req.equipment.name}</strong></span>
                      <span>•</span>
                      <span>Dept: <strong>{req.equipment.department.name}</strong></span>
                    </div>
                  </div>

                  {/* AI Score Badge */}
                  {req.priorityScore && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5 text-right shrink-0">
                      <div className="text-lg font-black text-indigo-700 font-mono leading-none">
                        {req.priorityScore}
                        <span className="text-[10px] text-slate-400 font-normal"> / 100</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-600">
                        AI Priority Score
                      </span>
                    </div>
                  )}
                </div>

                {/* Project details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                      Research Project Details
                    </span>
                    <div className="font-bold text-slate-900 text-sm">{req.project.title}</div>
                    <p className="text-slate-600 leading-relaxed text-[11px] line-clamp-3">
                      {req.project.description}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                      <span>Category: <strong className="text-slate-700">{req.project.category}</strong></span>
                      <span>Deadline: <strong className="text-amber-700">{new Date(req.projectDeadline).toISOString().split('T')[0]}</strong></span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                      Hardware Access Justification
                    </span>
                    <p className="text-slate-700 text-[11px] leading-relaxed italic">
                      "{req.accessReason}"
                    </p>
                    {req.technicalRequirements && (
                      <div className="pt-1 text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-800">Tech requirements: </span>
                        <span className="font-mono">{req.technicalRequirements}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                      <span>Date: <strong>{new Date(req.requestedDate).toISOString().split('T')[0]}</strong></span>
                      <span>Time: <strong>{req.startTime} - {req.endTime}</strong> ({req.durationMinutes / 60}h)</span>
                    </div>
                  </div>
                </div>

                {/* Conflict Notice if present */}
                {hasConflict && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>This request competes for the same slot on {req.equipment.name}. Review AI recommendation for fair allocation.</span>
                    </div>
                    <Link
                      to="/ai-recommendations"
                      className="text-xs font-bold text-indigo-700 hover:underline shrink-0"
                    >
                      View AI Analysis →
                    </Link>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    onClick={() => {
                      setActiveReqId(req.id);
                      setRejectModalOpen(true);
                    }}
                    disabled={submittingAction}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(req)}
                    disabled={submittingAction}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Authorize & Approve Slot</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Booking Request"
        description="Provide a reason for the student regarding this decision."
        maxWidth="md"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Rejection</label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g., Requested slot coincides with scheduled maintenance, or student should utilize alternative equipment."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs focus:border-indigo-500"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAction}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
            >
              {submittingAction ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
