import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Eye, EyeOff, AlertCircle, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Employee, UserRole } from '../../types';

interface LoginModalProps {
  initialRole: UserRole;
  onClose: () => void;
  employees: Employee[];
}

export const LoginModal: React.FC<LoginModalProps> = ({ initialRole, onClose, employees }) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const { loginEmployer, loginEmployee, notify } = useAuth();

  // Employer state
  const [employerEmail, setEmployerEmail] = useState('admin@worktrack.io');
  const [employerPassword, setEmployerPassword] = useState('admin123');

  // Employee state
  const [employeeIdentifier, setEmployeeIdentifier] = useState('sarah.j@worktrack.io');
  const [employeePassword, setEmployeePassword] = useState('password123');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmployerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginEmployer(employerEmail.trim(), employerPassword);
    if (success) {
      onClose();
    } else {
      setErrorMsg('Invalid employer administrator credentials. (Try admin@worktrack.io / admin123)');
    }
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginEmployee(employeeIdentifier.trim(), employeePassword, employees);
    if (success) {
      onClose();
    } else {
      setErrorMsg('Invalid employee ID or password. (Try sarah.j@worktrack.io / password123)');
    }
  };

  const handleForgotPassword = () => {
    notify('Password reset instructions dispatched to your registered recovery address.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Role Toggle Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setRole('EMPLOYER');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              role === 'EMPLOYER'
                ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Employer Portal</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('EMPLOYEE');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              role === 'EMPLOYEE'
                ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Employee Portal</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* EMPLOYER FORM */}
        {role === 'EMPLOYER' ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 font-bold shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Employer Administration</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage employees, shifts, departments, and payroll reports
              </p>
            </div>

            <form onSubmit={handleEmployerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">Company Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@worktrack.io"
                  value={employerEmail}
                  onChange={(e) => setEmployerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-sm font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="uppercase font-bold text-slate-600">Password</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={employerPassword}
                    onChange={(e) => setEmployerPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Prefill helper */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span>
                  Preset: <strong>admin@worktrack.io</strong> / <strong>admin123</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmployerEmail('admin@worktrack.io');
                    setEmployerPassword('admin123');
                  }}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Autofill
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition shadow-md shadow-indigo-100 text-sm"
              >
                Access Employer Console
              </button>
            </form>
          </div>
        ) : (
          /* EMPLOYEE FORM */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 font-bold shadow-xs">
                <UserCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Employee Workspace</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clock in/out, view assigned shifts, and manage leave requests
              </p>
            </div>

            <form onSubmit={handleEmployeeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">
                  Employee ID or Email Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sarah.j@worktrack.io or WTR-1001"
                  value={employeeIdentifier}
                  onChange={(e) => setEmployeeIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="uppercase font-bold text-slate-600">Password</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-emerald-600 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={employeePassword}
                    onChange={(e) => setEmployeePassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Prefill helper */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span>
                  Preset: <strong>sarah.j@worktrack.io</strong> / <strong>password123</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmployeeIdentifier('sarah.j@worktrack.io');
                    setEmployeePassword('password123');
                  }}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  Autofill
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition shadow-md shadow-emerald-100 text-sm"
              >
                Sign In to Employee Portal
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
