import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ConflictExplanationResult, AllocationRecommendation } from '../types';
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
  RotateCcw,
} from 'lucide-react';

interface AIConflictExplainerProps {
  conflictGroupId: string;
  recommendation: AllocationRecommendation;
}

export const AIConflictExplainer: React.FC<AIConflictExplainerProps> = ({
  conflictGroupId,
  recommendation,
}) => {
  const [explanation, setExplanation] = useState<ConflictExplanationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = async () => {
    if (!conflictGroupId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.explainConflict(conflictGroupId);
      setExplanation(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI conflict explanation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplanation();
  }, [conflictGroupId]);

  return (
    <div className="bg-white rounded-2xl border border-indigo-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/30 text-amber-300">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm tracking-tight">AI Conflict Resolution Assistant</h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-200 text-[10px] font-semibold border border-purple-300/30">
                GenAI Feature 3
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Transparent natural-language explanation of deterministic priority scores and verified alternatives
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {explanation && (
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                explanation.isAIGenerated
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
              }`}
            >
              {explanation.modelUsed}
            </span>
          )}
          <button
            onClick={fetchExplanation}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
            title="Refresh AI explanation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {loading && (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Synthesizing deterministic priority scores and generating natural-language briefing...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={fetchExplanation} className="text-xs font-semibold underline ml-3">
              Retry
            </button>
          </div>
        )}

        {explanation && !loading && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[10px]">
                Contested Scenario Summary
              </span>
              <p>{explanation.summary}</p>
            </div>

            {/* Recommendation Explanation */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-950 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Deterministic Recommendation Rationale</span>
              </div>
              <p>{explanation.recommendedStudentExplanation}</p>
            </div>

            {/* Priority Factor Cards Grid */}
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500 block mb-3">
                Factor Breakdown Analysis
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* Deadline Urgency */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Deadline Urgency</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                      35% Weight
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {explanation.factorBreakdownExplanations.deadlineUrgency}
                  </p>
                </div>

                {/* Technical Compatibility */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Hardware Compatibility</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      25% Weight
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {explanation.factorBreakdownExplanations.technicalCompatibility}
                  </p>
                </div>

                {/* Waiting Time */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Waiting Time Queue</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">
                      15% Weight
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {explanation.factorBreakdownExplanations.waitingTime}
                  </p>
                </div>

                {/* Historical Fairness */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Anti-Monopoly Fairness</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">
                      15% Weight
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {explanation.factorBreakdownExplanations.historicalFairness}
                  </p>
                </div>

                {/* Feasibility */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 md:col-span-2 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Scheduling Feasibility</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                      10% Weight
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {explanation.factorBreakdownExplanations.schedulingFeasibility}
                  </p>
                </div>
              </div>
            </div>

            {/* Alternative Slots Rationale */}
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs text-indigo-950">
              <span className="font-bold block mb-1">Alternative Slot & Hardware Rationale:</span>
              <p className="text-slate-700 leading-relaxed">
                {explanation.alternativeRecommendationsRationale}
              </p>
            </div>

            {/* Integrity Notice */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong>System Guarantee:</strong> The deterministic fairness algorithm strictly computes all priority scores. The LLM produces transparent natural-language summaries and does not override mathematical decisions. Faculty retains sole approval authority.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
