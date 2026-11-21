import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag
} from 'lucide-react';

export const CalendarPage = ({ openCreateTaskModal, openEditTaskModal }) => {
  const { tasks, toggleTaskComplete } = useTasks();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState('All');

  // Month & Year navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Calendar Grid computation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, dayNum);
    calendarDays.push({
      dateStr: dateObj.toISOString().split('T')[0],
      dayNumber: dayNum,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
    // Format YYYY-MM-DD
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    calendarDays.push({
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete 35 or 42 grid cells
  const remainingCells = (calendarDays.length > 35 ? 42 : 35) - calendarDays.length;
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const dateObj = new Date(year, month + 1, dayNum);
    calendarDays.push({
      dateStr: dateObj.toISOString().split('T')[0],
      dayNumber: dayNum,
      isCurrentMonth: false,
    });
  }

  // Filter tasks
  const filteredTasks = statusFilter === 'All'
    ? tasks
    : tasks.filter((t) => t.status === statusFilter);

  // Group tasks by dueDate
  const tasksByDate = {};
  filteredTasks.forEach((t) => {
    if (!tasksByDate[t.dueDate]) {
      tasksByDate[t.dueDate] = [];
    }
    tasksByDate[t.dueDate].push(t);
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Tasks for the selected date
  const selectedDateTasks = tasksByDate[selectedDateStr] || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500 text-white';
      case 'In Review':
        return 'bg-purple-500 text-white';
      case 'In Progress':
        return 'bg-blue-500 text-white';
      case 'To Do':
      default:
        return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Delivery Schedule & Calendar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Map deliverables across monthly timelines and prevent milestone bottlenecks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            onClick={() => openCreateTaskModal('To Do')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar (2 cols) & Day Agenda (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid Container */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col">
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {monthNames[month]} {year}
              </h3>
              <button
                onClick={handleGoToToday}
                className="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span
                key={d}
                className="text-[11px] font-bold uppercase tracking-wider text-slate-400 py-1"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 flex-1">
            {calendarDays.map((cell) => {
              const dayTasks = tasksByDate[cell.dateStr] || [];
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDateStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[70px] sm:min-h-[85px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                      : isToday
                      ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/10'
                      : cell.isCurrentMonth
                      ? 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 hover:border-slate-300 dark:hover:border-slate-700'
                      : 'border-transparent text-slate-300 dark:text-slate-700 opacity-40 hover:opacity-70'
                  }`}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-amber-500 text-white'
                          : isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Pills preview */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditTaskModal(t);
                        }}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate ${getStatusBadge(
                          t.status
                        )}`}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] font-bold text-slate-400 pl-1">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Sidebar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Agenda for
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {selectedDateStr === todayStr
                    ? `Today (${selectedDateStr})`
                    : selectedDateStr}
                </h3>
              </div>

              <button
                onClick={() => openCreateTaskModal('To Do')}
                className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                title="Add task on this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List of deliverables on this date */}
            <div className="mt-4 space-y-3">
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    No deliverables due on this date.
                  </p>
                  <button
                    onClick={() => openCreateTaskModal('To Do')}
                    className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Schedule deliverable here
                  </button>
                </div>
              ) : (
                selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className="text-slate-400 hover:text-emerald-500"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              task.status === 'Completed'
                                ? 'text-emerald-500'
                                : ''
                            }`}
                          />
                        </button>
                        <h4
                          onClick={() => openEditTaskModal(task)}
                          className={`text-xs font-bold cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 ${
                            task.status === 'Completed'
                              ? 'line-through text-slate-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {task.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                      <span className="font-semibold">{task.category}</span>
                      <span
                        className={`font-bold uppercase ${
                          task.priority === 'Urgent'
                            ? 'text-rose-500'
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 text-center">
            Click any task to inspect details or edit
          </div>
        </div>
      </div>
    </div>
  );
};

