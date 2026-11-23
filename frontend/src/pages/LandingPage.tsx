import React from 'react';
import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import {
  Sparkles,
  ArrowRight,
  Search,
  Cpu,
  Layers,
  Brain,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  GitPullRequest,
  Clock,
  Scale,
  Users,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { role } = useRole();

  const dashboardPath = role === 'STUDENT' ? '/student' : role === 'FACULTY' ? '/faculty' : '/admin';

  const capabilities = [
    {
      icon: Search,
      title: 'Cross-Department Discovery',
      description: 'Break departmental silos. Engineering students can discover high-end instruments across CSE, ECE, EEE, Robotics, and Mechanical laboratories in one place.',
    },
    {
      icon: Brain,
      title: 'GenAI Scheduling Engine',
      description: 'Intelligent conflict resolution engine evaluates project deadline urgency, hardware compatibility, and waiting times to recommend optimal slots.',
    },
    {
      icon: Scale,
      title: 'Fair Resource Allocation',
      description: 'Mathematically guarantees anti-monopolization by prioritizing first-time and under-allocated students over repeat power users.',
    },
    {
      icon: GitPullRequest,
      title: 'Alternative Recommendations',
      description: 'If a slot is contested or undergoing maintenance, the system instantly suggests verified viable slots or compatible equipment from other labs.',
    },
    {
      icon: ShieldCheck,
      title: 'Faculty Approval Workflows',
      description: 'Empowers lab in-charges and department heads with transparent AI priority breakdowns to approve or redirect requests in seconds.',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Utilization Analytics',
      description: 'Live institutional dashboard tracking active utilization, department-level booking velocity, and equipment health metrics.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Discover & Check Availability',
      desc: 'Search 12+ specialized lab resources across 5 engineering departments with real-time slot tracking.',
    },
    {
      step: '02',
      title: 'Submit Project Request',
      desc: 'Define your hardware needs, intended research milestone, and project deadline with preferred time windows.',
    },
    {
      step: '03',
      title: 'Intelligent Conflict Engine',
      desc: 'Our deterministic allocation model detects overlapping requests, computes transparent fairness scores, and resolves contention.',
    },
    {
      step: '04',
      title: 'Faculty Review & Access',
      desc: 'Lab heads confirm allocations with single-click approvals, immediately securing the slot on the campus calendar.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Campus Resource-Sharing & Intelligent Fair Allocation Platform</span>
            </div>

            {/* Tagline & Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Making College Laboratories <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 bg-clip-text text-transparent">More Accessible.</span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              LabLink connects students, faculty, and research facilities across engineering departments. Eliminate scheduling bottlenecks, resolve competing requests, and access specialized equipment fairly.
            </p>

            {/* Direct Entry CTA (No Login / No Signup) */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/equipment"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span>Explore Lab Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to={dashboardPath}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm border border-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <span>Open {role.charAt(0) + role.slice(1).toLowerCase()} Dashboard</span>
              </Link>
            </div>

            {/* Micro demo indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Instant Access (No Login)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 12+ Seeded Lab Workstations
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transparent Scoring (35/25/15/15/10)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hardware Showcase */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Cross-Department Hardware</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">High-Demand Laboratory Resources</h2>
            </div>
            <Link to="/equipment" className="mt-3 md:mt-0 text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <span>View all 12 items</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                code: 'EQ-FPGA-01',
                name: 'FPGA Development Kit',
                dept: 'ECE Dept',
                category: 'FPGA Development',
                specs: 'Xilinx Artix-7, 256MB DDR3, Vivado Suite',
                icon: Layers,
              },
              {
                code: 'EQ-JETSON-01',
                name: 'NVIDIA Jetson Nano',
                dept: 'CSE Dept',
                category: 'AI & Robotics',
                specs: '128-core Maxwell GPU, Quad ARM Cortex, 4GB RAM',
                icon: Cpu,
              },
              {
                code: 'EQ-SCOPE-01',
                name: 'Digital Oscilloscope',
                dept: 'EEE Dept',
                category: 'Electronics',
                specs: 'Keysight 200MHz, 4 channels, 2 GSa/s',
                icon: Brain,
              },
              {
                code: 'EQ-HPC-01',
                name: 'HPC Computing Station',
                dept: 'CSE Dept',
                category: 'Computing',
                specs: 'Dual RTX 4090 (48GB VRAM), 128GB RAM',
                icon: Sparkles,
              },
            ].map(item => {
              const ItemIcon = item.icon;
              return (
                <div key={item.code} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                    <ItemIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 block">{item.code}</span>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">{item.name}</h3>
                  <p className="text-xs text-indigo-600 font-medium mt-1">{item.dept} • {item.category}</p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-1">{item.specs}</p>
                  <Link
                    to="/equipment"
                    className="mt-4 block text-center py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 transition"
                  >
                    Check Availability
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Engineered for Academic Impact</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Why Universities Choose LabLink</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Replacing manual paper registers and fragmented emails with automated conflict resolution and transparent fairness guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((cap, i) => {
              const CapIcon = cap.icon;
              return (
                <div key={i} className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition duration-200">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center mb-4">
                    <CapIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{cap.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{cap.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works / Workflow Steps */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Seamless Workflow</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">From Request to Reservation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, idx) => (
              <div key={idx} className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-3xl font-black text-indigo-100 block mb-2">{st.step}</span>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{st.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligent Scheduling Feature Deep Dive Banner */}
      <section className="py-16 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Under the Hood</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 leading-snug">
                Transparent Weighted Allocation Formula
              </h2>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed max-w-xl">
                When multiple students request overlapping time slots for contested hardware like the FPGA kit, LabLink calculates deterministic composite priority scores without opaque black-box AI overrides.
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-white/10 border border-white/10">
                  <div className="font-bold text-amber-300 text-lg">35%</div>
                  <div className="text-slate-300 font-medium">Deadline Urgency</div>
                </div>
                <div className="p-3 rounded-lg bg-white/10 border border-white/10">
                  <div className="font-bold text-indigo-300 text-lg">25%</div>
                  <div className="text-slate-300 font-medium">Tech Compatibility</div>
                </div>
                <div className="p-3 rounded-lg bg-white/10 border border-white/10">
                  <div className="font-bold text-emerald-300 text-lg">15%</div>
                  <div className="text-slate-300 font-medium">Waiting Queue</div>
                </div>
                <div className="p-3 rounded-lg bg-white/10 border border-white/10">
                  <div className="font-bold text-purple-300 text-lg">15%</div>
                  <div className="text-slate-300 font-medium">Historical Fairness</div>
                </div>
                <div className="p-3 rounded-lg bg-white/10 border border-white/10">
                  <div className="font-bold text-cyan-300 text-lg">10%</div>
                  <div className="text-slate-300 font-medium">Lab Feasibility</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/5 p-6 rounded-2xl border border-white/15 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Brain className="w-4 h-4" /> Live Engine Output
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono text-[10px]">
                  Determinism: 100%
                </span>
              </div>
              <div className="mt-4 space-y-3 font-mono text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Candidate 1 (Deadline in 3d):</span>
                  <span className="text-emerald-400 font-bold">Score 89.2 / 100</span>
                </div>
                <div className="flex justify-between">
                  <span>Candidate 2 (Deadline in 22d):</span>
                  <span className="text-amber-400 font-bold">Score 61.4 / 100</span>
                </div>
                <div className="p-2.5 rounded-md bg-indigo-900/40 text-[11px] text-indigo-200 mt-2 border border-indigo-500/30">
                  ✓ Recommended: Allocate Candidate 1<br />
                  💡 Suggest next-day slot or Jetson alternative to Candidate 2
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white text-slate-500 text-xs border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>LabLink — Making College Laboratories More Accessible</span>
          </div>
          <p className="text-center sm:text-right">
            Academic Project Demonstration • Open-Access Mode • Built for Cross-Department Collaboration
          </p>
        </div>
      </footer>
    </div>
  );
};
