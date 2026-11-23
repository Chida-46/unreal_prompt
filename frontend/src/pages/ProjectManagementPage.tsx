import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { api } from '../services/api';
import { Project, Department } from '../types';
import { Modal } from '../components/Modal';
import {
  FolderGit2,
  Plus,
  Calendar,
  Building2,
  Code,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProjectManagementPage: React.FC = () => {
  const { currentUser } = useRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // New Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Embedded Systems');
  const [departmentId, setDepartmentId] = useState('');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [techStack, setTechStack] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchProjects = () => {
    if (!currentUser) return;
    setLoading(true);
    Promise.all([
      api.getProjects({ studentId: currentUser.id }),
      api.getDepartments(),
    ])
      .then(([projs, depts]) => {
        setProjects(projs);
        setDepartments(depts);
        if (depts.length > 0 && !departmentId) {
          setDepartmentId(depts[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, [currentUser]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);

    try {
      await api.createProject({
        title,
        description,
        category,
        departmentId: departmentId || departments[0]?.id,
        studentId: currentUser.id,
        deadline,
        techStack,
      }, currentUser);

      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setTechStack('');
      setSuccessMsg('Academic project registered successfully!');
      fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Academic Research</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered research projects and capstone initiatives for {currentUser?.name}.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
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

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
          <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No projects created</h3>
          <p className="mt-1">Create a project to request specialized laboratory equipment.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {p.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">{p.title}</h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {p.description}
                </p>

                {p.techStack && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Code className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{p.techStack}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Deadline: <strong>{new Date(p.deadline).toISOString().split('T')[0]}</strong></span>
                </div>
                <Link
                  to="/equipment"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Request Hardware</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Academic Project"
        description="Define your research project details to request lab resources."
      >
        <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Real-Time Image Processing System"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project Description & Scope</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the research goals, methods, and expected deliverables..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
              >
                <option value="FPGA Development">FPGA Development</option>
                <option value="Embedded Systems">Embedded Systems</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Internet of Things">Internet of Things</option>
                <option value="Robotics">Robotics</option>
                <option value="Electronics Testing">Electronics Testing</option>
                <option value="3D Prototyping">3D Prototyping</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Project Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tech Stack & Tools</label>
              <input
                type="text"
                value={techStack}
                onChange={e => setTechStack(e.target.value)}
                placeholder="e.g., Vivado, Verilog, Python, ROS2"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Register Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
