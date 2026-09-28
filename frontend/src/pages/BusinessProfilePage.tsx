import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Briefcase,
  Zap,
  Droplets,
  Users,
  CreditCard,
  FileCheck2,
  Save,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BusinessService } from '../services/business.service';

const MAHARASHTRA_DISTRICTS = [
  'Pune',
  'Mumbai Suburban',
  'Mumbai City',
  'Thane',
  'Nashik',
  'Aurangabad (Chhatrapati Sambhaji Nagar)',
  'Nagpur',
  'Kolhapur',
  'Solapur',
  'Ahmednagar',
  'Satara',
  'Sangli',
  'Raigad',
  'Palghar',
  'Amravati',
  'Nanded'
];

const INDUSTRIES = [
  'Food Processing',
  'Manufacturing',
  'MSME / Small Industrial Unit',
  'Textile',
  'IT / Services'
];

export const BusinessProfilePage: React.FC = () => {
  const { activeBusiness, setActiveBusiness, refreshBusinesses } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: activeBusiness?.name || 'Maharashtra Fresh Foods Pvt. Ltd.',
    industry: activeBusiness?.industry || 'Food Processing',
    state: 'Maharashtra',
    district: activeBusiness?.district || 'Pune',
    project_type: activeBusiness?.project_type || 'New Unit',
    project_stage: activeBusiness?.project_stage || 'Civil Works',
    scale: activeBusiness?.scale || 'Medium',
    investment_range: activeBusiness?.investment_range || '₹10 Cr - ₹50 Cr',
    investment_amount_inr: activeBusiness?.investment_amount_inr || 24.5,
    employee_count: activeBusiness?.employee_count || 45,
    business_type: activeBusiness?.business_type || 'Private Limited',
    gstin: activeBusiness?.gstin || '27AAACM4821K1Z5',
    pan: activeBusiness?.pan || 'AAACM4821K',
    udyam_number: activeBusiness?.udyam_number || 'UDYAM-MH-26-0048912',
    address: activeBusiness?.address || 'Plot No. E-42, MIDC Industrial Area, Phase II, Chakan, Taluka Khed, Pune - 410501',
    plot_details: activeBusiness?.plot_details || 'Plot E-42 (Area: 12,500 sq.m)',
    electricity_load_kw: activeBusiness?.electricity_load_kw || 350,
    water_requirement_kld: activeBusiness?.water_requirement_kld || 45,
    effluent_discharge: activeBusiness?.effluent_discharge || 'Yes',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      if (activeBusiness?.id) {
        const updated = await BusinessService.update(activeBusiness.id, formData);
        setActiveBusiness(updated);
        setSuccessMsg('Business profile successfully updated.');
      } else {
        const created = await BusinessService.create(formData);
        await refreshBusinesses();
        setActiveBusiness(created);
        setSuccessMsg('Business profile successfully registered.');
      }
    } catch (err: any) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePlan = async () => {
    await handleSave();
    navigate('/approvals');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Industrial Unit Profile
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200 font-mono">
              Maharashtra Single Window
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure technical, scale, and location parameters to trigger statutory approval requirements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            type="button"
            onClick={handleGeneratePlan}
            className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            Generate Approval Plan <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Form Cards */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Section 1: Entity & Location */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Building2 className="w-4 h-4 text-slate-700" />
            <h2 className="font-semibold text-sm text-slate-900">
              1. Business Identity & Maharashtra Jurisdiction
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Registered Enterprise Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Legal Entity Type
              </label>
              <select
                value={formData.business_type}
                onChange={(e) => handleChange('business_type', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-400"
              >
                <option value="Private Limited">Private Limited Company</option>
                <option value="Public Limited">Public Limited Company</option>
                <option value="LLP">Limited Liability Partnership (LLP)</option>
                <option value="Partnership">Partnership Firm</option>
                <option value="Proprietorship">Sole Proprietorship</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Target Industry Sector *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-400 font-medium"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Maharashtra District Location *
              </label>
              <select
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-400 font-medium"
              >
                {MAHARASHTRA_DISTRICTS.map((dst) => (
                  <option key={dst} value={dst}>{dst}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Factory Site / Plot Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="e.g. Plot No. E-42, MIDC Chakan Phase II, Pune"
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Scale, Investment & Stage */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Briefcase className="w-4 h-4 text-slate-700" />
            <h2 className="font-semibold text-sm text-slate-900">
              2. Scale, Project Type & Investment Range
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Project Classification
              </label>
              <select
                value={formData.project_type}
                onChange={(e) => handleChange('project_type', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900"
              >
                <option value="New Unit">New Greenfield Unit</option>
                <option value="Expansion">Expansion / Modernization</option>
                <option value="Diversification">Product Diversification</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Current Execution Stage
              </label>
              <select
                value={formData.project_stage}
                onChange={(e) => handleChange('project_stage', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900"
              >
                <option value="Planning">Concept / Planning</option>
                <option value="Land Acquired">Land Acquired / Allotted</option>
                <option value="Civil Works">Civil Works In Progress</option>
                <option value="Ready for Commissioning">Ready for Commissioning</option>
                <option value="Operational">Operational</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                MSME Scale Category
              </label>
              <select
                value={formData.scale}
                onChange={(e) => handleChange('scale', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 font-medium"
              >
                <option value="Micro">Micro (&lt; ₹1 Crore)</option>
                <option value="Small">Small (₹1 Cr - ₹10 Cr)</option>
                <option value="Medium">Medium (₹10 Cr - ₹50 Cr)</option>
                <option value="Large">Large (&gt; ₹50 Cr)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Gross Capital Outlay (₹ Crores)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.investment_amount_inr}
                onChange={(e) => handleChange('investment_amount_inr', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Total Direct Employees
              </label>
              <input
                type="number"
                value={formData.employee_count}
                onChange={(e) => handleChange('employee_count', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Udyam Registration No.
              </label>
              <input
                type="text"
                value={formData.udyam_number}
                onChange={(e) => handleChange('udyam_number', e.target.value)}
                placeholder="UDYAM-MH-26-XXXXXXX"
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Technical Utilities & Environmental Triggers */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Zap className="w-4 h-4 text-slate-700" />
            <h2 className="font-semibold text-sm text-slate-900">
              3. Utilities & Environmental Triggers (MPCB / DISH / MSEDCL)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Connected Power Demand (kW)
              </label>
              <input
                type="number"
                value={formData.electricity_load_kw}
                onChange={(e) => handleChange('electricity_load_kw', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Daily Water Requirement (KLD)
              </label>
              <input
                type="number"
                value={formData.water_requirement_kld}
                onChange={(e) => handleChange('water_requirement_kld', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Effluent / Trade Discharge?
              </label>
              <select
                value={formData.effluent_discharge}
                onChange={(e) => handleChange('effluent_discharge', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 font-medium"
              >
                <option value="Yes">Yes (Generates Industrial Trade Effluent)</option>
                <option value="No">No (Only Domestic Sewage)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Company PAN
              </label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => handleChange('pan', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Maharashtra GSTIN
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div>
            <h3 className="font-semibold text-sm text-slate-900">Evaluate statutory clearances</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Parameters are mapped against Maharashtra FDA, MPCB, DISH, and MIDC statutory regulations.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGeneratePlan}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            Generate Approval Plan <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
