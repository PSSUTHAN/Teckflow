import React from 'react';
import { CheckCircle2, Circle, Clock, Edit3, Trash2, AlertCircle } from 'lucide-react';
import { Task } from '../types/task';

interface TaskTableRowProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
}

export const TaskTableRow: React.FC<TaskTableRowProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const isCompleted = task.status === 'Completed';

  const isOverdue = React.useMemo(() => {
    if (!task.dueDate || isCompleted) return false;
    const dueTime = new Date(task.dueDate).getTime();
    return !isNaN(dueTime) && dueTime < Date.now();
  }, [task.dueDate, isCompleted]);

  const formattedDueDate = React.useMemo(() => {
    if (!task.dueDate) return '—';
    const d = new Date(task.dueDate);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [task.dueDate]);

  const priorityColor = {
    High: 'text-rose-600 font-semibold',
    Medium: 'text-amber-600 font-medium',
    Low: 'text-slate-600 font-normal',
  }[task.priority || 'Medium'];

  const statusColor = {
    Completed: 'text-emerald-700 font-medium',
    'In Progress': 'text-blue-700 font-medium',
    Pending: 'text-slate-600 font-normal',
  }[task.status];

  return (
    <tr
      className={`border-b border-slate-200/80 hover:bg-slate-50/80 transition-colors ${
        isCompleted ? 'bg-slate-50/40 text-slate-400' : ''
      }`}
    >
      {/* Checkbox column */}
      <td className="w-12 px-4 py-3.5 text-center">
        <button
          type="button"
          onClick={() => onToggleStatus(task)}
          className="text-slate-400 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
          ) : task.status === 'In Progress' ? (
            <Clock className="w-4 h-4 text-blue-600" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </button>
      </td>

      {/* Title & Description column */}
      <td className="px-4 py-3.5 min-w-[240px]">
        <div className="flex flex-col">
          <span
            className={`font-medium text-sm leading-snug ${
              isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
            }`}
          >
            {task.title}
          </span>
          {task.description && (
            <span className="text-xs text-slate-500 truncate max-w-md mt-0.5">
              {task.description}
            </span>
          )}
        </div>
      </td>

      {/* Status column */}
      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
        <span className={`inline-flex items-center gap-1.5 ${statusColor}`}>
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
      </td>

      {/* Priority column */}
      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
        <span className={priorityColor}>{task.priority}</span>
      </td>

      {/* Due Date column */}
      <td className="px-4 py-3.5 whitespace-nowrap text-xs tabular-nums font-mono">
        <span
          className={`inline-flex items-center gap-1 ${
            isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'
          }`}
        >
          {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
          {formattedDueDate}
        </span>
      </td>

      {/* Actions column */}
      <td className="px-4 py-3.5 whitespace-nowrap text-right text-xs">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Edit task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
