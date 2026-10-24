import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Filter, Download } from 'lucide-react';
import { AttendanceRecord, Employee, Shift } from '../../types';
import { exportAttendanceToCSV, formatMinutes, formatTimeDisplay } from '../../utils/calculations';

interface MyAttendanceTabProps {
  employee: Employee;
  attendance: AttendanceRecord[];
  shifts: Shift[];
}

export const MyAttendanceTab: React.FC<MyAttendanceTabProps> = ({
  employee,
  attendance,
  shifts,
}) => {
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const myRecords = attendance
    .filter((a) => a.employeeId === employee.id)
    .filter((a) => {
      if (filterMonth && !a.attendanceDate.startsWith(filterMonth)) return false;
      if (filterStatus && a.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));

  const totalWorkingMins = myRecords.reduce((acc, r) => acc + (r.workingMinutes || 0), 0);
  const totalOvertimeMins = myRecords.reduce((acc, r) => acc + (r.overtimeMinutes || 0), 0);
  const totalLateMins = myRecords.reduce((acc, r) => acc + (r.lateMinutes || 0), 0);

  const handleExportMyCSV = () => {
    const exportData = myRecords.map((r) => {
      const shift = shifts.find((s) => s.id === r.shiftId)?.name || 'Standard Shift';
      return {
        date: r.attendanceDate,
        employeeCode: employee.employeeCode,
        employeeName: employee.fullName,
        department: 'My Department',
        position: 'My Position',
        shiftName: shift,
        checkIn: formatTimeDisplay(r.checkIn),
        checkOut: formatTimeDisplay(r.checkOut),
        lateMinutes: r.lateMinutes,
        workingHours: formatMinutes(r.workingMinutes),
        overtimeHours: formatMinutes(r.overtimeMinutes),
        status: r.status,
      };
    });

    exportAttendanceToCSV(
      exportData,
      `WorkTrack_My_Attendance_${employee.employeeCode}.csv`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Attendance History</h2>
          <p className="text-xs text-slate-500">
            Review your historical check-in/out stamps, duration logs, and verified lateness
          </p>
        </div>

        <button
          onClick={handleExportMyCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download My Log</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-400">Total Net Time</span>
          <p className="text-2xl font-black text-indigo-600 mt-1 tabular-nums font-mono">
            {formatMinutes(totalWorkingMins)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Logged across {myRecords.length} records</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-400">Total Overtime</span>
          <p className="text-2xl font-black text-emerald-600 mt-1 tabular-nums font-mono">
            +{formatMinutes(totalOvertimeMins)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Extra hours earned</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-400">Late Minutes</span>
          <p className="text-2xl font-black text-amber-500 mt-1 tabular-nums font-mono">
            {totalLateMins}m
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Total delay minutes</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>

          {(filterMonth || filterStatus) && (
            <button
              onClick={() => {
                setFilterMonth('');
                setFilterStatus('');
              }}
              className="text-rose-600 font-bold hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        <span className="text-slate-400 text-xs font-semibold">
          Showing {myRecords.length} entries
        </span>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Shift Scheduled</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Punctuality</th>
                <th className="py-3 px-4">Net Working</th>
                <th className="py-3 px-4">Overtime</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No attendance records logged yet for this period.
                  </td>
                </tr>
              ) : (
                myRecords.map((r) => {
                  const shift = shifts.find((s) => s.id === r.shiftId);
                  const isCurrent = r.checkIn && !r.checkOut;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {r.attendanceDate}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {shift?.name || 'Standard'} ({shift ? `${shift.startTime}-${shift.endTime}` : ''})
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {formatTimeDisplay(r.checkIn)}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {isCurrent ? (
                          <span className="text-emerald-600 font-bold animate-pulse">On Shift</span>
                        ) : (
                          formatTimeDisplay(r.checkOut)
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {r.lateMinutes > 0 ? (
                          <span className="text-amber-600 font-bold">{r.lateMinutes} mins late</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">On-Time</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 tabular-nums">
                        {formatMinutes(r.workingMinutes)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">
                        {r.overtimeMinutes > 0 ? (
                          <span className="text-emerald-600 font-bold">
                            +{formatMinutes(r.overtimeMinutes)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4">
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
    </div>
  );
};
