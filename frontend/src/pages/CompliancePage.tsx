import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  Plus,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ComplianceService } from '../services/compliance.service';
import { ComplianceTaskItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const CompliancePage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const [tasks, setTasks] = useState<ComplianceTaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Task Modal state
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Pollution Monitoring');
  const [newAuthority, setNewAuthority] = useState('MPCB');
  const [newFrequency, setNewFrequency] = useState('Annual');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPenalty, setNewPenalty] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmModalTask, setConfirmModalTask] = useState<ComplianceTaskItem | null>(null);

  const fetchTasks = async () => {
    if (!activeBusiness) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await ComplianceService.listByBusiness(activeBusiness.id);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load compliance tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeBusiness]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness || !newTitle || !newDueDate) return;

    setCreating(true);
    try {
      await ComplianceService.create({
        business_id: activeBusiness.id,
        title: newTitle,
        category: newCategory,
        issuing_authority: newAuthority,
        frequency: newFrequency,
        due_date: new Date(newDueDate).toISOString(),
        penalty_risk_desc: newPenalty,
        action_instructions: newInstructions,
        status: 'UPCOMING',
      });
      setShowModal(false);
      // Reset form
      setNewTitle('');
      setNewPenalty('');
      setNewInstructions('');
      await fetchTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (task: ComplianceTaskItem) => {
    const nextStatus = task.status === 'COMPLETED' ? 'UPCOMING' : 'COMPLETED';
    try {
      await ComplianceService.update(task.id, { status: nextStatus });
      setConfirmModalTask(null);
      await fetchTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Statutory Compliance Calendar
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full">
              {tasks.length} Recurring Mandates
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track periodic environmental returns, water quality testing, factory safety drills, and boiler renewal filings.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Compliance Task
        </button>
      </div>

      {/* Statutory Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Statutory Compliance Disclaimer:</strong> Recurring mandates are derived from Maharashtra pollution, factory safety, and food safety regulations under SIH26130. <em>IndustriaAI provides proactive tracking alerts and checklist guidance but does not file statutory returns or substitute official regulatory certifications.</em>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Loading compliance calendar...
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-3">
          <ClipboardList className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No compliance tasks scheduled.</h3>
          <p className="text-xs text-slate-400">Add periodic statutory compliance milestones to avoid penalties.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const isDueSoon = task.status === 'DUE_SOON';

            return (
              <div
                key={task.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  isCompleted
                    ? 'border-emerald-200 dark:border-emerald-950 bg-emerald-50/20'
                    : isDueSoon
                    ? 'border-amber-300 dark:border-amber-900 bg-amber-50/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                          {task.category}
                        </span>
                        {task.verification_status === 'VERIFIED' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified Mandate
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1">
                            Prototype Task
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                        {task.title}
                      </h3>
                      {task.legal_act_reference && (
                        <span className="text-[10px] text-slate-400 italic block mt-0.5">
                          Rule: {task.legal_act_reference}
                        </span>
                      )}
                    </div>
                    <StatusBadge status={task.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Authority</span>
                      <strong className="text-slate-800 dark:text-slate-200">{task.issuing_authority}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Frequency</span>
                      <strong className="text-slate-800 dark:text-slate-200">{task.frequency}</strong>
                    </div>
                  </div>

                  {task.action_instructions && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                      <strong>Action:</strong> {task.action_instructions}
                    </div>
                  )}

                  {task.source_reference && (
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Ref: <strong className="text-slate-700 dark:text-slate-300">{task.source_reference}</strong></span>
                      {task.source_url && (
                        <a
                          href={task.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 font-semibold"
                        >
                          Official Portal &rarr;
                        </a>
                      )}
                    </div>
                  )}

                  {task.penalty_risk_desc && (
                    <div className="text-[11px] text-rose-700 dark:text-rose-300 p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1">
                      <div className="flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Indicative Penalty Risk:</strong> {task.penalty_risk_desc}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block pl-5 italic">
                        Enforcement and actual penalties are determined by {task.issuing_authority} pursuant to applicable law.
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Due: <strong>{new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                  </span>

                  <button
                    onClick={() => {
                      if (isCompleted) {
                        handleToggleStatus(task);
                      } else {
                        setConfirmModalTask(task);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isCompleted ? 'Mark Incomplete' : 'Mark Task Done'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Recurring Compliance Mandate"
        subtitle={`Track compliance for ${activeBusiness?.name}`}
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Compliance Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MPCB Environmental Statement (Form V)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value="Pollution Monitoring">Pollution Monitoring</option>
                <option value="Fire Safety Drill">Fire Safety Drill</option>
                <option value="Labour Return Filing">Labour Return Filing</option>
                <option value="Boiler Inspection">Boiler Inspection</option>
                <option value="FSSAI Testing">FSSAI Testing</option>
                <option value="Electricity Duty Exemption">Electricity Duty Exemption</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Issuing Authority
              </label>
              <input
                type="text"
                value={newAuthority}
                onChange={(e) => setNewAuthority(e.target.value)}
                placeholder="MPCB / DISH / FDA"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Frequency
              </label>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Next Due Date *
              </label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Statutory Action Instructions
            </label>
            <textarea
              rows={2}
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              placeholder="e.g. Collect water samples from ETP outlet and submit NABL analysis report."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Penalty / Non-compliance Risk Description
            </label>
            <input
              type="text"
              value={newPenalty}
              onChange={(e) => setNewPenalty(e.target.value)}
              placeholder="e.g. ₹25,000 fine + statutory notice under Environment Protection Act"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {creating ? 'Adding...' : 'Add Mandate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Mark Task Done Confirmation Modal */}
      {confirmModalTask && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmModalTask(null)}
          title="Confirm Internal Task Completion"
          subtitle={confirmModalTask.title}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Internal Workflow Recording Notice
              </div>
              <p className="leading-relaxed">
                Marking this mandate as done records <strong>internal operational completion</strong> within IndustriaAI for your organization&apos;s compliance monitoring history.
              </p>
              <div className="pt-1 text-[11px] border-t border-amber-200/80 dark:border-amber-800/60">
                <strong>Important Statutory Notice:</strong> This action records completion in IndustriaAI and <em>does not constitute an official statutory filing, submission receipt, or regulatory certification with {confirmModalTask.issuing_authority}</em>.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Authority</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{confirmModalTask.issuing_authority}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Mandate Frequency</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{confirmModalTask.frequency}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalTask(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleToggleStatus(confirmModalTask)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20"
              >
                Confirm & Mark Task Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
