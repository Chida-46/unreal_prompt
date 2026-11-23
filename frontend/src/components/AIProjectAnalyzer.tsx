import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ProjectAnalysisResult } from '../types';
import {
  Brain,
  Sparkles,
  ArrowRight,
  Cpu,
  Zap,
  ShieldAlert,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit3,
} from 'lucide-react';

export const AIProjectAnalyzer: React.FC = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ProjectAnalysisResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTechReqs, setEditTechReqs] = useState('');

  const samplePrompts = [
    {
      label: 'Smart Agriculture IoT',
      text: 'I am developing an IoT-based smart agriculture monitoring system. I need to measure soil moisture, temperature, humidity, and transmit the readings wirelessly. I want to build a working prototype for my final-year project.',
    },
    {
      label: 'Edge AI Drone Vision',
      text: 'Developing real-time computer vision obstacle avoidance on an autonomous drone. Need high-throughput onboard hardware acceleration, camera depth streaming, and low latency neural model inference.',
    },
    {
      label: 'Biomedical Wearable Patch',
      text: 'Designing a wearable non-invasive ECG and pulse telemetry patch. Need analog instrumentation amplifier testing, low-noise oscilloscope waveform calibration, and Bluetooth telemetry transmission.',
    },
  ];

  const handleAnalyze = async () => {
    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide at least 10 characters describing your project.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.analyzeProject(description);
      setAnalysis(result);
      setEditTitle(result.projectOverview.title);
      setEditCategory(result.projectOverview.category);
      setEditTechReqs(
        `${result.technicalRequirements.microcontrollerCompatibility}; ${result.technicalRequirements.sensorInterfaces}; ${result.technicalRequirements.wirelessConnectivity}`
      );
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze project with AI');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequestWithRequirements = () => {
    if (!analysis) return;
    // Navigate to booking request page with prefilled state
    navigate('/book', {
      state: {
        prefilledProjectTitle: editTitle || analysis.projectOverview.title,
        prefilledCategory: editCategory || analysis.projectOverview.category,
        prefilledTechnicalRequirements: editTechReqs,
        prefilledAccessReason: `Academic project testing for: ${analysis.projectOverview.summary}`,
        suggestedEquipment: analysis.requiredEquipment,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GenAI Feature 1 • Natural Language Hardware Analysis</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">AI Project Requirement Analyzer</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-xl">
            Describe your academic research project in natural language. The LLM extracts specific hardware components, sensor interfaces, and power specifications.
          </p>
        </div>

        {analysis && (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                analysis.isAIGenerated
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
              }`}
            >
              {analysis.modelUsed}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Sample preset buttons */}
        <div>
          <span className="text-xs font-semibold text-slate-500 block mb-2">Try a sample project description:</span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDescription(p.text)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-900 text-xs font-medium transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Textarea */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Describe Your Project & Research Goals
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g., I am developing an IoT-based smart agriculture monitoring system. I need to measure soil moisture, temperature, humidity, and transmit the readings wirelessly. I want to build a working prototype for my final-year project."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={handleAnalyze} className="text-xs font-semibold underline ml-3">
              Retry
            </button>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3">
          {analysis && (
            <button
              type="button"
              onClick={() => {
                setAnalysis(null);
                setDescription('');
              }}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Project with GenAI...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 text-indigo-200" />
                <span>Analyze Project with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        {analysis && (
          <div className="pt-6 border-t border-slate-100 space-y-6 animate-in fade-in duration-200">
            {/* Title & Category Bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                    />
                    <input
                      type="text"
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[10px] uppercase">
                        {editCategory || analysis.projectOverview.category}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm">{editTitle || analysis.projectOverview.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{analysis.projectOverview.summary}</p>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="self-start sm:self-center px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>{isEditing ? 'Done Editing' : 'Edit Requirements'}</span>
              </button>
            </div>

            {/* Extracted Equipment Grid */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Extracted Equipment Requirements ({analysis.requiredEquipment.length} items)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.requiredEquipment.map((eq, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">{eq.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px]">
                        Qty: {eq.estimatedQuantity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{eq.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specs & Usage Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Technical Interface Requirements */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Technical & Interface Specs</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-700">
                  <div>
                    <strong className="text-slate-900">Controller:</strong> {analysis.technicalRequirements.microcontrollerCompatibility}
                  </div>
                  <div>
                    <strong className="text-slate-900">Sensors:</strong> {analysis.technicalRequirements.sensorInterfaces}
                  </div>
                  <div>
                    <strong className="text-slate-900">Wireless:</strong> {analysis.technicalRequirements.wirelessConnectivity}
                  </div>
                  <div>
                    <strong className="text-slate-900">Power:</strong> {analysis.technicalRequirements.powerSpecs}
                  </div>
                </div>
              </div>

              {/* Estimated Usage & Lab Facility */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Estimated Lab Usage</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-700">
                  <div>
                    <strong className="text-slate-900">Project Duration:</strong> {analysis.estimatedUsage.suggestedDuration}
                  </div>
                  <div>
                    <strong className="text-slate-900">Per-Session Slot:</strong> {analysis.estimatedUsage.recommendedSlotMinutes} minutes
                  </div>
                  <div>
                    <strong className="text-slate-900">Specialized Lab:</strong>{' '}
                    {analysis.estimatedUsage.requiresSpecializedLab
                      ? `Yes (${analysis.estimatedUsage.labType || 'Specialized Facility'})`
                      : 'Standard Workstation Facility'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations & Safety */}
            {analysis.additionalRecommendations && (
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <span>AI Recommendations & Safety Considerations</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700">
                  <div>
                    <strong className="text-indigo-900 block mb-0.5">Alternatives:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {analysis.additionalRecommendations.alternativeEquipment.map((alt, i) => (
                        <li key={i}>{alt}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-indigo-900 block mb-0.5">Missing Components:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {analysis.additionalRecommendations.missingComponents.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-indigo-900 block mb-0.5">Safety & Handling:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {analysis.additionalRecommendations.safetyConsiderations.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action: Convert to Request */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Review requirements above. Click below to prefill an equipment access request.
              </span>
              <button
                type="button"
                onClick={handleCreateRequestWithRequirements}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>Use Requirements to Request Equipment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
