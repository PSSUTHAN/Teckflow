import React from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle,
  FolderDot,
  Database,
  PlusCircle,
} from 'lucide-react';
import { TaskStats } from '../types/task';

interface SidebarProps {
  currentTab: 'dashboard' | 'tasks';
  onSelectTab: (tab: 'dashboard' | 'tasks') => void;
  onSelectFilterShortcut: (status: string) => void;
  stats: TaskStats | null;
  onOpenCreateModal: () => void;
  onOpenDbModal: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onSelectFilterShortcut,
  stats,
  onOpenCreateModal,
  onOpenDbModal,
  isMobileOpen,
  onCloseMobile,
}) => {
  const content = (
    <div className="flex flex-col h-full py-6 px-4 justify-between bg-white border-r border-slate-200">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Navigation
          </p>
          <button
            type="button"
            onClick={() => {
              onSelectTab('dashboard');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span>Dashboard</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectTab('tasks');
              onSelectFilterShortcut('All');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentTab === 'tasks'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ListTodo className="w-4 h-4 text-slate-600" />
              <span>All Tasks</span>
            </div>
            {stats && (
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {stats.totalTasks}
              </span>
            )}
          </button>
        </div>

        {/* Task Views / Quick Filters */}
        <div className="space-y-1 pt-4 border-t border-slate-100">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Task Statuses
          </p>

          <button
            type="button"
            onClick={() => {
              onSelectTab('tasks');
              onSelectFilterShortcut('Pending');
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Pending</span>
            </div>
            {stats && (
              <span className="font-mono tabular-nums text-slate-500 text-xs">
                {stats.pendingTasks}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectTab('tasks');
              onSelectFilterShortcut('In Progress');
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>In Progress</span>
            </div>
            {stats && (
              <span className="font-mono tabular-nums text-slate-500 text-xs">
                {stats.inProgressTasks}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectTab('tasks');
              onSelectFilterShortcut('Completed');
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Completed</span>
            </div>
            {stats && (
              <span className="font-mono tabular-nums text-slate-500 text-xs">
                {stats.completedTasks}
              </span>
            )}
          </button>

          {stats && stats.overdueTasks > 0 && (
            <button
              type="button"
              onClick={() => {
                onSelectTab('tasks');
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50/60 hover:bg-rose-100/70 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span className="font-semibold">Overdue Tasks</span>
              </div>
              <span className="font-mono tabular-nums font-bold text-rose-700 text-xs">
                {stats.overdueTasks}
              </span>
            </button>
          )}
        </div>

        {/* Priority Breakdown Indicator */}
        {stats && (
          <div className="pt-4 border-t border-slate-100 px-3 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Priority Distribution
            </p>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-rose-600 font-medium">High</span>
                <span className="font-mono tabular-nums">{stats.priorityBreakdown.high}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-600 font-medium">Medium</span>
                <span className="font-mono tabular-nums">{stats.priorityBreakdown.medium}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Low</span>
                <span className="font-mono tabular-nums">{stats.priorityBreakdown.low}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info & Actions */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            onOpenCreateModal();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Quick Create Task</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenDbModal();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            <span className="truncate">Database Details</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            {stats?.dbStatus?.engine === 'mongodb' ? 'Mongo' : 'Local'}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-xs bg-white h-full shadow-2xl z-50 flex flex-col">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
