import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { TaskFilterState } from '../types/task';

interface TaskFiltersProps {
  filters: TaskFilterState;
  onFilterChange: (filters: TaskFilterState) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalFilteredCount,
}) => {
  const isFiltered =
    filters.status !== 'All' ||
    filters.priority !== 'All' ||
    filters.search.trim().length > 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-4">
      {/* Top Search & View Mode Switch */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Controls & View Mode Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort By Select */}
          <div className="relative">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [
                  TaskFilterState['sortBy'],
                  TaskFilterState['sortOrder']
                ];
                onFilterChange({ ...filters, sortBy, sortOrder });
              }}
              className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-7 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="priority-desc">Priority (High to Low)</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Grid vs Table View Mode */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, viewMode: 'grid' })}
              className={`p-1.5 rounded-md transition-colors ${
                filters.viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, viewMode: 'table' })}
              className={`p-1.5 rounded-md transition-colors ${
                filters.viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Segmented Control */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, status })}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    filters.status === status
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status === 'In Progress' ? 'Progress' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Segmented Control */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Priority:</span>
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              {['All', 'High', 'Medium', 'Low'].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, priority })}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    filters.priority === priority
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter and Clear Filters */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 tabular-nums">
            Showing <strong className="font-semibold text-slate-800">{totalFilteredCount}</strong> {totalFilteredCount === 1 ? 'task' : 'tasks'}
          </span>

          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
