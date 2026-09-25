import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  showLabel?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showLabel = true, className = '' }) => {
  if (level === 'HIGH') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 animate-pulse ${className}`}
        title="High SLA Delay Risk: Immediate action or escalation required"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
        {showLabel && 'HIGH DELAY RISK'}
      </span>
    );
  }

  if (level === 'MEDIUM') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 ${className}`}
        title="Medium SLA Delay Risk: Near deadline or stage threshold"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        {showLabel && 'NEAR SLA / MEDIUM'}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 ${className}`}
      title="Low SLA Risk: On-track within standard timeline"
    >
      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
      {showLabel && 'ON TRACK / LOW'}
    </span>
  );
};
