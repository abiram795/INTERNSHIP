import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { TaskRow } from '../components/tasks/TaskRow';
import { Plus, CheckSquare, SearchX, RotateCcw } from 'lucide-react';

export const MyTasksPage = ({
  openCreateTaskModal,
  openEditTaskModal,
  promptDeleteTask,
}) => {
  const {
    tasks,
    categories,
    updateTaskStatus,
    toggleTaskComplete,
  } = useTasks();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dueDateAsc');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    categoryFilter !== 'All' ||
    sortBy !== 'dueDateAsc';

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setCategoryFilter('All');
    setSortBy('dueDateAsc');
  };

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Sorting
    const priorityWeight = { Urgent: 4, High: 3, Medium: 2, Low: 1 };

    result.sort((a, b) => {
      switch (sortBy) {
        case 'dueDateAsc':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'dueDateDesc':
          return new Date(b.dueDate) - new Date(a.dueDate);
        case 'priorityHigh':
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        case 'titleAsc':
          return a.title.localeCompare(b.title);
        case 'createdDesc':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Header & New Task CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Deliverables & Task Board
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Displaying {filteredTasks.length} of {tasks.length} total deliverables across active sprints
          </p>
        </div>

        <button
          onClick={() => openCreateTaskModal('To Do')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Deliverable</span>
        </button>
      </div>

      {/* Filter and View Controls Bar */}
      <TaskFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        categories={categories}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main View Display: Kanban or List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            No matching tasks found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, priority, or status filters to view other deliverables.
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
            <button
              onClick={() => openCreateTaskModal('To Do')}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Task</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          onEdit={openEditTaskModal}
          onDelete={promptDeleteTask}
          onUpdateStatus={updateTaskStatus}
          onToggleComplete={toggleTaskComplete}
          onAddNewInStatus={(st) => openCreateTaskModal(st)}
        />
      ) : (
        <div className="space-y-2.5">
          {/* Table Header Row */}
          <div className="hidden md:flex items-center justify-between px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex-1">Task & Details</span>
            <div className="flex items-center gap-14 pr-8">
              <span>Status</span>
              <span>Priority</span>
              <span>Due Date</span>
              <span>Actions</span>
            </div>
          </div>

          {filteredTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onEdit={openEditTaskModal}
              onDelete={promptDeleteTask}
              onUpdateStatus={updateTaskStatus}
              onToggleComplete={toggleTaskComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

