import React from 'react';
import { Equipment } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  Cpu,
  Layers,
  Wifi,
  Brain,
  Activity,
  Printer,
  CircuitBoard,
  Server,
  Bot,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface EquipmentCardProps {
  equipment: Equipment;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment }) => {
  // Map icon names to Lucide icons
  const iconMap: Record<string, any> = {
    Cpu,
    Layers,
    Wifi,
    Brain,
    Activity,
    Printer,
    CircuitBoard,
    Server,
    Bot,
  };

  const Icon = iconMap[equipment.iconSvg || ''] || Cpu;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between group overflow-hidden">
      <div>
        {/* Header / Category & Code */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-semibold text-slate-400 block tracking-tight">
                  {equipment.equipmentCode}
                </span>
                <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-full inline-block">
                  {equipment.category.name}
                </span>
              </div>
            </div>
            <StatusBadge status={equipment.status} size="sm" />
          </div>

          <h3 className="font-bold text-slate-900 text-base mt-3 leading-snug group-hover:text-indigo-600 transition">
            {equipment.name}
          </h3>

          <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {equipment.description}
          </p>
        </div>

        {/* Specifications snippet & Location meta */}
        <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">
              {equipment.laboratory.name} ({equipment.laboratory.roomNumber})
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span className="font-semibold text-slate-700">Dept:</span>
            <span className="truncate">{equipment.department.name}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Max duration: <strong className="text-slate-700">{equipment.maxDurationHours} hours</strong> / session</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-3 border-t border-slate-100 bg-white">
        <Link
          to={`/equipment/${equipment.id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-600 hover:text-white transition-all duration-150"
        >
          <span>View Details & Schedule</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
