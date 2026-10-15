import React, { useMemo } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, Edit3, Trash2, AlertCircle } from 'lucide-react';

export const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const isCompleted = task.status === 'Completed';

  // Overdue check
  const isOverdue = useMemo(() => {
    if (!task.dueDate || isCompleted) return false;
    const dueTime = new Date(task.dueDate).getTime();
    return !isNaN(dueTime) && dueTime < Date.now();
  }, [task.dueDate, isCompleted]);

  // Formatted dates
  const formattedDueDate = useMemo(() => {
    if (!task.dueDate) return null;
    const d = new Date(task.dueDate);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  }, [task.dueDate]);

  // Priority color styling (text only, no pill box!)
  const priorityColor = {
    High: 'text-rose-600 font-semibold',
    Medium: 'text-amber-600 font-medium',
    Low: 'text-slate-600 font-normal',
  }[task.priority || 'Medium'] || 'text-slate-600 font-normal';

  // Status visual representation
  const statusColor = {
    Completed: 'text-emerald-600',
    'In Progress': 'text-blue-600',
    Pending: 'text-slate-500',
  }[task.status] || 'text-slate-500';

  return (
    <div
      className={`group relative bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-sm flex flex-col justify-between ${
        isCompleted ? 'bg-slate-50/70 border-slate-200' : ''
      }`}
    >
      <div>
        {/* Header line: Title & Completion Checkbox */}
        <div className="flex items-start gap-3 justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => onToggleStatus(task)}
              className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
              aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
              ) : task.status === 'In Progress' ? (
                <Clock className="w-5 h-5 text-blue-600" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <h3
                className={`text-base font-semibold text-slate-900 leading-snug line-clamp-2 ${
                  isCompleted ? 'line-through text-slate-400 font-normal' : ''
                }`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p className="text-sm text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Clean Unboxed Metadata with Typographic Separators */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
          <span className={`inline-flex items-center gap-1 ${statusColor}`}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                task.status === 'Completed'
                  ? 'bg-emerald-500'
                  : task.status === 'In Progress'
                  ? 'bg-blue-500'
                  : 'bg-slate-400'
              }`}
            />
            {task.status}
          </span>

          <span aria-hidden="true" className="text-slate-300">·</span>

          <span className={priorityColor}>
            {task.priority} Priority
          </span>

          {formattedDueDate && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span
                className={`inline-flex items-center gap-1 tabular-nums ${
                  isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                }`}
                title={isOverdue ? 'Task is overdue!' : `Due ${formattedDueDate}`}
              >
                {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                Due {formattedDueDate}
                {isOverdue && ' (Overdue)'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
        <span className="font-mono text-[11px] tabular-nums text-slate-400 truncate max-w-[140px]">
          ID: {task.id?.slice(-6) || ''}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Edit task"
            aria-label="Edit task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
