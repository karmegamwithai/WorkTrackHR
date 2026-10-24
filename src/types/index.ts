export type UserRole = 'EMPLOYER' | 'EMPLOYEE';

export type EmploymentStatus = 'ACTIVE' | 'PROBATION' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'ON_LEAVE'
  | 'HOLIDAY'
  | 'WEEKLY_OFF'
  | 'INCOMPLETE';

export type LeaveType = 'CASUAL' | 'SICK' | 'PAID' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Company {
  id: string;
  name: string;
  timezone: string;
  standardWorkHours: number; // e.g. 8
  defaultGraceMinutes: number; // e.g. 15
  createdAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  employeeId?: string; // Links to Employee if role is EMPLOYEE
}

export interface Department {
  id: string;
  companyId: string;
  name: string;
  description: string;
}

export interface Position {
  id: string;
  companyId: string;
  departmentId: string;
  title: string;
  description: string;
  reportingManagerId?: string;
}

export interface Shift {
  id: string;
  companyId: string;
  name: string;
  startTime: string; // HH:mm format, e.g. "09:00"
  endTime: string;   // HH:mm format, e.g. "18:00" or "06:00" (overnight)
  breakMinutes: number; // e.g. 60
  gracePeriodMinutes: number; // e.g. 15
  workingDays: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  shiftType: 'STANDARD' | 'ROTATIONAL' | 'NIGHT';
  isActive: boolean;
}

export interface Employee {
  id: string;
  companyId: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  joiningDate: string;
  positionId: string;
  departmentId: string;
  assignedShiftId: string;
  reportingManagerId?: string;
  workLocation: string; // "Headquarters - New York" | "Remote" | "Branch Office"
  employmentStatus: EmploymentStatus;
  temporaryPassword?: string;
  leaveBalance: {
    casual: number;
    sick: number;
    paid: number;
  };
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  shiftId: string;
  attendanceDate: string; // YYYY-MM-DD
  checkIn: string | null; // ISO DateTime
  checkOut: string | null; // ISO DateTime
  workingMinutes: number; // Net duration excluding unpaid breaks
  overtimeMinutes: number;
  lateMinutes: number;
  status: AttendanceStatus;
  notes?: string;
  isManualCorrection?: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewRemarks?: string;
  createdAt: string;
}

export interface AttendanceAuditLog {
  id: string;
  attendanceId: string;
  employeeName: string;
  attendanceDate: string;
  changedBy: string; // user email / role
  previousValues: {
    checkIn?: string | null;
    checkOut?: string | null;
    status?: AttendanceStatus;
  };
  updatedValues: {
    checkIn?: string | null;
    checkOut?: string | null;
    status?: AttendanceStatus;
  };
  reason: string;
  changedAt: string;
}
