import React, { useState } from 'react';
import {
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
  FileSpreadsheet,
  Building2,
  TrendingUp,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  ArrowRightLeft,
  X,
  Play,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Employee } from '../../types';

interface LandingPageProps {
  employees: Employee[];
  onOpenEmployerLogin: () => void;
  onOpenEmployeeLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  employees,
  onOpenEmployerLogin,
  onOpenEmployeeLogin,
}) => {
  const { quickSwitch } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Navigation Header (Follows Top Bar Contract) */}
      <header className="h-20 bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Wordmark Brand */}
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
              WT
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight block leading-tight">
                WorkTrack HR
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Attendance & Shifts
              </span>
            </div>
          </div>

          {/* Zone 2: Clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#shifts" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Shift Architecture
            </a>
            <a href="#compliance" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Audit & Reports
            </a>
          </nav>

          {/* Zone 3: Primary Action Portal Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenEmployeeLogin}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition whitespace-nowrap shrink-0"
            >
              Employee Login
            </button>
            <button
              onClick={onOpenEmployerLogin}
              className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition whitespace-nowrap shrink-0"
            >
              Employer Portal
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        {/* Kicker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-extrabold uppercase tracking-wider mb-6">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Smart Attendance · Better Workforce Management</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] text-balance">
          Manage Your Workforce.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">
            Simplify Attendance.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          An all-in-one employee attendance and shift management platform to organize your team,
          monitor working hours, calculate overtime accurately, and scale productivity.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={onOpenEmployerLogin}
            className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 text-sm transition"
          >
            <span>Launch Employer Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenEmployeeLogin}
            className="px-7 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-2xl shadow-2xs text-sm transition"
          >
            Employee Clock-In Portal
          </button>
        </div>

        {/* Quick Demo Sandbox Switcher Bar */}
        <div className="mt-12 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
              <span>Instant Test Drive (1-Click Demo Logins)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Real stateful session</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => quickSwitch('EMPLOYER', undefined, employees)}
              className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 transition text-left text-xs"
            >
              <div className="font-bold text-indigo-900">Sign in as Employer</div>
              <div className="text-[11px] text-indigo-600 mt-0.5">Admin & Executive Console</div>
            </button>
            <button
              onClick={() => quickSwitch('EMPLOYEE', employees[0]?.id, employees)}
              className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition text-left text-xs"
            >
              <div className="font-bold text-emerald-900">Sign in as {employees[0]?.fullName || 'Sarah'}</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Software Engineer · Day Shift</div>
            </button>
            <button
              onClick={() => quickSwitch('EMPLOYEE', employees[1]?.id, employees)}
              className="p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 transition text-left text-xs"
            >
              <div className="font-bold text-purple-900">Sign in as {employees[1]?.fullName || 'David'}</div>
              <div className="text-[11px] text-purple-600 mt-0.5">Operations · Morning Shift</div>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-bold text-indigo-600 tracking-widest">
            Enterprise Workforce Capabilities
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Built for Modern High-Growth Operations
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            From overnight shift handovers to automated leave reconciliation, WorkTrack HR handles your entire workforce lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Real-Time Attendance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Live wall clock, single-click check in/out, automatic lateness detection, and live shift working timers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Shift Scheduling</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standard, rotational, and midnight overnight shift rosters. Configurable grace windows and unpaid breaks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Departments & Positions</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dynamic business hierarchy. Define custom departments, roles, reporting hierarchies, and staff quotas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Reports & CSV Export</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              One-click payroll export, verified lateness minutes, overtime calculations, and compliance audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-bold text-indigo-600 tracking-widest">
              Automated Lifecycle
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              How WorkTrack HR Powers Your Day
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="text-2xl font-black text-indigo-600 font-mono">01.</div>
              <h3 className="text-base font-bold text-slate-900">Define Shifts & Assign Staff</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Set operating windows, grace periods, and break policies. Map employees to general, morning, or overnight schedules.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-2xl font-black text-emerald-600 font-mono">02.</div>
              <h3 className="text-base font-bold text-slate-900">Live Employee Clock In/Out</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Personnel check in via self-service portal. The system timestamps the session, evaluates lateness against grace thresholds, and updates live dashboards.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-2xl font-black text-purple-600 font-mono">03.</div>
              <h3 className="text-base font-bold text-slate-900">Automate Overtime & Payroll</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gross hours are recorded, unpaid lunch breaks deducted, and overtime automatically accrued for export into payroll CSV ledgers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-white border-t border-slate-200/80 mt-auto text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">WorkTrack HR</span>
            <span>·</span>
            <span>Smart Attendance. Better Workforce Management.</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} WorkTrack HR Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
