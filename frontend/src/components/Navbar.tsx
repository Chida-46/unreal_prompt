import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { RoleSelector } from './RoleSelector';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Sparkles,
  LayoutDashboard,
  Search,
  Calendar,
  FolderGit2,
  BrainCircuit,
  ClipboardCheck,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { role, currentUser } = useRole();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Dynamic links according to selected demo role
  const getNavLinks = () => {
    switch (role) {
      case 'STUDENT':
        return [
          { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/equipment', label: 'Explore Equipment', icon: Search },
          { to: '/my-bookings', label: 'My Bookings', icon: Calendar },
          { to: '/projects', label: 'Projects', icon: FolderGit2 },
          { to: '/ai-recommendations', label: 'AI Allocations', icon: BrainCircuit },
        ];
      case 'FACULTY':
        return [
          { to: '/faculty', label: 'Faculty Dashboard', icon: LayoutDashboard },
          { to: '/faculty/approvals', label: 'Pending Requests', icon: ClipboardCheck },
          { to: '/equipment', label: 'Lab Catalog', icon: Search },
          { to: '/ai-recommendations', label: 'AI Conflict Analysis', icon: BrainCircuit },
        ];
      case 'ADMIN':
        return [
          { to: '/admin', label: 'Overview', icon: LayoutDashboard },
          { to: '/admin/equipment', label: 'Manage Equipment', icon: Search },
          { to: '/admin/departments', label: 'Departments & Labs', icon: ShieldCheck },
          { to: '/admin/maintenance', label: 'Maintenance', icon: Calendar },
          { to: '/admin/analytics', label: 'Analytics', icon: Sparkles },
          { to: '/admin/settings', label: 'Algorithm Settings', icon: BrainCircuit },
        ];
    }
  };

  const links = getNavLinks();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1 font-sans">
                  Lab<span className="text-indigo-600">Link</span>
                </span>
                <span className="hidden sm:block text-[9px] font-semibold text-slate-400 tracking-wider uppercase -mt-1">
                  Campus Lab Sharing
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {links.map(link => {
                const isActive = location.pathname === link.to;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right actions: Role Selector, Notification Dropdown, Demo User Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <RoleSelector />

            <NotificationDropdown />

            {currentUser && (
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200"
                />
                <div className="text-left text-xs leading-tight">
                  <div className="font-semibold text-slate-900 truncate max-w-[120px]">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500">{currentUser.role}</div>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {links.map(link => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
