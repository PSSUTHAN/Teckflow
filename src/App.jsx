import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Tasks } from './pages/Tasks.jsx';
import { TaskForm } from './components/TaskForm.jsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.jsx';
import { DatabaseStatusModal } from './components/DatabaseStatusModal.jsx';
import { ToastContainer } from './components/Toast.jsx';
import { taskService } from './services/taskService.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    viewMode: 'grid',
  });

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id) => {
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
    } catch (err) {
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
  const handleSaveTask = async (formData) => {
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
  const handleToggleStatus = async (task) => {
    try {
      let nextStatus = 'Completed';
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
    } catch (err) {
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
    } catch (err) {
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
  const handleSelectFilterShortcut = (status) => {
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
            <Tasks
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
