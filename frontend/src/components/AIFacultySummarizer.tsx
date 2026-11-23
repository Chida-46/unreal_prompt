import React, { useState } from 'react';
import { api } from '../services/api';
import { BookingRequest, FacultySummaryResult } from '../types';
import {
  Brain,
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
} from 'lucide-react';

interface AIFacultySummarizerProps {
  request: BookingRequest;
  onApprove: (req: BookingRequest) => void;
  onReject: (reqId: string) => void;
}

export const AIFacultySummarizer: React.FC<AIFacultySummarizerProps> = ({
  request,
  onApprove,
  onReject,
}) => {
  const [summary, setSummary] = useState<FacultySummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleGenerateSummary = async () => {
    if (summary) {
      setExpanded(!expanded);
      return;
    }

    setLoading(true);
    setError(null);
    setExpanded(true);

    try {
      const result = await api.summarizeFacultyRequest(request.id);
      setSummary(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI request summary');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'APPEARS_TECHNICALLY_SUITABLE':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2,
          text: 'Appears Technically Suitable',
        };
      case 'ADDITIONAL_INFO_REQUIRED':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: HelpCircle,
          text: 'Additional Info Required',
        };
      case 'POTENTIAL_MISMATCH':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: XCircle,
          text: 'Potential Equipment Mismatch',
        };
      case 'ALTERNATIVE_SUGGESTED':
      default:
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: AlertTriangle,
          text: 'Alternative Equipment Suggested',
        };
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleGenerateSummary}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing with GenAI...</span>
            </>
          ) : (
            <>
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              <span>{summary ? (expanded ? 'Hide AI Briefing' : 'Show AI Briefing') : 'Generate AI Faculty Summary'}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </>
          )}
        </button>

        {summary && (
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            {summary.modelUsed}
          </span>
        )}
      </div>

      {error && expanded && (
        <div className="mt-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={handleGenerateSummary} className="underline font-bold">
            Retry
          </button>
        </div>
      )}

      {summary && expanded && (
        <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-4 animate-in fade-in duration-150">
          {/* Recommendation Banner */}
          {(() => {
            const vb = getVerdictBadge(summary.aiRecommendation.verdict);
            const VIcon = vb.icon;
            return (
              <div className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${vb.bg}`}>
                <div className="flex items-center gap-2">
                  <VIcon className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{vb.text}</span>
                </div>
                <p className="text-[11px] leading-snug">{summary.aiRecommendation.rationale}</p>
              </div>
            );
          })()}

          {/* Project Summary & Equipment Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider text-slate-500">
                Project Summary & Purpose
              </span>
              <p className="text-slate-800 font-medium">{summary.projectSummary}</p>
              <p className="text-slate-600 text-[11px] mt-1">{summary.purposeOfEquipment}</p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider text-slate-500">
                Technical Compatibility
              </span>
              <div className="flex items-center gap-1.5 text-slate-800">
                {summary.technicalCompatibility.isCompatible ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-semibold">
                  {summary.technicalCompatibility.isCompatible ? 'Hardware Compatible' : 'Compatibility Caution'}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-1">{summary.technicalCompatibility.explanation}</p>
            </div>
          </div>

          {/* Availability & Constraints */}
          <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-1 text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] uppercase tracking-wider text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Availability & Constraints</span>
            </div>
            <p className="text-[11px]">{summary.availabilityAndConstraints}</p>
          </div>

          {/* Potential Concerns */}
          {summary.potentialConcerns && summary.potentialConcerns.length > 0 && (
            <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200/70 text-amber-950 space-y-1">
              <span className="font-bold text-[11px] uppercase tracking-wider text-amber-800 block">
                Potential Concerns / Oversight Items
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900">
                {summary.potentialConcerns.map((concern, idx) => (
                  <li key={idx}>{concern}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Faculty Controls & Authority Note */}
          <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
            <span className="text-slate-500 italic">
              <strong>Notice:</strong> Generative AI assists with technical analysis; faculty retains 100% final approval authority.
            </span>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => onReject(request.id)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 font-semibold transition"
              >
                Reject Request
              </button>
              <button
                type="button"
                onClick={() => onApprove(request)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition shadow-2xs"
              >
                Approve Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
