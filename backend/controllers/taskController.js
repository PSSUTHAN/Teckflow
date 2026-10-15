import { TaskValidation } from '../models/Task.js';
import {
  getDbStatus,
  getMySQLPool,
  readFallbackStorage,
  writeFallbackStorage,
} from '../config/db.js';

function isMySQLActive() {
  return getDbStatus().isConnectedToMySQL;
}

function generateId() {
  return 'task-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
}

function isTaskOverdue(task) {
  if (!task.dueDate || task.status === 'Completed') return false;
  const due = new Date(task.dueDate).getTime();
  return !isNaN(due) && due < Date.now();
}

/**
 * @desc    Get all tasks with optional search, filter, and sorting
 * @route   GET /api/tasks
 */
export async function getTasks(req, res, next) {
  try {
    const { status, priority, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (isMySQLActive()) {
      const pool = getMySQLPool();
      let sql = 'SELECT * FROM tasks WHERE 1=1';
      const params = [];

      if (status && status !== 'All') {
        sql += ' AND status = ?';
        params.push(status);
      }

      if (priority && priority !== 'All') {
        sql += ' AND priority = ?';
        params.push(priority);
      }

      if (search && typeof search === 'string' && search.trim()) {
        sql += ' AND (title LIKE ? OR description LIKE ?)';
        const queryTerm = `%${search.trim()}%`;
        params.push(queryTerm, queryTerm);
      }

      // Safe whitelisted column sorting
      const allowedSortColumns = {
        createdAt: 'createdAt',
        dueDate: 'dueDate',
        priority: 'priority',
        title: 'title',
      };
      const sortColumn = allowedSortColumns[sortBy] || 'createdAt';
      const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

      if (sortBy === 'priority') {
        // Custom priority sorting order in SQL
        sql += ` ORDER BY FIELD(priority, 'High', 'Medium', 'Low') ${order}`;
      } else {
        sql += ` ORDER BY ${sortColumn} ${order}`;
      }

      const [rows] = await pool.query(sql, params);
      const tasks = rows.map(TaskValidation.formatRow);

      return res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    }

    // Fallback file storage mode
    let tasks = readFallbackStorage();

    if (status && status !== 'All') {
      tasks = tasks.filter((t) => t.status === status);
    }

    if (priority && priority !== 'All') {
      tasks = tasks.filter((t) => t.priority === priority);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    const field = sortBy || 'createdAt';
    const asc = sortOrder === 'asc';

    tasks.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (field === 'dueDate') {
        valA = valA ? new Date(valA).getTime() : asc ? Infinity : -Infinity;
        valB = valB ? new Date(valB).getTime() : asc ? Infinity : -Infinity;
      } else if (field === 'createdAt' || field === 'updatedAt') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      } else if (field === 'priority') {
        const priorityRank = { Low: 1, Medium: 2, High: 3 };
        valA = priorityRank[a.priority] || 0;
        valB = priorityRank[b.priority] || 0;
      } else if (typeof valA === 'string') {
        return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (valA < valB) return asc ? -1 : 1;
      if (valA > valB) return asc ? 1 : -1;
      return 0;
    });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get dashboard metrics & statistics
 * @route   GET /api/tasks/stats
 */
export async function getTaskStats(_req, res, next) {
  try {
    if (isMySQLActive()) {
      const pool = getMySQLPool();
      const [rows] = await pool.query(`
        SELECT 
          COUNT(*) as totalTasks,
          SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingTasks,
          SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inProgressTasks,
          SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedTasks,
          SUM(CASE WHEN dueDate IS NOT NULL AND dueDate < NOW() AND status != 'Completed' THEN 1 ELSE 0 END) as overdueTasks,
          SUM(CASE WHEN priority = 'Low' THEN 1 ELSE 0 END) as lowPriority,
          SUM(CASE WHEN priority = 'Medium' THEN 1 ELSE 0 END) as mediumPriority,
          SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) as highPriority
        FROM tasks
      `);

      const row = rows[0] || {};
      const totalTasks = Number(row.totalTasks) || 0;
      const pendingTasks = Number(row.pendingTasks) || 0;
      const inProgressTasks = Number(row.inProgressTasks) || 0;
      const completedTasks = Number(row.completedTasks) || 0;
      const overdueTasks = Number(row.overdueTasks) || 0;

      const priorityBreakdown = {
        low: Number(row.lowPriority) || 0,
        medium: Number(row.mediumPriority) || 0,
        high: Number(row.highPriority) || 0,
      };

      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return res.status(200).json({
        success: true,
        data: {
          totalTasks,
          pendingTasks,
          inProgressTasks,
          completedTasks,
          overdueTasks,
          completionRate,
          priorityBreakdown,
          dbStatus: getDbStatus(),
        },
      });
    }

    // Fallback file storage mode
    const allTasks = readFallbackStorage();
    const totalTasks = allTasks.length;
    const pendingTasks = allTasks.filter((t) => t.status === 'Pending').length;
    const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress').length;
    const completedTasks = allTasks.filter((t) => t.status === 'Completed').length;
    const overdueTasks = allTasks.filter(isTaskOverdue).length;

    const priorityBreakdown = {
      low: allTasks.filter((t) => t.priority === 'Low').length,
      medium: allTasks.filter((t) => t.priority === 'Medium').length,
      high: allTasks.filter((t) => t.priority === 'High').length,
    };

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        completionRate,
        priorityBreakdown,
        dbStatus: getDbStatus(),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 */
export async function getTaskById(req, res, next) {
  try {
    const { id } = req.params;

    if (isMySQLActive()) {
      const pool = getMySQLPool();
      const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
      }
      return res.status(200).json({ success: true, data: TaskValidation.formatRow(rows[0]) });
    }

    const tasks = readFallbackStorage();
    const task = tasks.find((t) => (t.id || t._id) === id);
    if (!task) {
      return res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 */
export async function createTask(req, res, next) {
  try {
    const { title, description = '', priority = 'Medium', status = 'Pending', dueDate } = req.body;

    const validation = TaskValidation.validate({ title, priority, status, dueDate });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(', '),
      });
    }

    let parsedDueDate = null;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
    }

    const id = generateId();
    const nowIso = new Date().toISOString();

    if (isMySQLActive()) {
      const pool = getMySQLPool();
      await pool.query(
        'INSERT INTO tasks (id, title, description, priority, status, dueDate) VALUES (?, ?, ?, ?, ?, ?)',
        [id, title.trim(), description.trim(), priority, status, parsedDueDate]
      );

      const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
      return res.status(201).json({
        success: true,
        message: 'Task created successfully in MySQL',
        data: TaskValidation.formatRow(rows[0]),
      });
    }

    // Fallback file storage
    const tasks = readFallbackStorage();
    const newTask = {
      id,
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate: parsedDueDate ? parsedDueDate.toISOString() : null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    tasks.unshift(newTask);
    writeFallbackStorage(tasks);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update an entire task
 * @route   PUT /api/tasks/:id
 */
export async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, priority, status, dueDate } = req.body;

    if (title !== undefined && (!title || typeof title !== 'string' || !title.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Task title cannot be empty',
      });
    }

    if (priority && !TaskValidation.validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority: ${priority}. Allowed: Low, Medium, High`,
      });
    }

    if (status && !TaskValidation.validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status: ${status}. Allowed: Pending, In Progress, Completed`,
      });
    }

    let parsedDueDate = undefined;
    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === '') {
        parsedDueDate = null;
      } else {
        const d = new Date(dueDate);
        if (isNaN(d.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid due date format',
          });
        }
        parsedDueDate = d;
      }
    }

    if (isMySQLActive()) {
      const pool = getMySQLPool();
      const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
      }

      const current = existing[0];
      const newTitle = title !== undefined ? title.trim() : current.title;
      const newDesc = description !== undefined ? description.trim() : current.description;
      const newPriority = priority !== undefined ? priority : current.priority;
      const newStatus = status !== undefined ? status : current.status;
      const newDueDate = parsedDueDate !== undefined ? parsedDueDate : current.dueDate;

      await pool.query(
        'UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, dueDate = ? WHERE id = ?',
        [newTitle, newDesc, newPriority, newStatus, newDueDate, id]
      );

      const [updated] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
      return res.status(200).json({
        success: true,
        message: 'Task updated successfully in MySQL',
        data: TaskValidation.formatRow(updated[0]),
      });
    }

    // Fallback file storage
    const tasks = readFallbackStorage();
    const index = tasks.findIndex((t) => (t.id || t._id) === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
    }

    const current = tasks[index];
    const updated = {
      ...current,
      title: title !== undefined ? title.trim() : current.title,
      description: description !== undefined ? description.trim() : current.description,
      priority: priority !== undefined ? priority : current.priority,
      status: status !== undefined ? status : current.status,
      dueDate:
        parsedDueDate !== undefined
          ? parsedDueDate
            ? parsedDueDate.toISOString()
            : null
          : current.dueDate,
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updated;
    writeFallbackStorage(tasks);

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Quick update of task status (Pending -> In Progress -> Completed)
 * @route   PATCH /api/tasks/:id/status
 */
export async function updateTaskStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !TaskValidation.validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: Pending, In Progress, Completed',
      });
    }

    if (isMySQLActive()) {
      const pool = getMySQLPool();
      const [result] = await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
      }

      const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
      return res.status(200).json({
        success: true,
        message: `Task status updated to ${status}`,
        data: TaskValidation.formatRow(rows[0]),
      });
    }

    // Fallback storage
    const tasks = readFallbackStorage();
    const index = tasks.findIndex((t) => (t.id || t._id) === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
    }

    tasks[index] = {
      ...tasks[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    writeFallbackStorage(tasks);

    return res.status(200).json({
      success: true,
      message: `Task status updated to ${status}`,
      data: tasks[index],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 */
export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;

    if (isMySQLActive()) {
      const pool = getMySQLPool();
      const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
      }
      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully from MySQL',
        data: { id },
      });
    }

    const tasks = readFallbackStorage();
    const index = tasks.findIndex((t) => (t.id || t._id) === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
    }

    const removed = tasks.splice(index, 1);
    writeFallbackStorage(tasks);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: removed[0].id || removed[0]._id },
    });
  } catch (error) {
    next(error);
  }
}
