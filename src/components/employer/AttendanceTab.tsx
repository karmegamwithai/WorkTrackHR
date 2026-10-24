import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Edit3,
  History,
  CheckCircle2,
  AlertTriangle,
  X,
  Clock,
  Calendar,
} from 'lucide-react';
import {
  AttendanceAuditLog,
  AttendanceRecord,
  AttendanceStatus,
  Department,
  Employee,
  Position,
  Shift,
} from '../../types';
import { formatMinutes, formatTimeDisplay } from '../../utils/calculations';

interface AttendanceTabProps {
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  employees: Employee[];
  departments: Department[];
  positions: Position[];
  shifts: Shift[];
  auditLogs: AttendanceAuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AttendanceAuditLog[]>>;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  attendance,
  setAttendance,
  employees,
  departments,
  positions,
  shifts,
  auditLogs,
  setAuditLogs,
  notify,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Manual Correction Modal State
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('PRESENT');
  const [correctionReason, setCorrectionReason] = useState('');

  // Audit Logs Modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const filteredRecords = attendance
    .filter((r) => {
      const emp = employees.find((e) => e.id === r.employeeId);
      if (!emp) return false;

      const matchesDate = !selectedDate || r.attendanceDate === selectedDate;
      const matchesDept = !selectedDept || emp.departmentId === selectedDept;
      const matchesStatus = !selectedStatus || r.status === selectedStatus;
      const matchesSearch =
        !searchQuery ||
        emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDate && matchesDept && matchesStatus && matchesSearch;
    })
    .sort((a, b) => (b.attendanceDate + (b.checkIn || '')).localeCompare(a.attendanceDate + (a.checkIn || '')));

  const openCorrectionModal = (record: AttendanceRecord) => {
    setEditingRecord(record);
    // Parse ISO time to HH:mm for the input
    const inTime = record.checkIn ? record.checkIn.substring(11, 16) : '';
    const outTime = record.checkOut ? record.checkOut.substring(11, 16) : '';
    setEditCheckIn(inTime);
    setEditCheckOut(outTime);
    setEditStatus(record.status);
    setCorrectionReason('');
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !correctionReason.trim()) {
      notify('Correction reason is mandatory for audit trail compliance.', 'error');
      return;
    }

    const emp = employees.find((e) => e.id === editingRecord.employeeId);

    // Reconstruct ISO stamps
    const dateStr = editingRecord.attendanceDate;
    const newCheckIn = editCheckIn ? `${dateStr}T${editCheckIn}:00` : null;
    const newCheckOut = editCheckOut ? `${dateStr}T${editCheckOut}:00` : null;

    // Recalculate working duration
    let workingMins = editingRecord.workingMinutes;
    if (newCheckIn && newCheckOut) {
      const diffMs = Math.max(0, new Date(newCheckOut).getTime() - new Date(newCheckIn).getTime());
      const shift = shifts.find((s) => s.id === editingRecord.shiftId);
      const breakMins = shift?.breakMinutes || 0;
      workingMins = Math.max(0, Math.floor(diffMs / 60000) - breakMins);
    }

    // Create Audit Log
    const auditEntry: AttendanceAuditLog = {
      id: `audit-${Date.now()}`,
      attendanceId: editingRecord.id,
      employeeName: emp?.fullName || 'Unknown',
      attendanceDate: editingRecord.attendanceDate,
      changedBy: 'admin@worktrack.io (HR Admin)',
      previousValues: {
        checkIn: editingRecord.checkIn,
        checkOut: editingRecord.checkOut,
        status: editingRecord.status,
      },
      updatedValues: {
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        status: editStatus,
      },
      reason: correctionReason.trim(),
      changedAt: new Date().toISOString(),
    };

    setAuditLogs((prev) => [auditEntry, ...prev]);

    // Update attendance record
    setAttendance((prev) =>
      prev.map((rec) =>
        rec.id === editingRecord.id
          ? {
              ...rec,
              checkIn: newCheckIn,
              checkOut: newCheckOut,
              status: editStatus,
              workingMinutes: workingMins,
              isManualCorrection: true,
            }
          : rec
      )
    );

    notify(`Attendance corrected for ${emp?.fullName}. Audit log appended.`);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance Monitoring</h2>
          <p className="text-xs text-slate-500">
            Real-time server timestamps, lateness tracking, overtime hours, and approved audit modifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none"
          />

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none"
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
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="ABSENT">Absent</option>
          </select>

          {(selectedDate || selectedDept || selectedStatus || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDate('');
                setSelectedDept('');
                setSelectedStatus('');
                setSearchQuery('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Position / Dept</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Late</th>
                <th className="py-3 px-4">Working Time</th>
                <th className="py-3 px-4">Overtime</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Correction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No attendance records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const emp = employees.find((e) => e.id === r.employeeId);
                  const dept = departments.find((d) => d.id === emp?.departmentId);
                  const pos = positions.find((p) => p.id === emp?.positionId);
                  const shift = shifts.find((s) => s.id === r.shiftId);
                  const isWorkingNow = r.checkIn && !r.checkOut;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {r.attendanceDate}
                        {r.isManualCorrection && (
                          <span className="block text-[9px] text-amber-600 font-bold uppercase tracking-tight">
                            Edited
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{emp?.fullName}</div>
                        <div className="text-[11px] text-slate-600 font-mono">{emp?.employeeCode}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{pos?.title || '—'}</div>
                        <div className="text-slate-600 text-[11px]">{dept?.name || '—'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{shift?.name || 'Standard'}</div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          {shift ? `${shift.startTime} - ${shift.endTime}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {formatTimeDisplay(r.checkIn)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {isWorkingNow ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          formatTimeDisplay(r.checkOut)
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {r.lateMinutes > 0 ? (
                          <span className="text-amber-600 font-bold tabular-nums">
                            {r.lateMinutes} mins
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-800 tabular-nums">
                        {formatMinutes(r.workingMinutes)}
                      </td>

                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        {r.overtimeMinutes > 0 ? (
                          <span className="text-purple-600 font-bold">
                            +{formatMinutes(r.overtimeMinutes)}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] whitespace-nowrap ${
                            r.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : r.status === 'LATE'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                              : r.status === 'ON_LEAVE'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                              : r.status === 'HALF_DAY'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openCorrectionModal(r)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-slate-400" />
                          <span>Modify</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Correction Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Attendance Adjustment</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {editingRecord.attendanceDate} ·{' '}
                  {employees.find((e) => e.id === editingRecord.employeeId)?.fullName}
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCorrection} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Check-In Time</label>
                  <input
                    type="time"
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Check-Out Time</label>
                  <input
                    type="time"
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">Attendance Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as AttendanceStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">
                  Correction Reason * (Audit Mandatory)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Employee forgot RFID badge at entrance kiosk; verified with shift supervisor."
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">Attendance Audit Trail</h3>
                <p className="text-xs text-slate-500">
                  Historical log of all administrative modifications and corrections
                </p>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-4 divide-y divide-slate-100 pr-1">
              {auditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No manual corrections recorded yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="py-3.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-900 font-bold">{log.employeeName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.changedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    <div className="text-slate-600">
                      Modified by: <strong className="text-slate-800">{log.changedBy}</strong> for duty on{' '}
                      <span className="font-mono text-indigo-600">{log.attendanceDate}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700">
                      <p className="font-semibold text-[11px] text-slate-800 mb-1">Reason: "{log.reason}"</p>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-400 uppercase text-[9px] block">Previous:</span>
                          In: {formatTimeDisplay(log.previousValues.checkIn || null)} · Out:{' '}
                          {formatTimeDisplay(log.previousValues.checkOut || null)} ({log.previousValues.status})
                        </div>
                        <div>
                          <span className="text-emerald-600 uppercase text-[9px] block">Updated:</span>
                          In: {formatTimeDisplay(log.updatedValues.checkIn || null)} · Out:{' '}
                          {formatTimeDisplay(log.updatedValues.checkOut || null)} ({log.updatedValues.status})
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
