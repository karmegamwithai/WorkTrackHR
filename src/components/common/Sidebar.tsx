import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CheckSquare,
  CalendarDays,
  FileSpreadsheet,
  Settings,
  LogOut,
  CalendarCheck,
  User,
  ShieldAlert,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Employee } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  employees: Employee[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, employees }) => {
  const { user, logout, quickSwitch } = useAuth();

  const employerLinks = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'EMPLOYEES', label: 'Employees', icon: Users },
    { id: 'DEPTS_POS', label: 'Depts & Positions', icon: Building2 },
    { id: 'SHIFTS', label: 'Shift Management', icon: Clock },
    { id: 'ATTENDANCE', label: 'Live Attendance', icon: CheckSquare },
    { id: 'LEAVES', label: 'Leave Requests', icon: CalendarDays },
    { id: 'REPORTS', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
  ];

  const employeeLinks = [
    { id: 'EMP_DASHBOARD', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'EMP_ATTENDANCE', label: 'My Attendance', icon: CheckSquare },
    { id: 'EMP_SHIFTS', label: 'My Shifts', icon: CalendarDays },
    { id: 'EMP_LEAVES', label: 'Leave Requests', icon: CalendarCheck },
    { id: 'EMP_PROFILE', label: 'My Profile', icon: User },
  ];

  const isEmployer = user?.role === 'EMPLOYER';
  const links = isEmployer ? employerLinks : employeeLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none">
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center gap-3 border-b border-slate-100 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-xs">
            WT
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 tracking-tight text-base leading-tight">
              WorkTrack HR
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
              {isEmployer ? 'Admin Console' : 'Employee Workspace'}
            </span>
          </div>
        </div>

        {/* Quick Portal Switcher (For convenient testing & demoing) */}
        <div className="px-4 pt-3 pb-2">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isEmployer ? 'bg-indigo-600' : 'bg-emerald-500'}`} />
              <span className="text-slate-700 font-semibold truncate">
                {isEmployer ? 'Admin Mode' : user?.fullName}
              </span>
            </div>
            <button
              onClick={() => {
                if (isEmployer) {
                  quickSwitch('EMPLOYEE', employees[0]?.id, employees);
                  setActiveTab('EMP_DASHBOARD');
                } else {
                  quickSwitch('EMPLOYER', undefined, employees);
                  setActiveTab('DASHBOARD');
                }
              }}
              title="Switch role instantly to test"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded hover:bg-indigo-50 transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Switch</span>
            </button>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-600">
                    {user?.fullName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-600 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
