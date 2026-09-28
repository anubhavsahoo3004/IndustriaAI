import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus
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
      await fetchTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const upcomingCount = tasks.filter((t) => t.status !== 'COMPLETED').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Statutory Compliance Calendar
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded">
              {upcomingCount} Pending Filing{upcomingCount !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Recurring environmental filings, safety audits, and factory act renewals.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Compliance Task
        </button>
      </div>

      {/* Internal Tracking Disclaimer Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-600 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">Operational Notice:</strong> This is an internal compliance tracking tool and does not constitute official legal filing with statutory bodies. Ensure certified filings are lodged directly through the respective department portals.
        </p>
      </div>

      {/* Compliance Task Table */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Loading statutory compliance calendar...
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg p-6 space-y-2">
          <ClipboardList className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-xs font-semibold text-slate-700">No compliance tasks registered.</h3>
          <p className="text-[11px] text-slate-500">Add recurring requirements to track statutory deadlines.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Requirement & Scope</th>
                  <th className="py-2.5 px-3">Authority</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => {
                  const isDone = task.status === 'COMPLETED';
                  const dateObj = new Date(task.due_date);

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-800 whitespace-nowrap">
                        {dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-semibold block ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </span>
                        {task.action_instructions && (
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {task.action_instructions}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {task.issuing_authority}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {task.frequency}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(task)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer border ${
                            isDone
                              ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-slate-900 hover:bg-slate-800 text-white border-transparent'
                          }`}
                        >
                          {isDone ? 'Mark Pending' : 'Mark Task Done'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Statutory Compliance Task"
        subtitle="Schedule internal reminder for routine filings, audits, or safety inspections"
      >
        <form onSubmit={handleCreateTask} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Requirement Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. MPCB Annual Environmental Statement (Form V)"
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Issuing Department
              </label>
              <select
                value={newAuthority}
                onChange={(e) => setNewAuthority(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-500"
              >
                <option value="MPCB">MPCB (Pollution Control)</option>
                <option value="FDA">FDA (Food & Drug Admin)</option>
                <option value="DISH">DISH (Safety & Health)</option>
                <option value="MSEDCL">MSEDCL (Power Board)</option>
                <option value="MIDC">MIDC (Industrial Corp)</option>
                <option value="Fire Dept">Fire Department</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Filing Frequency
              </label>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-500"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Annual">Annual</option>
                <option value="One-Time">One-Time</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Statutory Due Date
            </label>
            <input
              type="date"
              required
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Instructions or Document Prep
            </label>
            <textarea
              rows={2}
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              placeholder="e.g. Compile hazardous waste disposal manifests and lab test records."
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              {creating ? 'Saving Task...' : 'Schedule Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
