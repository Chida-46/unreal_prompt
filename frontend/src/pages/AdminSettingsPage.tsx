import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { api } from '../services/api';
import { SchedulingWeights } from '../types';
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  History,
  Scale,
  Sparkles,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { currentUser } = useRole();
  const [weights, setWeights] = useState<SchedulingWeights>({
    deadlineWeight: 0.35,
    compatibilityWeight: 0.25,
    waitingTimeWeight: 0.15,
    fairnessWeight: 0.15,
    feasibilityWeight: 0.10,
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSettings = () => {
    setLoading(true);
    Promise.all([
      api.getSchedulingWeights(),
      api.getAuditLogs(),
    ])
      .then(([w, logs]) => {
        setWeights(w);
        setAuditLogs(logs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const totalSum = parseFloat(
    (
      weights.deadlineWeight +
      weights.compatibilityWeight +
      weights.waitingTimeWeight +
      weights.fairnessWeight +
      weights.feasibilityWeight
    ).toFixed(2)
  );

  const isValidSum = Math.abs(totalSum - 1.0) < 0.001;

  const handleWeightChange = (key: keyof SchedulingWeights, val: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: parseFloat(val.toFixed(2)),
    }));
  };

  const handleResetDefaults = () => {
    setWeights({
      deadlineWeight: 0.35,
      compatibilityWeight: 0.25,
      waitingTimeWeight: 0.15,
      fairnessWeight: 0.15,
      feasibilityWeight: 0.10,
    });
    setErrorMsg(null);
  };

  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidSum) {
      setErrorMsg(`Weights must sum to exactly 100% (currently ${(totalSum * 100).toFixed(0)}%).`);
      return;
    }
    setErrorMsg(null);
    setSaving(true);

    try {
      await api.updateSchedulingWeights(weights, currentUser);
      setSuccessMsg('AI Scheduling algorithm weights updated and applied campus-wide!');
      fetchSettings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update algorithm weights');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Configuration</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Algorithm Tuning & Audit Logs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Calibrate the priority scoring coefficients used by the deterministic GenAI scheduling engine.
        </p>
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

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="font-bold text-rose-800">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Algorithm Weights Sliders */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Scheduling Priority Weights Model</span>
              </h2>
              <p className="text-xs text-slate-500">Configurable criteria for competing student requests</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                  isValidSum ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                Sum: {(totalSum * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveWeights} className="space-y-5 text-xs">
            {/* Deadline Urgency */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Project Deadline Urgency</span>
                <span className="font-mono font-bold text-indigo-600">{(weights.deadlineWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights.deadlineWeight}
                onChange={e => handleWeightChange('deadlineWeight', parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Prioritizes students with impending capstone and exam milestones.</p>
            </div>

            {/* Hardware Compatibility */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Hardware Compatibility & Technical Match</span>
                <span className="font-mono font-bold text-indigo-600">{(weights.compatibilityWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.compatibilityWeight}
                onChange={e => handleWeightChange('compatibilityWeight', parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Evaluates architectural alignment between student description and instrument specs.</p>
            </div>

            {/* Waiting Time */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Queue Waiting Time</span>
                <span className="font-mono font-bold text-indigo-600">{(weights.waitingTimeWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={weights.waitingTimeWeight}
                onChange={e => handleWeightChange('waitingTimeWeight', parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Prevents starvation by rewarding requests queued in advance.</p>
            </div>

            {/* Historical Allocation Fairness */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Historical Allocation Fairness</span>
                <span className="font-mono font-bold text-indigo-600">{(weights.fairnessWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={weights.fairnessWeight}
                onChange={e => handleWeightChange('fairnessWeight', parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Guarantees equitable distribution by favoring first-time or under-allocated students.</p>
            </div>

            {/* Feasibility */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Scheduling Feasibility & Lab Limits</span>
                <span className="font-mono font-bold text-indigo-600">{(weights.feasibilityWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={weights.feasibilityWeight}
                onChange={e => handleWeightChange('feasibilityWeight', parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Evaluates session compact fit within standard lab operating hours.</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default (35/25/15/15/10)</span>
              </button>

              <button
                type="submit"
                disabled={saving || !isValidSum}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Save Algorithm Weights'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Institutional Audit Trail */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" />
                <span>Institutional Audit Trail</span>
              </h3>
              <p className="text-xs text-slate-500">Immutable record of system and faculty actions</p>
            </div>
          </div>

          <div className="max-h-[460px] overflow-y-auto space-y-2.5 divide-y divide-slate-100">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No audit logs recorded yet.</p>
            ) : (
              auditLogs.slice(0, 15).map(log => (
                <div key={log.id} className="pt-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-700 text-[11px]">{log.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-snug">{log.details}</p>
                  <div className="text-[10px] text-slate-400">
                    Actor: <strong className="text-slate-700">{log.actorName}</strong> ({log.actorRole})
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
