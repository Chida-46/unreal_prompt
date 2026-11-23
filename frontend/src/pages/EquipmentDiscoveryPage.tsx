import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Equipment, EquipmentCategory, Department, Laboratory } from '../types';
import { EquipmentCard } from '../components/EquipmentCard';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Layers,
  Building2,
  Sparkles,
} from 'lucide-react';

export const EquipmentDiscoveryPage: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'availability' | 'department'>('name');

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getDepartments(),
    ]).then(([cats, depts]) => {
      setCategories(cats);
      setDepartments(depts);
    }).catch(console.error);
  }, []);

  const fetchEquipment = () => {
    setLoading(true);
    api.getEquipment({
      search: search || undefined,
      departmentId: selectedDept || undefined,
      categoryId: selectedCategory || undefined,
      status: selectedStatus || undefined,
      sortBy,
      sortOrder: 'asc',
    })
      .then(setEquipmentList)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchEquipment, 150);
    return () => clearTimeout(timer);
  }, [search, selectedDept, selectedCategory, selectedStatus, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setSelectedDept('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSortBy('name');
  };

  const hasActiveFilters = Boolean(search || selectedDept || selectedCategory || selectedStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Cross-Department Catalog</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Equipment Discovery</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and schedule specialized instrumentation across all 5 engineering departments.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-900">{equipmentList.length}</strong> equipment items
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search bar */}
        <div className="relative">
          <label htmlFor="equipment-search" className="sr-only">
            Search equipment catalog
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            id="equipment-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by equipment name, hardware keywords, FPGA, Jetson, Oscilloscope, Vivado..."
            aria-label="Search equipment by keyword, hardware, or model"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Department Filter */}
          <div>
            <label htmlFor="filter-department" className="block text-[11px] font-semibold text-slate-600 mb-1">
              Department
            </label>
            <select
              id="filter-department"
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="filter-category" className="block text-[11px] font-semibold text-slate-600 mb-1">
              Category
            </label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Availability Status Filter */}
          <div>
            <label htmlFor="filter-status" className="block text-[11px] font-semibold text-slate-600 mb-1">
              Availability
            </label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="IN_USE">In Use</option>
              <option value="RESERVED">Reserved</option>
              <option value="MAINTENANCE">In Maintenance</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="filter-sort" className="block text-[11px] font-semibold text-slate-600 mb-1">
              Sort By
            </label>
            <select
              id="filter-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="name">Alphabetical (A - Z)</option>
              <option value="availability">Availability Status</option>
              <option value="department">Department</option>
            </select>
          </div>
        </div>

        {/* Active filter clear pill */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Filtered results</span>
            <button
              onClick={clearFilters}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Equipment Cards Grid */}
      <div aria-live="polite" aria-atomic="false">
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading catalog...
        </div>
      ) : equipmentList.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No equipment matched your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or exploring other departments.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs hover:bg-indigo-100 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipmentList.map(eq => (
            <EquipmentCard key={eq.id} equipment={eq} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
