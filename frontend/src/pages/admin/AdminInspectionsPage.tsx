import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CalendarDays,
  Plus,
  UserCheck,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Building2,
  Search,
  Filter
} from 'lucide-react';
import { InspectionService } from '../../services/inspection.service';
import { ApplicationService } from '../../services/application.service';
import { BusinessService } from '../../services/business.service';
import { InspectionItem, ApplicationItem, Business } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const AdminInspectionsPage: React.FC = () => {
  const [inspections, setInspections] = useState<InspectionItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [inspectionType, setInspectionType] = useState('Fire Safety & Hydrant System Audit');
  const [scheduledDate, setScheduledDate] = useState('');
  const [officerName, setOfficerName] = useState('Sanjay Patil');
  const [officerDesignation, setOfficerDesignation] = useState('Senior Field Scrutiny Officer');
  const [officerContact, setOfficerContact] = useState('+91 98221 99887');
  const [location, setLocation] = useState('Plot E-42, MIDC Chakan Phase II, Pune');
  const [applicantInstructions, setApplicantInstructions] = useState('Keep factory site blueprints and machinery layout readily accessible.');
  const [scheduling, setScheduling] = useState(false);

  // Edit / Complete Modal
  const [editingInsp, setEditingInsp] = useState<InspectionItem | null>(null);
  const [inspStatus, setInspStatus] = useState('SCHEDULED');
  const [findingsSummary, setFindingsSummary] = useState('');
  const [complianceScore, setComplianceScore] = useState<number>(95);
  const [updating, setUpdating] = useState(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [inspData, appsData, bizData] = await Promise.all([
        InspectionService.list(),
        ApplicationService.list(),
        BusinessService.list(),
      ]);
      setInspections(inspData);
      setApplications(appsData);
      setBusinesses(bizData);
      if (appsData.length > 0 && !selectedAppId) {
        setSelectedAppId(appsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load inspection dispatch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !scheduledDate) return;

    const selectedApp = applications.find((a) => a.id === selectedAppId);
    if (!selectedApp) return;

    setScheduling(true);
    try {
      await InspectionService.schedule({
        application_id: selectedAppId,
        business_id: selectedApp.business_id,
        inspection_type: inspectionType,
        scheduled_date: new Date(scheduledDate).toISOString(),
        officer_name: officerName,
        officer_designation: officerDesignation,
        officer_contact: officerContact,
        location: location || `${selectedApp.business_name} Site`,
        applicant_action_required: applicantInstructions,
      });
      setShowScheduleModal(false);
      await fetchAllData();
    } catch (err) {
      console.error('Failed to schedule inspection:', err);
    } finally {
      setScheduling(false);
    }
  };

  const handleUpdateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInsp) return;

    setUpdating(true);
    try {
      await InspectionService.update(editingInsp.id, {
        status: inspStatus as any,
        findings_summary: findingsSummary,
        compliance_score: complianceScore,
      });
      setEditingInsp(null);
      await fetchAllData();
    } catch (err) {
      console.error('Failed to update inspection:', err);
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = (insp: InspectionItem) => {
    setEditingInsp(insp);
    setInspStatus(insp.status);
    setFindingsSummary(insp.findings_summary || '');
    setComplianceScore(insp.compliance_score || 90);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Field Inspection Scheduling & Dispatch Desk
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200 font-mono">
              {inspections.length} Total Visits
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dispatch inspecting officers for on-site audits, record compliance scores, and transmit applicant instructions.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-3.5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Field Visit
        </button>
      </div>

      {/* Inspections Table */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Loading inspections queue...
        </div>
      ) : inspections.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg p-8 space-y-2">
          <CalendarDays className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">No field visits scheduled.</h3>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Inspection Type</th>
                  <th className="py-2.5 px-4 font-bold">App Number & Unit</th>
                  <th className="py-2.5 px-4 font-bold">Scheduled Date & Time</th>
                  <th className="py-2.5 px-4 font-bold">Assigned Officer</th>
                  <th className="py-2.5 px-4 font-bold">Status</th>
                  <th className="py-2.5 px-4 font-bold">Venue</th>
                  <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {insp.inspection_type}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-mono text-slate-700 font-semibold block">{insp.application_number}</span>
                      <span className="text-[10px] text-slate-500">{insp.business_name}</span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-700">
                      {new Date(insp.scheduled_date).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-2.5 px-4">
                      <strong className="text-slate-800 font-medium block">{insp.officer_name}</strong>
                      <span className="text-[10px] text-slate-500">{insp.officer_designation}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusBadge status={insp.status} />
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">
                      {insp.location}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(insp)}
                        className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 hover:bg-slate-200 font-medium border border-slate-200 text-xs"
                      >
                        Update Result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Inspection Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Official Field Inspection"
        subtitle="Dispatch Department Inspecting Officer"
      >
        <form onSubmit={handleSchedule} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Select Target Application *
            </label>
            <select
              value={selectedAppId || ''}
              onChange={(e) => setSelectedAppId(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 font-medium"
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.application_number} - {app.approval_type?.name} ({app.business_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Inspection Type *
            </label>
            <select
              value={inspectionType}
              onChange={(e) => setInspectionType(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900"
            >
              <option value="Fire Safety & Hydrant System Audit">Fire Safety & Hydrant System Audit</option>
              <option value="Pollution & Effluent Control Audit (MPCB)">Pollution & Effluent Control Audit (MPCB)</option>
              <option value="Boiler Hydraulic Pressure Verification">Boiler Hydraulic Pressure Verification</option>
              <option value="Food Hygiene & FSMS Facility Scrutiny">Food Hygiene & FSMS Facility Scrutiny (FDA)</option>
              <option value="Factory Building & Safety Inspection (DISH)">Factory Building & Safety Inspection (DISH)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Inspection Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Officer Name *
              </label>
              <input
                type="text"
                required
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={officerDesignation}
                onChange={(e) => setOfficerDesignation(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Officer Contact No.
              </label>
              <input
                type="text"
                value={officerContact}
                onChange={(e) => setOfficerContact(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Premises Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Applicant Preparation Instructions
            </label>
            <textarea
              rows={2}
              value={applicantInstructions}
              onChange={(e) => setApplicantInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              className="px-3.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={scheduling}
              className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {scheduling ? 'Scheduling...' : 'Dispatch Inspection'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Inspection Result Modal */}
      {editingInsp && (
        <Modal
          isOpen={true}
          onClose={() => setEditingInsp(null)}
          title={`Update Inspection: ${editingInsp.inspection_type}`}
          subtitle={`Application ${editingInsp.application_number}`}
        >
          <form onSubmit={handleUpdateInspection} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Visit Status *
                </label>
                <select
                  value={inspStatus}
                  onChange={(e) => setInspStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 font-medium"
                >
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Compliance Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={complianceScore}
                  onChange={(e) => setComplianceScore(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 font-bold text-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Officer Findings & Audit Report Summary
              </label>
              <textarea
                rows={4}
                value={findingsSummary}
                onChange={(e) => setFindingsSummary(e.target.value)}
                placeholder="Detail physical site observations, verified equipment parameters, and clearance recommendation..."
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingInsp(null)}
                className="px-3.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Report'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
