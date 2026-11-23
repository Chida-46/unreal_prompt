import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsData } from '../types';
import { StatCard } from '../components/StatCard';
import {
  BarChart3,
  TrendingUp,
  Building2,
  Cpu,
  Clock,
  Sparkles,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  PieChart,
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Calculating live institutional analytics...
      </div>
    );
  }

  const { summary, departmentUtilization, mostRequestedEquipment, bookingStatusDistribution, unusedResources, peakBookingHours } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Live Insights</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Laboratory Utilization Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic metrics computed across departments, bookings, maintenance, and AI conflict resolutions.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Computed from SQLite source of truth</span>
        </div>
      </div>

      {/* Top Summary Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Campus Utilization"
          value={`${summary.utilizationPercentage}%`}
          sublabel="Active load factor"
          icon={Sparkles}
          color="indigo"
        />
        <StatCard
          title="Active Bookings"
          value={summary.activeBookings}
          sublabel={`Out of ${summary.totalBookings} total created`}
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          title="Pending Requests"
          value={summary.pendingRequests}
          sublabel="Under faculty or AI review"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Contention Frequency"
          value={summary.conflictFrequency}
          sublabel="Overlapping slot groups"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart 1: Department-Wise Equipment Utilization (Horizontal Bar Visualization) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Department-Wise Equipment Utilization (%)</span>
              </h2>
              <p className="text-xs text-slate-500">Utilization percentage per academic department</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {departmentUtilization.map(dept => (
              <div key={dept.departmentId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    {dept.departmentName} ({dept.departmentCode})
                  </span>
                  <span className="font-mono font-bold text-indigo-600">{dept.utilizationRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, Math.min(100, dept.utilizationRate))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{dept.activeBookings} active reservations</span>
                  <span>{dept.totalEquipment} total hardware assets</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Booking Status Distribution */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600" />
              <span>Booking Status Distribution</span>
            </h2>
            <p className="text-xs text-slate-500">Current breakdown of all student requests</p>
          </div>

          <div className="space-y-3 pt-2">
            {bookingStatusDistribution.map(item => {
              const totalRequests = summary.pendingRequests + summary.approvedRequests + summary.rejectedRequests || 1;
              const pct = Math.round((item.count / totalRequests) * 100);

              const colorMap: Record<string, string> = {
                APPROVED: 'bg-emerald-500',
                PENDING: 'bg-amber-500',
                REJECTED: 'bg-rose-500',
                CONFLICT_DETECTED: 'bg-orange-500',
                ALTERNATIVE_SUGGESTED: 'bg-indigo-500',
                CANCELLED: 'bg-slate-400',
              };

              const barColor = colorMap[item.status] || 'bg-slate-500';

              return (
                <div key={item.status} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700">{item.status}</span>
                    <span className="font-mono text-slate-900 font-bold">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`${barColor} h-2 rounded-full`} style={{ width: `${Math.max(4, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Most Requested Hardware & Unused Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Most Requested Hardware */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Most Contested & Requested Equipment</span>
              </h3>
              <p className="text-xs text-slate-500">Hardware experiencing highest student demand</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {mostRequestedEquipment.map((eq, idx) => (
              <div key={eq.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">{eq.name}</span>
                    <div className="text-[10px] text-slate-400">{eq.equipment_code} • {eq.department_name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-indigo-600">{eq.request_count}</span>
                  <span className="text-[10px] text-slate-400 block">requests</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Booking Hours & Underutilized Hardware */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Peak Laboratory Booking Times</span>
              </h3>
              <p className="text-xs text-slate-500">Most requested laboratory start hours</p>
            </div>
          </div>

          <div className="space-y-2">
            {peakBookingHours.length === 0 ? (
              <p className="text-xs text-slate-400">No requests submitted yet.</p>
            ) : (
              peakBookingHours.map(hour => (
                <div key={hour.start_time} className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{hour.start_time} Slot</span>
                  <span className="font-mono font-bold text-indigo-600">{hour.count} submissions</span>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Unused Hardware Assets (0 Active Reservations)
            </span>
            <div className="space-y-1.5">
              {unusedResources.map(u => (
                <div key={u.id} className="text-xs text-slate-600 flex items-center justify-between">
                  <span>{u.name} ({u.equipment_code})</span>
                  <span className="text-slate-400 text-[10px]">{u.department_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
