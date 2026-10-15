import { Request, Response, NextFunction } from 'express';
import mongoose from 'express';
import { TaskModel, ITask, TaskPriority, TaskStatus } from '../models/Task.js';
import { getDbStatus, readFallbackStorage, writeFallbackStorage } from '../config/db.js';

// Helper to determine if MongoDB is currently active
function isMongoActive(): boolean {
  return getDbStatus().isConnectedToMongo;
}

// Generate unique ID for fallback storage
function generateId(): string {
  return 'task-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
}

// Helper to check if a task is overdue
function isTaskOverdue(task: ITask): boolean {
  if (!task.dueDate || task.status === 'Completed') return false;
  const due = new Date(task.dueDate).getTime();
  return !isNaN(due) && due < Date.now();
}

/**
 * @desc    Get all tasks with optional search, filter, and sorting
 * @route   GET /api/tasks
 */
export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, priority, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (isMongoActive()) {
      const query: any = {};

      if (status && status !== 'All') {
        query.status = status;
      }

      if (priority && priority !== 'All') {
        query.priority = priority;
      }

      if (search && typeof search === 'string' && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ title: regex }, { description: regex }];
      }

      const sortField = typeof sortBy === 'string' ? sortBy : 'createdAt';
      const order = sortOrder === 'asc' ? 1 : -1;

      const tasks = await TaskModel.find(query).sort({ [sortField]: order });
      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
      return;
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
    const field = (sortBy as string) || 'createdAt';
    const asc = sortOrder === 'asc';

    tasks.sort((a: any, b: any) => {
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
        valA = priorityRank[a.priority as TaskPriority] || 0;
        valB = priorityRank[b.priority as TaskPriority] || 0;
      } else if (typeof valA === 'string') {
        return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (valA < valB) return asc ? -1 : 1;
      if (valA > valB) return asc ? 1 : -1;
      return 0;
    });

    res.status(200).json({
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
export async function getTaskStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let allTasks: ITask[] = [];

    if (isMongoActive()) {
      allTasks = await TaskModel.find();
    } else {
      allTasks = readFallbackStorage();
    }

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

    res.status(200).json({
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
export async function getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (isMongoActive()) {
      const task = await TaskModel.findById(id);
      if (!task) {
        res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
        return;
      }
      res.status(200).json({ success: true, data: task });
      return;
    }

    const tasks = readFallbackStorage();
    const task = tasks.find((t) => (t.id || t._id) === id);
    if (!task) {
      res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
      return;
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 */
export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, priority = 'Medium', status = 'Pending', dueDate } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({
        success: false,
        message: 'Task title is required and cannot be empty',
      });
      return;
    }

    const validPriorities = ['Low', 'Medium', 'High'];
    if (priority && !validPriorities.includes(priority)) {
      res.status(400).json({
        success: false,
        message: `Invalid priority: ${priority}. Allowed values are Low, Medium, High`,
      });
      return;
    }

    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status: ${status}. Allowed values are Pending, In Progress, Completed`,
      });
      return;
    }

    let parsedDueDate: Date | null = null;
    if (dueDate) {
      const d = new Date(dueDate);
      if (isNaN(d.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid due date format',
        });
        return;
      }
      parsedDueDate = d;
    }

    if (isMongoActive()) {
      const newTask = await TaskModel.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        priority: priority as TaskPriority,
        status: status as TaskStatus,
        dueDate: parsedDueDate,
      });

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: newTask,
      });
      return;
    }

    // Fallback file storage
    const tasks = readFallbackStorage();
    const nowIso = new Date().toISOString();
    const newTask: ITask = {
      id: generateId(),
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority as TaskPriority,
      status: status as TaskStatus,
      dueDate: parsedDueDate ? parsedDueDate.toISOString() : null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    tasks.unshift(newTask);
    writeFallbackStorage(tasks);

    res.status(201).json({
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
export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, priority, status, dueDate } = req.body;

    if (title !== undefined && (!title || typeof title !== 'string' || !title.trim())) {
      res.status(400).json({
        success: false,
        message: 'Task title cannot be empty',
      });
      return;
    }

    if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
      res.status(400).json({
        success: false,
        message: `Invalid priority: ${priority}. Allowed values are Low, Medium, High`,
      });
      return;
    }

    if (status && !['Pending', 'In Progress', 'Completed'].includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status: ${status}. Allowed values are Pending, In Progress, Completed`,
      });
      return;
    }

    let parsedDueDate: Date | null | undefined = undefined;
    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === '') {
        parsedDueDate = null;
      } else {
        const d = new Date(dueDate);
        if (isNaN(d.getTime())) {
          res.status(400).json({
            success: false,
            message: 'Invalid due date format',
          });
          return;
        }
        parsedDueDate = d;
      }
    }

    if (isMongoActive()) {
      const updateData: any = {};
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (priority !== undefined) updateData.priority = priority;
      if (status !== undefined) updateData.status = status;
      if (parsedDueDate !== undefined) updateData.dueDate = parsedDueDate;

      const updated = await TaskModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: updated,
      });
      return;
    }

    // Fallback file storage
    const tasks = readFallbackStorage();
    const index = tasks.findIndex((t) => (t.id || t._id) === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
      return;
    }

    const current = tasks[index];
    const updated: ITask = {
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

    res.status(200).json({
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
export async function updateTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status must be one of: Pending, In Progress, Completed',
      });
      return;
    }

    if (isMongoActive()) {
      const updated = await TaskModel.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );

      if (!updated) {
        res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Task status updated to ${status}`,
        data: updated,
      });
      return;
    }

    // Fallback storage
    const tasks = readFallbackStorage();
    const index = tasks.findIndex((t) => (t.id || t._id) === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
      return;
    }

    tasks[index] = {
      ...tasks[index],
      status: status as TaskStatus,
      updatedAt: new Date().toISOString(),
    };

    writeFallbackStorage(tasks);

    res.status(200).json({
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
export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (isMongoActive()) {
      const task = await TaskModel.findByIdAndDelete(id);
      if (!task) {
        res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: { id },
      });
      return;
    }

    const tasks = readFallbackStorage();
    const index = tasks.findIndex((t) => (t.id || t._id) === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: `Task not found with id: ${id}` });
      return;
    }

    const removed = tasks.splice(index, 1);
    writeFallbackStorage(tasks);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: removed[0].id || removed[0]._id },
    });
  } catch (error) {
    next(error);
  }
}
