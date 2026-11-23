import React from 'react';
import { BookingStatus } from '../types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Ban,
  CheckCheck,
} from 'lucide-react';

interface StatusBadgeProps {
  status: BookingStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
    PENDING: {
      label: 'Pending Review',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Clock,
    },
    APPROVED: {
      label: 'Approved',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle2,
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: XCircle,
    },
    CONFLICT_DETECTED: {
      label: 'Conflict Detected',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-300',
      icon: AlertTriangle,
    },
    ALTERNATIVE_SUGGESTED: {
      label: 'Alternative Suggested',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: Lightbulb,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: Ban,
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: CheckCheck,
    },
    AVAILABLE: {
      label: 'Available',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle2,
    },
    IN_USE: {
      label: 'In Use',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: Clock,
    },
    MAINTENANCE: {
      label: 'In Maintenance',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: AlertTriangle,
    },
    RESERVED: {
      label: 'Reserved',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: Clock,
    },
  };

  const config = configs[status] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: Clock,
  };

  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${config.bg} ${config.text} ${config.border} ${
        isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
