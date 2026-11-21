import React from 'react';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

export const KanbanBoard = ({
  tasks,
  onEdit,
  onDelete,
  onUpdateStatus,
  onToggleComplete,
  onAddNewInStatus,
}) => {
  const columns = [
    {
      id: 'To Do',
      title: 'To Do',
      accent: 'bg-slate-500',
      headerBg: 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300',
      badgeBg: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      accent: 'bg-blue-500',
      headerBg: 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
      badgeBg: 'bg-blue-200/70 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    },
    {
      id: 'In Review',
      title: 'In Review',
      accent: 'bg-purple-500',
      headerBg: 'bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
      badgeBg: 'bg-purple-200/70 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    },
    {
      id: 'Completed',
      title: 'Completed',
      accent: 'bg-emerald-500',
      headerBg: 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
      badgeBg: 'bg-emerald-200/70 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 p-3.5 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3.5 px-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.accent}`} />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                  {col.title}
                </h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}
                >
                  {colTasks.length}
                </span>
              </div>

              <button
                onClick={() => onAddNewInStatus(col.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                title={`Add task in ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Card List */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    No deliverables in {col.title.toLowerCase()}
                  </p>
                  <button
                    onClick={() => onAddNewInStatus(col.id)}
                    className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Create one now
                  </button>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onUpdateStatus={onUpdateStatus}
                    onToggleComplete={onToggleComplete}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
