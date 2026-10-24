import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Briefcase, Building2, MapPin, KeyRound, ShieldCheck } from 'lucide-react';
import { Department, Employee, Position, Shift } from '../../types';

interface MyProfileTabProps {
  employee: Employee;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  department: Department | undefined;
  position: Position | undefined;
  shift: Shift | undefined;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MyProfileTab: React.FC<MyProfileTabProps> = ({
  employee,
  setEmployees,
  department,
  position,
  shift,
  notify,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      notify('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify('Passwords do not match.', 'error');
      return;
    }

    setEmployees((prev) =>
      prev.map((e) => (e.id === employee.id ? { ...e, temporaryPassword: newPassword } : e))
    );

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    notify('Password updated successfully.');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Employment Profile</h2>
        <p className="text-xs text-slate-500">
          Personal identity, departmental placement, and credentials security
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            {employee.avatarUrl ? (
              <img
                src={employee.avatarUrl}
                alt={employee.fullName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-lg">
                {employee.fullName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{employee.fullName}</h3>
            <p className="text-xs text-slate-500 font-mono">
              Employee ID: {employee.employeeCode} · Status: {employee.employmentStatus}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
              <span>{position?.title}</span>
              <span>·</span>
              <span>{department?.name}</span>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Work Email</span>
              <span className="font-semibold text-slate-800">{employee.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
              <span className="font-semibold text-slate-800">{employee.phone || 'Not provided'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Work Location</span>
              <span className="font-semibold text-slate-800">{employee.workLocation}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Joining Date</span>
              <span className="font-semibold text-slate-800 tabular-nums">{employee.joiningDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
            <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Shift Schedule</span>
              <span className="font-semibold text-slate-800">
                {shift?.name} ({shift?.startTime} - {shift?.endTime}) · Break: {shift?.breakMinutes}m · Grace: {shift?.gracePeriodMinutes}m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Password Reset Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Update Access Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block uppercase font-bold text-slate-600 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block uppercase font-bold text-slate-600 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
