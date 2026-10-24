import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  KeyRound,
  ShieldCheck,
  CheckCircle,
  X,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Department, Employee, EmploymentStatus, Position, Shift } from '../../types';

interface EmployeesTabProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  departments: Department[];
  positions: Position[];
  shifts: Shift[];
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const EmployeesTab: React.FC<EmployeesTabProps> = ({
  employees,
  setEmployees,
  departments,
  positions,
  shifts,
  notify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [passwordResetEmployee, setPasswordResetEmployee] = useState<Employee | null>(null);
  const [newTempPassword, setNewTempPassword] = useState('');

  // New Employee Form State
  const initialFormState = {
    companyId: 'comp-1',
    employeeCode: `WTR-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: '',
    joiningDate: new Date().toISOString().split('T')[0],
    positionId: positions[0]?.id || '',
    departmentId: departments[0]?.id || '',
    assignedShiftId: shifts[0]?.id || '',
    workLocation: 'New York HQ',
    employmentStatus: 'ACTIVE' as EmploymentStatus,
    temporaryPassword: 'password123',
  };

  const [formData, setFormData] = useState(initialFormState);

  // Filters
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !deptFilter || emp.departmentId === deptFilter;
    const matchesShift = !shiftFilter || emp.assignedShiftId === shiftFilter;
    const matchesStatus = !statusFilter || emp.employmentStatus === statusFilter;
    return matchesSearch && matchesDept && matchesShift && matchesStatus;
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      notify('Please provide full name and valid email.', 'error');
      return;
    }

    const newEmp: Employee = {
      ...formData,
      id: `emp-${Date.now()}`,
      avatarUrl:
        formData.avatarUrl.trim() ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      leaveBalance: { casual: 8, sick: 10, paid: 15 },
    };

    setEmployees((prev) => [newEmp, ...prev]);
    setIsAddModalOpen(false);
    setFormData({
      ...initialFormState,
      employeeCode: `WTR-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    notify(`Employee ${newEmp.fullName} (${newEmp.employeeCode}) added successfully.`);
  };

  const handleEditEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setEmployees((prev) =>
      prev.map((emp) => (emp.id === editingEmployee.id ? editingEmployee : emp))
    );
    setEditingEmployee(null);
    notify(`Updated records for ${editingEmployee.fullName}`);
  };

  const handleToggleStatus = (emp: Employee) => {
    const newStatus: EmploymentStatus = emp.employmentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, employmentStatus: newStatus } : e))
    );
    notify(
      `Employee ${emp.fullName} has been ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}.`
    );
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetEmployee || !newTempPassword.trim()) return;

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === passwordResetEmployee.id
          ? { ...e, temporaryPassword: newTempPassword }
          : e
      )
    );
    notify(`Temporary password reset for ${passwordResetEmployee.fullName}.`);
    setPasswordResetEmployee(null);
    setNewTempPassword('');
  };

  const exportEmployeeCSV = () => {
    const headers = [
      'Employee Code',
      'Full Name',
      'Email',
      'Phone',
      'Department',
      'Position',
      'Shift',
      'Location',
      'Status',
      'Joining Date',
    ];

    const rows = filteredEmployees.map((e) => {
      const dept = departments.find((d) => d.id === e.departmentId)?.name || '—';
      const pos = positions.find((p) => p.id === e.positionId)?.title || '—';
      const shift = shifts.find((s) => s.id === e.assignedShiftId)?.name || '—';
      return [
        e.employeeCode,
        `"${e.fullName.replace(/"/g, '""')}"`,
        e.email,
        e.phone,
        `"${dept}"`,
        `"${pos}"`,
        `"${shift}"`,
        `"${e.workLocation}"`,
        e.employmentStatus,
        e.joiningDate,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WorkTrack_Personnel_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify('Personnel directory exported to CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Personnel Directory</h2>
          <p className="text-xs text-slate-500">
            Manage employee profiles, shift assignments, and credentials
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportEmployeeCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Directory</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, ID code, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
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
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none"
          >
            <option value="">All Shifts</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PROBATION">Probation</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          {(searchTerm || deptFilter || shiftFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDeptFilter('');
                setShiftFilter('');
                setStatusFilter('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Position & Dept</th>
                <th className="py-3 px-4">Assigned Shift</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No employees found matching the specified filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const dept = departments.find((d) => d.id === emp.departmentId);
                  const pos = positions.find((p) => p.id === emp.positionId);
                  const shift = shifts.find((s) => s.id === emp.assignedShiftId);
                  const isActive = emp.employmentStatus === 'ACTIVE';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-600">
                            {emp.avatarUrl ? (
                              <img
                                src={emp.avatarUrl}
                                alt={emp.fullName}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              emp.fullName.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{emp.fullName}</div>
                            <div className="text-[11px] text-slate-600 font-mono">
                              {emp.employeeCode} · {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{pos?.title || 'Unassigned'}</div>
                        <div className="text-slate-600 text-[11px]">{dept?.name || 'General'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{shift?.name || 'Standard'}</div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          {shift ? `${shift.startTime} - ${shift.endTime}` : '—'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {emp.workLocation}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                          }`}
                        >
                          {emp.employmentStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingEmployee(emp)}
                            title="View Full Profile"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingEmployee(emp)}
                            title="Edit Employee"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setPasswordResetEmployee(emp);
                              setNewTempPassword('password123');
                            }}
                            title="Reset Temporary Password"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(emp)}
                            title={isActive ? 'Deactivate Employee' : 'Activate Employee'}
                            className={`p-1.5 rounded-lg transition ${
                              isActive
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Enroll New Employee</h3>
                <p className="text-xs text-slate-500">Provide personal and contract assignment details</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Full Name *</label>
                  <input
                    required
                    placeholder="e.g. Rachel Adams"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Employee Code *</label>
                  <input
                    required
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="rachel.a@worktrack.io"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Phone Number</label>
                  <input
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Position *</label>
                  <select
                    value={formData.positionId}
                    onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  >
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Assigned Shift *</label>
                  <select
                    value={formData.assignedShiftId}
                    onChange={(e) => setFormData({ ...formData, assignedShiftId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Work Location</label>
                  <select
                    value={formData.workLocation}
                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="New York HQ">New York HQ</option>
                    <option value="Logistics Facility Alpha">Logistics Facility Alpha</option>
                    <option value="Remote - North America">Remote - North America</option>
                    <option value="Branch Support Hub">Branch Support Hub</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Initial Password</label>
                  <input
                    type="password"
                    value={formData.temporaryPassword}
                    onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs"
                >
                  Save & Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Edit {editingEmployee.fullName}
              </h3>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditEmployee} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">Full Name</label>
                <input
                  required
                  value={editingEmployee.fullName}
                  onChange={(e) =>
                    setEditingEmployee({ ...editingEmployee, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Department</label>
                  <select
                    value={editingEmployee.departmentId}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, departmentId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Position</label>
                  <select
                    value={editingEmployee.positionId}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, positionId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Shift</label>
                  <select
                    value={editingEmployee.assignedShiftId}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, assignedShiftId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Location</label>
                  <input
                    value={editingEmployee.workLocation}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, workLocation: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                  {viewingEmployee.avatarUrl ? (
                    <img
                      src={viewingEmployee.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                      {viewingEmployee.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewingEmployee.fullName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{viewingEmployee.employeeCode}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingEmployee(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Department</span>
                <span className="font-semibold text-slate-800">
                  {departments.find((d) => d.id === viewingEmployee.departmentId)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Position</span>
                <span className="font-semibold text-slate-800">
                  {positions.find((p) => p.id === viewingEmployee.positionId)?.title}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Assigned Shift</span>
                <span className="font-semibold text-slate-800">
                  {shifts.find((s) => s.id === viewingEmployee.assignedShiftId)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Work Location</span>
                <span className="font-semibold text-slate-800">{viewingEmployee.workLocation}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Joining Date</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {viewingEmployee.joiningDate}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Leave Balance</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  Casual: {viewingEmployee.leaveBalance?.casual || 0}d · Sick: {viewingEmployee.leaveBalance?.sick || 0}d · Paid: {viewingEmployee.leaveBalance?.paid || 0}d
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {passwordResetEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Reset Temporary Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Set a temporary password for <strong>{passwordResetEmployee.fullName}</strong>.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <input
                required
                type="text"
                placeholder="New temporary password"
                value={newTempPassword}
                onChange={(e) => setNewTempPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-mono"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordResetEmployee(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
