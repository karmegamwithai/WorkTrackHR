import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    neutral?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-indigo-50',
  iconColor = 'text-indigo-600',
  trend,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
            {title}
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {value}
          </div>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold tabular-nums ${
                trend.neutral
                  ? 'text-slate-500'
                  : trend.isPositive
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
