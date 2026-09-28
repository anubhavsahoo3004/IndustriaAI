import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Calendar,
  Clock,
  MapPin,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { InspectionService } from '../services/inspection.service';
import { InspectionItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const InspectionsPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const [inspections, setInspections] = useState<InspectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspections = async () => {
      if (!activeBusiness) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await InspectionService.list({ business_id: activeBusiness.id });
        setInspections(data);
      } catch (err) {
        console.error('Failed to load inspections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, [activeBusiness]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Field Inspections & Site Audits
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded">
              {inspections.length} Total Visits
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Department inspection schedule, officer assignments, and on-site readiness requirements.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Loading inspections schedule...
        </div>
      ) : inspections.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg p-6 space-y-2">
          <CalendarCheck className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-xs font-semibold text-slate-700">No inspections scheduled.</h3>
          <p className="text-[11px] text-slate-500">Department scrutiny officers schedule site visits following statutory document review.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Application Ref</th>
                  <th className="py-2.5 px-3">Inspection Type</th>
                  <th className="py-2.5 px-3">Officer</th>
                  <th className="py-2.5 px-3">Scheduled Date</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Applicant Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map((insp) => {
                  const dateObj = new Date(insp.scheduled_date);
                  return (
                    <tr key={insp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-800">
                        {insp.application_number || 'Statutory Clearance'}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {insp.inspection_type}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        <span className="font-medium text-slate-900 block">{insp.officer_name}</span>
                        <span className="text-[10px] text-slate-500 block">{insp.officer_designation || 'Field Officer'}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 text-[11px]">
                        {dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 text-[11px]">
                        {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px] max-w-xs truncate" title={insp.location}>
                        {insp.location}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={insp.status} />
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600 max-w-xs">
                        {insp.applicant_action_required || 'Standard on-site verification.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
