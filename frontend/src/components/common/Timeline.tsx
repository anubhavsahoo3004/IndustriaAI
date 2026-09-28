import React from 'react';
import { Check, Clock, AlertCircle, Circle } from 'lucide-react';
import { WorkflowStep } from '../../types';

interface TimelineProps {
  steps: WorkflowStep[];
  currentStage?: string;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ steps, currentStage, className = '' }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-500">
        No workflow stages recorded.
      </div>
    );
  }

  const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative pl-7">
        {/* Continuous track line */}
        <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-200" />

        {sortedSteps.map((step, idx) => {
          const isCompleted = step.status === 'COMPLETED';
          const isInProgress = !isCompleted && (step.status === 'IN_PROGRESS' || (step.step_key === currentStage && currentStage !== 'COMPLETED'));
          const isActionReq = !isCompleted && step.status === 'ACTION_REQUIRED';

          return (
            <div key={step.id || idx} className="relative mb-4 last:mb-0">
              {/* Step indicator node */}
              <div
                className={`absolute -left-[27px] top-0.5 flex items-center justify-center w-6 h-6 rounded-full border bg-white text-xs ${
                  isCompleted
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : isInProgress
                    ? 'border-slate-800 bg-slate-900 text-white font-bold'
                    : isActionReq
                    ? 'border-amber-600 bg-amber-50 text-amber-700 font-bold'
                    : 'border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                ) : isInProgress ? (
                  <span className="w-2 h-2 rounded-full bg-white" />
                ) : isActionReq ? (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                ) : (
                  <span className="text-[10px] text-slate-400">{step.step_order}</span>
                )}
              </div>

              {/* Step content card */}
              <div
                className={`p-3.5 rounded-lg border bg-white ${
                  isInProgress
                    ? 'border-slate-400 shadow-xs'
                    : isActionReq
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Step {step.step_order}: {step.step_name}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isInProgress
                          ? 'bg-slate-100 text-slate-800 border-slate-300 font-semibold'
                          : isActionReq
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {step.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {step.completed_at && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      Completed: {new Date(step.completed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {step.officer_notes && (
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-1.5">
                    {step.officer_notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
