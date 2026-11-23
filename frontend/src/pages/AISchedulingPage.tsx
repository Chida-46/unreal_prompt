import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AllocationRecommendation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { AIConflictExplainer } from '../components/AIConflictExplainer';
import {
  Brain,
  Sparkles,
  Scale,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AISchedulingPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<AllocationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<AllocationRecommendation | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getRecommendations()
      .then(recs => {
        setRecommendations(recs);
        if (recs.length > 0) {
          setSelectedRec(recs[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Engine Overview Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-amber-300 text-xs font-semibold mb-2">
              <Brain className="w-3.5 h-3.5" />
              <span>Intelligent Resource Allocation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Scheduling & Conflict Resolution
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              When multiple students request identical time slots for high-demand equipment, LabLink's deterministic fairness engine balances project deadlines, technical requirements, waiting queues, and historical allocation.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-xs font-mono">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Anti-Monopolization: ACTIVE</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading AI scheduling analysis...</div>
      ) : recommendations.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No Scheduling Conflicts Active</h3>
          <p className="max-w-md mx-auto mt-1 leading-relaxed">
            All current lab equipment requests have unique, non-overlapping slots or have been resolved.
          </p>
          <div className="mt-6 p-4 max-w-lg mx-auto bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2">
            <span className="font-bold text-slate-900 block text-xs">How to test this live scenario:</span>
            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1">
              <li>Switch role to <strong>Student Aarav Sharma</strong> and request the <em>FPGA Development Kit</em> for tomorrow 10:00 - 13:00.</li>
              <li>Switch role to <strong>Student Priya Patel</strong> and request the same <em>FPGA Kit</em> for tomorrow 11:00 - 14:00 (overlapping!).</li>
              <li>Return here to watch the conflict automatically detected and resolved with full score breakdowns!</li>
            </ol>
          </div>
          <Link
            to="/equipment"
            className="mt-5 inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
          >
            Go to Equipment Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Conflict List Selector (Left) */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contested Allocations ({recommendations.length})
            </h2>
            <div className="space-y-2">
              {recommendations.map(rec => {
                const isSelected = selectedRec?.id === rec.id;
                return (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedRec(rec)}
                    className={`w-full text-left p-4 rounded-xl border transition ${
                      isSelected
                        ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        {rec.equipment?.name || 'Equipment'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                        Conflict
                      </span>
                    </div>

                    <div className="mt-1 text-slate-500 text-[11px] flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(rec.recommendedDate).toISOString().split('T')[0]}</span>
                    </div>

                    <div className="mt-2 text-slate-600 text-[11px]">
                      Recommended: <strong className="text-indigo-600">{rec.winningRequest?.student.name}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conflict Detail & AI Breakdown (Right) */}
          {selectedRec && (
            <div className="lg:col-span-8 space-y-6">
              {/* Feature 3: GenAI Conflict Resolution Explanation Assistant */}
              <AIConflictExplainer
                conflictGroupId={selectedRec.conflictGroupId}
                recommendation={selectedRec}
              />

              {/* Winner Allocation Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Recommended Winner
                      </span>
                      <span className="text-xs font-mono text-slate-400">{selectedRec.conflictGroupId}</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                      {selectedRec.winningRequest?.student.name}
                    </h2>
                    <p className="text-xs text-slate-600">
                      Project: <strong className="text-slate-800">{selectedRec.winningRequest?.project.title}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black text-indigo-600 font-mono">
                      {selectedRec.priorityScoreBreakdown?.totalScore}
                      <span className="text-xs text-slate-400 font-normal"> / 100</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Composite Priority Score
                    </span>
                  </div>
                </div>

                {/* Score breakdown metrics bars */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                    <span className="text-[10px] text-amber-800 font-semibold block uppercase">Deadline (35%)</span>
                    <strong className="text-lg font-bold text-amber-950">
                      {selectedRec.priorityScoreBreakdown?.deadlineUrgency}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center">
                    <span className="text-[10px] text-indigo-800 font-semibold block uppercase">Tech Match (25%)</span>
                    <strong className="text-lg font-bold text-indigo-950">
                      {selectedRec.priorityScoreBreakdown?.compatibility}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                    <span className="text-[10px] text-purple-800 font-semibold block uppercase">Queue Wait (15%)</span>
                    <strong className="text-lg font-bold text-purple-950">
                      {selectedRec.priorityScoreBreakdown?.waitingTime}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                    <span className="text-[10px] text-emerald-800 font-semibold block uppercase">Fairness (15%)</span>
                    <strong className="text-lg font-bold text-emerald-950">
                      {selectedRec.priorityScoreBreakdown?.fairness}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-100 text-center">
                    <span className="text-[10px] text-cyan-800 font-semibold block uppercase">Feasible (10%)</span>
                    <strong className="text-lg font-bold text-cyan-950">
                      {selectedRec.priorityScoreBreakdown?.feasibility}
                    </strong>
                  </div>
                </div>

                {/* Recommended Slot Details */}
                <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-700 gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Allocated Date: <strong>{new Date(selectedRec.recommendedDate).toISOString().split('T')[0]}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Time Window: <strong>{selectedRec.recommendedStartTime} - {selectedRec.recommendedEndTime}</strong></span>
                  </div>
                  <div>
                    Status: <strong className="text-slate-900">{selectedRec.status}</strong>
                  </div>
                </div>
              </div>

              {/* Natural Language Explanation Box */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>AI Allocation Rationale</span>
                </div>
                <div className="prose prose-sm max-w-none text-xs text-slate-700 bg-slate-50/80 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed font-sans">
                  {selectedRec.aiExplanation}
                </div>
              </div>

              {/* Competing Requests & Suggested Alternatives for Losers */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    <span>Competing Requests & Suggested Alternatives</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Total In Group: {selectedRec.allRequests?.length || 2}
                  </span>
                </div>

                <div className="space-y-4">
                  {selectedRec.allRequests?.map(req => {
                    const isWinner = req.id === selectedRec.winningRequestId;
                    const alternatives = selectedRec.alternativeOptionsJson[req.id] || [];

                    return (
                      <div
                        key={req.id}
                        className={`p-4 rounded-xl border text-xs space-y-2.5 transition ${
                          isWinner
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-slate-50/80 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{req.student.name}</span>
                              {isWinner ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Allocated Winner
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Alternative Suggested
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 mt-0.5">Project: {req.project.title}</p>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Requested: {new Date(req.requestedDate).toISOString().split('T')[0]} ({req.startTime}-{req.endTime}) • Deadline: {new Date(req.projectDeadline).toISOString().split('T')[0]}
                            </div>
                          </div>
                          {req.priorityScore && (
                            <div className="text-right">
                              <div className="font-mono font-bold text-indigo-600 text-sm">
                                {req.priorityScore}/100
                              </div>
                              <span className="text-[10px] text-slate-400">Score</span>
                            </div>
                          )}
                        </div>

                        {/* If loser, show alternatives */}
                        {!isWinner && (
                          <div className="mt-3 pt-3 border-t border-slate-200/80">
                            <span className="font-bold text-indigo-900 text-[11px] flex items-center gap-1 mb-2">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Verified Database Alternatives ({alternatives.length} options):</span>
                            </span>

                            {alternatives.length === 0 ? (
                              <p className="text-[11px] text-slate-500">Searching additional upcoming slots...</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {alternatives.map((alt, aIdx) => (
                                  <div key={aIdx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] space-y-1">
                                    <div className="font-bold text-slate-800 flex items-center justify-between">
                                      <span>{alt.equipmentName}</span>
                                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-semibold">
                                        {alt.type}
                                      </span>
                                    </div>
                                    <div className="text-slate-600">
                                      {alt.date} at {alt.startTime} - {alt.endTime} ({alt.durationMinutes / 60}h)
                                    </div>
                                    <p className="text-slate-500 text-[10px] italic">{alt.reason}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
