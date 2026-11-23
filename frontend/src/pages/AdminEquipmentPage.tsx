import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { api } from '../services/api';
import { Equipment, EquipmentCategory, Department, Laboratory } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  Cpu,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
} from 'lucide-react';

export const AdminEquipmentPage: React.FC = () => {
  const { currentUser } = useRole();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [equipmentCode, setEquipmentCode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [laboratoryId, setLaboratoryId] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [status, setStatus] = useState<'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RESERVED'>('AVAILABLE');
  const [maxDurationHours, setMaxDurationHours] = useState(4);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [modelNumber, setModelNumber] = useState('');

  const fetchCatalog = () => {
    setLoading(true);
    Promise.all([
      api.getEquipment({ search: search || undefined }),
      api.getCategories(),
      api.getDepartments(),
      api.getLaboratories(),
    ])
      .then(([eqs, cats, depts, labs]) => {
        setEquipmentList(eqs);
        setCategories(cats);
        setDepartments(depts);
        setLaboratories(labs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCatalog();
  }, [search]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setEquipmentCode(`EQ-${Math.random().toString(36).substring(2, 6).toUpperCase()}-01`);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDepartmentId(departments[0]?.id || '');
    setLaboratoryId(laboratories[0]?.id || '');
    setDescription('');
    setSpecifications('');
    setStatus('AVAILABLE');
    setMaxDurationHours(4);
    setRequiresApproval(true);
    setModelNumber('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (eq: Equipment) => {
    setEditingId(eq.id);
    setEquipmentCode(eq.equipmentCode);
    setName(eq.name);
    setCategoryId(eq.categoryId);
    setDepartmentId(eq.departmentId);
    setLaboratoryId(eq.laboratoryId);
    setDescription(eq.description);
    setSpecifications(eq.specifications);
    setStatus(eq.status);
    setMaxDurationHours(eq.maxDurationHours);
    setRequiresApproval(eq.requiresApproval);
    setModelNumber(eq.modelNumber || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, eqName: string) => {
    if (!window.confirm(`Delete ${eqName} permanently from the campus catalog?`)) return;
    try {
      await api.deleteEquipment(id, currentUser);
      setSuccessMsg(`Deleted ${eqName} successfully.`);
      fetchCatalog();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateEquipment(editingId, {
          name,
          categoryId,
          departmentId,
          laboratoryId,
          description,
          specifications,
          status,
          maxDurationHours,
          requiresApproval,
          modelNumber,
        }, currentUser);
        setSuccessMsg(`Updated ${name} successfully.`);
      } else {
        await api.createEquipment({
          equipmentCode,
          name,
          categoryId: categoryId || categories[0]?.id,
          departmentId: departmentId || departments[0]?.id,
          laboratoryId: laboratoryId || laboratories[0]?.id,
          description,
          specifications,
          status,
          maxDurationHours,
          requiresApproval,
          modelNumber,
        }, currentUser);
        setSuccessMsg(`Created ${name} successfully.`);
      }
      setIsModalOpen(false);
      fetchCatalog();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Inventory Control</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Equipment Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Register and manage laboratory instrumentation across all campus departments.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Equipment</span>
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

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter equipment by code, name, specs, or department..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-purple-500 shadow-xs"
        />
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Code / Asset ID</th>
                <th className="py-3 px-4">Equipment Name</th>
                <th className="py-3 px-4">Department & Lab</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Limit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading catalog...</td>
                </tr>
              ) : equipmentList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No equipment found.</td>
                </tr>
              ) : (
                equipmentList.map(eq => (
                  <tr key={eq.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{eq.equipmentCode}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{eq.name}</td>
                    <td className="py-3 px-4">
                      <div>{eq.department.name}</div>
                      <div className="text-[10px] text-slate-400">{eq.laboratory.name} ({eq.laboratory.roomNumber})</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                        {eq.category.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={eq.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-medium">{eq.maxDurationHours}h</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(eq)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        title="Edit equipment"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(eq.id, eq.name)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete equipment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Equipment Details' : 'Register New Laboratory Equipment'}
        description="Provide comprehensive specs and location mapping."
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Equipment Code</label>
              <input
                type="text"
                value={equipmentCode}
                onChange={e => setEquipmentCode(e.target.value)}
                disabled={Boolean(editingId)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs font-mono disabled:bg-slate-100"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Equipment Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Digital Signal Oscilloscope"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
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
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Laboratory Room</label>
              <select
                value={laboratoryId}
                onChange={e => setLaboratoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
              >
                {laboratories.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.roomNumber})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
              >
                <option value="AVAILABLE">Available</option>
                <option value="IN_USE">In Use</option>
                <option value="MAINTENANCE">In Maintenance</option>
                <option value="RESERVED">Reserved</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Duration (Hours)</label>
              <input
                type="number"
                min={1}
                max={12}
                value={maxDurationHours}
                onChange={e => setMaxDurationHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model / Part Number</label>
              <input
                type="text"
                value={modelNumber}
                onChange={e => setModelNumber(e.target.value)}
                placeholder="e.g. Artix-7 A100T"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Short Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Summary of hardware utility and core use-case..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Technical Specifications</label>
            <textarea
              rows={3}
              value={specifications}
              onChange={e => setSpecifications(e.target.value)}
              placeholder="Clock speed, memory depth, supported protocols, logic gates, operating voltages..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-xs font-mono"
              required
            />
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
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition"
            >
              {editingId ? 'Save Changes' : 'Register Equipment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
