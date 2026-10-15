import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { TaskForm } from './components/TaskForm';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';
import { ToastContainer } from './components/Toast';
import { taskService } from './services/taskService';
import {
  Task,
  TaskFilterState,
  TaskFormData,
  TaskStats,
  TaskStatus,
  ToastMessage,
} from './types/task';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'tasks'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [filters, setFilters] = useState<TaskFilterState>({
    status: 'All',
    priority: 'All',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    viewMode: 'grid',
  });

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch tasks and stats from backend
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedTasks, fetchedStats] = await Promise.all([
        taskService.getTasks({
          status: filters.status,
          priority: filters.priority,
          search: filters.search,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        }),
        taskService.getStats(),
      ]);

      setTasks(fetchedTasks);
      setStats(fetchedStats);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      addToast(
        err.response?.data?.message || 'Unable to connect to task service. Using local cache.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Create or Update submission
  const handleSaveTask = async (formData: TaskFormData) => {
    if (editingTask) {
      await taskService.updateTask(editingTask.id, formData);
      addToast(`Task "${formData.title}" updated successfully!`, 'success');
    } else {
      await taskService.createTask(formData);
      addToast(`Task "${formData.title}" created successfully!`, 'success');
    }
    setEditingTask(null);
    await loadData();
  };

  // Handle Quick Status Toggle
  const handleToggleStatus = async (task: Task) => {
    try {
      let nextStatus: TaskStatus = 'Completed';
      if (task.status === 'Completed') {
        nextStatus = 'Pending';
      } else if (task.status === 'Pending') {
        nextStatus = 'In Progress';
      } else {
        nextStatus = 'Completed';
      }

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
      );

      await taskService.updateTaskStatus(task.id, nextStatus);
      addToast(`Marked as ${nextStatus}`, 'info');

      // Refresh stats quietly
      const updatedStats = await taskService.getStats();
      setStats(updatedStats);
    } catch (err: any) {
      addToast('Failed to update task status', 'error');
      loadData();
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      setIsDeleting(true);
      await taskService.deleteTask(taskToDelete.id);
      addToast(`Task "${taskToDelete.title}" deleted`, 'info');
      setTaskToDelete(null);
      await loadData();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to delete task', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      status: 'All',
      priority: 'All',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      viewMode: filters.viewMode,
    });
  };

  // Navigation shortcuts
  const handleSelectFilterShortcut = (status: string) => {
    setCurrentTab('tasks');
    setFilters((prev) => ({
      ...prev,
      status,
      search: '',
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCreateModal={() => {
          setEditingTask(null);
          setIsFormOpen(true);
        }}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        isMobileSidebarOpen={isMobileSidebarOpen}
        dbEngine={stats?.dbStatus?.engine}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onSelectFilterShortcut={handleSelectFilterShortcut}
          stats={stats}
          onOpenCreateModal={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          onOpenDbModal={() => setIsDbModalOpen(true)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 min-w-0 overflow-y-auto">
          {currentTab === 'dashboard' ? (
            <Dashboard
              stats={stats}
              recentTasks={tasks}
              isLoading={isLoading}
              onNavigateToTasks={(statusFilter) => {
                if (statusFilter) {
                  setFilters((prev) => ({ ...prev, status: statusFilter }));
                }
                setCurrentTab('tasks');
              }}
              onOpenCreateModal={() => {
                setEditingTask(null);
                setIsFormOpen(true);
              }}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsFormOpen(true);
              }}
              onDeleteTask={(task) => setTaskToDelete(task)}
              onToggleStatus={handleToggleStatus}
            />
          ) : (
            <TasksPage
              tasks={tasks}
              isLoading={isLoading}
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              onOpenCreateModal={() => {
                setEditingTask(null);
                setIsFormOpen(true);
              }}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsFormOpen(true);
              }}
              onDeleteTask={(task) => setTaskToDelete(task)}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </main>
      </div>

      {/* Create / Edit Task Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Database Status Modal */}
      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        dbStatus={stats?.dbStatus}
        onReseedCompleted={() => {
          loadData();
          addToast('Demo dataset successfully restored!', 'success');
        }}
      />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
