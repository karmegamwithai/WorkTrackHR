import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Users,
  Plus,
  Moon,
  Sun,
  AlertCircle,
  CheckCircle,
  CalendarRange,
  Coffee,
  CheckSquare,
} from 'lucide-react';
import { Department, Employee, Position, Shift } from '../../types';
import { isOvernightShift, getShiftScheduledMinutes, formatMinutes } from '../../utils/calculations';

interface ShiftsTabProps {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  departments: Department[];
  positions: Position[];
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShiftsTab: React.FC<ShiftsTabProps> = ({
  shifts,
  setShifts,
  employees,
  setEmployees,
  departments,
  positions,
  notify,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'CALENDAR' | 'SHIFTS_LIST' | 'ASSIGN'>('CALENDAR');

  // New Shift Form State
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakMinutes, setBreakMinutes] = useState(60);
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(15);
  const [shiftType, setShiftType] = useState<'STANDARD' | 'ROTATIONAL' | 'NIGHT'>('STANDARD');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);

  // Bulk Shift Assignment State
  const [selectedShiftForAssign, setSelectedShiftForAssign] = useState(shifts[0]?.id || '');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  const daysOfWeek = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftName.trim()) return;

    const overnight = isOvernightShift(startTime, endTime);

    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      companyId: 'comp-1',
      name: shiftName.trim(),
      startTime,
      endTime,
      breakMinutes: Number(breakMinutes) || 0,
      gracePeriodMinutes: Number(gracePeriodMinutes) || 0,
      workingDays,
      shiftType: overnight ? 'NIGHT' : shiftType,
      isActive: true,
    };

    setShifts((prev) => [...prev, newShift]);
    setShiftName('');
    notify(
      `Shift '${newShift.name}' created${overnight ? ' (Overnight shift detected across midnight).' : '.'}`
    );
  };

  const handleBulkAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployeeIds.length === 0 || !selectedShiftForAssign) {
      notify('Select at least one employee and a shift.', 'error');
      return;
    }

    const shiftObj = shifts.find((s) => s.id === selectedShiftForAssign);

    setEmployees((prev) =>
      prev.map((emp) =>
        selectedEmployeeIds.includes(emp.id)
          ? { ...emp, assignedShiftId: selectedShiftForAssign }
          : emp
      )
    );

    notify(`Assigned '${shiftObj?.name}' to ${selectedEmployeeIds.length} employee(s).`);
    setSelectedEmployeeIds([]);
  };

  const toggleDay = (dayVal: number) => {
    setWorkingDays((prev) =>
      prev.includes(dayVal) ? prev.filter((d) => d !== dayVal) : [...prev, dayVal]
    );
  };

  const toggleSelectEmployee = (empId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const selectAllEmployees = () => {
    if (selectedEmployeeIds.length === employees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(employees.map((e) => e.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Shift Management & Rosters</h2>
          <p className="text-xs text-slate-500">
            Configure shift windows, overnight coverage, rotational rosters, and employee assignments
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('CALENDAR')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'CALENDAR'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Roster View
          </button>
          <button
            onClick={() => setActiveSubTab('SHIFTS_LIST')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'SHIFTS_LIST'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Shift Profiles
          </button>
          <button
            onClick={() => setActiveSubTab('ASSIGN')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'ASSIGN'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulk Assignment
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: CALENDAR VIEW */}
      {activeSubTab === 'CALENDAR' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Weekly Shift Roster</h3>
                <p className="text-xs text-slate-500">Scheduled shifts for active staff across Monday - Sunday</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-100 border border-indigo-300"></span> Standard
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300"></span> Rotational
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-purple-100 border border-purple-300"></span> Overnight
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <th className="py-2.5 px-3 w-48">Employee & Role</th>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                      <th key={day} className="py-2.5 px-2 text-center">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => {
                    const shift = shifts.find((s) => s.id === emp.assignedShiftId);
                    const pos = positions.find((p) => p.id === emp.positionId);
                    const overnight = shift ? isOvernightShift(shift.startTime, shift.endTime) : false;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{emp.fullName}</div>
                          <div className="text-[10px] text-slate-500">{pos?.title} · {emp.workLocation}</div>
                        </td>
                        {[1, 2, 3, 4, 5, 6, 0].map((dayVal, i) => {
                          const isWorkingDay = shift?.workingDays.includes(dayVal);
                          return (
                            <td key={i} className="py-3 px-1 text-center">
                              {isWorkingDay && shift ? (
                                <div
                                  className={`p-1.5 rounded-lg border text-[10px] font-bold leading-tight ${
                                    overnight
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : shift.shiftType === 'ROTATIONAL'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  }`}
                                >
                                  <div>{shift.startTime}</div>
                                  <div className="text-[9px] opacity-80">to {shift.endTime}</div>
                                  {overnight && <div className="text-[8px] uppercase tracking-tighter mt-0.5">Overnight</div>}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-300 font-semibold uppercase">Off</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: SHIFT PROFILES & CREATION */}
      {activeSubTab === 'SHIFTS_LIST' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Shift Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-1">
            <h3 className="text-base font-bold text-slate-900 mb-1">Define New Shift</h3>
            <p className="text-xs text-slate-500 mb-4">Set operating hours, unpaid breaks, and grace window</p>

            <form onSubmit={handleCreateShift} className="space-y-3.5 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">Shift Name *</label>
                <input
                  required
                  placeholder="e.g. Dawn Logistics Shift"
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              {isOvernightShift(startTime, endTime) && (
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-[11px] flex items-center gap-2">
                  <Moon className="w-4 h-4 shrink-0 text-purple-600" />
                  <span>
                    <strong>Overnight Shift:</strong> Crosses midnight into next morning. Overtime will be calculated accurately.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Break Duration (Mins)</label>
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Grace Period (Mins)</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={gracePeriodMinutes}
                    onChange={(e) => setGracePeriodMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1.5">Working Days</label>
                <div className="flex items-center justify-between gap-1">
                  {daysOfWeek.map((day) => {
                    const isSelected = workingDays.includes(day.value);
                    return (
                      <button
                        type="button"
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">Shift Category</label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  <option value="STANDARD">Standard Fixed</option>
                  <option value="ROTATIONAL">Rotational</option>
                  <option value="NIGHT">Night / Graveyard</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-xs mt-2"
              >
                Create Shift Profile
              </button>
            </form>
          </div>

          {/* Existing Shifts List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Configured Shifts ({shifts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shifts.map((s) => {
                const overnight = isOvernightShift(s.startTime, s.endTime);
                const { gross, net } = getShiftScheduledMinutes(s);
                const assignedEmployees = employees.filter((e) => e.assignedShiftId === s.id);

                return (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            overnight
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {overnight ? 'Overnight' : s.shiftType}
                        </span>
                      </div>

                      <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight my-2">
                        {s.startTime} — {s.endTime}
                      </div>

                      <div className="space-y-1 text-xs text-slate-500">
                        <div className="flex justify-between">
                          <span>Scheduled Net Hours:</span>
                          <strong className="text-slate-800 font-mono">{formatMinutes(net)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Unpaid Break:</span>
                          <strong className="text-slate-800">{s.breakMinutes} mins</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Grace Period:</span>
                          <strong className="text-slate-800">{s.gracePeriodMinutes} mins</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">
                        {assignedEmployees.length} employee(s) assigned
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Days: {s.workingDays.length}/7
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: BULK ASSIGNMENT */}
      {activeSubTab === 'ASSIGN' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Assign Shift to Personnel</h3>
              <p className="text-xs text-slate-500">
                Select one or multiple employees to assign to a target shift schedule
              </p>
            </div>
            <button
              onClick={selectAllEmployees}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              {selectedEmployeeIds.length === employees.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <form onSubmit={handleBulkAssign} className="space-y-6">
            {/* Shift Picker */}
            <div>
              <label className="block text-xs uppercase font-bold text-slate-600 mb-2">
                Target Shift Schedule *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {shifts.map((s) => {
                  const isSelected = selectedShiftForAssign === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedShiftForAssign(s.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs font-semibold'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="font-mono text-slate-600 mt-1">
                        {s.startTime} - {s.endTime}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-1">
                        Break: {s.breakMinutes}m · Grace: {s.gracePeriodMinutes}m
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Employee Checklist */}
            <div>
              <label className="block text-xs uppercase font-bold text-slate-600 mb-2">
                Select Employees ({selectedEmployeeIds.length} of {employees.length} selected)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
                {employees.map((emp) => {
                  const isChecked = selectedEmployeeIds.includes(emp.id);
                  const currentShift = shifts.find((s) => s.id === emp.assignedShiftId);

                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleSelectEmployee(emp.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs cursor-pointer transition ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/60'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">{emp.fullName}</div>
                        <div className="text-[10px] text-slate-600 truncate">
                          Currently: {currentShift?.name || 'Unassigned'}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={selectedEmployeeIds.length === 0}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-xs"
              >
                Apply Shift Assignment ({selectedEmployeeIds.length})
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
