import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { api } from '../services/api';
import { Department, Laboratory } from '../types';
import { Modal } from '../components/Modal';
import {
  Building2,
  Plus,
  DoorOpen,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const AdminDepartmentsPage: React.FC = () => {
  const { currentUser } = useRole();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);

  // Department Modal
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Lab Modal
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [labName, setLabName] = useState('');
  const [labRoom, setLabRoom] = useState('');
  const [labDeptId, setLabDeptId] = useState('');
  const [labHours, setLabHours] = useState('08:00 - 18:00');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.getDepartments(),
      api.getLaboratories(),
    ])
      .then(([depts, labs]) => {
        setDepartments(depts);
        setLaboratories(labs);
        if (depts.length > 0 && !labDeptId) {
          setLabDeptId(depts[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDepartment({ code: deptCode, name: deptName, description: deptDesc }, currentUser);
      setDeptModalOpen(false);
      setDeptCode('');
      setDeptName('');
      setDeptDesc('');
      setSuccessMsg('Department registered successfully.');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create department');
    }
  };

  const handleCreateLab = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLaboratory({
        name: labName,
        roomNumber: labRoom,
        departmentId: labDeptId,
        operatingHours: labHours,
      }, currentUser);
      setLabModalOpen(false);
      setLabName('');
      setLabRoom('');
      setSuccessMsg('Laboratory room created successfully.');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create laboratory');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Infrastructure</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Departments & Laboratories</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure campus engineering faculties, physical laboratory rooms, and standard access schedules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeptModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
          <button
            onClick={() => setLabModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lab Room</span>
          </button>
        </div>
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

      {/* Departments Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-600" />
          <span>Registered Academic Departments ({departments.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map(dept => {
            const deptLabs = laboratories.filter(l => l.departmentId === dept.id);

            return (
              <div key={dept.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                      {dept.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{dept.name}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {dept.description || 'Engineering department facilities.'}
                </p>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Associated Labs ({deptLabs.length})
                  </span>
                  <div className="space-y-1.5">
                    {deptLabs.map(lab => (
                      <div key={lab.id} className="p-2 rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">{lab.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {lab.roomNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Dept Modal */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title="Register New Academic Department"
        maxWidth="md"
      >
        <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department Code</label>
            <input
              type="text"
              value={deptCode}
              onChange={e => setDeptCode(e.target.value.toUpperCase())}
              placeholder="e.g., AERO, BIO, CHEM"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs font-mono"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department Name</label>
            <input
              type="text"
              value={deptName}
              onChange={e => setDeptName(e.target.value)}
              placeholder="e.g., Aerospace Engineering"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={deptDesc}
              onChange={e => setDeptDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeptModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition"
            >
              Register Department
            </button>
          </div>
        </form>
      </Modal>

      {/* New Lab Modal */}
      <Modal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        title="Create New Laboratory Room"
        maxWidth="md"
      >
        <form onSubmit={handleCreateLab} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Laboratory Name</label>
            <input
              type="text"
              value={labName}
              onChange={e => setLabName(e.target.value)}
              placeholder="e.g., Digital Signal Processing Lab"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Room / Block Number</label>
            <input
              type="text"
              value={labRoom}
              onChange={e => setLabRoom(e.target.value)}
              placeholder="e.g., Lab Block 401"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Owning Department</label>
            <select
              value={labDeptId}
              onChange={e => setLabDeptId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Operating Hours</label>
            <input
              type="text"
              value={labHours}
              onChange={e => setLabHours(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setLabModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition"
            >
              Create Laboratory
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
