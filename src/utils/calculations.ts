import { AttendanceRecord, AttendanceStatus, Shift } from '../types';

/**
 * Checks if a shift crosses midnight (overnight shift)
 */
export function isOvernightShift(startTime: string, endTime: string): boolean {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  return endMins <= startMins;
}

/**
 * Calculates scheduled duration of a shift in minutes (gross and net after break)
 */
export function getShiftScheduledMinutes(shift: Shift): { gross: number; net: number } {
  const [startH, startM] = shift.startTime.split(':').map(Number);
  const [endH, endM] = shift.endTime.split(':').map(Number);
  let duration = (endH * 60 + endM) - (startH * 60 + startM);
  if (duration <= 0) {
    duration += 24 * 60; // Crosses midnight
  }
  const net = Math.max(0, duration - (shift.breakMinutes || 0));
  return { gross: duration, net };
}

/**
 * Calculates check-in status and late minutes based on scheduled shift start and grace period
 */
export function evaluateCheckIn(
  checkInDate: Date,
  shift: Shift
): { status: AttendanceStatus; lateMinutes: number } {
  const [startH, startM] = shift.startTime.split(':').map(Number);
  
  // Construct shift start time on the check-in date
  const shiftStart = new Date(checkInDate);
  shiftStart.setHours(startH, startM, 0, 0);

  // Add grace period
  const graceThreshold = new Date(shiftStart.getTime() + (shift.gracePeriodMinutes || 0) * 60000);

  if (checkInDate > graceThreshold) {
    const diffMs = checkInDate.getTime() - shiftStart.getTime();
    const lateMinutes = Math.max(0, Math.floor(diffMs / 60000));
    return {
      status: 'LATE',
      lateMinutes,
    };
  }

  return {
    status: 'PRESENT',
    lateMinutes: 0,
  };
}

/**
 * Calculates check-out outcomes: gross duration, net working duration (deducting break),
 * overtime, and status (Half Day if worked less than 50% of scheduled net).
 */
export function evaluateCheckOut(
  checkInDate: Date,
  checkOutDate: Date,
  shift: Shift,
  currentStatus: AttendanceStatus
): {
  workingMinutes: number;
  overtimeMinutes: number;
  finalStatus: AttendanceStatus;
} {
  const diffMs = Math.max(0, checkOutDate.getTime() - checkInDate.getTime());
  const grossMinutes = Math.floor(diffMs / 60000);
  
  // Deduct unpaid break minutes
  const breakMins = shift.breakMinutes || 0;
  const netWorkingMinutes = Math.max(0, grossMinutes - breakMins);

  const { net: scheduledNetMinutes } = getShiftScheduledMinutes(shift);

  // Overtime if worked beyond scheduled net duration
  let overtimeMinutes = 0;
  if (netWorkingMinutes > scheduledNetMinutes) {
    overtimeMinutes = netWorkingMinutes - scheduledNetMinutes;
  }

  // Half Day detection if worked < 50% of scheduled duration
  let finalStatus = currentStatus;
  if (scheduledNetMinutes > 0 && netWorkingMinutes < scheduledNetMinutes / 2) {
    finalStatus = 'HALF_DAY';
  }

  return {
    workingMinutes: netWorkingMinutes,
    overtimeMinutes,
    finalStatus,
  };
}

/**
 * Format minutes into "Xh Ym"
 */
export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return '0h 0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Format time to "09:30 AM"
 */
export function formatTimeDisplay(isoString: string | null): string {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '—';
  }
}

/**
 * Format date to "Wed, Oct 24, 2026"
 */
export function formatDateDisplay(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Generate and trigger CSV file download
 */
export function exportAttendanceToCSV(
  records: Array<{
    date: string;
    employeeCode: string;
    employeeName: string;
    department: string;
    position: string;
    shiftName: string;
    checkIn: string;
    checkOut: string;
    lateMinutes: number;
    workingHours: string;
    overtimeHours: string;
    status: string;
  }>,
  fileName = 'WorkTrack_Attendance_Report.csv'
) {
  const headers = [
    'Date',
    'Employee ID',
    'Full Name',
    'Department',
    'Position',
    'Shift',
    'Check-In Time',
    'Check-Out Time',
    'Late (Mins)',
    'Working Time',
    'Overtime',
    'Status',
  ];

  const rows = records.map((r) => [
    r.date,
    r.employeeCode,
    `"${r.employeeName.replace(/"/g, '""')}"`,
    `"${r.department.replace(/"/g, '""')}"`,
    `"${r.position.replace(/"/g, '""')}"`,
    `"${r.shiftName.replace(/"/g, '""')}"`,
    r.checkIn,
    r.checkOut,
    r.lateMinutes,
    r.workingHours,
    r.overtimeHours,
    r.status,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
