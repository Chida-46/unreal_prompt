import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { Role } from '../types';
import { GraduationCap, Briefcase, ShieldCheck, ChevronDown, Check, UserCheck } from 'lucide-react';

export const RoleSelector: React.FC = () => {
  const { role, currentUser, allUsers, setRole, switchUserById } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const roles: { id: Role; label: string; icon: any; color: string; desc: string; targetPath: string }[] = [
    {
      id: 'STUDENT',
      label: 'Student',
      icon: GraduationCap,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      desc: 'Browse catalog, request equipment & view AI suggestions',
      targetPath: '/student',
    },
    {
      id: 'FACULTY',
      label: 'Faculty',
      icon: Briefcase,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      desc: 'Review project requests, verify AI priority scores & approve bookings',
      targetPath: '/faculty',
    },
    {
      id: 'ADMIN',
      label: 'Administrator',
      icon: ShieldCheck,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      desc: 'Manage equipment, configure scheduling weights & inspect analytics',
      targetPath: '/admin',
    },
  ];

  const currentRoleConfig = roles.find(r => r.id === role) || roles[0];
  const Icon = currentRoleConfig.icon;

  const usersForActiveRole = allUsers.filter(u => u.role === role);

  const handleRoleSelect = (selectedRole: Role, targetPath: string) => {
    setRole(selectedRole);
    setIsOpen(false);
    navigate(targetPath);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition shadow-sm"
        aria-label="Switch demonstration role and profile"
        aria-expanded={isOpen}
      >
        <div className={`p-1 rounded-md ${currentRoleConfig.color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="text-left hidden sm:block leading-tight">
          <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Demo Role</div>
          <div className="font-semibold text-slate-900">{currentRoleConfig.label}</div>
        </div>
        <div className="text-left text-xs font-semibold sm:hidden text-slate-900">
          {currentRoleConfig.label}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Select Demonstration Role
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Instant switch without login or authentication.
              </p>
            </div>

            <div className="p-1.5 space-y-1">
              {roles.map(r => {
                const RoleIcon = r.icon;
                const isSelected = r.id === role;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSelect(r.id, r.targetPath)}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition ${
                      isSelected
                        ? 'bg-indigo-50/70 border border-indigo-200/80 text-indigo-950'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md mt-0.5 ${r.color}`}>
                      <RoleIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900">{r.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {usersForActiveRole.length > 1 && (
              <div className="border-t border-slate-100 mt-2 pt-2 px-3 pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch {currentRoleConfig.label} Account (for multi-user test)
                </span>
                <div className="mt-1.5 space-y-1 max-h-36 overflow-y-auto">
                  {usersForActiveRole.map(u => {
                    const isCurrent = currentUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUserById(u.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition ${
                          isCurrent
                            ? 'bg-slate-100 font-semibold text-slate-900'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span>{u.name}</span>
                        </div>
                        {isCurrent && <span className="text-[10px] text-indigo-600 font-bold uppercase">Active</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
