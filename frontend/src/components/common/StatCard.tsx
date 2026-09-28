import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  badge?: {
    text: string;
    variant: 'positive' | 'warning' | 'danger' | 'neutral';
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-lg p-4 shadow-xs transition-colors ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:bg-slate-50/50' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-600 truncate">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </span>
        {badge && (
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
              badge.variant === 'danger'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : badge.variant === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : badge.variant === 'positive'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
