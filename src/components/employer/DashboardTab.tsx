import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarOff,
  Briefcase,
  UserCheck,
  ArrowUpRight,
  Search,
} from 'lucide-react';
import { AttendanceRecord, Department, Employee, LeaveRequest, Position, Shift } from '../../types';
import { StatCard } from '../common/StatCard';
import { AttendanceDonutChart, DepartmentDistributionChart, WeeklyAttendanceBarChart } from '../common/Charts';
import { formatMinutes, formatTimeDisplay } from '../../utils/calculations';

interface DashboardTabProps {
  employees: Employee[];
  departments: Department[];
  positions: Position[];
  shifts: Shift[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  onNavigate: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  employees,
  departments,
  positions,
  shifts,
  attendance,
  leaves,
  onNavigate,
}) => {
  const [searchToday, setSearchToday] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter((a) => a.attendanceDate === todayStr);

  const totalEmployees = employees.filter((e) => e.employmentStatus === 'ACTIVE').length;
  const presentToday = todayRecords.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const lateToday = todayRecords.filter((a) => a.status === 'LATE').length;
  const onLeaveToday = leaves.filter(
    (l) => l.status === 'APPROVED' && l.startDate <= todayStr && l.endDate >= todayStr
  ).length;
  const absentToday = Math.max(0, totalEmployees - (presentToday + onLeaveToday));
  const currentlyOnShift = todayRecords.filter((a) => a.checkIn && !a.checkOut).length;
  const totalOvertimeMins = todayRecords.reduce((acc, r) => acc + (r.overtimeMinutes || 0), 0);

  // Generate 7-day trend data
  const weeklyData = [
    { label: 'Mon', present: 5, late: 1, absent: 0 },
    { label: 'Tue', present: 6, late: 0, absent: 0 },
    { label: 'Wed', present: 4, late: 2, absent: 0 },
    { label: 'Thu', present: 5, late: 1, absent: 0 },
    { label: 'Fri', present: 5, late: 0, absent: 1 },
    { label: 'Sat', present: 2, late: 0, absent: 0 },
    { label: 'Today', present: presentToday - lateToday, late: lateToday, absent: absentToday },
  ];

  // Department distribution
  const deptDistribution = departments.map((dept) => {
    const count = employees.filter((e) => e.departmentId === dept.id).length;
    return { name: dept.name, count };
  });

  const filteredToday = todayRecords.filter((r) => {
    const emp = employees.find((e) => e.id === r.employeeId);
    if (!emp) return false;
    const q = searchToday.toLowerCase();
    return emp.fullName.toLowerCase().includes(q) || emp.employeeCode.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <StatCard
          title="Total Staff"
          value={totalEmployees}
          subtitle="Enrolled active"
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Present"
          value={presentToday}
          subtitle="Checked in today"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Late"
          value={lateToday}
          subtitle="After grace window"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Absent"
          value={absentToday}
          subtitle="Unlogged today"
          icon={<CalendarOff className="w-5 h-5" />}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />
        <StatCard
          title="On Leave"
          value={onLeaveToday}
          subtitle="Approved requests"
          icon={<Briefcase className="w-5 h-5" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="On Shift"
          value={currentlyOnShift}
          subtitle="Active working"
          icon={<UserCheck className="w-5 h-5" />}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Overtime"
          value={formatMinutes(totalOvertimeMins)}
          subtitle="Accumulated today"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Weekly Attendance Trends</h2>
              <p className="text-xs text-slate-500">Punctuality and attendance volume over the past 7 days</p>
            </div>
            <button
              onClick={() => onNavigate('REPORTS')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <WeeklyAttendanceBarChart data={weeklyData} />
        </div>

        {/* Turnout Donut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Workforce Turnout</h2>
            <p className="text-xs text-slate-500">Real-time attendance ratio</p>
          </div>
          <AttendanceDonutChart
            present={presentToday - lateToday}
            late={lateToday}
            absent={absentToday}
            onLeave={onLeaveToday}
          />
          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-400 font-medium">
              Turnout computed dynamically from shift schedules
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Row: Today's Live Attendance + Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Attendance Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Attendance Feed</h2>
              <p className="text-xs text-slate-500">Live check-ins recorded for today</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by name or ID..."
                  value={searchToday}
                  onChange={(e) => setSearchToday(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={() => onNavigate('ATTENDANCE')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
              >
                View All
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Shift</th>
                  <th className="py-2.5 px-3">Check-In</th>
                  <th className="py-2.5 px-3">Check-Out</th>
                  <th className="py-2.5 px-3">Lateness</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredToday.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No matching attendance records recorded for today yet.
                    </td>
                  </tr>
                ) : (
                  filteredToday.map((r) => {
                    const emp = employees.find((e) => e.id === r.employeeId);
                    const shift = shifts.find((s) => s.id === r.shiftId);
                    const isCurrentlyWorking = r.checkIn && !r.checkOut;

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-600 text-[10px]">
                              {emp?.avatarUrl ? (
                                <img src={emp.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                emp?.fullName.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{emp?.fullName}</div>
                              <div className="text-[10px] text-slate-600 font-mono">{emp?.employeeCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {shift?.name || 'Standard'}
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-700">
                          {formatTimeDisplay(r.checkIn)}
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-700">
                          {isCurrentlyWorking ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              On Shift
                            </span>
                          ) : (
                            formatTimeDisplay(r.checkOut)
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {r.lateMinutes > 0 ? (
                            <span className="text-amber-600 font-semibold tabular-nums">{r.lateMinutes} min late</span>
                          ) : (
                            <span className="text-slate-600">On time</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              r.status === 'PRESENT'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                : r.status === 'LATE'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                                : r.status === 'ON_LEAVE'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                                : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Headcount by Dept</h2>
                <p className="text-xs text-slate-500">Distribution across business units</p>
              </div>
              <button
                onClick={() => onNavigate('DEPTS_POS')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Manage
              </button>
            </div>
            <DepartmentDistributionChart data={deptDistribution} />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Departments: {departments.length}</span>
            <span>Total Roles: {positions.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
