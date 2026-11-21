import React from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  CheckSquare
} from 'lucide-react';

export const TaskCard = ({ task, onEdit, onDelete, onUpdateStatus, onToggleComplete }) => {
  const isCompleted = task.status === 'Completed';

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !isCompleted && task.dueDate < todayStr;
  const isDueToday = !isCompleted && task.dueDate === todayStr;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400 border-rose-200 dark:border-rose-900';
      case 'High':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 border-amber-200 dark:border-amber-900';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 border-blue-200 dark:border-blue-900';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getCategoryBadge = () => {
    return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/40';
  };

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  const statuses = ['To Do', 'In Progress', 'In Review', 'Completed'];
  const currentIndex = statuses.indexOf(task.status);

  return (
    <div
      className={`group relative bg-white dark:bg-slate-900/90 rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3 ${
        isCompleted
          ? 'border-emerald-200/60 dark:border-emerald-950/40 bg-emerald-50/20 dark:bg-emerald-950/10'
          : isOverdue
          ? 'border-rose-200 dark:border-rose-900/50'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/60'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadge()}`}
          >
            {task.category}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPriorityBadge(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`p-1 rounded-lg transition-colors ${
              isCompleted
                ? 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h4
          onClick={() => onEdit(task)}
          className={`text-sm font-bold text-slate-900 dark:text-white leading-snug cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
            isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
          }`}
        >
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Subtasks Progress */}
      {subtasks.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-500" /> Checklist
            </span>
            <span>
              {completedSubtasks}/{subtasks.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{
                width: `${(completedSubtasks / subtasks.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer Info: Due Date & Move Status */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2 mt-auto">
        <div
          className={`flex items-center gap-1 text-[11px] font-semibold ${
            isOverdue
              ? 'text-rose-600 dark:text-rose-400'
              : isDueToday
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>
            {isOverdue ? 'Overdue: ' : isDueToday ? 'Today: ' : ''}
            {task.dueDate}
          </span>
        </div>

        {/* Quick status stepper */}
        <div className="flex items-center gap-1">
          {currentIndex > 0 && (
            <button
              onClick={() => onUpdateStatus(task.id, statuses[currentIndex - 1])}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] flex items-center gap-0.5"
              title={`Move back to ${statuses[currentIndex - 1]}`}
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}
          {currentIndex < statuses.length - 1 && (
            <button
              onClick={() => onUpdateStatus(task.id, statuses[currentIndex + 1])}
              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[10px] flex items-center gap-0.5"
              title={`Advance to ${statuses[currentIndex + 1]}`}
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
