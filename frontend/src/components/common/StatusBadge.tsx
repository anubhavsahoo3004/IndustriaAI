import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeConfig = (st: string) => {
    switch (st?.toUpperCase()) {
      case 'APPROVED':
      case 'COMPLETED':
      case 'VERIFIED':
      case 'MATCH':
      case 'PASSED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'UNDER_REVIEW':
      case 'IN_PROGRESS':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'INSPECTION_PENDING':
      case 'SCHEDULED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'DOCUMENTS_REQUIRED':
      case 'UPCOMING':
      case 'DUE_SOON':
      case 'WARNING':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'ACTION_REQUIRED':
      case 'POTENTIAL_MISMATCH':
      case 'REJECTED':
      case 'OVERDUE':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'SUBMITTED':
      case 'ATTACHED':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatText = (st: string) => {
    if (!st) return 'Pending';
    return st.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getBadgeConfig(
        status
      )} ${className}`}
    >
      {formatText(status)}
    </span>
  );
};
