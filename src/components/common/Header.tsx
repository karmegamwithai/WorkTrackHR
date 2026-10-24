import React from 'react';
import { Clock, Globe, ArrowRightLeft, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Company, Employee } from '../../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  company: Company;
  employees: Employee[];
  onSwitchPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  company,
  employees,
  onSwitchPortal,
}) => {
  const { user, quickSwitch } = useAuth();
  const isEmployer = user?.role === 'EMPLOYER';

  return (
    <header className="h-18 px-8 bg-white border-b border-slate-200/80 flex items-center justify-between gap-4 sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Timezone Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-600">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate max-w-[160px]">{company.timezone.split(' ')[0]}</span>
        </div>

        {/* Portal Switch Shortcut */}
        <button
          onClick={() => {
            if (isEmployer) {
              quickSwitch('EMPLOYEE', employees[0]?.id, employees);
            } else {
              quickSwitch('EMPLOYER', undefined, employees);
            }
            if (onSwitchPortal) onSwitchPortal();
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
            isEmployer
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>{isEmployer ? 'Test Employee View' : 'Back to Admin'}</span>
        </button>
      </div>
    </header>
  );
};
