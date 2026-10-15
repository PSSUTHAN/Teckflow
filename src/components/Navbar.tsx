import React from 'react';
import { CheckSquare, Plus, Menu, X, Database } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'tasks';
  onSelectTab: (tab: 'dashboard' | 'tasks') => void;
  onOpenCreateModal: () => void;
  onOpenDbModal: () => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
  dbEngine?: 'mongodb' | 'file_storage';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateModal,
  onOpenDbModal,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
  dbEngine,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title (Single text element wordmark) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              TaskFlow
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, concise) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentTab === 'dashboard'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('tasks')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentTab === 'tasks'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tasks
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Database Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenDbModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
            title="Inspect Database connection"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">
              {dbEngine === 'mongodb' ? 'MongoDB' : 'Storage Engine'}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
