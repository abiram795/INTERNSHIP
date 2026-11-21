import React from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Trash2, 
  CheckSquare 
} from 'lucide-react';

export const TaskRow = ({ task, onEdit, onDelete, onUpdateStatus, onToggleComplete }) => {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'In Review':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'To Do':
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  return (
    <div
      className={`group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-150 ${
        isCompleted
          ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-sm'
      }`}
    >
      {/* Left: Checkbox + Title + Description */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <button
          onClick={() => onToggleComplete(task.id)}
          className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:text-slate-500 transition-colors shrink-0"
          title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950/60" />
          ) : (
            <Circle className="w-5 h-5 hover:text-indigo-600" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              onClick={() => onEdit(task)}
              className={`text-sm font-bold cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {task.title}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
              {task.category}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {task.description}
            </p>
          )}

          {/* Subtasks pill if present */}
          {subtasks.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 dark:text-slate-500">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {completedSubtasks} of {subtasks.length} subtasks completed
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Meta columns & actions */}
      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
        {/* Status Dropdown */}
        <select
          value={task.status}
          onChange={(e) => onUpdateStatus(task.id, e.target.value)}
          className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer ${getStatusBadge(
            task.status
          )}`}
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="In Review">In Review</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Priority Badge */}
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getPriorityBadge(
            task.priority
          )}`}
        >
          {task.priority}
        </span>

        {/* Due Date */}
        <div
          className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg ${
            isOverdue
              ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300'
              : isDueToday
              ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{task.dueDate}</span>
        </div>

        {/* Edit / Delete Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
