import React from "react";

interface Props {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function AnalyticsCard({ title, value, description, icon, trend }: Props) {
  return (
    <div className="relative overflow-hidden bg-white/70 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-500/35 dark:hover:border-indigo-500/30 group">
      {/* Decorative background glow */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-all duration-300" />
      
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight transition-all duration-300">
            {value}
          </div>
        </div>
        
        {icon && (
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {trend && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
          {description && (
            <span className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-1">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
