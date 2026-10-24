import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  AttendanceRecord,
  Department,
  Employee,
  Position,
  Shift,
} from '../../types';
import { exportAttendanceToCSV, formatMinutes, formatTimeDisplay } from '../../utils/calculations';

interface ReportsTabProps {
  attendance: AttendanceRecord[];
  employees: Employee[];
  departments: Department[];
  positions: Position[];
  shifts: Shift[];
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  attendance,
  employees,
  departments,
  positions,
  shifts,
  notify,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Filter records
  const filteredReport = attendance.filter((r) => {
    const emp = employees.find((e) => e.id === r.employeeId);
    if (!emp) return false;

    if (startDate && r.attendanceDate < startDate) return false;
    if (endDate && r.attendanceDate > endDate) return false;
    if (selectedEmp && r.employeeId !== selectedEmp) return false;
    if (selectedDept && emp.departmentId !== selectedDept) return false;
    if (selectedStatus && r.status !== selectedStatus) return false;

    return true;
  });

  // Calculate summary metrics for the filtered subset
  const totalRecords = filteredReport.length;
  const totalWorkingMins = filteredReport.reduce((acc, r) => acc + (r.workingMinutes || 0), 0);
  const totalOvertimeMins = filteredReport.reduce((acc, r) => acc + (r.overtimeMinutes || 0), 0);
  const totalLateMins = filteredReport.reduce((acc, r) => acc + (r.lateMinutes || 0), 0);
  const presentCount = filteredReport.filter(
    (r) => r.status === 'PRESENT' || r.status === 'LATE'
  ).length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 100;

  const handleExportCSV = () => {
    const exportData = filteredReport.map((r) => {
      const emp = employees.find((e) => e.id === r.employeeId);
      const dept = departments.find((d) => d.id === emp?.departmentId)?.name || 'General';
      const pos = positions.find((p) => p.id === emp?.positionId)?.title || 'Staff';
      const shift = shifts.find((s) => s.id === r.shiftId)?.name || 'Standard';

      return {
        date: r.attendanceDate,
        employeeCode: emp?.employeeCode || '',
        employeeName: emp?.fullName || '',
        department: dept,
        position: pos,
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
      `WorkTrack_Attendance_${new Date().toISOString().split('T')[0]}.csv`
    );
    notify('Report successfully exported to CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance & Payroll Ledger</h2>
          <p className="text-xs text-slate-500">
            Generate formal compliance records, gross & net hours, lateness deductions, and overtime
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Ledger</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-400">Total Filtered Logs</span>
          <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{totalRecords}</p>
          <span className="text-[11px] text-slate-500 font-medium">Session records</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-400">Net Working Time</span>
          <p className="text-2xl font-black text-indigo-600 mt-1 tabular-nums">
            {(totalWorkingMins / 60).toFixed(1)} <span className="text-sm font-semibold">hrs</span>
          </p>
          <span className="text-[11px] text-slate-500 font-medium">After unpaid breaks</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-400">Total Overtime</span>
          <p className="text-2xl font-black text-emerald-600 mt-1 tabular-nums">
            {(totalOvertimeMins / 60).toFixed(1)} <span className="text-sm font-semibold">hrs</span>
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Payable overtime</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-400">Attendance Ratio</span>
          <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{attendanceRate}%</p>
          <span className="text-[11px] text-slate-500 font-medium">On-time / Present</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-bold uppercase text-[10px]">From</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-bold uppercase text-[10px]">To</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
          />
        </div>

        <select
          value={selectedEmp}
          onChange={(e) => setSelectedEmp(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
        >
          <option value="">All Personnel</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.fullName} ({e.employeeCode})
            </option>
          ))}
        </select>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="PRESENT">Present</option>
          <option value="LATE">Late</option>
          <option value="HALF_DAY">Half Day</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="ABSENT">Absent</option>
        </select>

        {(startDate || endDate || selectedEmp || selectedDept || selectedStatus) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSelectedEmp('');
              setSelectedDept('');
              setSelectedStatus('');
            }}
            className="text-rose-600 font-bold hover:underline px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Shift Scheduled</th>
                <th className="py-3 px-4">Actual Check-In</th>
                <th className="py-3 px-4">Actual Check-Out</th>
                <th className="py-3 px-4">Late (Mins)</th>
                <th className="py-3 px-4">Net Working</th>
                <th className="py-3 px-4">Overtime</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReport.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No data records matched your report parameters.
                  </td>
                </tr>
              ) : (
                filteredReport.map((r) => {
                  const emp = employees.find((e) => e.id === r.employeeId);
                  const dept = departments.find((d) => d.id === emp?.departmentId);
                  const shift = shifts.find((s) => s.id === r.shiftId);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {r.attendanceDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{emp?.employeeCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{emp?.fullName}</td>
                      <td className="py-3 px-4 text-slate-600">{dept?.name || '—'}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {shift ? `${shift.startTime} - ${shift.endTime}` : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {formatTimeDisplay(r.checkIn)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {formatTimeDisplay(r.checkOut)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">
                        {r.lateMinutes > 0 ? (
                          <span className="text-amber-600 font-bold">{r.lateMinutes}</span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 tabular-nums">
                        {formatMinutes(r.workingMinutes)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">
                        {r.overtimeMinutes > 0 ? (
                          <span className="text-emerald-600 font-bold">
                            {formatMinutes(r.overtimeMinutes)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            r.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700'
                              : r.status === 'LATE'
                              ? 'bg-amber-50 text-amber-700'
                              : r.status === 'ON_LEAVE'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-rose-50 text-rose-700'
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
