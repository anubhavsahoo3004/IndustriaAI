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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      case 'UNDER_REVIEW':
      case 'IN_PROGRESS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800';
      case 'INSPECTION_PENDING':
      case 'SCHEDULED':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800';
      case 'DOCUMENTS_REQUIRED':
      case 'UPCOMING':
      case 'DUE_SOON':
      case 'WARNING':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
      case 'ACTION_REQUIRED':
      case 'POTENTIAL_MISMATCH':
      case 'REJECTED':
      case 'OVERDUE':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
      case 'SUBMITTED':
      case 'ATTACHED':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const formatText = (st: string) => {
    if (!st) return 'Pending';
    return st.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeConfig(
        status
      )} ${className}`}
    >
      {formatText(status)}
    </span>
  );
};
