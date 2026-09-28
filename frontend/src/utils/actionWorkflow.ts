import { ApplicationItem, InspectionItem } from '../types';

export type ActionOwner = 'Applicant' | 'Department Officer' | 'Inspection Officer' | 'System';

export interface ActionWorkflowInfo {
  owner: ActionOwner;
  nextAction: string;
  dueDateOrSla: string;
  stageLabel: string;
  isApplicantAction: boolean;
  requirement: string;
}

export const STAGE_LABELS: Record<string, string> = {
  SUBMITTED: 'Initial Submission',
  DOC_VERIFICATION: 'Document Verification',
  DEPT_REVIEW: 'Department Review',
  INSPECTION: 'Site Inspection',
  FINAL_DECISION: 'Final Decision',
  COMPLETED: 'Completed',
};

/**
 * Formats a due date into a clean enterprise standard string (e.g. "02 Oct 2026").
 */
export function formatDueDate(dateStr?: string | null): string {
  if (!dateStr) return 'Due: Action pending';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Due: Action pending';
    const dateFormatted = d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    return `Due: ${dateFormatted}`;
  } catch {
    return 'Due: Action pending';
  }
}

/**
 * Formats remaining SLA into a concise government operational string (e.g. "SLA: 8 days remaining").
 */
export function formatRemainingSla(dateStr?: string | null): string {
  if (!dateStr) return 'SLA: Standard benchmark';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'SLA: Standard benchmark';
    const now = Date.now();
    const diffDays = Math.ceil((d.getTime() - now) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
      return `SLA: ${diffDays} days remaining`;
    } else if (diffDays === 1) {
      return 'SLA: 1 day remaining';
    } else if (diffDays === 0) {
      return 'SLA: Due today';
    } else {
      return `SLA: Overdue by ${Math.abs(diffDays)} days`;
    }
  } catch {
    return 'SLA: Standard benchmark';
  }
}

/**
 * Evaluates the authoritative Action Owner, Next Action, Due Date/SLA, and Workflow Stage
 * strictly from actual workflow, status, document, and inspection data.
 * 
 * Invariant: Does NOT conflate high delay risk with applicant responsibility.
 */
export function getActionWorkflowInfo(
  app: ApplicationItem,
  inspection?: InspectionItem
): ActionWorkflowInfo {
  const stage = app.current_stage || 'SUBMITTED';
  const stageLabel = STAGE_LABELS[stage] || stage.replace(/_/g, ' ');

  // 1. Terminal / Completed States
  if (app.status === 'APPROVED' || app.status === 'COMPLETED' || stage === 'COMPLETED') {
    return {
      owner: 'System',
      nextAction: 'Clearance approved & certificate issued',
      dueDateOrSla: 'Completed',
      stageLabel: 'Completed',
      isApplicantAction: false,
      requirement: 'Statutory compliance satisfied',
    };
  }

  if (app.status === 'REJECTED') {
    return {
      owner: 'System',
      nextAction: 'Application rejected - review departmental statement',
      dueDateOrSla: 'Closed',
      stageLabel: 'Final Decision',
      isApplicantAction: false,
      requirement: 'Administrative decision issued',
    };
  }

  // 2. Applicant-Owned Actions (Genuine applicant requirements only)
  if (app.status === 'DOCUMENTS_REQUIRED') {
    const missingDocs = app.missing_mandatory_documents || [];
    let req = 'Mandatory documentation';
    let nextAct = 'Upload missing mandatory documents';

    if (missingDocs.length > 0) {
      req = missingDocs.slice(0, 2).join(', ') + (missingDocs.length > 2 ? ` (+${missingDocs.length - 2} more)` : '');
      nextAct = `Upload ${missingDocs[0]}`;
    } else if (app.next_action_prompt) {
      nextAct = app.next_action_prompt;
      req = 'Document submission';
    }

    return {
      owner: 'Applicant',
      nextAction: nextAct,
      dueDateOrSla: formatDueDate(app.sla_deadline),
      stageLabel: STAGE_LABELS['DOC_VERIFICATION'] || 'Document Verification',
      isApplicantAction: true,
      requirement: req,
    };
  }

  if (app.status === 'ACTION_REQUIRED') {
    return {
      owner: 'Applicant',
      nextAction: app.next_action_prompt || 'Respond to departmental query & provide clarifications',
      dueDateOrSla: formatDueDate(app.sla_deadline),
      stageLabel: stageLabel,
      isApplicantAction: true,
      requirement: 'Applicant response / clarification',
    };
  }

  if (app.status === 'DRAFT' || app.status === 'NOT_STARTED') {
    return {
      owner: 'Applicant',
      nextAction: 'Submit application & upload initial documents',
      dueDateOrSla: formatDueDate(app.sla_deadline),
      stageLabel: STAGE_LABELS['SUBMITTED'] || 'Initial Submission',
      isApplicantAction: true,
      requirement: 'Initial filing',
    };
  }

  // 3. Inspection Officer Actions
  if (app.status === 'INSPECTION_PENDING' || stage === 'INSPECTION') {
    const insp = inspection || (app.inspections && app.inspections.length > 0 ? app.inspections[0] : null);
    let due = '';
    if (insp && insp.scheduled_date) {
      try {
        const d = new Date(insp.scheduled_date);
        const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        due = `Scheduled: ${dateStr}, ${timeStr}`;
      } catch {
        due = formatRemainingSla(app.sla_deadline);
      }
    } else {
      due = formatRemainingSla(app.sla_deadline);
    }

    return {
      owner: 'Inspection Officer',
      nextAction: 'Complete field inspection',
      dueDateOrSla: due,
      stageLabel: STAGE_LABELS['INSPECTION'] || 'Site Inspection',
      isApplicantAction: false,
      requirement: insp ? (insp.inspection_type || 'Site Inspection') : 'On-Site Field Verification',
    };
  }

  // 4. Department Officer Actions
  let nextAct = 'Complete document scrutiny';
  if (stage === 'SUBMITTED') {
    nextAct = 'Initial desk verification & officer assignment';
  } else if (stage === 'DOC_VERIFICATION') {
    nextAct = 'Complete document scrutiny';
  } else if (stage === 'FINAL_DECISION') {
    nextAct = 'Competent authority final approval decision';
  } else {
    // DEPT_REVIEW or default
    nextAct = app.next_action_prompt || 'Complete document scrutiny';
  }

  return {
    owner: 'Department Officer',
    nextAction: nextAct,
    dueDateOrSla: formatRemainingSla(app.sla_deadline),
    stageLabel: stageLabel,
    isApplicantAction: false,
    requirement: 'Departmental Scrutiny',
  };
}
