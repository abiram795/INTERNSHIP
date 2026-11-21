import React from 'react';
import { Clock, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';

export const UpcomingDeadlines = ({ deadlines, onEditTask, onToggleComplete, onNavigateTasks }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Upcoming Deadlines
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Critical deliverables requiring attention
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateTasks}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {deadlines.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No Pending Deadlines!
            </p>
            <p className="text-xs text-slate-400 mt-1">
              You are completely caught up with scheduled tasks.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {deadlines.map((task) => {
              const isOverdue = task.dueDate < todayStr;
              const isToday = task.dueDate === todayStr;

              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                    isOverdue
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40'
                      : isToday
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40'
                      : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleComplete(task.id)}
                      className="text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                      title="Mark complete"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        onClick={() => onEditTask(task)}
                        className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {task.category}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span
                          className={`text-[10px] font-extrabold uppercase ${
                            task.priority === 'Urgent'
                              ? 'text-rose-600 dark:text-rose-400'
                              : task.priority === 'High'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-indigo-600 dark:text-indigo-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                        isOverdue
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                          : isToday
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isOverdue ? 'Overdue' : isToday ? 'Due Today' : task.dueDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>Showing prioritized items</span>
        <button
          onClick={onNavigateTasks}
          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
        >
          Manage all <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
