import { Router } from 'express';
import {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/taskController.js';

const router = Router();

// Stats endpoint placed before :id to prevent parameter matching conflicts
router.get('/stats', getTaskStats);

// Tasks collection routes
router.route('/')
  .get(getTasks)
  .post(createTask);

// Single task entity routes
router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

// Fast status toggle route
router.patch('/:id/status', updateTaskStatus);

export default router;
