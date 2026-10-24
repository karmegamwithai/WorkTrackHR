import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  AttendanceAuditLog,
  AttendanceRecord,
  Company,
  Department,
  Employee,
  LeaveRequest,
  Position,
  Shift,
  UserRole,
} from './types';
import {
  loadAllData,
  setStoredData,
  INITIAL_COMPANY,
  INITIAL_DEPARTMENTS,
  INITIAL_POSITIONS,
  INITIAL_SHIFTS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_AUDIT_LOGS,
} from './utils/storage';

// Common Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';

// Employer Tabs
import { DashboardTab } from './components/employer/DashboardTab';
import { EmployeesTab } from './components/employer/EmployeesTab';
import { DepartmentsPositionsTab } from './components/employer/DepartmentsPositionsTab';
import { ShiftsTab } from './components/employer/ShiftsTab';
import { AttendanceTab } from './components/employer/AttendanceTab';
import { LeaveRequestsTab } from './components/employer/LeaveRequestsTab';
import { ReportsTab } from './components/employer/ReportsTab';
import { SettingsTab } from './components/employer/SettingsTab';

// Employee Tabs
import { EmployeeDashboardTab } from './components/employee/EmployeeDashboardTab';
import { MyAttendanceTab } from './components/employee/MyAttendanceTab';
import { MyShiftsTab } from './components/employee/MyShiftsTab';
import { MyLeavesTab } from './components/employee/MyLeavesTab';
import { MyProfileTab } from './components/employee/MyProfileTab';

// Landing & Auth
import { LandingPage } from './components/landing/LandingPage';
import { LoginModal } from './components/landing/LoginModal';

function MainAppContent() {
  const { user, notification, notify } = useAuth();

  // Primary Data State
  const [initialLoaded] = useState(() => loadAllData());
  const [company, setCompany] = useState<Company>(initialLoaded.company);
  const [departments, setDepartments] = useState<Department[]>(initialLoaded.departments);
  const [positions, setPositions] = useState<Position[]>(initialLoaded.positions);
  const [shifts, setShifts] = useState<Shift[]>(initialLoaded.shifts);
  const [employees, setEmployees] = useState<Employee[]>(initialLoaded.employees);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialLoaded.attendance);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLoaded.leaves);
  const [auditLogs, setAuditLogs] = useState<AttendanceAuditLog[]>(initialLoaded.auditLogs);

  // Active Tab State
  const [employerActiveTab, setEmployerActiveTab] = useState<string>('DASHBOARD');
  const [employeeActiveTab, setEmployeeActiveTab] = useState<string>('EMP_DASHBOARD');

  // Login Modal State
  const [loginModalRole, setLoginModalRole] = useState<UserRole | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    setStoredData('wt_company_data', company);
  }, [company]);

  useEffect(() => {
    setStoredData('wt_departments_data', departments);
  }, [departments]);

  useEffect(() => {
    setStoredData('wt_positions_data', positions);
  }, [positions]);

  useEffect(() => {
    setStoredData('wt_shifts_data', shifts);
  }, [shifts]);

  useEffect(() => {
    setStoredData('wt_employees_data', employees);
  }, [employees]);

  useEffect(() => {
    setStoredData('wt_attendance_data', attendance);
  }, [attendance]);

  useEffect(() => {
    setStoredData('wt_leaves_data', leaves);
  }, [leaves]);

  useEffect(() => {
    setStoredData('wt_audit_logs_data', auditLogs);
  }, [auditLogs]);

  const handleResetDemoData = () => {
    setCompany(INITIAL_COMPANY);
    setDepartments(INITIAL_DEPARTMENTS);
    setPositions(INITIAL_POSITIONS);
    setShifts(INITIAL_SHIFTS);
    setEmployees(INITIAL_EMPLOYEES);
    setAttendance(INITIAL_ATTENDANCE);
    setLeaves(INITIAL_LEAVES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  // Find active employee for Employee Portal
  const currentEmployee = employees.find((e) => e.id === user?.employeeId) || employees[0];
  const currentShift = shifts.find((s) => s.id === currentEmployee?.assignedShiftId);
  const currentDepartment = departments.find((d) => d.id === currentEmployee?.departmentId);
  const currentPosition = positions.find((p) => p.id === currentEmployee?.positionId);

  // Toast Notification
  const toastNotificationElement = notification && (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
        notification.type === 'error'
          ? 'bg-rose-50 border-rose-200 text-rose-700'
          : notification.type === 'info'
          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}
    >
      <span>{notification.message}</span>
    </div>
  );

  // 1. PUBLIC LANDING VIEW
  if (!user) {
    return (
      <div className="relative">
        {toastNotificationElement}
        <LandingPage
          employees={employees}
          onOpenEmployerLogin={() => setLoginModalRole('EMPLOYER')}
          onOpenEmployeeLogin={() => setLoginModalRole('EMPLOYEE')}
        />
        {loginModalRole && (
          <LoginModal
            initialRole={loginModalRole}
            onClose={() => setLoginModalRole(null)}
            employees={employees}
          />
        )}
      </div>
    );
  }

  // 2. EMPLOYER / ADMIN PORTAL VIEW
  if (user.role === 'EMPLOYER') {
    const titlesMap: Record<string, { title: string; subtitle: string }> = {
      DASHBOARD: {
        title: 'Workforce Command Center',
        subtitle: 'Live organizational metrics, attendance turnouts, and shift adherence',
      },
      EMPLOYEES: {
        title: 'Personnel Directory',
        subtitle: 'Employee profiles, department placement, and contract statuses',
      },
      DEPTS_POS: {
        title: 'Departments & Job Positions',
        subtitle: 'Organizational hierarchy, departments, and custom roles',
      },
      SHIFTS: {
        title: 'Shift Schedules & Rosters',
        subtitle: 'Operational shift profiles, overnight calculations, and staff assignments',
      },
      ATTENDANCE: {
        title: 'Attendance Monitoring & Audit',
        subtitle: 'Verified server check-ins, lateness, overtime, and manual adjustments',
      },
      LEAVES: {
        title: 'Leave Requests & Approvals',
        subtitle: 'Review time-off submissions and synchronize attendance logs',
      },
      REPORTS: {
        title: 'Attendance Reports & CSV Export',
        subtitle: 'Aggregated payroll ledgers, hours breakdown, and compliance records',
      },
      SETTINGS: {
        title: 'Company Settings & Policies',
        subtitle: 'Timezone parameters, grace windows, and demo database tools',
      },
    };

    const currentTitle = titlesMap[employerActiveTab] || {
      title: 'WorkTrack HR',
      subtitle: 'Administration Portal',
    };

    return (
      <div className="flex bg-[#F8FAFC] min-h-screen">
        {toastNotificationElement}
        <Sidebar
          activeTab={employerActiveTab}
          setActiveTab={setEmployerActiveTab}
          employees={employees}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header
            title={currentTitle.title}
            subtitle={currentTitle.subtitle}
            company={company}
            employees={employees}
            onSwitchPortal={() => setEmployeeActiveTab('EMP_DASHBOARD')}
          />
          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
            {employerActiveTab === 'DASHBOARD' && (
              <DashboardTab
                employees={employees}
                departments={departments}
                positions={positions}
                shifts={shifts}
                attendance={attendance}
                leaves={leaves}
                onNavigate={(tab) => setEmployerActiveTab(tab)}
              />
            )}
            {employerActiveTab === 'EMPLOYEES' && (
              <EmployeesTab
                employees={employees}
                setEmployees={setEmployees}
                departments={departments}
                positions={positions}
                shifts={shifts}
                notify={notify}
              />
            )}
            {employerActiveTab === 'DEPTS_POS' && (
              <DepartmentsPositionsTab
                departments={departments}
                setDepartments={setDepartments}
                positions={positions}
                setPositions={setPositions}
                employees={employees}
                notify={notify}
              />
            )}
            {employerActiveTab === 'SHIFTS' && (
              <ShiftsTab
                shifts={shifts}
                setShifts={setShifts}
                employees={employees}
                setEmployees={setEmployees}
                departments={departments}
                positions={positions}
                notify={notify}
              />
            )}
            {employerActiveTab === 'ATTENDANCE' && (
              <AttendanceTab
                attendance={attendance}
                setAttendance={setAttendance}
                employees={employees}
                departments={departments}
                positions={positions}
                shifts={shifts}
                auditLogs={auditLogs}
                setAuditLogs={setAuditLogs}
                notify={notify}
              />
            )}
            {employerActiveTab === 'LEAVES' && (
              <LeaveRequestsTab
                leaves={leaves}
                setLeaves={setLeaves}
                employees={employees}
                departments={departments}
                attendance={attendance}
                setAttendance={setAttendance}
                notify={notify}
              />
            )}
            {employerActiveTab === 'REPORTS' && (
              <ReportsTab
                attendance={attendance}
                employees={employees}
                departments={departments}
                positions={positions}
                shifts={shifts}
                notify={notify}
              />
            )}
            {employerActiveTab === 'SETTINGS' && (
              <SettingsTab
                company={company}
                setCompany={setCompany}
                onResetAllData={handleResetDemoData}
                notify={notify}
              />
            )}
          </main>
        </div>
      </div>
    );
  }

  // 3. EMPLOYEE PORTAL VIEW
  const employeeTitlesMap: Record<string, { title: string; subtitle: string }> = {
    EMP_DASHBOARD: {
      title: 'Employee Attendance Console',
      subtitle: `Welcome back, ${currentEmployee?.fullName || 'Colleague'}`,
    },
    EMP_ATTENDANCE: {
      title: 'My Attendance Logs',
      subtitle: 'Complete record of your daily check-in, check-out, and duty hours',
    },
    EMP_SHIFTS: {
      title: 'My Shift Timetable',
      subtitle: 'Weekly work hours, break rules, and assigned facility',
    },
    EMP_LEAVES: {
      title: 'My Leave Applications',
      subtitle: 'Apply for time off and view remaining vacation and medical quotas',
    },
    EMP_PROFILE: {
      title: 'My Employment Profile',
      subtitle: 'Department placement, manager details, and password preferences',
    },
  };

  const currentEmpTitle = employeeTitlesMap[employeeActiveTab] || {
    title: 'Employee Portal',
    subtitle: 'Daily attendance and shift workspace',
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      {toastNotificationElement}
      <Sidebar
        activeTab={employeeActiveTab}
        setActiveTab={setEmployeeActiveTab}
        employees={employees}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title={currentEmpTitle.title}
          subtitle={currentEmpTitle.subtitle}
          company={company}
          employees={employees}
          onSwitchPortal={() => setEmployerActiveTab('DASHBOARD')}
        />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {employeeActiveTab === 'EMP_DASHBOARD' && (
            <EmployeeDashboardTab
              employee={currentEmployee}
              shift={currentShift}
              department={currentDepartment}
              position={currentPosition}
              attendance={attendance}
              setAttendance={setAttendance}
              leaves={leaves}
              notify={notify}
              onNavigateTab={(tab) => setEmployeeActiveTab(tab)}
            />
          )}
          {employeeActiveTab === 'EMP_ATTENDANCE' && (
            <MyAttendanceTab
              employee={currentEmployee}
              attendance={attendance}
              shifts={shifts}
            />
          )}
          {employeeActiveTab === 'EMP_SHIFTS' && (
            <MyShiftsTab
              employee={currentEmployee}
              shift={currentShift}
            />
          )}
          {employeeActiveTab === 'EMP_LEAVES' && (
            <MyLeavesTab
              employee={currentEmployee}
              leaves={leaves}
              setLeaves={setLeaves}
              notify={notify}
            />
          )}
          {employeeActiveTab === 'EMP_PROFILE' && (
            <MyProfileTab
              employee={currentEmployee}
              setEmployees={setEmployees}
              department={currentDepartment}
              position={currentPosition}
              shift={currentShift}
              notify={notify}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
