import React, { useState } from 'react';

// Weekly Attendance Bar Chart (Custom Clean SVG with Tooltip)
export interface BarDataPoint {
  label: string;
  present: number;
  late: number;
  absent: number;
}

export const WeeklyAttendanceBarChart: React.FC<{ data: BarDataPoint[] }> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.present + d.late + d.absent), 10);
  const chartHeight = 180;

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span className="font-semibold text-slate-700">Daily Attendance Breakdown</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]"></span>
            <span>On-Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]"></span>
            <span>Late</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]"></span>
            <span>Absent</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-end justify-between gap-3 h-[180px] pt-6 pb-2 border-b border-slate-200">
        {data.map((item, idx) => {
          const presentH = (item.present / maxValue) * (chartHeight - 30);
          const lateH = (item.late / maxValue) * (chartHeight - 30);
          const absentH = (item.absent / maxValue) * (chartHeight - 30);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {isHovered && (
                <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-md shadow-lg pointer-events-none whitespace-nowrap animate-fade-in">
                  <div className="font-bold text-white">{item.label}</div>
                  <div className="text-emerald-400">On-Time: {item.present}</div>
                  <div className="text-amber-400">Late: {item.late}</div>
                  <div className="text-rose-400">Absent: {item.absent}</div>
                </div>
              )}

              <div className="w-full max-w-[28px] flex flex-col items-stretch rounded-t-sm overflow-hidden transition-all duration-200 group-hover:scale-105">
                {absentH > 0 && (
                  <div
                    style={{ height: `${absentH}px` }}
                    className="w-full bg-[#EF4444] opacity-90 hover:opacity-100 transition-opacity"
                  />
                )}
                {lateH > 0 && (
                  <div
                    style={{ height: `${lateH}px` }}
                    className="w-full bg-[#F59E0B] opacity-90 hover:opacity-100 transition-opacity"
                  />
                )}
                <div
                  style={{ height: `${Math.max(presentH, 4)}px` }}
                  className="w-full bg-[#10B981] opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>

              <span className="text-[11px] text-slate-500 font-medium mt-2 tabular-nums">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Donut Chart for Attendance Status
export const AttendanceDonutChart: React.FC<{
  present: number;
  late: number;
  absent: number;
  onLeave: number;
}> = ({ present, late, absent, onLeave }) => {
  const total = present + late + absent + onLeave || 1;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const pPct = present / total;
  const lPct = late / total;
  const aPct = absent / total;
  const oPct = onLeave / total;

  const pOffset = circumference * (1 - pPct);
  const lOffset = circumference * (1 - lPct);
  const aOffset = circumference * (1 - aPct);
  const oOffset = circumference * (1 - oPct);

  // Rotation angles
  const pRotate = 0;
  const lRotate = pPct * 360;
  const aRotate = (pPct + lPct) * 360;
  const oRotate = (pPct + lPct + aPct) * 360;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-4 p-2">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth="12"
          />
          {present > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#10B981"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={pOffset}
              transform={`rotate(${pRotate} 50 50)`}
              className="transition-all duration-500"
            />
          )}
          {late > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#F59E0B"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={lOffset}
              transform={`rotate(${lRotate} 50 50)`}
              className="transition-all duration-500"
            />
          )}
          {onLeave > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#4F46E5"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={oOffset}
              transform={`rotate(${oRotate} 50 50)`}
              className="transition-all duration-500"
            />
          )}
          {absent > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#EF4444"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={aOffset}
              transform={`rotate(${aRotate} 50 50)`}
              className="transition-all duration-500"
            />
          )}
        </svg>
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 tabular-nums">
            {Math.round(((present + late) / total) * 100)}%
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400">Turnout</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-slate-600 font-medium">On-Time</span>
          </div>
          <span className="font-bold text-slate-900 tabular-nums">{present} ({Math.round(pPct * 100)}%)</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="text-slate-600 font-medium">Late</span>
          </div>
          <span className="font-bold text-slate-900 tabular-nums">{late} ({Math.round(lPct * 100)}%)</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
            <span className="text-slate-600 font-medium">On Leave</span>
          </div>
          <span className="font-bold text-slate-900 tabular-nums">{onLeave} ({Math.round(oPct * 100)}%)</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="text-slate-600 font-medium">Absent</span>
          </div>
          <span className="font-bold text-slate-900 tabular-nums">{absent} ({Math.round(aPct * 100)}%)</span>
        </div>
      </div>
    </div>
  );
};

// Department Horizontal Bar Distribution Chart
export const DepartmentDistributionChart: React.FC<{
  data: Array<{ name: string; count: number; totalHours?: number }>;
}> = ({ data }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((item, idx) => {
        const pct = Math.round((item.count / maxCount) * 100);
        return (
          <div key={idx} className="group">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-700">{item.name}</span>
              <span className="text-slate-500 tabular-nums font-semibold">
                {item.count} staff {item.totalHours ? `· ${item.totalHours}h avg` : ''}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500 group-hover:bg-indigo-500"
                style={{ width: `${Math.max(pct, 6)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
