import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  trend,
  trendPositive = true,
  icon: Icon,
  accentColor = 'indigo',
  subtitle,
}) => {
  const getAccentStyles = (color) => {
    switch (color) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
          border: 'border-slate-200/80 dark:border-slate-800',
          ring: 'hover:border-emerald-300 dark:hover:border-emerald-800',
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
          border: 'border-slate-200/80 dark:border-slate-800',
          ring: 'hover:border-blue-300 dark:hover:border-blue-800',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
          border: 'border-slate-200/80 dark:border-slate-800',
          ring: 'hover:border-amber-300 dark:hover:border-amber-800',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
          border: 'border-slate-200/80 dark:border-slate-800',
          ring: 'hover:border-rose-300 dark:hover:border-rose-800',
        };
      case 'indigo':
      default:
        return {
          iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
          border: 'border-slate-200/80 dark:border-slate-800',
          ring: 'hover:border-indigo-300 dark:hover:border-indigo-800',
        };
    }
  };

  const style = getAccentStyles(accentColor);

  return (
    <div
      className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${style.border} ${style.ring} shadow-sm transition-all duration-200 flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {value}
          </h3>
        </div>

        <div className={`p-3 rounded-xl ${style.iconBg} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        {trend && (
          <span
            className={`flex items-center font-bold ${
              trendPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trendPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trend}
          </span>
        )}
        <span className="text-slate-400 dark:text-slate-500 font-medium ml-auto">
          {subtitle || 'Live sync'}
        </span>
      </div>
    </div>
  );
};

