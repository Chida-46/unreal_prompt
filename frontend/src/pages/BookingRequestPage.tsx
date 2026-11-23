import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { api } from '../services/api';
import { Equipment, Project } from '../types';
import {
  Calendar,
  Clock,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  FolderPlus,
  Brain,
} from 'lucide-react';

export const BookingRequestPage: React.FC = () => {
  const { equipmentId: paramEquipId } = useParams<{ equipmentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as any) || {};
  const { currentUser } = useRole();

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(paramEquipId || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Form inputs
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [requestedDate, setRequestedDate] = useState<string>(tomorrow);
  const [startTime, setStartTime] = useState<string>('10:00');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [projectDeadline, setProjectDeadline] = useState<string>(
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [technicalRequirements, setTechnicalRequirements] = useState<string>(
    prefill.prefilledTechnicalRequirements || ''
  );
  const [accessReason, setAccessReason] = useState<string>(
    prefill.prefilledAccessReason || ''
  );

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    Promise.all([
      api.getEquipment(),
      api.getProjects({ studentId: currentUser.id }),
    ])
      .then(([equips, projs]) => {
        setEquipmentList(equips);
        setProjects(projs);
        if (!selectedEquipmentId && prefill.suggestedEquipment && prefill.suggestedEquipment.length > 0) {
          const firstSugName = prefill.suggestedEquipment[0].name.toLowerCase();
          const match = equips.find(e => firstSugName.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(firstSugName.split(' ')[0]));
          if (match) {
            setSelectedEquipmentId(match.id);
          } else if (equips.length > 0) {
            setSelectedEquipmentId(equips[0].id);
          }
        } else if (!selectedEquipmentId && equips.length > 0) {
          setSelectedEquipmentId(equips[0].id);
        }
        if (projs.length > 0) {
          setSelectedProjectId(projs[0].id);
          setProjectDeadline(new Date(projs[0].deadline).toISOString().split('T')[0]);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentUser]);

  // When project changes, update project deadline default
  const handleProjectChange = (projId: string) => {
    setSelectedProjectId(projId);
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      setProjectDeadline(new Date(proj.deadline).toISOString().split('T')[0]);
    }
  };

  // Calculate end time string from start time + durationHours
  const calculateEndTime = (start: string, duration: number): string => {
    const [h, m] = start.split(':').map(Number);
    const endH = Math.min(23, h + duration);
    return `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!selectedEquipmentId) {
      setError('Please select an equipment resource');
      return;
    }
    if (!selectedProjectId) {
      setError('Please select or create an academic project');
      return;
    }
    if (!accessReason || accessReason.trim().length < 5) {
      setError('Please provide a meaningful access reason (min 5 characters)');
      return;
    }

    const calculatedEndTime = calculateEndTime(startTime, durationHours);
    const durationMinutes = durationHours * 60;

    try {
      setSubmitting(true);
      const created = await api.createBookingRequest({
        projectId: selectedProjectId,
        equipmentId: selectedEquipmentId,
        studentId: currentUser!.id,
        requestedDate,
        startTime,
        endTime: calculatedEndTime,
        durationMinutes,
        projectDeadline,
        technicalRequirements,
        accessReason,
      }, currentUser);

      if (created.status === 'CONFLICT_DETECTED') {
        navigate('/ai-recommendations', {
          state: {
            highlightConflict: true,
            message: 'Conflict detected! Competing requests have been evaluated by the AI scheduling engine.',
          },
        });
      } else if (created.status === 'APPROVED') {
        navigate('/my-bookings', {
          state: {
            successMessage: '🎉 Booking confirmed automatically! Your reservation is active.',
          },
        });
      } else {
        navigate('/my-bookings', {
          state: {
            successMessage: 'Booking request submitted successfully! Awaiting faculty review.',
          },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit booking request');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEquipment = equipmentList.find(e => e.id === selectedEquipmentId);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/equipment"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Resource Reservation</span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Submit Equipment Access Request
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Student: <strong className="text-slate-800">{currentUser?.name}</strong> • Open-Access Mode
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <span className="font-bold">Booking Request Blocked:</span>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Equipment Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Target Equipment
            </label>
            <select
              value={selectedEquipmentId}
              onChange={e => setSelectedEquipmentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            >
              {equipmentList.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.equipmentCode}) — {eq.department.name} [{eq.status}]
                </option>
              ))}
            </select>
            {selectedEquipment && (
              <p className="mt-1 text-[11px] text-slate-500">
                Located in {selectedEquipment.laboratory.name} ({selectedEquipment.laboratory.roomNumber}) • Max {selectedEquipment.maxDurationHours}h limit
              </p>
            )}
          </div>

          {/* Project Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-700">Associated Academic Project</label>
              <Link to="/projects" className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold flex items-center gap-1">
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Create New Project</span>
              </Link>
            </div>
            {projects.length === 0 ? (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                No project found for {currentUser?.name}. Please create a project first or click "+ Create New Project".
              </div>
            ) : (
              <select
                value={selectedProjectId}
                onChange={e => handleProjectChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.category}) — Deadline: {new Date(p.deadline).toISOString().split('T')[0]}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date and Time slots */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Preferred Date</label>
              <input
                type="date"
                value={requestedDate}
                onChange={e => setRequestedDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Duration</label>
              <select
                value={durationHours}
                onChange={e => setDurationHours(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-indigo-500"
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours (Standard)</option>
                <option value={3}>3 hours</option>
                <option value={4}>4 hours (Max)</option>
              </select>
            </div>
          </div>

          {/* Calculated Slot preview */}
          <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
            <span>Requested Slot Window:</span>
            <strong>
              {requestedDate} from {startTime} to {calculateEndTime(startTime, durationHours)} ({durationHours} hours)
            </strong>
          </div>

          {/* Project Deadline */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Project Milestone Deadline
            </label>
            <input
              type="date"
              value={projectDeadline}
              onChange={e => setProjectDeadline(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:border-indigo-500"
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">
              The AI scheduling engine utilizes deadline proximity to compute urgency weighting (35% factor).
            </p>
          </div>

          {/* Technical Requirements */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Technical Hardware Requirements & Tools (Optional)
            </label>
            <input
              type="text"
              value={technicalRequirements}
              onChange={e => setTechnicalRequirements(e.target.value)}
              placeholder="e.g., Vivado 2023.2, Verilog hardware synthesis, CUDA 12, PMOD sensor interface"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:border-indigo-500"
            />
          </div>

          {/* Intended Usage / Access Reason */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Intended Usage & Research Justification
            </label>
            <textarea
              rows={3}
              value={accessReason}
              onChange={e => setAccessReason(e.target.value)}
              placeholder="Explain the experiments you intend to run and why access to this specific equipment is necessary..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:border-indigo-500"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/equipment"
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'Evaluating Slot & Submitting...' : 'Submit Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
