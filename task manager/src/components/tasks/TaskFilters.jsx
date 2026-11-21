import React from 'react';
import { Search, Filter, SlidersHorizontal, LayoutGrid, List, RotateCcw, X } from 'lucide-react';

export const TaskFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  categories,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3.5">
      {/* Row 1: Search & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description or deliverable tag..."
            className="w-full pl-9.5 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Row 2: Dropdown Filters & Sort */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-1.5 sm:ml-auto">
          <span className="text-xs font-semibold text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="dueDateAsc">Due Date (Earliest First)</option>
            <option value="dueDateDesc">Due Date (Latest First)</option>
            <option value="priorityHigh">Priority (Highest First)</option>
            <option value="titleAsc">Title (A to Z)</option>
            <option value="createdDesc">Recently Added</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1 rounded-md transition-colors"
            title="Reset filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

