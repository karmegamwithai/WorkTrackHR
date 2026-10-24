import React from 'react';
import { Clock, Calendar, Coffee, AlertCircle, ShieldCheck, Moon } from 'lucide-react';
import { Employee, Shift } from '../../types';
import { isOvernightShift, getShiftScheduledMinutes, formatMinutes } from '../../utils/calculations';

interface MyShiftsTabProps {
  employee: Employee;
  shift: Shift | undefined;
}

export const MyShiftsTab: React.FC<MyShiftsTabProps> = ({ employee, shift }) => {
  const isOvernight = shift ? isOvernightShift(shift.startTime, shift.endTime) : false;
  const { gross, net } = shift ? getShiftScheduledMinutes(shift) : { gross: 480, net: 480 };

  const daysOfWeek = [
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
    { label: 'Sunday', value: 0 },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Shift Schedule</h2>
        <p className="text-xs text-slate-500">
          Weekly duty roster, shift timings, break policies, and overtime eligibility
        </p>
      </div>

      {/* Main Shift Overview Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] uppercase font-bold text-indigo-600 tracking-wider">
              Primary Assigned Duty
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {shift?.name || 'Standard General Day Shift'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned location: <strong className="text-slate-700">{employee.workLocation}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 text-center shrink-0">
            <span className="text-[10px] uppercase font-bold text-indigo-700">Scheduled Hours</span>
            <div className="text-2xl font-black text-indigo-900 font-mono tracking-tight tabular-nums mt-0.5">
              {shift?.startTime} — {shift?.endTime}
            </div>
            {isOvernight && (
              <span className="text-[10px] uppercase font-bold text-purple-700 block mt-0.5">
                Overnight Shift
              </span>
            )}
          </div>
        </div>

        {/* Shift Details Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 uppercase font-semibold">Net Working Duration</span>
            <p className="text-base font-bold text-slate-800 mt-1 font-mono">{formatMinutes(net)}</p>
            <span className="text-[10px] text-slate-400">Daily contractual minimum</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 uppercase font-semibold">Unpaid Lunch Break</span>
            <p className="text-base font-bold text-slate-800 mt-1">{shift?.breakMinutes || 60} mins</p>
            <span className="text-[10px] text-slate-400">Automatically deducted</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 uppercase font-semibold">Punctuality Grace</span>
            <p className="text-base font-bold text-slate-800 mt-1">{shift?.gracePeriodMinutes || 15} mins</p>
            <span className="text-[10px] text-slate-400">Tolerance before lateness</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 uppercase font-semibold">Overtime Policy</span>
            <p className="text-base font-bold text-emerald-600 mt-1">Eligible</p>
            <span className="text-[10px] text-slate-400">Beyond {formatMinutes(net)} net</span>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Days */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">Weekly Roster Calendar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {daysOfWeek.map((day) => {
            const isWorking = shift?.workingDays.includes(day.value);
            return (
              <div
                key={day.value}
                className={`p-3 rounded-2xl border text-center transition ${
                  isWorking
                    ? 'border-indigo-200 bg-indigo-50/40 text-indigo-900'
                    : 'border-slate-100 bg-slate-50/60 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold uppercase">{day.label.slice(0, 3)}</div>
                <div className="text-[10px] font-medium text-slate-500 mb-2">{day.label}</div>
                {isWorking ? (
                  <div className="text-xs font-bold font-mono text-indigo-700 leading-tight">
                    <div>{shift?.startTime}</div>
                    <div className="text-[9px] text-indigo-500">to {shift?.endTime}</div>
                  </div>
                ) : (
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 py-1">
                    Off Duty
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
