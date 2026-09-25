import React from 'react';
import { CheckCircle2, Clock, AlertCircle, CircleDashed } from 'lucide-react';
import { WorkflowStep } from '../../types';

interface TimelineProps {
  steps: WorkflowStep[];
  currentStage?: string;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ steps, currentStage, className = '' }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-500">
        No workflow stages recorded.
      </div>
    );
  }

  const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="relative pl-6 sm:pl-8">
        {/* Continuous track line */}
        <div className="absolute left-[15px] sm:left-[19px] top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800" />

        {sortedSteps.map((step, idx) => {
          const isCompleted = step.status === 'COMPLETED';
          const isInProgress = !isCompleted && (step.status === 'IN_PROGRESS' || (step.step_key === currentStage && currentStage !== 'COMPLETED'));
          const isActionReq = !isCompleted && step.status === 'ACTION_REQUIRED';

          return (
            <div key={step.id || idx} className="relative mb-6 last:mb-0">
              {/* Step indicator node */}
              <div
                className={`absolute -left-[24px] sm:-left-[32px] top-0.5 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white dark:bg-slate-900 transition-all ${
                  isCompleted
                    ? 'border-emerald-500 text-emerald-500 shadow-sm'
                    : isInProgress
                    ? 'border-blue-600 text-blue-600 ring-4 ring-blue-100 dark:ring-blue-950/50'
                    : isActionReq
                    ? 'border-amber-500 text-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/50'
                    : 'border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 fill-emerald-50 text-emerald-600 dark:fill-emerald-950/30" />
                ) : isInProgress ? (
                  <Clock className="w-4 h-4 animate-spin text-blue-600" />
                ) : isActionReq ? (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                ) : (
                  <CircleDashed className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {/* Step content card */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isInProgress
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                    : isCompleted
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Stage {step.step_order}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {step.step_name}
                    </h4>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full self-start sm:self-auto ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : isInProgress
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                        : isActionReq
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>

                {step.officer_notes && (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <strong className="text-slate-700 dark:text-slate-200">Remarks:</strong> {step.officer_notes}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  {step.started_at && (
                    <span>Started: {new Date(step.started_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  )}
                  {step.completed_at && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Completed: {new Date(step.completed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
