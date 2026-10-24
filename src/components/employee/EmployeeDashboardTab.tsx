import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  TrendingUp,
  Briefcase,
  PlayCircle,
  StopCircle,
  Sparkles,
  MapPin,
  Calendar,
} from 'lucide-react';
import { AttendanceRecord, Department, Employee, LeaveRequest, Position, Shift } from '../../types';
import { evaluateCheckIn, evaluateCheckOut, formatMinutes, formatTimeDisplay } from '../../utils/calculations';

interface EmployeeDashboardTabProps {
  employee: Employee;
  shift: Shift | undefined;
  department: Department | undefined;
  position: Position | undefined;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  leaves: LeaveRequest[];
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateTab: (tab: string) => void;
}

export const EmployeeDashboardTab: React.FC<EmployeeDashboardTabProps> = ({
  employee,
  shift,
  department,
  position,
  attendance,
  setAttendance,
  leaves,
  notify,
  onNavigateTab,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [elapsedActiveSeconds, setElapsedActiveSeconds] = useState<number>(0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(
    (a) => a.employeeId === employee.id && a.attendanceDate === todayStr
  );

  const isCheckedIn = Boolean(todayRecord?.checkIn);
  const isCheckedOut = Boolean(todayRecord?.checkOut);
  const isCurrentlyWorking = isCheckedIn && !isCheckedOut;

  // Real-time wall clock ticker
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Live timer for active shift
  useEffect(() => {
    if (!isCurrentlyWorking || !todayRecord?.checkIn) {
      setElapsedActiveSeconds(0);
      return;
    }

    const checkInTime = new Date(todayRecord.checkIn).getTime();

    const updateActiveTimer = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - checkInTime) / 1000));
      setElapsedActiveSeconds(diffSecs);
    };

    updateActiveTimer();
    const interval = setInterval(updateActiveTimer, 1000);
    return () => clearInterval(interval);
  }, [isCurrentlyWorking, todayRecord?.checkIn]);

  // Format active timer into HH:MM:SS
  const formatTimerString = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Check In Handler
  const handleCheckIn = () => {
    if (isCheckedIn) return;

    const now = new Date();
    const fallbackShift: Shift = shift || {
      id: 'shift-default',
      companyId: employee.companyId,
      name: 'General Shift',
      startTime: '09:00',
      endTime: '18:00',
      breakMinutes: 60,
      gracePeriodMinutes: 15,
      workingDays: [1, 2, 3, 4, 5],
      shiftType: 'STANDARD',
      isActive: true,
    };

    const { status, lateMinutes } = evaluateCheckIn(now, fallbackShift);

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: employee.id,
      shiftId: fallbackShift.id,
      attendanceDate: todayStr,
      checkIn: now.toISOString(),
      checkOut: null,
      workingMinutes: 0,
      lateMinutes,
      overtimeMinutes: 0,
      status,
    };

    setAttendance((prev) => [
      ...prev.filter((a) => !(a.employeeId === employee.id && a.attendanceDate === todayStr)),
      newRecord,
    ]);

    if (status === 'LATE') {
      notify(`Clocked in at ${formatTimeDisplay(now.toISOString())} (${lateMinutes} min grace threshold exceeded).`, 'info');
    } else {
      notify(`Clocked in on time at ${formatTimeDisplay(now.toISOString())}. Have a productive shift!`);
    }
  };

  // Check Out Handler
  const handleCheckOut = () => {
    if (!todayRecord || !todayRecord.checkIn || isCheckedOut) return;

    const now = new Date();
    const checkInDate = new Date(todayRecord.checkIn);

    const fallbackShift: Shift = shift || {
      id: 'shift-default',
      companyId: employee.companyId,
      name: 'General Shift',
      startTime: '09:00',
      endTime: '18:00',
      breakMinutes: 60,
      gracePeriodMinutes: 15,
      workingDays: [1, 2, 3, 4, 5],
      shiftType: 'STANDARD',
      isActive: true,
    };

    const { workingMinutes, overtimeMinutes, finalStatus } = evaluateCheckOut(
      checkInDate,
      now,
      fallbackShift,
      todayRecord.status
    );

    setAttendance((prev) =>
      prev.map((r) =>
        r.id === todayRecord.id
          ? {
              ...r,
              checkOut: now.toISOString(),
              workingMinutes,
              overtimeMinutes,
              status: finalStatus,
            }
          : r
      )
    );

    notify(
      `Clocked out successfully at ${formatTimeDisplay(now.toISOString())}. Net working time: ${formatMinutes(
        workingMinutes
      )}${overtimeMinutes > 0 ? ` (+${formatMinutes(overtimeMinutes)} overtime)` : ''}.`
    );
  };

  // Month Statistics for this employee
  const currentMonth = todayStr.substring(0, 7);
  const myMonthlyRecords = attendance.filter(
    (a) => a.employeeId === employee.id && a.attendanceDate.startsWith(currentMonth)
  );

  const presentDaysCount = myMonthlyRecords.filter(
    (a) => a.status === 'PRESENT' || a.status === 'LATE'
  ).length;
  const lateDaysCount = myMonthlyRecords.filter((a) => a.status === 'LATE').length;
  const totalWorkingMinsMonth = myMonthlyRecords.reduce((acc, r) => acc + (r.workingMinutes || 0), 0);
  const totalOvertimeMinsMonth = myMonthlyRecords.reduce((acc, r) => acc + (r.overtimeMinutes || 0), 0);

  const greetingHour = currentTime.getHours();
  const greetingText =
    greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-6">
      {/* Welcome Greeting Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider">
            Self-Service Attendance Hub
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {greetingText}, {employee.fullName.split(' ')[0]}!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ready to start your workday? Scheduled for{' '}
            <strong className="text-slate-700">{shift?.name || 'General Day Shift'}</strong> (
            {shift?.startTime} - {shift?.endTime})
          </p>
        </div>

        {/* Profile Snapshot Badge */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/60">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
            {employee.avatarUrl ? (
              <img
                src={employee.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                {employee.fullName.charAt(0)}
              </div>
            )}
          </div>
          <div className="text-xs pr-2">
            <div className="font-bold text-slate-900">{employee.fullName}</div>
            <div className="text-[11px] text-slate-500 font-mono">
              {employee.employeeCode} · {position?.title}
            </div>
          </div>
        </div>
      </div>

      {/* Main Attendance Action Card + Live Clock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Digital Wall Clock */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between text-center lg:col-span-1">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-widest">
              Standard Operating Time
            </span>
            <div className="text-4xl font-black text-slate-900 font-mono tracking-tight my-2 tabular-nums">
              {currentTime.toLocaleTimeString([], { hour12: true })}
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              {currentTime.toLocaleDateString([], {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-around text-xs text-slate-500 font-medium">
            <span>Shift Grace: {shift?.gracePeriodMinutes || 15}m</span>
            <span>·</span>
            <span>Break: {shift?.breakMinutes || 60}m</span>
          </div>
        </div>

        {/* Live Attendance Console */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Attendance Terminal
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isCheckedOut
                    ? 'bg-slate-100 text-slate-700'
                    : isCurrentlyWorking
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                }`}
              >
                {isCheckedOut
                  ? 'Shift Completed Today'
                  : isCurrentlyWorking
                  ? 'Currently on Shift (Active)'
                  : 'Awaiting Check-In'}
              </span>
            </div>

            {/* Middle Display: Either Live Counter or Inactive Status */}
            {isCurrentlyWorking ? (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700">
                    Live Elapsed Working Time
                  </span>
                  <div className="text-3xl font-black font-mono text-emerald-800 tracking-tight mt-0.5 tabular-nums">
                    {formatTimerString(elapsedActiveSeconds)}
                  </div>
                  <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                    Checked in at {formatTimeDisplay(todayRecord?.checkIn || null)} (
                    {todayRecord?.status === 'LATE' ? 'Late Arrival' : 'On-Time'})
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-pulse">
                  <PlayCircle className="w-7 h-7" />
                </div>
              </div>
            ) : isCheckedOut ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Daily Record Finalized
                </span>
                <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono">
                  Worked {formatMinutes(todayRecord?.workingMinutes || 0)}
                  {todayRecord?.overtimeMinutes ? ` (+${formatMinutes(todayRecord.overtimeMinutes)} Overtime)` : ''}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-mono">
                  <span>In: {formatTimeDisplay(todayRecord?.checkIn || null)}</span>
                  <span>·</span>
                  <span>Out: {formatTimeDisplay(todayRecord?.checkOut || null)}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Assigned Today
                </span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {shift?.name || 'General Day Shift'} ({shift?.startTime} - {shift?.endTime})
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Click 'Check In Now' to record your server timestamp.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            {!isCheckedIn && (
              <button
                onClick={handleCheckIn}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl transition shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Check In Now</span>
              </button>
            )}

            {isCurrentlyWorking && (
              <button
                onClick={handleCheckOut}
                className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl transition shadow-lg shadow-rose-100 flex items-center justify-center gap-2 text-sm"
              >
                <StopCircle className="w-5 h-5" />
                <span>Check Out (End Shift)</span>
              </button>
            )}

            {isCheckedOut && (
              <button
                onClick={() => onNavigateTab('EMP_ATTENDANCE')}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs"
              >
                View Attendance Ledger
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Summary Statistics Cards */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3">
          My Performance This Month ({currentTime.toLocaleDateString([], { month: 'long', year: 'numeric' })})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Present Days</span>
            <p className="text-2xl font-black text-emerald-600 mt-1 tabular-nums">{presentDaysCount}</p>
            <span className="text-[11px] text-slate-500 font-medium">Logged on time</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Late Days</span>
            <p className="text-2xl font-black text-amber-500 mt-1 tabular-nums">{lateDaysCount}</p>
            <span className="text-[11px] text-slate-500 font-medium">Past grace period</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Working Time</span>
            <p className="text-2xl font-black text-indigo-600 mt-1 tabular-nums">
              {(totalWorkingMinsMonth / 60).toFixed(1)} <span className="text-xs">hrs</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Net duty logged</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Overtime</span>
            <p className="text-2xl font-black text-purple-600 mt-1 tabular-nums">
              {(totalOvertimeMinsMonth / 60).toFixed(1)} <span className="text-xs">hrs</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Payable overtime</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Casual Leave</span>
            <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
              {employee.leaveBalance?.casual || 0} <span className="text-xs font-semibold">days</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Remaining balance</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase font-bold text-slate-400">Paid Annual</span>
            <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
              {employee.leaveBalance?.paid || 0} <span className="text-xs font-semibold">days</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Available quota</span>
          </div>
        </div>
      </div>
    </div>
  );
};
