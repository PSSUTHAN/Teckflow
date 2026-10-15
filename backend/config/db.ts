import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { ITask } from '../models/Task.js';

export interface DbStatus {
  isConnectedToMongo: boolean;
  engine: 'mongodb' | 'file_storage';
  connectionUri: string;
  databaseName?: string;
  lastConnectedAt?: string;
  errorMessage?: string;
}

const dbState: DbStatus = {
  isConnectedToMongo: false,
  engine: 'file_storage',
  connectionUri: '',
};

// Path for fallback file storage so data persists across dev restarts even without MongoDB
const STORAGE_DIR = path.resolve(process.cwd(), '.data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'tasks.json');

const INITIAL_SEED_TASKS: ITask[] = [
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

// Helper to load file tasks
export function readFallbackStorage(): ITask[] {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORAGE_FILE)) {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(INITIAL_SEED_TASKS, null, 2), 'utf-8');
      return INITIAL_SEED_TASKS;
    }
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SEED_TASKS;
  } catch (err) {
    console.error('Error reading fallback storage, using in-memory defaults:', err);
    return INITIAL_SEED_TASKS;
  }
}

// Helper to write file tasks
export function writeFallbackStorage(tasks: ITask[]): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing fallback storage:', err);
  }
}

/**
 * Connect to MongoDB or initialize resilient fallback storage
 */
export async function connectDB(): Promise<DbStatus> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.log('ℹ️ MONGODB_URI not provided. Running in resilient persistent storage mode.');
    dbState.isConnectedToMongo = false;
    dbState.engine = 'file_storage';
    dbState.connectionUri = 'Local Persistent Storage (.data/tasks.json)';
    readFallbackStorage(); // Ensure seed exists
    return dbState;
  }

  try {
    console.log(`Connecting to MongoDB...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    dbState.isConnectedToMongo = true;
    dbState.engine = 'mongodb';
    dbState.connectionUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'); // Redact credentials
    dbState.databaseName = conn.connection.name;
    dbState.lastConnectedAt = new Date().toISOString();
    delete dbState.errorMessage;

    console.log(`MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return dbState;
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('⚠️ Falling back to persistent local storage so the application stays operational.');
    dbState.isConnectedToMongo = false;
    dbState.engine = 'file_storage';
    dbState.connectionUri = 'Local Persistent Storage (MongoDB offline)';
    dbState.errorMessage = error.message;
    readFallbackStorage();
    return dbState;
  }
}

export function getDbStatus(): DbStatus {
  return { ...dbState };
}
