import React, { useState } from 'react';
import { Building2, Briefcase, Plus, Trash2, Edit2, Users, AlertCircle } from 'lucide-react';
import { Department, Employee, Position } from '../../types';

interface DepartmentsPositionsTabProps {
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  positions: Position[];
  setPositions: React.Dispatch<React.SetStateAction<Position[]>>;
  employees: Employee[];
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DepartmentsPositionsTab: React.FC<DepartmentsPositionsTabProps> = ({
  departments,
  setDepartments,
  positions,
  setPositions,
  employees,
  notify,
}) => {
  // Department Form
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Position Form
  const [posTitle, setPosTitle] = useState('');
  const [posDeptId, setPosDeptId] = useState(departments[0]?.id || '');
  const [posDesc, setPosDesc] = useState('');

  // Editing state
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingPos, setEditingPos] = useState<Position | null>(null);

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    if (departments.some((d) => d.name.toLowerCase() === deptName.trim().toLowerCase())) {
      notify('Department with this name already exists.', 'error');
      return;
    }

    const newDept: Department = {
      id: `dept-${Date.now()}`,
      companyId: 'comp-1',
      name: deptName.trim(),
      description: deptDesc.trim(),
    };

    setDepartments((prev) => [...prev, newDept]);
    setDeptName('');
    setDeptDesc('');
    notify(`Department '${newDept.name}' created.`);
  };

  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posTitle.trim() || !posDeptId) return;

    const newPos: Position = {
      id: `pos-${Date.now()}`,
      companyId: 'comp-1',
      departmentId: posDeptId,
      title: posTitle.trim(),
      description: posDesc.trim(),
    };

    setPositions((prev) => [...prev, newPos]);
    setPosTitle('');
    setPosDesc('');
    notify(`Position '${newPos.title}' established.`);
  };

  const handleDeleteDepartment = (deptId: string) => {
    const assignedCount = employees.filter((e) => e.departmentId === deptId).length;
    if (assignedCount > 0) {
      notify(
        `Cannot delete department: ${assignedCount} active employee(s) assigned to it. Reassign them first.`,
        'error'
      );
      return;
    }

    setDepartments((prev) => prev.filter((d) => d.id !== deptId));
    setPositions((prev) => prev.filter((p) => p.departmentId !== deptId));
    notify('Department and associated empty roles removed.');
  };

  const handleDeletePosition = (posId: string) => {
    const assignedCount = employees.filter((e) => e.positionId === posId).length;
    if (assignedCount > 0) {
      notify(
        `Cannot delete position: ${assignedCount} active employee(s) hold this title.`,
        'error'
      );
      return;
    }

    setPositions((prev) => prev.filter((p) => p.id !== posId));
    notify('Position deleted successfully.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Departments & Job Positions</h2>
        <p className="text-xs text-slate-500">
          Structure company business units, create custom positions, and manage departmental assignments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DEPARTMENTS COLUMN */}
        <div className="space-y-5">
          {/* Add Dept Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Create New Department</h3>
            </div>
            <form onSubmit={handleAddDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">
                  Department Name *
                </label>
                <input
                  required
                  placeholder="e.g. Quality Assurance & Compliance"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">
                  Description
                </label>
                <input
                  placeholder="Core responsibilities and scope..."
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-xs"
              >
                Save Department
              </button>
            </form>
          </div>

          {/* Dept List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Active Departments ({departments.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {departments.map((dept) => {
                const staffCount = employees.filter((e) => e.departmentId === dept.id).length;
                const rolesCount = positions.filter((p) => p.departmentId === dept.id).length;

                return (
                  <div key={dept.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{dept.description || 'No description provided'}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <strong className="text-slate-800">{staffCount}</strong> assigned staff
                        </span>
                        <span>·</span>
                        <span>
                          <strong className="text-slate-800">{rolesCount}</strong> roles defined
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id)}
                      title="Delete Department"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* POSITIONS COLUMN */}
        <div className="space-y-5">
          {/* Add Position Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Define Job Position</h3>
            </div>
            <form onSubmit={handleAddPosition} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">
                    Position Title *
                  </label>
                  <input
                    required
                    placeholder="e.g. Shift Lead Engineer"
                    value={posTitle}
                    onChange={(e) => setPosTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">
                    Department *
                  </label>
                  <select
                    value={posDeptId}
                    onChange={(e) => setPosDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">
                  Role Description
                </label>
                <input
                  placeholder="Key duties and requirements..."
                  value={posDesc}
                  onChange={(e) => setPosDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs"
              >
                Establish Position
              </button>
            </form>
          </div>

          {/* Positions List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Established Job Positions ({positions.length})
            </h3>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {positions.map((pos) => {
                const dept = departments.find((d) => d.id === pos.departmentId);
                const staffInRole = employees.filter((e) => e.positionId === pos.id);

                return (
                  <div key={pos.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{pos.title}</h4>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {dept?.name || 'Unassigned'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{pos.description || 'Standard role duties'}</p>
                      <div className="mt-1 text-[11px] text-slate-600 font-medium">
                        Occupied by: <strong className="text-slate-800">{staffInRole.length}</strong> employee(s)
                        {staffInRole.length > 0 && (
                          <span className="text-slate-600 ml-1">
                            ({staffInRole.map((e) => e.fullName).slice(0, 2).join(', ')}
                            {staffInRole.length > 2 ? '...' : ''})
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePosition(pos.id)}
                      title="Delete Position"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
