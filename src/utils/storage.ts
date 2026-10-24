import {
  AttendanceAuditLog,
  AttendanceRecord,
  Company,
  Department,
  Employee,
  LeaveRequest,
  Position,
  Shift,
  UserAccount,
} from '../types';

const STORAGE_KEYS = {
  COMPANY: 'wt_company_data',
  USERS: 'wt_users_data',
  DEPARTMENTS: 'wt_departments_data',
  POSITIONS: 'wt_positions_data',
  SHIFTS: 'wt_shifts_data',
  EMPLOYEES: 'wt_employees_data',
  ATTENDANCE: 'wt_attendance_data',
  LEAVES: 'wt_leaves_data',
  AUDIT_LOGS: 'wt_audit_logs_data',
  SESSION: 'wt_session_user',
};

export const INITIAL_COMPANY: Company = {
  id: 'comp-1',
  name: 'WorkTrack Global Inc.',
  timezone: 'America/New_York (EST, UTC-5)',
  standardWorkHours: 8,
  defaultGraceMinutes: 15,
  createdAt: '2024-01-01',
};

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-eng', companyId: 'comp-1', name: 'Software Engineering', description: 'Core product development, cloud systems, and platform reliability' },
  { id: 'dept-ops', companyId: 'comp-1', name: 'Operations & Logistics', description: 'Facilities, supply chain coordination, and shift workflows' },
  { id: 'dept-hr', companyId: 'comp-1', name: 'People & Culture', description: 'Human resources, talent development, and workplace compliance' },
  { id: 'dept-fin', companyId: 'comp-1', name: 'Finance & Accounting', description: 'Payroll, financial analysis, compliance, and budgeting' },
  { id: 'dept-cs', companyId: 'comp-1', name: 'Customer Support', description: '24/7 global customer success and client troubleshooting' },
];

export const INITIAL_POSITIONS: Position[] = [
  { id: 'pos-1', companyId: 'comp-1', departmentId: 'dept-eng', title: 'Senior Software Engineer', description: 'Full-stack application development & architecture' },
  { id: 'pos-2', companyId: 'comp-1', departmentId: 'dept-eng', title: 'DevOps & Cloud Specialist', description: 'Infrastructure automation and server uptime' },
  { id: 'pos-3', companyId: 'comp-1', departmentId: 'dept-ops', title: 'Shift Operations Supervisor', description: 'Oversees daily shift handovers and floor productivity' },
  { id: 'pos-4', companyId: 'comp-1', departmentId: 'dept-hr', title: 'HR & People Operations Lead', description: 'Employee benefits, leave reviews, and compliance' },
  { id: 'pos-5', companyId: 'comp-1', departmentId: 'dept-fin', title: 'Financial Analyst', description: 'Reporting, forecasting, and payroll audit assistance' },
  { id: 'pos-6', companyId: 'comp-1', departmentId: 'dept-cs', title: 'Tier 2 Support Specialist', description: 'Customer issue escalation and shift tickets' },
];

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'shift-gen',
    companyId: 'comp-1',
    name: 'General Day Shift',
    startTime: '09:00',
    endTime: '18:00',
    breakMinutes: 60,
    gracePeriodMinutes: 15,
    workingDays: [1, 2, 3, 4, 5],
    shiftType: 'STANDARD',
    isActive: true,
  },
  {
    id: 'shift-morn',
    companyId: 'comp-1',
    name: 'Morning Shift',
    startTime: '06:00',
    endTime: '14:30',
    breakMinutes: 45,
    gracePeriodMinutes: 15,
    workingDays: [1, 2, 3, 4, 5, 6],
    shiftType: 'ROTATIONAL',
    isActive: true,
  },
  {
    id: 'shift-eve',
    companyId: 'comp-1',
    name: 'Evening Shift',
    startTime: '14:00',
    endTime: '22:30',
    breakMinutes: 45,
    gracePeriodMinutes: 15,
    workingDays: [1, 2, 3, 4, 5],
    shiftType: 'ROTATIONAL',
    isActive: true,
  },
  {
    id: 'shift-night',
    companyId: 'comp-1',
    name: 'Overnight Graveyard Shift',
    startTime: '22:00',
    endTime: '06:00',
    breakMinutes: 60,
    gracePeriodMinutes: 20,
    workingDays: [0, 1, 2, 3, 4],
    shiftType: 'NIGHT',
    isActive: true,
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    companyId: 'comp-1',
    employeeCode: 'WTR-1001',
    fullName: 'Sarah Jenkins',
    email: 'sarah.j@worktrack.io',
    phone: '+1 (555) 234-8901',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2023-02-01',
    positionId: 'pos-1',
    departmentId: 'dept-eng',
    assignedShiftId: 'shift-gen',
    workLocation: 'New York HQ',
    employmentStatus: 'ACTIVE',
    leaveBalance: { casual: 7, sick: 10, paid: 14 },
  },
  {
    id: 'emp-2',
    companyId: 'comp-1',
    employeeCode: 'WTR-1002',
    fullName: 'David Vance',
    email: 'david.v@worktrack.io',
    phone: '+1 (555) 345-9012',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2023-04-15',
    positionId: 'pos-3',
    departmentId: 'dept-ops',
    assignedShiftId: 'shift-morn',
    workLocation: 'Logistics Facility Alpha',
    employmentStatus: 'ACTIVE',
    leaveBalance: { casual: 5, sick: 8, paid: 12 },
  },
  {
    id: 'emp-3',
    companyId: 'comp-1',
    employeeCode: 'WTR-1003',
    fullName: 'Elena Rostova',
    email: 'elena.r@worktrack.io',
    phone: '+1 (555) 456-0123',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2022-11-10',
    positionId: 'pos-4',
    departmentId: 'dept-hr',
    assignedShiftId: 'shift-gen',
    workLocation: 'New York HQ',
    employmentStatus: 'ACTIVE',
    leaveBalance: { casual: 8, sick: 12, paid: 16 },
  },
  {
    id: 'emp-4',
    companyId: 'comp-1',
    employeeCode: 'WTR-1004',
    fullName: 'Marcus Brody',
    email: 'marcus.b@worktrack.io',
    phone: '+1 (555) 567-1234',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2023-08-01',
    positionId: 'pos-2',
    departmentId: 'dept-eng',
    assignedShiftId: 'shift-night',
    workLocation: 'Remote - North America',
    employmentStatus: 'ACTIVE',
    leaveBalance: { casual: 6, sick: 9, paid: 10 },
  },
  {
    id: 'emp-5',
    companyId: 'comp-1',
    employeeCode: 'WTR-1005',
    fullName: 'Amara Chen',
    email: 'amara.c@worktrack.io',
    phone: '+1 (555) 678-2345',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2024-01-08',
    positionId: 'pos-5',
    departmentId: 'dept-fin',
    assignedShiftId: 'shift-gen',
    workLocation: 'New York HQ',
    employmentStatus: 'ACTIVE',
    leaveBalance: { casual: 9, sick: 11, paid: 15 },
  },
  {
    id: 'emp-6',
    companyId: 'comp-1',
    employeeCode: 'WTR-1006',
    fullName: 'Liam O\'Connor',
    email: 'liam.o@worktrack.io',
    phone: '+1 (555) 789-3456',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2023-09-12',
    positionId: 'pos-6',
    departmentId: 'dept-cs',
    assignedShiftId: 'shift-eve',
    workLocation: 'Branch Support Hub',
    employmentStatus: 'ACTIVE',
    leaveBalance: { casual: 4, sick: 8, paid: 11 },
  },
];

// Helper to format date offset
function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Today's records
  {
    id: 'att-today-2',
    employeeId: 'emp-2',
    shiftId: 'shift-morn',
    attendanceDate: getDateOffset(0),
    checkIn: `${getDateOffset(0)}T06:05:00`,
    checkOut: null, // Currently on shift!
    workingMinutes: 0,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'PRESENT',
  },
  {
    id: 'att-today-3',
    employeeId: 'emp-3',
    shiftId: 'shift-gen',
    attendanceDate: getDateOffset(0),
    checkIn: `${getDateOffset(0)}T09:25:00`, // Late arrival (after 09:15)
    checkOut: null,
    workingMinutes: 0,
    lateMinutes: 25,
    overtimeMinutes: 0,
    status: 'LATE',
  },
  {
    id: 'att-today-5',
    employeeId: 'emp-5',
    shiftId: 'shift-gen',
    attendanceDate: getDateOffset(0),
    checkIn: `${getDateOffset(0)}T08:55:00`,
    checkOut: null,
    workingMinutes: 0,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'PRESENT',
  },
  // Yesterday's records (complete shifts)
  {
    id: 'att-yest-1',
    employeeId: 'emp-1',
    shiftId: 'shift-gen',
    attendanceDate: getDateOffset(-1),
    checkIn: `${getDateOffset(-1)}T08:58:00`,
    checkOut: `${getDateOffset(-1)}T18:45:00`,
    workingMinutes: 527, // 9h 47m gross - 60m break = 8h 47m net
    lateMinutes: 0,
    overtimeMinutes: 47, // 47 mins overtime
    status: 'PRESENT',
  },
  {
    id: 'att-yest-2',
    employeeId: 'emp-2',
    shiftId: 'shift-morn',
    attendanceDate: getDateOffset(-1),
    checkIn: `${getDateOffset(-1)}T06:02:00`,
    checkOut: `${getDateOffset(-1)}T14:35:00`,
    workingMinutes: 468,
    lateMinutes: 0,
    overtimeMinutes: 5,
    status: 'PRESENT',
  },
  {
    id: 'att-yest-3',
    employeeId: 'emp-3',
    shiftId: 'shift-gen',
    attendanceDate: getDateOffset(-1),
    checkIn: `${getDateOffset(-1)}T09:05:00`,
    checkOut: `${getDateOffset(-1)}T18:00:00`,
    workingMinutes: 475,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'PRESENT',
  },
  {
    id: 'att-yest-4',
    employeeId: 'emp-4',
    shiftId: 'shift-night',
    attendanceDate: getDateOffset(-1),
    checkIn: `${getDateOffset(-1)}T21:55:00`,
    checkOut: `${getDateOffset(0)}T06:10:00`,
    workingMinutes: 435,
    lateMinutes: 0,
    overtimeMinutes: 10,
    status: 'PRESENT',
  },
  {
    id: 'att-yest-5',
    employeeId: 'emp-5',
    shiftId: 'shift-gen',
    attendanceDate: getDateOffset(-1),
    checkIn: `${getDateOffset(-1)}T09:35:00`,
    checkOut: `${getDateOffset(-1)}T18:15:00`,
    workingMinutes: 460,
    lateMinutes: 35,
    overtimeMinutes: 0,
    status: 'LATE',
  },
  // Day -2
  {
    id: 'att-d2-1',
    employeeId: 'emp-1',
    shiftId: 'shift-gen',
    attendanceDate: getDateOffset(-2),
    checkIn: `${getDateOffset(-2)}T09:00:00`,
    checkOut: `${getDateOffset(-2)}T18:10:00`,
    workingMinutes: 490,
    lateMinutes: 0,
    overtimeMinutes: 10,
    status: 'PRESENT',
  },
  {
    id: 'att-d2-2',
    employeeId: 'emp-2',
    shiftId: 'shift-morn',
    attendanceDate: getDateOffset(-2),
    checkIn: `${getDateOffset(-2)}T06:22:00`,
    checkOut: `${getDateOffset(-2)}T14:30:00`,
    workingMinutes: 443,
    lateMinutes: 22,
    overtimeMinutes: 0,
    status: 'LATE',
  },
  {
    id: 'att-d2-6',
    employeeId: 'emp-6',
    shiftId: 'shift-eve',
    attendanceDate: getDateOffset(-2),
    checkIn: `${getDateOffset(-2)}T14:00:00`,
    checkOut: `${getDateOffset(-2)}T22:30:00`,
    workingMinutes: 465,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'PRESENT',
  },
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'leave-101',
    employeeId: 'emp-6',
    leaveType: 'CASUAL',
    startDate: getDateOffset(0),
    endDate: getDateOffset(1),
    daysCount: 2,
    reason: 'Personal family commitment and travel',
    status: 'APPROVED',
    reviewedBy: 'admin@worktrack.io',
    reviewRemarks: 'Approved as per casual quota.',
    createdAt: getDateOffset(-3),
  },
  {
    id: 'leave-102',
    employeeId: 'emp-1',
    leaveType: 'PAID',
    startDate: getDateOffset(5),
    endDate: getDateOffset(8),
    daysCount: 4,
    reason: 'Annual family holiday trip',
    status: 'PENDING',
    createdAt: getDateOffset(-1),
  },
  {
    id: 'leave-103',
    employeeId: 'emp-4',
    leaveType: 'SICK',
    startDate: getDateOffset(-5),
    endDate: getDateOffset(-4),
    daysCount: 2,
    reason: 'Medical consultation & flu recovery',
    status: 'APPROVED',
    reviewedBy: 'admin@worktrack.io',
    reviewRemarks: 'Medical certificate verified.',
    createdAt: getDateOffset(-6),
  },
];

export const INITIAL_AUDIT_LOGS: AttendanceAuditLog[] = [
  {
    id: 'audit-1',
    attendanceId: 'att-d2-2',
    employeeName: 'David Vance',
    attendanceDate: getDateOffset(-2),
    changedBy: 'admin@worktrack.io (HR Admin)',
    previousValues: { checkIn: `${getDateOffset(-2)}T06:40:00`, status: 'LATE' },
    updatedValues: { checkIn: `${getDateOffset(-2)}T06:22:00`, status: 'LATE' },
    reason: 'Corrected check-in timestamp due to badge reader reboot.',
    changedAt: `${getDateOffset(-1)}T10:30:00Z`,
  },
];

// Helper functions for reading/writing with fallback
export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export function loadAllData() {
  return {
    company: getStoredData<Company>(STORAGE_KEYS.COMPANY, INITIAL_COMPANY),
    departments: getStoredData<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS),
    positions: getStoredData<Position[]>(STORAGE_KEYS.POSITIONS, INITIAL_POSITIONS),
    shifts: getStoredData<Shift[]>(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS),
    employees: getStoredData<Employee[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES),
    attendance: getStoredData<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE),
    leaves: getStoredData<LeaveRequest[]>(STORAGE_KEYS.LEAVES, INITIAL_LEAVES),
    auditLogs: getStoredData<AttendanceAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  };
}

export function resetAllDataToDemo() {
  localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(INITIAL_COMPANY));
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
  localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(INITIAL_POSITIONS));
  localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(INITIAL_SHIFTS));
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(INITIAL_LEAVES));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
}
