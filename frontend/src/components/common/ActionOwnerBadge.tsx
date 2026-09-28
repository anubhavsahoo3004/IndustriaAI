import React from 'react';
import { ActionOwner } from '../../utils/actionWorkflow';

interface ActionOwnerBadgeProps {
  owner: ActionOwner;
  compact?: boolean;
}

export const ActionOwnerBadge: React.FC<ActionOwnerBadgeProps> = ({ owner, compact = false }) => {
  const getBadgeStyle = () => {
    switch (owner) {
      case 'Applicant':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'Department Officer':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Inspection Officer':
        return 'bg-blue-50/70 text-slate-800 border-slate-200';
      case 'System':
        return 'bg-slate-50 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (compact) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getBadgeStyle()}`}>
        {owner}
      </span>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">
        ACTION OWNER
      </span>
      <span className={`inline-flex items-center self-start mt-0.5 px-2 py-0.5 rounded text-xs font-semibold border ${getBadgeStyle()}`}>
        {owner}
      </span>
    </div>
  );
};

interface CurrentActionPanelProps {
  owner: ActionOwner;
  nextAction: string;
  dueDateOrSla: string;
  stageLabel: string;
}

export const CurrentActionPanel: React.FC<CurrentActionPanelProps> = ({
  owner,
  nextAction,
  dueDateOrSla,
  stageLabel,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-3 border-b border-slate-100 pb-1.5 flex items-center justify-between">
        <span>CURRENT ACTION</span>
        <span className="text-[11px] font-mono font-medium text-slate-500 normal-case">{stageLabel} Stage</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
            ACTION OWNER
          </span>
          <span className="text-sm font-semibold text-slate-900 block mt-1">
            {owner}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
            NEXT ACTION
          </span>
          <span className="text-sm font-medium text-slate-800 block mt-1">
            {nextAction}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
            DUE DATE / SLA
          </span>
          <span className="text-sm font-medium text-slate-800 block mt-1">
            {dueDateOrSla}
          </span>
        </div>
      </div>
    </div>
  );
};
