import React from 'react';
import { Plus } from 'lucide-react';
import { TaskFilters } from '../components/TaskFilters.jsx';
import { TaskList } from '../components/TaskList.jsx';

export const Tasks = ({
  tasks,
  isLoading,
  filters,
  onFilterChange,
  onResetFilters,
  onOpenCreateModal,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
}) => {
  const isFiltered =
    filters.status !== 'All' ||
    filters.priority !== 'All' ||
    filters.search.trim().length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Task Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Filter, search, sort, and manage all project milestones and deliverables.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <TaskFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        totalFilteredCount={tasks.length}
      />

      {/* Task List (Grid or Table) */}
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        viewMode={filters.viewMode}
        onEdit={onEditTask}
        onDelete={onDeleteTask}
        onToggleStatus={onToggleStatus}
        onCreateNew={onOpenCreateModal}
        onResetFilters={onResetFilters}
        isFiltered={isFiltered}
      />
    </div>
  );
};

export default Tasks;
