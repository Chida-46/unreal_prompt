import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Equipment } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building2,
  ShieldAlert,
  Sparkles,
  Layers,
  Cpu,
  Wifi,
  Brain,
  Activity,
  Printer,
  CircuitBoard,
  Server,
  Bot,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const EquipmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getEquipmentById(id)
      .then(setEquipment)
      .catch(err => setError(err.message || 'Could not load equipment details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading equipment details...
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">Equipment Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'The requested equipment does not exist.'}</p>
        <Link
          to="/equipment"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const iconMap: Record<string, any> = {
    Cpu, Layers, Wifi, Brain, Activity, Printer, CircuitBoard, Server, Bot,
  };
  const Icon = iconMap[equipment.iconSvg || ''] || Cpu;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/equipment"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Equipment Catalog</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {equipment.equipmentCode}
                </span>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {equipment.category.name}
                </span>
                <StatusBadge status={equipment.status} size="sm" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {equipment.name}
              </h1>
              {equipment.modelNumber && (
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Model / Part: {equipment.modelNumber}</p>
              )}
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
            <Link
              to={`/book/${equipment.id}`}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm text-center flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book This Equipment</span>
            </Link>
          </div>
        </div>

        {/* Short description */}
        <p className="text-sm text-slate-600 mt-6 leading-relaxed border-t border-slate-100 pt-6">
          {equipment.description}
        </p>

        {/* Quick Specs & Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="block text-slate-400 text-[11px] font-medium">Department</span>
              <span className="font-semibold text-slate-800">{equipment.department.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="block text-slate-400 text-[11px] font-medium">Laboratory Location</span>
              <span className="font-semibold text-slate-800">
                {equipment.laboratory.name} ({equipment.laboratory.roomNumber})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="block text-slate-400 text-[11px] font-medium">Session Duration Limit</span>
              <span className="font-semibold text-slate-800">Max {equipment.maxDurationHours} hours per slot</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Technical Specifications */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Full Technical Specifications</span>
        </h2>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
          {equipment.specifications}
        </div>
      </div>

      {/* Upcoming Reserved Slots & Maintenance Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Reservations */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Scheduled Approved Bookings</span>
          </h2>

          {!equipment.bookings || equipment.bookings.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              No active reservations currently scheduled. Equipment is wide open for requests!
            </div>
          ) : (
            <div className="space-y-2">
              {equipment.bookings.map(b => (
                <div key={b.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">
                      {new Date(b.scheduledDate).toISOString().split('T')[0]}
                    </span>
                    <span className="text-slate-500 ml-2">
                      ({b.startTime} - {b.endTime})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Reserved
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maintenance Schedules */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Maintenance & Calibration Periods</span>
          </h2>

          {!equipment.maintenanceSchedules || equipment.maintenanceSchedules.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              No maintenance lockdowns scheduled. Hardware in prime operating condition.
            </div>
          ) : (
            <div className="space-y-2">
              {equipment.maintenanceSchedules.map(m => (
                <div key={m.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs">
                  <div className="font-bold text-amber-900">{m.title}</div>
                  <div className="text-amber-700 mt-0.5">{m.reason}</div>
                  <div className="text-[11px] text-amber-800 mt-1">
                    Lockout: {new Date(m.startDate).toISOString().split('T')[0]} to {new Date(m.endDate).toISOString().split('T')[0]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
