import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  MapPin,
  UserCheck,
  Phone,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Building2,
  FileCheck2
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Field Inspections & Site Audits
            </h1>
            <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-bold px-2.5 py-0.5 rounded-full">
              {inspections.length} Total Visits
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track scheduled department officer inspections, required on-site preparations, and compliance audit reports.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Loading inspections schedule...
        </div>
      ) : inspections.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-3">
          <CalendarCheck className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No inspections scheduled.</h3>
          <p className="text-xs text-slate-400">Department officers schedule site audits upon completion of document verification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inspections.map((insp) => {
            const isScheduled = insp.status === 'SCHEDULED';
            const isCompleted = insp.status === 'COMPLETED';

            return (
              <div
                key={insp.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                      <CalendarCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {insp.inspection_type}
                        </h3>
                        <StatusBadge status={insp.status} />
                      </div>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        Application: {insp.application_number || 'Statutory Clearance'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right self-start sm:self-auto bg-slate-50 dark:bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheduled Date & Time</span>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white">
                      {new Date(insp.scheduled_date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </strong>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Inspecting Officer</span>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <strong className="text-slate-800 dark:text-slate-200">{insp.officer_name}</strong>
                      <span className="text-slate-400 font-normal">({insp.officer_designation})</span>
                    </div>
                    {insp.officer_contact && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{insp.officer_contact}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Inspection Venue / Location</span>
                    <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{insp.location}</span>
                    </div>
                  </div>
                </div>

                {/* Required preparation instructions */}
                {insp.applicant_action_required && (
                  <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-xs space-y-1">
                    <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-purple-600" />
                      Applicant Preparation Checklist:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-5">
                      {insp.applicant_action_required}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
