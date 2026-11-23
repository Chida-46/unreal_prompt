import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { api } from '../services/api';
import { Equipment } from '../types';
import { Modal } from '../components/Modal';
import {
  Wrench,
  Plus,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const AdminMaintenancePage: React.FC = () => {
  const { currentUser } = useRole();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEqId, setSelectedEqId] = useState('');
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.getMaintenanceSchedules(),
      api.getEquipment(),
    ])
      .then(([maint, equips]) => {
        setSchedules(maint);
        setEquipmentList(equips);
        if (equips.length > 0 && !selectedEqId) {
          setSelectedEqId(equips[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMaintenanceSchedule({
        equipmentId: selectedEqId,
        title,
        reason,
        startDate,
        endDate,
      }, currentUser);
      setIsModalOpen(false);
      setTitle('');
      setReason('');
      setSuccessMsg('Maintenance scheduled successfully. Equipment availability locked out.');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule maintenance');
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      await api.updateMaintenanceStatus(id, 'COMPLETED', currentUser);
      setSuccessMsg('Maintenance marked completed. Equipment status returned to Available.');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Hardware Health</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Maintenance Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Schedule instrument calibrations, repairs, and firmware updates to enforce safe laboratory booking lockouts.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Maintenance</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="font-bold text-emerald-800">×</button>
        </div>
      )}

      {/* Maintenance Schedules List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Active & Scheduled Maintenance Lockouts</h2>
          <span className="text-xs text-slate-500 font-medium">Total: {schedules.length}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading schedules...</div>
          ) : schedules.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">All Hardware Operational</h3>
              <p className="mt-1">No active maintenance lockouts currently in effect.</p>
            </div>
          ) : (
            schedules.map(item => {
              const isCompleted = item.status === 'COMPLETED';

              return (
                <div key={item.id} className="p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                      <span className="text-indigo-600 font-semibold">• {item.equipmentName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-slate-600 mt-1 leading-relaxed">{item.reason}</p>

                    <div className="flex items-center gap-3 mt-2 text-slate-500 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Lockout Period: <strong>{new Date(item.startDate).toISOString().split('T')[0]}</strong> to{' '}
                        <strong>{new Date(item.endDate).toISOString().split('T')[0]}</strong>
                      </span>
                    </div>
                  </div>

                  {!isCompleted && (
                    <button
                      onClick={() => handleMarkCompleted(item.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition border border-emerald-200 self-start sm:self-center"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Equipment Maintenance"
        description="This will lock out student bookings during the specified window."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Equipment</label>
            <select
              value={selectedEqId}
              onChange={e => setSelectedEqId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
            >
              {equipmentList.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name} ({eq.equipmentCode})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Maintenance Title / Purpose</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Annual Calibration & Sensor Diagnostic"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason / Description</label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Explain the required hardware checks..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm transition"
            >
              Confirm Lockout Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
