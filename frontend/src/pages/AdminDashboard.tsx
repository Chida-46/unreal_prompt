import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsData } from '../types';
import { StatCard } from '../components/StatCard';
import {
  ShieldCheck,
  Cpu,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  Building2,
  ArrowRight,
  Sliders,
  Layers,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAnalytics()
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summary = analytics?.summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Greeting */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-xs font-semibold uppercase tracking-wider">
                System Administration
              </span>
              <span className="text-xs text-slate-300">• Central Engineering Laboratory Facilities</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Administrative Control Console
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Monitor institutional resource utilization, calibrate AI scheduling parameters, manage hardware assets, and inspect compliance audits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/equipment"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition shadow-sm"
            >
              + Add Equipment
            </Link>
            <Link
              to="/admin/settings"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Weights Config</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Stat Cards from Live Database */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Lab Equipment"
          value={summary?.totalEquipment || 0}
          sublabel="Across 5 departments"
          icon={Cpu}
          color="indigo"
        />
        <StatCard
          title="Active Reservations"
          value={summary?.activeBookings || 0}
          sublabel="Currently scheduled slots"
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          title="Pending Requests"
          value={summary?.pendingRequests || 0}
          sublabel="Awaiting faculty action"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Campus Utilization"
          value={`${summary?.utilizationPercentage || 0}%`}
          sublabel="Active load factor"
          icon={Sparkles}
          color="blue"
        />
      </div>

      {/* Quick Navigation Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/equipment"
          className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Equipment Inventory</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Register new instruments, edit laboratory locations, update operating specs, and adjust session limits.
            </p>
          </div>
          <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1 pt-1">
            <span>Manage Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/departments"
          className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Departments & Labs</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Register academic departments, define laboratory rooms, and set standard operating hours.
            </p>
          </div>
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 pt-1">
            <span>Manage Departments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/maintenance"
          className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Maintenance Management</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Schedule hardware recalibrations and lock out contested periods to ensure student lab safety.
            </p>
          </div>
          <div className="text-xs font-semibold text-amber-600 flex items-center gap-1 pt-1">
            <span>Schedule Maintenance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Utilization & Analytics Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Department-Level Utilization Summary</h2>
            <p className="text-xs text-slate-500">Live metrics calculated directly from database records</p>
          </div>
          <Link
            to="/admin/analytics"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Full Analytics & Visual Charts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {analytics?.departmentUtilization.map(dept => (
            <div key={dept.departmentId} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">{dept.departmentCode}</span>
                <span className="font-mono text-xs font-bold text-indigo-600">{dept.utilizationRate}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, dept.utilizationRate)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{dept.activeBookings} active</span>
                <span>{dept.totalEquipment} total</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
