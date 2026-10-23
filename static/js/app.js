/**
 * TeckFlow - Frontend Client Application
 * Pure Vanilla JavaScript (HTML5 / CSS3 / ES Modules)
 */

// -------------------------------------------------------------
// Application State
// -------------------------------------------------------------
const state = {
  tasks: [],
  stats: null,
  dbStatus: null,
  activeTab: 'dashboard',
  viewMode: 'grid',
  filters: {
    status: 'All',
    priority: 'All',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  editingTaskId: null,
  taskToDelete: null
};

// -------------------------------------------------------------
// DOM Elements
// -------------------------------------------------------------
const elements = {
  // Navigation & Header
  navDashboard: document.getElementById('nav-dashboard'),
  navTasks: document.getElementById('nav-tasks'),
  dashboardView: document.getElementById('dashboard-view'),
  tasksView: document.getElementById('tasks-view'),
  pageHeading: document.getElementById('page-heading'),
  pageSubheading: document.getElementById('page-subheading'),
  navTaskCount: document.getElementById('nav-task-count'),
  navCountPending: document.getElementById('nav-count-pending'),
  navCountProgress: document.getElementById('nav-count-progress'),
  navCountCompleted: document.getElementById('nav-count-completed'),
  sidebar: document.getElementById('sidebar'),
  sidebarOverlay: document.getElementById('sidebar-overlay'),
  openSidebarBtn: document.getElementById('open-sidebar-btn'),
  closeSidebarBtn: document.getElementById('close-sidebar-btn'),
  headerDbPill: document.getElementById('header-db-pill'),
  headerDbDot: document.getElementById('header-db-dot'),
  headerDbText: document.getElementById('header-db-text'),
  dbIndicatorDot: document.getElementById('db-indicator-dot'),
  dbIndicatorLabel: document.getElementById('db-indicator-label'),
  dbInfoBtn: document.getElementById('db-info-btn'),
  openCreateTaskBtn: document.getElementById('open-create-task-btn'),
  viewAllTasksLink: document.getElementById('view-all-tasks-link'),

  // Dashboard Stats
  statTotal: document.getElementById('stat-total'),
  statCompleted: document.getElementById('stat-completed'),
  statProgress: document.getElementById('stat-progress'),
  statOverdue: document.getElementById('stat-overdue'),
  statOverdueSubtext: document.getElementById('stat-overdue-subtext'),
  mainProgressBar: document.getElementById('main-progress-bar'),
  progressPercentageLabel: document.getElementById('progress-percentage-label'),
  legendCompleted: document.getElementById('legend-completed'),
  legendProgress: document.getElementById('legend-progress'),
  legendPending: document.getElementById('legend-pending'),
  priorityCountHigh: document.getElementById('priority-count-high'),
  priorityBarHigh: document.getElementById('priority-bar-high'),
  priorityCountMedium: document.getElementById('priority-count-medium'),
  priorityBarMedium: document.getElementById('priority-bar-medium'),
  priorityCountLow: document.getElementById('priority-count-low'),
  priorityBarLow: document.getElementById('priority-bar-low'),
  recentTasksContainer: document.getElementById('recent-tasks-container'),

  // Filters & Controls
  filterSearch: document.getElementById('filter-search'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  filterPriority: document.getElementById('filter-priority'),
  filterSortBy: document.getElementById('filter-sort-by'),
  sortOrderBtn: document.getElementById('sort-order-btn'),
  sortDescIcon: document.getElementById('sort-desc-icon'),
  sortAscIcon: document.getElementById('sort-asc-icon'),
  viewGridBtn: document.getElementById('view-grid-btn'),
  viewTableBtn: document.getElementById('view-table-btn'),
  resetFiltersBtn: document.getElementById('reset-filters-btn'),
  statusTabs: document.querySelectorAll('.status-tab'),
  countTabAll: document.getElementById('count-tab-all'),
  countTabPending: document.getElementById('count-tab-pending'),
  countTabProgress: document.getElementById('count-tab-progress'),
  countTabCompleted: document.getElementById('count-tab-completed'),

  // Containers
  tasksGridContainer: document.getElementById('tasks-grid-container'),
  tasksTableContainer: document.getElementById('tasks-table-container'),
  tasksTableBody: document.getElementById('tasks-table-body'),
  emptyState: document.getElementById('empty-state'),
  emptyActionBtn: document.getElementById('empty-action-btn'),

  // Task Dialog
  taskDialog: document.getElementById('task-dialog'),
  taskForm: document.getElementById('task-form'),
  dialogTitle: document.getElementById('dialog-title'),
  dialogSubheading: document.getElementById('dialog-subheading'),
  formTaskId: document.getElementById('form-task-id'),
  formTitle: document.getElementById('form-title'),
  formDescription: document.getElementById('form-description'),
  formPriority: document.getElementById('form-priority'),
  formStatus: document.getElementById('form-status'),
  formDueDate: document.getElementById('form-due-date'),
  closeTaskDialogBtn: document.getElementById('close-task-dialog-btn'),
  cancelTaskFormBtn: document.getElementById('cancel-task-form-btn'),
  saveBtnText: document.getElementById('save-btn-text'),

  // Delete Dialog
  deleteDialog: document.getElementById('delete-dialog'),
  deleteTaskTitle: document.getElementById('delete-task-title'),
  cancelDeleteBtn: document.getElementById('cancel-delete-btn'),
  confirmDeleteBtn: document.getElementById('confirm-delete-btn'),

  // DB Dialog
  dbDialog: document.getElementById('db-dialog'),
  closeDbDialogBtn: document.getElementById('close-db-dialog-btn'),
  closeDbDialogActionBtn: document.getElementById('close-db-dialog-action-btn'),
  modalDbEngine: document.getElementById('modal-db-engine'),
  modalDbHost: document.getElementById('modal-db-host'),
  modalDbName: document.getElementById('modal-db-name'),
  reseedDemoBtn: document.getElementById('reseed-demo-btn'),

  // Toasts
  toastContainer: document.getElementById('toast-container')
};

// -------------------------------------------------------------
// Toast Notification Utility
// -------------------------------------------------------------
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  let icon = `✓`;
  if (type === 'error') icon = `✕`;
  if (type === 'info') icon = `ℹ`;

  toast.innerHTML = `
    <span class="status-dot dot-${type === 'success' ? 'completed' : type === 'error' ? 'pending' : 'progress'}"></span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="icon-btn-sm" aria-label="Close">&times;</button>
  `;

  toast.querySelector('button').addEventListener('click', () => {
    toast.remove();
  });

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// -------------------------------------------------------------
// Relative Date Formatter
// -------------------------------------------------------------
function formatRelativeDate(isoDateStr) {
  if (!isoDateStr) return { text: 'No due date', isOverdue: false, badgeClass: '' };

  const target = new Date(isoDateStr);
  if (isNaN(target.getTime())) return { text: 'Invalid date', isOverdue: false, badgeClass: '' };

  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return {
      text: daysAgo === 1 ? 'Overdue by 1 day' : `Overdue by ${daysAgo} days`,
      isOverdue: true,
      badgeClass: 'overdue-badge'
    };
  } else if (diffDays === 0) {
    return { text: 'Due today', isOverdue: false, badgeClass: 'priority-High' };
  } else if (diffDays === 1) {
    return { text: 'Due tomorrow', isOverdue: false, badgeClass: 'priority-Medium' };
  } else {
    return { text: `Due in ${diffDays} days`, isOverdue: false, badgeClass: '' };
  }
}

function formatDate(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// -------------------------------------------------------------
// API Service Calls
// -------------------------------------------------------------
async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.message || `Request failed with status ${response.status}`);
    err.response = data;
    throw err;
  }
  return data;
}

async function loadData() {
  try {
    const params = new URLSearchParams();
    if (state.filters.status && state.filters.status !== 'All') {
      params.append('status', state.filters.status);
    }
    if (state.filters.priority && state.filters.priority !== 'All') {
      params.append('priority', state.filters.priority);
    }
    if (state.filters.search) {
      params.append('search', state.filters.search);
    }
    params.append('sortBy', state.filters.sortBy);
    params.append('sortOrder', state.filters.sortOrder);

    const [tasksRes, statsRes, dbRes] = await Promise.all([
      apiRequest(`/api/tasks?${params.toString()}`),
      apiRequest('/api/tasks/stats'),
      apiRequest('/api/db-status')
    ]);

    state.tasks = tasksRes.data || [];
    state.stats = statsRes.data || {};
    state.dbStatus = dbRes.data || {};

    renderDbStatus();
    renderStats();
    renderTasks();
  } catch (err) {
    console.error('Error loading data:', err);
    showToast(err.message || 'Failed to sync with backend', 'error');
  }
}

// -------------------------------------------------------------
// Render Database Status Indicators
// -------------------------------------------------------------
function renderDbStatus() {
  const db = state.dbStatus || {};
  const isMySQL = db.isConnectedToMySQL;

  if (isMySQL) {
    elements.headerDbPill.classList.add('connected');
    elements.headerDbText.textContent = 'MySQL Connected';
    elements.dbIndicatorDot.classList.add('online');
    elements.dbIndicatorLabel.textContent = 'MySQL Active';
    elements.modalDbEngine.textContent = 'MySQL Relational Engine';
    elements.modalDbEngine.className = 'detail-value text-emerald';
    elements.modalDbHost.textContent = db.connectionHost || 'localhost:3306';
    elements.modalDbName.textContent = db.databaseName || 'taskflow';
  } else {
    elements.headerDbPill.classList.remove('connected');
    elements.headerDbText.textContent = 'Local Storage Active';
    elements.dbIndicatorDot.classList.remove('online');
    elements.dbIndicatorLabel.textContent = 'Local File Storage';
    elements.modalDbEngine.textContent = 'Local JSON Document Storage';
    elements.modalDbEngine.className = 'detail-value text-amber';
    elements.modalDbHost.textContent = 'Local System (.data/tasks.json)';
    elements.modalDbName.textContent = 'tasks.json';
  }
}

// -------------------------------------------------------------
// Render Dashboard Statistics & Counters
// -------------------------------------------------------------
function renderStats() {
  const stats = state.stats || {
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0,
    priorityBreakdown: { high: 0, medium: 0, low: 0 }
  };

  // Metric values
  elements.statTotal.textContent = stats.total;
  elements.statCompleted.textContent = stats.completed;
  elements.statProgress.textContent = stats.inProgress;
  elements.statOverdue.textContent = stats.overdue;

  if (stats.overdue > 0) {
    elements.statOverdueSubtext.textContent = `${stats.overdue} require immediate action`;
    elements.statOverdueSubtext.style.color = 'var(--rose)';
  } else {
    elements.statOverdueSubtext.textContent = 'All deliveries on schedule';
    elements.statOverdueSubtext.style.color = 'var(--text-muted)';
  }

  // Progress Bar
  const rate = stats.completionRate || 0;
  elements.progressPercentageLabel.textContent = `${rate}%`;
  elements.mainProgressBar.style.width = `${rate}%`;

  elements.legendCompleted.textContent = stats.completed;
  elements.legendProgress.textContent = stats.inProgress;
  elements.legendPending.textContent = stats.pending;

  // Sidebar count pills
  elements.navTaskCount.textContent = stats.total;
  elements.navCountPending.textContent = stats.pending;
  elements.navCountProgress.textContent = stats.inProgress;
  elements.navCountCompleted.textContent = stats.completed;

  // Status tabs in All Tasks view
  elements.countTabAll.textContent = stats.total;
  elements.countTabPending.textContent = stats.pending;
  elements.countTabProgress.textContent = stats.inProgress;
  elements.countTabCompleted.textContent = stats.completed;

  // Priority Bars
  const maxPriority = Math.max(
    stats.priorityBreakdown.high,
    stats.priorityBreakdown.medium,
    stats.priorityBreakdown.low,
    1
  );

  elements.priorityCountHigh.textContent = stats.priorityBreakdown.high;
  elements.priorityBarHigh.style.width = `${(stats.priorityBreakdown.high / maxPriority) * 100}%`;

  elements.priorityCountMedium.textContent = stats.priorityBreakdown.medium;
  elements.priorityBarMedium.style.width = `${(stats.priorityBreakdown.medium / maxPriority) * 100}%`;

  elements.priorityCountLow.textContent = stats.priorityBreakdown.low;
  elements.priorityBarLow.style.width = `${(stats.priorityBreakdown.low / maxPriority) * 100}%`;

  // Render Recent Tasks preview on Dashboard
  renderRecentTasks();
}

// -------------------------------------------------------------
// Render Recent Tasks (Dashboard Panel)
// -------------------------------------------------------------
function renderRecentTasks() {
  const recent = state.tasks.slice(0, 5);
  if (recent.length === 0) {
    elements.recentTasksContainer.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        No active tasks recorded. Click <strong>+ New Task</strong> to create one.
      </div>
    `;
    return;
  }

  let html = `
    <table class="tasks-table">
      <thead>
        <tr>
          <th style="width: 44px;"></th>
          <th>Task</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Due Date</th>
          <th style="text-align: right;">Action</th>
        </tr>
      </thead>
      <tbody>
  `;

  recent.forEach((t) => {
    const isDone = t.status === 'Completed';
    const relDate = formatRelativeDate(t.dueDate);
    html += `
      <tr>
        <td>
          <button class="btn-toggle-status ${isDone ? 'is-completed' : ''}" data-task-id="${t.id}" title="${isDone ? 'Mark as Pending' : 'Mark as Completed'}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
        </td>
        <td>
          <div class="table-task-info">
            <span class="table-task-title" style="${isDone ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${escapeHtml(t.title)}</span>
            <span class="table-task-desc">${escapeHtml(t.description || 'No description')}</span>
          </div>
        </td>
        <td><span class="badge priority-${t.priority}">${t.priority}</span></td>
        <td><span class="status-badge status-${t.status.replace(/\s+/g, '')}">${t.status}</span></td>
        <td>
          <span style="font-size: 0.8rem; font-weight: 500; ${relDate.isOverdue && !isDone ? 'color: var(--rose); font-weight: 600;' : ''}">
            ${relDate.text}
          </span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm edit-task-btn" data-task-id="${t.id}">Edit</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  elements.recentTasksContainer.innerHTML = html;
}

// -------------------------------------------------------------
// Render All Tasks (Grid & Table Views)
// -------------------------------------------------------------
function renderTasks() {
  const tasks = state.tasks;

  if (tasks.length === 0) {
    elements.tasksGridContainer.classList.add('hidden');
    elements.tasksTableContainer.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');
    return;
  }

  elements.emptyState.classList.add('hidden');

  if (state.viewMode === 'grid') {
    elements.tasksTableContainer.classList.add('hidden');
    elements.tasksGridContainer.classList.remove('hidden');
    renderGrid(tasks);
  } else {
    elements.tasksGridContainer.classList.add('hidden');
    elements.tasksTableContainer.classList.remove('hidden');
    renderTable(tasks);
  }
}

function renderGrid(tasks) {
  elements.tasksGridContainer.innerHTML = tasks
    .map((t) => {
      const isDone = t.status === 'Completed';
      const relDate = formatRelativeDate(t.dueDate);
      const isOverdue = relDate.isOverdue && !isDone;

      return `
        <article class="task-card ${isDone ? 'completed' : ''}" data-task-id="${t.id}">
          <div class="task-card-header">
            <div class="task-badges">
              <span class="badge priority-${t.priority}">${t.priority}</span>
              <span class="status-badge status-${t.status.replace(/\s+/g, '')}">${t.status}</span>
              ${isOverdue ? `<span class="overdue-badge">Overdue</span>` : ''}
            </div>
            <button class="btn-toggle-status ${isDone ? 'is-completed' : ''}" data-task-id="${t.id}" title="${isDone ? 'Mark as Pending' : 'Mark as Completed'}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
          </div>

          <h3 class="task-title">${escapeHtml(t.title)}</h3>
          <p class="task-desc">${escapeHtml(t.description || 'No description provided.')}</p>

          <div class="task-meta">
            <div class="task-due">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span style="${isOverdue ? 'color: var(--rose); font-weight: 700;' : ''}">${relDate.text}</span>
            </div>

            <div class="task-actions">
              <button class="icon-btn edit-task-btn" data-task-id="${t.id}" title="Edit task">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="icon-btn delete-task-btn" data-task-id="${t.id}" title="Delete task">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderTable(tasks) {
  elements.tasksTableBody.innerHTML = tasks
    .map((t) => {
      const isDone = t.status === 'Completed';
      const relDate = formatRelativeDate(t.dueDate);
      const isOverdue = relDate.isOverdue && !isDone;

      return `
        <tr data-task-id="${t.id}">
          <td>
            <button class="btn-toggle-status ${isDone ? 'is-completed' : ''}" data-task-id="${t.id}" title="${isDone ? 'Mark as Pending' : 'Mark as Completed'}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
          </td>
          <td>
            <div class="table-task-info">
              <span class="table-task-title" style="${isDone ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${escapeHtml(t.title)}</span>
              <span class="table-task-desc">${escapeHtml(t.description || 'No description provided')}</span>
            </div>
          </td>
          <td><span class="badge priority-${t.priority}">${t.priority}</span></td>
          <td><span class="status-badge status-${t.status.replace(/\s+/g, '')}">${t.status}</span></td>
          <td>
            <span style="font-size: 0.8rem; font-weight: 500; ${isOverdue ? 'color: var(--rose); font-weight: 700;' : ''}">
              ${relDate.text}
            </span>
          </td>
          <td>${formatDate(t.createdAt)}</td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 4px;">
              <button class="icon-btn edit-task-btn" data-task-id="${t.id}" title="Edit task">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="icon-btn delete-task-btn" data-task-id="${t.id}" title="Delete task">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

// -------------------------------------------------------------
// Tab Switching
// -------------------------------------------------------------
function switchTab(tabName) {
  state.activeTab = tabName;

  if (tabName === 'dashboard') {
    elements.navDashboard.classList.add('active');
    elements.navTasks.classList.remove('active');
    elements.dashboardView.classList.add('active');
    elements.tasksView.classList.remove('active');
    elements.pageHeading.textContent = 'Dashboard Overview';
    elements.pageSubheading.textContent = 'Track metrics, manage tasks, and streamline workflow execution';
  } else {
    elements.navTasks.classList.add('active');
    elements.navDashboard.classList.remove('active');
    elements.tasksView.classList.add('active');
    elements.dashboardView.classList.remove('active');
    elements.pageHeading.textContent = 'Task Management';
    elements.pageSubheading.textContent = 'Filter, organize, and perform CRUD operations across your project items';
  }

  // Close mobile sidebar if open
  closeMobileSidebar();
}

function openMobileSidebar() {
  elements.sidebar.classList.add('open');
  elements.sidebarOverlay.classList.add('active');
}

function closeMobileSidebar() {
  elements.sidebar.classList.remove('open');
  elements.sidebarOverlay.classList.remove('active');
}

// -------------------------------------------------------------
// Task Modal Operations (Create & Edit)
// -------------------------------------------------------------
function openCreateModal() {
  state.editingTaskId = null;
  elements.dialogTitle.textContent = 'Create New Task';
  elements.dialogSubheading.textContent = 'Fill in the task details and assign priority';
  elements.saveBtnText.textContent = 'Create Task';
  elements.formTaskId.value = '';
  elements.formTitle.value = '';
  elements.formDescription.value = '';
  elements.formPriority.value = 'Medium';
  elements.formStatus.value = 'Pending';
  elements.formDueDate.value = '';

  elements.taskDialog.showModal();
  elements.formTitle.focus();
}

function openEditModal(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;

  state.editingTaskId = taskId;
  elements.dialogTitle.textContent = 'Edit Task Details';
  elements.dialogSubheading.textContent = `Update attributes and milestones for #${taskId}`;
  elements.saveBtnText.textContent = 'Save Changes';
  elements.formTaskId.value = task.id;
  elements.formTitle.value = task.title || '';
  elements.formDescription.value = task.description || '';
  elements.formPriority.value = task.priority || 'Medium';
  elements.formStatus.value = task.status || 'Pending';

  if (task.dueDate) {
    try {
      const d = new Date(task.dueDate);
      // Format as YYYY-MM-DDTHH:MM for datetime-local input
      const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      elements.formDueDate.value = localIso;
    } catch {
      elements.formDueDate.value = '';
    }
  } else {
    elements.formDueDate.value = '';
  }

  elements.taskDialog.showModal();
  elements.formTitle.focus();
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const title = elements.formTitle.value.trim();
  if (!title) {
    showToast('Please provide a valid task title.', 'error');
    elements.formTitle.focus();
    return;
  }

  const payload = {
    title,
    description: elements.formDescription.value.trim(),
    priority: elements.formPriority.value,
    status: elements.formStatus.value,
    dueDate: elements.formDueDate.value ? new Date(elements.formDueDate.value).toISOString() : null
  };

  try {
    elements.saveBtnText.textContent = 'Saving...';

    if (state.editingTaskId) {
      await apiRequest(`/api/tasks/${state.editingTaskId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast(`Task "${title}" updated successfully!`, 'success');
    } else {
      await apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast(`Task "${title}" created successfully!`, 'success');
    }

    elements.taskDialog.close();
    await loadData();
  } catch (err) {
    console.error('Error saving task:', err);
    showToast(err.message || 'Failed to save task.', 'error');
  } finally {
    elements.saveBtnText.textContent = state.editingTaskId ? 'Save Changes' : 'Create Task';
  }
}

// -------------------------------------------------------------
// Quick Status Toggle
// -------------------------------------------------------------
async function handleToggleStatus(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;

  const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';

  try {
    // Optimistic local update
    task.status = nextStatus;
    renderTasks();
    renderRecentTasks();

    await apiRequest(`/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus })
    });

    showToast(`Task marked as ${nextStatus}`, 'success');
    await loadData();
  } catch (err) {
    console.error('Failed to update status:', err);
    showToast(err.message || 'Failed to update task status.', 'error');
    await loadData();
  }
}

// -------------------------------------------------------------
// Delete Modal Operations
// -------------------------------------------------------------
function openDeleteModal(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;

  state.taskToDelete = task;
  elements.deleteTaskTitle.textContent = task.title;
  elements.deleteDialog.showModal();
}

async function handleConfirmDelete() {
  if (!state.taskToDelete) return;

  const { id, title } = state.taskToDelete;
  try {
    elements.confirmDeleteBtn.textContent = 'Deleting...';
    await apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
    showToast(`Task "${title}" deleted permanently.`, 'info');
    elements.deleteDialog.close();
    state.taskToDelete = null;
    await loadData();
  } catch (err) {
    console.error('Error deleting task:', err);
    showToast(err.message || 'Failed to delete task.', 'error');
  } finally {
    elements.confirmDeleteBtn.textContent = 'Delete Permanently';
  }
}

// -------------------------------------------------------------
// Reseed Demo Data
// -------------------------------------------------------------
async function handleReseedDemo() {
  try {
    elements.reseedDemoBtn.disabled = true;
    elements.reseedDemoBtn.innerHTML = `<span>Restoring...</span>`;
    await apiRequest('/api/tasks/seed-demo', { method: 'POST' });
    showToast('Sample dataset restored successfully!', 'success');
    elements.dbDialog.close();
    await loadData();
  } catch (err) {
    console.error('Failed to reseed:', err);
    showToast(err.message || 'Failed to restore sample dataset.', 'error');
  } finally {
    elements.reseedDemoBtn.disabled = false;
    elements.reseedDemoBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
      <span>Restore Sample Tasks</span>
    `;
  }
}

// -------------------------------------------------------------
// Event Listeners Setup
// -------------------------------------------------------------
function setupEventListeners() {
  // Navigation Tabs
  elements.navDashboard.addEventListener('click', () => switchTab('dashboard'));
  elements.navTasks.addEventListener('click', () => switchTab('tasks'));
  elements.viewAllTasksLink.addEventListener('click', () => switchTab('tasks'));

  // Mobile menu
  elements.openSidebarBtn.addEventListener('click', openMobileSidebar);
  elements.closeSidebarBtn.addEventListener('click', closeMobileSidebar);
  elements.sidebarOverlay.addEventListener('click', closeMobileSidebar);

  // Quick Filter Clicks in Sidebar
  document.querySelectorAll('.filter-nav').forEach((btn) => {
    btn.addEventListener('click', () => {
      const status = btn.getAttribute('data-filter-status');
      state.filters.status = status;
      elements.statusTabs.forEach((tab) => {
        tab.classList.toggle('active', tab.getAttribute('data-status') === status);
      });
      switchTab('tasks');
      loadData();
    });
  });

  // DB Modals
  elements.headerDbPill.addEventListener('click', () => elements.dbDialog.showModal());
  elements.dbInfoBtn.addEventListener('click', () => elements.dbDialog.showModal());
  elements.closeDbDialogBtn.addEventListener('click', () => elements.dbDialog.close());
  elements.closeDbDialogActionBtn.addEventListener('click', () => elements.dbDialog.close());
  elements.reseedDemoBtn.addEventListener('click', handleReseedDemo);

  // Task Dialog
  elements.openCreateTaskBtn.addEventListener('click', openCreateModal);
  elements.emptyActionBtn.addEventListener('click', openCreateModal);
  elements.closeTaskDialogBtn.addEventListener('click', () => elements.taskDialog.close());
  elements.cancelTaskFormBtn.addEventListener('click', () => elements.taskDialog.close());
  elements.taskForm.addEventListener('submit', handleFormSubmit);

  // Delete Dialog
  elements.cancelDeleteBtn.addEventListener('click', () => elements.deleteDialog.close());
  elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  // Light dismiss on backdrop click for native HTML5 <dialog>
  [elements.taskDialog, elements.deleteDialog, elements.dbDialog].forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  });

  // Search Input with Debounce
  let searchTimeout = null;
  elements.filterSearch.addEventListener('input', (e) => {
    const val = e.target.value;
    elements.clearSearchBtn.classList.toggle('hidden', val.length === 0);

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.filters.search = val;
      loadData();
    }, 280);
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.filterSearch.value = '';
    elements.clearSearchBtn.classList.add('hidden');
    state.filters.search = '';
    loadData();
  });

  // Status Filter Tabs
  elements.statusTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      elements.statusTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.filters.status = tab.getAttribute('data-status');
      loadData();
    });
  });

  // Priority Filter
  elements.filterPriority.addEventListener('change', (e) => {
    state.filters.priority = e.target.value;
    loadData();
  });

  // Sort Field
  elements.filterSortBy.addEventListener('change', (e) => {
    state.filters.sortBy = e.target.value;
    loadData();
  });

  // Sort Direction Toggle
  elements.sortOrderBtn.addEventListener('click', () => {
    state.filters.sortOrder = state.filters.sortOrder === 'desc' ? 'asc' : 'desc';
    const isDesc = state.filters.sortOrder === 'desc';
    elements.sortDescIcon.classList.toggle('hidden', !isDesc);
    elements.sortAscIcon.classList.toggle('hidden', isDesc);
    loadData();
  });

  // View Mode Toggle (Grid vs Table)
  elements.viewGridBtn.addEventListener('click', () => {
    state.viewMode = 'grid';
    elements.viewGridBtn.classList.add('active');
    elements.viewTableBtn.classList.remove('active');
    renderTasks();
  });

  elements.viewTableBtn.addEventListener('click', () => {
    state.viewMode = 'table';
    elements.viewTableBtn.classList.add('active');
    elements.viewGridBtn.classList.remove('active');
    renderTasks();
  });

  // Reset Filters
  elements.resetFiltersBtn.addEventListener('click', () => {
    state.filters = {
      status: 'All',
      priority: 'All',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    elements.filterSearch.value = '';
    elements.clearSearchBtn.classList.add('hidden');
    elements.filterPriority.value = 'All';
    elements.filterSortBy.value = 'createdAt';
    elements.sortDescIcon.classList.remove('hidden');
    elements.sortAscIcon.classList.add('hidden');
    elements.statusTabs.forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-status') === 'All');
    });
    loadData();
  });

  // Delegated Clicks for Dynamic Items (Task Status, Edit, Delete)
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.btn-toggle-status');
    if (toggleBtn) {
      e.stopPropagation();
      const taskId = toggleBtn.getAttribute('data-task-id');
      if (taskId) handleToggleStatus(taskId);
      return;
    }

    const editBtn = e.target.closest('.edit-task-btn');
    if (editBtn) {
      e.stopPropagation();
      const taskId = editBtn.getAttribute('data-task-id');
      if (taskId) openEditModal(taskId);
      return;
    }

    const deleteBtn = e.target.closest('.delete-task-btn');
    if (deleteBtn) {
      e.stopPropagation();
      const taskId = deleteBtn.getAttribute('data-task-id');
      if (taskId) openDeleteModal(taskId);
      return;
    }
  });
}

// -------------------------------------------------------------
// Application Initialization
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadData();
});

