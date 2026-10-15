import React from 'react';
import { ClipboardList, Plus, SearchX, CheckCircle2 } from 'lucide-react';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';
import { TaskTableRow } from './TaskTableRow';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  viewMode: 'grid' | 'table';
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  onCreateNew: () => void;
  onResetFilters: () => void;
  isFiltered: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  viewMode,
  onEdit,
  onDelete,
  onToggleStatus,
  onCreateNew,
  onResetFilters,
  isFiltered,
}) => {
  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs animate-pulse space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded-sm w-3/4" />
                <div className="h-3 bg-slate-100 rounded-sm w-full" />
              </div>
            </div>
            <div className="h-3 bg-slate-100 rounded-sm w-1/2 pt-3" />
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <div className="h-3 bg-slate-100 rounded-sm w-16" />
              <div className="h-4 bg-slate-200 rounded-sm w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state when filtered out
  if (tasks.length === 0 && isFiltered) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center max-w-md mx-auto my-6 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          No matching tasks found
        </h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          No tasks matched your active filter or search criteria. Try modifying your search or resetting filters.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  // Zero-tasks empty state
  if (tasks.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center max-w-md mx-auto my-6 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-4">
          <ClipboardList className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          No tasks yet
        </h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Create your first task to start organizing milestones, deadlines, and tracking progress.
        </p>
        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create First Task
        </button>
      </div>
    );
  }

  // Table View Mode
  if (viewMode === 'table') {
    return (
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="w-12 px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Task Title & Details</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <TaskTableRow
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Grid View Mode
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};
