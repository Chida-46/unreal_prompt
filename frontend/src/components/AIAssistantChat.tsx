import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { EquipmentRecommendationResult } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  Brain,
  Sparkles,
  Send,
  MessageSquare,
  Search,
  ExternalLink,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Building2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendations?: EquipmentRecommendationResult;
  timestamp: string;
}

export const AIAssistantChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your AI Laboratory Assistant. Ask me anything in natural language to find suitable equipment, check laboratory locations, and discover development kits from our campus inventory.',
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'Which development kits do I need for an IoT agriculture project?',
    'Which equipment is suitable for machine learning & vision?',
    'Which laboratory has an oscilloscope available?',
    'Suggest equipment for robotics manipulator projects',
    'I need a workstation with sufficient GPU capability',
  ];

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await api.recommendEquipment(q);
      const aiMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        recommendations: response,
        timestamp: 'Just now',
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: `Error retrieving recommendations: ${err.message || 'AI service temporarily unavailable.'}`,
        timestamp: 'Just now',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[650px]">
      {/* Assistant Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/30 flex items-center justify-center text-amber-300">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm tracking-tight">AI Equipment Recommendation Assistant</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
                Verified RAG Inventory
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              GenAI Feature 2 • Natural-language search over verified campus laboratory hardware
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome',
                sender: 'assistant',
                text: 'Hello! I am your AI Laboratory Assistant. Ask me anything in natural language to find suitable equipment from our campus inventory.',
                timestamp: 'Just now',
              },
            ])
          }
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-600 no-scrollbar">
        <span className="font-bold text-slate-400 shrink-0 ml-1">Prompts:</span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="px-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-900 whitespace-nowrap transition shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-full`}
          >
            <div
              className={`p-3.5 rounded-2xl text-xs max-w-2xl leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex items-center gap-1.5 font-bold text-indigo-600 mb-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>LabLink AI Assistant</span>
                  {msg.recommendations && (
                    <span className="ml-auto text-[10px] text-slate-400 font-normal">
                      {msg.recommendations.modelUsed}
                    </span>
                  )}
                </div>
              )}
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Recommended Equipment Cards */}
              {msg.recommendations?.recommendedEquipment && msg.recommendations.recommendedEquipment.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 block">
                    Recommended Inventory Resources ({msg.recommendations.recommendedEquipment.length})
                  </span>

                  <div className="space-y-2">
                    {msg.recommendations.recommendedEquipment.map(eq => (
                      <div
                        key={eq.equipmentId}
                        className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-indigo-200 transition"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{eq.name}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                              {eq.equipmentCode}
                            </span>
                          </div>
                          <StatusBadge status={eq.status as any} size="sm" />
                        </div>

                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">{eq.relevanceReason}</p>

                        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <span>🏢 {eq.departmentName}</span>
                            <span>•</span>
                            <span>🔬 {eq.labName}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/equipment/${eq.equipmentId}`}
                              className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1 transition"
                            >
                              <span>Details</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </Link>
                            <Link
                              to={`/book/${eq.equipmentId}`}
                              className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1 transition shadow-2xs"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>Book</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternatives Suggestions */}
              {msg.recommendations?.suggestedAlternatives && msg.recommendations.suggestedAlternatives.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700 block mb-1">Alternative Options:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {msg.recommendations.suggestedAlternatives.map((alt, idx) => (
                      <li key={idx}>
                        <Link to={`/book/${alt.equipmentId}`} className="text-indigo-600 font-semibold hover:underline">
                          {alt.name}
                        </Link>
                        : {alt.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Consulting LabLink inventory & reasoning with GenAI...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
          placeholder="Ask e.g., 'Which equipment is suitable for drone obstacle avoidance?'"
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-50 transition flex items-center gap-1.5 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
