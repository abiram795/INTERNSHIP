import React from 'react';
import { Layers, CheckCircle2, Circle, Edit3, ChevronRight, Plus } from 'lucide-react';

export const RecentTasks = ({
  tasks,
  onEditTask,
  onToggleComplete,
  onNavigateTasks,
  onAddNewTask,
}) => {
  const recentList = [...tasks].slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'In Review':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'To Do':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Work Deliverables
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest updates across your active workspace
              </p>
            </div>
          </div>

          <button
            onClick={onAddNewTask}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {recentList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No tasks created yet.
            </p>
            <button
              onClick={onAddNewTask}
              className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
            >
              Create your first task now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentList.map((task) => {
              const isCompleted = task.status === 'Completed';

              return (
                <div
                  key={task.id}
                  className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleComplete(task.id)}
                      className="text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                      title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                      ) : (
                        <Circle className="w-4.5 h-4.5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        onClick={() => onEditTask(task)}
                        className={`text-xs font-bold truncate cursor-pointer transition-colors ${
                          isCompleted
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {task.category}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[10px] text-slate-400">
                          Due {task.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getStatusBadge(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>

                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded-md transition-colors opacity-70 group-hover:opacity-100"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>Displaying recent activity</span>
        <button
          onClick={onNavigateTasks}
          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
        >
          View Kanban & List <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
