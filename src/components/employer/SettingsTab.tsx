import React, { useState } from 'react';
import { Settings, Globe, Clock, ShieldCheck, RotateCcw, Building } from 'lucide-react';
import { Company } from '../../types';
import { resetAllDataToDemo } from '../../utils/storage';

interface SettingsTabProps {
  company: Company;
  setCompany: React.Dispatch<React.SetStateAction<Company>>;
  onResetAllData: () => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  company,
  setCompany,
  onResetAllData,
  notify,
}) => {
  const [formData, setFormData] = useState({
    name: company.name,
    timezone: company.timezone,
    standardWorkHours: company.standardWorkHours,
    defaultGraceMinutes: company.defaultGraceMinutes,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Company = {
      ...company,
      name: formData.name.trim(),
      timezone: formData.timezone,
      standardWorkHours: Number(formData.standardWorkHours),
      defaultGraceMinutes: Number(formData.defaultGraceMinutes),
    };

    setCompany(updated);
    notify('Company policies and timezone updated successfully.');
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        'Are you sure you want to restore the initial demo data? All temporary test records will be refreshed.'
      )
    ) {
      resetAllDataToDemo();
      onResetAllData();
      notify('Demo datasets restored to default state.');
    }
  };

  const timezones = [
    'America/New_York (EST, UTC-5)',
    'America/Los_Angeles (PST, UTC-8)',
    'America/Chicago (CST, UTC-6)',
    'Europe/London (GMT/BST, UTC+0)',
    'Europe/Paris (CET, UTC+1)',
    'Asia/Dubai (GST, UTC+4)',
    'Asia/Kolkata (IST, UTC+5:30)',
    'Asia/Singapore (SGT, UTC+8)',
    'Asia/Tokyo (JST, UTC+9)',
    'UTC (Coordinated Universal Time)',
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Workforce & Company Settings</h2>
        <p className="text-xs text-slate-500">
          Set baseline working policies, timezone synchronization, and developer demo management
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block uppercase font-bold text-slate-600 mb-1">Company / Organization Name</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-sm font-semibold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase font-bold text-slate-600 mb-1">Company Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block uppercase font-bold text-slate-600 mb-1">Standard Daily Working Hours</label>
              <input
                type="number"
                min={1}
                max={24}
                value={formData.standardWorkHours}
                onChange={(e) => setFormData({ ...formData, standardWorkHours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase font-bold text-slate-600 mb-1">Default Grace Period (Minutes)</label>
            <input
              type="number"
              min={0}
              max={60}
              value={formData.defaultGraceMinutes}
              onChange={(e) => setFormData({ ...formData, defaultGraceMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Employees checking in within this threshold are marked on-time without lateness deduction.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-xs text-xs"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Demo Reset Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Developer & Testing Playground</h3>
            <p className="text-xs text-slate-500">
              Restore initial seed employees, attendance stamps, shifts, and department data to test the workflow cleanly.
            </p>
          </div>
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200/80 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
