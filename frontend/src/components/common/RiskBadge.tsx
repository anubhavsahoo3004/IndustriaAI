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
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 ${className}`}
        title="High SLA Delay Risk: Immediate action or escalation required"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
        {showLabel && 'High Delay Risk'}
      </span>
    );
  }

  if (level === 'MEDIUM') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        title="Medium SLA Delay Risk: Near deadline or stage threshold"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        {showLabel && 'Near SLA'}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
      title="Low SLA Risk: On-track within standard timeline"
    >
      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
      {showLabel && 'On Track'}
    </span>
  );
};
