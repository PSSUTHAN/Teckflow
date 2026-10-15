import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const taskService = {
  /**
   * Fetch all tasks with optional filtering and sorting
   */
  async getTasks(params) {
    const response = await apiClient.get('/tasks', { params });
    return response.data.data.map((task) => ({
      ...task,
      id: task._id || task.id,
    }));
  },

  /**
   * Fetch aggregate dashboard stats
   */
  async getStats() {
    const response = await apiClient.get('/tasks/stats');
    return response.data.data;
  },

  /**
   * Fetch single task by ID
   */
  async getTaskById(id) {
    const response = await apiClient.get(`/tasks/${id}`);
    const task = response.data.data;
    return {
      ...task,
      id: task._id || task.id,
    };
  },

  /**
   * Create a new task
   */
  async createTask(data) {
    const payload = {
      title: data.title,
      description: data.description || '',
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    };
    const response = await apiClient.post('/tasks', payload);
    const task = response.data.data;
    return {
      ...task,
      id: task._id || task.id,
    };
  },

  /**
   * Update an existing task
   */
  async updateTask(id, data) {
    const payload = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.priority !== undefined) payload.priority = data.priority;
    if (data.status !== undefined) payload.status = data.status;
    if (data.dueDate !== undefined) {
      payload.dueDate = data.dueDate ? new Date(data.dueDate).toISOString() : null;
    }

    const response = await apiClient.put(`/tasks/${id}`, payload);
    const task = response.data.data;
    return {
      ...task,
      id: task._id || task.id,
    };
  },

  /**
   * Update task status (Pending <-> In Progress <-> Completed)
   */
  async updateTaskStatus(id, status) {
    const response = await apiClient.patch(`/tasks/${id}/status`, { status });
    const task = response.data.data;
    return {
      ...task,
      id: task._id || task.id,
    };
  },

  /**
   * Delete a task
   */
  async deleteTask(id) {
    await apiClient.delete(`/tasks/${id}`);
  },

  /**
   * Re-seed sample starter tasks
   */
  async seedDemoTasks() {
    await apiClient.post('/tasks/seed-demo');
  },

  /**
   * Fetch database health & connection status
   */
  async getDbStatus() {
    const response = await apiClient.get('/db-status');
    return response.data.data;
  },
};

export default taskService;
