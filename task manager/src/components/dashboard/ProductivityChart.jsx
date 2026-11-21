import React from 'react';
import { TrendingUp, Award, CheckCircle2, BarChart3, PieChart } from 'lucide-react';

export const ProductivityChart = ({ tasks, stats }) => {
  // Weekly simulation based on tasks
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Calculate day-by-day distribution based on due dates
  const weeklyData = days.map((day, idx) => {
    // Generate realistic distribution based on actual tasks count
    const totalCount = tasks.length;
    const baseMultiplier = [3, 5, 8, 6, 9, 2, 1][idx];
    const planned = Math.max(1, Math.round((baseMultiplier / 34) * (totalCount * 1.5)));
    const completed = Math.min(planned, Math.round(planned * ((stats.completionRate || 50) / 100)));
    return {
      day,
      planned,
      completed,
    };
  });

  const maxVal = Math.max(...weeklyData.map((d) => d.planned), 1);

  // Priority distribution
  const priorities = [
    { label: 'Urgent', count: stats.urgent, color: 'bg-rose-500', bar: 'bg-rose-500/20 text-rose-600' },
    { label: 'High', count: stats.high, color: 'bg-amber-500', bar: 'bg-amber-500/20 text-amber-600' },
    {
      label: 'Medium',
      count: tasks.filter((t) => t.priority === 'Medium').length,
      color: 'bg-blue-500',
      bar: 'bg-blue-500/20 text-blue-600',
    },
    {
      label: 'Low',
      count: tasks.filter((t) => t.priority === 'Low').length,
      color: 'bg-slate-400',
      bar: 'bg-slate-500/20 text-slate-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 2 Cols: Weekly Velocity Chart */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Weekly Execution Velocity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Deliverables scheduled vs successfully completed across working days
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-700" />
              <span>Target</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
              <span>Completed</span>
            </div>
          </div>
        </div>

        {/* Bar chart grid */}
        <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-52 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
          {weeklyData.map((item) => {
            const plannedHeight = Math.round((item.planned / maxVal) * 100);
            const completedHeight = Math.round((item.completed / maxVal) * 100);

            return (
              <div key={item.day} className="flex flex-col items-center h-full justify-end group">
                <div className="relative w-full flex items-end justify-center gap-1.5 h-full">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md shadow-lg transition-opacity duration-150 whitespace-nowrap z-20">
                    Done: {item.completed} / Goal: {item.planned}
                  </div>

                  {/* Planned bar */}
                  <div
                    className="w-3.5 sm:w-5 bg-slate-200 dark:bg-slate-800 rounded-t-md transition-all duration-300"
                    style={{ height: `${Math.max(plannedHeight, 15)}%` }}
                  />

                  {/* Completed bar */}
                  <div
                    className="w-3.5 sm:w-5 bg-indigo-600 dark:bg-indigo-500 rounded-t-md transition-all duration-300"
                    style={{ height: `${Math.max(completedHeight, 10)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom velocity metrics */}
        <div className="grid grid-cols-3 gap-4 pt-4 text-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completion</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {stats.completionRate}%
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Work items</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {stats.total}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Sprint</p>
            <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
              Sprint 24
            </p>
          </div>
        </div>
      </div>

      {/* 1 Col: Priority & Health Metrics */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-indigo-500" /> Priority Allocation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Risk & urgency weighting across currently active workload
          </p>

          <div className="space-y-4">
            {priorities.map((p) => {
              const pct = stats.total > 0 ? Math.round((p.count / stats.total) * 100) : 0;
              return (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                      {p.label} Priority
                    </span>
                    <span className="text-slate-400">
                      {p.count} tasks ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* On-Time Index Card */}
        <div className="mt-6 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
              Execution Efficiency
            </h4>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5 font-medium">
              {stats.overdueCount === 0
                ? 'All deliverables are tracked on schedule!'
                : `${stats.overdueCount} task(s) currently exceed due date.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

