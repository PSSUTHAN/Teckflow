import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import taskRoutes from './backend/routes/taskRoutes.js';
import { connectDB, getDbStatus, writeFallbackStorage } from './backend/config/db.js';
import { errorHandler, notFound } from './backend/middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Connect to Database (or resilient fallback)
  await connectDB();

  // Middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // REST API Routes
  app.use('/api/tasks', taskRoutes);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: getDbStatus(),
    });
  });

  // Database status endpoint
  app.get('/api/db-status', (_req, res) => {
    res.status(200).json({
      success: true,
      data: getDbStatus(),
    });
  });

  // Reset / Re-seed sample data endpoint
  app.post('/api/tasks/seed-demo', (_req, res) => {
    try {
      const defaultTasks = [
        {
          id: 'task-seed-1',
          title: 'Initialize MongoDB Schema & Models',
          description: 'Set up Mongoose schemas with validation, indexes, and timestamps for Task entities.',
          priority: 'High',
          status: 'Completed',
          dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'task-seed-2',
          title: 'Build REST API with Express and Controllers',
          description: 'Create CRUD endpoints for tasks, error handling middleware, and status query filters.',
          priority: 'High',
          status: 'In Progress',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'task-seed-3',
          title: 'Design Responsive Dashboard UI',
          description: 'Implement KPI stat cards, completion rates, priority distribution, and clean tabular layout.',
          priority: 'Medium',
          status: 'In Progress',
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: 'task-seed-4',
          title: 'Conduct End-to-End API and Validation Testing',
          description: 'Verify status code responses, missing title rejections, sorting algorithms, and filter states.',
          priority: 'Medium',
          status: 'Pending',
          dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'task-seed-5',
          title: 'Review Overdue Project Milestones',
          description: 'Audit tasks past their expected delivery date and adjust resource allocations accordingly.',
          priority: 'High',
          status: 'Pending',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'task-seed-6',
          title: 'Prepare Production Deployment Checklist',
          description: 'Configure environment variables, secure CORS headers, and document connection options.',
          priority: 'Low',
          status: 'Pending',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
      ];
      writeFallbackStorage(defaultTasks);
      res.status(200).json({ success: true, message: 'Sample tasks reseeded successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Frontend integration: Vite middleware in development or static dist in production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error middleware
  app.use('/api', notFound);
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Task Management Server running on port ${PORT}`);
    console.log(`🌐 Application URL: http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
  process.exit(1);
});
